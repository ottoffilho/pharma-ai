# Contexto do Projeto Homeo-AI

## 1. Visão Geral do Projeto

Homeo-AI é uma aplicação web abrangente projetada para Farmácias de Manipulação, oferecendo uma plataforma rica em funcionalidades para gerenciamento de prescrições, inventário, pedidos, transações financeiras e gerenciamento de usuários. O projeto utiliza inteligência artificial em diversos módulos para otimizar processos, desde o processamento de receitas até previsão de demanda e precificação.

A aplicação segue uma arquitetura híbrida com um monólito modular para o núcleo do sistema e microsserviços para funcionalidades de IA. O desenvolvimento está estruturado em três fases principais: MVP, Expansão Funcional, e Inteligência Artificial Plena.

## 2. Arquitetura Técnica

### 2.1. Visão Geral da Arquitetura

O Homeo-AI utiliza uma arquitetura híbrida com quatro componentes principais:
* **Monolito Modular**: Núcleo do sistema (cadastros, pedidos, estoque, financeiro)
* **Microsserviços de IA**: Processamento de receitas, modelos preditivos, chatbots
* **Automação n8n**: Fluxos de trabalho automáticos, notificações
* **Gateway de Notificações**: Gerenciamento de comunicações multicanal

### 2.2. Stack Tecnológica

#### Frontend
* **Framework Principal**: React/TypeScript (v18.0.0+)
* **UI/Estilização**: Shadcn/UI + Tailwind CSS
* **Roteamento**: React Router DOM (v6.0.0+)
* **Gerenciamento de Estado**: React Query (TanStack Query v4.0.0+)
* **Validação**: Zod (v3.0.0+)

#### Backend
* **Backend-as-a-Service**: Supabase
  * PostgreSQL (Banco de dados principal)
  * Auth (Autenticação)
  * Storage (Armazenamento de arquivos)
  * Realtime (Atualizações em tempo real)
  * Edge Functions/Functions (Lógica de negócios)
* **Microsserviços**:
  * Python/FastAPI (Microsserviços de IA)
  * Node.js/TypeScript (Funções serverless complementares)

#### IA/ML
* **OCR**: Google Vision AI, AWS Textract
* **NLU/NLP**: spaCy, Transformers
* **LLMs**: OpenAI, Gemini
* **Modelos Preditivos**: scikit-learn, TensorFlow
* **Armazenamento de Embeddings**: pgvector

#### Automação
* **Ferramenta de Fluxos**: n8n

## 3. Fases de Implementação e Módulos

O desenvolvimento do Homeo-AI está organizado em três fases principais:

### 3.1. FASE 1: MVP (Produto Mínimo Viável)
Duração estimada: 3-6 meses
Objetivo: Implementar cadastros essenciais e fluxo básico de receita até financeiro.

**Módulos principais**:
* **M01-CADASTROS_ESSENCIAIS**: Base de dados fundamental (insumos, lotes, embalagens)
* **M09-USUARIOS_PERMISSOES**: Gerenciamento de acesso e segurança
* **M02-ATENDIMENTO_BASICO**: Registro inicial de solicitações de clientes
* **M04-ESTOQUE_BASICO**: Controle inicial de insumos e embalagens
* **M03-ORCAMENTACAO_SIMPLES**: Criação de orçamentos para clientes
* **M06-FINANCEIRO_BASICO**: Gerenciamento financeiro elementar
* **M05-MANIPULACAO_BASICA**: Controle inicial do processo de manipulação
* **MXX-CADASTROS_AUXILIARES**: Gerenciamento de tabelas auxiliares
* **M0X-CONFIGURACOES_SISTEMA**: Configurações globais do sistema

### 3.2. FASE 2: Expansão Funcional e Primeiras IA's
Duração estimada: 6-9 meses após MVP
Objetivo: Integrar primeiras funcionalidades de IA de alto impacto, expandir módulos fiscal e de atendimento.

