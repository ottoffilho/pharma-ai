-- Migração para M05-MANIPULACAO_BASICA: Sistema de Ordens de Produção
-- Data: 2024-12-26

-- Tabela principal de ordens de produção
CREATE TABLE IF NOT EXISTS ordens_producao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ordem VARCHAR(50) UNIQUE NOT NULL,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    receita_processada_id UUID REFERENCES receitas_processadas(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_preparacao', 'em_manipulacao', 'controle_qualidade', 'finalizada', 'cancelada')),
    prioridade VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_inicio_producao TIMESTAMP WITH TIME ZONE,
    data_fim_producao TIMESTAMP WITH TIME ZONE,
    data_prevista_entrega TIMESTAMP WITH TIME ZONE,
    usuario_responsavel_id UUID REFERENCES usuarios_internos(id),
    farmaceutico_responsavel_id UUID REFERENCES usuarios_internos(id),
    observacoes_gerais TEXT,
    instrucoes_especiais TEXT,
    forma_farmaceutica VARCHAR(100),
    quantidade_total DECIMAL(10,3) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    tempo_estimado_minutos INTEGER,
    custo_total_estimado DECIMAL(10,2),
    custo_total_real DECIMAL(10,2),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de insumos utilizados na ordem de produção
CREATE TABLE IF NOT EXISTS ordem_producao_insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
    lote_insumo_id UUID REFERENCES lotes_insumos(id) ON DELETE RESTRICT,
    quantidade_necessaria DECIMAL(10,3) NOT NULL,
    quantidade_utilizada DECIMAL(10,3),
    unidade_medida VARCHAR(20) NOT NULL,
    custo_unitario DECIMAL(10,2),
    custo_total DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de embalagens utilizadas na ordem de produção
CREATE TABLE IF NOT EXISTS ordem_producao_embalagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    embalagem_id UUID NOT NULL REFERENCES embalagens(id) ON DELETE RESTRICT,
    quantidade_necessaria INTEGER NOT NULL,
    quantidade_utilizada INTEGER,
    custo_unitario DECIMAL(10,2),
    custo_total DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de etapas do processo de manipulação
CREATE TABLE IF NOT EXISTS ordem_producao_etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    numero_etapa INTEGER NOT NULL,
    nome_etapa VARCHAR(200) NOT NULL,
    descricao_etapa TEXT NOT NULL,
    tempo_estimado_minutos INTEGER,
    tempo_real_minutos INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    usuario_executor_id UUID REFERENCES usuarios_internos(id),
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    anexos_urls TEXT[], -- Array de URLs de fotos/documentos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ordem_producao_id, numero_etapa)
);

-- Tabela de controle de qualidade
CREATE TABLE IF NOT EXISTS ordem_producao_qualidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    tipo_teste VARCHAR(100) NOT NULL,
    descricao_teste TEXT NOT NULL,
    resultado VARCHAR(50) NOT NULL CHECK (resultado IN ('aprovado', 'reprovado', 'pendente')),
    valor_obtido VARCHAR(200),
    valor_esperado VARCHAR(200),
    observacoes TEXT,
    farmaceutico_responsavel_id UUID NOT NULL REFERENCES usuarios_internos(id),
    data_teste TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    anexos_urls TEXT[], -- Array de URLs de fotos/laudos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de status das ordens
CREATE TABLE IF NOT EXISTS historico_status_ordens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_producao_id UUID NOT NULL REFERENCES ordens_producao(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES usuarios_internos(id),
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ordens_producao_status ON ordens_producao(status);
CREATE INDEX IF NOT EXISTS idx_ordens_producao_data_criacao ON ordens_producao(data_criacao);
CREATE INDEX IF NOT EXISTS idx_ordens_producao_pedido_id ON ordens_producao(pedido_id);
CREATE INDEX IF NOT EXISTS idx_ordens_producao_numero_ordem ON ordens_producao(numero_ordem);
CREATE INDEX IF NOT EXISTS idx_ordem_producao_insumos_ordem_id ON ordem_producao_insumos(ordem_producao_id);
CREATE INDEX IF NOT EXISTS idx_ordem_producao_embalagens_ordem_id ON ordem_producao_embalagens(ordem_producao_id);
CREATE INDEX IF NOT EXISTS idx_ordem_producao_etapas_ordem_id ON ordem_producao_etapas(ordem_producao_id);
CREATE INDEX IF NOT EXISTS idx_ordem_producao_qualidade_ordem_id ON ordem_producao_qualidade(ordem_producao_id);
CREATE INDEX IF NOT EXISTS idx_historico_status_ordens_ordem_id ON historico_status_ordens(ordem_producao_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ordens_producao_updated_at 
    BEFORE UPDATE ON ordens_producao 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar histórico de status automaticamente
CREATE OR REPLACE FUNCTION create_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir no histórico quando o status mudar
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO historico_status_ordens (
            ordem_producao_id,
            status_anterior,
            status_novo,
            usuario_id
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.usuario_responsavel_id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_status_history 
    AFTER UPDATE ON ordens_producao 
    FOR EACH ROW EXECUTE FUNCTION create_status_history();

-- Função para gerar número de ordem automático
CREATE OR REPLACE FUNCTION generate_ordem_numero()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    new_numero VARCHAR(50);
BEGIN
    -- Gerar próximo número sequencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_ordem FROM 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM ordens_producao
    WHERE numero_ordem ~ '^OP[0-9]+$';
    
    -- Formatar como OP000001, OP000002, etc.
    new_numero := 'OP' || LPAD(next_number::TEXT, 6, '0');
    
    NEW.numero_ordem := new_numero;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_ordem_numero 
    BEFORE INSERT ON ordens_producao 
    FOR EACH ROW 
    WHEN (NEW.numero_ordem IS NULL OR NEW.numero_ordem = '')
    EXECUTE FUNCTION generate_ordem_numero();

-- RLS (Row Level Security) - Aplicar as mesmas políticas de segurança
ALTER TABLE ordens_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_producao_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_producao_embalagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_producao_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_producao_qualidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_status_ordens ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (usuários autenticados podem ver/editar)
CREATE POLICY "Usuários autenticados podem ver ordens de produção" ON ordens_producao
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir ordens de produção" ON ordens_producao
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar ordens de produção" ON ordens_producao
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar ordens de produção" ON ordens_producao
    FOR DELETE USING (auth.role() = 'authenticated');

-- Aplicar políticas similares para as outras tabelas
CREATE POLICY "Usuários autenticados podem ver insumos da ordem" ON ordem_producao_insumos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver embalagens da ordem" ON ordem_producao_embalagens
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver etapas da ordem" ON ordem_producao_etapas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver qualidade da ordem" ON ordem_producao_qualidade
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver histórico da ordem" ON historico_status_ordens
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários nas tabelas para documentação
COMMENT ON TABLE ordens_producao IS 'Tabela principal para controle de ordens de produção/manipulação';
COMMENT ON TABLE ordem_producao_insumos IS 'Insumos utilizados em cada ordem de produção';
COMMENT ON TABLE ordem_producao_embalagens IS 'Embalagens utilizadas em cada ordem de produção';
COMMENT ON TABLE ordem_producao_etapas IS 'Etapas do processo de manipulação para cada ordem';
COMMENT ON TABLE ordem_producao_qualidade IS 'Controle de qualidade para cada ordem de produção';
COMMENT ON TABLE historico_status_ordens IS 'Histórico de mudanças de status das ordens de produção';
