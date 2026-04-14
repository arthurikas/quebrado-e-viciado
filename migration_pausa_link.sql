-- Execute este script no SQL Editor do Supabase (Painel -> SQL Editor)

-- 1. Adicionar a coluna link_ativo (boolean, default true) na tabela de empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS link_ativo BOOLEAN DEFAULT true;
