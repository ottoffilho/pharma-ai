# PHARMA.AI - PLANO DE IMPLEMENTAÇÃO ESTRUTURADO
## Documento Guia para Inteligência Artificial e Desenvolvedores

**Instruções para IA:** Este documento detalha o plano de implementação do projeto Homeo.AI. Utilize a estrutura YAML fornecida para entender a arquitetura, stack tecnológica, fases, módulos, prioridades, dependências e critérios de aceitação. A ordem de implementação é definida pelas FASES e, dentro delas, pelas PRIORIDADES e DEPENDÊNCIAS dos módulos.

## METADADOS DO PROJETO
```yaml
nome_projeto: Homeo.AI
versao_documento: 2.2 # Atualizada a versão devido às novas integrações
ultima_atualizacao: 2024-05-21
tipo_sistema: Gestão para Farmácias de Manipulação Homeopática
abordagem_desenvolvimento: Iterativo e Incremental
arquitetura_principal: Monolito Modular + Microsserviços para IA
backend_principal: Supabase (PostgreSQL, Auth, Storage)
frontend_principal: React/TypeScript, Shadcn/ui, Tailwind CSS
```

## 1. ARQUITETURA DO SISTEMA
```yaml
tipo: Híbrida
componentes:
  - nome: Monolito_Modular
    responsabilidade: "Núcleo do sistema (cadastros, pedidos, estoque, financeiro)"
    prioridade: ALTA
  - nome: Microsserviços_IA
    responsabilidade: "Processamento de receitas, modelos preditivos, chatbots"
    prioridade: MÉDIA
  - nome: Automação_n8n
    responsabilidade: "Fluxos de trabalho automáticos, notificações"
    prioridade: MÉDIA
  - nome: Gateway_Notificações
    responsabilidade: "Gerenciamento de comunicações multicanal"
    prioridade: BAIXA
```

## 2. STACK TECNOLÓGICA
```yaml
frontend:
  - tecnologia: React/TypeScript
    versao_minima: "18.0.0"
    uso: "Framework principal"
  - tecnologia: Shadcn/UI + Tailwind CSS
    versao_minima: "latest"
    uso: "Sistema de design e estilização"
  - tecnologia: React Router DOM
    versao_minima: "6.0.0"
    uso: "Roteamento"
  - tecnologia: React Query (TanStack Query)
    versao_minima: "4.0.0"
    uso: "Gerenciamento de estado de servidor"
  - tecnologia: Zod
    versao_minima: "3.0.0"
    uso: "Validação de formulários"

backend:
  - tecnologia: Supabase
    uso: "Backend-as-a-Service (BaaS)"
    componentes:
      - PostgreSQL (Banco de dados principal)
      - Auth (Autenticação)
      - Storage (Armazenamento de arquivos)
      - Realtime (Atualizações em tempo real)
      - Edge Functions/Functions (Lógica de negócios)
  
  microsservicos:
    - tecnologia: Python/FastAPI
      uso: "Microsserviços de IA"
    - tecnologia: Node.js/TypeScript
      uso: "Funções serverless complementares"

ia_ml:
  - tecnologia: OCR (Google Vision AI, AWS Textract)
    uso: "Extração de dados de receitas"
  - tecnologia: NLU/NLP (spaCy, Transformers)
    uso: "Processamento de linguagem natural"
  - tecnologia: LLMs (OpenAI, Gemini)
    uso: "Interpretação e geração de texto"
  - tecnologia: scikit-learn, TensorFlow
    uso: "Modelos preditivos"
  - tecnologia: pgvector
    uso: "Armazenamento de embeddings"

automacao:
  - tecnologia: n8n
    uso: "Fluxos de trabalho e automação"
```

## 3. FASES DE IMPLEMENTAÇÃO

### FASE 1: MVP (Produto Mínimo Viável)
```yaml
codigo_fase: FASE_1_MVP
duracao_estimada: "3-6 meses"
objetivo: "Implementar cadastros essenciais e fluxo básico de receita até financeiro. Validar o core do sistema."
dependencias_externas: [] # Nenhuma dependência de fase anterior
status_atual: "Cadastros básicos em desenvolvimento"
```

#### Módulos da Fase 1 (Ordem Sugerida por Prioridade e Dependência):
1. **M01-CADASTROS_ESSENCIAIS** [PRIORIDADE: CRÍTICA]
   ```yaml
   descricao: "Base de dados fundamental para todo o sistema, incluindo cadastros auxiliares e entidades complexas como insumos, lotes, embalagens e seus vínculos."
   entidades:
     - Empresa/Loja # Manter existente, pode precisar de detalhamento futuro
     - Usuários (Funcionários) # Manter existente, M09 detalhará permissões
     - Clientes (Pacientes) # Manter existente, pode precisar de detalhamento futuro
     - Formas/Condições de Pagamento # Manter existente
     - Categorias Financeiras # Manter existente
     
     - Fornecedores: # Detalhar/Complementar com Fabricantes se necessário
         campos_adicionais: "Dados de Fabricante (se unificado): Código, Razão Social, Nome Fantasia, CNPJ, Contato. (Fonte: Cadastro de categorias.pdf [65-95])"

     - Formas Farmacêuticas:
         detalhes: "Entidade para registrar as diversas formas farmacêuticas (ex: Cápsulas, Solução Oral, Creme). Campos: Código, Nome, Descrição. Esta entidade será vinculada a embalagens e matérias-primas. (Fontes [705-790])"
     - Unidades de Medida:
         detalhes: "Entidade para registrar unidades de medida (ex: mg, ml, Un). Campos: Código, Nome, Sigla, Tipo (Peso, Volume, Quantidade). (Fontes [858-912])"

     - Insumos: # Detalhamento baseado em "Cadastro de produtos.pdf" (Fontes [467-527])
         campos_gerais: "Ativo (boolean), Localização (fk para Localizações de Estoque), Tipo de produto (Patrimônio, Material de Consumo, Matéria-prima, etc. - lookup para Categorias de Produtos/Insumos ou tipo específico), Desc. rótulo, Cód. barras, NCM, CEST."
         campos_adicionais_produto_revenda: "Quando Tipo for 'Produto de Revenda': Número MS (registro na ANVISA), Uso (descrição de uso do produto), Tabela de preço padrão. (Fonte: Cadastro de produtos.pdf)"
         classificacao_hierarquica: "Grupo (fk), Classificação (fk), Linha (fk), Classe (fk), Categoria (fk para Categorias de Produtos/Insumos), Marca (fk), Fabricante (fk), Tipo estoque (fk para Tipos de Estoque - unidade principal)."
         precificacao_custo: "Unid. venda, Índice custo (valor e %), Índice venda (valor e %), Índice ref. (valor e %), Valor compra, Valor custo, Valor venda, Valor referência."
         lista_estoque_lotes: "Referência à entidade Lotes. Campos exibidos na tela de insumos: Lote Sis., Loja, Estoque (saldo do lote na loja), Lote Fab., Status do lote (Disponível, Quarentena), Fornecedor do Lote, Vencimento, Localização Lote, Quantidade Lote."
         rodape_resumo_controle: "Est. min, Est. máx, Gasto Mês, Reposição, Compras, Laboratório, Almoxarifado, Estoque total. Checkboxes: Baixa monitorada, Sem controle de estoque, Utilizar estoque, Aceitar qtde. fracionada, Usar no atendimento."
         acoes: "Botão: Digitalizar (para laudos/documentos)."
         informacoes_extras_revenda: "Para Produtos de Revenda: Unidade de venda, % comissão, % desconto máximo permitido, Fração de compra, Fração de venda, Controle de segregados (boolean), Link para e-Commerce (URL). Checkboxes: Uso contínuo, Fracionável, Baixa monitorada, Permitir fração de compra. (Fonte: Cadastro de produtos.pdf)"
         controle_receituario: "Para Produtos Controlados: Lista especial (fk para Listas de controle especial), Portaria (fk para Portarias), Checkboxes para 'Não enviar SNGPC', 'Produto monitorado (Polícia Civil)'. (Fonte: Cadastro de produtos.pdf)"
     - Lotes: # Detalhamento baseado em "Gestão de Estoque e Lotes.pdf" (Fontes [913-945])
         informacoes_estoque: "Tipo produto (fk Insumos.Tipo), Local (fk Localizações de Estoque), Estoque (área de estoque), Status (Liberado, Quarentena), Saldo."
         informacoes_lote: "Origem (Nacional, Importado - lookup para Origens), Fornecedor (fk), Fabricante (fk), Botão Consultar laudos do lote, Concentração %, ui, ufc/g, Densidade, utr (Unidade de Turbidez Referência?), Umidade %."
         informacoes_produto_lookup: "Produto (fk Insumos), Fabricação (data), Lote (número fab.), Vencimento (data), Qtde. entrada."
         observacao: "Campo de texto para observações."
     - Embalagens: # Detalhamento baseado em "Volumes.pdf" (Fontes [858-912])
         lista_volumes_principal: "Código, Nome do produto, Volume (Cm³/ml), Vol. revestimento, AT (Ativo)."
         lista_produtos_relacionado_volume_acondicionamento: "TP (Tipo, ex: EMB), Código, Nome do produto, Qtde. (quantas unidades do item principal cabem)."
         lista_dependencias_componentes: "Código, Nome do produto, Qtde."

     # Novas entidades baseadas em "Cadastro de categorias.pdf" (Fontes [65-95])
     - Categorias de Produtos/Insumos: # Tela 070 (Fontes [1-18])
         campos: "Tipo (dropdown/lookup: Material de consumo, Insumo - Alopatia, Insumo - Homeopatia, Revenda, Embalagens), Código, Associação (ex: Monodroga), Nome, Descrição."
     - Classes:
         campos: "Código, Nome."
     - Classificações:
         campos: "Código, Nome."
     - Fabricantes: # Complementar/detalhar Fornecedores ou manter como entidade separada
         campos: "Código, Razão Social, Nome Fantasia, CNPJ, Contato."
     - Linhas:
         campos: "Código, Nome."
     - Listas de controle especial:
         campos: "Código Lista, Nome Lista, Referência Portaria (ex: A1, B1, C1 da Portaria 344/98 - lookup para Portarias)."
     - Localizações de estoques:
         campos: "Código, Nome/Descrição, Observações."
     - Marcas:
         campos: "Código, Nome."
     - Origens:
         campos: "Tipo (Homeopatia: Reino Vegetal, Animal, Mineral, Nosódio; Fiscal: Nacional, Estrangeira), Código, Nome."
     - Portarias:
         campos: "Código/Número, Data, Ementa, Link (para texto da portaria)."
     - Tipos de estoque: # Unidade de medida principal para controle
         campos: "Código, Nome, Unidade de Medida Padrão (fk para Unidades de Medida)."
         
     # Novas entidades adicionais
     - Equipamentos: # Baseado em "Cadastro de produtos.pdf" (tela 180, Fontes [546-577])
         campos: "Código, Ativo (boolean), Descrição, Produto relacionado (lookup para Insumos/Produtos onde Tipo=Patrimônio), Loja (fk), Departamento, Marca (fk), Modelo, Número série, Prazo manutenção (dias), Situação (Bom, Em Manutenção, etc.), Valor, Observação."
     - Termos LGPD: # Baseado em "cadastro termo lgpd.pdf" (Fontes [348-373])
         campos: "Código, Ativo (boolean), Nome, Tipo de uso (Cliente, Prescritor, Funcionário, Fornecedor - checkboxes), Descrição (área de texto para o termo)."
     - Índices de Custo: # Baseado em "formação de preços.pdf" (tela 656, Fontes [110-121])
         campos: "Código, Tipo índice (DESPESAS FIXAS, CUSTOS VARIAVEIS, CUSTOS DIRETOS - lookup), Descrição."

     # Funcionalidades de Vínculos Estruturais (podem ser telas/funcionalidades que usam as entidades acima)
     - Vínculo Forma Farmacêutica com Embalagem: # (Fontes [705-790])
         descricao_funcionalidade: "Tela para associar uma forma farmacêutica principal com suas embalagens, acessórios e subcomponentes."
         selecao_principal: "Forma farmacêutica (fk)."
         lista_embalagens_associadas: "Ordem, Código (fk Embalagens), Nome do produto (embalagem), Volume, Tipo (envase), Envase, ET (Etiqueta?), AT (Ativo?)."
         lista_produtos_relacionados_embalagem_acessorios: "Código (fk Insumos/Embalagens), Nome do produto, QR, QE, NP, Item, MQ, EE, IP." # Detalhar significado dos campos se possível
         lista_dependencias_volumes_subcomponentes: "Código (fk Embalagens), Nome do produto, Qtde."
         popup_incluir_produto_relacionado: "Produto (fk), Tipo embalagem (do prod. rel.), Quantidade, Qtde embalagem principal, Nº item, Checkboxes: Produto relacionado x Qtde embalagem principal, Forçar inclusão na ficha de pesagem, Embalagem específica."
     - Vínculo Matéria Prima com Tipo de Embalagem: # (Fontes [791-857])
         descricao_funcionalidade: "Tela para relacionar matérias-primas com tipos gerais de embalagem e suas especificidades."
         informacoes_gerais: "Tipo Produto (Alopatia, etc. - fk Categorias), Tipo embalagem (categoria geral, ex: CAPSULAS REVESTIDAS - lookup)."
         lista_produtos_mp_relacionados_tipo_embalagem: "PR (Prioridade), Código (fk Insumos onde tipo=Matéria-prima), Nome do produto (MP), Tipo de vínculo (Obrigatório), Tipo de envase (Envase da dose/fórmula), AT."
         lista_formas_farmaceuticas_compativeis: "fk Formas Farmacêuticas."
         lista_embalagens_especificas_relacionadas_tipo_embalagem: "fk Embalagens."
         popup_incluir_produto_mp: "Produto (fk Insumos), Tipo vínculo, Tipo envase, Prioridade, Ativo."

   implementacao: # Atualizar para refletir a complexidade
     - backend: "Tabelas Supabase com RLS configurado para todas as entidades e seus relacionamentos. Validações detalhadas em nível de banco (constraints, triggers se necessário) e em Edge Functions/Functions para lógicas complexas. APIs para CRUD completo de todas as entidades, incluindo filtros, ordenação e paginação. Endpoints específicos para funcionalidades de vínculo."
     - frontend: "Interfaces CRUD completas e intuitivas para cada entidade, utilizando formulários React Hook Form com validação Zod. Componentes reutilizáveis para lookups, seletores hierárquicos. Telas dedicadas para as funcionalidades de Vínculo Forma Farmacêutica-Embalagem e Vínculo Matéria Prima com Tipo de Embalagem. Gerenciamento de estado com React Query."
   metricas_conclusao: # Atualizar para refletir a complexidade
     - "100% das entidades listadas modeladas no Supabase com relacionamentos, RLS e validações básicas."
     - "Interfaces CRUD funcionais, testadas e com boa usabilidade para todas as entidades."
     - "Funcionalidades de 'Vínculo Forma Farmacêutica com Embalagem' e 'Vínculo Matéria Prima com Tipo de Embalagem' implementadas e testadas."
     - "Documentação da API (Swagger/Postman) para todos os endpoints de M01."
     - "Testes unitários e de integração cobrindo a lógica de backend e interações frontend-backend."
   dependencias_modulos: [] # Módulo base
   servicos_ia_sugeridos:
     - "Cadastro de Produtos/Insumos: Sugestão de NCM/CEST via NLP (Fontes [467-527]), Categorização automática de produtos via NLP (Fontes [467-527]), Extração de dados de laudos de fornecedores (OCR+NLU) (Fontes [467-527]), Alerta de margens baixas na precificação inicial (Fontes [467-527]), Otimização de sugestão de localização física no estoque (Fontes [467-527])."
     - "Produtos de Revenda: Preenchimento Automático por Código de Barras/Nº MS (consulta a bases externas), Sugestão Inteligente de Classificação, Precificação Dinâmica e Sugestão de Valor Venda baseada em margens e mercado, Alerta Proativo de Validade e Lotes Segregados, Recomendação de Produtos Relacionados para cross-selling. (Fonte: Cadastro de produtos.pdf)"
     - "Cadastro de Lotes: OCR para entrada de dados da NF/rótulo/CoA (Fontes [913-945]), Validação cruzada de CoA com especificações do insumo (Fontes [913-945])."
     - "Cadastro de Embalagens (Volumes): Validação inteligente de dados de volume (NLP para nome vs. valor) (Fontes [858-912]), Sugestão automática de produtos relacionados (acondicionamento) via regras de associação (Fontes [858-912]), Sugestão de dependências (componentes) via NLP e similaridade (Fontes [858-912]), Consistência na nomenclatura de embalagens (Fontes [858-912])."
     - "Vínculo Matéria Prima com Tipo de Embalagem: Sugestão inteligente de vínculos (MP <> Tipo Embalagem) baseada em propriedades físico-químicas e histórico (Fontes [791-857]), Inferência de Tipo de Vínculo e Tipo de Envase via ML (Fontes [791-857]), Alerta de incompatibilidade Matéria-Prima/Embalagem (Fontes [791-857]), Preenchimento automático de formas farmacêuticas e embalagens específicas compatíveis (Fontes [791-857])."
     - "Vínculo Forma Farmacêutica com Embalagem: Seleção inteligente de embalagem (compatibilidade, custo, disponibilidade, histórico) (Fontes [705-790]), Sugestão automática de produtos relacionados e dependências (ex: aplicadores, tampas) via mineração de regras de associação (Fontes [705-790]), Otimização de custo de embalagem no orçamento (Fontes [705-790]), Validação inteligente de configurações de vínculo (ex: volume vs. capacidade) (Fontes [705-790])."
     - "Cadastro de Equipamentos: Manutenção preditiva (PdM) (Fontes [546-577]), Agendamento inteligente de manutenções (Fontes [546-577]), Análise de causa raiz de falhas assistida por IA (Fontes [546-577]), OCR e extração de dados de manuais/certificados de calibração (Fontes [546-577]), Otimização da vida útil e decisão de substituição de equipamentos (Fontes [546-577])."
     - "Cadastro de Termos LGPD: IA para Análise e Classificação de Cláusulas (NLP) (Fontes [348-373]), Gestão Inteligente de Versionamento e Notificações de Termos (Fontes [348-373]), Auditoria Contínua de Consentimentos com IA (Process Mining/Anomaly Detection) (Fontes [348-373]), Mapeamento de Finalidades e Bases Legais para RoPA (Fontes [348-373]), Chatbot Interno para Dúvidas sobre LGPD (Fontes [348-373]), Suporte à Gestão de Direitos dos Titulares (Fontes [348-373])."
     - "Cadastros Auxiliares (Categorias, Classes, etc.): Sugestão inteligente durante o uso para evitar duplicidade (busca fonética/similaridade) (Fontes [65-95]), Facilitação de criação de novo registro auxiliar em contexto (Fontes [65-95]), Detecção de duplicidade/redundância (Fontes [65-95]), Identificação de itens obsoletos (Fontes [65-95]), Padronização de nomenclatura (Fontes [65-95])."
     - "Cadastro de Índices de Custo (Formação de Preços): Sugestão de Tipo de Índice via NLP (Fontes [110-121]), Análise de redundância de índices (Fontes [110-121])."
   ```

