export type FormatId = 'business_card_90x50' | 'thermal_58x40' | 'square_70x70';

export type PresetId = 'cashback' | 'support' | 'video_guide';

export type CardThemeId = 'light' | 'kraft' | 'dark';

export type LayoutStyleId = 'sidebar_stripe' | 'frame_accent' | 'split_qr_block';

export type CardFontFamilyId = 'inter' | 'montserrat' | 'manrope';

export type ZoomLevel = 75 | 100 | 125;

export type CardSide = 'front' | 'back';

export type UserPlan = 'free' | 'pro';

export type BillingCycle = 'monthly' | 'annual';

export type ProFeatureKey =
  | 'format_58x40'
  | 'format_70x70'
  | 'logo_in_qr'
  | 'export_a4'
  | 'export_svg'
  | 'utm_builder'
  | 'unlimited_templates'
  | 'remove_watermark';

export interface UserProfile {
  id: string;
  email: string;
  plan: UserPlan;
  proUntil: string | null;
  createdAt: string;
}

export interface PricingPlanOption {
  cycle: BillingCycle;
  title: string;
  priceLabel: string;
  monthlyEquivalentLabel: string;
  amountRub: number;
  durationDays: number;
  badge?: string;
  periodDescription: string;
}

export interface CardFormatSpec {
  id: FormatId;
  name: string;
  shortLabel: string;
  description: string;
  widthMm: number;
  heightMm: number;
  aspectClass: string;
  previewWidthPx: number;
  previewHeightPx: number;
  proOnly?: boolean;
}

export interface ConversionPreset {
  id: PresetId;
  name: string;
  tagline: string;
  badge: string;
  title: string;
  subtitle: string;
  accentColor: string;
  qrCaption: string;
  backSideTitle: string;
  backSideSteps: [string, string, string];
}

export interface CardThemeSpec {
  id: CardThemeId;
  name: string;
  bgHex: string;
  textPrimaryHex: string;
  textSecondaryHex: string;
  borderHex: string;
}

export interface AccentColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface LayoutStyleSpec {
  id: LayoutStyleId;
  name: string;
  description: string;
}

export interface CardFontSpec {
  id: CardFontFamilyId;
  name: string;
  subtitle: string;
  cssFamily: string;
}

export interface UtmParams {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export interface QrReadabilityReport {
  level: 'optimal' | 'warning' | 'critical';
  contrastRatio: number;
  logoAreaPercent: number;
  urlLength: number;
  label: string;
  message: string;
}

export interface A4SheetSpec {
  formatId: FormatId;
  cols: number;
  rows: number;
  totalItems: number;
  sheetLabel: string;
}

export interface CardConfig {
  formatId: FormatId;
  presetId: PresetId;
  targetUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  brandName: string;
  qrCaption: string;
  logoDataUrl: string | null;
  embedLogoInQr: boolean;
  themeId: CardThemeId;
  accentColor: string;
  qrFgColor: string;
  qrCornerRadius: number;
  fontFamily: CardFontFamilyId;
  layoutStyle: LayoutStyleId;
  showBleedLine: boolean;
  backSideTitle: string;
  backSideSteps: [string, string, string];
}

export interface SavedTemplate {
  id: string;
  name: string;
  nicheTag?: string;
  createdAt: number;
  updatedAt: number;
  config: CardConfig;
}
