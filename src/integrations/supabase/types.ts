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
          data: string
          descricao: string
          id: string
          observacoes: string | null
          pedido_id: string | null
          tipo_movimentacao: string
          usuario_id: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          tipo_movimentacao: string
          usuario_id?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
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
