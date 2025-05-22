# Regras Específicas de Implementação - Homeo-AI

Este documento estabelece as diretrizes específicas e técnicas para o desenvolvimento do projeto Homeo-AI, complementando as regras gerais. Estas diretrizes devem ser seguidas rigorosamente por todos os desenvolvedores.

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

### 1.4. Python (Microsserviços IA)
- Seguir PEP 8
- Type hints obrigatórios
- Docstrings para todas as funções (formato NumPy/Google)
- Testes unitários com pytest
- Configuração de ambientes com Poetry
- FastAPI para APIs

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

---

*Última atualização: 2024-05-21*
*Versão: 1.0.0* 