import React, { useEffect, useState, useCallback } from 'react';
import { AuthService } from '@/modules/usuarios-permissoes/services/authService';
import { supabase } from '@/integrations/supabase/client';

const DebugAuth: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuth = useCallback(async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🔍 Iniciando teste de autenticação...');
      
      // Verificar sessão atual
      const { data: { user }, error } = await supabase.auth.getUser();
      addLog(`👤 Usuário na sessão: ${user ? user.email : 'Nenhum'}`);
      
      if (error) {
        addLog(`❌ Erro na sessão: ${error.message}`);
      }
      
      if (user) {
        addLog(`🔍 Testando obterUsuarioCompleto para: ${user.id}`);
        const usuarioCompleto = await AuthService.obterUsuarioCompleto(user.id);
        addLog(`👤 Usuário completo: ${usuarioCompleto ? 'Encontrado' : 'Não encontrado'}`);
        
        if (usuarioCompleto) {
          addLog(`✅ Nome: ${usuarioCompleto.nome}`);
          addLog(`✅ Email: ${usuarioCompleto.email}`);
          addLog(`✅ Ativo: ${usuarioCompleto.ativo}`);
          addLog(`✅ Perfil: ${usuarioCompleto.perfil?.nome || 'Sem perfil'}`);
          addLog(`✅ Permissões: ${usuarioCompleto.perfil?.permissoes?.length || 0}`);
        }
        
        addLog(`🔍 Testando obterUsuarioAtual...`);
        const usuarioAtual = await AuthService.obterUsuarioAtual();
        addLog(`👤 Usuário atual: ${usuarioAtual ? 'Encontrado' : 'Não encontrado'}`);
        
        if (usuarioAtual) {
          addLog(`✅ Dashboard: ${usuarioAtual.dashboard}`);
          addLog(`✅ Permissões: ${usuarioAtual.permissoes.length}`);
        }
      }
      
    } catch (error) {
      addLog(`❌ Erro no teste: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const forceLogin = async () => {
    try {
      addLog('🔐 Forçando login...');
      const result = await supabase.auth.signInWithPassword({
        email: 'ottof6@gmail.com',
        password: 'sua_senha_aqui' // Substitua pela senha correta
      });
      
      if (result.error) {
        addLog(`❌ Erro no login: ${result.error.message}`);
      } else {
        addLog(`✅ Login realizado com sucesso`);
        await testAuth();
      }
    } catch (error) {
      addLog(`❌ Erro ao forçar login: ${error}`);
    }
  };

  useEffect(() => {
    const run = async () => {
      console.log('🔍 Executando teste de autenticação...');
      await testAuth();
    };
    run();
  }, [testAuth]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug de Autenticação</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={testAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Auth'}
        </button>
        
        <button
          onClick={forceLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Forçar Login
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h2 className="font-bold mb-2">Logs:</h2>
        {logs.map((log, index) => (
          <div key={index} className="text-sm font-mono mb-1">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500">Nenhum log ainda...</div>
        )}
      </div>
    </div>
  );
};

export default DebugAuth; 