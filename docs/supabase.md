# Documentação do Banco de Dados Supabase - Pharma.AI

Este documento contém a estrutura completa do banco de dados Supabase utilizado pelo projeto Pharma.AI, incluindo tabelas, extensões, migrações e edge functions.

## Informações do Projeto

- **Nome do Projeto:** pharma-ai
- **ID do Projeto:** hjwebmpvaaeogbfqxwub
- **URL do Projeto:** https://hjwebmpvaaeogbfqxwub.supabase.co

## Tabelas

### 1. categoria_produto

Tabela para classificação de produtos.

| Coluna     | Tipo                    | Restrições  | Valor Padrão     |
|------------|-------------------------|-------------|------------------|
| id         | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nome       | varchar(100)           | NOT NULL    | NULL             |
| descricao  | text                    |             | NULL             |
| codigo     | varchar(20)             |             | NULL             |
| ativo      | boolean                 |             | true             |
| created_at | timestamp with time zone | NOT NULL   | now()            |
| updated_at | timestamp with time zone | NOT NULL   | now()            |

### 2. forma_farmaceutica

Tabela para formas farmacêuticas de medicamentos.

| Coluna     | Tipo                    | Restrições  | Valor Padrão     |
|------------|-------------------------|-------------|------------------|
| id         | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nome       | varchar(100)           | NOT NULL    | NULL             |
| descricao  | text                    |             | NULL             |
| sigla      | varchar(10)             |             | NULL             |
| ativo      | boolean                 |             | true             |
| created_at | timestamp with time zone | NOT NULL   | now()            |
| updated_at | timestamp with time zone | NOT NULL   | now()            |

### 3. produto

Tabela para cadastro de produtos, insumos e matérias-primas.

| Coluna                | Tipo                    | Restrições     | Valor Padrão     |
|-----------------------|-------------------------|----------------|------------------|
| id                    | uuid                    | PK, NOT NULL   | gen_random_uuid() |
| codigo_interno        | varchar(50)             | UNIQUE, NOT NULL | NULL           |
| codigo_ean            | varchar(14)             |                | NULL             |
| nome                  | varchar(255)            | NOT NULL       | NULL             |
| descricao             | text                    |                | NULL             |
| categoria_produto_id  | uuid                    | FK             | NULL             |
| forma_farmaceutica_id | uuid                    | FK             | NULL             |
| fornecedor_id         | uuid                    | FK             | NULL             |
| ncm                   | varchar(8)              |                | NULL             |
| cfop                  | varchar(4)              |                | NULL             |
| origem                | integer                 |                | 0                |
| cst_icms              | varchar(3)              |                | NULL             |
| cst_ipi               | varchar(2)              |                | NULL             |
| cst_pis               | varchar(2)              |                | NULL             |
| cst_cofins            | varchar(2)              |                | NULL             |
| unidade_comercial     | varchar(10)             | NOT NULL       | NULL             |
| unidade_tributaria    | varchar(10)             |                | NULL             |
| preco_custo           | decimal(10,4)           |                | NULL             |
| preco_venda           | decimal(10,4)           |                | NULL             |
| margem_lucro          | decimal(5,2)            |                | NULL             |
| aliquota_icms         | decimal(5,2)            |                | 0                |
| aliquota_ipi          | decimal(5,2)            |                | 0                |
| aliquota_pis          | decimal(5,2)            |                | 0                |
| aliquota_cofins       | decimal(5,2)            |                | 0                |
| estoque_minimo        | decimal(10,3)           |                | 0                |
| estoque_maximo        | decimal(10,3)           |                | 0                |
| estoque_atual         | decimal(10,3)           |                | 0                |
| controlado            | boolean                 |                | false            |
| requer_receita        | boolean                 |                | false            |
| produto_manipulado    | boolean                 |                | false            |
| produto_revenda       | boolean                 |                | true             |
| ativo                 | boolean                 |                | true             |
| created_at            | timestamp with time zone | NOT NULL      | now()            |
| updated_at            | timestamp with time zone | NOT NULL      | now()            |

