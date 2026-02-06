import { createClient } from '@supabase/supabase-js';

// Usamos la URL y la ANON_KEY (la que empieza con 'eyJ...')
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token', // Ayuda a evitar conflictos de cookies en Vercel
  }
});