
const supabaseUrl = 'https://fpqfviysiwglttzvnwvt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcWZ2aXlzaXdnbHR0enZud3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDM4NjIsImV4cCI6MjA4NTg3OTg2Mn0.6QavNL7kt8wdyKwcssQ9k5uiRSxBRr0KsXsn-W-rb-g';

async function checkTable(table) {
    try {
        console.log(`\n--- Table: ${table} ---`);
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        const data = await response.json();
        if (data.length > 0) {
            console.log('Sample Row keys:', Object.keys(data[0]));
            console.log('Sample Row ID:', data[0].id, 'Type:', typeof data[0].id);
            if (data[0].empresa_id) {
                console.log('Sample Row empresa_id:', data[0].empresa_id, 'Type:', typeof data[0].empresa_id);
            }
        } else {
            console.log('Table is empty.');
        }
    } catch (e) {
        console.error(`Exception checking ${table}:`, e.message);
    }
}

async function run() {
    await checkTable('empresas');
    await checkTable('perfis');
}

run();
