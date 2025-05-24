# Product Requirements Document: Pharma.AI
**Versão:** 1.0  
**Data da Última Atualização:** 2024-12-26  
**Status:** Em Desenvolvimento - Fase 1 (MVP)

---

## 1. Introdução e Visão Geral

### 1.1. Objetivo do Produto
O **Pharma.AI** é uma aplicação web abrangente projetada especificamente para Farmácias de Manipulação, oferecendo uma plataforma completa e inteligente para gerenciamento de prescrições, inventário, pedidos, transações financeiras e gestão de usuários. O sistema integra inteligência artificial em diversos módulos para otimizar processos críticos, desde o processamento automatizado de receitas até previsão de demanda e precificação dinâmica.

### 1.2. Público-Alvo
- **Farmacêuticos Responsáveis**: Validação de receitas, supervisão técnica, controle de qualidade
- **Atendentes de Farmácia**: Entrada de pedidos, atendimento ao cliente, processamento de receitas
- **Administradores/Gestores**: Gestão financeira, controle de estoque, relatórios gerenciais
- **Auxiliares de Manipulação**: Execução de fórmulas, controle de produção
- **Clientes da Farmácia**: Portal de acompanhamento de pedidos, consulta de histórico

### 1.3. Problema a Ser Resolvido
As farmácias de manipulação enfrentam desafios significativos:
- **Processamento Manual de Receitas**: Alto tempo de interpretação e risco de erros
- **Gestão de Estoque Complexa**: Controle de lotes, validades e rastreabilidade
- **Cálculos de Precificação**: Complexidade na precificação dinâmica considerando múltiplas variáveis
- **Conformidade Regulatória**: SNGPC, RMNR, rastreabilidade completa
- **Integração de Sistemas**: Falta de integração entre diferentes processos operacionais
- **Análise de Dados**: Ausência de insights para tomada de decisão estratégica

### 1.4. Visão da Solução
O Pharma.AI é uma solução completa que unifica todos os processos da farmácia de manipulação em uma plataforma inteligente, proporcionando:
- **Automação Inteligente**: IA para processamento de receitas, previsão de demanda
- **Gestão Integrada**: Fluxo contínuo desde o atendimento até a entrega
- **Conformidade Garantida**: Atendimento automático às exigências regulatórias
- **Insights Acionáveis**: Business Intelligence para otimização operacional
- **Escalabilidade**: Arquitetura preparada para crescimento e customização

---

## 2. Metas e Objetivos do Produto

### 2.1. Metas de Negócio
- **Eficiência Operacional**: Aumentar produtividade em 40% através da automação
- **Redução de Erros**: Diminuir erros de dispensação em 80% via validação inteligente
- **Conformidade Regulatória**: 100% de aderência ao SNGPC e RMNR
- **Satisfação do Cliente**: Melhorar NPS em 25 pontos através de melhor experiência
- **Margem de Lucro**: Otimizar precificação para aumentar margem em 15%
- **Time-to-Market**: Reduzir tempo de desenvolvimento de novas funcionalidades em 50%

### 2.2. Metas de Usuário
- **Farmacêuticos**: Reduzir tempo de validação de receitas de 10min para 2min
- **Atendentes**: Simplificar processo de entrada de pedidos em 70%
- **Gestores**: Acesso a relatórios em tempo real com insights acionáveis
- **Clientes**: Portal transparente de acompanhamento de pedidos

### 2.3. Métricas de Sucesso
- **Taxa de Adoção**: ≥ 90% dos usuários ativos semanalmente
- **Performance de IA**: 
  - Precisão OCR ≥ 95% para receitas digitalizadas
  - Precisão NLU ≥ 92% para extração de dados
- **Performance de Sistema**: 
  - Tempo de resposta API < 300ms (P95)
  - LCP < 2.5s em páginas críticas
  - Disponibilidade ≥ 99.9%
- **Qualidade**: Taxa de erro < 0.1% em transações críticas
- **Segurança**: Zero incidentes de segurança críticos

---

## 3. Requisitos Funcionais (por Módulo)

### 3.1. M01 - Cadastros Essenciais

#### 3.1.1. Gestão de Insumos
**User Story**: Como um administrador, eu quero cadastrar e gerenciar insumos com informações detalhadas para garantir controle completo do inventário.

