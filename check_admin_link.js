
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './frontend/.env' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAdminProfile() {
    console.log('=== CHECKING ADMIN PROFILE ===');

    // 1. Get Arthur's profile
    const { data: profiles, error: pError } = await supabase
        .from('perfis')
        .select('*, empresas(*)')
        .ilike('nome_completo', '%Arthur%');

    if (pError) {
        console.error('Error fetching profile:', pError);
    } else {
        console.log('Profiles found:', JSON.stringify(profiles, null, 2));
    }

    // 2. See all companies to find the right ID
    const { data: companies, error: cError } = await supabase
        .from('empresas')
        .select('*');

    if (cError) {
        console.error('Error fetching companies:', cError);
    } else {
        console.log('Available Companies:', JSON.stringify(companies, null, 2));
    }
}

checkAdminProfile();
