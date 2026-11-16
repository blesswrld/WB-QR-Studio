import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPresetToConfig,
  buildExportFilename,
  buildUrlWithUtm,
  calculateA4LayoutSpec,
  calculateColorContrastRatio,
  calculatePrintSpecs,
  checkFeatureAccess,
  computeTitleSizeClass,
  CONVERSION_PRESETS,
  DEFAULT_CARD_CONFIG,
  duplicateTemplateItem,
  enforcePlanConstraintsOnConfig,
  evaluateQrReadability,
  INITIAL_SEED_TEMPLATES,
   sanitizeBrandSlug,
  validateTargetUrl,
} from './studioLogic';
import { buildPaymentCheckoutUrl, isSupabaseConfigured } from '../config/env';

test('validateTargetUrl validates legitimate URLs and blocks malicious URI schemes', () => {
  const validHttps = validateTargetUrl('https://t.me/wb_support_bot');
  assert.equal(validHttps.isValid, true);
  assert.equal(validHttps.normalizedUrl, 'https://t.me/wb_support_bot');

  const telegramHandle = validateTargetUrl('@my_wb_shop_bot');
  assert.equal(telegramHandle.isValid, true);
  assert.equal(telegramHandle.normalizedUrl, 'https://t.me/my_wb_shop_bot');

  const bareDomain = validateTargetUrl('wildberries.ru/catalog/12345');
  assert.equal(bareDomain.isValid, true);
  assert.equal(bareDomain.normalizedUrl, 'https://wildberries.ru/catalog/12345');

  const jsScheme = validateTargetUrl('javascript:alert(document.cookie)');
  assert.equal(jsScheme.isValid, false);
  assert.equal(jsScheme.isBlockedScheme, true);
  assert.equal(jsScheme.normalizedUrl, 'https://t.me/wb_seller_bot');

  const dataScheme = validateTargetUrl('data:text/html,<script>alert(1)</script>');
  assert.equal(dataScheme.isValid, false);
  assert.equal(dataScheme.isBlockedScheme, true);

  const empty = validateTargetUrl('   ');
  assert.equal(empty.isValid, false);
  assert.ok(empty.error);
});

test('checkFeatureAccess and enforcePlanConstraintsOnConfig enforce FREE vs PRO entitlements', () => {
  assert.equal(checkFeatureAccess('free', 'format_58x40').allowed, false);
  assert.equal(checkFeatureAccess('pro', 'format_58x40').allowed, true);
  assert.equal(checkFeatureAccess('free', 'export_svg').allowed, false);
  assert.equal(checkFeatureAccess('pro', 'export_svg').allowed, true);

  const tamperedConfig = {
    ...DEFAULT_CARD_CONFIG,
    formatId: 'thermal_58x40' as const,
    embedLogoInQr: true,
  };
  const sanitizedForFree = enforcePlanConstraintsOnConfig(tamperedConfig, false);
  assert.equal(sanitizedForFree.formatId, 'business_card_90x50');
  assert.equal(sanitizedForFree.embedLogoInQr, false);

  const allowedForPro = enforcePlanConstraintsOnConfig(tamperedConfig, true);
  assert.equal(allowedForPro.formatId, 'thermal_58x40');
  assert.equal(allowedForPro.embedLogoInQr, true);
});

test('env configuration defaults to Demo/Fallback mode and builds payment checkout URLs', () => {
  assert.equal(isSupabaseConfigured(), false);
  const checkoutUrl = buildPaymentCheckoutUrl({
    userId: 'usr-123',
    email: 'seller@wb.ru',
    billingCycle: 'annual',
    amountRub: 4900,
  });
  assert.ok(checkoutUrl.includes('userId=usr-123'));
  assert.ok(checkoutUrl.includes('email=seller%40wb.ru'));
  assert.ok(checkoutUrl.includes('cycle=annual'));
  assert.ok(checkoutUrl.includes('amount=4900'));
});

test('buildUrlWithUtm appends utm_source, utm_medium, and utm_campaign accurately', () => {
  const result = buildUrlWithUtm('https://t.me/my_bot', {
    utmSource: 'wb_pack',
    utmMedium: 'qr_card',
    utmCampaign: 'serum_vit_c',
  });
  assert.equal(
    result,
    'https://t.me/my_bot?utm_source=wb_pack&utm_medium=qr_card&utm_campaign=serum_vit_c'
  );
});