2. **M09-USUARIOS_PERMISSOES** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Gerenciamento de acesso e segurança do sistema, incluindo perfis e permissões granulares."
   funcionalidades:
     - Perfis básicos (Administrador, Farmacêutico, Atendente)
     - Controle de acesso a funcionalidades e módulos
     - "Considerar granularidade de permissões específicas (ex: Permissão para alterar configurações de atendimento - Fonte: Configuracoes do atendimento.pdf [263], Permissão para acessar tela de formação de preços, etc.). O modelo de permissões deve ser flexível o suficiente para acomodar essas permissões específicas conforme os módulos são desenvolvidos."
   implementacao:
     - backend: "Integração com Supabase Auth, definição de roles e policies. Criação de uma tabela de permissões customizadas que podem ser associadas a roles, permitindo um controle mais granular do que apenas os roles do Supabase podem oferecer. API para verificar permissões."
     - frontend: "Proteção de rotas, exibição condicional de UI (botões, campos, seções) baseada em permissões obtidas do backend."
   metricas_conclusao:
     - "Perfis de usuário definidos e aplicados."
     - "Controle de acesso testado para os principais fluxos e funcionalidades críticas (ex: acesso a configurações, alteração de preços)."
     - "Modelo de permissões granular implementado e documentado."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS"] 
   ```

3. **M02-ATENDIMENTO_BASICO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Permite o registro inicial de solicitações de clientes, incluindo configurações básicas de atendimento e integração inicial com canais omni-channel."
   funcionalidades:
     - Entrada manual de receitas (texto digitado)
     - Criação básica de pedido
     - Cálculo manual de itens do pedido
     - Gerenciamento de status básicos do pedido (Ex: Orçamento, Em Aberto)
     - "Configurações de Atendimento (Aba Geral - de Configuracoes do atendimento.pdf, Fontes [178-347]): Aplicação inicial de configurações relevantes para o atendimento básico. Ex: `Suprimir CR do prescritor no rótulo`, `Utilizar tabela de horários (horário automático)`, `Padrão p/ receituário Ok`. (Estas configurações serão gerenciadas em M0X-CONFIGURACOES_SISTEMA futuramente)."
     - "Configurações de Atendimento (Aba Receita - de Configuracoes do atendimento.pdf, Fontes [178-347]): Aplicação inicial de configurações relevantes. Ex: `Imprimir o texto \"USO VETERINÁRIO\"`, `Casas decimais dos cálculos de manipulação`. (Gerenciadas em M0X-CONFIGURACOES_SISTEMA)."
     - "Omni Channel (de omni channel.pdf, Fontes [402-466]): Configuração básica do canal de entrada (ex: WhatsApp API/Webhook) para recebimento de mensagens/receitas. Mensagens automáticas básicas via Chatbot (confirmação, prazos iniciais baseados em horário de atendimento). Painel simplificado para monitoramento de receitas recebidas via canal digital e status do processamento inicial."
         campos_omni_channel: "`Tipo de canal`, `Senha/Token`, `Texto orçam. (Sintético/Detalhado)`, mensagens de boas-vindas/finalização."
   implementacao:
     - backend: "API para gerenciamento de pedidos e seus itens. Lógica para aplicar configurações básicas de atendimento. Webhook para recebimento de mensagens de canais omni-channel. API para log de interações omni-channel."
     - frontend: "Interface para criação e edição de pedidos, associando clientes e receitas. Exibição de informações relevantes das configurações de atendimento. Painel de monitoramento de receitas omni-channel."
   metricas_conclusao:
     - "Fluxo de criação de pedido manual funcional."
     - "Associação com clientes e insumos (para cálculo manual) testada."
     - "Configurações básicas de atendimento (Geral, Receita selecionadas) aplicadas e refletindo no comportamento do sistema."
     - "Recebimento de mensagens de um canal omni-channel configurado (ex: WhatsApp) e exibição no painel de monitoramento."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M09-USUARIOS_PERMISSOES"]
   servicos_ia_sugeridos: # Sugestões das Configurações de Atendimento e Omni Channel
     - "Assistente de Configuração Inteligente (para M0X-CONFIGURACOES_SISTEMA) (Fontes [178-347])"
     - "Recomendações Proativas de Configurações (para M0X-CONFIGURACOES_SISTEMA) (Fontes [178-347])"
     - "Chatbot com IA para atendimento inicial e triagem (para Omni Channel) (Fontes [402-466])"
   ```

4. **M04-ESTOQUE_BASICO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Controle inicial de insumos e embalagens, incluindo configuração de estoque mínimo/máximo e funcionalidades básicas de lotes."
   funcionalidades:
     - "Entrada manual de notas fiscais de compra (cabeçalho: fornecedor, número, série, chave, datas, totais; itens: produto, qtde, valor, impostos; duplicatas: vencimentos, valores)"
     - "Importação de XML de NF-e de compra para preenchimento automático dos dados da nota e itens"
     - "Baixa manual/semi-automática de insumos na produção (já previsto)"
     - "Alertas básicos de estoque mínimo (baseados em regras simples) (já previsto)"
     - "Registro de dados da transportadora (se houver)"
     - "Associação de NF de compra a lotes de insumos cadastrados no M01"
     - "Configuração de estoque mínimo e máximo (baseado em Gestão de Estoque e Lotes.pdf, Fontes [914, 946-956]):"
         config_estoque_min_max_campos: "Especificação da `Loja onde está o almoxarifado` (fk Lojas/Empresa de M01) e a `Lista de lojas que o almoxarifado irá suprir` (multi-select Lojas/Empresa de M01). Os valores de estoque mínimo e máximo são definidos no cadastro do produto (M01), esta tela contextualiza a configuração para cenários multiloja ou almoxarifados centrais."
     # As funcionalidades de Lotes já foram detalhadas em M01-CADASTROS_ESSENCIAIS (informacoes_estoque, informacoes_lote, etc. Fontes [913-945])
     # Aqui focamos na utilização e configuração contextual do estoque.
   implementacao:
     - backend: "Lógica para atualização de saldos de estoque e custos. Parsing de XML de NF-e. API para CRUD de NF de Compra e seus itens. API para configurar a relação entre almoxarifado central e lojas supridas."
     - frontend: "Interface para registrar entradas (manual e via XML), visualizar saldos, detalhes da NF de compra e seus itens. Interface para configurar o almoxarifado central e lojas supridas."
   metricas_conclusao:
     - "Atualização de estoque a partir de NF de compra testada."
     - "Importação de XML de NF-e de compra funcional."
     - "Lançamento de duplicatas no Contas a Pagar (M06) a partir da NF de Compra."
     - "Configuração de almoxarifado central e lojas supridas funcional e refletindo em lógicas de reposição (se aplicável no básico)."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS"]
   servicos_ia_sugeridos:
     - "Entrada de Lotes Inteligente (OCR+NLU de NF/rótulo/CoA) (Já listado em M01, referente a Fontes [913-945])"
     - "Validação Cruzada de CoA com IA (Já listado em M01, referente a Fontes [913-945])"
     - "Gestão de Estoque Mínimo/Máximo Dinâmica e Preditiva (ML para Previsão de Demanda) (Fontes [914, 946-956]) (Para M04 Avançado)"
   ```
   