### 4. lote

Tabela para controle de lotes de produtos e insumos.

| Coluna              | Tipo                    | Restrições     | Valor Padrão     |
|---------------------|-------------------------|----------------|------------------|
| id                  | uuid                    | PK, NOT NULL   | gen_random_uuid() |
| produto_id          | uuid                    | NOT NULL, FK   | NULL             |
| numero_lote         | varchar(50)             | NOT NULL       | NULL             |
| data_fabricacao     | date                    |                | NULL             |
| data_validade       | date                    |                | NULL             |
| quantidade_inicial  | decimal(10,3)           | NOT NULL       | 0                |
| quantidade_atual    | decimal(10,3)           | NOT NULL       | 0                |
| preco_custo_unitario | decimal(10,4)          |                | NULL             |
| fornecedor_id       | uuid                    | FK             | NULL             |
| observacoes         | text                    |                | NULL             |
| ativo               | boolean                 |                | true             |
| created_at          | timestamp with time zone | NOT NULL      | now()            |
| updated_at          | timestamp with time zone | NOT NULL      | now()            |

### 5. receitas_raw

Tabela para armazenar receitas médicas brutas.

| Coluna             | Tipo                    | Restrições | Valor Padrão     |
|--------------------|-------------------------|------------|------------------|
| id                 | uuid                    | PK, NOT NULL | gen_random_uuid() |
| created_at         | timestamp with time zone | NOT NULL  | now()            |
| client_id          | uuid                    |            | NULL             |
| uploaded_by_user_id | uuid                   | NOT NULL   | NULL             |
| file_url           | text                    | NOT NULL   | NULL             |
| file_name          | text                    | NOT NULL   | NULL             |
| file_mime_type     | text                    | NOT NULL   | NULL             |
| input_type         | text                    | NOT NULL   | NULL             |
| status             | text                    | NOT NULL   | 'received'::text |
| metadata           | jsonb                   |            | NULL             |

### 6. receitas_processadas

Tabela para armazenar receitas após processamento.

| Coluna              | Tipo                    | Restrições | Valor Padrão     |
|---------------------|-------------------------|------------|------------------|
| id                  | uuid                    | PK, NOT NULL | gen_random_uuid() |
| raw_recipe_id       | uuid                    | NOT NULL   | NULL             |
| client_id           | uuid                    |            | NULL             |
| prescriber_id       | uuid                    |            | NULL             |
| processed_at        | timestamp with time zone | NOT NULL  | now()            |
| processed_by_user_id | uuid                   | NOT NULL   | NULL             |
| medications         | jsonb                   | NOT NULL   | NULL             |
| patient_name        | text                    |            | NULL             |
| patient_dob         | date                    |            | NULL             |
| prescriber_name     | text                    |            | NULL             |
| prescriber_identifier | text                  |            | NULL             |
| validation_status   | text                    | NOT NULL   | 'pending_validation'::text |
| validation_notes    | text                    |            | NULL             |
| raw_ia_output       | jsonb                   |            | NULL             |

### 7. pedidos

Tabela para gerenciamento de pedidos.

| Coluna                  | Tipo                    | Restrições | Valor Padrão     |
|-------------------------|-------------------------|------------|------------------|
| id                      | uuid                    | PK, NOT NULL | gen_random_uuid() |
| created_at              | timestamp with time zone | NOT NULL  | now()            |
| client_id               | uuid                    |            | NULL             |
| processed_recipe_id     | uuid                    | NOT NULL   | NULL             |
| status                  | text                    | NOT NULL   | 'draft'::text    |
| created_by_user_id      | uuid                    | NOT NULL   | NULL             |
| notes                   | text                    |            | NULL             |
| estimated_delivery_date | date                    |            | NULL             |
| total_amount            | numeric                 |            | NULL             |
| payment_status          | text                    | NOT NULL   | 'pending'::text  |
| channel                 | text                    | NOT NULL   | NULL             |
| metadata                | jsonb                   |            | NULL             |

