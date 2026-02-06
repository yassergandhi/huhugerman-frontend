// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Híbrido para Astro (Vite) y Node.js (Vercel/SSR)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY || process.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Solo lanzamos error si estamos intentando usarlo, 
  // para evitar que el build falle por variables de entorno faltantes si no se usan en ese paso.
  console.warn('⚠️ Advertencia: Variables de Supabase no detectadas.');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || ''
);