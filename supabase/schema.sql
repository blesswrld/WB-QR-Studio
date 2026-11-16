-- ============================================================================
-- WB-QR Studio — Production SQL Schema for Supabase (PostgreSQL + RLS)
-- Инструкция: откройте SQL Editor в панели управления Supabase, вставьте этот
-- скрипт целиком и нажмите "Run".
-- ============================================================================

-- 1. Расширение для генерации UUID
create extension if not exists "pgcrypto";

-- 2. Таблица профилей пользователей (profiles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  pro_until timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Профили пользователей WB-QR Studio и статус подписки (free / pro).';
comment on column public.profiles.plan is 'Тарифный план: изменяется только через серверный вебхук платежной системы (service_role).';

-- 3. Таблица сохранённых макетов (layouts)
create table if not exists public.layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  niche_tag text null,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_layouts_user_id_updated_at
  on public.layouts(user_id, updated_at desc);

comment on table public.layouts is 'Сохранённые пользовательские макеты QR-вкладышей и термоэтикеток.';

-- 4. Функция и триггер автоматического обновления поля updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_layouts_updated_at on public.layouts;
create trigger trg_layouts_updated_at
  before update on public.layouts
  for each row execute function public.set_updated_at();

-- 5. Триггер автоматического создания записи в profiles при регистрации в auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan, pro_until)
  values (
    new.id,
    coalesce(new.email, ''),
    'free',
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Триггер защиты от самовольного повышения тарифа (plan / pro_until) с клиента
-- Только роль service_role (вебхук оплаты) или postgres может менять поля plan и pro_until.
create or replace function public.prevent_client_plan_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    if new.plan is distinct from old.plan or new.pro_until is distinct from old.pro_until then
      raise exception 'Изменение тарифного плана разрешено только серверному вебхуку оплаты (service_role).';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_client_plan_escalation on public.profiles;
create trigger trg_prevent_client_plan_escalation
  before update on public.profiles
  for each row execute function public.prevent_client_plan_escalation();

-- 7. Включение Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.layouts enable row level security;

-- Политики для таблицы profiles:
-- Пользователь может читать только свой профиль
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Пользователь может обновлять только свои не-тарифные данные (защищено триггером выше)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Политики для таблицы layouts:
-- Чтение только своих макетов
drop policy if exists "Users can view own layouts" on public.layouts;
create policy "Users can view own layouts"
  on public.layouts
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Создание макетов только от своего user_id (с проверкой лимита FREE <= 2 макета на уровне БД)
drop policy if exists "Users can insert own layouts" on public.layouts;
create policy "Users can insert own layouts"
  on public.layouts
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.plan = 'pro'
          and (p.pro_until is null or p.pro_until > now())
      )
      or (
        select count(*) from public.layouts l where l.user_id = auth.uid()
      ) < 2
    )
  );

-- Обновление только своих макетов
drop policy if exists "Users can update own layouts" on public.layouts;
create policy "Users can update own layouts"
  on public.layouts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Удаление только своих макетов
drop policy if exists "Users can delete own layouts" on public.layouts;
create policy "Users can delete own layouts"
  on public.layouts
  for delete
  to authenticated
  using (auth.uid() = user_id);