**Critérios de Aceitação**:
- Sistema permite cadastro de insumos com campos obrigatórios: nome, código, fabricante, lote, validade
- Validação automática de códigos duplicados
- Classificação por categoria (matéria-prima, adjuvante, conservante, etc.)
- Controle de fornecedores múltiplos por insumo
- Histórico completo de alterações com timestamp e usuário

#### 3.1.2. Controle de Lotes e Validades
**User Story**: Como um farmacêutico, eu quero controlar lotes e validades automaticamente para garantir a qualidade dos produtos.

**Critérios de Aceitação**:
- Alertas automáticos 30 dias antes do vencimento
- Bloqueio automático de lotes vencidos
- FIFO automático na sugestão de uso de lotes
- Rastreabilidade completa lote → produto final

#### 3.1.3. Gestão de Embalagens
**User Story**: Como um operador, eu quero gerenciar tipos de embalagens para otimizar o processo de envase.

**Critérios de Aceitação**:
- Cadastro de embalagens com capacidade, material, fornecedor
- Vinculação automática embalagem → forma farmacêutica
- Controle de estoque de embalagens
- Cálculo automático de quantidade necessária

### 3.2. M02 - Atendimento Multicanal e Processamento de Receitas

#### 3.2.1. Upload e Processamento de Receitas
**User Story**: Como um atendente, eu quero fazer upload de receitas em imagem/PDF para que a IA extraia automaticamente os dados, agilizando o atendimento.

**Critérios de Aceitação**:
- Suporte a formatos: JPG, PNG, PDF (max 10MB)
- Processamento automático via OCR em < 30 segundos
- Interface de feedback visual durante processamento
- Fallback manual em caso de falha na IA
- Precisão mínima de 90% na extração de dados críticos

#### 3.2.2. Interpretação Inteligente de Receitas
**User Story**: Como um farmacêutico, eu quero que a IA interprete automaticamente medicamentos, dinamizações, posologia e prescritor para reduzir análise manual.

**Critérios de Aceitação**:
- **[Métrica Crítica]** Precisão ≥ 95% para nomes de medicamentos
- **[Métrica Crítica]** Precisão ≥ 92% para dinamizações homeopáticas
- **[Métrica Crítica]** Precisão ≥ 88% para posologia
- Identificação automática de prescritor com validação CRM
- Detecção de medicamentos controlados com alertas

#### 3.2.3. Validação e Revisão Humana
**User Story**: Como um farmacêutico responsável, eu quero revisar e validar dados extraídos pela IA para garantir segurança e conformidade.

**Critérios de Aceitação**:
- Interface clara de revisão com dados IA vs originais
- Campos editáveis para correções
- Sistema de aprovação obrigatória para medicamentos controlados
- Log de todas as alterações realizadas
- Assinatura digital do farmacêutico responsável

#### 3.2.4. Atendimento Multicanal
**User Story**: Como um cliente, eu quero enviar receitas via WhatsApp e acompanhar meu pedido para ter conveniência no atendimento.

**Critérios de Aceitação**:
- Integração com WhatsApp Business API
- Processamento automático de imagens recebidas
- Respostas automáticas de confirmação e status
- Portal web para acompanhamento de pedidos
- Notificações automáticas de progresso

### 3.3. M03 - Orçamentação Inteligente

#### 3.3.1. Cálculo Automático de Preços
**User Story**: Como um atendente, eu quero que o sistema calcule automaticamente preços considerando custos, margens e promoções para agilizar orçamentos.

**Critérios de Aceitação**:
- Cálculo automático baseado em: custo insumos + mão de obra + margem
- Aplicação automática de descontos e promoções vigentes
- Diferentes tabelas de preço por perfil de cliente
- Histórico de precificação para auditoria
- Aprovação obrigatória para descontos > 10%

#### 3.3.2. Orçamentos Inteligentes com IA
**User Story**: Como um vendedor, eu quero sugestões inteligentes de produtos complementares para aumentar ticket médio.

**Critérios de Aceitação**:
- Sugestões baseadas no histórico do cliente
- Recomendações de produtos complementares
- Alertas para oportunidades de cross-sell/up-sell
- Previsão de margem por orçamento

### 3.4. M04 - Gestão de Estoque Inteligente

#### 3.4.1. Controle de Estoque em Tempo Real
**User Story**: Como um gestor, eu quero visualizar estoque em tempo real para tomar decisões informadas de compra.

**Critérios de Aceitação**:
- Dashboard em tempo real com níveis de estoque
- Alertas automáticos para estoque mínimo
- Movimentações registradas automaticamente
- Relatórios de giro de estoque por período

