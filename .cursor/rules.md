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

### 1.2. React
- Componentes devem ser funcionais (React Hooks)
- Utilizar React Query para todas as chamadas de API e estado de servidor
- Manter componentes pequenos e focados (max. 300 linhas)
- Utilizar Context API para estado global, mas de forma modular (por domínio)
- Custom hooks para lógica reutilizável
- Props obrigatoriamente tipadas

### 1.3. SQL/Supabase
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

### 1.4. Edge Functions (Deno)
- Seguir padrão estabelecido com Deno
- Estrutura consistente com CORS, autenticação e tratamento de erros
- Tipagem rigorosa para requests e responses
- Documentação clara de parâmetros e retornos
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
- Seguir o modelo de entidades unificado (produtos, lotes, vendas)
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

### 8.1. Fase 1: MVP (90% Concluída)
- Priorizar simplicidade e funcionalidade sobre otimização
- Evitar over-engineering
- Garantir fluxos de usuário end-to-end
- Foco em validação de conceitos

### 8.2. Fase 2: Expansão (Em Andamento)
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
  3. Carregamento de permissões granulares
  4. **DashboardRouter** inteligente por perfil
  5. **ProtectedComponent** para proteção específica
  6. **Error Boundaries** para tratamento de erros
  7. Sistema de convites e primeiro acesso

### 9.2. Estrutura de Permissões Granulares
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
  fallback={<Navigate to="/admin" replace />}
>
  {/* Conteúdo protegido */}
</ProtectedComponent>
```

### 9.3. Padrão de Rotas Implementado
- **Rotas públicas:** `/`, `/login`, `/esqueci-senha`, `/primeiro-acesso`, `/aceitar-convite`
- **Rotas protegidas:** `/admin/*` com ForceAuth
- **Proteção obrigatória:** Usar `ForceAuth` para todas as rotas admin
- **Redirecionamento:** **DashboardRouter** baseado no perfil do usuário
- **Error Boundaries:** Implementados em toda a aplicação

### 9.4. Estrutura de Componentes Atual
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layouts/         # Layout components (AdminLayout)
│   ├── Auth/           # Authentication components
│   ├── estoque/        # Componentes de estoque
│   ├── markup/         # Sistema de markup
│   ├── chatbot/        # Sistema de chatbot
│   ├── ImportacaoNF/   # Importação de NF-e
│   ├── cadastros/      # Cadastros gerais
│   ├── financeiro/     # Componentes financeiros
│   ├── usuarios/       # Gestão de usuários
│   └── prescription/   # Processamento de receitas
├── modules/
│   └── usuarios-permissoes/  # Módulo completo implementado
├── pages/
│   ├── admin/          # Páginas administrativas protegidas
│   │   ├── vendas/     # Sistema de vendas completo
│   │   ├── estoque/    # Gestão de estoque
│   │   ├── producao/   # Ordens de produção
│   │   ├── financeiro/ # Módulo financeiro
│   │   ├── cadastros/  # Cadastros essenciais
│   │   ├── usuarios/   # Gestão de usuários
│   │   └── ia/         # Funcionalidades de IA
│   └── [public]/       # Páginas públicas
```

### 9.5. Padrão de Banco de Dados Unificado
- **MCP Supabase:** Sempre use MCP para interagir com o banco de dados
- **RLS obrigatório:** Todas as tabelas devem ter RLS habilitado
- **Triggers automáticos:** Para updated_at, histórico, cálculos de preço
- **Nomenclatura:** snake_case para tabelas e colunas
- **Relacionamentos:** Sempre com ON DELETE CASCADE ou RESTRICT apropriado
- **Tabela produtos unificada:** insumos + embalagens + medicamentos
- **Sistema de markup:** Automatizado com triggers

### 9.6. Padrão de Edge Functions (15+ Implementadas)
```typescript
// Estrutura padrão para Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Configurar CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  }

  // Tratar requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validação de autenticação
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verificar usuário
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Lógica de negócio
    // Resposta padronizada
    
  } catch (error) {
    console.error('Erro na function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 9.7. Sistema de Vendas Implementado
- **PDV completo:** Interface moderna com busca inteligente
- **Controle de caixa:** Abertura, fechamento, sangria, conferência
- **Histórico de vendas:** Filtros avançados e métricas
- **Fechamento de vendas:** Gestão de vendas pendentes
- **Hook useVendasCards:** Métricas em tempo real
- **Edge Function vendas-operations:** Operações completas

### 9.8. Sistema de Produtos Unificado
- **Tabela produtos:** Unifica insumos, embalagens e medicamentos
- **Sistema de markup:** Automatizado com triggers
- **Gestão de lotes:** Rastreabilidade completa
- **Controle fiscal:** NCM, CFOP, CST implementados
- **Importação NF-e:** Estrutura 80% completa

## 10. Checklist de Qualidade Atualizado

### 10.1. Antes de Commit
- [ ] Código TypeScript sem erros (98% tipado)
- [ ] Componentes tipados corretamente
- [ ] RLS implementado para novas tabelas
- [ ] Permissões verificadas para novas rotas
- [ ] Responsividade testada
- [ ] Acessibilidade básica verificada
- [ ] Error boundaries implementados

### 10.2. Antes de Deploy
- [ ] Build sem erros
- [ ] Testes funcionais básicos
- [ ] Migrações de banco testadas
- [ ] Variáveis de ambiente configuradas
- [ ] Performance básica verificada
- [ ] Edge Functions testadas
- [ ] RLS policies validadas

### 10.3. Code Review
- [ ] Padrões de código seguidos
- [ ] Segurança verificada
- [ ] Performance considerada
- [ ] Documentação atualizada
- [ ] Testes adequados
- [ ] Integração com módulos existentes
- [ ] Conformidade com arquitetura unificada

### 10.4. Módulos Específicos
- [ ] **M09 - Usuários:** Production-ready ✅
- [ ] **M04 - Vendas:** 90% funcional, pendente relatórios
- [ ] **M05 - Produção:** 90% funcional, refinamento UI
- [ ] **M02 - Estoque:** 95% funcional, finalizar NF-e
- [ ] **M06 - Financeiro:** 75% funcional, relatórios avançados
- [ ] **M01 - Cadastros:** 80% funcional, clientes avançados
- [ ] **M03 - Atendimento:** 60% funcional, IA processamento
- [ ] **M08 - IA:** 25% funcional, expandir funcionalidades

---

*Última atualização: 2025-01-28*
*Versão: 3.0.0 - Reflete estado real do projeto* 