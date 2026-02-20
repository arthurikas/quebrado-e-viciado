import { createClient } from '@supabase/supabase-js';

console.log('supabaseClient.js: Inicializando cliente Supabase...');
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('supabaseClient.js: ERRO - VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no .env');
}

// Prevent crash if URL is missing
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }), getSession: async () => ({ data: { session: null } }) },
        from: () => ({ select: () => ({ eq: () => ({ order: () => ({}) }) }) }) // Mock to prevent top-level crashes
    };
