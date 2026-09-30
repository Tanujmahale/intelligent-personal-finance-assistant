-- ============================================================================
-- Intelligent Personal Finance Assistant — Database Schema
-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- profiles
-- One row per app user. If Supabase Auth is enabled, id = auth.users.id.
-- In demo/local mode, a single fixed-UUID profile row is used (see seed.sql).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  display_name text not null default 'Demo User',
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- expenses
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null check (
    category in (
      'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills',
      'Healthcare', 'Education', 'Travel', 'Other'
    )
  ),
  description text not null default '',
  expense_date date not null,
  payment_method text not null default 'Unknown' check (
    payment_method in ('Cash', 'Card', 'UPI', 'Net Banking', 'Wallet', 'Unknown')
  ),
  source text not null default 'manual' check (source in ('manual', 'ai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_expenses_date on public.expenses(expense_date);
create index if not exists idx_expenses_category on public.expenses(category);
create index if not exists idx_expenses_user_date on public.expenses(user_id, expense_date desc);

-- ----------------------------------------------------------------------------
-- budgets
-- One row per user per month/year.
-- ----------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2100),
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, year)
);

create index if not exists idx_budgets_user_id on public.budgets(user_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_budgets_updated_at on public.budgets;
create trigger trg_budgets_updated_at
before update on public.budgets
for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- The app uses a simple demo-user model (no Supabase Auth by default), so
-- RLS is enabled with a permissive policy scoped to the anon key. If you wire
-- up Supabase Auth later, tighten these policies to `auth.uid() = user_id`.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;

drop policy if exists "Allow all on profiles" on public.profiles;
create policy "Allow all on profiles" on public.profiles
  for all using (true) with check (true);

drop policy if exists "Allow all on expenses" on public.expenses;
create policy "Allow all on expenses" on public.expenses
  for all using (true) with check (true);

drop policy if exists "Allow all on budgets" on public.budgets;
create policy "Allow all on budgets" on public.budgets
  for all using (true) with check (true);

-- NOTE: "Allow all" policies are appropriate ONLY because this is a
-- single-demo-user student project with no real Supabase Auth session.
-- If you add Supabase Auth, replace the policies above with, e.g.:
--
--   create policy "Users manage own expenses" on public.expenses
--     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
