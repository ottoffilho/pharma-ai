# Regras Específicas de Implementação - Pharma.AI

Este documento estabelece as diretrizes específicas e técnicas para o desenvolvimento do projeto Pharma.AI, complementando as regras gerais. Estas diretrizes devem ser seguidas rigorosamente por todos os desenvolvedores.

### SEMPRE FALAR EM PT-BR ###

## 1. Padrões de Código por Tecnologia

### 1.1. TypeScript/JavaScript
- Utilizar TypeScript obrigatoriamente para todo o código frontend e funções serverless
- Definir interfaces para todos os objetos de domínio e requests/responses
- Configuração do tsconfig.json:
  - `strict: true`
  - `noImplicitAny: true`
  - `strictNullChecks: true`
- Utilizar ES6+ (arrow functions, destructuring, template literals, etc)
- Evitar `any` e utilizar tipos genéricos quando aplicável
- **TypeScript coverage obrigatório:** Manter 98% de tipagem

### 1.2. React
- Componentes devem ser funcionais (React Hooks)
- Utilizar React Query para todas as chamadas de API e estado de servidor
- Manter componentes pequenos e focados (max. 300 linhas)
- Utilizar Context API para estado global, mas de forma modular (por domínio)
- Custom hooks para lógica reutilizável
- Props obrigatoriamente tipadas
- **Error Boundaries obrigatórios:** Implementar em toda aplicação
- **ProtectedComponent:** Usar para proteção granular de elementos

### 1.3. SQL/Supabase
- **MCP Supabase obrigatório** para todas as interações com banco de dados
- RLS (Row Level Security) obrigatório para todas as tabelas
- Views para consultas complexas frequentes
- Índices para campos de busca e JOIN frequentes
- Stored procedures para lógicas complexas compartilhadas
- Triggers para manter integridade referencial
- Normalização adequada (3NF na maioria dos casos)
- Convenção de nomenclatura:
  - Tabelas: singular, snake_case
  - Colunas: snake_case
  - PKs: sempre id
  - FKs: {tabela_referenciada}_id
- **Triggers automáticos obrigatórios:** updated_at, auditoria, cálculos

### 1.4. Python (Microsserviços IA)
- Seguir PEP 8
- Type hints obrigatórios
- Docstrings para todas as funções (formato NumPy/Google)
- Testes unitários com pytest
- Configuração de ambientes com Poetry
- FastAPI para APIs

### 1.5. Edge Functions (Deno)
- **Padrão Deno obrigatório** para todas as Edge Functions
- Estrutura consistente com CORS e autenticação
- Import maps quando necessário
- Tratamento robusto de erros
- Validação de entrada obrigatória
- Logs estruturados para debugging

## 2. Padrões de Interação e API

### 2.1. REST API
- Endpoints RESTful e recursos nomeados em substantivos
- Verbos HTTP adequados (GET, POST, PUT, PATCH, DELETE)
- Respostas JSON consistentes, incluindo metadados quando aplicável
- Paginação por offset+limit ou cursor para listas
- Códigos HTTP apropriados (200, 201, 400, 401, 403, 404, 500)
- Erros com mensagens significativas e códigos de erro internos
- Versão em header ou path para APIs públicas

### 2.2. Autenticação e Autorização
- Autenticação via Supabase Auth
- JWT para sessões, com refresh tokens
- Permissões granulares armazenadas no perfil do usuário
- Verificação de permissões no frontend e backend (dupla camada)
- Rate limiting para APIs públicas
- CORS configurado apenas para domínios conhecidos

### 2.3. WebSockets e Realtime
- Utilizar Supabase Realtime para funcionalidades em tempo real
- Implementar backup para polling em casos de falha
- Manter conexões eficientes (não abrir múltiplas conexões)
- Evitar broadcasts desnecessários

## 3. Segurança e Performance

### 3.1. Segurança
- OWASP Top 10 como referência mínima
- Sanitização de inputs em todas as camadas
- Proteção contra XSS, CSRF e SQL Injection
- Content Security Policy implementada
- Secrets nunca em código fonte ou logs
- Auditoria de ações sensíveis
- Validação de dados em ambos frontend e backend

