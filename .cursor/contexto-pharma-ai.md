# Contexto do Projeto Pharma.AI

## Visão Geral
O **Pharma.AI** é um sistema completo para gestão de farmácias de manipulação, desenvolvido com arquitetura híbrida (monólito modular + microsserviços de IA). O projeto está em estado **muito avançado** de desenvolvimento, próximo à conclusão do MVP, com sistema de vendas funcional e 15+ Edge Functions implementadas.

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

### Backend e Infraestrutura
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** com extensões (pgvector para IA)
- **Row Level Security (RLS)** implementado
- **15+ Edge Functions** para lógica serverless
- **Supabase Auth** para autenticação
- **Triggers automáticos** para cálculos e auditoria
- **Políticas RLS** granulares por tabela

### Ferramentas de Desenvolvimento
- **ESLint** + **TypeScript ESLint** para linting
- **Bun** como gerenciador de pacotes principal
- **Git** para versionamento
- **Lovable** como plataforma de desenvolvimento

## Estado Atual da Implementação

### ✅ Módulos COMPLETOS (Production-Ready)

#### M09 - Usuários e Permissões (100%)
- Sistema de autenticação robusto com Supabase Auth
- 4 perfis de usuário: Proprietário, Farmacêutico, Atendente, Manipulador
- Sistema de permissões granulares por módulo e ação
- **DashboardRouter** inteligente por perfil
- **ProtectedComponent** para proteção granular
- **Error Boundaries** implementados
- Edge Functions: `criar-usuario`, `excluir-usuario`, `check-first-access`
- Sistema completo de convites e primeiro acesso
- Trigger automático para sincronização auth.users ↔ usuarios

### 🟢 Módulos IMPLEMENTADOS (90%+)

#### M04 - PDV e Vendas (90% - SURPRESA!)
**Sistema muito mais avançado que documentado anteriormente**
- **PDV completo** com interface moderna (39KB de código)
- **Controle de caixa** (abertura/fechamento/sangria/conferência)
- **Histórico de vendas** com filtros avançados
- **Fechamento de vendas** pendentes
- **Sistema de pagamentos** múltiplos
- **Hook useVendasCards** para métricas em tempo real
- **Edge Function vendas-operations** completa
- Integração com produtos e estoque
- Apenas pendente: Relatórios avançados e gestão de clientes

#### M05 - Manipulação/Produção (90%)
- Sistema completo de ordens de produção
- Controle de etapas de manipulação
- Gestão de insumos e embalagens por ordem
- Controle de qualidade integrado
- Histórico de status automático
- Geração automática de números de ordem
- Interface funcional completa

#### M02 - Estoque (95% - UNIFICADO!)
**Recente unificação muito bem executada**
- **Tabela produtos unificada** (insumos + embalagens + medicamentos)
- **Sistema de markup** automatizado com triggers
- **Gestão completa de lotes** com rastreabilidade
- **Edge Functions:** `gerenciar-produtos`, `gerenciar-lotes`
- **Triggers automáticos** para cálculos de preço
- **Importação NF-e** (estrutura 80% completa)
- **Controle fiscal** (NCM, CFOP, CST implementados)
- Apenas pendente: Finalizar importação NF-e

### 🟡 Módulos PARCIAIS (60-80%)

#### M06 - Financeiro (75%)
- **Categorias financeiras** (CRUD completo)
- **Contas a pagar** (estrutura avançada)
- **Fluxo de caixa** integrado com vendas
- **Sistema de markup** com configuração granular
- Integração com sistema de vendas
- Pendente: Relatórios financeiros avançados

#### M01 - Cadastros Essenciais (80%)
- **Fornecedores** (CRUD completo)
- **Produtos unificados** (sistema completo)
- **Categorias de produtos** e **formas farmacêuticas**
- **Edge Functions:** `gerenciar-categorias`, `gerenciar-formas-farmaceuticas`
- Pendente: Clientes avançados, outras entidades

#### M03 - Atendimento e Orçamentação (60%)
- **Sistema de pedidos** estruturado
- **Interface de nova receita** funcional
- **Processamento de prescrições** (estrutura criada)
- **PrescriptionReviewForm** implementado
- Pendente: IA para processamento automático

### 🔴 Em Desenvolvimento

#### M08 - Inteligência Artificial (25%)
**Estrutura funcional criada**
- **FloatingChatbotWidget** implementado
- **Edge Function chatbot-ai-agent** funcional
- **ChatbotProvider** e contexto completo
- Páginas de overview IA criadas
- Pendente: Funcionalidades específicas para farmácia

### 📋 Pendentes
- **M07 - Fiscal e Tributário** (10% - base criada)
- **M10 - Relatórios Avançados** (5% - estrutura básica)