test('calculateColorContrastRatio and evaluateQrReadability detect low contrast and long URLs', () => {
  const highContrast = calculateColorContrastRatio('#09090B', '#FFFFFF');
  assert.ok(highContrast > 18);

  const optimalReport = evaluateQrReadability(DEFAULT_CARD_CONFIG);
  assert.equal(optimalReport.level, 'optimal');
  assert.ok(optimalReport.logoAreaPercent <= 22);

  const lowContrastReport = evaluateQrReadability({
    ...DEFAULT_CARD_CONFIG,
    qrFgColor: '#CBD5E1',
  });
  assert.equal(lowContrastReport.level, 'critical');
  assert.ok(
    lowContrastReport.message.includes(
      'Низкий контраст: камера может плохо считывать код на матовой бумаге'
    )
  );
});

test('calculateA4LayoutSpec returns 10 business cards, 18 thermal labels, and 6 square stickers', () => {
  assert.equal(calculateA4LayoutSpec('business_card_90x50').totalItems, 10);
  assert.equal(calculateA4LayoutSpec('thermal_58x40').totalItems, 18);
  assert.equal(calculateA4LayoutSpec('square_70x70').totalItems, 6);
});

test('INITIAL_SEED_TEMPLATES includes cosmetics, electronics, and apparel niches', () => {
  assert.equal(INITIAL_SEED_TEMPLATES.length, 3);
  assert.equal(INITIAL_SEED_TEMPLATES[0].nicheTag, 'Косметика');
  assert.equal(INITIAL_SEED_TEMPLATES[1].nicheTag, 'Электроника');
  assert.equal(INITIAL_SEED_TEMPLATES[2].nicheTag, 'Одежда');
});

test('applyPresetToConfig updates badge, title, subtitle, and accentColor from preset', () => {
  const updated = applyPresetToConfig(DEFAULT_CARD_CONFIG, 'support');
  assert.equal(updated.presetId, 'support');
  assert.equal(updated.badge, 'ЗАБОТА 24/7');
  assert.equal(updated.title, 'ВОЗНИК ВОПРОС?');
  assert.equal(updated.subtitle, CONVERSION_PRESETS.support.subtitle);
  assert.equal(updated.accentColor, '#059669');
  assert.equal(updated.brandName, DEFAULT_CARD_CONFIG.brandName);
  assert.equal(updated.formatId, DEFAULT_CARD_CONFIG.formatId);
});

test('sanitizeBrandSlug and buildExportFilename handle Cyrillic and Latin names cleanly', () => {
  assert.equal(sanitizeBrandSlug('LUMIÈRE SKIN'), 'lumiere-skin');
  assert.equal(sanitizeBrandSlug('ЭкоДом Плюс!'), 'ekodom-plyus');
  assert.equal(sanitizeBrandSlug('   '), 'brand');
  assert.equal(buildExportFilename('Уютный Дом', 'png'), 'maket-uyutnyy-dom.png');
  assert.equal(buildExportFilename('Lumina', 'svg'), 'maket-lumina.svg');
});

test('calculatePrintSpecs computes 300 DPI dimensions and 2mm bleed safe zone', () => {
  const specs90x50 = calculatePrintSpecs('business_card_90x50', 300);
  assert.equal(specs90x50.widthMm, 90);
  assert.equal(specs90x50.heightMm, 50);
  assert.equal(specs90x50.safeZoneWidthMm, 86);
  assert.equal(specs90x50.safeZoneHeightMm, 46);
  assert.equal(specs90x50.printWidthPx, 1063);
  assert.equal(specs90x50.printHeightPx, 591);
});

test('computeTitleSizeClass scales down typography for long titles', () => {
  assert.equal(computeTitleSizeClass('ПОДАРОК!', 'business_card_90x50'), 'text-xl leading-tight');
  assert.equal(
    computeTitleSizeClass('ОЧЕНЬ ДЛИННЫЙ ЗАГОЛОВОК ДЛЯ КАРТОЧКИ ТОВАРА', 'business_card_90x50'),
    'text-base leading-tight'
  );
});

test('duplicateTemplateItem clones config and appends copy suffix', () => {
  const original = {
    id: 'tpl-1',
    name: 'Мой шаблон WB',
    createdAt: 1000,
    updatedAt: 1000,
    config: DEFAULT_CARD_CONFIG,
  };
  const copy = duplicateTemplateItem(original, 2000, 'tpl-2');
  assert.equal(copy.id, 'tpl-2');
  assert.equal(copy.name, 'Мой шаблон WB (копия)');
  assert.equal(copy.createdAt, 2000);
  assert.deepEqual(copy.config, original.config);
  assert.notEqual(copy.config, original.config);
});
