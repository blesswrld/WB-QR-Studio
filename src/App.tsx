import { useEffect, useRef, useState } from 'react';
import { toPng, toSvg } from 'html-to-image';
import {
  BookmarkPlus,
  CheckCircle2,
  Crown,
  Download,
  FileCode2,
  FlipHorizontal,
  Grid,
  Lock,
  QrCode,
  Scissors,
  User,
  ZoomIn,
} from 'lucide-react';
import {
  BillingCycle,
  CardConfig,
  CardSide,
  ProFeatureKey,
  SavedTemplate,
  UserPlan,
  UserProfile,
  ZoomLevel,
} from './types/studio';
import {
  buildExportFilename,
  calculateA4LayoutSpec,
  calculatePrintSpecs,
  CARD_FORMATS,
  checkFeatureAccess,
  CONVERSION_PRESETS,
  DEFAULT_CARD_CONFIG,
  duplicateTemplateItem,
  enforcePlanConstraintsOnConfig,
  FREE_PLAN_MAX_TEMPLATES,
  INITIAL_SEED_TEMPLATES,
  isConfigDirty,
  PRICING_PLANS,
} from './utils/studioLogic';
import { buildPaymentCheckoutUrl, isSupabaseConfigured } from './config/env';
import {
  deleteTemplateFromCloudOrLocal,
  fetchUserTemplates,
  getCurrentSessionUser,
  saveTemplateToCloudOrLocal,
  setDemoSubscriptionPlan,
  signOutAccount,
} from './services/authAndStorage';
import { SettingsPanel } from './components/SettingsPanel';
import { CardCanvas } from './components/CardCanvas';
import { A4PrintSheet } from './components/A4PrintSheet';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ConfirmDialog, ConfirmReceiptItem } from './components/ConfirmDialog';
import { UpgradeModal } from './components/UpgradeModal';
import { AccountModal } from './components/AccountModal';
import { AuthModal } from './components/AuthModal';

const STORAGE_KEY_TEMPLATES = 'wb_qr_studio_templates_v2';
const STORAGE_KEY_ACTIVE_CONFIG = 'wb_qr_studio_active_config_v2';

type ActiveWorkspaceTab = 'constructor' | 'templates';