### 8. fornecedores

Tabela para cadastro de fornecedores.

| Coluna            | Tipo                    | Restrições | Valor Padrão     |
|-------------------|-------------------------|------------|------------------|
| id                | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nome              | text                    | NOT NULL   | NULL             |
| contato           | text                    |            | NULL             |
| telefone          | text                    |            | NULL             |
| email             | text                    |            | NULL             |
| endereco          | text                    |            | NULL             |
| created_at        | timestamp with time zone | NOT NULL  | now()            |
| nome_fantasia     | text                    |            | NULL             |
| documento         | text                    |            | NULL             |
| tipo_pessoa       | text                    |            | NULL             |
| cep               | text                    |            | NULL             |
| cidade            | text                    |            | NULL             |
| estado            | text                    |            | NULL             |
| inscricao_estadual | text                   |            | NULL             |
| afe_anvisa        | text                    |            | NULL             |
| tipo_fornecedor   | text                    |            | NULL             |

### 9. insumos

Tabela para gerenciamento de insumos farmacêuticos.

| Coluna             | Tipo                    | Restrições | Valor Padrão     |
|--------------------|-------------------------|------------|------------------|
| id                 | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nome               | text                    | NOT NULL   | NULL             |
| tipo               | text                    | NOT NULL   | NULL             |
| unidade_medida     | text                    | NOT NULL   | NULL             |
| custo_unitario     | numeric                 | NOT NULL   | NULL             |
| fornecedor_id      | uuid                    |            | NULL             |
| descricao          | text                    |            | NULL             |
| estoque_atual      | numeric                 | NOT NULL   | 0                |
| estoque_minimo     | numeric                 | NOT NULL   | 0                |
| estoque_maximo     | numeric                 |            | NULL             |
| created_at         | timestamp with time zone | NOT NULL  | now()            |
| updated_at         | timestamp with time zone | NOT NULL  | now()            |
| is_deleted         | boolean                 | NOT NULL   | false            |
| codigo_interno     | text                    | UNIQUE     | NULL             |
| codigo_ean         | text                    |            | NULL             |
| ncm                | text                    |            | NULL             |
| cfop               | text                    |            | NULL             |
| unidade_comercial  | text                    |            | NULL             |
| unidade_tributaria | text                    |            | NULL             |
| origem             | integer                 |            | 0                |
| cst_icms           | text                    |            | NULL             |
| cst_ipi            | text                    |            | NULL             |
| cst_pis            | text                    |            | NULL             |
| cst_cofins         | text                    |            | NULL             |
| aliquota_icms      | numeric                 |            | 0                |
| aliquota_ipi       | numeric                 |            | 0                |
| aliquota_pis       | numeric                 |            | 0                |
| aliquota_cofins    | numeric                 |            | 0                |
| preco_custo        | numeric                 |            | NULL             |
| preco_venda        | numeric                 |            | NULL             |
| margem_lucro       | numeric                 |            | NULL             |
| controlado         | boolean                 |            | false            |
| requer_receita     | boolean                 |            | false            |
| produto_manipulado | boolean                 |            | false            |
| produto_revenda    | boolean                 |            | true             |
| ativo              | boolean                 |            | true             |
| categoria_produto_id | uuid                  |            | NULL             |
| forma_farmaceutica_id | uuid                 |            | NULL             |

### 10. embalagens

Tabela para gerenciamento de embalagens.

| Coluna            | Tipo                    | Restrições | Valor Padrão     |
|-------------------|-------------------------|------------|------------------|
| id                | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nome              | text                    | NOT NULL   | NULL             |
| tipo              | text                    | NOT NULL   | NULL             |
| volume_capacidade | text                    |            | NULL             |
| custo_unitario    | numeric                 | NOT NULL   | NULL             |
| fornecedor_id     | uuid                    |            | NULL             |
| descricao         | text                    |            | NULL             |
| estoque_atual     | integer                 | NOT NULL   | 0                |
| estoque_minimo    | integer                 | NOT NULL   | 0                |
| estoque_maximo    | integer                 |            | NULL             |
| created_at        | timestamp with time zone | NOT NULL  | now()            |
| updated_at        | timestamp with time zone | NOT NULL  | now()            |
| is_deleted        | boolean                 | NOT NULL   | false            |

