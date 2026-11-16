import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';

export interface ConfirmReceiptItem {
  label: string;
  value: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'checkout';
  receiptItems?: ConfirmReceiptItem[];
  requireAgreement?: boolean;
  agreementLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Отмена',
  variant = 'warning',
  receiptItems,
  requireAgreement = false,
  agreementLabel = 'Я согласен с условиями публичной оферты и правилами рекуррентных платежей',
  secondaryActionLabel,
  onSecondaryAction,
  onConfirm,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    if (isSubmitting) return;
    if (requireAgreement && !agreed) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                variant === 'danger'
                  ? 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                  : variant === 'checkout'
                  ? 'bg-violet-950/60 border-violet-700/60 text-violet-400'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
              }`}
            >
              {variant === 'checkout' ? (
                <CreditCard className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-base font-bold text-zinc-100 leading-snug"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            aria-label="Закрыть окно подтверждения"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>

          {receiptItems && receiptItems.length > 0 && (
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-1 border-b border-zinc-800">
                Параметры заказа (чек)
              </div>
              {receiptItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="font-mono font-semibold text-zinc-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {requireAgreement && (
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-violet-600 shrink-0"
              />
              <span className="text-xs text-zinc-300 leading-snug">
                {agreementLabel}
              </span>
            </label>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-zinc-950/70 border-t border-zinc-800 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onSecondaryAction}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {secondaryActionLabel}
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting || (requireAgreement && !agreed)}
            onClick={handleConfirmClick}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500'
                : variant === 'checkout'
                ? 'bg-violet-600 hover:bg-violet-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
