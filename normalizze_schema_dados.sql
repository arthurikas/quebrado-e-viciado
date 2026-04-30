-- =================================================================
-- NORMALIZZE - SCHEMA E DADOS COMPLETOS DO SUPABASE
-- Este script contém a definição atualizada de todas as tabelas
-- do sistema, políticas de segurança, gatilhos e os dados contidos.
-- =================================================================

-- -----------------------------------------------------------------
-- 1. TABELAS E ESTRUTURAS
-- -----------------------------------------------------------------

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

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    user_id UUID,
    username VARCHAR(255),
    empresa_id BIGINT REFERENCES empresas(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_evaluations_company ON evaluations(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_evaluations_type ON evaluations(type);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_perfis_empresa ON perfis(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_hash ON empresas(hash_link);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- =================================================================
-- 2. ROW LEVEL SECURITY (RLS) E POLÍTICAS
-- =================================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Empresas: leitura autenticada" ON empresas FOR SELECT USING (true);
CREATE POLICY "Empresas: escrita autenticada" ON empresas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Perfis: leitura própria ou autenticada" ON perfis FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');
CREATE POLICY "Perfis: inserção autenticada" ON perfis FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.uid() = id);
CREATE POLICY "Perfis: atualização autenticada" ON perfis FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Employees: acesso autenticado" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Evaluations: acesso autenticado" ON evaluations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Evaluations: insert anon" ON evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Employees: insert anon" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Empresas: select anon para hash" ON empresas FOR SELECT USING (true);


-- =================================================================
-- 3. TRIGGERS E FUNÇÕES
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
-- 4. DADOS DO SISTEMA (INSERTS)
-- Os UUIDs antigos foram mapeados para a nova estrutura BIGSERIAL
-- onde necessário.
-- =================================================================

-- Inserindo Empresas
-- Mapeamentos baseados nos arquivos JSON (UUID -> BIGSERIAL):
-- normalizze teste 1 -> ID 1
-- Normalizze teste -> ID 2
INSERT INTO empresas (id, nome, cnpj, ativo, hash_link, link_ativo) VALUES
(1, 'normalizze teste 1', '00.000.000/0001-00', true, 'B5F9A1', true),
(2, 'Normalizze teste', '00.000.000/0000-01', true, 'C2D4E6', true)
ON CONFLICT (id) DO NOTHING;

-- Ajustando a sequência das empresas
SELECT setval('empresas_id_seq', (SELECT MAX(id) FROM empresas));

-- Inserindo Perfis
-- O perfil do Arthur Ricardo pertencia à empresa 'Normalizze teste' (agora ID 2)
-- ATENÇÃO: Para o insert abaixo funcionar corretamente no Supabase,
-- o usuário já deve ter sido criado no serviço de Auth, pois a tabela
-- perfis referencia auth.users(id).
INSERT INTO perfis (id, nome_completo, email, tipo_acesso, empresa_id) VALUES
('8e08166f-0cf8-4175-b413-73ae27fe0c0d', 'Arthur Ricardo', 'arthuricardoo05@gmail.com', 'admin', 2)
ON CONFLICT (id) DO NOTHING;