### 11. lotes_insumos

Tabela para controle de lotes de insumos.

| Coluna            | Tipo                    | Restrições | Valor Padrão     |
|-------------------|-------------------------|------------|------------------|
| id                | uuid                    | PK, NOT NULL | gen_random_uuid() |
| insumo_id         | uuid                    | NOT NULL   | NULL             |
| numero_lote       | text                    | NOT NULL   | NULL             |
| data_validade     | date                    |            | NULL             |
| quantidade        | numeric                 | NOT NULL   | NULL             |
| unidade_medida    | text                    | NOT NULL   | NULL             |
| localizacao       | text                    |            | NULL             |
| created_at        | timestamp with time zone | NOT NULL  | now()            |
| quantidade_inicial | numeric                | NOT NULL   | 0                |
| quantidade_atual  | numeric                 | NOT NULL   | 0                |
| fornecedor_id     | uuid                    |            | NULL             |
| custo_unitario_lote | numeric               |            | NULL             |
| is_deleted        | boolean                 | NOT NULL   | false            |
| notas             | text                    |            | NULL             |

### 12. categorias_financeiras

Tabela para categorização financeira.

| Coluna            | Tipo                    | Restrições | Valor Padrão     |
|-------------------|-------------------------|------------|------------------|
| id                | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nome              | text                    | NOT NULL, UNIQUE | NULL       |
| tipo              | text                    | NOT NULL   | NULL             |
| descricao         | text                    |            | NULL             |
| is_deleted        | boolean                 | NOT NULL   | false            |

### 13. movimentacoes_caixa

Tabela para controle de movimentações financeiras.

| Coluna             | Tipo                    | Restrições | Valor Padrão     |
|--------------------|-------------------------|------------|------------------|
| id                 | uuid                    | PK, NOT NULL | gen_random_uuid() |
| data_movimentacao  | timestamp with time zone | NOT NULL  | now()            |
| tipo_movimentacao  | text                    | NOT NULL   | NULL             |
| descricao          | text                    | NOT NULL   | NULL             |
| valor              | numeric                 | NOT NULL   | NULL             |
| categoria_id       | uuid                    |            | NULL             |
| pedido_id          | uuid                    |            | NULL             |
| usuario_id         | uuid                    |            | NULL             |
| observacoes        | text                    |            | NULL             |
| created_at         | timestamp with time zone | NOT NULL  | now()            |
| is_deleted         | boolean                 | NOT NULL   | false            |

### 14. historico_status_pedidos

Tabela para rastreamento de mudanças de status em pedidos.

| Coluna            | Tipo                    | Restrições | Valor Padrão     |
|-------------------|-------------------------|------------|------------------|
| id                | uuid                    | PK, NOT NULL | gen_random_uuid() |
| pedido_id         | uuid                    | NOT NULL   | NULL             |
| status_anterior   | text                    | NOT NULL   | NULL             |
| status_novo       | text                    | NOT NULL   | NULL             |
| data_alteracao    | timestamp with time zone | NOT NULL  | now()            |
| usuario_id        | uuid                    |            | NULL             |
| observacao        | text                    |            | NULL             |
| created_at        | timestamp with time zone | NOT NULL  | now()            |

### 15. contas_a_pagar

Tabela para gerenciamento de contas a pagar.

