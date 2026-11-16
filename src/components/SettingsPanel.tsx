import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crown,
  ImagePlus,
  Layers,
  Link2,
  Lock,
  Palette,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Type,
} from 'lucide-react';
import {
  CardConfig,
  CardFontFamilyId,
  CardSide,
  CardThemeId,
  FormatId,
  LayoutStyleId,
  PresetId,
  ProFeatureKey,
  UtmParams,
} from '../types/studio';
import {
  ACCENT_PALETTE,
  applyPresetToConfig,
  buildUrlWithUtm,
  CARD_FONTS,
  CARD_FORMATS,
  CARD_THEMES,
  CONVERSION_PRESETS,
  evaluateQrReadability,
  LAYOUT_STYLES,
  SAMPLE_BRAND_LOGO_SVG_DATA_URL,
  validateTargetUrl,
} from '../utils/studioLogic';

interface SettingsPanelProps {
  config: CardConfig;
  isPro: boolean;
  activeSide: CardSide;
  onSelectSide: (side: CardSide) => void;
  onChange: (updater: (prev: CardConfig) => CardConfig) => void;
  onRequestResetDefault: () => void;
  onRequirePro: (feature: ProFeatureKey) => void;
}

type SettingsSectionTab = 'format_presets' | 'content_brand' | 'design_style';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  isPro,
  activeSide,
  onSelectSide,
  onChange,
  onRequestResetDefault,
  onRequirePro,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionTab>('format_presets');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUtmOpen, setIsUtmOpen] = useState<boolean>(false);
  const [utm, setUtm] = useState<UtmParams>({
    utmSource: 'wb_pack',
    utmMedium: 'qr_card',
    utmCampaign: 'novinka_2026',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const urlValidation = validateTargetUrl(config.targetUrl);
  const readability = evaluateQrReadability(config);

  const handlePresetClick = (presetId: PresetId) => {
    onChange((prev) => applyPresetToConfig(prev, presetId));
  };

  const handleFormatChange = (formatId: FormatId) => {
    const fmt = CARD_FORMATS[formatId];
    if (fmt.proOnly && !isPro) {
      onRequirePro(formatId === 'thermal_58x40' ? 'format_58x40' : 'format_70x70');
      return;
    }
    onChange((prev) => ({ ...prev, formatId }));
  };

  const handleThemeChange = (themeId: CardThemeId) => {
    onChange((prev) => ({ ...prev, themeId }));
  };

  const handleLayoutStyleChange = (layoutStyle: LayoutStyleId) => {
    onChange((prev) => ({ ...prev, layoutStyle }));
  };

  const handleFontChange = (fontFamily: CardFontFamilyId) => {
    onChange((prev) => ({ ...prev, fontFamily }));
  };

  const handleToggleUtmAccordion = () => {
    if (!isPro) {
      onRequirePro('utm_builder');
      return;
    }
    setIsUtmOpen((prev) => !prev);
  };

  const handleApplyUtm = () => {
    if (!isPro) {
      onRequirePro('utm_builder');
      return;
    }
    const updatedUrl = buildUrlWithUtm(config.targetUrl, utm);
    onChange((prev) => ({
      ...prev,
      targetUrl: updatedUrl,
    }));
  };

  const handleToggleEmbedLogoInQr = (checked: boolean) => {
    if (checked && !isPro) {
      onRequirePro('logo_in_qr');
      return;
    }
    onChange((prev) => ({
      ...prev,
      embedLogoInQr: checked,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Поддерживаются только файлы PNG, JPEG или SVG');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Максимальный размер файла логотипа — 4 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) {
        onChange((prev) => ({
          ...prev,
          logoDataUrl: result,
        }));
      }
    };
    reader.onerror = () => {
      setUploadError('Не удалось прочитать файл логотипа');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside
      aria-label="Настройки макета"
      className="w-full lg:w-[440px] xl:w-[470px] shrink-0 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col h-full overflow-hidden"
    >
      {/* Segmented Section Tabs */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/90">
        <div
          role="tablist"
          aria-label="Разделы настроек конструктора"
          className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'format_presets'}
            onClick={() => setActiveSection('format_presets')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'format_presets'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Формат и пресеты</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'content_brand'}
            onClick={() => setActiveSection('content_brand')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'content_brand'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Type className="w-3.5 h-3.5 shrink-0" />
            <span>Контент и QR</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSection === 'design_style'}
            onClick={() => setActiveSection('design_style')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'design_style'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span>Дизайн и шрифт</span>
          </button>
        </div>
      </div>

      {/* Scrollable Settings Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* TAB 1: FORMAT & CONVERSION PRESETS */}
        {activeSection === 'format_presets' && (
          <>
            {/* Carrier Format Selector */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  1. Формат носителя (300 DPI)
                </h2>
                <span className="text-xs font-mono text-zinc-500">
                  {CARD_FORMATS[config.formatId].shortLabel}
                </span>
              </div>

              <div className="space-y-2">
                {(Object.keys(CARD_FORMATS) as FormatId[]).map((fid) => {
                  const fmt = CARD_FORMATS[fid];
                  const isSelected = config.formatId === fid;
                  const isLocked = Boolean(fmt.proOnly && !isPro);

                  return (
                    <button
                      key={fid}
                      type="button"
                      onClick={() => handleFormatChange(fid)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800/90 border-violet-500 text-zinc-100'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-100">
                            {fmt.name}
                          </span>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300">
                              <Lock className="w-3 h-3 shrink-0" />
                              <span>PRO</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {fmt.description}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 shrink-0">
                        {fmt.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Ready Conversion Presets */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. Готовые конверсионные пресеты
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              </div>

              <div className="space-y-2.5">
                {(Object.keys(CONVERSION_PRESETS) as PresetId[]).map((pid) => {
                  const preset = CONVERSION_PRESETS[pid];
                  const isSelected = config.presetId === pid;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => handlePresetClick(pid)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800/90 border-violet-500'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-zinc-100">{preset.name}</span>
                        <span
                          style={{ backgroundColor: preset.accentColor }}
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white shrink-0"
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-semibold mt-1.5">{preset.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{preset.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: CONTENT, UTM & QR READABILITY */}
        {activeSection === 'content_brand' && (
          <>
            {/* Target URL + UTM Generator + QR Readability */}
            <section className="space-y-2.5">
              <label
                htmlFor="target-url-input"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
              >
                Целевая ссылка (QR-код)
              </label>
              <div className="relative">
                <input
                  id="target-url-input"
                  type="text"
                  value={config.targetUrl}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, targetUrl: e.target.value }))
                  }
                  placeholder="https://t.me/ваш_бот или ссылка на сайт"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-950 rounded-lg border text-zinc-100 placeholder-zinc-500 focus:outline-none ${
                    urlValidation.isValid
                      ? 'border-zinc-800 focus:border-violet-500'
                      : 'border-rose-500/80 focus:border-rose-500'
                  }`}
                />
                <Link2 className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>

              {urlValidation.isValid ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate font-mono">
                    Активный URL: {urlValidation.normalizedUrl}
                  </span>
                </div>
              ) : (
                <div
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-rose-400"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{urlValidation.error}</span>
                </div>
              )}

              {/* Collapsible 1-Click UTM Generator (PRO capability) */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isUtmOpen && isPro}
                  onClick={handleToggleUtmAccordion}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>UTM-генератор в 1 клик (аналитика товара)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {!isPro && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300">
                        <Crown className="w-3 h-3 shrink-0" />
                        <span>PRO</span>
                      </span>
                    )}
                    {isUtmOpen && isPro ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </span>
                </button>

                {isUtmOpen && isPro && (
                  <div className="p-3 pt-2 border-t border-zinc-800/80 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label
                          htmlFor="utm-source-input"
                          className="block text-[11px] font-mono text-zinc-400 mb-1"
                        >
                          utm_source
                        </label>
                        <input
                          id="utm-source-input"
                          type="text"
                          value={utm.utmSource}
                          onChange={(e) =>
                            setUtm((prev) => ({ ...prev, utmSource: e.target.value }))
                          }
                          placeholder="wb_pack"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-100 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="utm-medium-input"
                          className="block text-[11px] font-mono text-zinc-400 mb-1"
                        >
                          utm_medium
                        </label>
                        <input
                          id="utm-medium-input"
                          type="text"
                          value={utm.utmMedium}
                          onChange={(e) =>
                            setUtm((prev) => ({ ...prev, utmMedium: e.target.value }))
                          }
                          placeholder="qr_card"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-100 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="utm-campaign-input"
                        className="block text-[11px] font-mono text-zinc-400 mb-1"
                      >
                        utm_campaign (артикул / товар)
                      </label>
                      <input
                        id="utm-campaign-input"
                        type="text"
                        value={utm.utmCampaign}
                        onChange={(e) =>
                          setUtm((prev) => ({ ...prev, utmCampaign: e.target.value }))
                        }
                        placeholder="serum_vit_c"
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-100 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyUtm}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-md transition-colors cursor-pointer"
                    >
                      Применить UTM-метки к ссылке
                    </button>
                  </div>
                )}
              </div>

              {/* QR Readability Quality Control Indicator */}
              <div
                data-testid="qr-readability-indicator"
                className={`p-3 rounded-lg border ${
                  readability.level === 'optimal'
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                    : readability.level === 'warning'
                    ? 'bg-amber-950/40 border-amber-700/70 text-amber-200'
                    : 'bg-rose-950/40 border-rose-700/70 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    {readability.level === 'optimal' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>Читаемость QR-кода: {readability.label}</span>
                  </span>
                  <span className="text-[11px] font-mono font-semibold shrink-0">
                    {readability.contrastRatio}:1
                  </span>
                </div>
                <p className="text-[11px] mt-1 leading-snug opacity-90">
                  {readability.message}
                </p>
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Side Switcher inside Content Tab (Front vs Back 3-Step Guide) */}
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Тексты ({activeSide === 'front' ? 'Лицевая сторона' : 'Оборотная сторона'})
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    onSelectSide(activeSide === 'front' ? 'back' : 'front')
                  }
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                >
                  {activeSide === 'front'
                    ? 'Редактировать оборот →'
                    : '← Вернуться к лицевой'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="brand-name-input"
                    className="block text-xs font-medium text-zinc-300 mb-1"
                  >
                    Магазин / Бренд
                  </label>
                  <input
                    id="brand-name-input"
                    type="text"
                    value={config.brandName}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, brandName: e.target.value }))
                    }
                    placeholder="Например, LUMIÈRE SKIN"
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="badge-input"
                    className="block text-xs font-medium text-zinc-300 mb-1"
                  >
                    Бейдж
                  </label>
                  <input
                    id="badge-input"
                    type="text"
                    value={config.badge}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    placeholder="VIP БОНУС"
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {activeSide === 'front' ? (
                <>
                  <div>
                    <label
                      htmlFor="title-input"
                      className="block text-xs font-medium text-zinc-300 mb-1"
                    >
                      Заголовок (лицевая сторона)
                    </label>
                    <input
                      id="title-input"
                      type="text"
                      value={config.title}
                      onChange={(e) =>
                        onChange((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="ПОДАРОК ЗА ОТЗЫВ!"
                      className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subtitle-input"
                      className="block text-xs font-medium text-zinc-300 mb-1"
                    >
                      Подзаголовок / Описание
                    </label>
                    <textarea
                      id="subtitle-input"
                      rows={3}
                      value={config.subtitle}
                      onChange={(e) =>
                        onChange((prev) => ({ ...prev, subtitle: e.target.value }))
                      }
                      placeholder="Отсканируйте код и получите 150 ₽ на телефон за честный отзыв"
                      className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <div>
                    <label
                      htmlFor="back-title-input"
                      className="block text-xs font-medium text-zinc-300 mb-1"
                    >
                      Заголовок инструкции (оборот)
                    </label>
                    <input
                      id="back-title-input"
                      type="text"
                      value={config.backSideTitle}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          backSideTitle: e.target.value,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
                    />
                  </div>
                  {[0, 1, 2].map((stepIdx) => (
                    <div key={stepIdx}>
                      <label
                        htmlFor={`back-step-${stepIdx}`}
                        className="block text-[11px] font-mono text-zinc-400 mb-1"
                      >
                        Шаг {stepIdx + 1}
                      </label>
                      <input
                        id={`back-step-${stepIdx}`}
                        type="text"
                        value={config.backSideSteps[stepIdx] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange((prev) => {
                            const nextSteps: [string, string, string] = [
                              ...prev.backSideSteps,
                            ] as [string, string, string];
                            nextSteps[stepIdx] = val;
                            return { ...prev, backSideSteps: nextSteps };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label
                  htmlFor="qr-caption-input"
                  className="block text-xs font-medium text-zinc-300 mb-1"
                >
                  Призыв под QR-кодом
                </label>
                <input
                  id="qr-caption-input"
                  type="text"
                  value={config.qrCaption}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, qrCaption: e.target.value }))
                  }
                  placeholder="Наведите камеру"
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Brand Logo Upload & QR Center Embed */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Логотип бренда (≤ 20% площади QR)
                </h2>
                <span className="text-[11px] text-zinc-500">PNG, JPG, SVG</span>
              </div>

              <input
                ref={fileInputRef}
                id="logo-file-input"
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                onChange={handleLogoUpload}
                className="sr-only"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Загрузить логотип</span>
                </button>

                {!config.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        logoDataUrl: SAMPLE_BRAND_LOGO_SVG_DATA_URL,
                      }))
                    }
                    className="py-2.5 px-3 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Демо-лого
                  </button>
                )}

                {config.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({ ...prev, logoDataUrl: null }))
                    }
                    aria-label="Удалить логотип"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>Удалить</span>
                  </button>
                )}
              </div>

              {uploadError && (
                <p role="alert" className="text-xs text-rose-400">
                  {uploadError}
                </p>
              )}

              <label className="flex items-center justify-between gap-2.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer select-none">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isPro && config.embedLogoInQr}
                    onChange={(e) => handleToggleEmbedLogoInQr(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-600"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-zinc-200">
                      Встроить логотип в центр QR-кода
                    </div>
                    <div className="text-zinc-500">
                      Коррекция ошибок Уровень H (30%) • Площадь 19% (норма ≤ 22%)
                    </div>
                  </div>
                </div>
                {!isPro && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 shrink-0">
                    <Crown className="w-3 h-3 shrink-0" />
                    <span>PRO</span>
                  </span>
                )}
              </label>
            </section>
          </>
        )}

        {/* TAB 3: DESIGN, FONTS & QR CORNER RADIUS */}
        {activeSection === 'design_style' && (
          <>
            {/* Card Surface Theme */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                1. Тема карточки (Фон печати)
              </h2>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(CARD_THEMES) as CardThemeId[]).map((tid) => {
                  const t = CARD_THEMES[tid];
                  const isSelected = config.themeId === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => handleThemeChange(tid)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 border-violet-500'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: t.bgHex }}
                        className="w-full h-7 rounded border border-zinc-700/60 mb-2 flex items-center justify-center"
                      >
                        <span
                          style={{ color: t.textPrimaryHex }}
                          className="text-[10px] font-mono font-bold"
                        >
                          {t.bgHex}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-zinc-100 leading-tight whitespace-nowrap">
                        {t.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Typography Pair Selector */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                2. Шрифтовая пара карточки
              </h2>
              <div className="space-y-2">
                {(Object.keys(CARD_FONTS) as CardFontFamilyId[]).map((fontId) => {
                  const fSpec = CARD_FONTS[fontId];
                  const isSelected = (config.fontFamily || 'manrope') === fontId;
                  return (
                    <button
                      key={fontId}
                      type="button"
                      onClick={() => handleFontChange(fontId)}
                      style={{ fontFamily: fSpec.cssFamily }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800/90 border-violet-500'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-sm font-bold text-zinc-100">
                        {fSpec.name}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {fSpec.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Accent Color Palette + Custom Color Input + QR Foreground Color */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  3. Фирменный акцент и цвет QR
                </h2>
                <span className="text-xs font-mono text-zinc-400 uppercase">
                  {config.accentColor}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {ACCENT_PALETTE.map((swatch) => {
                  const isActive =
                    config.accentColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({ ...prev, accentColor: swatch.hex }))
                      }
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-zinc-800 border-zinc-200'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: swatch.hex }}
                        className="w-6 h-6 rounded-full border border-white/20"
                      />
                      <span className="text-[10px] font-medium text-zinc-300 truncate w-full text-center">
                        {swatch.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <label
                    htmlFor="custom-accent-color"
                    className="text-xs font-medium text-zinc-300"
                  >
                    Акцент:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="custom-accent-color"
                      type="color"
                      value={config.accentColor}
                      onChange={(e) =>
                        onChange((prev) => ({ ...prev, accentColor: e.target.value }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-zinc-200 uppercase">
                      {config.accentColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                  <label
                    htmlFor="custom-qr-fg-color"
                    className="text-xs font-medium text-zinc-300"
                  >
                    Цвет QR:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="custom-qr-fg-color"
                      type="color"
                      value={config.qrFgColor || '#09090B'}
                      onChange={(e) =>
                        onChange((prev) => ({ ...prev, qrFgColor: e.target.value }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-zinc-200 uppercase">
                      {config.qrFgColor || '#09090B'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* QR Frame / Module Corner Radius Slider */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="qr-corner-radius-slider"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  4. Скругление углов рамки и подложки QR
                </label>
                <span className="text-xs font-mono font-semibold text-violet-400">
                  {config.qrCornerRadius ?? 12} px
                </span>
              </div>

              <input
                id="qr-corner-radius-slider"
                type="range"
                min={0}
                max={24}
                step={2}
                value={config.qrCornerRadius ?? 12}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    qrCornerRadius: Number(e.target.value),
                  }))
                }
                className="w-full accent-violet-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>0 px (Острые)</span>
                <span>12 px (Стандарт)</span>
                <span>24 px (Мягкие)</span>
              </div>
            </section>

            <hr className="border-zinc-800" />

            {/* Layout Style */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                5. Стиль оформления макета
              </h2>
              <div className="space-y-2">
                {LAYOUT_STYLES.map((styleItem) => {
                  const isSelected = config.layoutStyle === styleItem.id;
                  return (
                    <button
                      key={styleItem.id}
                      type="button"
                      onClick={() => handleLayoutStyleChange(styleItem.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800/90 border-violet-500'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-sm font-bold text-zinc-100">
                        {styleItem.name}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {styleItem.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Bottom Reset Action (Triggers Confirmation Dialog) */}
      <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Все изменения применяются мгновенно
        </span>
        <button
          type="button"
          onClick={onRequestResetDefault}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer"
        >
          Сбросить макет
        </button>
      </div>
    </aside>
  );
};
