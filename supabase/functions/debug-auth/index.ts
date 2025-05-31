import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Obter o usuário autenticado
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado', details: authError }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const debugInfo = {
      user_id: user.id,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Teste 1: Verificar se a tabela usuarios existe
    try {
      const { count, error: countError } = await supabaseClient
        .from('usuarios')
        .select('*', { count: 'exact', head: true })

      debugInfo.tests.table_exists = {
        success: !countError,
        count: count,
        error: countError?.message
      }
    } catch (e) {
      debugInfo.tests.table_exists = {
        success: false,
        error: e.message
      }
    }

    // Teste 2: Buscar usuário específico
    try {
      const { data: userData, error: userError } = await supabaseClient
        .from('usuarios')
        .select('id, email, nome, perfil_id, ativo, supabase_auth_id')
        .eq('supabase_auth_id', user.id)
        .maybeSingle()

      debugInfo.tests.user_lookup = {
        success: !userError,
        found: !!userData,
        data: userData ? {
          id: userData.id,
          email: userData.email,
          nome: userData.nome,
          perfil_id: userData.perfil_id,
          ativo: userData.ativo
        } : null,
        error: userError?.message
      }
    } catch (e) {
      debugInfo.tests.user_lookup = {
        success: false,
        error: e.message
      }
    }

    // Teste 3: Verificar perfis
    try {
      const { data: perfisData, error: perfisError } = await supabaseClient
        .from('perfis_usuario')
        .select('id, nome, tipo, dashboard_padrao')
        .limit(5)

      debugInfo.tests.perfis_lookup = {
        success: !perfisError,
        count: perfisData?.length || 0,
        data: perfisData,
        error: perfisError?.message
      }
    } catch (e) {
      debugInfo.tests.perfis_lookup = {
        success: false,
        error: e.message
      }
    }

    // Teste 4: Verificar se pode inserir usuário (teste de RLS)
    if (debugInfo.tests.user_lookup?.found === false) {
      try {
        // Buscar perfil PROPRIETARIO para usar como padrão
        const { data: perfilProprietario } = await supabaseClient
          .from('perfis_usuario')
          .select('id')
          .eq('tipo', 'PROPRIETARIO')
          .single()

        if (perfilProprietario) {
          const { data: newUser, error: insertError } = await supabaseClient
            .from('usuarios')
            .insert({
              email: user.email,
              nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
              perfil_id: perfilProprietario.id,
              supabase_auth_id: user.id,
              ativo: true
            })
            .select('id, email, nome')
            .single()

          debugInfo.tests.user_creation = {
            success: !insertError,
            data: newUser,
            error: insertError?.message
          }
        } else {
          debugInfo.tests.user_creation = {
            success: false,
            error: 'Perfil PROPRIETARIO não encontrado'
          }
        }
      } catch (e) {
        debugInfo.tests.user_creation = {
          success: false,
          error: e.message
        }
      }
    }

    // Teste 5: Verificar RLS policies
    try {
      const { data: rlsInfo, error: rlsError } = await supabaseClient
        .rpc('pg_get_userbyid', { userid: user.id })

      debugInfo.tests.rls_info = {
        success: !rlsError,
        data: rlsInfo,
        error: rlsError?.message
      }
    } catch (e) {
      debugInfo.tests.rls_info = {
        success: false,
        error: 'RPC não disponível'
      }
    }

    return new Response(
      JSON.stringify(debugInfo, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função debug-auth:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno',
        message: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 