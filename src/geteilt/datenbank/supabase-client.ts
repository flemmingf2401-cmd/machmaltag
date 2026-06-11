/**
 * Supabase Client — Singleton für die gesamte App.
 *
 * Die Umgebungsvariablen VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY
 * müssen in .env.local gesetzt werden.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './typen'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[MachMalTag] Supabase-Umgebungsvariablen fehlen. ' +
      'Setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)
