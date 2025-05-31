-- Script simplificado para criar as tabelas do sistema de caixa
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela abertura_caixa (referenciando auth.users diretamente)
CREATE TABLE IF NOT EXISTS public.abertura_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fechamento TIMESTAMP WITH TIME ZONE NULL,
    valor_inicial NUMERIC(12,2) NOT NULL DEFAULT 0,
    valor_final NUMERIC(12,2) NULL,
    total_vendas NUMERIC(12,2) DEFAULT 0,
    total_sangrias NUMERIC(12,2) DEFAULT 0,
    total_suprimentos NUMERIC(12,2) DEFAULT 0,
    valor_esperado NUMERIC(12,2) DEFAULT 0,
    diferenca NUMERIC(12,2) NULL,
    usuario_fechamento UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    observacoes TEXT NULL,
    observacoes_fechamento TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela movimentos_caixa (referenciando auth.users diretamente)
CREATE TABLE IF NOT EXISTS public.movimentos_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abertura_caixa_id UUID NOT NULL REFERENCES public.abertura_caixa(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    venda_id UUID NULL, -- Referência opcional para vendas
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('sangria', 'suprimento', 'venda', 'estorno')),
    valor NUMERIC(12,2) NOT NULL,
    descricao TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar se tabela vendas existe, se não criar uma básica
CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_venda VARCHAR(50) NULL,
    cliente_id UUID NULL,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizada', 'cancelada')),
    caixa_id UUID NULL REFERENCES public.abertura_caixa(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.abertura_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentos_caixa ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem acessar caixas" ON public.abertura_caixa
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar movimentos" ON public.movimentos_caixa
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_abertura_caixa_data_fechamento ON public.abertura_caixa(data_fechamento);
CREATE INDEX IF NOT EXISTS idx_abertura_caixa_usuario ON public.abertura_caixa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_abertura_caixa_data_abertura ON public.abertura_caixa(data_abertura);
CREATE INDEX IF NOT EXISTS idx_movimentos_caixa_abertura ON public.movimentos_caixa(abertura_caixa_id);
CREATE INDEX IF NOT EXISTS idx_movimentos_caixa_tipo ON public.movimentos_caixa(tipo);

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_abertura_caixa_updated_at 
    BEFORE UPDATE ON public.abertura_caixa 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Função para calcular totais automaticamente
CREATE OR REPLACE FUNCTION calcular_totais_caixa()
RETURNS TRIGGER AS $$
DECLARE
    _total_vendas NUMERIC(12,2) := 0;
    _total_sangrias NUMERIC(12,2) := 0;
    _total_suprimentos NUMERIC(12,2) := 0;
BEGIN
    -- Calcular totais baseado nos movimentos
    SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'venda' THEN valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN tipo = 'sangria' THEN valor ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN tipo = 'suprimento' THEN valor ELSE 0 END), 0)
    INTO _total_vendas, _total_sangrias, _total_suprimentos
    FROM public.movimentos_caixa 
    WHERE abertura_caixa_id = COALESCE(NEW.abertura_caixa_id, OLD.abertura_caixa_id);
    
    -- Atualizar a abertura_caixa
    UPDATE public.abertura_caixa 
    SET 
        total_vendas = _total_vendas,
        total_sangrias = _total_sangrias,
        total_suprimentos = _total_suprimentos,
        valor_esperado = valor_inicial + _total_vendas - _total_sangrias + _total_suprimentos
    WHERE id = COALESCE(NEW.abertura_caixa_id, OLD.abertura_caixa_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calcular_totais_caixa
    AFTER INSERT OR UPDATE OR DELETE ON public.movimentos_caixa
    FOR EACH ROW EXECUTE FUNCTION calcular_totais_caixa();

-- 9. Dar permissões finais
GRANT ALL ON public.abertura_caixa TO authenticated;
GRANT ALL ON public.movimentos_caixa TO authenticated;
GRANT ALL ON public.abertura_caixa TO service_role;
GRANT ALL ON public.movimentos_caixa TO service_role;

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;

-- Inserir algumas vendas de exemplo para teste (apenas se não existirem)
INSERT INTO public.vendas (numero_venda, total, status, created_at)
SELECT * FROM (
    VALUES 
    ('VENDA-001', 89.50, 'finalizada', NOW() - INTERVAL '2 hours'),
    ('VENDA-002', 156.80, 'finalizada', NOW() - INTERVAL '1 hour'),
    ('VENDA-003', 45.20, 'finalizada', NOW() - INTERVAL '30 minutes')
) AS exemplo_vendas(numero_venda, total, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.vendas WHERE status = 'finalizada');

SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('abertura_caixa', 'movimentos_caixa', 'vendas')
ORDER BY table_name, ordinal_position; 