#### 3.4.2. Previsão de Demanda com IA
**User Story**: Como um comprador, eu quero previsões inteligentes de demanda para otimizar compras e reduzir desperdícios.

**Critérios de Aceitação**:
- Algoritmo considera: sazonalidade, tendências, histórico
- Precisão mínima de 80% nas previsões mensais
- Sugestões automáticas de quantidade de compra
- Cenários de "e se" para diferentes situações

### 3.5. M05 - Manipulação e Produção

#### 3.5.1. Ordens de Produção
**User Story**: Como um manipulador, eu quero receber ordens de produção claras com instruções detalhadas para executar com qualidade.

**Critérios de Aceitação**:
- Geração automática de ordem de produção a partir do orçamento aprovado
- Instruções detalhadas passo-a-passo
- Lista de insumos com quantidades exatas
- Campos para registro de execução e controle de qualidade

#### 3.5.2. Controle de Qualidade
**User Story**: Como um farmacêutico responsável, eu quero registrar testes de qualidade para garantir conformidade dos produtos.

**Critérios de Aceitação**:
- Checklist de testes obrigatórios por forma farmacêutica
- Registro de resultados com anexos (fotos, laudos)
- Aprovação/reprovação de lotes
- Rastreabilidade completa dos testes realizados

### 3.6. M06 - Financeiro Inteligente

#### 3.6.1. Gestão de Contas a Receber/Pagar
**User Story**: Como um financeiro, eu quero controlar fluxo de caixa automaticamente para ter visão clara da situação financeira.

**Critérios de Aceitação**:
- Geração automática de contas a receber na venda
- Controle de vencimentos com alertas
- Conciliação bancária semi-automática
- Relatórios de fluxo de caixa projetado

#### 3.6.2. Análise Financeira com IA
**User Story**: Como um gestor, eu quero insights inteligentes sobre performance financeira para otimizar resultados.

**Critérios de Aceitação**:
- Análise automática de lucratividade por produto/cliente
- Detecção de anomalias em transações
- Previsão de fluxo de caixa com 85% de precisão
- Alertas para indicadores fora do padrão

### 3.7. M09 - Usuários e Permissões

#### 3.7.1. Gestão de Usuários
**User Story**: Como um administrador, eu quero gerenciar usuários e suas permissões para garantir segurança e controle de acesso.

**Critérios de Aceitação**:
- Cadastro de usuários com perfis pré-definidos
- Autenticação via email/senha + 2FA opcional
- Controle granular de permissões por módulo
- Log de acessos e ações por usuário
- Bloqueio automático após tentativas de login falhosas

#### 3.7.2. Auditoria e Compliance
**User Story**: Como um farmacêutico responsável, eu quero logs completos de auditoria para atender exigências regulatórias.

**Critérios de Aceitação**:
- Log imutável de todas as ações críticas
- Trilha de auditoria por receita/produto
- Relatórios de conformidade automáticos
- Backup automático de logs

---

## 4. Requisitos Não Funcionais

### 4.1. Escalabilidade
- Sistema deve suportar crescimento de 10x usuários sem degradação
- Arquitetura preparada para multi-tenancy
- Microsserviços de IA escaláveis horizontalmente
- Particionamento automático de dados por volume

### 4.2. Performance
- **Tempo de Resposta**: < 300ms para 95% das requisições API
- **Carregamento de Páginas**: LCP < 2.5s em conexões 3G
- **Processamento IA**: OCR de receitas < 30s, NLU < 10s
- **Disponibilidade**: ≥ 99.9% (máximo 8.76h downtime/ano)
- **Throughput**: 1000 requisições/segundo no pico

### 4.3. Segurança
- **Conformidade**: LGPD, OWASP Top 10
- **Autenticação**: JWT com refresh tokens, sessões de 8h
- **Autorização**: RBAC granular, RLS em todas as tabelas
- **Criptografia**: AES-256 para dados sensíveis, TLS 1.3 em trânsito
- **Auditoria**: Logs imutáveis de ações críticas
- **Backup**: Backup automático diário com retenção de 30 dias

### 4.4. Usabilidade (UX/UI)
- **Interface Intuitiva**: < 1 hora de treinamento para funcionalidades básicas
- **Responsividade**: Compatível com tablets e smartphones
- **Acessibilidade**: WCAG 2.1 AA, navegação por teclado
- **Feedback**: Loading states, mensagens de erro claras
- **Offline**: Funcionalidades críticas disponíveis offline

