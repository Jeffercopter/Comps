-- Whitmore Australia — console schema
-- Run in the Supabase SQL editor, or: supabase db push
--
-- Design notes:
--   * `products` is public-read. The catalogue is marketing content; there is
--     nothing to protect and anonymous read keeps the console dependency-free.
--   * `enquiries` is insert-only for anonymous users. The public site must be
--     able to lodge a lead but must never be able to read the lead table back.

-- ── extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type product_category as enum (
    'open-gear', 'gearbox-oil', 'grease', 'wire-rope', 'specialty'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_chemistry as enum (
    'fully-synthetic', 'semi-synthetic', 'non-asphaltic', 'mineral'
  );
exception when duplicate_object then null; end $$;

-- ── products ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  slug          text primary key,
  name          text not null,
  family        text not null,
  category      product_category not null,
  chemistry     product_chemistry not null,
  tagline       text not null default '',
  description   text not null default '',
  grades        text[] not null default '{}',
  applications  text[] not null default '{}',
  specs         jsonb  not null default '[]'::jsonb,
  approvals     text[] not null default '{}',
  replaces      text[] not null default '{}',
  au_priority   smallint not null default 3 check (au_priority between 1 and 3),
  au_note       text not null default '',
  sources       text[] not null default '{}',
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_priority_idx on public.products (au_priority);

-- ── enquiries ───────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id           uuid primary key default gen_random_uuid(),
  company      text not null,
  contact_name text not null,
  email        text not null,
  interest     text not null default '',
  message      text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

-- ── row level security ──────────────────────────────────────────────────────
alter table public.products  enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
  on public.products for select
  to anon, authenticated
  using (true);

-- Writes to products are reserved for the service role, which bypasses RLS.
-- No insert/update/delete policy is defined for anon by design.

drop policy if exists "anyone may lodge an enquiry" on public.enquiries;
create policy "anyone may lodge an enquiry"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

-- Deliberately no select policy on enquiries: the public console can write a
-- lead but cannot read the lead list back.

-- ── updated_at maintenance ──────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();
