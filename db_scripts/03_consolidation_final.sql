-- =========================================================================
-- RENTUN GROUP - SCRIPT DE CONSOLIDACIÓN FINAL
-- =========================================================================
-- Ejecuta este script en el Editor SQL de Supabase.
-- Es idempotente (se puede correr varias veces sin errores).
-- Asegura que todas las tablas tienen las columnas correctas.

-- ── 1. site_settings ────────────────────────────────────────────────────────
create table if not exists public.site_settings (id bigint primary key);
alter table public.site_settings
  add column if not exists font_pair text,
  add column if not exists whatsapp text,
  add column if not exists email text,
  add column if not exists hero_title text,
  add column if not exists hero_accent text,
  add column if not exists hero_sub text,
  add column if not exists cta_title text,
  add column if not exists cta_sub text,
  add column if not exists host_name text,
  add column if not exists host_bio text,
  add column if not exists host_image text,
  add column if not exists rnt_number text,
  add column if not exists hero_images jsonb,
  add column if not exists chat_assistant_name text,
  add column if not exists chat_assistant_subtitle text,
  add column if not exists chat_assistant_welcome text,
  add column if not exists chat_assistant_avatar text;

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ── 2. properties ───────────────────────────────────────────────────────────
-- IMPORTANTE: id es TEXT (acepta 'default-apt' y UUIDs)
create table if not exists public.properties (id text primary key);
alter table public.properties
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists address text,
  add column if not exists wifi_ssid text,
  add column if not exists wifi_password text,
  add column if not exists price text,            -- texto p.e. "$280.000 COP / noche"
  add column if not exists bedrooms int,
  add column if not exists beds int,
  add column if not exists baths numeric,
  add column if not exists is_airbnb boolean,
  add column if not exists airbnb_listing text,
  add column if not exists airbnb_booking text,
  add column if not exists airbnb_reviews text,
  add column if not exists airbnb_contact text,
  add column if not exists airbnb_calendar text,
  add column if not exists airbnb_rules text,
  add column if not exists airbnb_safety text,
  add column if not exists airbnb_embed_id text,
  add column if not exists images jsonb,           -- array de URLs de Supabase Storage
  add column if not exists custom_wifi_qr text,
  add column if not exists custom_guide_qr text,
  add column if not exists custom_whatsapp_qr text;

-- ── 3. places ────────────────────────────────────────────────────────────────
create table if not exists public.places (id uuid primary key default gen_random_uuid());
alter table public.places
  add column if not exists title text,
  add column if not exists subtitle text,
  add column if not exists description text,
  add column if not exists image text,
  add column if not exists distance text,
  add column if not exists walking_time text,
  add column if not exists map_link text,
  add column if not exists category text;

-- ── 4. house_rules ───────────────────────────────────────────────────────────
create table if not exists public.house_rules (id uuid primary key default gen_random_uuid());
alter table public.house_rules
  add column if not exists title text,
  add column if not exists allowed boolean,
  add column if not exists is_public boolean;

-- ── 5. emergencies ───────────────────────────────────────────────────────────
-- NOTA: el campo "value" del frontend se guarda como "phone" en la BD
create table if not exists public.emergencies (id uuid primary key default gen_random_uuid());
alter table public.emergencies
  add column if not exists title text,
  add column if not exists phone text,           -- contiene el valor/descripción del contacto
  add column if not exists icon text;

-- ── 6. faqs ──────────────────────────────────────────────────────────────────
create table if not exists public.faqs (id uuid primary key default gen_random_uuid());
alter table public.faqs
  add column if not exists question text,
  add column if not exists answer text;

-- ── 7. manuals ───────────────────────────────────────────────────────────────
create table if not exists public.manuals (id uuid primary key default gen_random_uuid());
alter table public.manuals
  add column if not exists title text,
  add column if not exists pdf_url text;         -- URL del PDF o imagen del manual

-- ── 8. Storage bucket para imágenes ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- ── 9. Desactivar RLS temporalmente (activar con Auth cuando esté listo) ──────
alter table public.site_settings disable row level security;
alter table public.properties disable row level security;
alter table public.places disable row level security;
alter table public.house_rules disable row level security;
alter table public.emergencies disable row level security;
alter table public.faqs disable row level security;
alter table public.manuals disable row level security;

-- Políticas de storage (por si no existen aún)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public Access images'
  ) then
    execute 'create policy "Public Access images" on storage.objects for select using (bucket_id = ''images'')';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow all uploads images'
  ) then
    execute 'create policy "Allow all uploads images" on storage.objects for insert with check (bucket_id = ''images'')';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Allow all deletes images'
  ) then
    execute 'create policy "Allow all deletes images" on storage.objects for delete using (bucket_id = ''images'')';
  end if;
end$$;
