-- Execute este script no SQL Editor do Supabase (Painel -> SQL Editor)

-- 1. Adicionar a coluna hash_link (única e curta) na tabela de empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS hash_link VARCHAR(10) UNIQUE;

-- 2. Atualizar as empresas já existentes com um hash aleatório de 6 caracteres
UPDATE empresas 
SET hash_link = upper(substring(md5(random()::text) from 1 for 6)) 
WHERE hash_link IS NULL;
