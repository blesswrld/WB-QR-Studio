import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../config/env';
import {
  registerWithEmailPassword,
  signInWithEmailPassword,
  signInWithMagicLink,
} from '../services/authAndStorage';
import { UserProfile } from '../types/studio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: UserProfile, statusMessage: string) => void;
}

type AuthTabMode = 'login' | 'register' | 'magic_link';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<AuthTabMode>('login');
  const [email, setEmail] = useState('seller@wb-brand.ru');
  const [password, setPassword] = useState('wbstudio2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLiveSupabase = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'magic_link') {
        const res = await signInWithMagicLink(email);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          onAuthenticated(res.user, res.message || 'Вход выполнен');
          onClose();
        } else if (res.message) {
          setInfoMessage(res.message);
        }
        return;
      }

      if (mode === 'register') {
        const res = await registerWithEmailPassword(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          onAuthenticated(res.user, `Аккаунт ${res.user.email} успешно создан`);
          onClose();
        }
        return;
      }

      const res = await signInWithEmailPassword(email, password);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        onAuthenticated(res.user, `Добро пожаловать, ${res.user.email}`);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div>
            <h2
              id="auth-modal-title"
              className="text-base font-extrabold text-zinc-100"
            >
              Вход и регистрация в WB-QR Studio
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Синхронизация макетов и управление подпиской селлера
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно авторизации"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-4">
          <div
            role="tablist"
            aria-label="Способ авторизации"
            className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Регистрация
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'magic_link'}
              onClick={() => {
                setMode('magic_link');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                mode === 'magic_link'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Magic Link
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="auth-email-input"
              className="block text-xs font-medium text-zinc-300 mb-1"
            >
              Рабочий Email селлера
            </label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@wb-brand.ru"
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {mode !== 'magic_link' && (
            <div>
              <label
                htmlFor="auth-password-input"
                className="block text-xs font-medium text-zinc-300 mb-1"
              >
                Пароль (минимум 6 символов)
              </label>
              <div className="relative">
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div
              role="status"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : mode === 'magic_link' ? (
              <Sparkles className="w-4 h-4 shrink-0" />
            ) : (
              <UserCheck className="w-4 h-4 shrink-0" />
            )}
            <span>
              {mode === 'login'
                ? 'Войти в личный кабинет'
                : mode === 'register'
                ? 'Создать аккаунт селлера'
                : 'Отправить Magic Link на почту'}
            </span>
          </button>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            {isLiveSupabase ? (
              <span>
                Активно прямое облачное подключение к <strong>Supabase Auth</strong> с защитой RLS.
              </span>
            ) : (
              <span>
                <strong>Demo / Fallback режим:</strong> ключи Supabase ещё не заданы в{' '}
                <code className="text-zinc-300">src/config/env.ts</code>, поэтому вход работает мгновенно через защищённую локальную сессию браузера.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
