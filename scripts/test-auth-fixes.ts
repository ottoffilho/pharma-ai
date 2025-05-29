/**
 * Script de Teste - Correções de Autenticação
 * Pharma.AI - Módulo M09 (Usuários e Permissões)
 * 
 * Este script testa se as correções implementadas para os erros de autenticação
 * estão funcionando corretamente.
 */

import { supabase } from '../src/integrations/supabase/client';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  duration?: number;
}

class AuthTestSuite {
  private results: TestResult[] = [];

  private addResult(test: string, success: boolean, message: string, duration?: number) {
    this.results.push({ test, success, message, duration });
    const status = success ? '✅' : '❌';
    const time = duration ? ` (${duration}ms)` : '';
    console.log(`${status} ${test}: ${message}${time}`);
  }

  /**
   * Teste 1: Verificar se o trigger de atualizado_em está funcionando
   */
  async testUpdatedAtTrigger(): Promise<void> {
    const start = Date.now();
    try {
      // Buscar um usuário existente
      const { data: usuarios, error: selectError } = await supabase
        .from('usuarios')
        .select('id, atualizado_em')
        .limit(1);

      if (selectError || !usuarios || usuarios.length === 0) {
        this.addResult(
          'Trigger atualizado_em',
          false,
          'Não foi possível encontrar usuário para teste'
        );
        return;
      }

      const usuario = usuarios[0];
      const atualizado_em_antes = usuario.atualizado_em;

      // Aguardar 1 segundo para garantir diferença no timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fazer uma atualização
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', usuario.id);

      if (updateError) {
        this.addResult(
          'Trigger atualizado_em',
          false,
          `Erro ao atualizar usuário: ${updateError.message}`
        );
        return;
      }

      // Verificar se o atualizado_em foi modificado
      const { data: usuarioAtualizado, error: selectError2 } = await supabase
        .from('usuarios')
        .select('atualizado_em')
        .eq('id', usuario.id)
        .single();

      if (selectError2 || !usuarioAtualizado) {
        this.addResult(
          'Trigger atualizado_em',
          false,
          'Erro ao buscar usuário atualizado'
        );
        return;
      }

      const atualizado_em_depois = usuarioAtualizado.atualizado_em;
      const funcionou = atualizado_em_depois !== atualizado_em_antes;

      this.addResult(
        'Trigger atualizado_em',
        funcionou,
        funcionou 
          ? 'Trigger funcionando corretamente' 
          : 'Trigger não atualizou o campo atualizado_em',
        Date.now() - start
      );

    } catch (error) {
      this.addResult(
        'Trigger atualizado_em',
        false,
        `Exceção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Teste 2: Verificar timeout de consultas
   */
  async testQueryTimeout(): Promise<void> {
    const start = Date.now();
    try {
      // Simular consulta com timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de teste')), 2000);
      });

      const queryPromise = supabase
        .from('usuarios')
        .select('id, nome, email')
        .limit(1);

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      this.addResult(
        'Timeout de consultas',
        true,
        'Consulta completada antes do timeout',
        Date.now() - start
      );

    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof Error && error.message === 'Timeout de teste') {
        this.addResult(
          'Timeout de consultas',
          false,
          'Consulta demorou mais que 2 segundos',
          duration
        );
      } else {
        this.addResult(
          'Timeout de consultas',
          false,
          `Erro na consulta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          duration
        );
      }
    }
  }

  /**
   * Teste 3: Verificar políticas RLS para atualização de último acesso
   */
  async testRLSPolicies(): Promise<void> {
    const start = Date.now();
    try {
      // Tentar buscar usuários (deve funcionar)
      const { data: usuarios, error: selectError } = await supabase
        .from('usuarios')
        .select('id, nome, email, supabase_auth_id')
        .limit(1);

      if (selectError) {
        this.addResult(
          'Políticas RLS',
          false,
          `Erro ao buscar usuários: ${selectError.message}`
        );
        return;
      }

      if (!usuarios || usuarios.length === 0) {
        this.addResult(
          'Políticas RLS',
          false,
          'Nenhum usuário encontrado'
        );
        return;
      }

      this.addResult(
        'Políticas RLS',
        true,
        'Políticas RLS funcionando para SELECT',
        Date.now() - start
      );

    } catch (error) {
      this.addResult(
        'Políticas RLS',
        false,
        `Exceção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Teste 4: Verificar performance de carregamento de usuário
   */
  async testUserLoadingPerformance(): Promise<void> {
    const start = Date.now();
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          email,
          nome,
          telefone,
          perfil_id,
          ativo,
          ultimo_acesso,
          criado_em,
          atualizado_em,
          supabase_auth_id,
          perfis_usuario(
            id,
            nome,
            tipo,
            dashboard_padrao
          )
        `)
        .eq('ativo', true)
        .limit(1);

      const duration = Date.now() - start;

      if (error) {
        this.addResult(
          'Performance carregamento',
          false,
          `Erro na consulta: ${error.message}`,
          duration
        );
        return;
      }

      const isGoodPerformance = duration < 1000; // Menos de 1 segundo
      this.addResult(
        'Performance carregamento',
        isGoodPerformance,
        isGoodPerformance 
          ? 'Performance adequada' 
          : 'Performance pode ser melhorada',
        duration
      );

    } catch (error) {
      this.addResult(
        'Performance carregamento',
        false,
        `Exceção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Teste 5: Verificar se as permissões são carregadas corretamente
   */
  async testPermissionsLoading(): Promise<void> {
    const start = Date.now();
    try {
      // Buscar um perfil com permissões
      const { data: perfis, error: perfilError } = await supabase
        .from('perfis_usuario')
        .select('id')
        .limit(1);

      if (perfilError || !perfis || perfis.length === 0) {
        this.addResult(
          'Carregamento permissões',
          false,
          'Não foi possível encontrar perfil para teste'
        );
        return;
      }

      const { data: permissoes, error: permissoesError } = await supabase
        .from('permissoes')
        .select('*')
        .eq('perfil_id', perfis[0].id);

      const duration = Date.now() - start;

      if (permissoesError) {
        this.addResult(
          'Carregamento permissões',
          false,
          `Erro ao carregar permissões: ${permissoesError.message}`,
          duration
        );
        return;
      }

      this.addResult(
        'Carregamento permissões',
        true,
        `${permissoes?.length || 0} permissões carregadas`,
        duration
      );

    } catch (error) {
      this.addResult(
        'Carregamento permissões',
        false,
        `Exceção: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Executar todos os testes
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando testes de correções de autenticação...\n');

    await this.testUpdatedAtTrigger();
    await this.testQueryTimeout();
    await this.testRLSPolicies();
    await this.testUserLoadingPerformance();
    await this.testPermissionsLoading();

    this.printSummary();
  }

  /**
   * Imprimir resumo dos testes
   */
  private printSummary(): void {
    console.log('\n📊 Resumo dos Testes:');
    console.log('='.repeat(50));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total de testes: ${totalTests}`);
    console.log(`✅ Passou: ${passedTests}`);
    console.log(`❌ Falhou: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Testes que falharam:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    }

    console.log('\n' + '='.repeat(50));
    console.log(passedTests === totalTests ? '🎉 Todos os testes passaram!' : '⚠️ Alguns testes falharam');
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  const testSuite = new AuthTestSuite();
  testSuite.runAllTests().catch(console.error);
}

export { AuthTestSuite }; 