import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from '../config/env';
import { SavedTemplate, UserPlan, UserProfile } from '../types/studio';
import { INITIAL_SEED_TEMPLATES } from '../utils/studioLogic';

const DEMO_SESSION_KEY = 'wb_qr_studio_auth_session_v1';
const DEMO_USERS_KEY = 'wb_qr_studio_mock_users_v1';
const LOCAL_TEMPLATES_KEY = 'wb_qr_studio_templates_v2';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      ENV.VITE_SUPABASE_URL,
      ENV.VITE_SUPABASE_ANON_KEY
    );
  }
  return supabaseInstance;
}

interface StoredDemoUser {
  id: string;
  email: string;
  passwordHash: string;
  plan: UserPlan;
  proUntil: string | null;
  createdAt: string;
  signature: string;
}

function computeDemoSignature(id: string, email: string, plan: UserPlan): string {
  const raw = `${id}::${email.toLowerCase()}::${plan}::wb_qr_salt_2026`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function simpleHashPassword(password: string): string {
  return computeDemoSignature('pwd', password, 'free');
}

function readDemoUsers(): Record<string, StoredDemoUser> {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore storage read error
  }
  return {};
}

function writeDemoUsers(users: Record<string, StoredDemoUser>): void {
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage quota error
  }
}

function sanitizeStoredDemoProfile(record: StoredDemoUser): UserProfile {
  const expectedSig = computeDemoSignature(record.id, record.email, record.plan);
  const verifiedPlan: UserPlan = record.signature === expectedSig ? record.plan : 'free';
  return {
    id: record.id,
    email: record.email,
    plan: verifiedPlan,
    proUntil: verifiedPlan === 'pro' ? record.proUntil : null,
    createdAt: record.createdAt,
  };
}

export async function getCurrentSessionUser(): Promise<UserProfile | null> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    const { data: profileRow } = await sb
      .from('profiles')
      .select('id, email, plan, pro_until, created_at')
      .eq('id', data.user.id)
      .single();

    const plan: UserPlan = profileRow?.plan === 'pro' ? 'pro' : 'free';
    return {
      id: data.user.id,
      email: data.user.email || profileRow?.email || '',
      plan,
      proUntil: profileRow?.pro_until || null,
      createdAt: profileRow?.created_at || data.user.created_at,
    };
  }

  // Demo / Fallback mode
  try {
    const rawSession = localStorage.getItem(DEMO_SESSION_KEY);
    if (!rawSession) return null;
    const parsed = JSON.parse(rawSession) as StoredDemoUser;
    if (!parsed?.id || !parsed?.email) return null;
    return sanitizeStoredDemoProfile(parsed);
  } catch {
    return null;
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: 'Введите корректный Email адрес' };
  }
  if (password.length < 6) {
    return { error: 'Пароль должен содержать не менее 6 символов' };
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    const user = await getCurrentSessionUser();
    return { user: user || undefined };
  }

  // Demo / Fallback mode: sign in or auto-create if first time in demo
  await new Promise((r) => setTimeout(r, 220));
  const users = readDemoUsers();
  const existing = users[cleanEmail];
  const pwdHash = simpleHashPassword(password);

  if (existing) {
    if (existing.passwordHash !== pwdHash) {
      return { error: 'Неверный пароль для указанного Email' };
    }
    const profile = sanitizeStoredDemoProfile(existing);
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(existing));
    return { user: profile };
  }

  // First login in demo creates account automatically for smooth testing
  const id = `usr-${Date.now().toString(36)}`;
  const nowIso = new Date().toISOString();
  const record: StoredDemoUser = {
    id,
    email: cleanEmail,
    passwordHash: pwdHash,
    plan: 'free',
    proUntil: null,
    createdAt: nowIso,
    signature: computeDemoSignature(id, cleanEmail, 'free'),
  };
  users[cleanEmail] = record;
  writeDemoUsers(users);
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(record));
  return { user: sanitizeStoredDemoProfile(record) };
}

export async function registerWithEmailPassword(
  email: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: 'Введите корректный Email адрес' };
  }
  if (password.length < 6) {
    return { error: 'Пароль должен содержать не менее 6 символов' };
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.signUp({
      email: cleanEmail,
      password,
    });
    if (error) {
      return { error: error.message };
    }
    const user = await getCurrentSessionUser();
    return { user: user || undefined };
  }

  await new Promise((r) => setTimeout(r, 240));
  const users = readDemoUsers();
  const id = users[cleanEmail]?.id || `usr-${Date.now().toString(36)}`;
  const nowIso = new Date().toISOString();
  const record: StoredDemoUser = {
    id,
    email: cleanEmail,
    passwordHash: simpleHashPassword(password),
    plan: 'free',
    proUntil: null,
    createdAt: nowIso,
    signature: computeDemoSignature(id, cleanEmail, 'free'),
  };
  users[cleanEmail] = record;
  writeDemoUsers(users);
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(record));
  return { user: sanitizeStoredDemoProfile(record) };
}

