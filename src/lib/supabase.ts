// ─────────────────────────────────────────────
// SUPABASE CLIENT — Pronto para integração
// ─────────────────────────────────────────────
// Para ativar:
//   1. Copie .env.example para .env
//   2. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
//   3. Descomente as linhas abaixo e remova o mock

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Exporta null enquanto não integrado — hooks verificam antes de usar
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseReady = !!supabase