type ActiveConfirmState =
  | { type: 'delete_template'; template: SavedTemplate }
  | { type: 'reset_config' }
  | { type: 'overwrite_template'; existingTemplate: SavedTemplate }
  | { type: 'sign_out' }
  | { type: 'checkout_payment'; cycle: BillingCycle }
  | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('constructor');
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [activeSide, setActiveSide] = useState<CardSide>('front');

  const [user, setUser] = useState<UserProfile | null>(null);

  const isPro = user?.plan === 'pro';
  const currentPlan: UserPlan = isPro ? 'pro' : 'free';

  const [config, setConfig] = useState<CardConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CARD_CONFIG,
          ...parsed,
          backSideSteps:
            Array.isArray(parsed.backSideSteps) && parsed.backSideSteps.length === 3
              ? parsed.backSideSteps
              : DEFAULT_CARD_CONFIG.backSideSteps,
        };
      }
    } catch {
      // Fallback to default config
    }
    return DEFAULT_CARD_CONFIG;
  });

  const [lastSavedConfig, setLastSavedConfig] = useState<CardConfig>(() => config);

  const [templates, setTemplates] = useState<SavedTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed templates
    }
    return INITIAL_SEED_TEMPLATES;
  });

  const [isExporting, setIsExporting] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] =
    useState<ProFeatureKey | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ActiveConfirmState>(null);

  const cardSurfaceRef = useRef<HTMLDivElement | null>(null);
  const qrOnlySurfaceRef = useRef<HTMLDivElement | null>(null);
  const a4SheetSurfaceRef = useRef<HTMLDivElement | null>(null);

  // Load current session user & cloud/local layouts on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const sessionUser = await getCurrentSessionUser();
      if (!mounted) return;
      if (sessionUser) {
        setUser(sessionUser);
      }
      const loadedTemplates = await fetchUserTemplates(sessionUser);
      if (mounted && loadedTemplates.length > 0) {
        setTemplates(loadedTemplates);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Enforce plan constraints if user is on FREE plan
  const effectiveConfig = enforcePlanConstraintsOnConfig(config, isPro);
  const hasUnsavedChanges = isConfigDirty(config, lastSavedConfig);

  // Protect against accidental page reload/close when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CONFIG, JSON.stringify(config));
    } catch {
      // Ignore storage quota errors
    }
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch {
      // Ignore storage quota errors
    }
  }, [templates]);

  const showTemporaryStatus = (message: string) => {
    setStatusBanner(message);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === message ? null : prev));
    }, 3600);
  };

  const openPaywallForFeature = (feature: ProFeatureKey) => {
    setUpgradeModalFeature(feature);
    setIsUpgradeModalOpen(true);
  };

  const buildTemplateNameForConfig = (cfg: CardConfig): string => {
    const fmt = CARD_FORMATS[cfg.formatId];
    const preset = CONVERSION_PRESETS[cfg.presetId];
    const brandTitle = cfg.brandName.trim() || 'Без бренда';
    return `${brandTitle} — ${preset.name} (${fmt.shortLabel})`;
  };

  const executeSaveNewTemplate = async (customNameSuffix = '') => {
    const safeCfg = enforcePlanConstraintsOnConfig(config, isPro);
    const baseName = buildTemplateNameForConfig(safeCfg);
    const name = customNameSuffix ? `${baseName} ${customNameSuffix}` : baseName;
    const now = Date.now();

    const newTemplate: SavedTemplate = {
      id: `tpl-${now}`,
      name,
      nicheTag: 'Пользовательский',
      createdAt: now,
      updatedAt: now,
      config: {
        ...safeCfg,
        backSideSteps: [...safeCfg.backSideSteps],
      },
    };

    const nextList = [newTemplate, ...templates];
    setTemplates(nextList);
    setLastSavedConfig(config);
    await saveTemplateToCloudOrLocal(user, newTemplate, nextList);
    showTemporaryStatus(`Макет «${newTemplate.name}» сохранён в ваши шаблоны`);
  };

  const handleSaveCurrentTemplate = () => {
    const safeCfg = enforcePlanConstraintsOnConfig(config, isPro);
    const candidateName = buildTemplateNameForConfig(safeCfg);
    const existing = templates.find(
      (t) =>
        !t.id.startsWith('seed-') &&
        t.name.toLowerCase() === candidateName.toLowerCase()
    );

    if (existing) {
      setConfirmState({
        type: 'overwrite_template',
        existingTemplate: existing,
      });
      return;
    }

    const customTemplatesCount = templates.filter(
      (t) => !t.id.startsWith('seed-')
    ).length;
    if (!isPro && customTemplatesCount >= FREE_PLAN_MAX_TEMPLATES) {
      openPaywallForFeature('unlimited_templates');
      return;
    }

    void executeSaveNewTemplate();
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    const templateRequiresProFormat =
      CARD_FORMATS[template.config.formatId]?.proOnly;
    if (templateRequiresProFormat && !isPro) {
      openPaywallForFeature(
        template.config.formatId === 'thermal_58x40'
          ? 'format_58x40'
          : 'format_70x70'
      );
      return;
    }

    const nextConfig: CardConfig = {
      ...DEFAULT_CARD_CONFIG,
      ...template.config,
      backSideSteps:
        Array.isArray(template.config.backSideSteps) &&
        template.config.backSideSteps.length === 3
          ? [...template.config.backSideSteps]
          : [...DEFAULT_CARD_CONFIG.backSideSteps],
    };

    const enforced = enforcePlanConstraintsOnConfig(nextConfig, isPro);
    setConfig(enforced);
    setLastSavedConfig(enforced);
    setActiveTab('constructor');
    showTemporaryStatus(`Загружен макет «${template.name}»`);
  };

  const handleDuplicateTemplate = async (template: SavedTemplate) => {
    const customTemplatesCount = templates.filter(
      (t) => !t.id.startsWith('seed-')
    ).length;
    if (!isPro && customTemplatesCount >= FREE_PLAN_MAX_TEMPLATES) {
      openPaywallForFeature('unlimited_templates');
      return;
    }
    const copy = duplicateTemplateItem(template);
    const nextList = [copy, ...templates];
    setTemplates(nextList);
    await saveTemplateToCloudOrLocal(user, copy, nextList);
    showTemporaryStatus(`Создана копия «${copy.name}»`);
  };

  const handleRestoreSeeds = () => {
    setTemplates(INITIAL_SEED_TEMPLATES);
    showTemporaryStatus('Стартовые демо-шаблоны восстановлены');
  };

  const triggerDataUrlDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilter = (node: HTMLElement) => {
    if (node?.dataset?.exportIgnore === 'true') {
      return false;
    }
    return true;
  };

  const handleExportPng300Dpi = async () => {
    if (!cardSurfaceRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const dataUrl = await toPng(cardSurfaceRef.current, {
        pixelRatio: 4,
        cacheBust: true,
        filter: exportFilter,
      });
      const prefix = activeSide === 'back' ? 'maket-oborot' : 'maket';
      const filename = buildExportFilename(
        effectiveConfig.brandName,
        'png',
        prefix
      );
      triggerDataUrlDownload(dataUrl, filename);
      showTemporaryStatus(`Экспортирован файл печати ${filename} (300 DPI)`);
    } catch {
      showTemporaryStatus('Ошибка при экспорте PNG. Попробуйте ещё раз.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvgVector = async () => {
    const access = checkFeatureAccess(currentPlan, 'export_svg');
    if (!access.allowed) {
      openPaywallForFeature('export_svg');
      return;
    }
    if (!cardSurfaceRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const dataUrl = await toSvg(cardSurfaceRef.current, {
        pixelRatio: 4,
        cacheBust: true,
        filter: exportFilter,
      });
      const prefix = activeSide === 'back' ? 'maket-oborot' : 'maket';
      const filename = buildExportFilename(
        effectiveConfig.brandName,
        'svg',
        prefix
      );
      triggerDataUrlDownload(dataUrl, filename);
      showTemporaryStatus(`Экспортирован векторный макет ${filename}`);
    } catch {
      showTemporaryStatus('Ошибка при экспорте SVG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportQrOnlyPng = async () => {
    if (!qrOnlySurfaceRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const dataUrl = await toPng(qrOnlySurfaceRef.current, {
        pixelRatio: 4,
        cacheBust: true,
      });
      const filename = buildExportFilename(
        effectiveConfig.brandName,
        'png',
        'qr'
      );
      triggerDataUrlDownload(dataUrl, filename);
      showTemporaryStatus(`Скачан чистый QR-код ${filename}`);
    } catch {
      showTemporaryStatus('Ошибка при скачивании QR-кода.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportA4SheetPng = async () => {
    const access = checkFeatureAccess(currentPlan, 'export_a4');
    if (!access.allowed) {
      openPaywallForFeature('export_a4');
      return;
    }
    if (!a4SheetSurfaceRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const a4Spec = calculateA4LayoutSpec(effectiveConfig.formatId);
      const dataUrl = await toPng(a4SheetSurfaceRef.current, {
        pixelRatio: 4,
        cacheBust: true,
      });
      const filename = buildExportFilename(
        effectiveConfig.brandName,
        'png',
        `a4-${a4Spec.totalItems}sht`
      );
      triggerDataUrlDownload(dataUrl, filename);
      showTemporaryStatus(
        `Скачан лист А4 (${a4Spec.totalItems} шт. с метками реза): ${filename}`
      );
    } catch {
      showTemporaryStatus('Ошибка при формировании листа А4.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDialogAction = async () => {
    if (!confirmState) return;

    if (confirmState.type === 'delete_template') {
      const target = confirmState.template;
      const remaining = templates.filter((item) => item.id !== target.id);
      setTemplates(remaining);
      await deleteTemplateFromCloudOrLocal(user, target.id, remaining);
      setConfirmState(null);
      showTemporaryStatus(`Макет «${target.name}» удалён`);
      return;
    }

    if (confirmState.type === 'reset_config') {
      setConfig(DEFAULT_CARD_CONFIG);
      setLastSavedConfig(DEFAULT_CARD_CONFIG);
      setActiveSide('front');
      setConfirmState(null);
      showTemporaryStatus('Все настройки конструктора сброшены к заводским');
      return;
    }

    if (confirmState.type === 'overwrite_template') {
      const existing = confirmState.existingTemplate;
      const safeCfg = enforcePlanConstraintsOnConfig(config, isPro);
      const now = Date.now();
      const updatedTemplate: SavedTemplate = {
        ...existing,
        updatedAt: now,
        config: {
          ...safeCfg,
          backSideSteps: [...safeCfg.backSideSteps],
        },
      };
      const nextList = templates.map((item) =>
        item.id === existing.id ? updatedTemplate : item
      );
      setTemplates(nextList);
      setLastSavedConfig(config);
      await saveTemplateToCloudOrLocal(user, updatedTemplate, nextList);
      setConfirmState(null);
      showTemporaryStatus(`Макет «${updatedTemplate.name}» успешно перезаписан`);
      return;
    }

    if (confirmState.type === 'sign_out') {
      await signOutAccount();
      setUser(null);
      setConfirmState(null);
      setIsAccountModalOpen(false);
      showTemporaryStatus('Вы вышли из личного кабинета');
      return;
    }

    if (confirmState.type === 'checkout_payment') {
      const cycle = confirmState.cycle;
      const planSpec = PRICING_PLANS[cycle];
      const checkoutUrl = buildPaymentCheckoutUrl({
        userId: user?.id || 'usr_guest',
        email: user?.email || 'seller@wb-brand.ru',
        billingCycle: cycle,
        amountRub: planSpec.amountRub,
      });

      if (!isSupabaseConfigured()) {
        const baseUser: UserProfile = user || {
          id: 'usr-demo-seller',
          email: 'seller@wb-brand.ru',
          plan: 'free',
          proUntil: null,
          createdAt: new Date().toISOString(),
        };
        const upgradedUser = await setDemoSubscriptionPlan(
          baseUser,
          'pro',
          planSpec.durationDays
        );
        setUser(upgradedUser);
        setConfirmState(null);
        setIsUpgradeModalOpen(false);
        showTemporaryStatus(
          `Подписка ${planSpec.title} активирована! Ссылка оплаты: ${checkoutUrl}`
        );
      } else {
        setConfirmState(null);
        setIsUpgradeModalOpen(false);
        window.location.assign(checkoutUrl);
      }
    }
  };

  const buildConfirmReceiptItems = (): ConfirmReceiptItem[] | undefined => {
    if (!confirmState) return undefined;

    if (confirmState.type === 'delete_template') {
      return [
        { label: 'Удаляемый макет', value: confirmState.template.name },
        {
          label: 'Формат',
          value: CARD_FORMATS[confirmState.template.config.formatId].shortLabel,
        },
      ];
    }

    if (confirmState.type === 'overwrite_template') {
      return [
        {
          label: 'Существующий макет',
          value: confirmState.existingTemplate.name,
        },
      ];
    }

    if (confirmState.type === 'checkout_payment') {
      const planSpec = PRICING_PLANS[confirmState.cycle];
      return [
        { label: 'Выбранный тариф', value: planSpec.title },
        { label: 'Сумма к оплате', value: `${planSpec.amountRub} ₽` },
        { label: 'Период действия', value: `${planSpec.durationDays} дней` },
        { label: 'Аккаунт селлера', value: user?.email || 'seller@wb-brand.ru' },
      ];
    }

    return undefined;
  };

  const currentFormat = CARD_FORMATS[effectiveConfig.formatId];
  const printSpecs = calculatePrintSpecs(effectiveConfig.formatId, 300);
  const a4Spec = calculateA4LayoutSpec(effectiveConfig.formatId);
  const zoomScale = zoom / 100;

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden lg:overflow-hidden">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
        {/* Zone 1: Single Brand Wordmark */}
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('constructor');
          }}
          className="text-lg font-extrabold tracking-tight text-zinc-100 whitespace-nowrap shrink-0"
        >
          WB-QR Studio
        </a>

        {/* Zone 2: Navigation Links */}
        <nav
          aria-label="Основная навигация"
          className="flex items-center gap-6 text-sm font-semibold overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => setActiveTab('constructor')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'constructor'
                ? 'border-violet-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Конструктор
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 font-mono cursor-pointer ${
              activeTab === 'templates'
                ? 'border-violet-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Мои макеты ({templates.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setUpgradeModalFeature(null);
              setIsUpgradeModalOpen(true);
            }}
            className="py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent text-zinc-300 hover:text-zinc-100 font-mono cursor-pointer"
          >
            Тариф: {isPro ? 'PRO ✨' : 'FREE'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (user) {
                setIsAccountModalOpen(true);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent text-zinc-200 hover:text-white cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span>
              {user ? user.email : 'Войти / Личный кабинет'}
            </span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleSaveCurrentTemplate}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4 shrink-0" />
            <span>Сохранить в мои макеты</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace or Templates Gallery */}
      {activeTab === 'templates' ? (
        <TemplatesGallery
          templates={templates}
          isPro={isPro}
          onLoadTemplate={handleLoadTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
          onRequestDeleteTemplate={(tpl) =>
            setConfirmState({ type: 'delete_template', template: tpl })
          }
          onRestoreSeeds={handleRestoreSeeds}
          onOpenUpgrade={openPaywallForFeature}
        />
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Left Panel: Layout, UTM, Readability & Design Settings */}
          <SettingsPanel
            config={effectiveConfig}
            isPro={isPro}
            activeSide={activeSide}
            onSelectSide={setActiveSide}
            onChange={setConfig}
            onRequestResetDefault={() =>
              setConfirmState({ type: 'reset_config' })
            }
            onRequirePro={openPaywallForFeature}
          />

          {/* Right Panel: Live Preview Canvas & Print Export Dock */}
          <section
            aria-label="Предпросмотр и экспорт макета"
            className="flex-1 flex flex-col min-w-0 min-h-[560px] lg:min-h-0 studio-grid-bg relative"
          >
            {/* Top Canvas Bar: Print Specs + Zoom (75/100/125%) + Back Side Toggle + Bleed Switch */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-zinc-900/85 border-b border-zinc-800 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <span className="font-bold text-zinc-100">
                  {currentFormat.widthMm} × {currentFormat.heightMm} мм
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  300 DPI ({printSpecs.printWidthPx} × {printSpecs.printHeightPx} px)
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Готово к печати</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Zoom Controls: 75% / 100% / 125% */}
                <div
                  role="group"
                  aria-label="Масштаб холста"
                  className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-zinc-500 ml-1.5 mr-0.5 shrink-0" />
                  {([75, 100, 125] as ZoomLevel[]).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZoom(z)}
                      className={`px-2 py-1 text-[11px] font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        zoom === z
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {z}%
                    </button>
                  ))}
                </div>

                {/* Two-Sided Card Toggle: Показать оборотную сторону */}
                <button
                  type="button"
                  aria-pressed={activeSide === 'back'}
                  onClick={() =>
                    setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'))
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSide === 'back'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>Показать оборотную сторону</span>
                </button>

                {/* Bleed Cut Line Toggle */}
                <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={effectiveConfig.showBleedLine}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        showBleedLine: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded accent-violet-600"
                  />
                  <Scissors className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="whitespace-nowrap">
                    Показать линию реза (вылеты 2 мм)
                  </span>
                </label>
              </div>
            </div>

            {/* Notification Toast Banner */}
            {statusBanner && (
              <div
                role="status"
                aria-live="polite"
                className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-emerald-500/50 text-xs font-semibold text-emerald-300 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusBanner}</span>
              </div>
            )}

            {/* Centered Live Canvas Workspace */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 overflow-auto">
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                }}
                className="relative flex flex-col items-center transition-transform duration-200"
              >
                {/* Top Physical Millimeter Ruler */}
                <div className="w-full flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2 px-1">
                  <span>0 мм</span>
                  <span className="text-zinc-300 font-semibold">
                    {activeSide === 'front'
                      ? 'Лицевая сторона'
                      : 'Оборотная сторона (3 шага)'}{' '}
                    · Ширина: {currentFormat.widthMm} мм (безопасная зона{' '}
                    {printSpecs.safeZoneWidthMm} мм)
                  </span>
                  <span>{currentFormat.widthMm} мм</span>
                </div>

                {/* Printable Card Component */}
                <div className="relative flex items-center">
                  <CardCanvas
                    config={effectiveConfig}
                    isPro={isPro}
                    side={activeSide}
                    isExporting={isExporting}
                    cardRef={cardSurfaceRef}
                    qrOnlyRef={qrOnlySurfaceRef}
                  />

                  {/* Right Vertical Physical Dimension Callout */}
                  <div className="hidden sm:flex flex-col items-center justify-between h-full ml-3 text-[11px] font-mono text-zinc-400 select-none">
                    <span>Высота: {currentFormat.heightMm} мм</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 text-center">
                  <span>
                    Раскладка на А4: {a4Spec.totalItems} шт. на листе с угловыми метками реза
                  </span>
                  {!isPro && (
                    <>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => openPaywallForFeature('remove_watermark')}
                        className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 shrink-0" />
                        <span>Убрать подпись «Сделано в WB-QR» (PRO)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Hidden A4 Imposition Sheet for 1-Click Print Sheet Export */}
              <A4PrintSheet
                config={effectiveConfig}
                isPro={isPro}
                side={activeSide}
                sheetRef={a4SheetSurfaceRef}
              />
            </div>

            {/* Bottom Export Action Bar */}
            <div className="p-3.5 px-6 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-zinc-400 font-mono">
                Файл:{' '}
                <span className="text-zinc-200">
                  {buildExportFilename(effectiveConfig.brandName, 'png', 'maket')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportQrOnlyPng}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <QrCode className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>Только QR-код (PNG)</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportSvgVector}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {!isPro ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                  <span>Скачать в векторе (SVG)</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportA4SheetPng}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {!isPro ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Grid className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span>Скачать лист для печати A4 (PDF/PNG сетка)</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportPng300Dpi}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Скачать макет для печати (PNG 300 DPI)</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Auth Modal (Login / Registration / Magic Link) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(loggedInUser, statusMsg) => {
          setUser(loggedInUser);
          setIsAuthModalOpen(false);
          setIsAccountModalOpen(true);
          showTemporaryStatus(statusMsg);
        }}
      />

      {/* Personal Account Drawer (Profile, Subscription, Demo PRO Switch) */}
      {user && (
        <AccountModal
          isOpen={isAccountModalOpen}
          user={user}
          templatesCount={templates.filter((t) => !t.id.startsWith('seed-')).length}
          onClose={() => setIsAccountModalOpen(false)}
          onOpenUpgrade={() => {
            setIsAccountModalOpen(false);
            setUpgradeModalFeature(null);
            setIsUpgradeModalOpen(true);
          }}
          onRequestLogout={() => setConfirmState({ type: 'sign_out' })}
          onToggleDemoPlan={async (targetPlan) => {
            const updated = await setDemoSubscriptionPlan(user, targetPlan, 365);
            setUser(updated);
            showTemporaryStatus(
              targetPlan === 'pro'
                ? 'Тестовый режим: Тариф PRO ✨ успешно активирован!'
                : 'Тестовый режим: Возвращён базовый тариф FREE'
            );
          }}
        />
      )}

      {/* Upgrade Paywall Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        triggeredFeature={upgradeModalFeature}
        onClose={() => setIsUpgradeModalOpen(false)}
        onProceedToCheckout={(cycle) => {
          setConfirmState({ type: 'checkout_payment', cycle });
        }}
      />

      {/* Unified Critical Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmState)}
        title={
          confirmState?.type === 'delete_template'
            ? 'Удалить сохранённый макет?'
            : confirmState?.type === 'reset_config'
            ? 'Сбросить настройки конструктора?'
            : confirmState?.type === 'overwrite_template'
            ? 'Перезаписать существующий макет?'
            : confirmState?.type === 'sign_out'
            ? 'Выйти из личного кабинета?'
            : 'Подтверждение перехода к оплате'
        }
        description={
          confirmState?.type === 'delete_template'
            ? `Вы действительно хотите безвозвратно удалить макет «${confirmState.template.name}» из вашего профиля?`
            : confirmState?.type === 'reset_config'
            ? 'Вы уверены? Несохранённые изменения будут потеряны, а все параметры карточки вернутся к стандартным.'
            : confirmState?.type === 'overwrite_template'
            ? `Макет «${confirmState.existingTemplate.name}» уже существует в вашем списке. Перезаписать его текущими настройками конструктора?`
            : confirmState?.type === 'sign_out'
            ? 'Выйти из личного кабинета? Несохранённый прогресс в локальной сессии останется, но синхронизация с облаком приостановится.'
            : 'Проверьте параметры выбранного тарифа перед переходом на защищённую страницу оплаты ЮKassa / СБП.'
        }
        variant={
          confirmState?.type === 'delete_template' ||
          confirmState?.type === 'reset_config' ||
          confirmState?.type === 'sign_out'
            ? 'danger'
            : confirmState?.type === 'checkout_payment'
            ? 'checkout'
            : 'warning'
        }
        receiptItems={buildConfirmReceiptItems()}
        requireAgreement={confirmState?.type === 'checkout_payment'}
        secondaryActionLabel={
          confirmState?.type === 'overwrite_template'
            ? 'Сохранить как копию'
            : undefined
        }
        onSecondaryAction={
          confirmState?.type === 'overwrite_template'
            ? () => {
                setConfirmState(null);
                void executeSaveNewTemplate('(копия)');
              }
            : undefined
        }
        confirmLabel={
          confirmState?.type === 'delete_template'
            ? 'Да, удалить макет'
            : confirmState?.type === 'reset_config'
            ? 'Сбросить настройки'
            : confirmState?.type === 'overwrite_template'
            ? 'Перезаписать макет'
            : confirmState?.type === 'sign_out'
            ? 'Выйти из аккаунта'
            : 'Перейти к оплате'
        }
        onConfirm={handleConfirmDialogAction}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