| Coluna                | Tipo                    | Restrições | Valor Padrão     |
|-----------------------|-------------------------|------------|------------------|
| id                    | uuid                    | PK, NOT NULL | gen_random_uuid() |
| created_at            | timestamp with time zone | NOT NULL  | now()            |
| descricao             | text                    | NOT NULL   | NULL             |
| fornecedor_id         | uuid                    |            | NULL             |
| categoria_id          | uuid                    |            | NULL             |
| valor_previsto        | numeric                 | NOT NULL   | NULL             |
| data_emissao          | date                    |            | NULL             |
| data_vencimento       | date                    | NOT NULL   | NULL             |
| data_pagamento        | date                    |            | NULL             |
| valor_pago            | numeric                 |            | NULL             |
| status_conta          | text                    | NOT NULL   | 'pendente'::text |
| observacoes           | text                    |            | NULL             |
| is_deleted            | boolean                 | NOT NULL   | false            |
| usuario_id_registro   | uuid                    |            | NULL             |
| usuario_id_pagamento  | uuid                    |            | NULL             |
| movimentacao_caixa_id | uuid                    |            | NULL             |

### 16. leads_chatbot

Tabela para armazenar leads capturados pelo chatbot.

| Coluna                 | Tipo                    | Restrições | Valor Padrão     |
|------------------------|-------------------------|------------|------------------|
| id                     | uuid                    | PK, NOT NULL | uuid_generate_v4() |
| created_at             | timestamp with time zone |           | now()            |
| nome_contato           | text                    |            | NULL             |
| nome_farmacia          | text                    | NOT NULL   | NULL             |
| email                  | text                    | NOT NULL, UNIQUE | NULL      |
| telefone               | text                    |            | NULL             |
| status_contato         | text                    |            | 'novo'::text     |
| observacoes            | text                    |            | NULL             |
| transcricao_conversa_json | jsonb                |            | NULL             |

### 17. document_chunks

Tabela para armazenar chunks de documentos para RAG (Retrieval Augmented Generation).

| Coluna        | Tipo                    | Restrições | Valor Padrão     |
|---------------|-------------------------|------------|------------------|
| id            | uuid                    | PK, NOT NULL | gen_random_uuid() |
| content       | text                    | NOT NULL   | NULL             |
| embedding     | vector                  |            | NULL             |
| metadata      | jsonb                   |            | '{}'::jsonb      |
| document_name | character varying       |            | NULL             |
| chunk_index   | integer                 |            | NULL             |
| created_at    | timestamp with time zone |           | now()            |
| updated_at    | timestamp with time zone |           | now()            |

### 18. chatbot_memory

Tabela para armazenar memória do chatbot.

| Coluna            | Tipo                    | Restrições | Valor Padrão     |
|-------------------|-------------------------|------------|------------------|
| id                | uuid                    | PK, NOT NULL | gen_random_uuid() |
| session_id        | character varying       | NOT NULL   | NULL             |
| user_message      | text                    | NOT NULL   | NULL             |
| bot_response      | text                    | NOT NULL   | NULL             |
| context_used      | jsonb                   |            | '{}'::jsonb      |
| lead_data         | jsonb                   |            | '{}'::jsonb      |
| conversation_step | character varying       |            | NULL             |
| relevance_score   | double precision        |            | NULL             |
| created_at        | timestamp with time zone |           | now()            |

### 19. conversation_sessions

Tabela para rastreamento de sessões de conversação.

| Coluna          | Tipo                    | Restrições | Valor Padrão     |
|-----------------|-------------------------|------------|------------------|
| id              | uuid                    | PK, NOT NULL | gen_random_uuid() |
| session_id      | character varying       | NOT NULL, UNIQUE | NULL       |
| lead_id         | uuid                    |            | NULL             |
| start_time      | timestamp with time zone |           | now()            |
| end_time        | timestamp with time zone |            | NULL             |
| total_messages  | integer                 |            | 0                |
| session_metadata | jsonb                   |            | '{}'::jsonb      |
| is_active       | boolean                 |            | true             |

### 20. fornecedor_contatos

Tabela para contatos de fornecedores.

| Coluna        | Tipo                    | Restrições | Valor Padrão     |
|---------------|-------------------------|------------|------------------|
| id            | uuid                    | PK, NOT NULL | gen_random_uuid() |
| fornecedor_id | uuid                    | NOT NULL   | NULL             |
| nome          | text                    | NOT NULL   | NULL             |
| cargo         | text                    |            | NULL             |
| email         | text                    |            | NULL             |
| telefone      | text                    |            | NULL             |
| criado_em     | timestamp with time zone | NOT NULL  | now()            |