5. **M03-ORCAMENTACAO_SIMPLES** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Criação de orçamentos para clientes, integrando funcionalidades básicas de formação de preços."
   funcionalidades:
     - Cálculo de orçamento baseado em insumos cadastrados
     - Aplicação de margens de lucro simples e configuráveis (inicialmente globais ou por categoria ampla)
     - Geração de PDF do orçamento
     - "Formação de Preços (Baseado em formação de preços.pdf, Fontes [107-177]):"
         requisitos_formacao_preco: "Utilização de Índices de Custo (cadastrados em M01 - DESPESAS FIXAS, CUSTOS VARIAVEIS, CUSTOS DIRETOS) para compor o custo do produto/serviço."
         calculo_markup_margem: "Tela para Cálculo de markup e margem de lucro (baseado na tela 659, Fontes [108, 126-157]). Campos: `Valor de custo do produto`, `Margem de lucro %`, `Lucro R$`, `Índice de Markup`, `Preço de venda`. Apresentação da 'Análise de custo'."
         atualizacao_precos_base: "Funcionalidade simplificada de Atualização de produtos (baseado na tela 660, Fonte [109]), permitindo aplicar um fator de ajuste em preços de produtos filtrados (ex: por Grupo ou Classificação de M01). (Tabelas de preços completas serão FASE 2)."
     - "Configurações de Atendimento (Aba Revenda - de Configuracoes do atendimento.pdf, Fontes [178-347]): Aplicação inicial de configurações relevantes para orçamentação e venda. Ex: `Registrar comissão p/ o funcionário que registrou o orçamento`, `Bloquear vendas de clientes em débito`, `Validade em dias para orçamentos (ficha de orçamento)`. (Estas configurações serão gerenciadas em M0X-CONFIGURACOES_SISTEMA futuramente)."
   implementacao:
     - backend: "API para cálculo de orçamentos, incorporando custos (baseados nos Índices de Custo) e margens. Lógica para aplicação das configurações de revenda. API para funcionalidade de atualização de preços base."
     - frontend: "Interface para criar orçamentos a partir de pedidos/receitas. Exibição clara da composição do preço. Interface para a funcionalidade de atualização de preços base."
   metricas_conclusao:
     - "Cálculo de orçamento preciso, refletindo custos e margens configuradas."
     - "Geração de PDF do orçamento testada."
     - "Funcionalidade de cálculo de markup/margem (tela 659) implementada."
     - "Funcionalidade de atualização de preços base (tela 660 simplificada) testada."
     - "Configurações de revenda (selecionadas) aplicadas e refletindo no comportamento."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M02-ATENDIMENTO_BASICO", "M04-ESTOQUE_BASICO"]
   servicos_ia_sugeridos: # Sugestões da Formação de Preços
     - "Alocação Inteligente de Custos Fixos (para M0X-CONFIGURACOES_SISTEMA / M03 Avançado) (Fontes [107-177])"
     - "Sugestão de Margem/Markup Dinâmico (para M03 Avançado) (Fontes [107-177])"
     - "Simulação de Cenários de Precificação (para M03 Avançado) (Fontes [107-177])"
   ```

6. **M06-FINANCEIRO_BASICO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Gerenciamento financeiro elementar da farmácia."
   funcionalidades:
     - Lançamento manual de contas a pagar e a receber
     - "Geração automática de lançamentos no Contas a Pagar a partir de duplicatas da NF de Compra (M04)"
     - Fluxo de caixa básico (entradas e saídas)
     - Associação de lançamentos a pedidos/clientes
   implementacao:
     - backend: "API para transações financeiras."
     - frontend: "Interfaces para lançamentos e visualização de fluxo de caixa."
   metricas_conclusao:
     - "Lançamentos financeiros funcionando."
     - "Fluxo de caixa refletindo transações corretamente."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M03-ORCAMENTACAO_SIMPLES"] 
   ```

7. **M05-MANIPULACAO_BASICA** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Controle inicial do processo de manipulação."
   funcionalidades:
     - Geração de ordem de manipulação a partir do pedido confirmado
     - Registro de lotes de insumos utilizados na manipulação
     - Atualização do status do pedido para \"Em Manipulação\", \"Pronto\"
   implementacao:
     - backend: "Lógica para ordens de manipulação e rastreabilidade de lotes."
     - frontend: "Interface para visualizar e gerenciar ordens de manipulação."
   metricas_conclusao:
     - "Geração de ordens de manipulação testada."
     - "Rastreabilidade de lotes funcionando."
   dependencias_modulos: ["M02-ATENDIMENTO_BASICO", "M04-ESTOQUE_BASICO"]
   ```

8. **MXX-CADASTROS_AUXILIARES** [PRIORIDADE: ALTA] # Novo módulo sugerido
   ```yaml
   descricao: "Gerenciamento centralizado de todos os cadastros de apoio e tabelas auxiliares do sistema, identificados principalmente em 'Cadastro de categorias.pdf' (Fonte [65])."
   entidades_funcionalidades:
     - "CRUD para Classes (Campos: Código, Nome). (Fonte [65-95])"
     - "CRUD para Classificações (Campos: Código, Nome). (Fonte [65-95])"
     - "CRUD para Fabricantes (Campos: Código, Razão Social, Nome Fantasia, CNPJ, Contato - complementar/integrar com Fornecedores de M01). (Fonte [65-95])"
     - "CRUD para Linhas (Campos: Código, Nome). (Fonte [65-95])"
     - "CRUD para Listas de controle especial (Campos: Código Lista, Nome Lista, Referência Portaria (fk Portarias)). (Fonte [65-95])"
     - "CRUD para Localizações de estoques (Campos: Código, Nome/Descrição, Observações). (Fonte [65-95])"
     - "CRUD para Marcas (Campos: Código, Nome). (Fonte [65-95])"
     - "CRUD para Origens (Campos: Tipo [Homeopatia: Reino Vegetal, etc.; Fiscal: Nacional, etc.], Código, Nome). (Fonte [65-95])"
     - "CRUD para Portarias (Campos: Código/Número, Data, Ementa, Link). (Fonte [65-95])"
     - "CRUD para Tipos de estoque (Campos: Código, Nome, Unidade de Medida Padrão (fk UnidadesDeMedida)). (Fonte [65-95])"
     # Outras entidades que podem surgir como auxiliares de outros módulos podem ser adicionadas aqui.
   implementacao:
     - backend: "Tabelas Supabase com RLS para cada entidade auxiliar. APIs CRUD padronizadas para cada uma."
     - frontend: "Interfaces CRUD simples e padronizadas para cada cadastro auxiliar, possivelmente utilizando um gerador de CRUD ou componentes reutilizáveis para acelerar o desenvolvimento."
   metricas_conclusao:
     - "Todas as entidades auxiliares listadas implementadas com CRUD funcional."
     - "Interfaces de fácil utilização para gerenciamento dos cadastros auxiliares."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS"] # Depende de UoM, Portarias podem ser independentes ou referenciadas por Listas.
   servicos_ia_sugeridos:
     - "Sugestão inteligente durante o uso para evitar duplicidade (busca fonética/similaridade) (Fontes [65-95])"
     - "Facilitação de criação de novo registro auxiliar em contexto (Fontes [65-95])"
     - "Detecção de duplicidade/redundância (Fontes [65-95])"
     - "Identificação de itens obsoletos (Fontes [65-95])"
     - "Padronização de nomenclatura (Fontes [65-95])"
   ```

9. **M0X-CONFIGURACOES_SISTEMA** [PRIORIDADE: ALTA] # Novo módulo sugerido
   ```yaml
   descricao: "Centraliza todas as configurações globais e parametrizações do sistema, agrupando funcionalidades de 'Configuracoes do atendimento.pdf' (Fontes [178-347]) e outras configurações sistêmicas."
   funcionalidades_principais:
     - "Gestão de Configurações Gerais do Atendimento (Aba Geral):"
         campos: "(Listar todos os 19+ itens da aba 'Geral' de Configuracoes do atendimento.pdf, Fontes [178-262], ex: `Suprimir CR do prescritor no rótulo`, `Utilizar tabela de horários`, `Padrão p/ receituário Ok`, etc.)"
     - "Gestão de Configurações de Receita (Aba Receita):"
         campos: "(Listar todos os itens da aba 'Receita' de Configuracoes do atendimento.pdf, Fontes [264-297], ex: `Imprimir o texto \"USO VETERINÁRIO\"`, `Casas decimais dos cálculos`, `Seleção dos lotes no cálculo`, Níveis de taxa técnica, etc.)"
     - "Gestão de Configurações de Revenda (Aba Revenda):"
         campos: "(Listar todos os itens da aba 'Revenda' de Configuracoes do atendimento.pdf, Fontes [298-325], ex: `Registrar comissão`, `Bloquear vendas de clientes em débito`, `Validade orçamentos`, etc.)"
     - "Gestão de Configurações de E-mail: (Fonte [326])"
         campos: "Configurações de SMTP, modelos de e-mail básicos."
     - "Gestão de Certificado Digital (NF-e): (Fontes [327-329])"
         campos: "Upload e gerenciamento de certificado A1, senha."
     - "Configuração de Horários de Atendimento (Fontes [330-347])"
         campos: "Definição de horários por dia da semana, feriados."
     - "Configuração de Canais Omni Channel (de omni channel.pdf, Fontes [402-466])"
         campos: "`Tipo de canal`, `API Key/Token`, `URL Webhook`, `Mensagens automáticas (boas-vindas, fora de horário, etc.)`, `Texto padrão orçamento (Sintético/Detalhado)`."
     # Outras configurações globais que surgirem podem ser adicionadas aqui.
   implementacao:
     - backend: "Tabelas dedicadas no Supabase para armazenar cada grupo de configuração. APIs seguras (com permissões de M09) para ler e atualizar as configurações. Versionamento de configurações pode ser considerado para histórico/rollback."
     - frontend: "Interface de administração centralizada para todas as configurações, organizada por seções/abas de forma clara e intuitiva. Validações nos formulários de configuração."
   metricas_conclusao:
     - "Todas as configurações identificadas nos PDFs ('Configuracoes do atendimento.pdf', 'omni channel.pdf') mapeadas e implementadas na interface de administração."
     - "Capacidade de salvar, carregar e aplicar as configurações no comportamento do sistema testada."
     - "Acesso à tela de configurações protegido por permissões adequadas (M09)."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M09-USUARIOS_PERMISSOES", "MXX-CADASTROS_AUXILIARES"] # Pode depender de cadastros auxiliares para lookups (ex: Lojas para horários).
   servicos_ia_sugeridos:
     - "Assistente de Configuração Inteligente: Guia o usuário na configuração inicial ou em alterações complexas, explicando o impacto de cada opção. (Fontes [178-347])"
     - "Recomendações Proativas de Configurações: IA analisa o uso do sistema e sugere otimizações de configuração. (Fontes [178-347])"
     - "Análise de Impacto de Alterações de Configuração: Simula ou alerta sobre possíveis consequências de mudar uma configuração crítica. (Fontes [178-347])"
     - "Validação Inteligente de Configurações: Verifica a consistência entre diferentes configurações para evitar conflitos. (Fontes [178-347])"
   ```

### FASE 2: Expansão Funcional e Primeiras IA's
```yaml
codigo_fase: FASE_2_EXPANSAO
duracao_estimada: "6-9 meses após MVP"
objetivo: "Integrar primeiras funcionalidades de IA de alto impacto (OCR, sugestões), expandir módulos fiscal e de atendimento."
dependencias_externas: ["FASE_1_MVP concluída"]
status_atual: "Não iniciado"
```

#### Módulos da Fase 2 (Ordem Sugerida por Prioridade e Dependência):
1. **M02-ATENDIMENTO_AVANCADO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Inteligência na entrada de receitas e integração aprimorada com canais digitais."
   funcionalidades:
     - "IA para interpretação de receitas (foto/PDF) - Fluxo: OCR -> NLU -> Validação Humana Assistida (já previsto)."
     - "Integração com a tela Omni Channel (de omni channel.pdf, Fontes [402-466]) para recebimento de receitas e feedback ao cliente (já parcialmente introduzido em M02-ATENDIMENTO_BASICO, aqui se expande com mais inteligência e fluxos completos)."
   implementacao:
     - backend: "Microsserviço para OCR/NLU (Python/FastAPI ou Node.js). API para receber arquivos de receita (imagem, PDF) e retornar dados estruturados para validação. Lógica aprimorada para interação com canais Omni Channel, incluindo respostas mais inteligentes e contextuais baseadas no processamento da receita."
     - frontend: "Interface de upload de receitas (fotos, PDFs). Interface de validação e correção dos dados extraídos pela IA. Melhorias no painel Omni Channel para exibir status detalhado do processamento da receita e permitir comunicação com o cliente."
   metricas_conclusao:
     - "Taxa de acerto do OCR > 85% em campos chave da receita."
     - "Fluxo de validação de receita via IA (OCR/NLU) funcional e integrado ao M03-ORCAMENTACAO_SIMPLES/INTELIGENTE."
     - "Comunicação de feedback ao cliente via Omni Channel (status da receita, solicitação de esclarecimentos) funcional."
   dependencias_modulos: ["M02-ATENDIMENTO_BASICO", "M0X-CONFIGURACOES_SISTEMA"]
   servicos_ia_necessarios: ["OCR externo (Google Vision/AWS Textract)", "Modelo NLU treinado (pode ser LLM com RAG para extração e interpretação)"]
   servicos_ia_sugeridos:
     - "Análise de Interações e Melhoria Contínua do Chatbot (para Omni Channel) (Fontes [402-466])"
     - "Detecção de Tentativas de Fraude em Receitas Digitais (Fontes [402-466])"
     - "Priorização Inteligente de Atendimentos Omni Channel (Fontes [402-466])"
   ```

