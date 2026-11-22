-- Hotel Easy Pass one-time lifetime unlock.
-- Run only in the dedicated Hotel Easy Pass Supabase project.

create table if not exists public.app_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_slug text not null check (app_slug = 'hotel-easy-pass'),
  plan text not null check (plan = 'lifetime'),
  status text not null check (status in ('active','refunded','revoked')),
  stripe_customer_id text,
  stripe_payment_intent_id text,
  updated_at timestamptz not null default now(),
  unique (user_id, app_slug),
  unique (stripe_payment_intent_id)
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.app_entitlements enable row level security;
alter table public.stripe_webhook_events enable row level security;
revoke all on public.app_entitlements from anon, authenticated;
grant select on public.app_entitlements to authenticated;
grant all on public.app_entitlements, public.stripe_webhook_events to service_role;

drop policy if exists "Hotel Easy Pass users read own entitlement" on public.app_entitlements;
create policy "Hotel Easy Pass users read own entitlement"
  on public.app_entitlements for select to authenticated
  using ((select auth.uid()) = user_id and app_slug = 'hotel-easy-pass');
revoke all on public.stripe_webhook_events from anon, authenticated;

drop policy if exists "No client access to Hotel Easy Pass webhook events" on public.stripe_webhook_events;
create policy "No client access to Hotel Easy Pass webhook events"
  on public.stripe_webhook_events
  for all
  to anon, authenticated
  using (false)
  with check (false);
