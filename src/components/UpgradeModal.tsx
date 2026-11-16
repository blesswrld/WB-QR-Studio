import React, { useState } from 'react';
import {
  Check,
  Crown,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { BillingCycle, ProFeatureKey } from '../types/studio';
import { checkFeatureAccess, PRICING_PLANS } from '../utils/studioLogic';

interface UpgradeModalProps {
  isOpen: boolean;
  triggeredFeature?: ProFeatureKey | null;
  onClose: () => void;
  onProceedToCheckout: (cycle: BillingCycle) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  triggeredFeature,
  onClose,
  onProceedToCheckout,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  if (!isOpen) return null;

  const selectedPlan = PRICING_PLANS[billingCycle];
  const featureInfo = triggeredFeature
    ? checkFeatureAccess('free', triggeredFeature)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-800 bg-zinc-950/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
              <Crown className="w-4 h-4 shrink-0" />
              <span>Тарифы WB-QR Studio для селлеров</span>
            </div>
            <h2
              id="upgrade-modal-title"
              className="text-xl font-extrabold text-zinc-100 mt-1"
            >
              Перейдите на PRO для безлимитной типографии 300 DPI
            </h2>
            {featureInfo && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>{featureInfo.title}:</strong> {featureInfo.description}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно тарифов"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Switcher: Месяц / Год (выгода 30%) */}
        <div className="px-6 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-zinc-300">
            Выберите период подписки:
          </span>

          <div
            role="group"
            aria-label="Период оплаты"
            className="inline-flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Месяц (590 ₽/мес)
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Год — 4 900 ₽ (выгода 30%)
            </button>
          </div>
        </div>

        {/* Plan Comparison Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FREE Card */}
          <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-200">
                  Тариф FREE
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Для старта
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-zinc-100">
                0 ₽ <span className="text-xs font-normal text-zinc-400">/ навсегда</span>
              </div>

              <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>1 формат: Евровизитка 90 × 50 мм</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Стандартный экспорт PNG без лого внутри QR</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>До 2 сохранённых макетов в профиле</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Водяной знак «Сделано в WB-QR» в углу</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full py-2 px-3 text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Остаться на FREE
            </button>
          </div>

          {/* PRO Card */}
          <div className="p-5 rounded-xl bg-zinc-950 border-2 border-violet-500 flex flex-col justify-between relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-bold text-violet-300">
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Тариф PRO</span>
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  {selectedPlan.monthlyEquivalentLabel}
                </span>
              </div>

              <div className="text-2xl font-extrabold font-mono text-zinc-100">
                {selectedPlan.priceLabel}
              </div>

              <ul className="space-y-2 text-xs text-zinc-200 pt-2 border-t border-zinc-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Все форматы: 90×50, термо 58×40 и стикер 70×70 мм</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Встраивание логотипа бренда в центр QR-кода</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Экспорт листа А4 с метками реза и векторный SVG</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>UTM-генератор, безлимит макетов и без водяного знака</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onProceedToCheckout(billingCycle)}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Оплатить картой РФ / СБП</span>
            </button>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="px-6 py-3.5 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Безопасная оплата через ЮKassa / СБП с мгновенной активацией</span>
          </span>
          <span className="font-mono">Чек 54-ФЗ</span>
        </div>
      </div>
    </div>
  );
};