2. **M10-FISCAL_BASICO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Conformidade fiscal básica, incluindo configuração de certificado digital e emissão de NFS-e."
   funcionalidades:
     - "Emissão de NF-e/NFC-e essencial (para produtos - já previsto)."
     - "Emissão de NFS-e (Nota Fiscal de Serviço Eletrônica - para serviços de manipulação) (Fonte: Configuracoes do atendimento.pdf [324])."
     - "Integração com API da SEFAZ (para NF-e/NFC-e)."
     - "Integração com webservices municipais para autorização de NFS-e."
     - "Geração e armazenamento do XML e DANFSe (Documento Auxiliar da NFS-e)."
     - "Cálculo de impostos básicos (ICMS, IPI para NF-e)."
     - "Cálculo de ISS, retenções federais (PIS, COFINS, CSLL, IRRF, INSS) e deduções para NFS-e."
     - "Preenchimento de dados do RPS (Recibo Provisório de Serviço), se aplicável."
     - "Consulta de status de NFS-e autorizadas."
     - "Configuração de Certificado Digital (NF-e) (gerenciado em M0X-CONFIGURACOES_SISTEMA, mas utilizado aqui - Fonte: Configuracoes do atendimento.pdf [327-329])."
   implementacao:
     - backend: "Integração com biblioteca/serviço de emissão de NF-e e NFS-e. Lógica de cálculo de impostos (ISS, retenções federais). Leitura das configurações de certificado digital de M0X-CONFIGURACOES_SISTEMA."
     - frontend: "Interface para configuração fiscal (parcialmente em M0X). Interface para emissão/consulta de notas (NF-e e NFS-e), detalhamento de campos da NFS-e (emitente, destinatário, serviços, valores, impostos)."
   metricas_conclusao:
     - "Emissão de NF-e de teste bem-sucedida utilizando certificado configurado."
     - "Emissão de NFS-e de teste (para um município padrão) bem-sucedida utilizando certificado configurado."
     - "Validação com contador sobre os cálculos de impostos (ICMS, IPI, ISS, Retenções)."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M06-FINANCEIRO_BASICO", "M02-ATENDIMENTO_BASICO", "M0X-CONFIGURACOES_SISTEMA"]
   servicos_ia_sugeridos:
     - "IA para preenchimento inteligente da descrição dos serviços na NFS-e (baseado no pedido)"
     - "IA para sugestão de código de serviço municipal (NFS-e)"
     - "IA para motor de regras fiscais (cálculo de ISS e retenções para NFS-e) - FASE_3"
     - "IA para análise de motivos de rejeição de NFS-e - FASE_3"
   ```

3. **M06-FINANCEIRO_AVANCADO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Aprimoramento do controle financeiro."
   funcionalidades:
     - Conciliação bancária (manual/semi-automática com importação OFX/CNAB)
     - IA para classificação de lançamentos financeiros (sugestão de categorias)
     - Relatórios financeiros mais detalhados (DRE gerencial)
   implementacao:
     - backend: "Lógica de importação e matching para conciliação, modelo de IA para categorização."
     - frontend: "Interfaces para conciliação e visualização de relatórios."
   metricas_conclusao:
     - "Conciliação de extrato de teste funcional."
     - "IA sugere categorias com acurácia > 80%."
   dependencias_modulos: ["M06-FINANCEIRO_BASICO"]
   servicos_ia_necessarios: ["Modelo de Classificação de Texto (para lançamentos)"]
   ```
   
4. **M11-PDV_BASICO** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Ponto de Venda para atendimento rápido no balcão."
   funcionalidades:
     - Interface ágil para vendas
     - Seleção de produtos (manipulados e outros)
     - Múltiplas formas de pagamento
     - Emissão de NFC-e (integrado com M10)
     - Operações básicas de caixa (sangria, suprimento, fechamento)
   implementacao:
     - frontend: "Interface de PDV otimizada para rapidez."
     - backend: "APIs para suportar operações de PDV, integração com estoque e financeiro."
   metricas_conclusao:
     - "Fluxo de venda no PDV completo e testado."
     - "Emissão de NFC-e via PDV funcional."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M04-ESTOQUE_BASICO", "M06-FINANCEIRO_BASICO", "M10-FISCAL_BASICO"]
   ```

5. **M03-ORCAMENTACAO_INTELIGENTE** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Orçamentos mais precisos e com sugestões inteligentes, utilizando IA para otimizar a precificação."
   funcionalidades:
     - "IA para sugestão de preços (baseado em custos, margens configuradas em M0X, histórico de vendas, perfil do cliente - FASE 3). Versão inicial focada em custos e margens."
     - "Margens de lucro configuráveis por categoria de produto/cliente (configuração gerenciada em M0X-CONFIGURACOES_SISTEMA ou em tela própria vinculada)."
     - "Aplicação das sugestões de IA da tela '659 - Formação de preços - Cálculo de markup e margem de lucro' (Fontes [108, 126-157]), como análise de sensibilidade de preço ou sugestão de markup ideal com base em parâmetros."
   implementacao:
     - backend: "Modelo de IA (inicialmente pode ser baseado em regras e estatísticas, evoluindo para ML) para precificação. Lógica de cálculo de margens avançada, buscando configurações específicas. API para retornar preços sugeridos e permitir ajustes."
     - frontend: "Exibição clara das sugestões de preço da IA, com justificativas (ex: baseado no custo X, margem Y). Interface para configurar e aplicar diferentes cenários de margens e precificação."
   metricas_conclusao:
     - "IA sugere preços dentro de uma faixa aceitável e configurável."
     - "Cálculo de orçamento com margens avançadas e/ou preços sugeridos pela IA testado."
     - "Interface permite ao usuário entender e ajustar as sugestões de preço."
   dependencias_modulos: ["M03-ORCAMENTACAO_SIMPLES", "M02-ATENDIMENTO_AVANCADO", "M0X-CONFIGURACOES_SISTEMA"]
   servicos_ia_necessarios: ["Modelo de Regressão/Classificação ou Sistema Baseado em Regras (para precificação inicial)"]
   servicos_ia_sugeridos:
     - "Precificação Dinâmica baseada em demanda, concorrência (se dados disponíveis), e metas de lucro (Fontes [107-177]) - FASE 3"
     - "Teste A/B de Estratégias de Precificação (Fontes [107-177]) - FASE 3"
     - "Análise de Elasticidade de Preço por Produto/Cliente (Fontes [107-177]) - FASE 3"
   ```

6. **M04-ESTOQUE_AVANCADO** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Gestão de estoque com insights preditivos e funcionalidades avançadas de controle e entrada."
   funcionalidades:
     - "IA para previsão de demanda de insumos (versão beta inicial, usando modelos como ARIMA, Prophet sobre histórico de consumo)."
     - "Relatórios avançados de estoque (curva ABC, giro de estoque, cobertura de estoque)."
     - "OCR Inteligente para DANFE/Notas Físicas de compra (para extração de dados quando XML não disponível) (já previsto)."
     - "IA para conferência de NF de compra com pedido de compra interno (se PO existir), destacando divergências de quantidade, preço. (já previsto)"
     - "IA para validação e sugestão de CFOP por tipo de movimento (já previsto)."
     - "Gerenciamento avançado de etiquetas de revenda com: (Fonte: Etiquetas de revenda.pdf)"
         interface_etiquetas: "Tela dedicada 'Etiquetas de Revenda' com seleção de filtros: Produto (busca por código ou descrição), Lote específico, Fabricação e Vencimento (para produtos de prazo estendido ou com multiplas entradas do mesmo lote), Quantidade de etiquetas (múltiplas opções: quantidade específica, quantidade disponível no lote, quantidade definida pelo usuário)."
         layout_etiquetas: "Designer de modelos de etiquetas para produtos de revenda, permitindo configurar campos estáticos (nome farmácia, endereço, CNPJ) e dinâmicos (nome produto, lote, fabricação, vencimento, código barras, preço). Suporte a múltiplos tamanhos e formatos de papel/etiqueta. Opção para incluir ou omitir o código de barras."
         personalização_conteudo: "Configuração do texto a ser impresso com campos: Fabricante, Lote de fabricação, Data de fabricação, Data de vencimento, Código de barras (opções: Código de barras do produto, Código de barras do lote). Opções para incluir ou não o preço no formato de etiqueta."
         impressao_massa: "Capacidade de imprimir etiquetas para todos os produtos de revenda filtrados ou para lotes específicos. Interface para definir a quantidade de etiquetas por produto/lote (padrão: quantidade em estoque)."
         layouts_predefinidos: "Conjunto de layouts predefinidos para etiquetas padrão de mercado (ex: Pimaco, AVERY) e capacidade de criar layouts personalizados."
     - "Seleção inteligente de lotes para separação (FEFO/FIFO), considerando validade, especificidades do cliente/uso. (já previsto)"
     - "Análise preditiva de risco de ruptura de estoque, com alertas proativos baseados no tempo de reposição. (já previsto)"
     - "Dashboard de performance de fornecedores (prazo de entrega, qualidade dos insumos, preço médio). (já previsto)"
   implementacao:
     - backend: "APIs para relatórios avançados (curva ABC, giro, cobertura). Edge Functions/Functions para processamento de NF, validação de CFOP, previsão de demanda. Sistema de alertas para iminentes rupturas de estoque ou vencimentos. Serviços para geração de etiquetas em formato para impressão direta ou PDF."
     - frontend: "Dashboards interativos de métricas de estoque. Componentes para visualização de curva ABC e outras análises. Interface aprimorada para recebimento de mercadorias com OCR. Designer intuitivo de etiquetas com pré-visualização. Interface para configuração de dados a serem impressos nas etiquetas."
   metricas_conclusao:
     - "Dashboard de previsão de demanda operacional com precisão aceitável (MAPE < 30% para insumos de alto giro)."
     - "Relatórios avançados de estoque implementados e funcionais."
     - "OCR de DANFE com precisão > 85% para campos principais."
     - "Sistema de alerta de ruptura iminente funcionando e com baixa taxa de falsos positivos."
     - "Sistema de impressão de etiquetas de revenda funcional, suportando múltiplos formatos e imprimindo dados corretos."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M04-ESTOQUE_BASICO"]
   servicos_ia_sugeridos:
     - "Previsão de demanda: Modelos de ML (ARIMA, Prophet, etc.) para prever consumo futuro de insumos."
     - "OCR para DANFE/NF: ML para extração de campos de documentos fiscais físicos."
     - "Conferência automática NF x PO: ML para identificar divergências."
     - "Validação/Sugestão de CFOP: Sistema especialista para sugerir CFOP correto."
     - "Gerenciamento Inteligente de Etiquetas: IA para o design de etiquetas: análise do espaço disponível vs. quantidade de informação a ser impressa, sugerindo layouts otimizados. IA para determinar a quantidade ideal de etiquetas a serem impressas baseado em dados de vendas e validade. Sugestão inteligente de layout de etiqueta adequado para cada tipo de produto. (Fonte: Etiquetas de revenda.pdf)"
     - "Previsão de ruptura: ML para prever risco de ruptura combinando previsão de demanda e lead time."
     - "Análise de fornecedores: ML para classificação e scoring de fornecedores."
   ```

7. **M07-PRESCRITORES** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Gerenciamento de informações de prescritores."
   funcionalidades:
     - Cadastro completo de prescritores (contatos, especialidades, etc.)
     - Histórico de prescrições por prescritor
     - Agendamento e registro de visitas de representantes (básico)
   implementacao:
     - backend: "Extensão do M01 para incluir mais dados de prescritores e histórico."
     - frontend: "Interfaces para visualização e gerenciamento de prescritores."
   metricas_conclusao:
     - "Cadastro e consulta de prescritores funcionando."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M02-ATENDIMENTO_BASICO"]
   ```

