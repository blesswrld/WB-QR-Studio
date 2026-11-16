import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CardConfig, CardSide } from '../types/studio';
import {
  CARD_FONTS,
  CARD_FORMATS,
  CARD_THEMES,
  calculatePrintSpecs,
  computeTitleSizeClass,
  enforcePlanConstraintsOnConfig,
  validateTargetUrl,
} from '../utils/studioLogic';

interface CardCanvasProps {
  config: CardConfig;
  isPro?: boolean;
  side?: CardSide;
  isExporting?: boolean;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  qrOnlyRef?: React.RefObject<HTMLDivElement | null>;
  scale?: 'full' | 'mini' | 'a4_cell';
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  config,
  isPro = false,
  side = 'front',
  isExporting = false,
  cardRef,
  qrOnlyRef,
  scale = 'full',
}) => {
  // Enforce plan entitlements at the rendering level to prevent DevTools bypass
  const effectiveConfig =
    scale === 'mini' ? config : enforcePlanConstraintsOnConfig(config, isPro);

  const format = CARD_FORMATS[effectiveConfig.formatId];
  const theme = CARD_THEMES[effectiveConfig.themeId];
  const fontSpec =
    CARD_FONTS[effectiveConfig.fontFamily || 'manrope'] || CARD_FONTS.manrope;
  const printSpecs = calculatePrintSpecs(effectiveConfig.formatId, 300);
  const urlCheck = validateTargetUrl(effectiveConfig.targetUrl);
  const qrValue = urlCheck.normalizedUrl || 'https://t.me/wb_seller_bot';

  const isSquare = effectiveConfig.formatId === 'square_70x70';
  const isThermal = effectiveConfig.formatId === 'thermal_58x40';
  const isMini = scale === 'mini' || scale === 'a4_cell';

  const qrSize = isMini
    ? isSquare
      ? 54
      : 58
    : isSquare
    ? 124
    : isThermal
    ? 114
    : 128;

  const logoSizeInQr = Math.round(qrSize * 0.2);
  const titleSizeClass = computeTitleSizeClass(
    effectiveConfig.title,
    effectiveConfig.formatId
  );

  const isSplitStyle = effectiveConfig.layoutStyle === 'split_qr_block';
  const isFrameStyle = effectiveConfig.layoutStyle === 'frame_accent';
  const isStripeStyle = effectiveConfig.layoutStyle === 'sidebar_stripe';

  const qrRadiusPx = isMini
    ? Math.max(4, Math.round((effectiveConfig.qrCornerRadius ?? 12) * 0.55))
    : effectiveConfig.qrCornerRadius ?? 12;

  const qrForeground = effectiveConfig.qrFgColor || '#09090B';
  const steps = effectiveConfig.backSideSteps || [
    'Оставьте отзыв о покупке в приложении маркетплейса',
    'Наведите камеру смартфона на QR-код справа',
    'Получите бонус или консультацию в нашем боте',
  ];

  const canEmbedLogo =
    isPro && Boolean(effectiveConfig.logoDataUrl) && effectiveConfig.embedLogoInQr;

  return (
    <>
      <div
        ref={cardRef}
        data-testid={isMini ? undefined : 'printable-card-surface'}
        style={{
          width: isMini ? '100%' : `${format.previewWidthPx}px`,
          backgroundColor: theme.bgHex,
          color: theme.textPrimaryHex,
          fontFamily: fontSpec.cssFamily,
        }}
        className={`relative overflow-hidden select-none transition-all duration-200 ${
          format.aspectClass
        } ${
          scale === 'mini'
            ? 'rounded-lg text-[10px]'
            : scale === 'a4_cell'
            ? 'rounded-none text-[10px]'
            : 'shadow-2xl'
        }`}
      >
        {/* Style 1: Sidebar Stripe */}
        {isStripeStyle && (
          <div
            style={{ backgroundColor: effectiveConfig.accentColor }}
            className={`absolute left-0 top-0 bottom-0 ${isMini ? 'w-2' : 'w-3.5'} z-10`}
          />
        )}

        {/* Style 2: Frame Accent */}
        {isFrameStyle && (
          <div
            style={{
              borderColor: effectiveConfig.accentColor,
              borderRadius: `${Math.max(4, qrRadiusPx - 2)}px`,
            }}
            className={`pointer-events-none absolute ${
              isMini ? 'inset-2 border-2' : 'inset-3.5 border-[3px]'
            } z-10`}
          />
        )}

        {/* Main Card Interior Layout */}
        <div
          className={`relative z-0 flex h-full w-full ${
            isSquare && !isSplitStyle ? 'flex-col justify-between' : 'flex-row items-stretch'
          } ${
            isStripeStyle
              ? isMini
                ? 'pl-2.5'
                : 'pl-3.5'
              : isFrameStyle
              ? isMini
                ? 'p-2.5'
                : 'p-3.5'
              : ''
          }`}
        >
          {/* Left / Top Content Section */}
          <div
            className={`flex flex-1 flex-col justify-between min-w-0 ${
              isMini
                ? 'p-3'
                : isThermal
                ? 'p-5 pr-3'
                : isSquare
                ? 'p-6 pb-3'
                : 'p-6 pr-5'
            }`}
          >
            {/* Header Row: Brand Name + Logo + Badge */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {effectiveConfig.logoDataUrl && (
                  <img
                    src={effectiveConfig.logoDataUrl}
                    alt={effectiveConfig.brandName || 'Логотип бренда'}
                    referrerPolicy="no-referrer"
                    className={`${
                      isMini ? 'h-4 w-4' : isThermal ? 'h-6 w-6' : 'h-7 w-7'
                    } rounded object-contain shrink-0`}
                  />
                )}
                {effectiveConfig.brandName.trim() && (
                  <span
                    style={{ color: theme.textSecondaryHex }}
                    className={`font-extrabold tracking-wider uppercase truncate ${
                      isMini ? 'text-[8px]' : isThermal ? 'text-[10px]' : 'text-xs'
                    }`}
                  >
                    {effectiveConfig.brandName}
                  </span>
                )}
              </div>

              {effectiveConfig.badge.trim() && (
                <span
                  style={{
                    backgroundColor: effectiveConfig.accentColor,
                    color: '#FFFFFF',
                    borderRadius: `${Math.min(8, Math.max(3, Math.round(qrRadiusPx / 2)))}px`,
                  }}
                  className={`font-bold uppercase tracking-wider shrink-0 ${
                    isMini
                      ? 'px-1.5 py-0.5 text-[7px]'
                      : isThermal
                      ? 'px-2 py-0.5 text-[9px]'
                      : 'px-2.5 py-1 text-[10px]'
                  }`}
                >
                  {side === 'back' ? 'ИНСТРУКЦИЯ' : effectiveConfig.badge}
                </span>
              )}
            </div>

            {/* Center Copy: Front Hook OR Back 3-Step Guide */}
            {side === 'front' ? (
              <div className="my-auto py-1 min-w-0">
                <h2
                  style={{ color: theme.textPrimaryHex }}
                  className={`font-extrabold tracking-tight line-clamp-2 break-words ${
                    isMini ? 'text-xs leading-tight' : titleSizeClass
                  }`}
                >
                  {effectiveConfig.title || 'ЗАГОЛОВОК ВКЛАДЫША'}
                </h2>
                <p
                  style={{ color: theme.textSecondaryHex }}
                  className={`mt-1 font-medium line-clamp-3 break-words ${
                    isMini
                      ? 'text-[8px] leading-snug'
                      : isThermal
                      ? 'text-xs leading-snug'
                      : 'text-[13px] leading-relaxed'
                  }`}
                >
                  {effectiveConfig.subtitle ||
                    'Добавьте описание бонуса или инструкции для покупателя'}
                </p>
              </div>
            ) : (
              <div className="my-auto py-1 min-w-0 space-y-1.5">
                <h2
                  style={{ color: theme.textPrimaryHex }}
                  className={`font-extrabold uppercase tracking-tight line-clamp-2 leading-tight ${
                    scale === 'a4_cell'
                      ? 'text-[8px]'
                      : isMini
                      ? 'text-[9px]'
                      : isThermal
                      ? 'text-[11px]'
                      : 'text-xs'
                  }`}
                >
                  {effectiveConfig.backSideTitle || 'КАК ПОЛУЧИТЬ БОНУС В 3 ШАГА'}
                </h2>
                <ol className={isMini ? 'space-y-1' : 'space-y-1.5'}>
                  {steps.map((stepText, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 min-w-0">
                      <span
                        style={{
                          backgroundColor: effectiveConfig.accentColor,
                          color: '#FFFFFF',
                        }}
                        className={`font-mono font-bold rounded-full flex items-center justify-center shrink-0 ${
                          isMini
                            ? 'w-3 h-3 text-[6.5px] mt-0.5'
                            : 'w-4 h-4 text-[10px] mt-0.5'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        style={{ color: theme.textSecondaryHex }}
                        className={`font-medium line-clamp-2 break-words ${
                          scale === 'a4_cell'
                            ? 'text-[6.5px] leading-tight'
                            : isMini
                            ? 'text-[7px] leading-tight'
                            : isThermal
                            ? 'text-[10px] leading-snug'
                            : 'text-[11px] leading-snug'
                        }`}
                      >
                        {stepText}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Bottom Footer Accent Line */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{ backgroundColor: effectiveConfig.accentColor }}
                  className={`${isMini ? 'h-1 w-5' : 'h-1.5 w-8'} rounded-full shrink-0`}
                />
                <span
                  style={{ color: theme.textSecondaryHex }}
                  className={`font-semibold truncate ${
                    isMini ? 'text-[7px]' : 'text-[10px]'
                  }`}
                >
                  {side === 'back' ? 'Поддержка клиентов 24/7' : 'Спасибо за покупку!'}
                </span>
              </div>
            </div>
          </div>

          {/* Right / Split QR Code Block */}
          <div
            style={{
              backgroundColor: isSplitStyle ? effectiveConfig.accentColor : 'transparent',
              borderLeft:
                !isSplitStyle && !(isSquare && !isSplitStyle)
                  ? `1px dashed ${theme.borderHex}`
                  : undefined,
              borderTop:
                isSquare && !isSplitStyle
                  ? `1px dashed ${theme.borderHex}`
                  : undefined,
            }}
            className={`relative flex items-center justify-center shrink-0 ${
              isSplitStyle
                ? isMini
                  ? 'flex-col w-[38%] p-2.5'
                  : isSquare
                  ? 'flex-col w-[42%] p-5'
                  : isThermal
                  ? 'flex-col w-[40%] p-4'
                  : 'flex-col w-[38%] p-5'
                : isSquare
                ? isMini
                  ? 'flex-row justify-between px-3 py-2'
                  : 'flex-row justify-between px-6 py-3.5'
                : isMini
                ? 'flex-col w-[36%] p-2.5'
                : isThermal
                ? 'flex-col w-[38%] p-4'
                : 'flex-col w-[36%] p-5'
            }`}
          >
            <div
              style={{
                borderColor: isSplitStyle ? 'rgba(255,255,255,0.22)' : theme.borderHex,
                borderRadius: `${qrRadiusPx}px`,
              }}
              className={`bg-white flex items-center justify-center shadow-xs border shrink-0 ${
                isMini ? 'p-1' : 'p-2.5'
              }`}
            >
              <QRCodeSVG
                value={qrValue}
                size={qrSize}
                level="H"
                bgColor="#FFFFFF"
                fgColor={qrForeground}
                marginSize={0}
                imageSettings={
                  canEmbedLogo && effectiveConfig.logoDataUrl
                    ? {
                        src: effectiveConfig.logoDataUrl,
                        height: logoSizeInQr,
                        width: logoSizeInQr,
                        excavate: true,
                      }
                    : undefined
                }
              />
            </div>

            {effectiveConfig.qrCaption.trim() && (
              <div
                style={{
                  color: isSplitStyle ? '#FFFFFF' : theme.textPrimaryHex,
                }}
                className={`font-bold tracking-wide leading-tight line-clamp-2 ${
                  isSquare && !isSplitStyle
                    ? 'ml-3.5 text-left flex-1'
                    : 'mt-2 text-center'
                } ${isMini ? 'text-[7px]' : isThermal ? 'text-[10px]' : 'text-[11px]'}`}
              >
                {effectiveConfig.qrCaption}
              </div>
            )}
          </div>
        </div>

        {/* FREE Plan Corner Watermark ("Сделано в WB-QR") - Included in preview & export unless PRO */}
        {!isPro && scale === 'full' && (
          <div
            data-testid="free-tier-watermark"
            style={{
              color: isSplitStyle ? 'rgba(255,255,255,0.75)' : theme.textSecondaryHex,
            }}
            className="pointer-events-none absolute bottom-1.5 right-2.5 z-20 text-[8px] font-mono font-medium opacity-75 select-none"
          >
            Сделано в WB-QR
          </div>
        )}

        {/* Bleed / Cut Line Overlay (2mm Safe Margin) - Hidden on Export */}
        {effectiveConfig.showBleedLine && !isExporting && !isMini && (
          <div
            data-testid="bleed-cut-overlay"
            data-export-ignore="true"
            style={{
              left: `${printSpecs.bleedInsetPercentX}%`,
              right: `${printSpecs.bleedInsetPercentX}%`,
              top: `${printSpecs.bleedInsetPercentY}%`,
              bottom: `${printSpecs.bleedInsetPercentY}%`,
            }}
            className="pointer-events-none absolute z-30 border border-dashed border-rose-500/80 rounded-[2px]"
          >
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-rose-600/95 text-white text-[9px] font-mono px-1.5 py-0.5 rounded leading-none tracking-tight shadow-xs whitespace-nowrap">
              Линия реза • Вылет 2 мм ({printSpecs.safeZoneWidthMm}×{printSpecs.safeZoneHeightMm} мм)
            </span>
          </div>
        )}
      </div>

      {/* Standalone High-Resolution QR Container for "Только QR-код (PNG)" Export */}
      {qrOnlyRef && !isMini && (
        <div className="sr-only" aria-hidden="true">
          <div
            ref={qrOnlyRef}
            style={{
              width: '512px',
              height: '512px',
              backgroundColor: '#FFFFFF',
              borderRadius: `${Math.round((effectiveConfig.qrCornerRadius ?? 12) * 2)}px`,
            }}
            className="flex flex-col items-center justify-center p-8 bg-white"
          >
            <QRCodeSVG
              value={qrValue}
              size={420}
              level="H"
              bgColor="#FFFFFF"
              fgColor={qrForeground}
              marginSize={1}
              imageSettings={
                canEmbedLogo && effectiveConfig.logoDataUrl
                  ? {
                      src: effectiveConfig.logoDataUrl,
                      height: 84,
                      width: 84,
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
    </>
  );
};