### 3.2. Performance
- Bundle splitting para otimização de carregamento inicial
- Lazy loading para componentes pesados e rotas
- Otimização de imagens (WebP, compressão, dimensões adequadas)
- Memoization para computações caras (useMemo, useCallback)
- Virtualização para listas longas
- Paginação para grandes conjuntos de dados
- Caching estratégico (SWR/React Query)
- Monitoramento de performance (web vitals)

### 3.3. Acessibilidade
- WCAG 2.1 AA como meta
- Uso consistente de landmarks, headings e aria-labels
- Contraste adequado para texto
- Suporte a navegação por teclado
- Textos alternativos para imagens
- Testes com leitores de tela

## 4. Estratégias de Escalabilidade

### 4.1. Horizontal Scaling
- Statelessness para permitir múltiplas instâncias
- Backend preparado para distribuição de carga
- Microsserviços isolados para funções intensivas
- Edge Functions para lógica leve e dispersa geograficamente
- Estratégia de caching em múltiplas camadas

### 4.2. Particionamento de Dados
- Estratégia para crescimento de dados (particionamento)
- Índices cuidadosamente planejados
- Queries otimizadas com EXPLAIN
- VACUUM regular para manutenção

### 4.3. Modularização
- Código organizado por domínios de negócio
- Limites claros entre módulos
- Interfaces bem definidas para comunicação inter-módulos
- DDD (Domain-Driven Design) para módulos complexos

## 5. Fluxo de Desenvolvimento Ágil

### 5.1. Sprint Planning
- Backlog refinement semanal
- Sprint planning a cada 2 semanas
- Estimativas em story points (Fibonacci)
- Definição de Done clara por tipo de tarefa

### 5.2. Desenvolvimento Diário
- Daily standup para sincronização
- Desenvolvimento orientado a tarefas
- Testes durante o desenvolvimento, não apenas ao final
- Pair programming para tarefas complexas

### 5.3. Entrega e Review
- Demo ao final de cada sprint
- Retrospectiva para identificar melhorias
- Definição de métricas de sucesso por sprint
- Documentação atualizada para cada feature entregue

## 6. Estrutura Específica para Módulos

### 6.1. Entidades e Relações
- Seguir o modelo de entidades definido em M01-CADASTROS_ESSENCIAIS
- Relações normalizadas para evitar redundância de dados
- Implementar modelo de herança via composição onde aplicável
- Gerenciar relações muitos-para-muitos com tabelas de junção

### 6.2. Modelo de Componentes
- Frontend organizado por:
  - Páginas (pages): Componentes específicos de rota
  - Componentes (components): UI reutilizável
  - Layouts: Templates estruturais
  - Hooks: Lógica reutilizável
  - Context: Estado global por domínio
  - Services: Integração com backend
  - Utils: Funções utilitárias puras

### 6.3. Organização de cada Módulo
- Priorizar composição sobre herança
- Evitar acoplamento entre módulos distintos
- Interfaces bem definidas para comunicação inter-módulos
- Testes específicos por módulo

## 7. Integração com IA

### 7.1. Implementação Técnica
- Usar Edge Functions para integração com LLMs externos
- Implementar embeddings com pgvector para busca semântica
- Vetorizar documentos/dados para RAG (Retrieval Augmented Generation)
- Armazenar prompts versionados em banco de dados

### 7.2. Modelos e Treinamento
- Documentar fontes de dados para treinamento
- Versionamento de modelos e datasets
- Métricas claras para cada modelo
- Estratégia de melhorias incrementais

### 7.3. Resiliência e Fallbacks
- Implementar timeouts adequados para chamadas de IA
- Mecanismos de retry com backoff exponencial
- Fallbacks para funcionalidades críticas
- Monitoramento de taxas de erro e tempos de resposta

## 8. Especificidades para Fases do Projeto

### 8.1. Fase 1: MVP
- Priorizar simplicidade e funcionalidade sobre otimização
- Evitar over-engineering
- Garantir fluxos de usuário end-to-end
- Foco em validação de conceitos

### 8.2. Fase 2: Expansão
- Aprimorar funcionalidades existentes antes de adicionar novas
- Implementar feedback da Fase 1
- Introduzir primeiros componentes de IA
- Iniciar otimizações de performance

### 8.3. Fase 3: IA Plena
- Integração profunda de IA em todos os módulos
- Otimizações avançadas
- Busca por diferenciais competitivos
- Refinamento baseado em métricas de uso

## 9. Padrões Específicos Implementados