**Módulos principais**:
* **M02-ATENDIMENTO_AVANCADO**: Inteligência na entrada de receitas
* **M10-FISCAL_BASICO**: Conformidade fiscal básica (NF-e, NFS-e)
* **M06-FINANCEIRO_AVANCADO**: Conciliação bancária, IA para classificação
* **M11-PDV_BASICO**: Ponto de Venda para atendimento rápido
* **M03-ORCAMENTACAO_INTELIGENTE**: Orçamentos com sugestões inteligentes
* **M04-ESTOQUE_AVANCADO**: Gestão de estoque com insights preditivos
* **M21-RASTREABILIDADE_PROCESSOS**: Sistema completo para rastreabilidade
* **M22-PROMOCOES_MARKETING**: Gerenciamento de campanhas promocionais
* **M18-FORMULAS_PRODUCAO_INTERNA**: Gestão de fórmulas padronizadas
* **M20-SNGPC_CONTROLADOS**: Escrituração eletrônica para SNGPC e RMNR

### 3.3. FASE 3: Inteligência Artificial Plena e Módulos Complementares
Duração estimada: 9-12 meses após Fase 2
Objetivo: Implementar IA avançada em todos os módulos principais, adicionar módulos de valor agregado.

**Módulos principais**:
* **M02-ATENDIMENTO_IA_COMPLETO**: Interpretação de receitas em áudio/vídeo, chatbot avançado
* **M06-FINANCEIRO_PREDITIVO**: Previsão de fluxo de caixa, detecção de anomalias
* **M04-ESTOQUE_OTIMIZADO**: Otimização de compras via IA
* **M16-BI_RELATORIOS**: Business Intelligence com insights via IA
* **Módulos Complementares**: RH, Convênios, Fidelidade, Gestão de Processos

## 4. Funcionalidades Principais

A aplicação oferece uma vasta gama de funcionalidades, incluindo:

### 4.1 Gestão de Cadastros (M01)
* Cadastro completo de insumos, lotes, embalagens
* Vinculação entre matérias-primas e embalagens
* Cadastro de fornecedores, fabricantes, e categorias
* Controle de dados para produtos de revenda
* Configuração de formas farmacêuticas e suas embalagens

### 4.2 Gestão de Atendimento (M02)
* Entrada manual e inteligente de receitas
* OCR e NLU para processamento de receitas
* Omni-channel para recebimento de pedidos digitais
* Integração com canais como WhatsApp

### 4.3 Gestão de Estoque (M04)
* Controle de lotes e validades
* Gestão de etiquetas para produtos de revenda
* Previsão de demanda baseada em IA
* Rastreabilidade de insumos

### 4.4 Produção e Rastreabilidade (M18, M21)
* Cadastro detalhado de fórmulas com componentes
* Rastreabilidade completa de etapas do processo produtivo
* Controle de qualidade dos produtos manipulados
* Gestão de ordens de produção interna

### 4.5 Comercial e Marketing (M03, M22)
* Orçamentos inteligentes com precificação dinâmica
* Gestão de campanhas promocionais
* Programas de fidelidade
* Ponto de venda integrado

### 4.6 Fiscal e Regulatório (M10, M20)
* Conformidade com SNGPC e RMNR
* Emissão de documentos fiscais (NF-e, NFS-e)
* Controle de medicamentos controlados
* Rastreabilidade para auditorias regulatórias

### 4.7 Business Intelligence (M16)
* Relatórios dinâmicos e consultas personalizadas
* Dashboards operacionais e gerenciais
* Análise avançada com insights via IA
* Consultas em linguagem natural

## 5. Integração de Inteligência Artificial

A IA é integrada em diversos módulos do sistema:

* **Processamento de Documentos**: OCR para receitas e notas fiscais
* **Análise de Linguagem Natural**: Extração de dados de receitas, interpretação de textos
* **Previsão e Otimização**: Demanda de insumos, precificação, compras, estoques
* **Assistência ao Usuário**: Chatbots, sugestões contextuais, detecção de erros
* **Detecção de Anomalias**: Transações financeiras, movimentações de estoque
* **Geração de Conteúdo**: Textos para rótulos, POPs, descrições de produto

## 6. Próximos Passos e Roadmap

O desenvolvimento atual está focado na conclusão da Fase 1 (MVP), com ênfase nos módulos de cadastros essenciais e usuários/permissões. O roadmap de alto nível segue as três fases definidas, com entregas incrementais.

### Marcos Principais:
* **MVP Funcional & Operacional**: 6 meses (módulos core da Fase 1)
* **Sistema Expandido com IA Inicial**: 9 meses após MVP
* **Sistema Completo com IA Avançada**: 12 meses após expansão

Última atualização da análise do sistema: 2024-05-21 