-- Script de Recriação de Tabelas Essenciais - Pharma.AI
-- Este script deve ser executado quando as tabelas essenciais foram excluídas acidentalmente
-- Executar diretamente no console SQL do Supabase

-- 1. Tabela de Perfis (deve ser criada primeiro por causa das foreign keys)
CREATE TABLE IF NOT EXISTS public.perfis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  dashboard_padrao VARCHAR(50) DEFAULT 'ADMINISTRATIVO',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Usuários 
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_auth_id UUID UNIQUE,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  perfil_id UUID NOT NULL REFERENCES public.perfis_usuario(id),
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Permissões
CREATE TABLE IF NOT EXISTS public.permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.perfis_usuario(id),
  modulo VARCHAR(50) NOT NULL,
  acao VARCHAR(50) NOT NULL,
  nivel VARCHAR(50) DEFAULT 'TODOS',
  permitido BOOLEAN DEFAULT TRUE,
  condicoes JSONB,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (perfil_id, modulo, acao)
);

-- 4. Tabela de Ordens de Produção
CREATE TABLE IF NOT EXISTS public.ordens_producao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20) NOT NULL UNIQUE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_previsao TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'CRIADA',
  observacoes TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  responsavel_id UUID REFERENCES public.usuarios(id),
  cliente_id UUID,
  receita_id UUID,
  custo_total DECIMAL(15, 2) DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Histórico de Status de Ordens
CREATE TABLE IF NOT EXISTS public.historico_ordens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.ordens_producao(id),
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50) NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id),
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  contato VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Insumos
CREATE TABLE IF NOT EXISTS public.insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  unidade VARCHAR(20) NOT NULL,
  estoque_atual DECIMAL(15, 4) DEFAULT 0,
  estoque_minimo DECIMAL(15, 4) DEFAULT 0,
  categoria VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Lotes de Insumos
CREATE TABLE IF NOT EXISTS public.lotes_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id UUID NOT NULL REFERENCES public.insumos(id),
  numero_lote VARCHAR(50) NOT NULL,
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  quantidade DECIMAL(15, 4) NOT NULL,
  quantidade_disponivel DECIMAL(15, 4) NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  nota_fiscal VARCHAR(50),
  preco_unitario DECIMAL(15, 2),
  localizacao VARCHAR(100),
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (insumo_id, numero_lote, fornecedor_id)
);

-- 9. Tabela de Embalagens
CREATE TABLE IF NOT EXISTS public.embalagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50),
  capacidade VARCHAR(50),
  unidade VARCHAR(20) NOT NULL,
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Categorias Financeiras
CREATE TABLE IF NOT EXISTS public.categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  descricao TEXT,
  pai_id UUID REFERENCES public.categorias_financeiras(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabela de Contas a Pagar
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  categoria_id UUID REFERENCES public.categorias_financeiras(id),
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  comprovante_url TEXT,
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar perfil padrão se não existir
INSERT INTO public.perfis_usuario (id, nome, tipo, dashboard_padrao, ativo)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Administrador', 'ADMIN', 'ADMINISTRATIVO', true),
  ('00000000-0000-0000-0000-000000000002', 'Farmacêutico', 'FARMACEUTICO', 'FARMACEUTICO', true),
  ('00000000-0000-0000-0000-000000000003', 'Atendente', 'ATENDENTE', 'ATENDIMENTO', true),
  ('00000000-0000-0000-0000-000000000004', 'Manipulador', 'MANIPULADOR', 'PRODUCAO', true)
ON CONFLICT (id) DO NOTHING;

-- Adicionar permissões básicas para o perfil administrador
INSERT INTO public.permissoes (perfil_id, modulo, acao, nivel)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'USUARIOS_PERMISSOES', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'USUARIOS_PERMISSOES', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'USUARIOS_PERMISSOES', 'EDITAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'USUARIOS_PERMISSOES', 'EXCLUIR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'PRODUCAO', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'PRODUCAO', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'PRODUCAO', 'EDITAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'ESTOQUE', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'ESTOQUE', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'ESTOQUE', 'EDITAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'FINANCEIRO', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'FINANCEIRO', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'FINANCEIRO', 'EDITAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'ATENDIMENTO', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'ATENDIMENTO', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'ATENDIMENTO', 'EDITAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'CADASTROS', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'CADASTROS', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'CADASTROS', 'EDITAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'IA', 'VISUALIZAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'IA', 'CRIAR', 'TODOS'),
  ('00000000-0000-0000-0000-000000000001', 'IA', 'EDITAR', 'TODOS')
ON CONFLICT (perfil_id, modulo, acao) DO NOTHING;

-- Configurar Row Level Security
-- Habilitar RLS para todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_ordens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embalagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem perfis
CREATE POLICY perfis_view_policy ON public.perfis_usuario
  FOR SELECT TO authenticated
  USING (true);

-- Política para usuários autenticados verem outros usuários
CREATE POLICY usuarios_view_policy ON public.usuarios
  FOR SELECT TO authenticated
  USING (true);

-- Política para usuários autenticados verem permissões
CREATE POLICY permissoes_view_policy ON public.permissoes
  FOR SELECT TO authenticated
  USING (true);

-- Política para usuários autenticados manipularem ordens de produção
CREATE POLICY ordens_view_policy ON public.ordens_producao
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY ordens_insert_policy ON public.ordens_producao
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY ordens_update_policy ON public.ordens_producao
  FOR UPDATE TO authenticated
  USING (true);

-- Políticas para outras tabelas essenciais
CREATE POLICY fornecedores_view_policy ON public.fornecedores
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY insumos_view_policy ON public.insumos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY lotes_insumos_view_policy ON public.lotes_insumos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY embalagens_view_policy ON public.embalagens
  FOR SELECT TO authenticated
  USING (true);

-- Adicionar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_ordens_producao_numero ON public.ordens_producao(numero);
CREATE INDEX IF NOT EXISTS idx_ordens_producao_status ON public.ordens_producao(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil_id ON public.usuarios(perfil_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_perfil_id ON public.permissoes(perfil_id);
CREATE INDEX IF NOT EXISTS idx_insumos_codigo ON public.insumos(codigo);
CREATE INDEX IF NOT EXISTS idx_lotes_insumos_validade ON public.lotes_insumos(data_validade);
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON public.fornecedores(nome);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar(data_vencimento);

-- Adicionar trigger para atualizar campos de timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.atualizado_em = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers nas tabelas
DO $$
DECLARE
  tabelas text[] := ARRAY['usuarios', 'perfis_usuario', 'ordens_producao', 'fornecedores', 
                           'insumos', 'lotes_insumos', 'embalagens', 'categorias_financeiras', 'contas_pagar'];
  tabela text;
BEGIN
  FOREACH tabela IN ARRAY tabelas LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_timestamp ON public.%I', tabela, tabela);
    EXECUTE format('CREATE TRIGGER update_%I_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_timestamp()', tabela, tabela);
  END LOOP;
END
$$; 