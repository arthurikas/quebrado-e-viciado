import { createClient } from '@supabase/supabase-js';

console.log('supabaseClient.js: Inicializando cliente Supabase...');
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('supabaseClient.js: ERRO - VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no .env');
} else {
    console.log('supabaseClient.js: Credenciais encontradas na configuração.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
