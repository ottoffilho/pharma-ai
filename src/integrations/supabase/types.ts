export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categorias_financeiras: {
        Row: {
          descricao: string | null
          id: string
          is_deleted: boolean
          nome: string
          tipo: string
        }
        Insert: {
          descricao?: string | null
          id?: string
          is_deleted?: boolean
          nome: string
          tipo: string
        }
        Update: {
          descricao?: string | null
          id?: string
          is_deleted?: boolean
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      chatbot_memory: {
        Row: {
          bot_response: string
          context_used: Json | null
          conversation_step: string | null
          created_at: string | null
          id: string
          lead_data: Json | null
          relevance_score: number | null
          session_id: string
          user_message: string
        }
        Insert: {
          bot_response: string
          context_used?: Json | null
          conversation_step?: string | null
          created_at?: string | null
          id?: string
          lead_data?: Json | null
          relevance_score?: number | null
          session_id: string
          user_message: string
        }
        Update: {
          bot_response?: string
          context_used?: Json | null
          conversation_step?: string | null
          created_at?: string | null
          id?: string
          lead_data?: Json | null
          relevance_score?: number | null
          session_id?: string
          user_message?: string
        }
        Relationships: []
      }
      contas_a_pagar: {
        Row: {
          categoria_id: string | null
          created_at: string
          data_emissao: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          fornecedor_id: string | null
          id: string
          is_deleted: boolean
          movimentacao_caixa_id: string | null
          observacoes: string | null
          status_conta: string
          usuario_id_pagamento: string | null
          usuario_id_registro: string | null
          valor_pago: number | null
          valor_previsto: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data_emissao?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          fornecedor_id?: string | null
          id?: string
          is_deleted?: boolean
          movimentacao_caixa_id?: string | null
          observacoes?: string | null
          status_conta?: string
          usuario_id_pagamento?: string | null
          usuario_id_registro?: string | null
          valor_pago?: number | null
          valor_previsto: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data_emissao?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          fornecedor_id?: string | null
          id?: string
          is_deleted?: boolean
          movimentacao_caixa_id?: string | null
          observacoes?: string | null
          status_conta?: string
          usuario_id_pagamento?: string | null
          usuario_id_registro?: string | null
          valor_pago?: number | null
          valor_previsto?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_a_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_a_pagar_movimentacao_caixa_id_fkey"
            columns: ["movimentacao_caixa_id"]
            isOneToOne: false
            referencedRelation: "movimentacoes_caixa"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_sessions: {
        Row: {
          end_time: string | null
          id: string
          is_active: boolean | null
          lead_id: string | null
          session_id: string
          session_metadata: Json | null
          start_time: string | null
          total_messages: number | null
        }
        Insert: {
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          lead_id?: string | null
          session_id: string
          session_metadata?: Json | null
          start_time?: string | null
          total_messages?: number | null
        }
        Update: {
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          lead_id?: string | null
          session_id?: string
          session_metadata?: Json | null
          start_time?: string | null
          total_messages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_chatbot"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number | null
          content: string
          created_at: string | null
          document_name: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          chunk_index?: number | null
          content: string
          created_at?: string | null
          document_name?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number | null
          content?: string
          created_at?: string | null
          document_name?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      embalagens: {
        Row: {
          created_at: string
          custo_unitario: number
          descricao: string | null
          estoque_atual: number
          estoque_maximo: number | null
          estoque_minimo: number
          fornecedor_id: string | null
          id: string
          is_deleted: boolean
          nome: string
          tipo: string
          updated_at: string
          volume_capacidade: string | null
        }
        Insert: {
          created_at?: string
          custo_unitario: number
          descricao?: string | null
          estoque_atual?: number
          estoque_maximo?: number | null
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          is_deleted?: boolean
          nome: string
          tipo: string
          updated_at?: string
          volume_capacidade?: string | null
        }
        Update: {
          created_at?: string
          custo_unitario?: number
          descricao?: string | null
          estoque_atual?: number
          estoque_maximo?: number | null
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          is_deleted?: boolean
          nome?: string
          tipo?: string
          updated_at?: string
          volume_capacidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embalagens_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_contatos: {
        Row: {
          cargo: string | null
          criado_em: string
          email: string | null
          fornecedor_id: string
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cargo?: string | null
          criado_em?: string
          email?: string | null
          fornecedor_id: string
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cargo?: string | null
          criado_em?: string
          email?: string | null
          fornecedor_id?: string
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_contatos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_documentos: {
        Row: {
          criado_em: string
          fornecedor_id: string
          id: string
          nome_arquivo: string
          tipo: string | null
          url: string
        }
        Insert: {
          criado_em?: string
          fornecedor_id: string
          id?: string
          nome_arquivo: string
          tipo?: string | null
          url: string
        }
        Update: {
          criado_em?: string
          fornecedor_id?: string
          id?: string
          nome_arquivo?: string
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_documentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          afe_anvisa: string | null
          cep: string | null
          cidade: string | null
          contato: string | null
          created_at: string
          documento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          nome: string
          nome_fantasia: string | null
          telefone: string | null
          tipo_fornecedor: string | null
          tipo_pessoa: string | null
        }
        Insert: {
          afe_anvisa?: string | null
          cep?: string | null
          cidade?: string | null
          contato?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome: string
          nome_fantasia?: string | null
          telefone?: string | null
          tipo_fornecedor?: string | null
          tipo_pessoa?: string | null
        }
        Update: {
          afe_anvisa?: string | null
          cep?: string | null
          cidade?: string | null
          contato?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome?: string
          nome_fantasia?: string | null
          telefone?: string | null
          tipo_fornecedor?: string | null
          tipo_pessoa?: string | null
        }
        Relationships: []
      }
      historico_status_pedidos: {
        Row: {
          created_at: string
          data_alteracao: string
          id: string
          observacao: string | null
          pedido_id: string
          status_anterior: string
          status_novo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          data_alteracao?: string
          id?: string
          observacao?: string | null
          pedido_id: string
          status_anterior: string
          status_novo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          data_alteracao?: string
          id?: string
          observacao?: string | null
          pedido_id?: string
          status_anterior?: string
          status_novo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_pedidos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          aliquota_cofins: number | null
          aliquota_icms: number | null
          aliquota_ipi: number | null
          aliquota_pis: number | null
          ativo: boolean | null
          categoria_produto_id: string | null
          cfop: string | null
          codigo_ean: string | null
          codigo_interno: string | null
          controlado: boolean | null
          created_at: string
          cst_cofins: string | null
          cst_icms: string | null
          cst_ipi: string | null
          cst_pis: string | null
          custo_unitario: number
          descricao: string | null
          estoque_atual: number
          estoque_maximo: number | null
          estoque_minimo: number
          forma_farmaceutica_id: string | null
          fornecedor_id: string | null
          id: string
          is_deleted: boolean
          margem_lucro: number | null
          ncm: string | null
          nome: string
          origem: number | null
          preco_custo: number | null
          preco_venda: number | null
          produto_manipulado: boolean | null
          produto_revenda: boolean | null
          requer_receita: boolean | null
          tipo: string
          unidade_comercial: string | null
          unidade_medida: string
          unidade_tributaria: string | null
          updated_at: string
        }
        Insert: {
          aliquota_cofins?: number | null
          aliquota_icms?: number | null
          aliquota_ipi?: number | null
          aliquota_pis?: number | null
          ativo?: boolean | null
          categoria_produto_id?: string | null
          cfop?: string | null
          codigo_ean?: string | null
          codigo_interno?: string | null
          controlado?: boolean | null
          created_at?: string
          cst_cofins?: string | null
          cst_icms?: string | null
          cst_ipi?: string | null
          cst_pis?: string | null
          custo_unitario: number
          descricao?: string | null
          estoque_atual?: number
          estoque_maximo?: number | null
          estoque_minimo?: number
          forma_farmaceutica_id?: string | null
          fornecedor_id?: string | null
          id?: string
          is_deleted?: boolean
          margem_lucro?: number | null
          ncm?: string | null
          nome: string
          origem?: number | null
          preco_custo?: number | null
          preco_venda?: number | null
          produto_manipulado?: boolean | null
          produto_revenda?: boolean | null
          requer_receita?: boolean | null
          tipo: string
          unidade_comercial?: string | null
          unidade_medida: string
          unidade_tributaria?: string | null
          updated_at?: string
        }
        Update: {
          aliquota_cofins?: number | null
          aliquota_icms?: number | null
          aliquota_ipi?: number | null
          aliquota_pis?: number | null
          ativo?: boolean | null
          categoria_produto_id?: string | null
          cfop?: string | null
          codigo_ean?: string | null
          codigo_interno?: string | null
          controlado?: boolean | null
          created_at?: string
          cst_cofins?: string | null
          cst_icms?: string | null
          cst_ipi?: string | null
          cst_pis?: string | null
          custo_unitario?: number
          descricao?: string | null
          estoque_atual?: number
          estoque_maximo?: number | null
          estoque_minimo?: number
          forma_farmaceutica_id?: string | null
          fornecedor_id?: string | null
          id?: string
          is_deleted?: boolean
          margem_lucro?: number | null
          ncm?: string | null
          nome?: string
          origem?: number | null
          preco_custo?: number | null
          preco_venda?: number | null
          produto_manipulado?: boolean | null
          produto_revenda?: boolean | null
          requer_receita?: boolean | null
          tipo?: string
          unidade_comercial?: string | null
          unidade_medida?: string
          unidade_tributaria?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_nota_fiscal: {
        Row: {
          aliquota_cofins: number | null
          aliquota_icms: number | null
          aliquota_pis: number | null
          base_calculo_icms: number | null
          cfop: string | null
          created_at: string | null
          cst_cofins: string | null
          cst_icms: string | null
          cst_ipi: string | null
          cst_pis: string | null
          id: string
          lote_id: string | null
          ncm: string | null
          nota_fiscal_id: string
          numero_item: number
          origem_mercadoria: number | null
          produto_id: string
          quantidade_comercial: number
          quantidade_tributaria: number | null
          updated_at: string | null
          valor_cofins: number | null
          valor_frete: number | null
          valor_icms: number | null
          valor_ipi: number | null
          valor_pis: number | null
          valor_total_produto: number
          valor_total_tributos: number | null
          valor_unitario_comercial: number
          valor_unitario_tributario: number | null
        }
        Insert: {
          aliquota_cofins?: number | null
          aliquota_icms?: number | null
          aliquota_pis?: number | null
          base_calculo_icms?: number | null
          cfop?: string | null
          created_at?: string | null
          cst_cofins?: string | null
          cst_icms?: string | null
          cst_ipi?: string | null
          cst_pis?: string | null
          id?: string
          lote_id?: string | null
          ncm?: string | null
          nota_fiscal_id: string
          numero_item: number
          origem_mercadoria?: number | null
          produto_id: string
          quantidade_comercial: number
          quantidade_tributaria?: number | null
          updated_at?: string | null
          valor_cofins?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_pis?: number | null
          valor_total_produto: number
          valor_total_tributos?: number | null
          valor_unitario_comercial: number
          valor_unitario_tributario?: number | null
        }
        Update: {
          aliquota_cofins?: number | null
          aliquota_icms?: number | null
          aliquota_pis?: number | null
          base_calculo_icms?: number | null
          cfop?: string | null
          created_at?: string | null
          cst_cofins?: string | null
          cst_icms?: string | null
          cst_ipi?: string | null
          cst_pis?: string | null
          id?: string
          lote_id?: string | null
          ncm?: string | null
          nota_fiscal_id?: string
          numero_item?: number
          origem_mercadoria?: number | null
          produto_id?: string
          quantidade_comercial?: number
          quantidade_tributaria?: number | null
          updated_at?: string | null
          valor_cofins?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_pis?: number | null
          valor_total_produto?: number
          valor_total_tributos?: number | null
          valor_unitario_comercial?: number
          valor_unitario_tributario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_lote_id"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes_insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_produto_id"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_nota_fiscal_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_chatbot: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome_contato: string | null
          nome_farmacia: string
          observacoes: string | null
          status_contato: string | null
          telefone: string | null
          transcricao_conversa_json: Json | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome_contato?: string | null
          nome_farmacia: string
          observacoes?: string | null
          status_contato?: string | null
          telefone?: string | null
          transcricao_conversa_json?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome_contato?: string | null
          nome_farmacia?: string
          observacoes?: string | null
          status_contato?: string | null
          telefone?: string | null
          transcricao_conversa_json?: Json | null
        }
        Relationships: []
      }
      logs_auditoria: {
        Row: {
          acao: string
          criado_em: string | null
          detalhes: Json | null
          id: string
          ip_address: unknown | null
          modulo: string
          sucesso: boolean | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          detalhes?: Json | null
          id?: string
          ip_address?: unknown | null
          modulo: string
          sucesso?: boolean | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          detalhes?: Json | null
          id?: string
          ip_address?: unknown | null
          modulo?: string
          sucesso?: boolean | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes_insumos: {
        Row: {
          created_at: string
          custo_unitario_lote: number | null
          data_validade: string | null
          fornecedor_id: string | null
          id: string
          insumo_id: string
          is_deleted: boolean
          localizacao: string | null
          notas: string | null
          numero_lote: string
          quantidade: number
          quantidade_atual: number
          quantidade_inicial: number
          unidade_medida: string
        }
        Insert: {
          created_at?: string
          custo_unitario_lote?: number | null
          data_validade?: string | null
          fornecedor_id?: string | null
          id?: string
          insumo_id: string
          is_deleted?: boolean
          localizacao?: string | null
          notas?: string | null
          numero_lote: string
          quantidade: number
          quantidade_atual?: number
          quantidade_inicial?: number
          unidade_medida: string
        }
        Update: {
          created_at?: string
          custo_unitario_lote?: number | null
          data_validade?: string | null
          fornecedor_id?: string | null
          id?: string
          insumo_id?: string
          is_deleted?: boolean
          localizacao?: string | null
          notas?: string | null
          numero_lote?: string
          quantidade?: number
          quantidade_atual?: number
          quantidade_inicial?: number
          unidade_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_insumos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lotes_insumos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_caixa: {
        Row: {
          categoria_id: string | null
          created_at: string
          data_movimentacao: string
          descricao: string
          id: string
          is_deleted: boolean
          observacoes: string | null
          pedido_id: string | null
          tipo_movimentacao: string
          usuario_id: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data_movimentacao?: string
          descricao: string
          id?: string
          is_deleted?: boolean
          observacoes?: string | null
          pedido_id?: string | null
          tipo_movimentacao: string
          usuario_id?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data_movimentacao?: string
          descricao?: string
          id?: string
          is_deleted?: boolean
          observacoes?: string | null
          pedido_id?: string | null
          tipo_movimentacao?: string
          usuario_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_caixa_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_caixa_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          chave_acesso: string
          created_at: string | null
          data_emissao: string
          data_saida_entrada: string | null
          fornecedor_id: string | null
          id: string
          modelo: number
          numero_nf: number
          serie: number
          status: string
          updated_at: string | null
          valor_cofins: number | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_icms: number | null
          valor_ipi: number | null
          valor_outras_despesas: number | null
          valor_pis: number | null
          valor_produtos: number
          valor_seguro: number | null
          valor_total_nota: number
          valor_total_tributos: number | null
        }
        Insert: {
          chave_acesso: string
          created_at?: string | null
          data_emissao: string
          data_saida_entrada?: string | null
          fornecedor_id?: string | null
          id?: string
          modelo: number
          numero_nf: number
          serie: number
          status?: string
          updated_at?: string | null
          valor_cofins?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_outras_despesas?: number | null
          valor_pis?: number | null
          valor_produtos: number
          valor_seguro?: number | null
          valor_total_nota: number
          valor_total_tributos?: number | null
        }
        Update: {
          chave_acesso?: string
          created_at?: string | null
          data_emissao?: string
          data_saida_entrada?: string | null
          fornecedor_id?: string | null
          id?: string
          modelo?: number
          numero_nf?: number
          serie?: number
          status?: string
          updated_at?: string | null
          valor_cofins?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_outras_despesas?: number | null
          valor_pis?: number | null
          valor_produtos?: number
          valor_seguro?: number | null
          valor_total_nota?: number
          valor_total_tributos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          channel: string
          client_id: string | null
          created_at: string
          created_by_user_id: string
          estimated_delivery_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          payment_status: string
          processed_recipe_id: string
          status: string
          total_amount: number | null
        }
        Insert: {
          channel: string
          client_id?: string | null
          created_at?: string
          created_by_user_id: string
          estimated_delivery_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_status?: string
          processed_recipe_id: string
          status?: string
          total_amount?: number | null
        }
        Update: {
          channel?: string
          client_id?: string | null
          created_at?: string
          created_by_user_id?: string
          estimated_delivery_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payment_status?: string
          processed_recipe_id?: string
          status?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_processed_recipe_id_fkey"
            columns: ["processed_recipe_id"]
            isOneToOne: false
            referencedRelation: "receitas_processadas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_usuario: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          dashboard_padrao: string
          descricao: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          dashboard_padrao: string
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          dashboard_padrao?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      permissoes: {
        Row: {
          acao: string
          criado_em: string | null
          id: string
          modulo: string
          perfil_id: string
          permitido: boolean | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          id?: string
          modulo: string
          perfil_id: string
          permitido?: boolean | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          id?: string
          modulo?: string
          perfil_id?: string
          permitido?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas_processadas: {
        Row: {
          client_id: string | null
          id: string
          medications: Json
          patient_dob: string | null
          patient_name: string | null
          prescriber_id: string | null
          prescriber_identifier: string | null
          prescriber_name: string | null
          processed_at: string
          processed_by_user_id: string
          raw_ia_output: Json | null
          raw_recipe_id: string
          validation_notes: string | null
          validation_status: string
        }
        Insert: {
          client_id?: string | null
          id?: string
          medications: Json
          patient_dob?: string | null
          patient_name?: string | null
          prescriber_id?: string | null
          prescriber_identifier?: string | null
          prescriber_name?: string | null
          processed_at?: string
          processed_by_user_id: string
          raw_ia_output?: Json | null
          raw_recipe_id: string
          validation_notes?: string | null
          validation_status?: string
        }
        Update: {
          client_id?: string | null
          id?: string
          medications?: Json
          patient_dob?: string | null
          patient_name?: string | null
          prescriber_id?: string | null
          prescriber_identifier?: string | null
          prescriber_name?: string | null
          processed_at?: string
          processed_by_user_id?: string
          raw_ia_output?: Json | null
          raw_recipe_id?: string
          validation_notes?: string | null
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "receitas_processadas_raw_recipe_id_fkey"
            columns: ["raw_recipe_id"]
            isOneToOne: false
            referencedRelation: "receitas_raw"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas_raw: {
        Row: {
          client_id: string | null
          created_at: string
          file_mime_type: string
          file_name: string
          file_url: string
          id: string
          input_type: string
          metadata: Json | null
          status: string
          uploaded_by_user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          file_mime_type: string
          file_name: string
          file_url: string
          id?: string
          input_type: string
          metadata?: Json | null
          status?: string
          uploaded_by_user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          file_mime_type?: string
          file_name?: string
          file_url?: string
          id?: string
          input_type?: string
          metadata?: Json | null
          status?: string
          uploaded_by_user_id?: string
        }
        Relationships: []
      }
      sessoes_usuario: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          expira_em: string
          id: string
          ip_address: unknown | null
          token_sessao: string
          user_agent: string | null
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          expira_em: string
          id?: string
          ip_address?: unknown | null
          token_sessao: string
          user_agent?: string | null
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          expira_em?: string
          id?: string
          ip_address?: unknown | null
          token_sessao?: string
          user_agent?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          email: string
          id: string
          nome: string
          perfil_id: string
          supabase_auth_id: string | null
          telefone: string | null
          ultimo_acesso: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          email: string
          id?: string
          nome: string
          perfil_id: string
          supabase_auth_id?: string | null
          telefone?: string | null
          ultimo_acesso?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          perfil_id?: string
          supabase_auth_id?: string | null
          telefone?: string | null
          ultimo_acesso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_internos: {
        Row: {
          ativo: boolean
          cargo_perfil: string
          created_at: string
          email_contato: string
          id: string
          nome_completo: string
          supabase_auth_id: string | null
          telefone_contato: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo_perfil: string
          created_at?: string
          email_contato: string
          id?: string
          nome_completo: string
          supabase_auth_id?: string | null
          telefone_contato?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo_perfil?: string
          created_at?: string
          email_contato?: string
          id?: string
          nome_completo?: string
          supabase_auth_id?: string | null
          telefone_contato?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      handle_fornecedor_documentos: {
        Args: {
          p_action: string
          p_fornecedor_id?: string
          p_documento_id?: string
          p_nome_arquivo?: string
          p_url?: string
          p_tipo?: string
        }
        Returns: Json
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      insert_lead_chatbot: {
        Args: {
          p_nome_contato: string
          p_nome_farmacia: string
          p_email: string
          p_telefone?: string
          p_transcricao?: string
        }
        Returns: {
          id: string
          created_at: string
          nome_contato: string
          nome_farmacia: string
          email: string
          telefone: string
          status_contato: string
          observacoes: string
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      obter_usuario_por_auth_id: {
        Args: { p_auth_id: string }
        Returns: {
          id: string
          nome: string
          email: string
          telefone: string
          perfil_nome: string
          perfil_tipo: string
          dashboard_padrao: string
          ativo: boolean
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      verificar_permissao: {
        Args: { p_usuario_id: string; p_modulo: string; p_acao: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
