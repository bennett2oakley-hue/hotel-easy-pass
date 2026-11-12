-- Hotel Easy Pass native schema. Run only in its own Supabase project.
-- Inspect an existing database before applying; this is additive, not a destructive reset.
create extension if not exists pgcrypto;
grant usage on schema public to authenticated;
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $ begin new.updated_at=now(); return new; end; $;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.profiles enable row level security;
grant select,insert,update on public.profiles to authenticated;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid())=id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid())=id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.trips(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,trip_name text not null,destination text,start_date date,end_date date,trip_purpose text check(trip_purpose in('business','emergency','leisure','family')),traveler_count integer not null default 1 check(traveler_count>0),rental_car boolean not null default false,flight_needed boolean not null default false,preferences jsonb not null default '{}'::jsonb,notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.saved_places(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,trip_id uuid references public.trips(id) on delete cascade,place_name text not null,address text,category text,notes text,external_reference text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.owner_properties(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,property_name text not null,address text,description text,contact_phone text,amenities jsonb not null default '[]'::jsonb,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.property_promotions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,property_id uuid references public.owner_properties(id) on delete cascade,title text not null,description text,starts_on date,ends_on date,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());

do $$ declare t text; begin foreach t in array array['trips','saved_places','owner_properties','property_promotions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 execute format('drop policy if exists %I on public.%I',t||'_select_own',t);
 execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid())=user_id)',t||'_select_own',t);
 execute format('drop policy if exists %I on public.%I',t||'_insert_own',t);
 execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',t||'_insert_own',t);
 execute format('drop policy if exists %I on public.%I',t||'_update_own',t);
 execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t||'_update_own',t);
 execute format('drop policy if exists %I on public.%I',t||'_delete_own',t);
 execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid())=user_id)',t||'_delete_own',t);
 execute format('drop trigger if exists %I on public.%I',t||'_updated_at',t);
 execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()',t||'_updated_at',t);
 end loop; end $$;

insert into storage.buckets(id,name,public) values('hotel-easy-pass','hotel-easy-pass',false) on conflict(id) do nothing;
drop policy if exists hep_select_own on storage.objects;
create policy hep_select_own on storage.objects for select to authenticated using(bucket_id='hotel-easy-pass' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists hep_insert_own on storage.objects;
create policy hep_insert_own on storage.objects for insert to authenticated with check(bucket_id='hotel-easy-pass' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists hep_update_own on storage.objects;
create policy hep_update_own on storage.objects for update to authenticated using(bucket_id='hotel-easy-pass' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='hotel-easy-pass' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists hep_delete_own on storage.objects;
create policy hep_delete_own on storage.objects for delete to authenticated using(bucket_id='hotel-easy-pass' and (storage.foldername(name))[1]=(select auth.uid())::text);
