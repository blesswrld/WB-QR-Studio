import React from 'react';
import { CardConfig, CardSide } from '../types/studio';
import { calculateA4LayoutSpec, CARD_FORMATS } from '../utils/studioLogic';
import { CardCanvas } from './CardCanvas';

interface A4PrintSheetProps {
  config: CardConfig;
  isPro: boolean;
  side: CardSide;
  sheetRef: React.RefObject<HTMLDivElement | null>;
}

export const A4PrintSheet: React.FC<A4PrintSheetProps> = ({
  config,
  isPro,
  side,
  sheetRef,
}) => {
  // Block A4 print sheet DOM rendering if not PRO
  if (!isPro) return null;

  const a4Spec = calculateA4LayoutSpec(config.formatId);
  const format = CARD_FORMATS[config.formatId];
  const items = Array.from({ length: a4Spec.totalItems }, (_, i) => i);

  return (
    <div className="sr-only" aria-hidden="true">
      <div
        ref={sheetRef}
        data-testid="a4-print-sheet-surface"
        style={{
          width: '794px',
          height: '1123px',
          backgroundColor: '#FFFFFF',
          color: '#09090B',
        }}
        className="flex flex-col justify-between p-8 bg-white select-none"
      >
        {/* Top Sheet Technical Specification Header */}
        <div className="flex items-center justify-between border-b border-zinc-300 pb-2 text-[10px] font-mono text-zinc-600">
          <span>
            WB-QR STUDIO PRO • ПЕЧАТНЫЙ ЛИСТ А4 (210 × 297 ММ) • 300 DPI
          </span>
          <span>
            {format.name} • {a4Spec.totalItems} шт. ({side === 'front' ? 'Лицевая сторона' : 'Оборотная сторона'})
          </span>
        </div>

        {/* Grid of Cards with Corner Crop Marks */}
        <div
          style={{
            gridTemplateColumns: `repeat(${a4Spec.cols}, minmax(0, 1fr))`,
          }}
          className="my-auto grid gap-3.5 items-center justify-items-center"
        >
          {items.map((idx) => (
            <div
              key={idx}
              className="relative w-full p-1.5 border border-dashed border-zinc-300"
            >
              {/* Corner Crop Marks */}
              <span className="pointer-events-none absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-zinc-900" />
              <span className="pointer-events-none absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-zinc-900" />
              <span className="pointer-events-none absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-zinc-900" />
              <span className="pointer-events-none absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-zinc-900" />

              <CardCanvas
                config={config}
                isPro={isPro}
                side={side}
                isExporting={true}
                scale="a4_cell"
              />
            </div>
          ))}
        </div>

        {/* Bottom Sheet Cut Guide Footer */}
        <div className="flex items-center justify-between border-t border-zinc-300 pt-2 text-[9px] font-mono text-zinc-500">
          <span>Бренд: {config.brandName || 'Без названия'}</span>
          <span>Масштаб при печати: 100% (Без полей / Реальный размер) • Метки реза по углам</span>
        </div>
      </div>
    </div>
  );
};
