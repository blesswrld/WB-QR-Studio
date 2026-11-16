import {
  A4SheetSpec,
  AccentColorOption,
  BillingCycle,
  CardConfig,
  CardFontFamilyId,
  CardFontSpec,
  CardFormatSpec,
  CardThemeId,
  CardThemeSpec,
  ConversionPreset,
  FormatId,
  LayoutStyleSpec,
  PresetId,
  PricingPlanOption,
  ProFeatureKey,
  QrReadabilityReport,
  SavedTemplate,
  UserPlan,
  UtmParams,
} from '../types/studio';

export const FREE_PLAN_MAX_TEMPLATES = 2;

export const PRICING_PLANS: Record<BillingCycle, PricingPlanOption> = {
  monthly: {
    cycle: 'monthly',
    title: 'PRO На месяц',
    priceLabel: '590 ₽ / мес',
    monthlyEquivalentLabel: '590 ₽ в месяц',
    amountRub: 590,
    durationDays: 30,
    periodDescription: 'Подписка PRO на 30 дней без ограничений',
  },
  annual: {
    cycle: 'annual',
    title: 'PRO На 1 год',
    priceLabel: '4 900 ₽ / год',
    monthlyEquivalentLabel: '408 ₽ в месяц',
    amountRub: 4900,
    durationDays: 365,
    badge: 'Выгода 30%',
    periodDescription: 'Годовой доступ PRO на 365 дней (экономия 2 180 ₽)',
  },
};

export const CARD_FORMATS: Record<FormatId, CardFormatSpec> = {
  business_card_90x50: {
    id: 'business_card_90x50',
    name: 'Евровизитка 90 × 50 мм',
    shortLabel: '90 × 50 мм',
    description: 'Классический вкладыш в коробку или зип-пакет (10 шт. на А4)',
    widthMm: 90,
    heightMm: 50,
    aspectClass: 'aspect-[9/5]',
    previewWidthPx: 540,
    previewHeightPx: 300,
    proOnly: false,
  },
  thermal_58x40: {
    id: 'thermal_58x40',
    name: 'Термоэтикетка WB/Ozon 58 × 40 мм',
    shortLabel: '58 × 40 мм',
    description: 'Стандартная лента для термопринтеров и раскладки (18 шт. на А4)',
    widthMm: 58,
    heightMm: 40,
    aspectClass: 'aspect-[58/40]',
    previewWidthPx: 464,
    previewHeightPx: 320,
    proOnly: true,
  },
  square_70x70: {
    id: 'square_70x70',
    name: 'Квадратный стикер 70 × 70 мм',
    shortLabel: '70 × 70 мм',
    description: 'Премиальная открытка-вкладыш или крупная наклейка (6 шт. на А4)',
    widthMm: 70,
    heightMm: 70,
    aspectClass: 'aspect-square',
    previewWidthPx: 420,
    previewHeightPx: 420,
    proOnly: true,
  },
};

