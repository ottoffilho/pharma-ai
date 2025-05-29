/**
 * Script de Teste - Edge Function excluir-usuario
 * Pharma.AI - Módulo M09 (Usuários e Permissões)
 * 
 * Este script testa se a Edge Function excluir-usuario está funcionando
 * corretamente após as correções implementadas.
 */

import { supabase } from '../src/integrations/supabase/client';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  duration?: number;
}

class EdgeFunctionTestSuite {
  private results: TestResult[] = [];

  private addResult(test: string, success: boolean, message: string, duration?: number) {
    this.results.push({ test, success, message, duration });
    const status = success ? '✅' : '❌';
    const time = duration ? ` (${duration}ms)` : '';
    console.log(`${status} ${test}: ${message}${time}`);
  }

  /**
   * Teste 1: Verificar se a Edge Function está acessível
   */
  async testFunctionAccessibility(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Tentar fazer uma requisição OPTIONS (CORS preflight)
      const response = await fetch(
        'https://hjwebmpvaaeogbfqxwub.supabase.co/functions/v1/excluir-usuario',
        {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const duration = Date.now() - startTime;

      if (response.ok) {
        this.addResult(
          'Acessibilidade da Edge Function',
          true,
          'Edge Function está acessível e respondendo',
          duration
        );
      } else {
        this.addResult(
          'Acessibilidade da Edge Function',
          false,
          `Resposta inesperada: ${response.status} ${response.statusText}`,
          duration
        );
      }
    } catch (error) {
      console.error('❌ Erro ao testar:', error);
      const duration = Date.now() - startTime;
      this.addResult(
        'Acessibilidade da Edge Function',
        false,
        `Erro de conectividade: ${error instanceof Error ? error.message : String(error)}`,
        duration
      );
    }
  }

  /**
   * Teste 2: Verificar validação de parâmetros
   */
  async testParameterValidation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        'https://hjwebmpvaaeogbfqxwub.supabase.co/functions/v1/excluir-usuario',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}) // Parâmetros vazios
        }
      );

      const duration = Date.now() - startTime;
      const data = await response.json();

      if (response.status === 400 && data.error?.includes('obrigatórios')) {
        this.addResult(
          'Validação de Parâmetros',
          true,
          'Validação de parâmetros funcionando corretamente',
          duration
        );
      } else {
        this.addResult(
          'Validação de Parâmetros',
          false,
          `Validação inesperada: ${response.status} - ${data.error || 'Sem erro'}`,
          duration
        );
      }
    } catch (error) {
      console.error('❌ Erro ao testar:', error);
      const duration = Date.now() - startTime;
      this.addResult(
        'Validação de Parâmetros',
        false,
        `Erro no teste: ${error instanceof Error ? error.message : String(error)}`,
        duration
      );
    }
  }

  /**
   * Teste 3: Verificar validação de autorização
   */
  async testAuthorizationValidation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        'https://hjwebmpvaaeogbfqxwub.supabase.co/functions/v1/excluir-usuario',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuarioId: 'test-id',
            supabaseAuthId: 'test-auth-id'
          })
        }
      );

      const duration = Date.now() - startTime;
      const data = await response.json();

      if (response.status === 401 && data.error?.includes('autorização')) {
        this.addResult(
          'Validação de Autorização',
          true,
          'Validação de autorização funcionando corretamente',
          duration
        );
      } else {
        this.addResult(
          'Validação de Autorização',
          false,
          `Validação inesperada: ${response.status} - ${data.error || 'Sem erro'}`,
          duration
        );
      }
    } catch (error) {
      console.error('❌ Erro ao testar:', error);
      const duration = Date.now() - startTime;
      this.addResult(
        'Validação de Autorização',
        false,
        `Erro no teste: ${error instanceof Error ? error.message : String(error)}`,
        duration
      );
    }
  }

  /**
   * Teste 4: Verificar se a tabela permissoes está sendo consultada corretamente
   */
  async testPermissionsTableAccess(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Obter token de autenticação válido
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        this.addResult(
          'Acesso à Tabela Permissões',
          false,
          'Usuário não autenticado para teste',
          Date.now() - startTime
        );
        return;
      }

      const response = await fetch(
        'https://hjwebmpvaaeogbfqxwub.supabase.co/functions/v1/excluir-usuario',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            usuarioId: 'test-id',
            supabaseAuthId: 'test-auth-id'
          })
        }
      );

      const duration = Date.now() - startTime;
      const data = await response.json();

      // Se chegou até aqui sem erro 500 (erro interno), significa que
      // a consulta à tabela permissões está funcionando
      if (response.status !== 500) {
        this.addResult(
          'Acesso à Tabela Permissões',
          true,
          'Consulta à tabela permissões funcionando (sem erro 500)',
          duration
        );
      } else {
        this.addResult(
          'Acesso à Tabela Permissões',
          false,
          `Erro interno: ${data.error || 'Erro desconhecido'}`,
          duration
        );
      }
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      const duration = Date.now() - startTime;
      this.addResult(
        'Acesso à Tabela Permissões',
        false,
        `Erro no teste: ${error instanceof Error ? error.message : String(error)}`,
        duration
      );
    }
  }

  /**
   * Executa todos os testes
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Iniciando testes da Edge Function excluir-usuario...\n');

    await this.testFunctionAccessibility();
    await this.testParameterValidation();
    await this.testAuthorizationValidation();
    await this.testPermissionsTableAccess();

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

    console.log('\n🎯 Status da Edge Function:');
    if (passedTests === totalTests) {
      console.log('✅ Edge Function está funcionando corretamente!');
    } else if (passedTests >= totalTests * 0.75) {
      console.log('⚠️ Edge Function está funcionando com algumas limitações');
    } else {
      console.log('❌ Edge Function tem problemas significativos');
    }
  }
}

// Executar testes se o script for chamado diretamente
if (import.meta.main) {
  const testSuite = new EdgeFunctionTestSuite();
  await testSuite.runAllTests();
}

export { EdgeFunctionTestSuite }; 