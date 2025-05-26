import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { testBucketAccess } from "@/services/supabase";

const BucketTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  useEffect(() => {
    async function testarStorage() {
      setTestResults([]);
      addResult("=== TESTE DE STORAGE SUPABASE ===");
      
      // 1. Verificar sessão atual
      addResult("1. Verificando sessão...");
      const { data: { session } } = await supabase.auth.getSession();
      addResult(`Sessão ativa: ${!!session}`);
      
      if (!session) {
        addResult("2. Tentando autenticação automática para teste...");
        // Tentar login com credenciais de desenvolvimento (se existirem no .env)
        const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
        const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
        
        if (demoEmail && demoPassword) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPassword,
            });
            
            if (error) {
              addResult(`Erro na autenticação: ${error.message}`);
            } else {
              addResult("Autenticação automática: SUCESSO");
            }
          } catch (error) {
            addResult(`Erro na autenticação: ${error}`);
          }
        } else {
          addResult("Credenciais de demo não configuradas no .env");
        }
      }
      
      // 3. Testar acesso específico ao bucket nf-xml
      addResult("3. Testando acesso ao bucket nf-xml...");
      const bucketAcessivel = await testBucketAccess('nf-xml');
      addResult(`Bucket nf-xml acessível: ${bucketAcessivel}`);
      
      // 4. Listar buckets (pode falhar devido a RLS)
      addResult("4. Tentando listar buckets...");
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        addResult(`Aviso - Não foi possível listar buckets: ${bucketError.message}`);
      } else {
        addResult(`Buckets encontrados: ${buckets?.length || 0}`);
        if (buckets && buckets.length > 0) {
          buckets.forEach(bucket => {
            addResult(`  - ${bucket.name} (público: ${bucket.public})`);
          });
        }
      }
      
      // 5. Testar upload de um arquivo pequeno de teste
      addResult("5. Testando upload de arquivo de teste...");
      try {
        const testFile = new File(['teste'], 'teste.txt', { type: 'text/plain' });
        const { data, error } = await supabase.storage
          .from('nf-xml')
          .upload(`test/${Date.now()}_teste.txt`, testFile);
        
        if (error) {
          addResult(`Erro no upload de teste: ${error.message}`);
        } else {
          addResult("Upload de teste: SUCESSO");
          
          // Limpar arquivo de teste
          await supabase.storage
            .from('nf-xml')
            .remove([data.path]);
          addResult("Arquivo de teste removido");
        }
      } catch (error) {
        addResult(`Erro no teste de upload: ${error}`);
      }
      
      addResult("=== FIM DO TESTE ===");
    }
    
    testarStorage();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      fontSize: '11px',
      zIndex: 9999,
      maxWidth: '350px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <strong>🔍 Teste de Storage</strong><br/>
      {testResults.map((result, index) => (
        <div key={index} style={{ marginBottom: '2px' }}>
          {result}
        </div>
      ))}
    </div>
  );
};

export default BucketTest;