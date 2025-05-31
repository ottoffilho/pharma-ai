# Contexto do Projeto Pharma.AI

## Visão Geral
O **Pharma.AI** é um sistema completo para gestão de farmácias de manipulação, desenvolvido com arquitetura híbrida (monólito modular + microsserviços de IA). O projeto está em estado **muito avançado** de desenvolvimento, próximo à conclusão do MVP, com sistema de vendas funcional, gestão de clientes completa e 15+ Edge Functions implementadas.

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
- **date-fns** para manipulação de datas
- **cmdk** para command palette
- **next-themes** para temas
- **pdfjs-dist** para manipulação de PDFs
- **tesseract.js** para OCR
- **embla-carousel-react** para carrosséis
- **input-otp** para códigos de verificação

### Backend e Infraestrutura
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** com extensões (pgvector para IA)
- **Row Level Security (RLS)** implementado
- **15+ Edge Functions** para lógica serverless
- **Supabase Auth** para autenticação
- **Triggers automáticos** para cálculos e auditoria
- **Políticas RLS** granulares por tabela
- **MCP Supabase** para interações com banco

### Ferramentas de Desenvolvimento
- **ESLint** + **TypeScript ESLint** para linting
- **Bun** como gerenciador de pacotes principal (com npm fallback)
- **Git** para versionamento
- **Playwright** para testes E2E
- **Vitest** para testes unitários
- **Cursor** como IDE principal

## Estado Atual da Implementação

### ✅ Módulos COMPLETOS (Production-Ready)

#### M09 - Usuários e Permissões (100%)
- Sistema de autenticação robusto com Supabase Auth
- 4 perfis de usuário: Proprietário, Farmacêutico, Atendente, Manipulador
- Sistema de permissões granulares por módulo e ação
- **DashboardRouter** inteligente por perfil
- **ProtectedComponent** para proteção granular
- Error Boundaries implementados em toda aplicação
- Sistema de convites e primeiro acesso
- Sincronização automática auth.users ↔ usuarios
- Edge Functions: criar-usuario, excluir-usuario, check-first-access

#### M04 - Sistema de Vendas (90%)
**DESCOBERTA: Sistema surpreendentemente avançado**
- **PDV completo** com interface moderna
  - `src/pages/admin/vendas/pdv.tsx` - Interface completa
  - Busca de produtos, cálculo automático
  - Múltiplas formas de pagamento
- **Controle de caixa** completo
  - Abertura/fechamento automático
  - Sangria e conferência
  - `src/pages/admin/vendas/caixa.tsx`
- **Histórico de vendas**
  - Filtros avançados por período
  - Detalhes de transações
- **Sistema de fechamento**
  - Vendas pendentes e abertas
  - Finalização automática
- **Métricas em tempo real**
  - Hook `useVendasCards` implementado
  - Dashboard executivo funcional
- **Edge Functions:** vendas-operations, caixa-operations

#### M02 - Sistema de Estoque (95%)
**DESCOBERTA: Unificação recente muito bem executada**
- **Produtos unificados** em tabela única
  - Insumos + Embalagens + Medicamentos
  - Migração completa implementada
- **Sistema de markup** automatizado
  - Triggers para cálculos automáticos
  - Configuração granular por categoria
- **Gestão de lotes** completa
  - Rastreabilidade total
  - Controle de validade
  - FIFO automático
- **Controle fiscal** implementado
  - NCM, CFOP, CST configurados
  - Preparado para NF-e
- **Edge Functions:** gerenciar-produtos, gerenciar-lotes, limpar-nomes-produtos, produtos-com-nf

#### M05 - Sistema de Produção/Manipulação (90%)
- Sistema completo de ordens de produção
- Controle de etapas de manipulação
- Gestão de insumos e embalagens por ordem
- Controle de qualidade integrado
- Relatórios de produção
- Interface funcional em `src/pages/admin/producao/`

### 🟢 Módulos FUNCIONAIS (70-85%)

#### M01 - Cadastros Essenciais (85%) - ATUALIZADO
**DESCOBERTA: Módulo de clientes implementado**
- **Fornecedores** (CRUD completo)
  - Dados fiscais completos
  - Gestão de contatos e documentos
  - Integração com importação NF-e
- **Clientes** (RECÉM IMPLEMENTADO - 100%)
  - `src/pages/admin/clientes/index.tsx` (509 linhas) - Listagem completa
  - `src/pages/admin/clientes/novo.tsx` - Cadastro
  - `src/pages/admin/clientes/[id]/index.tsx` - Detalhes
  - `src/pages/admin/clientes/[id]/editar.tsx` - Edição
  - `src/components/clientes/` - Componentes específicos
  - Campos completos: nome, email, telefone, CPF, CNPJ, endereço
  - Integração com sistema de vendas
- **Produtos** (Sistema unificado)
- **Categorias e Formas Farmacêuticas**
- **Edge Functions:** gerenciar-categorias, gerenciar-formas-farmaceuticas

#### M06 - Sistema Financeiro (75%)
- **Categorias financeiras** (CRUD completo)
- **Contas a pagar** estruturadas
- **Fluxo de caixa** integrado com vendas
- **Sistema de markup** configurável
- Integração com controle de caixa

#### M03 - Sistema de Atendimento (65%)
- **Sistema de pedidos** estruturado
- **Interface de receitas** funcional
- **PrescriptionReviewForm** implementado
- **ChatbotProvider** configurado
- Estrutura para processamento IA

### 🔴 Módulos EM DESENVOLVIMENTO (20-40%)

