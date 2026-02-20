import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'frontend', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking Table Schemas...');

    // Check employees table
    const { data: employees, error: empError } = await supabase.from('employees').select('*').limit(1);
    console.log('\n--- Employees Sample ---');
    if (empError) console.error('Error fetching employees:', empError.message);
    else console.log(employees);

    // Check evaluations table
    const { data: evaluations, error: evalError } = await supabase.from('evaluations').select('*').limit(1);
    console.log('\n--- Evaluations Sample ---');
    if (evalError) console.error('Error fetching evaluations:', evalError.message);
    else console.log(evaluations);

    // Check companies table
    const { data: companies, error: compError } = await supabase.from('companies').select('*').limit(1);
    console.log('\n--- Companies Sample ---');
    if (compError) console.error('Error fetching companies:', compError.message);
    else console.log(companies);

    // Check empresas table
    const { data: empresas, error: empraError } = await supabase.from('empresas').select('*').limit(1);
    console.log('\n--- Empresas Sample ---');
    if (empraError) console.error('Error fetching empresas:', empraError.message);
    else console.log(empresas);

    // Check perfis table
    const { data: perfis, error: perfError } = await supabase.from('perfis').select('*').limit(1);
    console.log('\n--- Perfis Sample ---');
    if (perfError) console.error('Error fetching perfis:', perfError.message);
    else console.log(perfis);
}

checkSchema();
