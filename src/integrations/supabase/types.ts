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
      clientes: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          cpf: string | null
          created_at: string | null
          dados_adicionais: Json | null
          data_cadastro_sistema: string
          data_nascimento: string | null
          email: string | null
          estado: string | null
          id: string
          logradouro: string | null
          nome_fantasia: string | null
          nome_parceiro: string | null
          nome_razao_social: string
          numero_endereco: string | null
          proprietario_user_id: string
          telefone_principal: string | null
          tipo_pessoa: Database["public"]["Enums"]["enum_tipo_pessoa"]
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          dados_adicionais?: Json | null
          data_cadastro_sistema?: string
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome_fantasia?: string | null
          nome_parceiro?: string | null
          nome_razao_social: string
          numero_endereco?: string | null
          proprietario_user_id: string
          telefone_principal?: string | null
          tipo_pessoa: Database["public"]["Enums"]["enum_tipo_pessoa"]
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string | null
          dados_adicionais?: Json | null
          data_cadastro_sistema?: string
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome_fantasia?: string | null
          nome_parceiro?: string | null
          nome_razao_social?: string
          numero_endereco?: string | null
          proprietario_user_id?: string
          telefone_principal?: string | null
          tipo_pessoa?: Database["public"]["Enums"]["enum_tipo_pessoa"]
          updated_at?: string | null
        }
        Relationships: []
      }
      distribuidoras: {
        Row: {
          created_at: string | null
          estados_atuacao: string[] | null
          id: string
          nome: string
          nome_fantasia: string | null
          observacoes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estados_atuacao?: string[] | null
          id?: string
          nome: string
          nome_fantasia?: string | null
          observacoes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estados_atuacao?: string[] | null
          id?: string
          nome?: string
          nome_fantasia?: string | null
          observacoes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      modelos_inversores: {
        Row: {
          corrente_max_entrada_a: number | null
          created_at: string | null
          datasheet_url: string | null
          eficiencia_maxima: number | null
          fabricante: string
          faixa_tensao_mppt_v: string | null
          frequencia_saida_hz: string | null
          garantia_anos: number | null
          id: string
          modelo: string
          numero_mppts: number | null
          observacoes: string | null
          potencia_nominal_kw: number
          tensao_entrada_max_cc_v: number | null
          tensao_saida_ca_nominal_v: string
          tipo_inversor: string | null
          updated_at: string | null
        }
        Insert: {
          corrente_max_entrada_a?: number | null
          created_at?: string | null
          datasheet_url?: string | null
          eficiencia_maxima?: number | null
          fabricante: string
          faixa_tensao_mppt_v?: string | null
          frequencia_saida_hz?: string | null
          garantia_anos?: number | null
          id?: string
          modelo: string
          numero_mppts?: number | null
          observacoes?: string | null
          potencia_nominal_kw: number
          tensao_entrada_max_cc_v?: number | null
          tensao_saida_ca_nominal_v: string
          tipo_inversor?: string | null
          updated_at?: string | null
        }
        Update: {
          corrente_max_entrada_a?: number | null
          created_at?: string | null
          datasheet_url?: string | null
          eficiencia_maxima?: number | null
          fabricante?: string
          faixa_tensao_mppt_v?: string | null
          frequencia_saida_hz?: string | null
          garantia_anos?: number | null
          id?: string
          modelo?: string
          numero_mppts?: number | null
          observacoes?: string | null
          potencia_nominal_kw?: number
          tensao_entrada_max_cc_v?: number | null
          tensao_saida_ca_nominal_v?: string
          tipo_inversor?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plantas_solares: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cliente_id: string | null
          complemento: string | null
          created_at: string | null
          data_instalacao: string | null
          estado: string | null
          id: string
          id_externo_principal: string | null
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          nome_planta: string
          numero_endereco: string | null
          observacoes: string | null
          potencia_instalada_kwp: number
          proprietario_user_id: string
          sistema_externo_tipo: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          created_at?: string | null
          data_instalacao?: string | null
          estado?: string | null
          id?: string
          id_externo_principal?: string | null
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome_planta: string
          numero_endereco?: string | null
          observacoes?: string | null
          potencia_instalada_kwp: number
          proprietario_user_id: string
          sistema_externo_tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          created_at?: string | null
          data_instalacao?: string | null
          estado?: string | null
          id?: string
          id_externo_principal?: string | null
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome_planta?: string
          numero_endereco?: string | null
          observacoes?: string | null
          potencia_instalada_kwp?: number
          proprietario_user_id?: string
          sistema_externo_tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plantas_solares_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cnpj_admin: string | null
          cpf_admin: string | null
          created_at: string | null
          data_nascimento_admin: string | null
          email_comercial_admin: string | null
          endereco_fiscal_bairro_admin: string | null
          endereco_fiscal_cep_admin: string | null
          endereco_fiscal_cidade_admin: string | null
          endereco_fiscal_complemento_admin: string | null
          endereco_fiscal_estado_admin: string | null
          endereco_fiscal_numero_admin: string | null
          endereco_fiscal_rua_admin: string | null
          full_name: string | null
          id: string
          inscricao_estadual_admin: string | null
          inscricao_municipal_admin: string | null
          nome_completo_admin: string | null
          nome_fantasia_admin: string | null
          phone: string | null
          razao_social_admin: string | null
          telefone_comercial_admin: string | null
          tipo_entidade_admin:
            | Database["public"]["Enums"]["tipo_entidade_admin_enum"]
            | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          cnpj_admin?: string | null
          cpf_admin?: string | null
          created_at?: string | null
          data_nascimento_admin?: string | null
          email_comercial_admin?: string | null
          endereco_fiscal_bairro_admin?: string | null
          endereco_fiscal_cep_admin?: string | null
          endereco_fiscal_cidade_admin?: string | null
          endereco_fiscal_complemento_admin?: string | null
          endereco_fiscal_estado_admin?: string | null
          endereco_fiscal_numero_admin?: string | null
          endereco_fiscal_rua_admin?: string | null
          full_name?: string | null
          id: string
          inscricao_estadual_admin?: string | null
          inscricao_municipal_admin?: string | null
          nome_completo_admin?: string | null
          nome_fantasia_admin?: string | null
          phone?: string | null
          razao_social_admin?: string | null
          telefone_comercial_admin?: string | null
          tipo_entidade_admin?:
            | Database["public"]["Enums"]["tipo_entidade_admin_enum"]
            | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          cnpj_admin?: string | null
          cpf_admin?: string | null
          created_at?: string | null
          data_nascimento_admin?: string | null
          email_comercial_admin?: string | null
          endereco_fiscal_bairro_admin?: string | null
          endereco_fiscal_cep_admin?: string | null
          endereco_fiscal_cidade_admin?: string | null
          endereco_fiscal_complemento_admin?: string | null
          endereco_fiscal_estado_admin?: string | null
          endereco_fiscal_numero_admin?: string | null
          endereco_fiscal_rua_admin?: string | null
          full_name?: string | null
          id?: string
          inscricao_estadual_admin?: string | null
          inscricao_municipal_admin?: string | null
          nome_completo_admin?: string | null
          nome_fantasia_admin?: string | null
          phone?: string | null
          razao_social_admin?: string | null
          telefone_comercial_admin?: string | null
          tipo_entidade_admin?:
            | Database["public"]["Enums"]["tipo_entidade_admin_enum"]
            | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      unidades_consumidoras: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          cliente_id: string | null
          complemento: string | null
          created_at: string | null
          data_cadastro_sistema: string
          distribuidora_id: string | null
          estado: string | null
          fonte_dados_geracao:
            | Database["public"]["Enums"]["enum_fonte_dados_geracao"]
            | null
          id: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          nome_identificador: string | null
          numero_endereco: string | null
          numero_uc: string
          percentual_rateio_creditos: number | null
          planta_solar_id: string | null
          proprietario_user_id: string
          tipo_uc: Database["public"]["Enums"]["enum_tipo_uc"]
          uc_geradora_principal_id: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          created_at?: string | null
          data_cadastro_sistema?: string
          distribuidora_id?: string | null
          estado?: string | null
          fonte_dados_geracao?:
            | Database["public"]["Enums"]["enum_fonte_dados_geracao"]
            | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome_identificador?: string | null
          numero_endereco?: string | null
          numero_uc: string
          percentual_rateio_creditos?: number | null
          planta_solar_id?: string | null
          proprietario_user_id: string
          tipo_uc?: Database["public"]["Enums"]["enum_tipo_uc"]
          uc_geradora_principal_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          created_at?: string | null
          data_cadastro_sistema?: string
          distribuidora_id?: string | null
          estado?: string | null
          fonte_dados_geracao?:
            | Database["public"]["Enums"]["enum_fonte_dados_geracao"]
            | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome_identificador?: string | null
          numero_endereco?: string | null
          numero_uc?: string
          percentual_rateio_creditos?: number | null
          planta_solar_id?: string | null
          proprietario_user_id?: string
          tipo_uc?: Database["public"]["Enums"]["enum_tipo_uc"]
          uc_geradora_principal_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_consumidoras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_consumidoras_distribuidora_id_fkey"
            columns: ["distribuidora_id"]
            isOneToOne: false
            referencedRelation: "distribuidoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_consumidoras_planta_solar_id_fkey"
            columns: ["planta_solar_id"]
            isOneToOne: false
            referencedRelation: "plantas_solares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_consumidoras_uc_geradora_principal_id_fkey"
            columns: ["uc_geradora_principal_id"]
            isOneToOne: false
            referencedRelation: "unidades_consumidoras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      enum_fonte_dados_geracao:
        | "NENHUMA"
        | "SAJ"
        | "GROWATT"
        | "MANUAL"
        | "OUTRA"
      enum_tipo_pessoa: "PF" | "PJ"
      enum_tipo_uc:
        | "CONSUMIDORA_LOCAL"
        | "GERADORA_PRINCIPAL"
        | "BENEFICIARIA_CREDITOS"
      tipo_entidade_admin_enum: "PF" | "PJ"
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
    Enums: {
      enum_fonte_dados_geracao: [
        "NENHUMA",
        "SAJ",
        "GROWATT",
        "MANUAL",
        "OUTRA",
      ],
      enum_tipo_pessoa: ["PF", "PJ"],
      enum_tipo_uc: [
        "CONSUMIDORA_LOCAL",
        "GERADORA_PRINCIPAL",
        "BENEFICIARIA_CREDITOS",
      ],
      tipo_entidade_admin_enum: ["PF", "PJ"],
    },
  },
} as const