export const CARD_FONTS: Record<CardFontFamilyId, CardFontSpec> = {
  inter: {
    id: 'inter',
    name: 'Строгий гротеск Inter',
    subtitle: 'Нейтральная швейцарская типографика для электроники и дома',
    cssFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  montserrat: {
    id: 'montserrat',
    name: 'Премиальный Montserrat',
    subtitle: 'Широкий геометрический гротеск для fashion, косметики и подарков',
    cssFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  manrope: {
    id: 'manrope',
    name: 'Дружелюбный Manrope',
    subtitle: 'Современный сбалансированный шрифт с высокой читаемостью мелкого кегля',
    cssFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

export const CONVERSION_PRESETS: Record<PresetId, ConversionPreset> = {
  cashback: {
    id: 'cashback',
    name: 'Кэшбэк за отзыв',
    tagline: 'Повышает конверсию в 5-звёздочный отзыв до 18%',
    badge: 'VIP БОНУС',
    title: 'ПОДАРОК ЗА ОТЗЫВ!',
    subtitle: 'Отсканируйте код и получите 150 ₽ на телефон за честный отзыв',
    accentColor: '#7C3AED',
    qrCaption: 'Наведите камеру',
    backSideTitle: 'КАК ПОЛУЧИТЬ 150 ₽ ЗА 3 ПРОСТЫХ ШАГА',
    backSideSteps: [
      'Оставьте честный отзыв с фото товара в приложении маркетплейса',
      'Наведите камеру смартфона на QR-код справа и откройте чат-бот',
      'Отправьте скриншот отзыва и получите бонус на телефон или карту',
    ],
  },
  support: {
    id: 'support',
    name: 'Анти-негатив / Поддержка',
    tagline: 'Перехватывает 80% возвратов и негативных оценок до публикации',
    badge: 'ЗАБОТА 24/7',
    title: 'ВОЗНИК ВОПРОС?',
    subtitle: 'Не спешите ставить низкую оценку — напишите нам, мы решим любой вопрос за 5 минут',
    accentColor: '#059669',
    qrCaption: 'Чат со службой заботы',
    backSideTitle: 'СЛУЖБА ЗАБОТЫ О ПОКУПАТЕЛЯХ 24/7',
    backSideSteps: [
      'Отсканируйте QR-код камерой телефона для прямой связи с менеджером',
      'Опишите вопрос или пришлите фото, если товар повредился при доставке',
      'Мы бесплатно заменим товар или вернём деньги за 5 минут без бюрократии',
    ],
  },
  video_guide: {
    id: 'video_guide',
    name: 'Видео-инструкция',
    tagline: 'Снижает количество вопросов по сборке и эксплуатации',
    badge: 'ПОЛЕЗНО',
    title: 'ВИДЕО-ИНСТРУКЦИЯ',
    subtitle: 'Наведите камеру телефона, чтобы посмотреть сборку и лайфхаки за 1 минуту',
    accentColor: '#2563EB',
    qrCaption: 'Смотреть видео 1 мин',
    backSideTitle: 'БЫСТРЫЙ СТАРТ И УХОД ЗА ИЗДЕЛИЕМ',
    backSideSteps: [
      'Наведите камеру телефона на QR-код, чтобы открыть видеоролик (1 мин)',
      'Повторите 3 простых шага по подготовке и настройке изделия',
      'Скачайте памятку по уходу и получите доступ к закрытому клубу бренда',
    ],
  },
};

export const CARD_THEMES: Record<CardThemeId, CardThemeSpec> = {
  light: {
    id: 'light',
    name: 'Светлая',
    bgHex: '#FFFFFF',
    textPrimaryHex: '#09090B',
    textSecondaryHex: '#52525B',
    borderHex: '#E4E4E7',
  },
  kraft: {
    id: 'kraft',
    name: 'Теплый крафт/крем',
    bgHex: '#FAF7F2',
    textPrimaryHex: '#1C1917',
    textSecondaryHex: '#57534E',
    borderHex: '#E7E0D6',
  },
  dark: {
    id: 'dark',
    name: 'Темный графит',
    bgHex: '#18181B',
    textPrimaryHex: '#FAFAFA',
    textSecondaryHex: '#A1A1AA',
    borderHex: '#27272A',
  },
};

export const ACCENT_PALETTE: AccentColorOption[] = [
  { id: 'wb_purple', name: 'WB Purple', hex: '#7C3AED' },
  { id: 'ozon_blue', name: 'Ozon Blue', hex: '#2563EB' },
  { id: 'emerald', name: 'Emerald', hex: '#059669' },
  { id: 'amber', name: 'Amber', hex: '#D97706' },
  { id: 'rose', name: 'Rose', hex: '#E11D48' },
];

export const LAYOUT_STYLES: LayoutStyleSpec[] = [
  {
    id: 'sidebar_stripe',
    name: 'Минимализм с боковой полосой',
    description: 'Акцентная геометрия и чистая типографика слева, крупный QR справа',
  },
  {
    id: 'frame_accent',
    name: 'Рамка-акцент',
    description: 'Контурный периметр в фирменном цвете для четкого фокуса внимания',
  },
  {
    id: 'split_qr_block',
    name: 'Split-блок с цветной плашкой под QR',
    description: 'Контрастный залитый блок под QR-код с максимальной заметностью в упаковке',
  },
];

export const SAMPLE_BRAND_LOGO_SVG_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="28" fill="#7C3AED"/>
      <path d="M32 42L46 82L60 52L74 82L88 42" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="60" cy="30" r="6" fill="#FDE047"/>
    </svg>`
  );

export const DEFAULT_CARD_CONFIG: CardConfig = {
  formatId: 'business_card_90x50',
  presetId: 'cashback',
  targetUrl: 'https://t.me/lumiere_skin_bot',
  badge: CONVERSION_PRESETS.cashback.badge,
  title: CONVERSION_PRESETS.cashback.title,
  subtitle: CONVERSION_PRESETS.cashback.subtitle,
  brandName: 'LUMIÈRE SKIN',
  qrCaption: CONVERSION_PRESETS.cashback.qrCaption,
  logoDataUrl: null,
  embedLogoInQr: false,
  themeId: 'light',
  accentColor: CONVERSION_PRESETS.cashback.accentColor,
  qrFgColor: '#09090B',
  qrCornerRadius: 12,
  fontFamily: 'montserrat',
  layoutStyle: 'split_qr_block',
  showBleedLine: true,
  backSideTitle: CONVERSION_PRESETS.cashback.backSideTitle,
  backSideSteps: [...CONVERSION_PRESETS.cashback.backSideSteps],
};

export interface UrlValidationResult {
  isValid: boolean;
  isBlockedScheme?: boolean;
  normalizedUrl: string;
  error?: string;
}

const BLOCKED_URI_PREFIXES = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'blob:',
  'about:',
  'ws:',
  'wss:',
];

export function validateTargetUrl(rawUrl: string): UrlValidationResult {
  const safeFallbackUrl = 'https://t.me/wb_seller_bot';
  const trimmed = rawUrl.replace(/[\u0000-\u001F\u007F]/g, '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: safeFallbackUrl,
      error: 'Укажите целевую ссылку для генерации рабочего QR-кода',
    };
  }

  const lower = trimmed.toLowerCase();
  for (const prefix of BLOCKED_URI_PREFIXES) {
    if (lower.startsWith(prefix)) {
      return {
        isValid: false,
        isBlockedScheme: true,
        normalizedUrl: safeFallbackUrl,
        error: `Заблокирован небезопасный протокол (${prefix}). Разрешены только https:// и http://`,
      };
    }
  }

  if (/<script|onerror\s*=|onload\s*=|javascript:/i.test(trimmed)) {
    return {
      isValid: false,
      isBlockedScheme: true,
      normalizedUrl: safeFallbackUrl,
      error: 'Обнаружен потенциально вредоносный код в ссылке. Используйте чистый URL.',
    };
  }

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
    if (candidate.startsWith('@')) {
      candidate = `https://t.me/${candidate.slice(1)}`;
    } else if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(candidate)) {
      return {
        isValid: false,
        isBlockedScheme: true,
        normalizedUrl: safeFallbackUrl,
        error: 'Поддерживаются только протоколы https:// или http://',
      };
    } else {
      candidate = `https://${candidate}`;
    }
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        isBlockedScheme: true,
        normalizedUrl: safeFallbackUrl,
        error: 'Поддерживаются только протоколы https:// или http://',
      };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.') || parsed.hostname.endsWith('.')) {
      return {
        isValid: false,
        normalizedUrl: safeFallbackUrl,
        error: 'Введите корректный домен (например, t.me/bot или ваш-сайт.рф)',
      };
    }
    return {
      isValid: true,
      normalizedUrl: parsed.toString(),
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: safeFallbackUrl,
      error: 'Некорректный формат ссылки (пример: https://t.me/my_shop_bot)',
    };
  }
}

