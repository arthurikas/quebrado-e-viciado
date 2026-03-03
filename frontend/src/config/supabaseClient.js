import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no .env');
}

// Main client — handles auth (login, logout, session)
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }), getSession: async () => ({ data: { session: null } }) },
        from: () => ({ select: () => ({ eq: () => ({ order: () => ({}) }) }) })
    };

// Data reader client — always uses anon role, never holds authenticated session
// This bypasses RLS restrictions that block authenticated user reads
export const supabaseReader = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    })
    : supabase;
