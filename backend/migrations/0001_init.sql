-- Sentirel — Phase 0 schema + Row-Level Security
-- Paste into Supabase Studio → SQL Editor → Run. Idempotent-ish (safe to re-run on a fresh project).
-- Every table is scoped to auth.uid(); a user can only ever touch their own rows.

-- ── profiles: 1 row per user, auto-created on signup ──────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  prefs      jsonb not null default '{}'::jsonb,   -- riskProfile, coupled, toured, journey, locale
  created_at timestamptz not null default now()
);

-- auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ── snapshots: saved point-in-time summaries ──────────────────────────────────
create table if not exists public.snapshots (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  ts           date not null default current_date,
  nw           numeric,
  surplus      numeric,
  health_score int,
  label        text,
  created_at   timestamptz not null default now()
);
create index if not exists snapshots_user_ts on public.snapshots(user_id, ts desc);

-- ── custom_categories: 1 row per user (AI / template / "build your own") ───────
create table if not exists public.custom_categories (
  user_id     uuid primary key references auth.users on delete cascade,
  label       text,
  emoji       text,
  assets      jsonb not null default '[]'::jsonb,
  liabilities jsonb not null default '[]'::jsonb,
  expenses    jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ── engagement: drives the health score ───────────────────────────────────────
create table if not exists public.engagement (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null default '{}'::jsonb,   -- {visited, decisions, goalsSet, emergencyMonths, ...}
  updated_at timestamptz not null default now()
);

-- ── reminders (Phase 4 wiring; table now so the stub can write) ────────────────
create table if not exists public.reminders (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users on delete cascade,
  due_at   timestamptz not null,
  channel  text not null check (channel in ('email','push')),
  sent_at  timestamptz
);
create index if not exists reminders_due on public.reminders(due_at) where sent_at is null;

-- ── plaid_items (Phase 3; access_token is SERVER-ONLY, never exposed) ──────────
create table if not exists public.plaid_items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  access_token text not null,
  institution  text,
  created_at   timestamptz not null default now()
);

-- ── ai_usage: per-user daily quota for the Anthropic proxy (cost control) ──────
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);

-- atomic increment + cap check; called by the Edge Function via service role
create or replace function public.bump_ai_usage(p_user uuid, p_cap int)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.ai_usage(user_id, day, count) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count into c;
  return c <= p_cap;   -- false once the user is over the daily cap
end; $$;

-- ── Row-Level Security: enable on every table; users own their rows ────────────
alter table public.profiles          enable row level security;
alter table public.snapshots         enable row level security;
alter table public.custom_categories enable row level security;
alter table public.engagement        enable row level security;
alter table public.reminders         enable row level security;
alter table public.plaid_items       enable row level security;   -- no client policy below ⇒ client gets nothing
alter table public.ai_usage          enable row level security;   -- no client policy ⇒ only service role touches it

create policy "own profile"    on public.profiles          for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own snapshots"  on public.snapshots         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own categories" on public.custom_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own engagement" on public.engagement        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own reminders"  on public.reminders         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- NOTE: intentionally NO policies on plaid_items or ai_usage → the client (anon/auth role)
-- can't read or write them; only Edge Functions using the service-role key can.
