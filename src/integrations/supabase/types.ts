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
      fornecedores: {
        Row: {
          contato: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          contato?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          contato?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
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
      historico_status_ordens: {
        Row: {
          created_at: string
          data_alteracao: string
          id: string
          observacao: string | null
          ordem_producao_id: string
          status_anterior: string | null
          status_novo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          data_alteracao?: string
          id?: string
          observacao?: string | null
          ordem_producao_id: string
          status_anterior?: string | null
          status_novo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          data_alteracao?: string
          id?: string
          observacao?: string | null
          ordem_producao_id?: string
          status_anterior?: string | null
          status_novo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_status_ordens_ordem_producao_id_fkey"
            columns: ["ordem_producao_id"]
            isOneToOne: false
            referencedRelation: "ordens_producao"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
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
          unidade_medida: string
          updated_at: string
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
          unidade_medida: string
          updated_at?: string
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
          unidade_medida?: string
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
      ordem_producao_embalagens: {
        Row: {
          created_at: string
          custo_total: number | null
          custo_unitario: number | null
          embalagem_id: string
          id: string
          observacoes: string | null
          ordem_producao_id: string
          quantidade_necessaria: number
          quantidade_utilizada: number | null
        }
        Insert: {
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          embalagem_id: string
          id?: string
          observacoes?: string | null
          ordem_producao_id: string
          quantidade_necessaria: number
          quantidade_utilizada?: number | null
        }
        Update: {
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          embalagem_id?: string
          id?: string
          observacoes?: string | null
          ordem_producao_id?: string
          quantidade_necessaria?: number
          quantidade_utilizada?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_producao_embalagens_embalagem_id_fkey"
            columns: ["embalagem_id"]
            isOneToOne: false
            referencedRelation: "embalagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_producao_embalagens_ordem_producao_id_fkey"
            columns: ["ordem_producao_id"]
            isOneToOne: false
            referencedRelation: "ordens_producao"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_producao_etapas: {
        Row: {
          anexos_urls: string[] | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao_etapa: string
          id: string
          nome_etapa: string
          numero_etapa: number
          observacoes: string | null
          ordem_producao_id: string
          status: string
          tempo_estimado_minutos: number | null
          tempo_real_minutos: number | null
          usuario_executor_id: string | null
        }
        Insert: {
          anexos_urls?: string[] | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao_etapa: string
          id?: string
          nome_etapa: string
          numero_etapa: number
          observacoes?: string | null
          ordem_producao_id: string
          status?: string
          tempo_estimado_minutos?: number | null
          tempo_real_minutos?: number | null
          usuario_executor_id?: string | null
        }
        Update: {
          anexos_urls?: string[] | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao_etapa?: string
          id?: string
          nome_etapa?: string
          numero_etapa?: number
          observacoes?: string | null
          ordem_producao_id?: string
          status?: string
          tempo_estimado_minutos?: number | null
          tempo_real_minutos?: number | null
          usuario_executor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_producao_etapas_ordem_producao_id_fkey"
            columns: ["ordem_producao_id"]
            isOneToOne: false
            referencedRelation: "ordens_producao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_producao_etapas_usuario_executor_id_fkey"
            columns: ["usuario_executor_id"]
            isOneToOne: false
            referencedRelation: "usuarios_internos"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_producao_insumos: {
        Row: {
          created_at: string
          custo_total: number | null
          custo_unitario: number | null
          id: string
          insumo_id: string
          lote_insumo_id: string | null
          observacoes: string | null
          ordem_producao_id: string
          quantidade_necessaria: number
          quantidade_utilizada: number | null
          unidade_medida: string
        }
        Insert: {
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          id?: string
          insumo_id: string
          lote_insumo_id?: string | null
          observacoes?: string | null
          ordem_producao_id: string
          quantidade_necessaria: number
          quantidade_utilizada?: number | null
          unidade_medida: string
        }
        Update: {
          created_at?: string
          custo_total?: number | null
          custo_unitario?: number | null
          id?: string
          insumo_id?: string
          lote_insumo_id?: string | null
          observacoes?: string | null
          ordem_producao_id?: string
          quantidade_necessaria?: number
          quantidade_utilizada?: number | null
          unidade_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordem_producao_insumos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_producao_insumos_lote_insumo_id_fkey"
            columns: ["lote_insumo_id"]
            isOneToOne: false
            referencedRelation: "lotes_insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_producao_insumos_ordem_producao_id_fkey"
            columns: ["ordem_producao_id"]
            isOneToOne: false
            referencedRelation: "ordens_producao"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_producao_qualidade: {
        Row: {
          anexos_urls: string[] | null
          created_at: string
          data_teste: string
          descricao_teste: string
          farmaceutico_responsavel_id: string
          id: string
          observacoes: string | null
          ordem_producao_id: string
          resultado: string
          tipo_teste: string
          valor_esperado: string | null
          valor_obtido: string | null
        }
        Insert: {
          anexos_urls?: string[] | null
          created_at?: string
          data_teste?: string
          descricao_teste: string
          farmaceutico_responsavel_id: string
          id?: string
          observacoes?: string | null
          ordem_producao_id: string
          resultado: string
          tipo_teste: string
          valor_esperado?: string | null
          valor_obtido?: string | null
        }
        Update: {
          anexos_urls?: string[] | null
          created_at?: string
          data_teste?: string
          descricao_teste?: string
          farmaceutico_responsavel_id?: string
          id?: string
          observacoes?: string | null
          ordem_producao_id?: string
          resultado?: string
          tipo_teste?: string
          valor_esperado?: string | null
          valor_obtido?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_producao_qualidade_farmaceutico_responsavel_id_fkey"
            columns: ["farmaceutico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios_internos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_producao_qualidade_ordem_producao_id_fkey"
            columns: ["ordem_producao_id"]
            isOneToOne: false
            referencedRelation: "ordens_producao"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_producao: {
        Row: {
          created_at: string
          custo_total_estimado: number | null
          custo_total_real: number | null
          data_criacao: string
          data_fim_producao: string | null
          data_inicio_producao: string | null
          data_prevista_entrega: string | null
          farmaceutico_responsavel_id: string | null
          forma_farmaceutica: string | null
          id: string
          instrucoes_especiais: string | null
          is_deleted: boolean
          numero_ordem: string
          observacoes_gerais: string | null
          pedido_id: string | null
          prioridade: string
          quantidade_total: number
          receita_processada_id: string | null
          status: string
          tempo_estimado_minutos: number | null
          unidade_medida: string
          updated_at: string
          usuario_responsavel_id: string | null
        }
        Insert: {
          created_at?: string
          custo_total_estimado?: number | null
          custo_total_real?: number | null
          data_criacao?: string
          data_fim_producao?: string | null
          data_inicio_producao?: string | null
          data_prevista_entrega?: string | null
          farmaceutico_responsavel_id?: string | null
          forma_farmaceutica?: string | null
          id?: string
          instrucoes_especiais?: string | null
          is_deleted?: boolean
          numero_ordem: string
          observacoes_gerais?: string | null
          pedido_id?: string | null
          prioridade?: string
          quantidade_total: number
          receita_processada_id?: string | null
          status?: string
          tempo_estimado_minutos?: number | null
          unidade_medida: string
          updated_at?: string
          usuario_responsavel_id?: string | null
        }
        Update: {
          created_at?: string
          custo_total_estimado?: number | null
          custo_total_real?: number | null
          data_criacao?: string
          data_fim_producao?: string | null
          data_inicio_producao?: string | null
          data_prevista_entrega?: string | null
          farmaceutico_responsavel_id?: string | null
          forma_farmaceutica?: string | null
          id?: string
          instrucoes_especiais?: string | null
          is_deleted?: boolean
          numero_ordem?: string
          observacoes_gerais?: string | null
          pedido_id?: string | null
          prioridade?: string
          quantidade_total?: number
          receita_processada_id?: string | null
          status?: string
          tempo_estimado_minutos?: number | null
          unidade_medida?: string
          updated_at?: string
          usuario_responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_producao_farmaceutico_responsavel_id_fkey"
            columns: ["farmaceutico_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios_internos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_producao_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_producao_receita_processada_id_fkey"
            columns: ["receita_processada_id"]
            isOneToOne: false
            referencedRelation: "receitas_processadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_producao_usuario_responsavel_id_fkey"
            columns: ["usuario_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios_internos"
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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

// Tipos personalizados para facilitar o uso
export type Fornecedor = Tables<'fornecedores'>
export type FornecedorInsert = TablesInsert<'fornecedores'>
export type FornecedorUpdate = TablesUpdate<'fornecedores'>
export type FornecedorContato = Tables<'fornecedor_contatos'>
export type FornecedorDocumento = Tables<'fornecedor_documentos'>

// Tipos para ordens de produção
export type OrdemProducao = Tables<'ordens_producao'>
export type OrdemProducaoInsert = TablesInsert<'ordens_producao'>
export type OrdemProducaoUpdate = TablesUpdate<'ordens_producao'>
export type OrdemProducaoInsumo = Tables<'ordem_producao_insumos'>
export type OrdemProducaoEmbalagem = Tables<'ordem_producao_embalagens'>
export type OrdemProducaoEtapa = Tables<'ordem_producao_etapas'>
export type OrdemProducaoQualidade = Tables<'ordem_producao_qualidade'>
export type HistoricoStatusOrdem = Tables<'historico_status_ordens'>