### 4.5. Manutenibilidade
- **Cobertura de Testes**: ≥ 80% para código crítico
- **Documentação**: APIs documentadas via OpenAPI/Swagger
- **Monitoramento**: APM integrado, alertas automáticos
- **Deploy**: CI/CD automatizado, rollback em < 5 minutos

### 4.6. Configurabilidade
- **Customização**: Margens, taxas, fluxos de aprovação configuráveis
- **Integrações**: APIs RESTful para integrações externas
- **Relatórios**: Relatórios customizáveis por usuário
- **Branding**: Logo, cores personalizáveis por instalação

---

## 5. Arquitetura e Stack Tecnológica

### 5.1. Modelo Arquitetural
**Arquitetura Híbrida** composta por:
- **Monólito Modular**: Núcleo do sistema (cadastros, pedidos, estoque, financeiro)
- **Microsserviços de IA**: Processamento de receitas, modelos preditivos
- **Gateway de API**: Gerenciamento centralizado de APIs
- **Automação**: n8n para fluxos de trabalho
- **Cache Distribuído**: Redis para performance
- **Message Queue**: Para processamento assíncrono

### 5.2. Componentes Principais
1. **Frontend SPA**: React/TypeScript com Shadcn/UI
2. **API Gateway**: Roteamento e autenticação
3. **Core Backend**: Supabase (PostgreSQL + Auth + Storage)
4. **IA Services**: Python/FastAPI para OCR, NLU, ML
5. **Automation Layer**: n8n para workflows
6. **Notification Service**: Multicanal (email, SMS, WhatsApp)
7. **File Storage**: Supabase Storage para documentos
8. **Monitoring**: Observabilidade e alertas

### 5.3. Stack Tecnológica

#### Frontend
- **Framework**: React 18.0+ com TypeScript
- **UI Library**: Shadcn/UI + Tailwind CSS
- **Estado**: React Query (TanStack Query v4.0+)
- **Roteamento**: React Router DOM v6.0+
- **Validação**: Zod v3.0+
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

#### Backend
- **BaaS Principal**: Supabase
  - PostgreSQL 15+ (banco principal)
  - Supabase Auth (autenticação)
  - Supabase Storage (arquivos)
  - Edge Functions (lógica serverless)
  - Realtime (WebSockets)
- **Extensions**: pgvector para embeddings IA

#### IA/ML Stack
- **Linguagem**: Python 3.11+
- **Framework API**: FastAPI
- **OCR**: Google Vision AI, AWS Textract
- **NLP**: spaCy, Transformers (Hugging Face)
- **LLMs**: OpenAI GPT-4, Google Gemini
- **ML**: scikit-learn, pandas, numpy
- **Deploy**: Docker + AWS ECS/Google Cloud Run

#### Automação
- **Workflow Engine**: n8n (auto-hospedado)
- **Message Queue**: Redis/BullMQ
- **Scheduler**: Cron jobs via Supabase Edge Functions

#### Infraestrutura
- **Cloud Provider**: AWS/Google Cloud
- **CDN**: CloudFlare
- **Monitoramento**: Sentry + LogRocket
- **Analytics**: PostHog

---

## 6. Design e Experiência do Usuário (UX)

### 6.1. Princípios de Design
- **Simplicidade**: Interface limpa, foco no essencial
- **Eficiência**: Minimizar cliques e tempo para tarefas comuns
- **Consistência**: Padrões visuais e de interação uniformes
- **Feedback Claro**: Estados de loading, confirmações, erros informativos
- **Acessibilidade**: Design inclusivo para todos os usuários

### 6.2. Referências de UI
- **Design System**: Shadcn/UI como base
- **Estilização**: Tailwind CSS para customização
- **Iconografia**: Lucide React (consistente com Shadcn)
- **Tipografia**: Inter (legível em todos os tamanhos)
- **Cores**: Paleta profissional com bom contraste

### 6.3. Personas Principais

#### Persona 1: Ana - Farmacêutica Responsável
- **Contexto**: 15 anos de experiência, responsável técnica
- **Necessidades**: Validação rápida, conformidade, controle de qualidade
- **Frustrações**: Burocracia excessiva, sistemas lentos
- **Objetivos**: Garantir segurança e eficiência operacional

