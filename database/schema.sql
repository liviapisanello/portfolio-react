create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('featured_repositories', '["analytics", "codecam", "AssessorAI"]'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = (select auth.uid())
  );
$$;

alter table public.messages enable row level security;
alter table public.app_admins enable row level security;
alter table public.app_settings enable row level security;

revoke all on public.messages from anon, authenticated;
grant select, update on public.messages to authenticated;
grant all on public.messages to service_role;
revoke all on public.app_admins from anon, authenticated;
grant select on public.app_admins to authenticated;
revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to anon, authenticated;
grant insert, update, delete on public.app_settings to authenticated;

drop policy if exists "Admins can read messages" on public.messages;
create policy "Admins can read messages"
  on public.messages for select
  to authenticated
  using ((select public.is_portfolio_admin()));

drop policy if exists "Admins can update messages" on public.messages;
create policy "Admins can update messages"
  on public.messages for update
  to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

drop policy if exists "Users can see their admin membership" on public.app_admins;
create policy "Users can see their admin membership"
  on public.app_admins for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read public settings" on public.app_settings;
create policy "Anyone can read public settings"
  on public.app_settings for select
  to anon, authenticated
  using (key = 'featured_repositories');

drop policy if exists "Admins can manage settings" on public.app_settings;
create policy "Admins can manage settings"
  on public.app_settings for all
  to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));