### 21. fornecedor_documentos

Tabela para documentos de fornecedores.

| Coluna        | Tipo                    | Restrições | Valor Padrão     |
|---------------|-------------------------|------------|------------------|
| id            | uuid                    | PK, NOT NULL | gen_random_uuid() |
| fornecedor_id | uuid                    | NOT NULL   | NULL             |
| nome_arquivo  | text                    | NOT NULL   | NULL             |
| url           | text                    | NOT NULL   | NULL             |
| tipo          | text                    |            | NULL             |
| criado_em     | timestamp with time zone | NOT NULL  | now()            |

### 22. notas_fiscais

Tabela para gerenciamento de notas fiscais.

| Coluna                | Tipo                    | Restrições | Valor Padrão     |
|-----------------------|-------------------------|------------|------------------|
| id                    | uuid                    | PK, NOT NULL | gen_random_uuid() |
| chave_acesso          | character varying       | NOT NULL, UNIQUE | NULL       |
| numero_nf             | integer                 | NOT NULL   | NULL             |
| serie                 | integer                 | NOT NULL   | NULL             |
| modelo                | integer                 | NOT NULL   | NULL             |
| data_emissao          | timestamp without time zone | NOT NULL | NULL          |
| data_saida_entrada    | timestamp without time zone |          | NULL          |
| fornecedor_id         | uuid                    |            | NULL             |
| valor_produtos        | numeric                 | NOT NULL   | NULL             |
| valor_frete           | numeric                 |            | 0                |
| valor_seguro          | numeric                 |            | 0                |
| valor_desconto        | numeric                 |            | 0                |
| valor_outras_despesas | numeric                 |            | 0                |
| valor_total_nota      | numeric                 | NOT NULL   | NULL             |
| valor_icms            | numeric                 |            | 0                |
| valor_ipi             | numeric                 |            | 0                |
| valor_pis             | numeric                 |            | 0                |
| valor_cofins          | numeric                 |            | 0                |
| valor_total_tributos  | numeric                 |            | 0                |
| status                | character varying       | NOT NULL   | 'RECEBIDA'::character varying |
| created_at            | timestamp without time zone |        | now()            |
| updated_at            | timestamp without time zone |        | now()            |

### 23. itens_nota_fiscal

Tabela para itens de nota fiscal.

| Coluna                    | Tipo                    | Restrições | Valor Padrão     |
|---------------------------|-------------------------|------------|------------------|
| id                        | uuid                    | PK, NOT NULL | gen_random_uuid() |
| nota_fiscal_id            | uuid                    | NOT NULL   | NULL             |
| produto_id                | uuid                    | NOT NULL   | NULL             |
| lote_id                   | uuid                    |            | NULL             |
| numero_item               | integer                 | NOT NULL   | NULL             |
| quantidade_comercial      | numeric                 | NOT NULL   | NULL             |
| valor_unitario_comercial  | numeric                 | NOT NULL   | NULL             |
| quantidade_tributaria     | numeric                 |            | NULL             |
| valor_unitario_tributario | numeric                 |            | NULL             |
| valor_total_produto       | numeric                 | NOT NULL   | NULL             |
| valor_frete               | numeric                 |            | 0                |
| cfop                      | character varying       |            | NULL             |
| ncm                       | character varying       |            | NULL             |
| origem_mercadoria         | integer                 |            | NULL             |
| cst_icms                  | character varying       |            | NULL             |
| base_calculo_icms         | numeric                 |            | NULL             |
| aliquota_icms             | numeric                 |            | NULL             |
| valor_icms                | numeric                 |            | NULL             |
| cst_ipi                   | character varying       |            | NULL             |
| valor_ipi                 | numeric                 |            | NULL             |
| cst_pis                   | character varying       |            | NULL             |
| aliquota_pis              | numeric                 |            | NULL             |
| valor_pis                 | numeric                 |            | NULL             |
| cst_cofins                | character varying       |            | NULL             |
| aliquota_cofins           | numeric                 |            | NULL             |
| valor_cofins              | numeric                 |            | NULL             |
| valor_total_tributos      | numeric                 |            | NULL             |
| created_at                | timestamp without time zone |        | now()            |
| updated_at                | timestamp without time zone |        | now()            |

