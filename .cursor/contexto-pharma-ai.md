# Contexto do Projeto Pharma.AI

## Visão Geral
O **Pharma.AI** é um sistema completo para gestão de farmácias de manipulação, desenvolvido com arquitetura híbrida (monólito modular + microsserviços de IA). O projeto está em desenvolvimento ativo e segue uma abordagem de implementação em fases.

## Tecnologias Implementadas

### Frontend
- **React 18.3.1** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui** para interface
- **React Router DOM** para roteamento
- **React Query (@tanstack/react-query)** para gerenciamento de estado servidor
- **React Hook Form** + **Zod** para formulários e validação
- **Recharts** para gráficos e dashboards
- **Lucide React** para ícones

### Backend e Infraestrutura
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** com extensões (pgvector para IA)
- **Row Level Security (RLS)** implementado
- **Edge Functions** para lógica serverless
- **Supabase Auth** para autenticação

### Ferramentas de Desenvolvimento
- **ESLint** + **TypeScript ESLint** para linting
- **Bun** como gerenciador de pacotes alternativo
- **Git** para versionamento
- **Lovable** como plataforma de desenvolvimento

## Estado Atual da Implementação

### ✅ Módulos Implementados

#### M09 - Usuários e Permissões (COMPLETO)
- Sistema de autenticação com Supabase Auth
- 4 perfis de usuário: Proprietário, Farmacêutico, Atendente, Manipulador
- Sistema de permissões granulares por módulo e ação
- Dashboards específicos por perfil
- Componentes de proteção de rotas
- Edge Function para criação sincronizada de usuários
- Trigger automático para sincronização auth.users ↔ usuarios

#### M05 - Manipulação Básica (IMPLEMENTADO)
- Sistema completo de ordens de produção
- Controle de etapas de manipulação
- Gestão de insumos e embalagens por ordem
- Controle de qualidade integrado
- Histórico de status automático
- Geração automática de números de ordem

#### M02 - Estoque (PARCIALMENTE IMPLEMENTADO)
- Gestão de insumos com lotes
- Gestão de embalagens
- Importação de NF-e (em desenvolvimento)
- Controle de validade e estoque mínimo

#### M06 - Financeiro (ESTRUTURA BÁSICA)
- Categorias financeiras
- Contas a pagar
- Fluxo de caixa (estrutura criada)

#### M01 - Cadastros Essenciais (PARCIAL)
- Fornecedores implementados
- Clientes (estrutura básica)

### 🚧 Em Desenvolvimento

#### M03 - Atendimento e Orçamentação
- Estrutura de pedidos criada
- Interface de nova receita em desenvolvimento
- Processamento de receitas com IA (planejado)

#### M08 - Inteligência Artificial
- Estrutura de páginas criada
- Integração com LLMs planejada
- Processamento de receitas
- Previsão de demanda
- Otimização de compras
- Análise de clientes

### 📋 Pendentes
- M04 - PDV e Vendas
- M07 - Fiscal e Tributário
- M10 - Relatórios Avançados

## Arquitetura do Sistema

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layouts/        # Layouts da aplicação
│   ├── Auth/           # Componentes de autenticação
│   └── [modulos]/      # Componentes específicos por módulo
├── modules/            # Módulos do sistema
│   └── usuarios-permissoes/  # Módulo completo implementado
├── pages/              # Páginas da aplicação
│   ├── admin/          # Área administrativa
│   └── [outras]/       # Páginas públicas
├── services/           # Serviços de integração
├── hooks/              # Custom hooks
├── contexts/           # Contextos React
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias
└── lib/                # Configurações de bibliotecas
```

### Banco de Dados
- **Tabelas principais implementadas:**
  - `usuarios` (perfis e dados)
  - `auth.users` (autenticação Supabase)
  - `ordens_producao` (sistema completo)
  - `insumos` e `lotes_insumos`
  - `embalagens`
  - `fornecedores`
  - `categorias_financeiras`
  - `contas_a_pagar`

### Sistema de Autenticação
- **Fluxo implementado:**
  1. Login via Supabase Auth
  2. Verificação de perfil na tabela `usuarios`
  3. Carregamento de permissões
  4. Redirecionamento para dashboard específico
  5. Proteção de rotas por permissões

### Dashboards por Perfil
- **Proprietário:** Dashboard administrativo completo
- **Farmacêutico:** Foco em produção e qualidade
- **Atendente:** Foco em atendimento e pedidos
- **Manipulador:** Foco em ordens de produção

## Configuração do Ambiente

### Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run build:dev` - Build para desenvolvimento
- `npm run lint` - Verificação de código
- `npm run preview` - Preview do build

## Próximos Passos Prioritários

1. **Unificação de Dashboards** - Integrar dashboard administrativo no layout principal
2. **Finalização do M03** - Completar sistema de atendimento
3. **Integração de IA** - Implementar processamento de receitas
4. **M04 - PDV** - Sistema de vendas
5. **Relatórios** - Sistema de relatórios avançados

## Padrões de Desenvolvimento

### Convenções de Código
- **Componentes:** PascalCase, funcionais com hooks
- **Arquivos:** kebab-case para utilitários, PascalCase para componentes
- **Tipos:** Interfaces em PascalCase, enums em UPPER_CASE
- **Funções:** camelCase

### Estrutura de Commits
- `feat:` - Novas funcionalidades
- `fix:` - Correções de bugs
- `docs:` - Documentação
- `refactor:` - Refatorações
- `test:` - Testes

### Segurança
- RLS habilitado em todas as tabelas
- Validação dupla (frontend + backend)
- Sanitização de inputs
- Auditoria de ações sensíveis

---

*Última atualização: 2024-12-26*
*Status: Em desenvolvimento ativo*
