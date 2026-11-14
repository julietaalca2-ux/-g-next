/* ========================================================================= */
/* ÖG SUPABASE SERVICE - Inicialización del Cliente y Persistencia           */
/* ========================================================================= */

import { SUPABASE_URL, SUPABASE_KEY } from '../config/supabaseConfig.js';

if (!window.supabase) {
  console.error('El SDK de Supabase (supabase-js) no está cargado en el documento.');
}

export const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
