-- Script para corrigir a tabela abertura_caixa
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tipo enum se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_caixa') THEN
        CREATE TYPE status_caixa AS ENUM ('aberto', 'fechado', 'suspenso');
        RAISE NOTICE 'Tipo status_caixa criado';
    ELSE
        RAISE NOTICE 'Tipo status_caixa já existe';
    END IF;
END $$;

-- 2. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.abertura_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valor_inicial NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar coluna status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'abertura_caixa' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.abertura_caixa ADD COLUMN status status_caixa DEFAULT 'aberto';
        RAISE NOTICE 'Coluna status adicionada';
    ELSE
        RAISE NOTICE 'Coluna status já existe';
    END IF;
END $$;

-- 4. Adicionar outras colunas necessárias
DO $$ 
BEGIN
    -- data_fechamento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'abertura_caixa' 
        AND column_name = 'data_fechamento'
    ) THEN
        ALTER TABLE public.abertura_caixa ADD COLUMN data_fechamento TIMESTAMP WITH TIME ZONE;
    END IF;

    -- valor_final
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'abertura_caixa' 
        AND column_name = 'valor_final'
    ) THEN
        ALTER TABLE public.abertura_caixa ADD COLUMN valor_final NUMERIC(12,2);
    END IF;

    -- observacoes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'abertura_caixa' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE public.abertura_caixa ADD COLUMN observacoes TEXT;
    END IF;
END $$;

-- 5. Habilitar RLS
ALTER TABLE public.abertura_caixa ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas básicas
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.abertura_caixa;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.abertura_caixa;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.abertura_caixa;

CREATE POLICY "Enable read access for authenticated users" 
ON public.abertura_caixa FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.abertura_caixa FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON public.abertura_caixa FOR UPDATE 
TO authenticated 
USING (true);

-- 7. Criar índices
CREATE INDEX IF NOT EXISTS idx_abertura_caixa_status ON public.abertura_caixa(status);
CREATE INDEX IF NOT EXISTS idx_abertura_caixa_usuario ON public.abertura_caixa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_abertura_caixa_data_abertura ON public.abertura_caixa(data_abertura);

-- 8. Dar permissões
GRANT ALL ON public.abertura_caixa TO authenticated;
GRANT ALL ON public.abertura_caixa TO service_role;

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'abertura_caixa'
ORDER BY ordinal_position; 