export function checkFeatureAccess(
  plan: UserPlan,
  feature: ProFeatureKey
): { allowed: boolean; title: string; description: string } {
  if (plan === 'pro') {
    return {
      allowed: true,
      title: 'Доступно в PRO',
      description: 'Все профессиональные функции активны',
    };
  }

  const featureMessages: Record<ProFeatureKey, { title: string; description: string }> = {
    format_58x40: {
      title: 'Формат термоэтикетки 58 × 40 мм',
      description: 'Печать на термопринтерах WB и Ozon доступна на тарифе PRO.',
    },
    format_70x70: {
      title: 'Квадратный стикер 70 × 70 мм',
      description: 'Премиальный квадратный формат открытки доступен на тарифе PRO.',
    },
    logo_in_qr: {
      title: 'Брендирование центра QR-кода',
      description: 'Встраивание логотипа бренда внутрь QR-кода с коррекцией уровня H доступно в PRO.',
    },
    export_a4: {
      title: 'Автоматическая раскладка на лист А4',
      description: 'Готовый печатный лист А4 с метками реза (10 или 18 шт.) доступен на тарифе PRO.',
    },
    export_svg: {
      title: 'Векторный экспорт SVG для типографий',
      description: 'Скачивание макета в кривых (SVG) без потери качества доступно на тарифе PRO.',
    },
    utm_builder: {
      title: 'UTM-генератор аналитики селлера',
      description: 'Отслеживание переходов по каждому артикулу через UTM-метки доступно в PRO.',
    },
    unlimited_templates: {
      title: 'Безлимитное сохранение макетов',
      description: 'На бесплатном тарифе FREE доступно хранение до 2 макетов. Перейдите на PRO для снятия лимита.',
    },
    remove_watermark: {
      title: 'Отключение водяного знака «Сделано в WB-QR»',
      description: 'Чистые коммерческие макеты без упоминания сервиса доступны на тарифе PRO.',
    },
  };

  return {
    allowed: false,
    ...featureMessages[feature],
  };
}

