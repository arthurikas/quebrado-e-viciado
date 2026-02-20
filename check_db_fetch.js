
const supabaseUrl = 'https://fpqfviysiwglttzvnwvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcWZ2aXlzaXdnbHR0enZud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDM4NjIsImV4cCI6MjA4NTg3OTg2Mn0.6QavNL7kt8wdyKwcssQ9k5uiRSxBRr0KsXsn-W-rb-g';

async function checkTable(table) {
    try {
        console.log(`\n--- Table: ${table} ---`);
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!response.ok) {
            console.log(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log(text);
            return;
        }

        const data = await response.json();
        console.log(data);
    } catch (e) {
        console.error(`Exception checking ${table}:`, e.message);
    }
}

async function run() {
    await checkTable('companies');
    await checkTable('empresas');
    await checkTable('perfis');
    await checkTable('evaluations');
    await checkTable('employees');
}

run();