## Arquitetura do Sistema

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── layouts/        # Layouts da aplicação
│   ├── Auth/           # Componentes de autenticação
│   ├── estoque/        # Componentes de estoque
│   ├── markup/         # Sistema de markup
│   ├── chatbot/        # Sistema de chatbot
│   ├── ImportacaoNF/   # Importação de NF-e
│   ├── cadastros/      # Cadastros gerais
│   ├── financeiro/     # Componentes financeiros
│   ├── usuarios/       # Gestão de usuários
│   └── prescription/   # Processamento de receitas
├── modules/            # Módulos do sistema
│   └── usuarios-permissoes/  # Módulo completo implementado
├── pages/              # Páginas da aplicação
│   ├── admin/          # Área administrativa completa
│   │   ├── vendas/     # Sistema de vendas completo
│   │   ├── estoque/    # Gestão de estoque
│   │   ├── producao/   # Ordens de produção
│   │   ├── financeiro/ # Módulo financeiro
│   │   ├── cadastros/  # Cadastros essenciais
│   │   ├── usuarios/   # Gestão de usuários
│   │   └── ia/         # Funcionalidades de IA
│   └── [outras]/       # Páginas públicas
├── services/           # Serviços de integração
├── hooks/              # Custom hooks
├── contexts/           # Contextos React
├── types/              # Definições de tipos TypeScript
├── utils/              # Funções utilitárias
└── lib/                # Configurações de bibliotecas
```

### Edge Functions Implementadas (15+)
```
supabase/functions/
├── vendas-operations/          # Sistema de vendas
├── produtos-com-nf/           # Importação de produtos
├── enviar-convite-usuario/    # Sistema de convites
├── excluir-usuario/           # Gestão de usuários
├── debug-resend/              # Debug de emails
├── teste-email/               # Testes de email
├── gerenciar-lotes/           # Gestão de lotes
├── gerenciar-produtos/        # Gestão de produtos
├── gerenciar-formas-farmaceuticas/ # Formas farmacêuticas
├── gerenciar-categorias/      # Categorias
├── check-first-access/        # Primeiro acesso
├── enviar-email-recuperacao/  # Recuperação de senha
├── criar-usuario/             # Criação de usuários
├── buscar-dados-documento/    # OCR e documentos
├── workspace-document-data/   # Processamento de documentos
└── chatbot-ai-agent/          # Chatbot inteligente
```

### Banco de Dados (Unificado e Otimizado)
```sql
-- Tabelas principais implementadas
usuarios                    -- Perfis e permissões
produtos                   -- UNIFICADA (insumos + embalagens + medicamentos)
lote                       -- Controle de lotes
ordens_producao           -- Sistema completo de produção
fornecedores              -- Gestão de fornecedores
categoria_produto         -- Categorias
forma_farmaceutica        -- Formas farmacêuticas
vendas                    -- Sistema de vendas
itens_venda              -- Itens de venda
abertura_caixa           -- Controle de caixa
categorias_financeiras   -- Categorias financeiras
contas_a_pagar           -- Contas a pagar
```

### Sistema de Autenticação Avançado
- **Fluxo implementado:**
  1. Login via Supabase Auth
  2. Verificação de perfil na tabela `usuarios`
  3. Carregamento de permissões granulares
  4. **DashboardRouter** inteligente por perfil
  5. **ProtectedComponent** para proteção específica
  6. **Error Boundaries** para tratamento de erros
  7. Sistema de convites e primeiro acesso

### Dashboards Inteligentes por Perfil
- **Proprietário:** Dashboard administrativo completo com vendas
- **Farmacêutico:** Foco em produção e controle de qualidade
- **Atendente:** Foco em atendimento, vendas e PDV
- **Manipulador:** Foco em ordens de produção e estoque

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

### URGENTE (1-2 semanas)
1. **Atualizar documentação** - Alinhar com estado real
2. **Implementar testes** - Cobertura mínima para produção
3. **Finalizar relatórios de vendas** - Completar M04
4. **Integrar dashboards** - UX unificada

### Curto Prazo (1-2 meses)
1. **Expandir IA farmacêutica** - Funcionalidades específicas
2. **Completar M03** - Sistema de atendimento com IA
3. **Otimizar performance** - Testes de carga
4. **Monitoramento** - Métricas de produção

### Médio Prazo (3-6 meses)
1. **M07 - Fiscal** - Emissão de NFe
2. **M10 - Relatórios** - Dashboard executivo
3. **IA avançada** - Análise preditiva
4. **Integrações** - APIs externas

## Padrões de Desenvolvimento

### Convenções de Código
- **Componentes:** PascalCase, funcionais com hooks
- **Edge Functions:** kebab-case com index.ts
- **Tipos:** Interfaces em PascalCase, enums em UPPER_CASE
- **Hooks:** camelCase com prefixo "use"

### Estrutura de Edge Functions
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS headers
  // Autenticação
  // Lógica de negócio
  // Resposta padronizada
})
```

### Segurança Implementada
- **RLS habilitado** em todas as tabelas
- **Políticas granulares** por operação
- **Validação dupla** (frontend + backend)
- **Sanitização de inputs**
- **Error boundaries** para estabilidade
- **Auditoria automática** via triggers

### Qualidade de Código
- **TypeScript:** 98% tipado
- **ESLint:** Configurado rigorosamente
- **Componentes:** Modulares e reutilizáveis
- **Hooks customizados:** Otimizados
- **Edge Functions:** Padronizadas

---

*Última atualização: 2025-01-28*
*Status: MVP 90% concluído - Pronto para produção em módulos principais*
