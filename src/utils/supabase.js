// ═══════════════════════════════════════════════════════
//  RENTUN GROUP — Cliente Supabase
//  TODO: Agregar las credenciales cuando las entreguen
//        1. Crear proyecto en supabase.com
//        2. Copiar URL y anon key al archivo .env
//        3. Descomentar las variables de importación
// ═══════════════════════════════════════════════════════

// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
// const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = supabaseUrl && supabaseKey
//   ? createClient(supabaseUrl, supabaseKey)
//   : null

// Placeholder mientras no hay credenciales
export const supabase = null;

// TODO: Tabla sugerida en Supabase para el admin panel:
// CREATE TABLE site_config (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   key TEXT UNIQUE NOT NULL,
//   value TEXT,
//   updated_at TIMESTAMPTZ DEFAULT now()
// );
