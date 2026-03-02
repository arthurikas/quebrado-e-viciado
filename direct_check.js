
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function run() {
    const url = 'https://fpqfviysiwglttzvnwvt.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcWZ2aXlzaXdnbHR0enZud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDM4NjIsImV4cCI6MjA4NTg3OTg2Mn0.6QavNL7kt8wdyKwcssQ9k5uiRSxBRr0KsXsn-W-rb-g';

    console.log('--- Checking Profiles ---');
    const pRes = await fetch(`${url}/rest/v1/perfis?select=*&nome_completo=ilike.*Arthur*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const profiles = await pRes.json();
    console.log('Profiles:', JSON.stringify(profiles, null, 2));

    console.log('\n--- Checking Companies ---');
    const cRes = await fetch(`${url}/rest/v1/empresas?select=*`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const companies = await cRes.json();
    console.log('Companies:', JSON.stringify(companies, null, 2));
}

run();