### 24. perfis_usuario

Tabela para perfis de usuário do sistema.

| Coluna          | Tipo                    | Restrições | Valor Padrão     |
|-----------------|-------------------------|------------|------------------|
| id              | uuid                    | PK, NOT NULL | uuid_generate_v4() |
| nome            | character varying       | NOT NULL, UNIQUE | NULL       |
| descricao       | text                    |            | NULL             |
| tipo            | character varying       | NOT NULL   | NULL             |
| dashboard_padrao | character varying      | NOT NULL   | NULL             |
| ativo           | boolean                 |            | true             |
| criado_em       | timestamp with time zone |           | now()            |
| atualizado_em   | timestamp with time zone |           | now()            |

### 25. usuarios

Tabela para usuários do sistema.

| Coluna          | Tipo                    | Restrições | Valor Padrão     |
|-----------------|-------------------------|------------|------------------|
| id              | uuid                    | PK, NOT NULL | uuid_generate_v4() |
| supabase_auth_id | uuid                   | UNIQUE     | NULL             |
| nome            | character varying       | NOT NULL   | NULL             |
| email           | character varying       | NOT NULL, UNIQUE | NULL       |
| telefone        | character varying       |            | NULL             |
| perfil_id       | uuid                    | NOT NULL   | NULL             |
| ativo           | boolean                 |            | true             |
| ultimo_acesso   | timestamp with time zone |           | NULL             |
| criado_em       | timestamp with time zone |           | now()            |
| atualizado_em   | timestamp with time zone |           | now()            |
| created_at      | timestamp with time zone | NOT NULL  | timezone('UTC'::text, now()) |

### 26. permissoes

Tabela para controle de permissões do sistema.

| Coluna          | Tipo                    | Restrições | Valor Padrão     |
|-----------------|-------------------------|------------|------------------|
| id              | uuid                    | PK, NOT NULL | uuid_generate_v4() |
| perfil_id       | uuid                    | NOT NULL   | NULL             |
| modulo          | character varying       | NOT NULL   | NULL             |
| acao            | character varying       | NOT NULL   | NULL             |
| permitido       | boolean                 |            | true             |
| criado_em       | timestamp with time zone |           | now()            |

### 27. sessoes_usuario

Tabela para controle de sessões de usuário.

| Coluna          | Tipo                    | Restrições | Valor Padrão     |
|-----------------|-------------------------|------------|------------------|
| id              | uuid                    | PK, NOT NULL | uuid_generate_v4() |
| usuario_id      | uuid                    | NOT NULL   | NULL             |
| token_sessao    | character varying       | NOT NULL   | NULL             |
| ip_address      | inet                    |            | NULL             |
| user_agent      | text                    |            | NULL             |
| ativo           | boolean                 |            | true             |
| criado_em       | timestamp with time zone |           | now()            |
| expira_em       | timestamp with time zone | NOT NULL  | NULL             |

### 28. logs_auditoria

Tabela para registro de logs de auditoria.

| Coluna          | Tipo                    | Restrições | Valor Padrão     |
|-----------------|-------------------------|------------|------------------|
| id              | uuid                    | PK, NOT NULL | uuid_generate_v4() |
| usuario_id      | uuid                    |            | NULL             |
| acao            | character varying       | NOT NULL   | NULL             |
| modulo          | character varying       | NOT NULL   | NULL             |
| detalhes        | jsonb                   |            | NULL             |
| ip_address      | inet                    |            | NULL             |
| user_agent      | text                    |            | NULL             |
| sucesso         | boolean                 |            | true             |
| criado_em       | timestamp with time zone |           | now()            |

