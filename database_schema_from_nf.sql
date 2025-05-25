-- =====================================================
-- SCHEMA DO BANCO DE DADOS PHARMA.AI
-- Baseado na análise da Nota Fiscal XML
-- Seguindo as diretrizes do projeto
-- =====================================================

-- =====================================================
-- MÓDULO M01: CADASTROS ESSENCIAIS
-- =====================================================

-- Tabela de Fornecedores/Fabricantes
CREATE TABLE fornecedor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    cnae VARCHAR(10),
    crt INTEGER, -- Código de Regime Tributário
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    -- Endereço
    logradouro VARCHAR(255),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    cep VARCHAR(8),
    codigo_municipio VARCHAR(7),
    pais VARCHAR(50) DEFAULT 'BRASIL',
    
    -- Controle
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Categorias de Produtos
CREATE TABLE categoria_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    codigo VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Formas Farmacêuticas
CREATE TABLE forma_farmaceutica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL, -- TM, CH, FC, etc.
    descricao TEXT,
    sigla VARCHAR(10),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Principal de Produtos/Insumos
CREATE TABLE produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_interno VARCHAR(50) UNIQUE NOT NULL, -- cProd do XML
    codigo_ean VARCHAR(14), -- cEAN do XML (pode ser "SEM GTIN")
    nome VARCHAR(255) NOT NULL, -- xProd do XML
    descricao TEXT,
    
    -- Classificações
    categoria_produto_id UUID REFERENCES categoria_produto(id),
    forma_farmaceutica_id UUID REFERENCES forma_farmaceutica(id),
    fornecedor_id UUID REFERENCES fornecedor(id),
    
    -- Dados Fiscais
    ncm VARCHAR(8) NOT NULL, -- NCM do XML
    cfop VARCHAR(4), -- CFOP padrão para o produto
    origem INTEGER, -- Origem da mercadoria (0, 1, 2, etc.)
    cst_icms VARCHAR(3), -- CST do ICMS
    cst_ipi VARCHAR(2), -- CST do IPI
    cst_pis VARCHAR(2), -- CST do PIS
    cst_cofins VARCHAR(2), -- CST do COFINS
    
    -- Unidades
    unidade_comercial VARCHAR(10) NOT NULL, -- uCom do XML
    unidade_tributaria VARCHAR(10), -- uTrib do XML
    
    -- Preços e Custos
    preco_custo DECIMAL(10,4),
    preco_venda DECIMAL(10,4),
    margem_lucro DECIMAL(5,2),
    
    -- Impostos (percentuais padrão)
    aliquota_icms DECIMAL(5,2),
    aliquota_ipi DECIMAL(5,2),
    aliquota_pis DECIMAL(5,2),
    aliquota_cofins DECIMAL(5,2),
    
    -- Controle de Estoque
    estoque_minimo DECIMAL(10,3) DEFAULT 0,
    estoque_maximo DECIMAL(10,3) DEFAULT 0,
    estoque_atual DECIMAL(10,3) DEFAULT 0,
    
    -- Flags de Controle
    controlado BOOLEAN DEFAULT false, -- Medicamento controlado
    requer_receita BOOLEAN DEFAULT false,
    produto_manipulado BOOLEAN DEFAULT false,
    produto_revenda BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MÓDULO M04: GESTÃO DE ESTOQUE
-- =====================================================

-- Tabela de Lotes
CREATE TABLE lote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produto(id),
    numero_lote VARCHAR(50) NOT NULL, -- nLote do XML
    data_fabricacao DATE, -- dFab do XML
    data_validade DATE, -- dVal do XML
    quantidade_inicial DECIMAL(10,3) NOT NULL,
    quantidade_atual DECIMAL(10,3) NOT NULL,
    preco_custo_unitario DECIMAL(10,4),
    
    -- Controle
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(produto_id, numero_lote)
);

-- =====================================================
-- MÓDULO M10: FISCAL
-- =====================================================