8. **M09A-AUTOMACAO_BASICA** [PRIORIDADE: MÉDIA] # Renomeado de M09
   ```yaml
   descricao: "Primeiras automações para eficiência operacional."
   funcionalidades:
     - Configuração de n8n para notificações de status de pedido (WhatsApp/Email)
     - Alertas automáticos de estoque baixo (baseado em regras)
   implementacao:
     - infra: "Setup de instância n8n (auto-hospedada ou cloud)."
     - backend: "Webhooks no Supabase para disparar fluxos n8n."
     - n8n: "Criação dos workflows de notificação."
   metricas_conclusao:
     - "Notificações de pedido enviadas corretamente."
     - "Alertas de estoque disparados conforme regras."
   infra_adicional: ["n8n (hospedado ou na nuvem)"]
   dependencias_modulos: ["M02-ATENDIMENTO_BASICO", "M04-ESTOQUE_BASICO"]
   ```

9. **M08-POS_VENDA_BASICO** [PRIORIDADE: BAIXA]
   ```yaml
   descricao: "Início do acompanhamento de clientes pós-venda."
   funcionalidades:
     - Programação manual de atividades de pós-venda (contatos, acompanhamentos)
     - Registro de interações com o cliente
   implementacao:
     - backend: "Tabelas para registrar atividades e interações de pós-venda."
     - frontend: "Interface para agendar e registrar contatos."
   metricas_conclusao:
     - "Registro de atividades de pós-venda funcional."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M02-ATENDIMENTO_BASICO"]
   ```