export async function signInWithMagicLink(
  email: string
): Promise<{ user?: UserProfile; message?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: 'Введите корректный Email для отправки Magic Link' };
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.signInWithOtp({ email: cleanEmail });
    if (error) {
      return { error: error.message };
    }
    return {
      message: `Ссылка для входа отправлена на ${cleanEmail}. Проверьте почту.`,
    };
  }

  // In Demo/Fallback mode, Magic Link signs the user in immediately after a short simulated delay
  await new Promise((r) => setTimeout(r, 250));
  const users = readDemoUsers();
  const existing = users[cleanEmail];
  if (existing) {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(existing));
    return {
      user: sanitizeStoredDemoProfile(existing),
      message: 'Вход по Magic Link выполнен (Demo-режим)',
    };
  }

  const id = `usr-${Date.now().toString(36)}`;
  const nowIso = new Date().toISOString();
  const record: StoredDemoUser = {
    id,
    email: cleanEmail,
    passwordHash: simpleHashPassword('magic-link-default'),
    plan: 'free',
    proUntil: null,
    createdAt: nowIso,
    signature: computeDemoSignature(id, cleanEmail, 'free'),
  };
  users[cleanEmail] = record;
  writeDemoUsers(users);
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(record));
  return {
    user: sanitizeStoredDemoProfile(record),
    message: 'Вход по Magic Link выполнен (Demo-режим)',
  };
}

export async function updateAccountPassword(
  newPassword: string
): Promise<{ error?: string }> {
  if (newPassword.length < 6) {
    return { error: 'Новый пароль должен содержать минимум 6 символов' };
  }

  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  }

  await new Promise((r) => setTimeout(r, 180));
  try {
    const rawSession = localStorage.getItem(DEMO_SESSION_KEY);
    if (!rawSession) return { error: 'Сессия не найдена' };
    const current = JSON.parse(rawSession) as StoredDemoUser;
    current.passwordHash = simpleHashPassword(newPassword);
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(current));
    const users = readDemoUsers();
    users[current.email] = current;
    writeDemoUsers(users);
    return {};
  } catch {
    return { error: 'Не удалось обновить пароль в локальном хранилище' };
  }
}

export async function signOutAccount(): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    await sb.auth.signOut();
  }
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Переключение тарифа FREE / PRO в Demo/Fallback режиме (для тестирования).
 * В боевом режиме Supabase тариф меняется только серверным вебхуком (service_role).
 */
export async function setDemoSubscriptionPlan(
  user: UserProfile,
  targetPlan: UserPlan,
  durationDays = 30
): Promise<UserProfile> {
  if (isSupabaseConfigured()) {
    return user;
  }

  const proUntil =
    targetPlan === 'pro'
      ? new Date(Date.now() + durationDays * 86400 * 1000).toISOString()
      : null;

  const users = readDemoUsers();
  const existing = users[user.email];
  const record: StoredDemoUser = {
    id: user.id,
    email: user.email,
    passwordHash: existing?.passwordHash || simpleHashPassword('demo-pass'),
    plan: targetPlan,
    proUntil,
    createdAt: user.createdAt,
    signature: computeDemoSignature(user.id, user.email, targetPlan),
  };
  users[user.email] = record;
  writeDemoUsers(users);
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(record));

  return sanitizeStoredDemoProfile(record);
}

/**
 * Загрузка сохранённых макетов из таблицы `layouts` Supabase (при наличии ключей)
 * или из локального хранилища.
 */
export async function fetchUserTemplates(
  user: UserProfile | null
): Promise<SavedTemplate[]> {
  const sb = getSupabaseClient();
  if (sb && user) {
    const { data, error } = await sb
      .from('layouts')
      .select('id, name, niche_tag, config, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        nicheTag: row.niche_tag ? String(row.niche_tag) : undefined,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
        config: row.config,
      }));
    }
  }

  try {
    const saved = localStorage.getItem(LOCAL_TEMPLATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return INITIAL_SEED_TEMPLATES;
}

export async function saveTemplateToCloudOrLocal(
  user: UserProfile | null,
  template: SavedTemplate,
  allTemplates: SavedTemplate[]
): Promise<SavedTemplate[]> {
  const sb = getSupabaseClient();
  if (sb && user) {
    await sb.from('layouts').upsert({
      id: template.id.startsWith('tpl-') ? undefined : template.id,
      user_id: user.id,
      name: template.name,
      niche_tag: template.nicheTag || null,
      config: template.config,
      updated_at: new Date(template.updatedAt).toISOString(),
    });
  }

  try {
    localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(allTemplates));
  } catch {
    // Ignore
  }
  return allTemplates;
}

export async function deleteTemplateFromCloudOrLocal(
  user: UserProfile | null,
  id: string,
  remainingTemplates: SavedTemplate[]
): Promise<void> {
  const sb = getSupabaseClient();
  if (sb && user) {
    await sb.from('layouts').delete().eq('id', id).eq('user_id', user.id);
  }
  try {
    localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(remainingTemplates));
  } catch {
    // Ignore
  }
}
