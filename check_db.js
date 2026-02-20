import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = './frontend/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const env = {};
lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Table: empresas ---');
    const { data: e1, error: err1 } = await supabase.from('empresas').select('*').limit(1);
    console.log(err1 ? err1.message : e1);

    console.log('\n--- Table: companies ---');
    const { data: e2, error: err2 } = await supabase.from('companies').select('*').limit(1);
    console.log(err2 ? err2.message : e2);

    console.log('\n--- Table: employees ---');
    const { data: e3, error: err3 } = await supabase.from('employees').select('*').limit(1);
    console.log(err3 ? err3.message : e3);

    console.log('\n--- Table: evaluations ---');
    const { data: e4, error: err4 } = await supabase.from('evaluations').select('*').limit(1);
    console.log(err4 ? err4.message : e4);
}

check();
