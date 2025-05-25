import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const BRASIL_API_BASE_URL = 'https://brasilapi.com.br/api'

interface CNPJData {
  cnpj: string
  identificador_matriz_filial: number
  descricao_matriz_filial: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  descricao_situacao_cadastral: string
  data_situacao_cadastral: string
  motivo_situacao_cadastral: number
  nome_cidade_exterior: string | null
  codigo_natureza_juridica: number
  data_inicio_atividade: string
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  descricao_tipo_logradouro: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  uf: string
  codigo_municipio: number
  municipio: string
  ddd_telefone_1: string
  ddd_telefone_2: string
  ddd_fax: string
  qualificacao_do_responsavel: number
  capital_social: number
  porte: string
  descricao_porte: string
  opcao_pelo_simples: boolean
  data_opcao_pelo_simples: string | null
  data_exclusao_do_simples: string | null
  opcao_pelo_mei: boolean
  situacao_especial: string | null
  data_situacao_especial: string | null
  qsa: Array<{
    identificador_de_socio: number
    nome_socio: string
    cnpj_cpf_do_socio: string
    codigo_qualificacao_socio: number
    percentual_capital_social: number
    data_entrada_sociedade: string
    cpf_representante_legal: string | null
    nome_representante_legal: string | null
    codigo_qualificacao_representante_legal: number | null
  }>
}

interface CPFData {
  cpf: string
  nome: string
  situacao: string
  nascimento: string
}

// Função para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '')
  
  if (cnpj.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false
  
  return true
}

// Função para validar CPF
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  return true
}

// Função para buscar dados do CNPJ
async function buscarDadosCNPJ(cnpj: string): Promise<any> {
  try {
    const response = await fetch(`${BRASIL_API_BASE_URL}/cnpj/v1/${cnpj}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: 'CNPJ não encontrado' }
      }
      throw new Error(`Erro na API: ${response.status}`)
    }
    
    const data: CNPJData = await response.json()
    
    // Verificar se a empresa está ativa (aceita 'ATIVA', 'ATIVO', case-insensitive)
    const situacao = (data.situacao_cadastral || '').toUpperCase();
    if (situacao !== 'ATIVA' && situacao !== 'ATIVO') {
      return {
        success: false,
        message: `Empresa não está ativa. Situação: ${data.descricao_situacao_cadastral || data.situacao_cadastral}`
      }
    }
    
    // Formatar os dados para retorno
    const endereco_completo = [
      data.descricao_tipo_logradouro,
      data.logradouro,
      data.numero,
      data.complemento,
      data.bairro
    ].filter(Boolean).join(' ')
    
    return {
      success: true,
      documento: data.cnpj,
      tipo_pessoa: 'PJ',
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia || null,
      endereco_completo: endereco_completo,
      cep: data.cep,
      municipio: data.municipio,
      uf: data.uf,
      telefone: data.ddd_telefone_1 || null,
      situacao_cadastral: data.descricao_situacao_cadastral,
      porte: data.descricao_porte,
      cnae_principal: {
        codigo: data.cnae_fiscal,
        descricao: data.cnae_fiscal_descricao
      },
      data_abertura: data.data_inicio_atividade,
      capital_social: data.capital_social,
      natureza_juridica: data.codigo_natureza_juridica
    }
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error)
    return {
      success: false,
      message: 'Erro ao consultar dados do CNPJ. Tente novamente mais tarde.'
    }
  }
}

// Função para buscar dados do CPF (limitada - apenas validação)
async function buscarDadosCPF(cpf: string): Promise<any> {
  // Nota: A Brasil API não oferece consulta completa de CPF por questões de privacidade
  // Apenas validamos se o CPF é válido
  
  if (!isValidCPF(cpf)) {
    return {
      success: false,
      message: 'CPF inválido'
    }
  }
  
  return {
    success: true,
    documento: cpf,
    tipo_pessoa: 'PF',
    message: 'CPF válido. Preencha os dados manualmente.'
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documento } = await req.json()
    
    if (!documento) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Documento é obrigatório'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // Remove caracteres não numéricos
    const documentoLimpo = documento.replace(/[^\d]/g, '')
    
    let resultado
    
    if (documentoLimpo.length === 14) {
      // É um CNPJ
      if (!isValidCNPJ(documentoLimpo)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'CNPJ inválido'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }
      
      resultado = await buscarDadosCNPJ(documentoLimpo)
    } else if (documentoLimpo.length === 11) {
      // É um CPF
      resultado = await buscarDadosCPF(documentoLimpo)
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Documento deve ser um CNPJ (14 dígitos) ou CPF (11 dígitos)'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    return new Response(
      JSON.stringify(resultado),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    console.error('Erro na função:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
}) 