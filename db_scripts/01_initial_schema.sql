-- =========================================================================
-- RENTUN GROUP - SUPABASE SETUP SCRIPT
-- =========================================================================
-- Ejecuta este script en el Editor SQL de Supabase para iniciar el proyecto.
-- Incluye la tabla de configuración, políticas de seguridad y Storage.

-- 1. Crear tabla principal para la configuración del sitio web
create table if not exists public.site_settings (
  id text primary key,
  config_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (RLS) en la tabla
alter table public.site_settings enable row level security;

-- 3. Crear Políticas de Acceso (Lectura pública, Escritura autenticada)

-- Permitir que cualquier persona lea la configuración (necesario para el sitio público)
create policy "Configuración pública"
  on public.site_settings for select
  using ( true );

-- Permitir que SOLO usuarios autenticados (Administradores) puedan guardar la configuración
create policy "Administradores pueden actualizar"
  on public.site_settings for all
  using ( auth.role() = 'authenticated' );

-- =========================================================================
-- CONFIGURACIÓN DE STORAGE (BUCKET PARA IMÁGENES)
-- =========================================================================

-- 4. Crear el bucket público para las fotos de las propiedades, avatares, etc.
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- 5. Habilitar políticas de seguridad para el Storage (Imágenes)

-- Cualquier usuario puede ver las imágenes publicadas
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- Solo administradores autenticados pueden insertar o subir imágenes nuevas
create policy "Allow inserts"
on storage.objects for insert
with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- Solo administradores autenticados pueden eliminar imágenes
create policy "Allow deletes"
on storage.objects for delete
using ( bucket_id = 'images' and auth.role() = 'authenticated' );