#### Persona 2: Carlos - Atendente
- **Contexto**: 3 anos na farmácia, foco em atendimento
- **Necessidades**: Interface simples, processos claros
- **Frustrações**: Sistemas complexos, treinamento extenso
- **Objetivos**: Atender bem e rapidamente os clientes

#### Persona 3: Maria - Gestora
- **Contexto**: Proprietária da farmácia, foco em resultados
- **Necessidades**: Relatórios, insights, controle financeiro
- **Frustrações**: Falta de visibilidade, decisões sem dados
- **Objetivos**: Maximizar lucratividade e crescimento

---

## 7. Fases de Implementação e Roadmap

### 7.1. FASE 1: MVP (Produto Mínimo Viável)
**Duração**: 3-6 meses  
**Objetivo**: Estabelecer base funcional para operação básica da farmácia

#### Módulos Incluídos:
- ✅ **M01-CADASTROS_ESSENCIAIS**: Insumos, lotes, embalagens, fornecedores
- ✅ **M09-USUARIOS_PERMISSOES**: Autenticação, perfis, controle de acesso
- ✅ **M02-ATENDIMENTO_BASICO**: Entrada manual de receitas, orçamentos simples
- ✅ **M04-ESTOQUE_BASICO**: Controle de entrada/saída, alertas de estoque mínimo
- ✅ **M03-ORCAMENTACAO_SIMPLES**: Cálculo de preços, aprovação de orçamentos
- ✅ **M06-FINANCEIRO_BASICO**: Contas a receber/pagar, fluxo de caixa básico
- ✅ **M05-MANIPULACAO_BASICA**: Ordens de produção, controle de qualidade básico

#### Critérios de Conclusão do MVP:
- [ ] Fluxo completo: receita → orçamento → produção → entrega → financeiro
- [ ] 5 farmácias piloto em produção por 30 dias
- [ ] < 3 bugs críticos reportados por semana
- [ ] Treinamento de usuários < 4 horas
- [ ] Performance: 95% requests < 500ms

### 7.2. FASE 2: Expansão Funcional e Primeiras IAs
**Duração**: 6-9 meses após MVP  
**Objetivo**: Integrar IA para otimização e adicionar módulos avançados

#### Módulos Incluídos:
- 🚀 **M02-ATENDIMENTO_AVANCADO**: OCR, NLU, processamento automatizado
- 🚀 **M10-FISCAL_BASICO**: NF-e, NFS-e, conformidade básica
- 🚀 **M06-FINANCEIRO_AVANCADO**: Conciliação bancária, IA para classificação
- 🚀 **M11-PDV_BASICO**: Ponto de venda integrado
- 🚀 **M03-ORCAMENTACAO_INTELIGENTE**: Precificação dinâmica, sugestões IA
- 🚀 **M04-ESTOQUE_AVANCADO**: Previsão de demanda, otimização de compras
- 🚀 **M21-RASTREABILIDADE_PROCESSOS**: Rastreabilidade completa de produção
- 🚀 **M22-PROMOCOES_MARKETING**: Campanhas, desconto automático, fidelidade
- 🚀 **M18-FORMULAS_PRODUCAO_INTERNA**: Gestão de fórmulas padronizadas
- 🚀 **M20-SNGPC_CONTROLADOS**: Escrituração eletrônica SNGPC/RMNR

#### Critérios de Conclusão da Fase 2:
- [ ] IA de receitas com 90% de precisão em produção
- [ ] 50+ farmácias ativas utilizando o sistema
- [ ] Integração fiscal funcionando em 3 estados
- [ ] ROI demonstrado de 20% para farmácias piloto
- [ ] NPS > 70 entre usuários finais

### 7.3. FASE 3: Inteligência Artificial Plena e Módulos Complementares
**Duração**: 9-12 meses após Fase 2  
**Objetivo**: IA avançada em todos os módulos e funcionalidades premium

#### Módulos Incluídos:
- 🎯 **M02-ATENDIMENTO_IA_COMPLETO**: Audio/vídeo, chatbot avançado, automação completa
- 🎯 **M06-FINANCEIRO_PREDITIVO**: Previsão fluxo de caixa, detecção anomalias
- 🎯 **M04-ESTOQUE_OTIMIZADO**: IA para compras, otimização automática
- 🎯 **M16-BI_RELATORIOS**: Business Intelligence com insights automáticos
- 🎯 **Módulos Complementares**: RH, Convênios, E-commerce, Gestão de Processos

