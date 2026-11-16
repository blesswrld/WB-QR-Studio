/**
 * ============================================================================
 * ЕДИНЫЙ ФАЙЛ КОНФИГУРАЦИИ И БЕЗОПАСНОСТИ ОКРУЖЕНИЯ (WB-QR Studio)
 * ============================================================================
 *
 * Как подключить боевой режим (Production):
 * 1. Создайте файл `.env` в корне проекта (на основе `.env.example`).
 * 2. Вставьте URL и публичный anon-ключ вашего проекта из панели Supabase:
 *    Project Settings -> API -> Project URL (`VITE_SUPABASE_URL`)
 *    Project Settings -> API -> Project API keys -> anon public (`VITE_SUPABASE_ANON_KEY`)
 * 3. Выполните SQL-миграцию из файла `/supabase/schema.sql` в SQL Editor Supabase.
 * 4. Укажите платежную ссылку вашей кассы (`VITE_PAYMENT_URL`) и ID магазина
 *    ЮKassa (`VITE_YOOKASSA_SHOP_ID`).
 *
 * Режим Demo / Fallback:
 * Если ключи `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` не заданы или
 * содержат плейсхолдеры `YOUR_...`, приложение автоматически включает
 * защищенный локальный режим (`isSupabaseConfigured === false`), в котором
 * регистрация, вход, хранение макетов и тестовое переключение тарифа FREE / PRO
 * работают прямо в браузере без внешних зависимостей.
 */

export interface AppEnvConfig {
  /** URL проекта Supabase (например, https://xyzcompany.supabase.co) */
  VITE_SUPABASE_URL: string;
  /** Публичный анонимный ключ Supabase (безопасен на клиенте при включенном RLS) */
  VITE_SUPABASE_ANON_KEY: string;
  /** Базовый URL платежного шлюза (ЮKassa / Robokassa / CloudPayments / СБП) */
  VITE_PAYMENT_URL: string;
  /** Идентификатор магазина ЮKassa (Shop ID) */
  VITE_YOOKASSA_SHOP_ID: string;
}

function readEnvVar(key: keyof AppEnvConfig, fallback = ''): string {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    if (metaEnv && typeof metaEnv[key] === 'string') {
      return metaEnv[key]!.trim();
    }
  } catch {
    // Fallback for Node test runner environment
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
    return process.env[key]!.trim();
  }
  return fallback;
}

function isPlaceholder(value: string): boolean {
  if (!value) return true;
  const upper = value.toUpperCase();
  return (
    upper.startsWith('YOUR_') ||
    upper.startsWith('MY_') ||
    upper === 'UNDEFINED' ||
    upper === 'NULL'
  );
}

export const ENV: AppEnvConfig = {
  // Вставьте ваш Project URL из Supabase -> Settings -> API
  VITE_SUPABASE_URL: readEnvVar('VITE_SUPABASE_URL', ''),

  // Вставьте ваш anon public ключ из Supabase -> Settings -> API
  VITE_SUPABASE_ANON_KEY: readEnvVar('VITE_SUPABASE_ANON_KEY', ''),

  // Ссылка на платежную форму (ЮKassa / СБП / Robokassa)
  VITE_PAYMENT_URL: readEnvVar(
    'VITE_PAYMENT_URL',
    'https://yoomoney.ru/quickpay/confirm'
  ),

  // Shop ID вашего магазина в ЮKassa
  VITE_YOOKASSA_SHOP_ID: readEnvVar('VITE_YOOKASSA_SHOP_ID', ''),
};

/**
 * Проверяет, заданы ли реальные боевые ключи Supabase.
 * Если возвращает `false` — приложение работает в Demo/Fallback режиме.
 */
export function isSupabaseConfigured(): boolean {
  if (
    isPlaceholder(ENV.VITE_SUPABASE_URL) ||
    isPlaceholder(ENV.VITE_SUPABASE_ANON_KEY)
  ) {
    return false;
  }
  try {
    const parsed = new URL(ENV.VITE_SUPABASE_URL);
    return parsed.protocol === 'https:' && ENV.VITE_SUPABASE_ANON_KEY.length > 20;
  } catch {
    return false;
  }
}

export interface PaymentRedirectParams {
  userId: string;
  email: string;
  billingCycle: 'monthly' | 'annual';
  amountRub: number;
}

/**
 * Формирует безопасную ссылку на оплату тарифа PRO с передачей
 * userId, email, выбранного периода и суммы в query-параметрах.
 */
export function buildPaymentCheckoutUrl(params: PaymentRedirectParams): string {
  const baseUrl = isPlaceholder(ENV.VITE_PAYMENT_URL)
    ? 'https://yoomoney.ru/quickpay/confirm'
    : ENV.VITE_PAYMENT_URL;

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('userId', params.userId);
    url.searchParams.set('email', params.email);
    url.searchParams.set('plan', 'pro');
    url.searchParams.set('cycle', params.billingCycle);
    url.searchParams.set('amount', String(params.amountRub));
    if (!isPlaceholder(ENV.VITE_YOOKASSA_SHOP_ID)) {
      url.searchParams.set('shopId', ENV.VITE_YOOKASSA_SHOP_ID);
    }
    return url.toString();
  } catch {
    const qs = new URLSearchParams({
      userId: params.userId,
      email: params.email,
      plan: 'pro',
      cycle: params.billingCycle,
      amount: String(params.amountRub),
    });
    return `https://yoomoney.ru/quickpay/confirm?${qs.toString()}`;
  }
}