### 9.1. Sistema de Autenticação Avançado
- **Fluxo obrigatório:**
  1. Login via Supabase Auth
  2. Verificação de perfil na tabela `usuarios`
  3. Carregamento de permissões
  4. Redirecionamento para dashboard específico
  5. Proteção de rotas por permissões
- **ForceAuth:** Proteção robusta de rotas administrativas
- **DashboardRouter:** Roteamento inteligente por perfil
- **Sincronização automática:** auth.users ↔ usuarios

### 9.2. Estrutura de Permissões
```typescript
// Sempre usar esta estrutura para permissões
interface Permissao {
  modulo: ModuloSistema;
  acao: AcaoPermissao;
  nivel: NivelAcesso;
}

// Componente de proteção obrigatório
<ProtectedComponent
  modulo={ModuloSistema.USUARIOS_PERMISSOES}
  acao={AcaoPermissao.CRIAR}
  nivel={NivelAcesso.TOTAL}
  fallback={<Navigate to="/admin" replace />}
>
  {/* Conteúdo protegido */}
</ProtectedComponent>
```

### 9.3. Padrão de Rotas
- **Rotas públicas:** `/`, `/login`, `/esqueci-senha`
- **Rotas protegidas:** `/admin/*`
- **Proteção obrigatória:** Usar `ForceAuth` para todas as rotas admin
- **Redirecionamento:** Baseado no perfil do usuário

### 9.4. Estrutura de Componentes
```
src/
├── components/
│   ├── ui/              # shadcn/ui components (40+)
│   ├── layouts/         # Layout components
│   ├── Auth/           # Authentication components
│   ├── clientes/       # Cliente components (COMPLETO)
│   ├── chatbot/        # Chatbot components
│   └── [modulo]/       # Module-specific components
├── modules/
│   └── usuarios-permissoes/  # Complete module structure
├── pages/
│   ├── admin/          # Protected admin pages (50+)
│   └── [public]/       # Public pages
├── hooks/              # Custom hooks (15+)
└── contexts/           # React contexts (8+ modulares)
```

### 9.5. Padrão de Banco de Dados
- **MCP:** Supabase com MCP, sempre use para fazer interatividade com o banco de dados	
- **RLS obrigatório:** Todas as tabelas devem ter RLS habilitado
- **Triggers automáticos:** Para updated_at, histórico, etc.
- **Nomenclatura:** snake_case para tabelas e colunas
- **Relacionamentos:** Sempre com ON DELETE CASCADE ou RESTRICT apropriado
- **Produtos unificados:** Tabela única para insumos, embalagens e medicamentos
- **Sistema de markup:** Automatizado com triggers

