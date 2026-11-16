import React, { useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  Crown,
  HardDrive,
  KeyRound,
  LogOut,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../config/env';
import { updateAccountPassword } from '../services/authAndStorage';
import { UserPlan, UserProfile } from '../types/studio';
import { FREE_PLAN_MAX_TEMPLATES } from '../utils/studioLogic';

interface AccountModalProps {
  isOpen: boolean;
  user: UserProfile;
  templatesCount: number;
  onClose: () => void;
  onOpenUpgrade: () => void;
  onRequestLogout: () => void;
  onToggleDemoPlan: (targetPlan: UserPlan) => Promise<void>;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  user,
  templatesCount,
  onClose,
  onOpenUpgrade,
  onRequestLogout,
  onToggleDemoPlan,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  if (!isOpen) return null;

  const isLiveSupabase = isSupabaseConfigured();
  const isPro = user.plan === 'pro';

  const formattedProUntil = user.proUntil
    ? new Date(user.proUntil).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Активен без ограничений';

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdMessage(null);
    setIsUpdatingPwd(true);
    try {
      const res = await updateAccountPassword(newPassword);
      if (res.error) {
        setPwdError(res.error);
      } else {
        setPwdMessage('Пароль успешно обновлён');
        setNewPassword('');
      }
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col justify-between overflow-y-auto shadow-2xl">
        <div className="divide-y divide-zinc-800">
          {/* Top Header */}
          <div className="flex items-center justify-between p-5 bg-zinc-950/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 font-bold text-sm">
                {user.email.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2
                  id="account-modal-title"
                  className="text-base font-extrabold text-zinc-100"
                >
                  Личный кабинет селлера
                </h2>
                <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть личный кабинет"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Subscription Management Block */}
          <section className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Управление подпиской
              </h3>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                  isPro
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
              >
                {isPro ? 'PRO ✨' : 'FREE'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Текущий тариф:</span>
                <span className="font-bold text-zinc-100">
                  {isPro ? 'PRO (Полный доступ 300 DPI)' : 'FREE (Базовый)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Действует до:</span>
                <span className="font-mono text-zinc-200">
                  {isPro ? formattedProUntil : 'Бессрочно (с ограничениями)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Лимит макетов:</span>
                <span className="font-mono text-zinc-200">
                  {isPro
                    ? `${templatesCount} / Безлимит`
                    : `${templatesCount} из ${FREE_PLAN_MAX_TEMPLATES} макетов`}
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenUpgrade}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
              >
                <Crown className="w-4 h-4 shrink-0" />
                <span>{isPro ? 'Продлить подписку PRO' : 'Продлить / Перейти на PRO'}</span>
              </button>
            </div>

            {/* Developer Demo Switch (Only visible when live Supabase keys are not set) */}
            {!isLiveSupabase && (
              <div
                data-testid="developer-pro-toggle-panel"
                className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Wrench className="w-3.5 h-3.5 shrink-0" />
                    <span>Песочница разработчика (Demo)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    env.ts fallback
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-snug">
                  Боевые ключи Supabase не заданы. Вы можете в 1 клик протестировать переключение между FREE и PRO:
                </p>
                <button
                  type="button"
                  onClick={() => onToggleDemoPlan(isPro ? 'free' : 'pro')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isPro
                      ? 'Тестовый режим: Вернуть тариф FREE'
                      : 'Тестовый режим: Активировать PRO'}
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* 2. Profile & Security Section */}
          <section className="p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Профиль и синхронизация
            </h3>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>ID аккаунта:</span>
                </span>
                <span className="font-mono text-zinc-200">{user.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  {isLiveSupabase ? (
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <HardDrive className="w-3.5 h-3.5 text-violet-400" />
                  )}
                  <span>Хранилище макетов:</span>
                </span>
                <span className="font-mono text-zinc-200">
                  {isLiveSupabase ? 'Supabase Cloud (RLS)' : 'Локальное (localStorage)'}
                </span>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-2 pt-1">
              <label
                htmlFor="new-password-input"
                className="block text-xs font-medium text-zinc-300"
              >
                Смена пароля аккаунта
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="new-password-input"
                    type="password"
                    minLength={6}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Новый пароль (от 6 симв.)"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingPwd}
                  className="px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  Обновить
                </button>
              </div>
              {pwdMessage && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{pwdMessage}</span>
                </p>
              )}
              {pwdError && <p className="text-xs text-rose-400">{pwdError}</p>}
            </form>
          </section>
        </div>

        {/* Bottom Logout Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Сессия защищена контрольной подписью и RLS-политиками</span>
          </div>

          <button
            type="button"
            onClick={onRequestLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
};