/**
 * Принудительно нормализует конфигурацию карточки под права текущего тарифа,
 * исключая обход PRO-ограничений через инспектор кода или ручную правку state.
 */
export function enforcePlanConstraintsOnConfig(
  config: CardConfig,
  isPro: boolean
): CardConfig {
  if (isPro) {
    return config;
  }
  return {
    ...config,
    formatId: 'business_card_90x50',
    embedLogoInQr: false,
  };
}

export function isConfigDirty(a: CardConfig, b: CardConfig): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function buildUrlWithUtm(rawUrl: string, utm: UtmParams): string {
  const validation = validateTargetUrl(rawUrl);
  const base = validation.isValid ? validation.normalizedUrl : 'https://t.me/wb_seller_bot';
  try {
    const urlObj = new URL(base);
    if (utm.utmSource.trim()) {
      urlObj.searchParams.set('utm_source', utm.utmSource.trim());
    }
    if (utm.utmMedium.trim()) {
      urlObj.searchParams.set('utm_medium', utm.utmMedium.trim());
    }
    if (utm.utmCampaign.trim()) {
      urlObj.searchParams.set('utm_campaign', utm.utmCampaign.trim());
    }
    return urlObj.toString();
  } catch {
    return base;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }
  return null;
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex) || { r: 9, g: 9, b: 11 };
  const transform = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = transform(rgb.r);
  const G = transform(rgb.g);
  const B = transform(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function calculateColorContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function evaluateQrReadability(config: CardConfig): QrReadabilityReport {
  const qrBgHex = '#FFFFFF';
  const cardBgHex = CARD_THEMES[config.themeId].bgHex;
  const fgColor = config.qrFgColor || '#09090B';

  const qrContrast = calculateColorContrastRatio(fgColor, qrBgHex);
  const cardContrast = calculateColorContrastRatio(fgColor, cardBgHex);
  const effectiveContrast = Math.min(qrContrast, cardContrast > 1.5 ? qrContrast : qrContrast);

  const logoAreaPercent = config.logoDataUrl && config.embedLogoInQr ? 19 : 0;
  const urlLength = config.targetUrl.trim().length;

  if (qrContrast < 4.5) {
    return {
      level: 'critical',
      contrastRatio: effectiveContrast,
      logoAreaPercent,
      urlLength,
      label: 'Низкая читаемость',
      message: 'Низкий контраст: камера может плохо считывать код на матовой бумаге',
    };
  }

  if (qrContrast < 7 || urlLength > 105) {
    return {
      level: 'warning',
      contrastRatio: effectiveContrast,
      logoAreaPercent,
      urlLength,
      label: 'Средняя читаемость',
      message:
        urlLength > 105
          ? 'Низкий контраст: камера может плохо считывать код на матовой бумаге из-за мелкой сетки длинной ссылки'
          : 'Низкий контраст: камера может плохо считывать код на матовой бумаге',
    };
  }

  return {
    level: 'optimal',
    contrastRatio: effectiveContrast,
    logoAreaPercent,
    urlLength,
    label: 'Высокая (100% скан)',
    message: `Контраст ${effectiveContrast}:1 • Логотип ${logoAreaPercent}% (норма ≤ 22%) • Чтение за 0.2 сек`,
  };
}

export function calculateA4LayoutSpec(formatId: FormatId): A4SheetSpec {
  if (formatId === 'business_card_90x50') {
    return {
      formatId,
      cols: 2,
      rows: 5,
      totalItems: 10,
      sheetLabel: 'Лист А4 • 10 евровизиток 90×50 мм (сетка 2×5 с метками реза)',
    };
  }
  if (formatId === 'thermal_58x40') {
    return {
      formatId,
      cols: 3,
      rows: 6,
      totalItems: 18,
      sheetLabel: 'Лист А4 • 18 этикеток 58×40 мм (сетка 3×6 с метками реза)',
    };
  }
  return {
    formatId,
    cols: 2,
    rows: 3,
    totalItems: 6,
    sheetLabel: 'Лист А4 • 6 квадратных стикеров 70×70 мм (сетка 2×3 с метками реза)',
  };
}

export function applyPresetToConfig(current: CardConfig, presetId: PresetId): CardConfig {
  const preset = CONVERSION_PRESETS[presetId];
  return {
    ...current,
    presetId: preset.id,
    badge: preset.badge,
    title: preset.title,
    subtitle: preset.subtitle,
    accentColor: preset.accentColor,
    qrCaption: preset.qrCaption,
    backSideTitle: preset.backSideTitle,
    backSideSteps: [...preset.backSideSteps],
  };
}

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function sanitizeBrandSlug(brandName: string): string {
  const lower = brandName.trim().toLowerCase();
  if (!lower) return 'brand';

  let transliterated = '';
  for (const ch of lower) {
    if (CYRILLIC_TO_LATIN_MAP[ch] !== undefined) {
      transliterated += CYRILLIC_TO_LATIN_MAP[ch];
    } else {
      transliterated += ch;
    }
  }

  const slug = transliterated
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'brand';
}

export function buildExportFilename(
  brandName: string,
  extension: 'png' | 'svg',
  prefix = 'maket'
): string {
  const slug = sanitizeBrandSlug(brandName);
  return `${prefix}-${slug}.${extension}`;
}

export interface PrintSpecs {
  widthMm: number;
  heightMm: number;
  dpi: number;
  printWidthPx: number;
  printHeightPx: number;
  bleedMm: number;
  safeZoneWidthMm: number;
  safeZoneHeightMm: number;
  bleedInsetPercentX: number;
  bleedInsetPercentY: number;
}

export function calculatePrintSpecs(formatId: FormatId, dpi = 300): PrintSpecs {
  const format = CARD_FORMATS[formatId];
  const bleedMm = 2;
  const printWidthPx = Math.round((format.widthMm / 25.4) * dpi);
  const printHeightPx = Math.round((format.heightMm / 25.4) * dpi);
  const safeZoneWidthMm = format.widthMm - bleedMm * 2;
  const safeZoneHeightMm = format.heightMm - bleedMm * 2;
  const bleedInsetPercentX = Number(((bleedMm / format.widthMm) * 100).toFixed(2));
  const bleedInsetPercentY = Number(((bleedMm / format.heightMm) * 100).toFixed(2));

  return {
    widthMm: format.widthMm,
    heightMm: format.heightMm,
    dpi,
    printWidthPx,
    printHeightPx,
    bleedMm,
    safeZoneWidthMm,
    safeZoneHeightMm,
    bleedInsetPercentX,
    bleedInsetPercentY,
  };
}

export function computeTitleSizeClass(title: string, formatId: FormatId): string {
  const len = title.trim().length;
  if (formatId === 'thermal_58x40') {
    if (len > 26) return 'text-sm leading-tight';
    if (len > 18) return 'text-base leading-tight';
    return 'text-lg leading-tight';
  }
  if (formatId === 'square_70x70') {
    if (len > 28) return 'text-base leading-tight';
    if (len > 18) return 'text-lg leading-tight';
    return 'text-xl leading-tight';
  }
  if (len > 30) return 'text-base leading-tight';
  if (len > 20) return 'text-lg leading-tight';
  return 'text-xl leading-tight';
}

export function duplicateTemplateItem(
  template: SavedTemplate,
  now = Date.now(),
  newId = `tpl-${now}`
): SavedTemplate {
  return {
    id: newId,
    name: `${template.name} (копия)`,
    nicheTag: template.nicheTag,
    createdAt: now,
    updatedAt: now,
    config: {
      ...template.config,
      backSideSteps: [...template.config.backSideSteps],
    },
  };
}

export const INITIAL_SEED_TEMPLATES: SavedTemplate[] = [
  {
    id: 'seed-niche-cosmetics',
    name: 'LUMIÈRE SKIN — Сыворотка с витамином C (Косметика)',
    nicheTag: 'Косметика',
    createdAt: 1763200000000,
    updatedAt: 1763200000000,
    config: {
      ...DEFAULT_CARD_CONFIG,
      formatId: 'business_card_90x50',
      presetId: 'cashback',
      targetUrl: 'https://t.me/lumiere_skin_bot?utm_source=wb_pack&utm_medium=qr_card&utm_campaign=serum_vit_c',
      badge: 'VIP БОНУС',
      title: 'ПОДАРОК ЗА ОТЗЫВ!',
      subtitle: 'Отсканируйте код и получите 200 ₽ на телефон и гайд по уходу за кожей за честный отзыв',
      brandName: 'LUMIÈRE SKIN',
      qrCaption: 'Забрать 200 ₽ + гайд',
      themeId: 'kraft',
      accentColor: '#E11D48',
      qrFgColor: '#09090B',
      qrCornerRadius: 14,
      fontFamily: 'montserrat',
      layoutStyle: 'split_qr_block',
    },
  },
  {
    id: 'seed-niche-electronics',
    name: 'TECHNO LAB — Беспроводные наушники Pro (Электроника)',
    nicheTag: 'Электроника',
    createdAt: 1763205000000,
    updatedAt: 1763205000000,
    config: {
      formatId: 'thermal_58x40',
      presetId: 'support',
      targetUrl: 'https://t.me/technolab_care_bot?utm_source=ozon_box&utm_medium=qr_card&utm_campaign=tws_pro',
      badge: 'ГАРАНТИЯ 1 ГОД',
      title: 'ВОЗНИК ВОПРОС?',
      subtitle: 'Не спешите ставить низкую оценку — напишите в техподдержку, мы решим вопрос за 5 минут',
      brandName: 'TECHNO LAB',
      qrCaption: 'Чат с инженером 24/7',
      logoDataUrl: SAMPLE_BRAND_LOGO_SVG_DATA_URL,
      embedLogoInQr: true,
      themeId: 'light',
      accentColor: '#059669',
      qrFgColor: '#09090B',
      qrCornerRadius: 10,
      fontFamily: 'inter',
      layoutStyle: 'frame_accent',
      showBleedLine: true,
      backSideTitle: CONVERSION_PRESETS.support.backSideTitle,
      backSideSteps: [...CONVERSION_PRESETS.support.backSideSteps],
    },
  },
  {
    id: 'seed-niche-apparel',
    name: 'VELVET ATELIER — Кашемировый кардиган (Одежда)',
    nicheTag: 'Одежда',
    createdAt: 1763210000000,
    updatedAt: 1763210000000,
    config: {
      formatId: 'square_70x70',
      presetId: 'video_guide',
      targetUrl: 'https://t.me/velvet_atelier_club?utm_source=wb_tag&utm_medium=qr_card&utm_campaign=cashmere_2026',
      badge: 'ЗАКРЫТЫЙ КЛУБ',
      title: 'ГИД ПО УХОДУ И СТИЛЮ',
      subtitle: 'Наведите камеру телефона, чтобы посмотреть видео по деликатной стирке и 5 образов от стилиста',
      brandName: 'VELVET ATELIER',
      qrCaption: 'Смотреть лукбук 1 мин',
      logoDataUrl: null,
      embedLogoInQr: false,
      themeId: 'dark',
      accentColor: '#7C3AED',
      qrFgColor: '#09090B',
      qrCornerRadius: 16,
      fontFamily: 'manrope',
      layoutStyle: 'sidebar_stripe',
      showBleedLine: true,
      backSideTitle: CONVERSION_PRESETS.video_guide.backSideTitle,
      backSideSteps: [...CONVERSION_PRESETS.video_guide.backSideSteps],
    },
  },
];