-- Tabela de Notas Fiscais
CREATE TABLE nota_fiscal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação da NF-e
    chave_acesso VARCHAR(44) UNIQUE NOT NULL, -- Chave de 44 dígitos
    numero_nf INTEGER NOT NULL,
    serie INTEGER NOT NULL,
    modelo INTEGER DEFAULT 55, -- 55 = NF-e
    
    -- Datas
    data_emissao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_saida_entrada TIMESTAMP WITH TIME ZONE,
    data_recebimento TIMESTAMP WITH TIME ZONE,
    
    -- Emitente
    fornecedor_id UUID NOT NULL REFERENCES fornecedor(id),
    
    -- Valores Totais
    valor_produtos DECIMAL(12,4) NOT NULL,
    valor_frete DECIMAL(12,4) DEFAULT 0,
    valor_seguro DECIMAL(12,4) DEFAULT 0,
    valor_desconto DECIMAL(12,4) DEFAULT 0,
    valor_outras_despesas DECIMAL(12,4) DEFAULT 0,
    valor_total_nota DECIMAL(12,4) NOT NULL,
    
    -- Impostos Totais
    base_calculo_icms DECIMAL(12,4),
    valor_icms DECIMAL(12,4),
    valor_ipi DECIMAL(12,4),
    valor_pis DECIMAL(12,4),
    valor_cofins DECIMAL(12,4),
    valor_total_tributos DECIMAL(12,4),
    
    -- Transporte
    modalidade_frete INTEGER, -- 0=Emitente, 1=Destinatário, etc.
    transportadora_cnpj VARCHAR(14),
    transportadora_nome VARCHAR(255),
    peso_liquido DECIMAL(10,3),
    peso_bruto DECIMAL(10,3),
    quantidade_volumes INTEGER,
    
    -- Status e Controle
    status VARCHAR(20) DEFAULT 'RECEBIDA', -- RECEBIDA, PROCESSADA, CANCELADA
    observacoes TEXT,
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens da Nota Fiscal
CREATE TABLE item_nota_fiscal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_fiscal_id UUID NOT NULL REFERENCES nota_fiscal(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produto(id),
    lote_id UUID REFERENCES lote(id),
    
    -- Sequencial do item na nota
    numero_item INTEGER NOT NULL,
    
    -- Quantidades e Valores
    quantidade_comercial DECIMAL(10,4) NOT NULL,
    valor_unitario_comercial DECIMAL(10,4) NOT NULL,
    quantidade_tributaria DECIMAL(10,4),
    valor_unitario_tributario DECIMAL(10,4),
    valor_total_produto DECIMAL(12,4) NOT NULL,
    valor_frete DECIMAL(12,4) DEFAULT 0,
    
    -- Dados Fiscais do Item
    cfop VARCHAR(4) NOT NULL,
    ncm VARCHAR(8) NOT NULL,
    
    -- ICMS
    origem_mercadoria INTEGER NOT NULL,
    cst_icms VARCHAR(3) NOT NULL,
    base_calculo_icms DECIMAL(12,4),
    aliquota_icms DECIMAL(5,2),
    valor_icms DECIMAL(12,4),
    
    -- IPI
    cst_ipi VARCHAR(2),
    base_calculo_ipi DECIMAL(12,4),
    aliquota_ipi DECIMAL(5,2),
    valor_ipi DECIMAL(12,4),
    
    -- PIS
    cst_pis VARCHAR(2),
    base_calculo_pis DECIMAL(12,4),
    aliquota_pis DECIMAL(5,2),
    valor_pis DECIMAL(12,4),
    
    -- COFINS
    cst_cofins VARCHAR(2),
    base_calculo_cofins DECIMAL(12,4),
    aliquota_cofins DECIMAL(5,2),
    valor_cofins DECIMAL(12,4),
    
    -- Valor total dos tributos do item
    valor_total_tributos DECIMAL(12,4),
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para busca e performance
CREATE INDEX idx_produto_codigo_interno ON produto(codigo_interno);
CREATE INDEX idx_produto_codigo_ean ON produto(codigo_ean);
CREATE INDEX idx_produto_nome ON produto USING gin(to_tsvector('portuguese', nome));
CREATE INDEX idx_produto_fornecedor ON produto(fornecedor_id);
CREATE INDEX idx_produto_categoria ON produto(categoria_produto_id);

CREATE INDEX idx_lote_produto ON lote(produto_id);
CREATE INDEX idx_lote_numero ON lote(numero_lote);
CREATE INDEX idx_lote_validade ON lote(data_validade);

CREATE INDEX idx_nota_fiscal_chave ON nota_fiscal(chave_acesso);
CREATE INDEX idx_nota_fiscal_fornecedor ON nota_fiscal(fornecedor_id);
CREATE INDEX idx_nota_fiscal_data_emissao ON nota_fiscal(data_emissao);

CREATE INDEX idx_item_nota_fiscal_nota ON item_nota_fiscal(nota_fiscal_id);
CREATE INDEX idx_item_nota_fiscal_produto ON item_nota_fiscal(produto_id);

-- =====================================================
-- TRIGGERS PARA AUDITORIA E CONTROLE
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_fornecedor_updated_at BEFORE UPDATE ON fornecedor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categoria_produto_updated_at BEFORE UPDATE ON categoria_produto FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forma_farmaceutica_updated_at BEFORE UPDATE ON forma_farmaceutica FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produto_updated_at BEFORE UPDATE ON produto FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lote_updated_at BEFORE UPDATE ON lote FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nota_fiscal_updated_at BEFORE UPDATE ON nota_fiscal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_nota_fiscal_updated_at BEFORE UPDATE ON item_nota_fiscal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (ROW LEVEL SECURITY) - Conforme diretrizes
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE forma_farmaceutica ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE lote ENABLE ROW LEVEL SECURITY;
ALTER TABLE nota_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_nota_fiscal ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (a serem refinadas conforme módulo de usuários)
CREATE POLICY "Usuários autenticados podem ver fornecedores" ON fornecedor FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver categorias" ON categoria_produto FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver formas farmacêuticas" ON forma_farmaceutica FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver produtos" ON produto FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver lotes" ON lote FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver notas fiscais" ON nota_fiscal FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuários autenticados podem ver itens de notas fiscais" ON item_nota_fiscal FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- DADOS INICIAIS BASEADOS NA NOTA FISCAL
-- =====================================================

-- Inserir categorias identificadas
INSERT INTO categoria_produto (nome, descricao, codigo) VALUES
('Tinturas Mães', 'Tinturas mães homeopáticas e fitoterápicas', 'TM'),
('Florais de Bach', 'Essências florais de Bach importadas', 'BACH'),
('Medicamentos Homeopáticos', 'Medicamentos homeopáticos dinamizados', 'HOMEO'),
('Produtos Manipulados', 'Produtos manipulados pela farmácia', 'MANIP');

-- Inserir formas farmacêuticas identificadas
INSERT INTO forma_farmaceutica (nome, descricao, sigla) VALUES
('Tintura Mãe', 'Tintura mãe homeopática', 'TM'),
('Centesimal Hahnemanniana', 'Dinamização centesimal hahnemanniana', 'CH'),
('Fluxo Contínuo', 'Dinamização por fluxo contínuo', 'FC'),
('Essência Floral', 'Essência floral de Bach', 'FLORAL');

-- Inserir fornecedor da nota fiscal
INSERT INTO fornecedor (
    cnpj, razao_social, nome_fantasia, inscricao_estadual, 
    inscricao_municipal, telefone, logradouro, numero, 
    bairro, cidade, uf, cep, codigo_municipio
) VALUES (
    '62134671000100',
    'Laboratorio Schraibmann Ltda.',
    'Schraiber',
    '278222467114',
    '6009393',
    '1131981030',
    'Avenida Vasco Massafeli',
    '1605',
    'Jardim Maria Tereza',
    'Cotia',
    'SP',
    '06703600',
    '3513009'
);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE fornecedor IS 'Cadastro de fornecedores e fabricantes de produtos farmacêuticos';
COMMENT ON TABLE categoria_produto IS 'Categorização de produtos por tipo (TM, Florais, Homeopáticos, etc.)';
COMMENT ON TABLE forma_farmaceutica IS 'Formas farmacêuticas e tipos de dinamização';
COMMENT ON TABLE produto IS 'Cadastro principal de produtos/insumos farmacêuticos';
COMMENT ON TABLE lote IS 'Controle de lotes com rastreabilidade completa';
COMMENT ON TABLE nota_fiscal IS 'Registro de notas fiscais de entrada';
COMMENT ON TABLE item_nota_fiscal IS 'Itens detalhados das notas fiscais com informações fiscais completas';

COMMENT ON COLUMN produto.codigo_interno IS 'Código interno do produto (cProd do XML da NF-e)';
COMMENT ON COLUMN produto.codigo_ean IS 'Código EAN/GTIN do produto (pode ser "SEM GTIN")';
COMMENT ON COLUMN produto.ncm IS 'Nomenclatura Comum do Mercosul (obrigatório para NF-e)';
COMMENT ON COLUMN produto.controlado IS 'Indica se é medicamento controlado (SNGPC)';
COMMENT ON COLUMN lote.numero_lote IS 'Número do lote conforme fornecedor (rastreabilidade)';
COMMENT ON COLUMN nota_fiscal.chave_acesso IS 'Chave de acesso da NF-e (44 dígitos)'; 