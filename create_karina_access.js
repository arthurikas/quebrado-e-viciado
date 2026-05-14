
const supabaseUrl = 'https://zpgszctzqexjmwwochot.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZ3N6Y3R6cWV4am13d29jaG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3Nzc3NDEsImV4cCI6MjA5NDM1Mzc0MX0.YZspe6bM18DwM9kK0M9Gi-goUp5cbQBR5c2De07iyZY';

async function createClientAccess() {
    console.log("Criando acesso via API para: karinanormalizze@gmail.com...");
    
    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'karinanormalizze@gmail.com',
                password: 'karina2026@',
                data: {
                    nome_completo: 'Karina Normalizze',
                    tipo_acesso: 'admin'
                }
            })
        });

        const data = await response.json();

        if (data.error || response.status >= 400) {
            console.error("Erro ao criar acesso:", data.error ? data.error.message : data);
        } else {
            console.log("Sucesso! Usuário criado.");
            console.log("ID:", data.id);
            console.log("\nIMPORTANTE:");
            console.log("1. Vá no painel do Supabase > Authentication > Users.");
            console.log("2. Se aparecer 'Waiting for verification', você pode clicar nos três pontinhos e selecionar 'Confirm User' manualmente para ela não precisar clicar no email.");
        }
    } catch (e) {
        console.error("Erro na requisição:", e.message);
    }
}

createClientAccess();
