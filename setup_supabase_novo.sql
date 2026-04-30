-- =================================================================
-- NORMALIZZE - SETUP COMPLETO DO BANCO DE DADOS
-- Execute este script no SQL Editor do novo projeto Supabase
-- Execute na ordem: cada bloco de uma vez.
-- =================================================================


-- =================================================================
-- BLOCO 1: TABELAS PRINCIPAIS
-- =================================================================

-- Tabela de empresas (clientes/multi-tenant)
CREATE TABLE IF NOT EXISTS empresas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    hash_link VARCHAR(10) UNIQUE,
    link_ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de perfis (usuários do sistema - espelha auth.users do Supabase)
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255),
    email VARCHAR(255),
    tipo_acesso VARCHAR(20) DEFAULT 'colaborador' CHECK (tipo_acesso IN ('admin', 'colaborador')),
    empresa_id BIGINT REFERENCES empresas(id) ON DELETE SET NULL,
    registro VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de funcionários/colaboradores avaliados
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    sex CHAR(1) CHECK (sex IN ('M', 'F', 'O')),
    age INTEGER,
    tenure_years DECIMAL(5,2) DEFAULT 0,
    job_function VARCHAR(255),
    sector_parish VARCHAR(255),
    company_id BIGINT REFERENCES empresas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de avaliações (COPSOQ e AEP)
CREATE TABLE IF NOT EXISTS evaluations (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    evaluation_date DATE DEFAULT CURRENT_DATE,
    type VARCHAR(20) DEFAULT 'COPSOQ' CHECK (type IN ('COPSOQ', 'AEP')),
    company_id BIGINT REFERENCES empresas(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    full_data JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =================================================================
-- BLOCO 2: ÍNDICES PARA PERFORMANCE
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_evaluations_company ON evaluations(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_evaluations_type ON evaluations(type);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_perfis_empresa ON perfis(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_hash ON empresas(hash_link);


-- =================================================================
-- BLOCO 3: ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas: admin vê tudo, colaborador vê apenas da sua empresa
-- (Simplificado: usuários autenticados têm acesso total via anon key por ora)

-- Empresas: qualquer autenticado lê, qualquer autenticado escreve
CREATE POLICY "Empresas: leitura autenticada" ON empresas
    FOR SELECT USING (true);

CREATE POLICY "Empresas: escrita autenticada" ON empresas
    FOR ALL USING (auth.role() = 'authenticated');

-- Perfis: usuário vê o próprio perfil; admins veem todos
CREATE POLICY "Perfis: leitura própria ou autenticada" ON perfis
    FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');

CREATE POLICY "Perfis: inserção autenticada" ON perfis
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.uid() = id);

CREATE POLICY "Perfis: atualização autenticada" ON perfis
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Employees: qualquer autenticado
CREATE POLICY "Employees: acesso autenticado" ON employees
    FOR ALL USING (auth.role() = 'authenticated');

-- Evaluations: qualquer autenticado
CREATE POLICY "Evaluations: acesso autenticado" ON evaluations
    FOR ALL USING (auth.role() = 'authenticated');

-- Acesso anônimo para preenchimento de questionário via link único
CREATE POLICY "Evaluations: insert anon" ON evaluations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Employees: insert anon" ON employees
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Empresas: select anon para hash" ON empresas
    FOR SELECT USING (true);


-- =================================================================
-- BLOCO 4: TRIGGER - Auto-criar perfil ao criar usuário no Auth
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfis (id, email, nome_completo, tipo_acesso)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'tipo_acesso', 'colaborador')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =================================================================
-- BLOCO 5: DADOS INICIAIS
-- Após rodar este script, crie o usuário admin manualmente pelo
-- painel do Supabase em Authentication > Users, depois execute
-- o UPDATE abaixo com o UUID gerado.
-- =================================================================

-- Exemplo (substitua o UUID pelo gerado após criar o usuário admin):
-- UPDATE perfis SET tipo_acesso = 'admin', nome_completo = 'Arthur Admin' WHERE email = 'seu-email@gmail.com';