#### Critérios de Conclusão da Fase 3:
- [ ] IA processando 95% das receitas sem intervenção humana
- [ ] 200+ farmácias ativas no sistema
- [ ] Marketplace de funcionalidades para terceiros
- [ ] Reconhecimento como líder de mercado no segmento
- [ ] Preparação para expansão internacional

---

## 8. Suposições e Dependências

### 8.1. Suposições
- **Conectividade**: Farmácias têm internet estável (99% uptime)
- **Hardware**: Equipamentos compatíveis (tablets, scanners, impressoras)
- **Treinamento**: Usuários receberão treinamento adequado (16h inicial)
- **Dados**: Farmácias fornecerão dados históricos para IA
- **Regulatório**: Normas SNGPC/RMNR permanecerão estáveis
- **Adoção**: Taxa de adoção de 80% entre funcionários em 3 meses

### 8.2. Dependências Externas

#### APIs e Serviços de IA:
- **OCR**: Google Vision AI ou AWS Textract (SLA 99.9%)
- **NLP**: OpenAI GPT-4 API ou Google Gemini
- **Speech-to-Text**: Google Cloud Speech-to-Text
- **Tradução**: Google Translate API (se necessário)

#### Integrações de Negócio:
- **WhatsApp Business API**: Meta/360Dialog
- **Pagamentos**: Stripe, PagSeguro, Mercado Pago
- **Fiscal**: APIs Nota Fiscal (Focus NFe, TecnoSpeed)
- **Correios**: API para rastreamento e cálculo de frete
- **Bancos**: Open Banking APIs para conciliação

#### Infraestrutura:
- **Supabase**: Disponibilidade e performance conforme SLA
- **n8n**: Estabilidade da plataforma de automação
- **Cloud Provider**: AWS/GCP com 99.99% SLA
- **CDN**: CloudFlare para distribuição global

#### Regulatório:
- **CFF**: Aprovação para assinatura digital de farmacêuticos
- **ANVISA**: Conformidade com diretrizes de sistemas informatizados
- **Receita Federal**: Integração para emissão de NF-e

---

## 9. Fora do Escopo (Para a Versão Atual)

### 9.1. Funcionalidades Não Incluídas no MVP:
- **E-commerce Completo**: Apenas portal básico de acompanhamento
- **ERP Completo**: Foco apenas nos processos core da farmácia
- **Integração Contábil**: Apenas exportação de dados básicos
- **Multi-idiomas**: Apenas português brasileiro inicialmente
- **App Mobile Nativo**: Apenas PWA responsivo

### 9.2. Integrações Não Prioritárias:
- **Sistemas Legados**: Integração com sistemas antigos de farmácia
- **Telemedicina**: Consultas médicas online
- **Delivery Próprio**: Sistema de entrega integrado
- **Marketplace**: Venda para outras farmácias

### 9.3. Funcionalidades Avançadas (Fase 4+):
- **IA Generativa**: Criação automática de conteúdo para marketing
- **Blockchain**: Rastreabilidade com blockchain
- **IoT**: Integração com sensores de temperatura/umidade
- **Realidade Aumentada**: Visualização 3D de produtos

---

## 10. Glossário

### Termos Farmacêuticos:
- **Dinamização**: Processo de diluição e sucussão usado na homeopatia
- **Forma Farmacêutica**: Apresentação final do medicamento (cápsula, pomada, etc.)
- **Adjuvante**: Substância adicionada para melhorar propriedades do medicamento
- **Magistral**: Medicamento preparado individualmente conforme receita
- **Oficinal**: Medicamento preparado conforme fórmula padrão

### Termos Regulatórios:
- **SNGPC**: Sistema Nacional de Gerenciamento de Produtos Controlados
- **RMNR**: Receituário de Medicamentos com Notificação de Receita
- **CFF**: Conselho Federal de Farmácia
- **ANVISA**: Agência Nacional de Vigilância Sanitária
- **RLS**: Row Level Security (controle de acesso a nível de linha)

### Termos Técnicos:
- **OCR**: Optical Character Recognition (reconhecimento óptico de caracteres)
- **NLU**: Natural Language Understanding (compreensão de linguagem natural)
- **NER**: Named Entity Recognition (reconhecimento de entidades nomeadas)
- **SLA**: Service Level Agreement (acordo de nível de serviço)
- **API**: Application Programming Interface
- **PWA**: Progressive Web Application

---

**Documento vivo - Atualizado conforme evolução do projeto**  
**Próxima revisão programada: 2025-05-26** 