### 9.6. Padrão de Edge Functions
```typescript
// Estrutura padrão para Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Headers CORS obrigatórios
    // Validação de autenticação
    // Lógica de negócio
    // Resposta padronizada
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 9.7. Padrão de Custom Hooks
- **useVendasCards:** Para métricas de vendas em tempo real
- **useClientes:** Para gestão completa de clientes
- **useChatbot:** Para funcionalidades de IA
- **Nomenclatura:** use + CamelCase
- **Tipagem:** Interface para return type obrigatória

### 9.8. Gestão de Estado
- **React Query:** Para estado servidor obrigatório
- **Context API:** Por domínio, modular
- **Local State:** useState para UI temporário
- **Zod:** Validação robusta de formulários

## 10. Módulos Implementados (Status Atualizado - Janeiro 2025)

### 10.1. Módulos COMPLETOS (Production-Ready)

#### M09 - Usuários e Permissões (100%)
- ✅ Sistema robusto de autenticação
- ✅ 4 perfis com dashboards específicos
- ✅ Permissões granulares por módulo/ação/nível
- ✅ Error Boundaries implementados
- ✅ Edge Functions: criar-usuario, excluir-usuario, check-first-access

#### M04 - Sistema de Vendas (90%)
- ✅ PDV completo (`src/pages/admin/vendas/pdv.tsx`)
- ✅ Controle de caixa (`src/pages/admin/vendas/caixa.tsx`)
- ✅ Histórico de vendas (`src/pages/admin/vendas/historico.tsx`)
- ✅ Sistema de fechamento (`src/pages/admin/vendas/fechamento.tsx`)
- ✅ Hook `useVendasCards` para métricas
- ✅ Edge Functions: vendas-operations, caixa-operations
- 🔄 Pendente: Relatórios avançados (10%)

#### M02 - Sistema de Estoque (95%)
- ✅ Produtos unificados (insumos + embalagens + medicamentos)
- ✅ Sistema de markup automatizado
- ✅ Gestão completa de lotes
- ✅ Controle fiscal (NCM, CFOP, CST)
- ✅ Edge Functions: gerenciar-produtos, gerenciar-lotes
- 🔄 Pendente: Finalizar importação NF-e (5%)

#### M05 - Sistema de Produção (90%)
- ✅ Ordens de produção completas
- ✅ Controle de etapas
- ✅ Gestão de insumos por ordem
- ✅ Controle de qualidade
- 🔄 Pendente: Refinamentos UX (10%)

#### M01 - Cadastros Essenciais (85%)
- ✅ Fornecedores (CRUD completo)
- ✅ **Clientes (IMPLEMENTAÇÃO RECENTE - 100%)**
  - `src/pages/admin/clientes/index.tsx` (509 linhas)
  - `src/pages/admin/clientes/novo.tsx`
  - `src/pages/admin/clientes/[id]/index.tsx` (detalhes)
  - `src/pages/admin/clientes/[id]/editar.tsx`
  - `src/components/clientes/` (componentes específicos)
  - Campos: nome, email, telefone, CPF, CNPJ, endereço
- ✅ Categorias e formas farmacêuticas
- ✅ Edge Functions: gerenciar-categorias, gerenciar-formas-farmaceuticas

### 10.2. Módulos FUNCIONAIS (70-80%)

#### M06 - Sistema Financeiro (75%)
- ✅ Categorias financeiras
- ✅ Contas a pagar
- ✅ Fluxo de caixa integrado
- ✅ Sistema de markup configurável
- 🔄 Pendente: Relatórios financeiros avançados

#### M03 - Sistema de Atendimento (65%)
- ✅ Sistema de pedidos
- ✅ Interface de receitas
- ✅ PrescriptionReviewForm
- ✅ ChatbotProvider
- 🔄 Pendente: IA para processamento automático

### 10.3. Módulos EM DESENVOLVIMENTO (20-40%)

#### M08 - Inteligência Artificial (30%)
- ✅ FloatingChatbotWidget funcional
- ✅ Edge Function chatbot-ai-agent (DeepSeek API)
- ✅ Estrutura para processamento de receitas
- 🔄 Pendente: IA específica farmacêutica

#### M07 - Sistema Fiscal (20%)
- ✅ Estrutura básica
- ✅ Campos fiscais configurados
- 🔄 Pendente: NF-e, integração completa

## 11. Padrões para Gestão de Clientes (NOVO)

### 11.1. Estrutura de Dados
```typescript
interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### 11.2. Componentes Implementados
- **Listagem:** `GestaoClientes` com busca, filtros e ações
- **Cadastro:** `NovoCliente` com validação completa
- **Edição:** `EditarCliente` com preservação de dados
- **Detalhes:** `DetalhesCliente` com histórico

### 11.3. Funcionalidades
- ✅ CRUD completo com validação
- ✅ Busca por nome, email, telefone, CPF, CNPJ
- ✅ Filtros por status (ativo/inativo)
- ✅ Paginação e ordenação
- ✅ Integração com sistema de vendas
- ✅ Histórico de alterações
- ✅ Validação de CPF/CNPJ

## 12. Checklist de Qualidade

### 12.1. Antes de Commit
- [ ] Código TypeScript sem erros (98% tipado)
- [ ] Componentes tipados corretamente
- [ ] RLS implementado para novas tabelas
- [ ] Permissões verificadas para novas rotas
- [ ] Error Boundaries implementados
- [ ] Responsividade testada
- [ ] Acessibilidade básica verificada

### 12.2. Antes de Deploy
- [ ] Build sem erros
- [ ] Testes funcionais básicos
- [ ] Migrações de banco testadas
- [ ] Variáveis de ambiente configuradas
- [ ] Performance básica verificada
- [ ] Edge Functions testadas

### 12.3. Code Review
- [ ] Padrões de código seguidos
- [ ] Segurança verificada
- [ ] Performance considerada
- [ ] Documentação atualizada
- [ ] Testes adequados
- [ ] MCP Supabase utilizado corretamente

---

*Última atualização: 2025-05-31*
*Versão: 3.0.0 - Reflete estado avançado do projeto* 