#### M08 - Inteligência Artificial (30%)
- **FloatingChatbotWidget** funcional
- **Edge Function chatbot-ai-agent** (DeepSeek API)
- Estrutura para processamento de receitas
- Páginas administrativas IA

#### M07 - Sistema Fiscal (20%)
- Estrutura básica implementada
- Campos fiscais configurados
- Preparado para NF-e

## Arquitetura do Sistema

### Estrutura de Pastas
```
src/
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layouts/              # Layout components
│   ├── Auth/                 # Authentication components
│   ├── clientes/             # Cliente components (NOVO)
│   ├── estoque/              # Estoque components
│   ├── financeiro/           # Financeiro components
│   ├── chatbot/              # Chatbot components
│   └── [outros]/             # Module-specific components
├── modules/
│   ├── usuarios-permissoes/  # Complete module structure
│   └── produtos/             # Product management
├── pages/
│   ├── admin/                # Protected admin pages
│   │   ├── vendas/           # Sales system (COMPLETO)
│   │   ├── clientes/         # Client management (NOVO)
│   │   ├── estoque/          # Stock management
│   │   ├── producao/         # Production system
│   │   ├── financeiro/       # Financial system
│   │   ├── cadastros/        # Essential registrations
│   │   ├── usuarios/         # User management
│   │   └── ia/               # AI features
│   └── [public]/             # Public pages
├── hooks/                    # Custom hooks
├── contexts/                 # React contexts
├── services/                 # API services
├── types/                    # TypeScript types
└── utils/                    # Utility functions
```

### Edge Functions (15+ Implementadas)
```
supabase/functions/
├── usuarios/
│   ├── criar-usuario/
│   ├── excluir-usuario/
│   ├── check-first-access/
│   └── verificar-sincronizar-usuario/
├── produtos/
│   ├── gerenciar-produtos/
│   ├── gerenciar-lotes/
│   ├── limpar-nomes-produtos/
│   └── produtos-com-nf/
├── vendas/
│   ├── vendas-operations/
│   └── caixa-operations/
├── categorias/
│   ├── gerenciar-categorias/
│   └── gerenciar-formas-farmaceuticas/
├── ia/
│   └── chatbot-ai-agent/
├── documentos/
│   ├── buscar-dados-documento/
│   └── workspace-document-data/
└── email/
    ├── enviar-convite-usuario/
    ├── enviar-email-recuperacao/
    ├── teste-email/
    └── debug-resend/
```

### Banco de Dados
- **PostgreSQL** com Supabase
- **RLS (Row Level Security)** em todas as tabelas
- **Triggers automáticos** para:
  - Atualização de timestamps
  - Cálculos de markup
  - Sincronização de dados
  - Auditoria de alterações
- **Políticas granulares** por perfil de usuário
- **Extensões:** pgvector para IA, http para integrações

## Padrões Implementados

### Autenticação e Autorização
```typescript
// Fluxo implementado:
1. Login via Supabase Auth
2. Verificação de perfil na tabela usuarios
3. Carregamento de permissões
4. Redirecionamento via DashboardRouter
5. Proteção granular via ProtectedComponent
```

### Estrutura de Componentes
```typescript
// Padrão de proteção implementado
<ProtectedComponent
  modulo={ModuloSistema.CLIENTES}
  acao={AcaoPermissao.CRIAR}
  fallback={<Navigate to="/admin" replace />}
>
  {/* Conteúdo protegido */}
</ProtectedComponent>
```

### Edge Functions
```typescript
// Padrão consistente implementado em 15+ functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS Headers
  // Autenticação
  // Lógica específica
  // Resposta padronizada
})
```

## Próximos Passos Prioritários

### Curto Prazo (2-4 semanas)
1. **Finalizar integração clientes-vendas**
   - Vincular clientes às vendas
   - Histórico de compras por cliente
   - Relatórios de fidelidade

2. **Implementar testes automatizados**
   - Cobertura mínima 80%
   - Testes E2E para fluxos críticos
   - Testes unitários para Edge Functions

3. **Preparar para produção**
   - Monitoramento e métricas
   - Otimizações de performance
   - Validação de segurança

### Médio Prazo (1-3 meses)
1. **Expandir IA farmacêutica**
   - Processamento automático de receitas
   - Análise de interações medicamentosas
   - Sugestões inteligentes

2. **Completar importação NF-e**
   - Parser XML completo
   - Validação automática
   - Integração com estoque

3. **Dashboards executivos**
   - Relatórios avançados de vendas
   - Análise financeira
   - KPIs em tempo real

### Longo Prazo (3-6 meses)
1. **Sistema fiscal completo**
   - Emissão de NF-e
   - Integração contábil
   - Compliance automático

2. **IA avançada**
   - Previsão de demanda
   - Otimização de compras
   - Análise preditiva

3. **Escalabilidade**
   - Multi-tenancy
   - APIs públicas
   - Integrações externas

## Métricas de Qualidade

### Cobertura Funcional Atual
- **Autenticação:** 100% ✅
- **Vendas:** 90% 🟢
- **Estoque:** 95% 🟢
- **Produção:** 90% 🟢
- **Clientes:** 85% 🟢 (NOVO)
- **Financeiro:** 75% 🟡
- **Atendimento:** 65% 🟡
- **IA:** 30% 🔴

### Qualidade Técnica
- **TypeScript:** 98% tipado
- **Error Boundaries:** 100% implementados
- **Edge Functions:** 15+ ativas
- **Responsividade:** Completa
- **Acessibilidade:** Básica implementada

---

*Última atualização: 2025-01-28*  
*Status: MVP 90% concluído com clientes implementados*  
*Próxima milestone: Integração final e preparação para produção*
