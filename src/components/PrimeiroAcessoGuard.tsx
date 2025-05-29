import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PrimeiroAcessoGuardProps {
  children: React.ReactNode;
}

const PrimeiroAcessoGuard: React.FC<PrimeiroAcessoGuardProps> = ({ children }) => {
  const [verificando, setVerificando] = useState(true);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  useEffect(() => {
    // Timeout de segurança reduzido para 3 segundos
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout de segurança ativado - assumindo que não é primeiro acesso');
      setVerificando(false);
      setPrimeiroAcesso(false);
    }, 3000); // Reduzido de 5 para 3 segundos

    verificarPrimeiroAcesso().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  const verificarPrimeiroAcesso = async () => {
    try {
      console.log('🔍 Verificando se é o primeiro acesso...');

      // Verificação direta e simples com timeout mais curto
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos

      const { count: usuariosExistentes, error: countError } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (countError) {
        console.error('❌ Erro ao verificar usuários:', countError);
        // Em caso de erro, assumir que não é primeiro acesso
        setPrimeiroAcesso(false);
        console.log('🔄 Assumindo que não é primeiro acesso devido ao erro');
      } else {
        const isFirstAccess = !usuariosExistentes || usuariosExistentes === 0;
        console.log('✅ Verificação direta:', { usuariosExistentes, isFirstAccess });
        
        if (isFirstAccess) {
          console.log('🎯 Primeiro acesso detectado - redirecionando para cadastro inicial');
          setPrimeiroAcesso(true);
        } else {
          console.log('👤 Usuários já existem - permitindo acesso normal');
          setPrimeiroAcesso(false);
        }
      }

    } catch (error) {
      console.error('❌ Erro na verificação de primeiro acesso:', error);
      
      // Se for erro de abort/timeout, assumir que não é primeiro acesso
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('⏰ Timeout na verificação - assumindo que não é primeiro acesso');
      }
      
      setPrimeiroAcesso(false);
    } finally {
      setVerificando(false);
    }
  };

  // Loading state com timeout visual
  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-4">Verificando sistema...</p>
          <p className="text-xs text-gray-400 mt-2">Aguarde alguns segundos...</p>
          <div className="mt-4">
            <button 
              onClick={() => {
                console.log('🔄 Forçando bypass do primeiro acesso');
                setVerificando(false);
                setPrimeiroAcesso(false);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Pular verificação (Debug)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se é primeiro acesso, redirecionar para página de cadastro inicial
  if (primeiroAcesso) {
    console.log('🔀 Redirecionando para /primeiro-acesso');
    return <Navigate to="/primeiro-acesso" replace />;
  }

  // Caso contrário, renderizar os children normalmente
  console.log('✅ Renderizando children normalmente');
  return <>{children}</>;
};

export default PrimeiroAcessoGuard; 