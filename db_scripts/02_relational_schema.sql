-- =========================================================================
-- RENTUN GROUP - ACTUALIZACIÓN DE ESQUEMA PARA SUPABASE
-- =========================================================================
-- Ejecuta este script en el Editor SQL de Supabase para añadir cualquier columna
-- o tabla faltante que esté causando el error "400 Bad Request".

-- 1. Crear tablas si no existen
create table if not exists public.site_settings (id bigint primary key);
create table if not exists public.properties (id text primary key);
create table if not exists public.places (id uuid primary key default gen_random_uuid());
create table if not exists public.house_rules (id uuid primary key default gen_random_uuid());
create table if not exists public.emergencies (id uuid primary key default gen_random_uuid());
create table if not exists public.faqs (id uuid primary key default gen_random_uuid());
create table if not exists public.manuals (id uuid primary key default gen_random_uuid());

-- 2. Asegurar que site_settings tiene todas sus columnas
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
  add column if not exists hero_images jsonb;

-- Si no hay fila 1 en site_settings, insertarla
insert into public.site_settings (id, font_pair, whatsapp) 
values (1, 'modern', '') 
on conflict (id) do nothing;

-- 3. Asegurar que properties tiene todas sus columnas
alter table public.properties
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists address text,
  add column if not exists wifi_ssid text,
  add column if not exists wifi_password text,
  add column if not exists price numeric,
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
  add column if not exists images jsonb,
  add column if not exists custom_wifi_qr text,
  add column if not exists custom_guide_qr text,
  add column if not exists custom_whatsapp_qr text;

-- 4. Asegurar que places tiene todas sus columnas
alter table public.places
  add column if not exists title text,
  add column if not exists subtitle text,
  add column if not exists description text,
  add column if not exists image text,
  add column if not exists distance text,
  add column if not exists walking_time text,
  add column if not exists map_link text,
  add column if not exists category text;

-- 5. Asegurar que house_rules tiene todas sus columnas
alter table public.house_rules
  add column if not exists title text,
  add column if not exists allowed boolean,
  add column if not exists is_public boolean;

-- 6. Asegurar que emergencies tiene todas sus columnas
alter table public.emergencies
  add column if not exists title text,
  add column if not exists phone text,
  add column if not exists icon text;

-- 7. Asegurar que faqs tiene todas sus columnas
alter table public.faqs
  add column if not exists question text,
  add column if not exists answer text;

-- 8. Asegurar que manuals tiene todas sus columnas
alter table public.manuals
  add column if not exists title text,
  add column if not exists pdf_url text;

-- =========================================================================
-- HABILITAR RLS Y POLÍTICAS PÚBLICAS TEMPORALES
-- =========================================================================

-- Desactivar RLS temporalmente o permitir todo para que el cliente pueda guardar (ajustar luego para Auth)
alter table public.site_settings disable row level security;
alter table public.properties disable row level security;
alter table public.places disable row level security;
alter table public.house_rules disable row level security;
alter table public.emergencies disable row level security;
alter table public.faqs disable row level security;
alter table public.manuals disable row level security;