10. **M17-CONTROLE_QUALIDADE_BASICO** [PRIORIDADE: MÉDIA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: MEDIA
    descricao: "Controle de qualidade básico para produtos manipulados, como peso médio."
    funcionalidades:
      - "Registro de controle de peso médio para receitas/produções internas (vinculado à ordem de manipulação/produção)."
      - "Entrada de dados da amostra: quantidade de unidades pesadas, pesos individuais."
      - "Cálculo automático de estatísticas: peso médio da amostra, desvio padrão, coeficiente de variação (DPR), menor/maior peso."
      - "Comparação com limites de referência (ex: Formulário Nacional) para peso teórico, variações permitidas, CV permitido, tamanho da amostra, rendimento mínimo."
      - "Registro de dados qualitativos da análise (aspecto, odor, etc.)."
      - "Indicação de status final: Aprovado/Reprovado/Erro."
      - "Histórico de controles de qualidade por produto/receita."
      - "Opção para \'Assinar peso médio\' (registro de responsabilidade)."
    implementacao:
      - backend: "Tabelas para armazenar dados de controle de qualidade, parâmetros de referência e resultados. APIs para CRUD e cálculos."
      - frontend: "Interface dedicada para registro do controle de peso médio, visualização de histórico e parâmetros de referência."
    metricas_conclusao:
      - "Fluxo de registro de peso médio funcional."
      - "Cálculos estatísticos validados."
      - "Comparação com limites de referência funcionando."
    dependencias_modulos: ["M05-MANIPULACAO_BASICA", "M18-PRODUCAO_INTERNA_BASICA"]
    servicos_ia_sugeridos:
      - "Integração com balanças analíticas (IoT)."
      - "ML para sugestão de tamanho de amostra."
      - "ML para detecção de padrões anômalos na pesagem."
      - "NLP para interpretação de observações qualitativas."
      - "IA para verificação automática com especificações de farmacopeias atualizadas."
    ```

11. **M18-PRODUCAO_INTERNA_BASICA** [PRIORIDADE: MÉDIA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: MEDIA
    descricao: "Gerenciamento de ordens de produção para itens não diretamente ligados a uma receita individual imediata (bases, tinturas, etc.)."
    funcionalidades:
      - "Definição de ordens de produção interna: tipo de produção, fórmula/ativo principal, quantidade a ser feita, lote a ser gerado."
      - "Especificação da lista de materiais (BoM): insumos, lotes de origem, quantidades."
      - "Controle de datas: fabricação, validade sugerida/calculada, vencimento final."
      - "Registro de estoque de origem (saída de insumos) e destino (entrada do produto acabado)."
      - "Geração de texto para rótulo (básico)."
      - "Registro de observações da produção."
      - "Funcionalidade de \'Registrar baixa\' de insumos e \'Registrar processo\'."
    implementacao:
      - backend: "Tabelas para ordens de produção interna, BoM, e vínculo com lotes de insumos e produto final. APIs para CRUD e lógica de movimentação de estoque."
      - frontend: "Interface para criação e acompanhamento de ordens de produção interna, listagem de insumos, e registro de etapas."
    metricas_conclusao:
      - "Fluxo de criação de ordem de produção interna funcional."
      - "Movimentação de estoque (saída de insumos, entrada de produto acabado) correta."
      - "Rastreabilidade básica dos lotes de insumos utilizados."
    dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M04-ESTOQUE_BASICO"]
    servicos_ia_sugeridos:
      - "ML para previsão de demanda de itens de produção interna."
      - "IA/ML para otimização do tamanho do lote de produção."
      - "IA para sugestão inteligente de fórmulas e BoM."
      - "IA para seleção de lote inteligente de insumos (FIFO/FEFO)."
      - "IA para cálculo automatizado de quantidades para dinamizações homeopáticas."
      - "IA para geração automática e verificação de rótulos."
    ```

12. **M19-LOGISTICA_SEPARACAO_DELIVERY** [PRIORIDADE: MÉDIA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: MEDIA
    descricao: "Gerenciamento do processo de separação (picking) de produtos para pedidos destinados à entrega."
    funcionalidades:
      - "Listagem de pedidos/movimentos pendentes de separação para delivery."
      - "Filtros por status de separação (Ex: Não separado, Separado) e tipo de movimento."
      - "Detalhamento dos produtos de um pedido selecionado para separação (item, código de barras, nome, quantidade, unidade, lote)."
      - "Funcionalidade de pesquisa/confirmação de item por código de barras."
      - "Registro de quantidade separada (Qtde. inf.)."
      - "Marcação de itens/pedidos como separados (checkbox \'Ok\')."
      - "Campo para observações gerais do processo de separação."
      - "Geração de \'picking list\' (lista de separação impressa - Fichas)."
    implementacao:
      - backend: "APIs para buscar pedidos pendentes de separação, atualizar status de separação de itens/pedidos."
      - frontend: "Interface com as duas grades (pedidos e itens do pedido), funcionalidade de leitura de código de barras, e impressão de picking list."
    metricas_conclusao:
      - "Fluxo de seleção de pedido e marcação de itens como separados funcional."
      - "Confirmação por código de barras (básica) operacional."
    dependencias_modulos: ["M02-ATENDIMENTO_BASICO", "M05-MANIPULACAO_BASICA"]
    servicos_ia_sugeridos:
      - "IA para validação avançada por código de barras (item, quantidade, lote FEFO/específico)."
      - "IA para otimização da rota de picking no estoque."
      - "IA para atribuição inteligente de tarefas de separação."
      - "IA para priorização inteligente de pedidos para separação."
      - "IA para detecção de potenciais faltas durante a separação."
    ```

13. **M20-SNGPC_CONTROLADOS** [PRIORIDADE: ALTA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: ALTA
    descricao: "Gerenciamento da escrituração eletrônica para o SNGPC (ANVISA) e RMNR."
    funcionalidades:
      - "Seleção de período para apuração e farmacêutico responsável."
      - "Visualização de lotes de produtos controlados movimentados no período (saldos inicial/final, DCB, lotes)."
      - "Detalhamento de todas as transações (venda, perda, transferência, aquisição) de um lote específico no período, incluindo dados de receita/notificação e prescritor."
      - "Visualização do histórico completo de movimentações de um lote."
      - "Listagem de todos os lotes movimentados para um produto específico."
      - "Geração da RMNR (Relação Mensal de Notificações de Receita) com filtros específicos."
      - "Geração do arquivo XML para envio ao SNGPC."
      - "Consulta de status de envio (Lista Aceita/Não Aceita)."
      - "Registro e acompanhamento de inventários de controlados."
      - "Configuração de produtos controlados: (Fonte: Cadastro de produtos.pdf)"
          produtos_controlados_config: "Seleção de Lista especial (fk para Listas de controle especial de M01-CADASTROS_ESSENCIAIS) e Portaria (fk para Portarias de M01-CADASTROS_ESSENCIAIS). Checkboxes para 'Não enviar SNGPC' (excluir do envio) e 'Produto monitorado (Polícia Civil)' para controles estaduais adicionais."
      - "Histórico de movimentações controladas por produto: (Fonte: Cadastro de produtos.pdf)"
          historico_movimentacoes: "Grade com detalhamento de todas as movimentações: Data movimento, Loja, Tipo de movimento (Entrada, Saída, Perda), Código movimento, Quantidade, Médico/Fornecedor, Código lista, Data envio ao SNGPC, CE (Controle Especial), Status (OK/Pendente/Erro)."
    implementacao:
      - backend: "Lógica complexa para consolidar todas as movimentações de controlados (entradas, saídas, perdas, ajustes de inventário). Geração do XML no formato exigido pela ANVISA. APIs para consulta e validação."
      - frontend: "Interfaces para as diversas abas de consulta, validação de dados, e geração do arquivo SNGPC/RMNR."
    metricas_conclusao:
      - "Geração de arquivo XML SNGPC em conformidade com o layout da ANVISA (validado com schema ou ambiente de teste da ANVISA, se disponível)."
      - "Consistência dos saldos e movimentações verificada."
      - "Geração de RMNR funcional."
    dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M04-ESTOQUE_BASICO", "M02-ATENDIMENTO_BASICO", "M05-MANIPULACAO_BASICA"]
    servicos_ia_sugeridos:
      - "IA para pré-validação inteligente de dados do SNGPC (consistência de saldos, validação de notificações, etc.)."
      - "ML para detecção de anomalias em movimentações de controlados."
      - "IA (NLP) para interpretar códigos de erro de rejeição do SNGPC e sugerir correções."
      - "IA (NLP) para extração de dados de receitas para preenchimento do RMNR."
      - "IA para geração automatizada de Livros Oficiais em formato para impressão."
      - "Assistente de Conformidade SNGPC/Siproquim: IA que valida dados, analisa possíveis problemas nas movimentações antes do envio, e sugere correções baseadas em regras regulatórias. (Fonte: Cadastro de produtos.pdf)"
    ```

14. **M21-RASTREABILIDADE_PROCESSOS** [PRIORIDADE: ALTA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: ALTA
    descricao: "Sistema completo para registro, monitoramento e rastreabilidade de todas as etapas do processo produtivo, garantindo conformidade com normas regulatórias e qualidade dos medicamentos manipulados."
    funcionalidades:
      - "Interface central para registro de etapas do processo produtivo das receitas/ordens de produção, com: (Fonte: Rastreabilidade de processos.pdf)"
          elementos_interface: "Dropdown para selecionar a Ação (ex: REGISTRAR, CONSULTAR) e o Tipo de Item (ex: RECEITA, ORDEM DE PRODUÇÃO). Campo para identificador da receita/pedido sendo rastreado (código de barras ou digitação). Dropdown configurável para selecionar a Etapa do Processo (ex: ENTRADA EM LABORATÓRIO, CONFERÊNCIA FARMACÊUTICO INICIAL, PESAGEM, MANIPULAÇÃO, ENVASE, CONFERÊNCIA FINAL, ENTREGUE AO CLIENTE)."
      - "Exibição de informações contextuais da receita/pedido durante o registro de etapas: Cliente, Médico, Forma Farmacêutica, Data/hora de entrega prometida, Status atual. (Fonte: Rastreabilidade de processos.pdf)"
      - "Grade para visualização do histórico completo de processos da receita/pedido, mostrando: Data, Hora, Nome do processo, Nome do funcionário responsável, PC/terminal, Status (OK/Pendente). (Fonte: Rastreabilidade de processos.pdf)"
      - "Consulta avançada de rastreabilidade por diversos parâmetros: período, tipo de forma farmacêutica, funcionário, etapa específica. (Fonte: Rastreabilidade de processos.pdf)"
      - "Dashboards operacionais mostrando quantidades e tempos médios em cada etapa, identificação de gargalos. (Fonte: Rastreabilidade de processos.pdf)"
      - "Registro de eventos críticos de qualidade e não-conformidades durante o processo. (Fonte: Rastreabilidade de processos.pdf)"
      - "Rastreabilidade completa de lotes de insumos utilizados em cada receita (via integração com M04-ESTOQUE_BASICO). (Fonte: Rastreabilidade de processos.pdf)"
      - "Relatórios regulatórios para inspeções e auditorias (conformidade com RDC 67 e outras normas). (Fonte: Rastreabilidade de processos.pdf)"
      - "IA: Sugestão proativa da próxima etapa do processo baseada no fluxo típico para a forma farmacêutica. (Fonte: Rastreabilidade de processos.pdf)"
      - "IA: Detecção de desvios de fluxo padrão e alertas de permanência excessiva em determinadas etapas. (Fonte: Rastreabilidade de processos.pdf)"
    implementacao:
      - backend: "Modelo de dados flexível para diferentes fluxos de processo (por tipo de receita/medicamento). APIs para registrar etapas, consultar histórico, e calcular métricas de tempo/produtividade. Integração com sistema de usuários para autenticação e registro de responsáveis. Fluxos de trabalho (workflows) configuráveis. Mecanismo de alertas para desvios de tempo ou procedimento."
      - frontend: "Interface intuitiva para registro de etapas do processo com código de barras ou seleção. Visualização clara do histórico de etapas da receita. Dashboards para análise de processos por setor e forma farmacêutica. Componentes ágeis para registro rápido em ambiente de produção."
    metricas_conclusao:
      - "Registro completo e confiável de 100% das etapas críticas do processo produtivo."
      - "Capacidade de recuperar a rastreabilidade completa de qualquer receita manipulada no sistema."
      - "Dashboards operacionais implementados com métricas de tempo e produtividade por etapa."
      - "Relatórios regulatórios em conformidade com normas da ANVISA."
      - "Sistema de alertas de atrasos funcionando corretamente."
    dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M02-ATENDIMENTO_BASICO", "M04-ESTOQUE_BASICO", "M05-MANIPULACAO_BASICA", "M18-PRODUCAO_INTERNA_BASICA"]
    servicos_ia_sugeridos:
      - "Registro Inteligente e Automatizado de Etapas: IA que sugere proativamente a próxima etapa do processo com base no histórico, forma farmacêutica e perfil do usuário. (Fonte: Rastreabilidade de processos.pdf)"
      - "Registro por Gatilhos Automáticos: Integração IoT para registro automático de etapas via balanças, impressoras, leitores de código de barras/QR em setores específicos. (Fonte: Rastreabilidade de processos.pdf)"
      - "Monitoramento e Alertas Inteligentes: Detecção de desvios do fluxo padrão, permanência anormal em etapas, previsão preditiva de atrasos na entrega. (Fonte: Rastreabilidade de processos.pdf)"
      - "Otimização de Processos e Fluxo de Trabalho: IA para análise de gargalos, sugestões de balanceamento de carga de trabalho entre manipuladores, simulação de cenários 'what-if' para mudanças no processo. (Fonte: Rastreabilidade de processos.pdf)"
      - "Interface de Consulta por Linguagem Natural: Capacidade de buscar status e histórico de processos usando perguntas em linguagem natural (ex: 'Quais receitas da Dra. Ana estão na etapa de pesagem desde ontem?'). (Fonte: Rastreabilidade de processos.pdf)"
      - "Rastreabilidade de Insumos Aprimorada: IA para validar e vincular automaticamente lotes de insumos às receitas durante a pesagem/manipulação. (Fonte: Rastreabilidade de processos.pdf)"
      - "Suporte à Conformidade Regulatória Inteligente: Geração automatizada de relatórios de auditoria conforme RDC 67, verificação proativa de conformidade com Boas Práticas de Manipulação Farmacêutica. (Fonte: Rastreabilidade de processos.pdf)"
      - "Filtragem e Ordenação Inteligente de Listas de Etapas: IA para destacar ou sugerir etapas mais relevantes baseadas no contexto e histórico. (Fonte: Rastreabilidade de processos.pdf)"
      - "Validação Automática de Sequência Lógica: Alerta quando etapas são registradas fora da sequência lógica esperada. (Fonte: Rastreabilidade de processos.pdf)"
      - "Aprendizado de Novos Fluxos: IA que aprende novos padrões de fluxo de trabalho a partir da observação de comportamentos não padronizados mas eficientes. (Fonte: Rastreabilidade de processos.pdf)"
      - "Integração com Documentação Técnica: Exibição automática de POPs (Procedimentos Operacionais Padrão) relevantes ao selecionar uma etapa. (Fonte: Rastreabilidade de processos.pdf)"
      - "Estimativa de Tempo para Conclusão: Previsão do tempo necessário para completar a etapa atual e as próximas, baseada em histórico e complexidade. (Fonte: Rastreabilidade de processos.pdf)"
    ```

15. **M22-PROMOCOES_MARKETING** [PRIORIDADE: MÉDIA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: MEDIA
    descricao: "Gerenciamento de campanhas promocionais, descontos e ações de marketing para produtos de revenda e manipulados."
    funcionalidades:
      - "Cadastro completo de campanhas promocionais com: (Fonte: Cadastro de promoções.pdf)"
          dados_campanha: "Código (auto-gerado ou manual), Nome da campanha, Intervalo de validade (data início/fim), Checkboxes para definir canais de aplicação: 'Usar no Sistema (PDV)' e 'Usar no e-Commerce'."
      - "Configuração de comissão específica para produtos em promoção: (Fonte: Cadastro de promoções.pdf)"
          comissao_promocional: "Índice de comissão (fk para tabela de índices ou configuração de comissões), Percentual de comissão durante a promoção (%), independente da comissão padrão do produto ou vendedor."
      - "Lista detalhada de produtos incluídos na promoção, com campos: (Fonte: Cadastro de promoções.pdf)"
          produtos_promocao: "Código do produto, Nome do produto, Valor de custo, Valor de venda normal (DL - preço de lista), Desconto (visualização em percentual e valor absoluto), Desconto atual (calculado), Valor de venda promocional, Limite de unidades na promoção, Quantidade já vendida na promoção, Estoque atual, Status (AT - ativo na promoção)."
      - "Ferramentas para gestão de produtos na promoção: (Fonte: Cadastro de promoções.pdf)"
          gestao_produtos: "Interface para adicionar produtos individualmente ou em lote (por categoria, marca, etc.). Funcionalidade para editar propriedades em lote (desconto padrão para múltiplos produtos). Opção para remover produtos da lista promocional."
      - "Campo para observações gerais sobre a campanha, permitindo registrar estratégias, metas, público-alvo. (Fonte: Cadastro de promoções.pdf)"
      - "Ações para gestão de promoções: Gravar/Salvar campanha, Excluir, Limpar formulário, Consultar lista de promoções (históricas e ativas). (Fonte: Cadastro de promoções.pdf)"
      - "Geração de relatórios de desempenho de promoções: vendas, impacto no ticket médio, lucratividade. (Fonte: Cadastro de promoções.pdf)"
      - "Integração com PDV (M11) para aplicação automática de preços promocionais. (Fonte: Cadastro de promoções.pdf)"
      - "Integração com futuro módulo de e-commerce para sincronização de promoções online. (Fonte: Cadastro de promoções.pdf)"
    implementacao:
      - backend: "Modelo de dados para campanhas promocionais e produtos associados. Lógica para cálculo de preços promocionais e validação de regras (período, limites, etc.). APIs para CRUD de promoções, inclusão/exclusão de produtos em lote. Integração com sistema de preços e PDV."
      - frontend: "Interface intuitiva para criação e manutenção de campanhas. Componente de busca e seleção de produtos otimizado para grandes catálogos. Grid interativo para visualização e edição de produtos em promoção. Visualização clara de métricas de impacto da promoção (ex: desconto total, estimativa de impacto na margem)."
    metricas_conclusao:
      - "Fluxo completo de criação, edição e exclusão de promoções testado e validado."
      - "Aplicação correta de preços promocionais no PDV e futuro e-commerce."
      - "Cálculos de desconto e preço promocional precisos e corretamente refletidos nas vendas."
      - "Relatórios de desempenho de promoções funcionais e fornecendo dados úteis para tomada de decisão."
    dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M04-ESTOQUE_BASICO", "M03-ORCAMENTACAO_SIMPLES", "M11-PDV_BASICO"]
    servicos_ia_sugeridos:
      - "Seleção Inteligente de Produtos para Promoção: IA que recomenda automaticamente produtos ideais para promover, baseada em análise de vendas, margens, níveis de estoque, proximidade de vencimento e afinidade entre produtos ('comprados juntos'). (Fonte: Cadastro de promoções.pdf)"
      - "Otimização de Descontos e Preços Promocionais: ML que sugere o percentual de desconto ideal para cada produto considerando elasticidade de preço, custo, margens mínimas e níveis de estoque. (Fonte: Cadastro de promoções.pdf)"
      - "Previsão de Impacto da Promoção: Modelo preditivo que estima o volume de vendas, receita, lucro e potencial canibalização de outros produtos durante a promoção. (Fonte: Cadastro de promoções.pdf)"
      - "Definição Automática do Intervalo Ideal da Promoção: Análise de dados históricos para sugerir o período ótimo (dias da semana, duração) baseado em sazonalidade e eventos relevantes (ex: datas comemorativas). (Fonte: Cadastro de promoções.pdf)"
      - "Segmentação e Personalização de Promoções: IA que sugere grupos de clientes-alvo para promoções específicas, baseada em perfil de compra (requer integração com CRM futuro). (Fonte: Cadastro de promoções.pdf)"
      - "Monitoramento e Ajuste Dinâmico de Promoções: Sistema inteligente que monitora o desempenho em tempo real e sugere ajustes (estender, aumentar desconto, incluir novos produtos) durante a campanha. (Fonte: Cadastro de promoções.pdf)"
      - "Análise de Sentimento e Feedback sobre Promoções: Processamento de comentários de clientes (redes sociais, atendimento) para avaliar a percepção das promoções (NLP). (Fonte: Cadastro de promoções.pdf)"
      - "Sugestão de Texto Promocional: IA generativa para criar descrições atrativas para a campanha, rótulos promocionais e mensagens de marketing. (Fonte: Cadastro de promoções.pdf)"
    ```

16. **M18-FORMULAS_PRODUCAO_INTERNA** [PRIORIDADE: MÉDIA]
    ```yaml
    codigo_fase: FASE_2_EXPANSAO
    prioridade: MEDIA
    descricao: "Gerenciamento de fórmulas padronizadas e ordens de produção para itens não diretamente ligados a uma receita individual imediata (bases, tinturas-mãe, etc.)."
    funcionalidades:
      - "Cadastro detalhado da 'ficha técnica' da fórmula: (Fonte: Produção interna.pdf)"
          informacoes_gerais: "Tipo de Produção (dropdown: Fórmula Alopática, Homeopática, Base Galênica, etc.), Código da Fórmula (auto-gerado ou manual), Nome/Descrição da Fórmula."
      - "Controles comerciais e parâmetros de produção: (Fonte: Produção interna.pdf)"
          controles_comerciais: "Checkbox 'Pagar comissão', Flag 'Concluído' (indica cadastro completo da fórmula), Tipo de fórmula base para cálculo (dropdown: 'para 100g', 'para 100mL', '% Peso'), Índice de cálculo (fator de correção), Quantidade mínima para produção."
      - "Parâmetros farmacotécnicos: (Fonte: Produção interna.pdf)"
          parametros_farmacotecnicos: "Laboratório de produção (fk para cadastro de Laboratórios), Forma farmacêutica (fk para Formas Farmacêuticas de M01), Tipo de medicamento (dropdown: Homeopático, Fitoterápico, etc.), Fator de conversão Gotas/mL."
      - "Configurações de comportamento da fórmula no sistema: (Fonte: Produção interna.pdf)"
          configuracoes_sistema: "Checkbox 'Inclusão manual da fórmula p/ alteração no atendimento' (permite modificar componentes/quantidades no pedido). Dropdown 'Tipo de uso' (opções: 'Não utilizar no atendimento', 'Usar somente p/ cálculo do preço', 'Incluir itens p/ pesagem (mostrar/ocultar)', 'Incluir itens p/ conferência', 'Usar somente p/ rótulo', 'Substituir item digitado pela fórmula'). Dropdown 'Formar preço de venda' (regra para cálculo do preço: soma de custos + margem, preço fixo, etc.). Dropdown 'Formar texto do rótulo' (origem do texto: Ficha do produto, campo 'Texto do rótulo' da fórmula, gerado pelo cálculo dos componentes). Checkbox 'Checar itens da fórmula p/ incluir conservantes, diluentes ou essências'."
      - "Lista detalhada de produtos (componentes da fórmula): (Fonte: Produção interna.pdf)"
          lista_componentes: "Grade com colunas: Posição (ordem), Tipo de componente (TP: Princípio Ativo, Excipiente, Veículo, etc.), Código do Insumo (fk para Insumos de M01), Nome do Insumo, Quantidade, Unidade (fk para Unidades de Medida de M01), Fase de adição no processo."
      - "Abas dedicadas para informações complementares: (Fonte: Produção interna.pdf)"
          aba_modo_fazer: "Campo de texto extenso para Procedimento Operacional Padrão (POP) da manipulação, descrevendo o passo-a-passo técnico."
          aba_texto_rotulo: "Campo para texto customizado do rótulo do produto final."
          aba_posologia: "Campo para indicação de uso e dosagem padrão da fórmula."
      - "Definição de ordens de produção interna a partir da fórmula cadastrada: (já previsto)"
          ordem_producao: "Tipo de produção, fórmula/ativo principal (referência à fórmula cadastrada), quantidade a ser feita, lote a ser gerado."
      - "Especificação da lista de materiais (BoM) para uma ordem específica: (já previsto)"
          bom_ordem: "Insumos, lotes de origem, quantidades."
      - "Controle de datas de produção: (já previsto)"
          datas_producao: "Fabricação, validade sugerida/calculada, vencimento final."
      - "Registro de estoque (saída de insumos e entrada do produto acabado): (já previsto)"
          estoque_movimento: "Estoque de origem (saída de insumos) e destino (entrada do produto acabado)."
      - "Geração de texto para rótulo (a partir da configuração da fórmula). (já previsto)"
      - "Registro de observações da produção. (já previsto)"
      - "Funcionalidade de 'Registrar baixa' de insumos e 'Registrar processo'. (já previsto)"
    implementacao:
      - backend: "Modelo de dados para fórmulas e seus componentes, com relações flexíveis. Tabelas para ordens de produção interna, BoM, e vínculo com lotes de insumos e produto final. APIs para CRUD e lógica de movimentação de estoque. Regras de negócio para cálculo de quantidades, validações farmacotécnicas, e geração de texto para rótulo."
      - frontend: "Interface completa para cadastro de fórmulas, com abas organizadas. Componente especializado para gestão da lista de componentes com cálculos dinâmicos. Interface para criação e acompanhamento de ordens de produção interna. Visualização da rastreabilidade de lotes."
    metricas_conclusao:
      - "Cadastro completo de fórmulas com todos os campos e configurações funcionais."
      - "Fluxo de criação de ordem de produção interna a partir de fórmula cadastrada testado."
      - "Movimentação de estoque (saída de insumos, entrada de produto acabado) correta."
      - "Geração de rótulos conforme configuração da fórmula."
      - "Rastreabilidade de lotes de insumos utilizados funcionando corretamente."
    dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS", "M04-ESTOQUE_BASICO"]
    servicos_ia_sugeridos:
      - "IA para Assistência na Criação/Adaptação de Fórmulas: Mapear itens de receita (OCR/NLU) para fórmulas/componentes existentes, sugerir fórmulas base, concentrações usuais, veículos/bases compatíveis. (Fonte: Produção interna.pdf)"
      - "Geração Inteligente de 'Modo de Fazer' (NLG): IA que gera ou complementa o procedimento operacional com base nos componentes, forma farmacêutica e método (ex: dinamização homeopática). (Fonte: Produção interna.pdf)"
      - "Sugestão e Verificação de Excipientes com IA: Sistema que sugere veículos, conservantes, diluentes adequados; alerta sobre incompatibilidades físico-químicas entre componentes. (Fonte: Produção interna.pdf)"
      - "Otimização de Custos da Fórmula com IA: Análise que sugere insumos equivalentes mais baratos ou otimiza quantidades mantendo eficácia. (Fonte: Produção interna.pdf)"
      - "Geração Inteligente de 'Texto do Rótulo' e 'Posologia' (NLG): IA que estrutura textos incluindo informações obrigatórias, advertências, instruções específicas (homeopatia). (Fonte: Produção interna.pdf)"
      - "Validação de Dosagens e Concentrações com IA: Comparação automática com faixas terapêuticas, verificação de consistência de dinamizações homeopáticas, alertas de segurança. (Fonte: Produção interna.pdf)"
      - "Designação Automática Inteligente de Laboratório: Sugestão do laboratório ideal com base nas características da fórmula e disponibilidade. (Fonte: Produção interna.pdf)"
      - "Sugestão Inteligente de 'Tipo de uso' da fórmula: IA que recomenda a configuração ideal com base nas características e padrões de uso de fórmulas similares. (Fonte: Produção interna.pdf)"
      - "Validação de Conformidade de Rótulos: IA que verifica se o texto gerado cumpre todas as exigências regulatórias para cada tipo de produto. (Fonte: Produção interna.pdf)"
      - "ML para previsão de demanda de itens de produção interna."
      - "IA/ML para otimização do tamanho do lote de produção."
      - "IA para seleção de lote inteligente de insumos (FIFO/FEFO)."
    ```

### FASE 3: Inteligência Artificial Plena e Módulos Complementares
```yaml
codigo_fase: FASE_3_IA_PLENA
duracao_estimada: "9-12 meses após Fase 2"
objetivo: "Implementar IA avançada em todos os módulos principais, adicionar módulos de valor agregado e consolidar o sistema como uma solução inteligente."
dependencias_externas: ["FASE_2_EXPANSAO concluída"]
status_atual: "Não iniciado"
```

#### Módulos da Fase 3 (Ordem Sugerida por Prioridade e Dependência):
1. **M02-ATENDIMENTO_IA_COMPLETO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Capacidades máximas de IA no atendimento."
   funcionalidades:
     - IA para interpretação de receitas em áudio/vídeo
     - Chatbot com NLU avançado para triagem e FAQs
   implementacao:
     - backend: "Integração com serviços de Speech-to-Text, desenvolvimento/integração de plataforma de chatbot."
     - frontend: "Interface de chat no portal do cliente, integração do chatbot."
   metricas_conclusao:
     - "Chatbot resolve > 50% das FAQs comuns."
     - "Extração de dados de áudio com acurácia > 80%."
   dependencias_modulos: ["M02-ATENDIMENTO_AVANCADO"]
   servicos_ia_necessarios: ["Speech-to-Text (Google/AWS)", "Plataforma de Chatbot (Rasa, Dialogflow, ou LLM com RAG)"]
   ```

2. **M06-FINANCEIRO_PREDITIVO** [PRIORIDADE: ALTA]
   ```yaml
   descricao: "Financeiro com análises e previsões avançadas."
   funcionalidades:
     - IA para previsão de fluxo de caixa
     - IA para detecção de anomalias financeiras (fraudes, erros)
   implementacao:
     - backend: "Modelos de ML para previsão e detecção de anomalias."
     - frontend: "Dashboards com previsões e alertas de anomalias."
   metricas_conclusao:
     - "Previsão de fluxo de caixa com erro < 20%."
     - "Detecção de anomalias com baixa taxa de falsos positivos."
   dependencias_modulos: ["M06-FINANCEIRO_AVANCADO"]
   servicos_ia_necessarios: ["Modelos de Séries Temporais", "Modelos de Detecção de Anomalias (Isolation Forest)"]
   ```

3. **M04-ESTOQUE_OTIMIZADO** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Otimização completa da gestão de estoque."
   funcionalidades:
     - IA para otimização de compras (sugestão de quantidades e fornecedores)
   implementacao:
     - backend: "Algoritmos de otimização considerando custos, lead time, previsão."
     - frontend: "Interface para visualizar sugestões de compra."
   metricas_conclusao:
     - "Redução simulada de custos de estoque em > 5%."
   dependencias_modulos: ["M04-ESTOQUE_AVANCADO"]
   servicos_ia_necessarios: ["Algoritmos de Otimização"]
   ```

4. **M05-MANIPULACAO_INTELIGENTE** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Laboratório com prazos e alertas inteligentes."
   funcionalidades:
     - IA para estimativa inteligente de prazos de manipulação e entrega
     - IA para alerta proativo sobre potenciais atrasos na produção
   implementacao:
     - backend: "Modelos de regressão para estimativa de prazos."
     - frontend: "Exibição de prazos estimados e alertas."
   metricas_conclusao:
     - "Estimativa de prazos com acurácia de +/- 1 hora para 80% dos casos."
   dependencias_modulos: ["M05-MANIPULACAO_BASICA"]
   servicos_ia_necessarios: ["Modelos de Regressão"]
   ```

5. **M08-POS_VENDA_INTELIGENTE** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "CRM proativo e inteligente."
   funcionalidades:
     - IA para programação inteligente de pós-venda (sugestões automáticas)
     - IA para priorização inteligente de contatos de pós-venda
     - IA para Análise de Sentimento do feedback (NLP)
   implementacao:
     - backend: "Modelos de IA para sugestão e priorização, integração NLP."
     - frontend: "Dashboards de pós-venda com insights da IA."
   metricas_conclusao:
     - "Aumento da taxa de contato efetivo no pós-venda."
     - "Análise de sentimento identificando temas chave."
   dependencias_modulos: ["M08-POS_VENDA_BASICO"]
   servicos_ia_necessarios: ["Modelos de Recomendação/Classificação", "NLP para Análise de Sentimento"]
   ```

6. **M16-BI_RELATORIOS** [PRIORIDADE: MÉDIA]
   ```yaml
   descricao: "Business Intelligence e relatórios avançados."
   funcionalidades:
     - "Interface central unificada para acesso a relatórios e consultas dinâmicas com duas abordagens principais: (1) Modo 'Consulta' para exploração dinâmica de dados e (2) Modo 'Relatório' para formatos pré-definidos de saída. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Categorização e agrupamento de relatórios/consultas por área funcional (ex: Financeiro, Estoque, Vendas, Manipulação). (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Busca e filtragem de relatórios por nome, palavra-chave, código ou categoria. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Listagem de relatórios disponíveis com informações detalhadas: Código, Descrição, Propriedades (ex: 'Permite Impressão', 'Permite Exportação'), Última execução, Favorito. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Interface para construção dinâmica de filtros para relatórios/consultas, com: (Fonte: Consultas - Relatorios do sistema.pdf)"
         filtros_dinamicos: "Campo (dropdown de colunas disponíveis), Condição (Igual, Maior que, Entre, etc.), Valor(es), Operadores lógicos (E/OU) para múltiplos filtros. Controles para adicionar, remover, limpar e ordenar filtros."
     - "Opção para imprimir/incluir os critérios de filtro no próprio relatório gerado. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Funcionalidade 'Configurar relatório' para customização avançada de layout, cabeçalhos, rodapés, campos exibidos, ordenação e agrupamentos. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Exportação para diversos formatos (PDF, Excel, CSV, HTML). (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Agendamento de geração e envio automático de relatórios por e-mail. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - Dashboard inicial com KPIs chave (Vendas, Pedidos, Estoque, Financeiro)
     - "IA: Geração de insights e sugestões a partir da análise de dados cruzados"
     - "IA: Capacidade de realizar perguntas em linguagem natural sobre os dados (ex: 'Quais medicamentos foram mais vendidos para insônia no último trimestre?'). (Fonte: Consultas - Relatorios do sistema.pdf)"
   implementacao:
     - backend: "APIs para agregação de dados, metadados de relatórios (definições, esquemas, filtros disponíveis), histórico de execuções. API dedicada para processamento de linguagem natural (NLP) para consultas em linguagem natural. Otimização de consultas SQL complexas. Integração opcional com ferramentas de BI externas se necessário."
     - frontend: "Interface modular para construção de consultas e visualização de relatórios. Componentes reutilizáveis para filtros, seleção de campos e visualização. Integração com bibliotecas de gráficos interativos (ex: Recharts, D3.js). Experiência intuitiva para construção de consultas adaptada a diferentes níveis de usuário."
   metricas_conclusao:
     - "Principais KPIs disponíveis no dashboard."
     - "100+ relatórios pré-definidos implementados cobrindo todas as áreas funcionais."
     - "Sistema de construção dinâmica de relatórios/consultas funcional e validado com usuários."
     - "Exportação para todos os formatos funcionando corretamente."
     - "Consultas em linguagem natural com taxa de interpretação correta > 70%."
   dependencias_modulos: ["Todos os módulos principais implementados"]
   servicos_ia_necessarios: ["NLP para consultas em linguagem natural", "Modelo para detecção de anomalias e insights"]
   servicos_ia_sugeridos:
     - "Consultas em Linguagem Natural (NLQ): Interpretação de perguntas em linguagem natural para gerar relatórios/consultas (ex: 'medicamentos mais vendidos para insônia no último trimestre'). (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Desambiguação e sugestões interativas para NLQ: IA que ajuda a refinar a consulta do usuário quando ambígua ou incompleta. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Descoberta Proativa de Insights e Anomalias: Geração automática de relatórios destacando tendências, anomalias (ex: queda de vendas, tempo de manipulação atípico), correlações inesperadas. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Alertas Inteligentes baseados em IA sobre eventos críticos ou oportunidades, configuráveis e personalizáveis. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Relatórios Preditivos e Prescritivos: Previsão de demanda para formulações, otimização de compras com base em validade/custos, análise de churn de clientes, sugestões de campanhas de marketing direcionadas. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Personalização e Recomendações de Relatórios: Dashboards dinâmicos personalizados por perfil de usuário, sugestão de relatórios relevantes com base no uso e comportamento. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Visualização de Dados Inteligente: Seleção automática do melhor tipo de gráfico para diferentes conjuntos de dados, geração de narrativas curtas (storytelling com dados) para explicar relatórios complexos. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Otimização da Interface de Filtros com IA: Sugestões de filtros comumente usados por outros usuários ou relevantes para o contexto, preenchimento semântico automático de valores de filtro. (Fonte: Consultas - Relatorios do sistema.pdf)"
     - "Auditoria e Conformidade Assistida por IA: Relatórios de conformidade LGPD automáticos, detecção de padrões suspeitos em dados financeiros/estoque para prevenção de fraudes e erros. (Fonte: Consultas - Relatorios do sistema.pdf)"
   nota_especial: "Embora o módulo completo de BI esteja previsto para a Fase 3, relatórios operacionais básicos para cada módulo devem ser implementados de forma incremental durante as Fases 1 e 2, conforme esses módulos são desenvolvidos. O M16 completo foca na plataforma unificada, consultas avançadas e IA."
   ```

7. **M07-PRESCRITORES_AVANCADO** [PRIORIDADE: BAIXA]
   ```yaml
   descricao: "Relacionamento estratégico com prescritores."
   funcionalidades:
     - IA para perfilamento inteligente de prescritores (padrões, preferências)
     - IA para sugestão de conteúdo e abordagem para representantes
   implementacao:
     - backend: "Modelos de clustering e mineração de padrões."
     - frontend: "Dashboards de análise de prescritores."
   metricas_conclusao:
     - "Perfis de prescritores gerados e validados."
   dependencias_modulos: ["M07-PRESCRITORES"]
   servicos_ia_necessarios: ["Modelos de Clustering", "Mineração de Padrões"]
   ```

8. **Módulos Complementares (M12, M13, M14, M15)** [PRIORIDADE: BAIXA]
   ```yaml
   descricao: "Implementação dos módulos de RH (simplificado), Convênios, Fidelidade, Gestão de Processos/Tarefas."
   funcionalidades:
     - M12-RH_BASICO: Cadastro avançado de funcionários, Cargos e Salários.
     - M13-CONVENIOS: Cadastro de Convênios/Planos, Regras de cobertura.
     - M14-FIDELIDADE: Programa de pontos/cashback, Níveis de cliente.
     - M15-PROCESSOS_INTERNOS: Criação/atribuição de tarefas, IA para sugestão de tarefas.
   implementacao:
     - backend: "Desenvolvimento das APIs e lógicas específicas de cada módulo."
     - frontend: "Interfaces para cada um dos módulos."
   metricas_conclusao:
     - "Funcionalidades básicas de cada módulo implementadas e testadas."
   dependencias_modulos: ["M01-CADASTROS_ESSENCIAIS"]
   ```

## 4. CRITÉRIOS DE ACEITAÇÃO E TESTES

### Para cada módulo e funcionalidade:
```yaml
tipos_teste_requeridos:
  - unitario: "Cobertura de lógica crítica de backend e componentes frontend."
  - integracao_apis: "Validação da comunicação entre frontend, backend (monólito/microsserviços) e serviços externos (IA, n8n)."
  - e2e_fluxos_usuario: "Simulação de jornadas completas do usuário no sistema."
  - usabilidade_ux: "Testes com farmacêuticos e atendentes para garantir intuitividade e eficiência."
  - performance_carga: "Testes de estresse para APIs e páginas críticas sob carga esperada."
  - seguranca_vulnerabilidades: "Testes de penetração básicos, revisão de RLS e permissões."

metricas_qualidade_alvo:
  - cobertura_codigo_testes_unitarios: ">= 80% para código crítico de backend e frontend."
  - tempo_resposta_api_p95: "< 300ms para 95% das requisições em APIs críticas."
  - tempo_carregamento_pagina_lcp: "< 2.5s para Largest Contentful Paint em páginas chave."
  - disponibilidade_sistema_producao: ">= 99.9% (uptime mensal)."
  - taxa_erro_producao: "< 0.1% de requisições resultando em erro 5xx."
  - precisao_modelos_ia: # (Valores específicos por modelo, exemplos)
      - ocr_receitas_campos_chave: ">= 90% de acurácia na extração."
      - classificacao_financeira_automatica: ">= 85% de acurácia."
      - previsao_demanda_insumos_mape: "< 15% (Mean Absolute Percentage Error)."
  - satisfacao_usuario_nps: "A ser definido após lançamento (alvo > 40)."
```

## 5. FLUXO DE DESENVOLVIMENTO (WORKFLOW ÁGIL)

```yaml
workflow_geral:
  - etapa: "1. Backlog Refinement & Sprint Planning"
    descricao: "Priorização de User Stories, quebra em tarefas técnicas, estimativas e definição da meta da Sprint."
    responsaveis: ["Product Owner (PO)", "Tech Lead (TL)", "Time de Desenvolvimento"]
    artefatos_saida: ["Sprint Backlog", "Meta da Sprint clara"]
  
  - etapa: "2. Desenvolvimento (Iterações Diárias)"
    descricao: "Implementação das tarefas da Sprint, seguindo padrões de código e arquitetura."
    responsaveis: ["Desenvolvedores Frontend", "Desenvolvedores Backend", "Especialistas IA/ML"]
    praticas_chave:
      - "Desenvolvimento Orientado a Testes (TDD) para lógica complexa."
      - "Pull Requests (PRs) com Code Review obrigatório (mínimo 1 revisor)."
      - "Documentação técnica concisa junto ao código (docstrings, comentários)."
      - "Daily Stand-ups para sincronização e identificação de bloqueios."
    
  - etapa: "3. Testes Contínuos"
    descricao: "Execução de testes unitários, de integração e E2E automatizados. Testes manuais exploratórios."
    responsaveis: ["QA (Quality Assurance)", "Desenvolvedores (para testes unitários e de integração)"]
    ferramentas_sugeridas: ["Jest/Vitest (Frontend)", "Pytest (Backend Python)", "Playwright/Cypress (E2E)"]
    
  - etapa: "4. Sprint Review & Retrospective"
    descricao: "Demonstração do incremento funcional ao PO e stakeholders. Reflexão do time sobre o processo da Sprint para melhoria contínua."
    responsaveis: ["Time de Desenvolvimento Completo", "PO", "TL"]
    
  - etapa: "5. Deploy & Monitoramento"
    descricao: "Publicação das novas funcionalidades em ambientes (Dev, Homologação, Produção) e acompanhamento da performance e estabilidade."
    ambientes_deploy:
      - desenvolvimento: "Atualização contínua via CI/CD após merge na branch principal de desenvolvimento."
      - homologacao: "Deploy ao final de cada Sprint para validação pelo PO/Stakeholders."
      - producao: "Deploy após validação em homologação, com planejamento (janelas, rollback)."
    monitoramento_producao: ["Logs centralizados (ex: Sentry, ELK Stack)", "Métricas de performance de APM (ex: New Relic, Datadog)", "Alertas automáticos para erros críticos e degradação de performance."]
```

## 6. ENTREGÁVEIS POR MILESTONE

```yaml
milestone_1_mvp:
  nome: "MVP Funcional & Operacional"
  prazo_estimado: "6 meses após início do desenvolvimento efetivo"
  escopo_modulos_chave: ["M01-CADASTROS_ESSENCIAIS", "M02-ATENDIMENTO_BASICO", "M03-ORCAMENTACAO_SIMPLES", "M04-ESTOQUE_BASICO", "M06-FINANCEIRO_BASICO", "M09-USUARIOS_PERMISSOES"]
  criterios_conclusao_gerais:
    - "Sistema permite o fluxo completo: Cliente envia receita (manual) -> Orçamento -> Pedido -> Lançamento Financeiro."
    - "Todos os cadastros essenciais estão 100% funcionais (CRUD)."
    - "Sistema deployado em ambiente de homologação, pronto para testes por um usuário piloto."
    - "Documentação de usuário básica para as funcionalidades do MVP."

milestone_2_expansao_ia_inicial:
  nome: "Sistema Expandido com IA Inicial e Módulos Operacionais"
  prazo_estimado: "9 meses após milestone_1_mvp"
  escopo_modulos_chave: ["M02-ATENDIMENTO_AVANCADO (OCR)", "M10-FISCAL_BASICO (NF-e)", "M06-FINANCEIRO_AVANCADO (Conciliação, Classificação IA)", "M07-PRESCRITORES (Cadastro)", "M11-PDV_BASICO"]
  criterios_conclusao_gerais:
    - "OCR de receitas (imagem/PDF) funcional e integrado ao fluxo de pedido."
    - "Emissão de NF-e/NFC-e para vendas implementada e testada em ambiente de homologação SEFAZ."
    - "PDV básico operacional para vendas de balcão."
    - "Primeiros modelos de IA (classificação financeira) em produção."

milestone_3_ia_plena_consolidacao:
  nome: "Sistema Completo com IA Avançada e Cobertura Funcional Ampla"
  prazo_estimado: "12 meses após milestone_2_expansao_ia_inicial"
  escopo_modulos_chave: ["M02-ATENDIMENTO_IA_COMPLETO (Chatbot, Áudio/Vídeo)", "M04-ESTOQUE_OTIMIZADO (Otimização Compras)", "M06-FINANCEIRO_PREDITIVO (Previsão Caixa, Anomalias)", "M08-POS_VENDA_INTELIGENTE (Análise Sentimento)", "M16-BI_RELATORIOS", "Módulos Complementares (M12, M13, M14, M15)"]
  criterios_conclusao_gerais:
    - "Chatbot para atendimento ao cliente implementado e funcional."
    - "Modelos preditivos de IA (estoque, financeiro) refinados e em produção."
    - "Dashboard de BI com insights acionáveis gerados por IA."
    - "Cobertura funcional abrangente para a maioria das operações da farmácia."
```

## 7. DEPENDÊNCIAS DE SERVIÇOS EXTERNOS (Estimativas)

```yaml
servicos_externos_necessarios:
  - nome: "OCR (Reconhecimento Óptico de Caracteres)"
    opcoes_provedores:
      - provedor: "Google Cloud Vision AI"
        estimativa_custo_mensal: "Variável (pay-per-use), ex: ~$1.50 por 1000 imagens. Iniciar com ~$20-50/mês."
      - provedor: "AWS Textract"
        estimativa_custo_mensal: "Similar ao Google Vision AI."
    fase_necessidade: "FASE_2_EXPANSAO"
  
  - nome: "NLP/LLM (Processamento de Linguagem Natural e Modelos de Linguagem Grandes)"
    opcoes_provedores:
      - provedor: "OpenAI API (GPT-4, GPT-3.5-turbo)"
        estimativa_custo_mensal: "Variável (pay-per-token), ex: ~$0.0005-$0.06 por 1K tokens. Iniciar com ~$50-100/mês."
      - provedor: "Google Gemini API"
        estimativa_custo_mensal: "Similar ao OpenAI, pode variar."
    fase_necessidade: "FASE_2_EXPANSAO (NLU básico), FASE_3_IA_PLENA (LLMs avançados, Chatbot)"

  - nome: "Speech-to-Text"
    opcoes_provedores:
      - provedor: "Google Cloud Speech-to-Text"
      - provedor: "AWS Transcribe"
    estimativa_custo_mensal: "Variável (pay-per-minute). Iniciar com ~$10-30/mês."
    fase_necessidade: "FASE_3_IA_PLENA"
  
  - nome: "Plataforma de Nuvem para BaaS (Supabase)"
    provedor: "Supabase"
    estimativa_custo_mensal: "Plano Pro: $25/mês (inicial) até $499+/mês conforme uso de banco, storage, functions."
    fase_necessidade: "FASE_1_MVP (contínuo)"

  - nome: "Hospedagem para Microsserviços de IA e n8n (se auto-hospedado)"
    opcoes_provedores:
      - provedor: "AWS (EC2, Lambda, SageMaker)"
      - provedor: "Google Cloud (Cloud Run, GKE, Vertex AI)"
      - provedor: "Azure (Functions, Azure ML)"
    estimativa_custo_mensal: "Variável, estimado $50-200/mês inicialmente para microsserviços básicos."
    fase_necessidade: "FASE_2_EXPANSAO (n8n, microsserviços IA iniciais), FASE_3_IA_PLENA (expansão)"

  - nome: "API WhatsApp Business"
    opcoes_provedores:
      - provedor: "Meta (direto ou via parceiros como Twilio, Gupshup)"
    estimativa_custo_mensal: "Variável (taxas por conversa/mensagem). Iniciar com ~$20-50/mês."
    fase_necessidade: "FASE_2_EXPANSAO (notificações), FASE_3_IA_PLENA (chatbot)"
```

## 8. NOTAS FINAIS E DIRECIONAMENTO ESTRATÉGICO

O desenvolvimento já iniciado no frontend para os cadastros (M01-CADASTROS_ESSENCIAIS) é um excelente ponto de partida. Esta proposta estruturada visa fornecer o direcionamento estratégico claro para as próximas etapas, garantindo que os fundamentos sejam sólidos para a construção de um sistema completo, inteligente e comercializável.

A chave para o sucesso será a execução disciplinada de cada fase, com foco na entrega de valor incremental, validação contínua com usuários-alvo (farmácias de manipulação) e a adaptação ágil baseada em feedbacks e aprendizados. A integração progressiva e cuidadosa das funcionalidades de IA será o grande diferencial competitivo do Homeo.AI.

**Próxima Ação Imediata:** Focar na conclusão e testes rigorosos do **M01-CADASTROS_ESSENCIAIS** e **M09-USUARIOS_PERMISSOES** para estabelecer a base do MVP.