## Extensões Instaladas

- http (instalada no schema public)
- pg_graphql (instalada no schema graphql)
- pgcrypto (instalada no schema extensions)
- pg_stat_statements (instalada no schema extensions)
- pgjwt (instalada no schema extensions)
- vector (instalada no schema public)
- uuid-ossp (instalada no schema extensions)
- supabase_vault (instalada no schema vault)
- plpgsql (instalada no schema pg_catalog)

## Migrações

| Versão          | Nome                                     |
|-----------------|------------------------------------------|
| 20241219000000  | sistema_permissoes                      |
| 20250101000001  | fix_usuarios_table                      |
| 20250101000002  | add_first_access_function               |
| 20250101000003  | create_password_recovery_tables         |
| 20250522073315  | create_leads_chatbot_table              |
| 20250522113656  | create_insert_lead_chatbot_function     |
| 20250523015659  | create_ai_chatbot_tables                |
| 20250525015520  | add_campos_extra_fornecedores           |
| 20250525022102  | create_fornecedor_contatos              |
| 20250525022105  | create_fornecedor_documentos            |
| 20250525024218  | create_fornecedor_documentos_edge_function |
| 20250525061950  | policy_nf_xml_storage_authenticated_users |
| 20250525063548  | create_table_notas_fiscais              |
| 20250525063755  | create_table_itens_nota_fiscal          |
| 20250526010417  | add_rls_policies_notas_fiscais          |
| 20250526010437  | add_rls_policies_itens_nota_fiscal      |
| 20250526012744  | add_produto_columns_to_insumos_v2       |
| 20250526014810  | add_estoque_maximo_to_insumos           |
| 20250526015049  | corrigir_politicas_rls_usuarios         |
| 20250526015100  | simplificar_politicas_rls_usuarios      |
| 20250526015235  | habilitar_extensao_http                 |
| 20250526042834  | fix_usuarios_rls_policies               |
| 20250526042901  | simplify_usuarios_rls_policies          |
| 20250526050358  | fix_odtwin_user                         |
| 20250526060126  | fix_create_auth_user_function           |
| 20250526060150  | fix_create_auth_user_function_v2        |
| 20250526060217  | fix_create_auth_user_function_v3        |
| 20250526094021  | liberar_primeiro_usuario_usuarios_internos_v3 |
| 20250526094211  | ajuste_rls_primeiro_usuario_usuarios_internos |
| 20250526094407  | rls_primeiro_usuario_sem_recursao       |
| 20250526095109  | rls_primeiro_usuario_usuarios           |
| 20250527012122  | create_check_first_access_function      |
| 20250528000000  | create_categoria_produto                |
| 20250528000001  | create_forma_farmaceutica               |
| 20250528000002  | create_produto                          |
| 20250528000003  | create_lote                             |

## Edge Functions

### gerenciar-categorias

Função para operações CRUD em categorias de produtos.

### gerenciar-formas-farmaceuticas

Função para operações CRUD em formas farmacêuticas.

### gerenciar-produtos

Função para operações CRUD em produtos, com suporte a filtros avançados.

### gerenciar-lotes

Função para operações CRUD em lotes de produtos, com gerenciamento automático de estoque.

### save-chatbot-lead

Função para salvar leads do chatbot no banco de dados.

### save-form-lead

Função para salvar leads do formulário de contato.

### chatbot-ai-agent

Agente de IA para o chatbot, que utiliza DeepSeek API para gerar respostas baseadas em RAG.

### buscar-dados-documento

Função para buscar dados de documentos (CNPJ/CPF).

### fornecedor-contato-crud

Função para operações CRUD em contatos de fornecedores.

### fornecedor-documento-crud

Função para operações CRUD em documentos de fornecedores.

### criar-usuario

Função para criar usuários no Auth e na tabela usuarios.

### create_user

Função alternativa para criar usuários.

### enviar-email-recuperacao

Função para enviar e-mails de recuperação de senha. 