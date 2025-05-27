import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Database, Check, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';

export function RecuperacaoTabelas() {
  const { toast } = useToast();
  const [status, setStatus] = useState<'verificando' | 'criando' | 'completo' | 'erro'>('verificando');
  const [progresso, setProgresso] = useState(0);
  const [mensagem, setMensagem] = useState('Verificando tabelas...');
  const [tabelasFaltantes, setTabelasFaltantes] = useState<string[]>([]);
  const [sqlParaCriar, setSqlParaCriar] = useState<string | null>(null);
  
  // Lista de tabelas essenciais
  const tabelasEssenciais = [
    'ordens_producao',
    // Adicione outras tabelas que podem estar faltando
  ];

  // Verificar se as tabelas existem
  const verificarTabelas = async () => {
    setStatus('verificando');
    setMensagem('Verificando tabelas no banco de dados...');
    setProgresso(10);
    
    try {
      const faltantes: string[] = [];
      
      // Verificar cada tabela
      for (const tabela of tabelasEssenciais) {
        try {
          // Tentar acessar a tabela
          const { count, error } = await supabase
            .from(tabela)
            .select('*', { count: 'exact', head: true });
            
          if (error) {
            console.log(`Tabela ${tabela} não encontrada:`, error);
            faltantes.push(tabela);
          }
        } catch (error) {
          console.log(`Erro ao verificar tabela ${tabela}:`, error);
          faltantes.push(tabela);
        }
        
        setProgresso(prev => prev + (80 / tabelasEssenciais.length));
      }
      
      setTabelasFaltantes(faltantes);
      setProgresso(100);
      
      if (faltantes.length > 0) {
        setMensagem(`${faltantes.length} tabela(s) precisam ser criadas.`);
      } else {
        setMensagem('Todas as tabelas estão presentes no banco de dados.');
        setStatus('completo');
      }
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      setMensagem('Erro ao verificar tabelas no banco de dados.');
      setStatus('erro');
    }
  };
  
  // Criar tabelas faltantes
  const criarTabelas = async () => {
    setStatus('criando');
    setProgresso(0);
    setMensagem('Criando tabelas faltantes...');
    
    for (let i = 0; i < tabelasFaltantes.length; i++) {
      const tabela = tabelasFaltantes[i];
      setMensagem(`Criando tabela: ${tabela}...`);
      
      try {
        // Criar SQL para a tabela ordens_producao
        let sqlCode = '';
        
        if (tabela === 'ordens_producao') {
          sqlCode = `
            CREATE TABLE IF NOT EXISTS ordens_producao (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              codigo TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pendente',
              data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              data_conclusao TIMESTAMP WITH TIME ZONE,
              pedido_id UUID REFERENCES pedidos(id),
              farmaceutico_responsavel_id UUID REFERENCES usuarios(id),
              observacoes TEXT,
              prioridade TEXT DEFAULT 'normal',
              etapa_atual TEXT DEFAULT 'aguardando',
              is_deleted BOOLEAN DEFAULT FALSE
            );
            
            -- Índices
            CREATE INDEX IF NOT EXISTS idx_ordens_producao_pedido_id ON ordens_producao(pedido_id);
            CREATE INDEX IF NOT EXISTS idx_ordens_producao_farmaceutico_id ON ordens_producao(farmaceutico_responsavel_id);
            CREATE INDEX IF NOT EXISTS idx_ordens_producao_status ON ordens_producao(status);
            CREATE INDEX IF NOT EXISTS idx_ordens_producao_data_criacao ON ordens_producao(data_criacao);
            
            -- RLS (Row Level Security)
            ALTER TABLE ordens_producao ENABLE ROW LEVEL SECURITY;
            
            -- Políticas de segurança
            CREATE POLICY "Usuários autenticados podem ver ordens" 
              ON ordens_producao 
              FOR SELECT 
              TO authenticated 
              USING (true);
            
            CREATE POLICY "Farmacêuticos e administradores podem inserir ordens" 
              ON ordens_producao 
              FOR INSERT 
              TO authenticated 
              WITH CHECK (
                EXISTS (
                  SELECT 1 FROM usuarios u
                  JOIN perfis p ON u.perfil_id = p.id
                  WHERE u.id = auth.uid() AND 
                  (p.tipo = 'farmaceutico' OR p.tipo = 'administrador' OR p.tipo = 'proprietario')
                )
              );
            
            CREATE POLICY "Farmacêuticos e administradores podem atualizar ordens" 
              ON ordens_producao 
              FOR UPDATE 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM usuarios u
                  JOIN perfis p ON u.perfil_id = p.id
                  WHERE u.id = auth.uid() AND 
                  (p.tipo = 'farmaceutico' OR p.tipo = 'administrador' OR p.tipo = 'proprietario')
                )
              );
            
            CREATE POLICY "Farmacêuticos e administradores podem deletar ordens" 
              ON ordens_producao 
              FOR DELETE 
              TO authenticated 
              USING (
                EXISTS (
                  SELECT 1 FROM usuarios u
                  JOIN perfis p ON u.perfil_id = p.id
                  WHERE u.id = auth.uid() AND 
                  (p.tipo = 'farmaceutico' OR p.tipo = 'administrador' OR p.tipo = 'proprietario')
                )
              );
          `;
        }
        
        // Executar SQL para criar tabela
        if (sqlCode) {
          const { error } = await supabase.rpc('exec_sql', { sql: sqlCode });
          
          if (error) {
            // Se o erro for que a função exec_sql não existe, fornecer instruções para criar manualmente
            if (error.message.includes('function') && error.message.includes('does not exist')) {
              console.error('Função exec_sql não existe no banco de dados');
              setMensagem(`Para criar a tabela manualmente, acesse o dashboard do Supabase e execute o SQL fornecido abaixo:`);
              
              // Definir o SQL para exibição na interface
              setSqlParaCriar(sqlCode);
              
              // Copiar para área de transferência
              navigator.clipboard.writeText(sqlCode).then(() => {
                toast({
                  title: "SQL copiado para a área de transferência",
                  description: "Cole o código no SQL Editor do Supabase para criar a tabela manualmente",
                });
              }).catch(err => {
                console.error('Erro ao copiar para área de transferência:', err);
              });
              
              setStatus('erro');
              return;
            } else {
              console.error(`Erro ao criar tabela ${tabela}:`, error);
              setMensagem(`Erro ao criar tabela ${tabela}: ${error.message}`);
              setStatus('erro');
              return;
            }
          }
        } else {
          setMensagem(`SQL não definido para a tabela ${tabela}`);
          setStatus('erro');
          return;
        }
        
        setProgresso(Math.round((i + 1) / tabelasFaltantes.length * 100));
      } catch (error) {
        console.error(`Erro ao criar tabela ${tabela}:`, error);
        setMensagem(`Erro ao criar tabela ${tabela}`);
        setStatus('erro');
        return;
      }
    }
    
    setMensagem('Todas as tabelas foram criadas com sucesso!');
    setStatus('completo');
    toast({
      title: "Recuperação concluída",
      description: "As tabelas foram criadas com sucesso. O sistema agora deve funcionar normalmente.",
    });
  };
  
  // Iniciar verificação ao montar o componente
  useEffect(() => {
    verificarTabelas();
  }, []);
  
  return (
    <Card className="w-[600px] max-w-full shadow-lg">
      <CardHeader className={status === 'erro' ? 'bg-red-50' : status === 'completo' ? 'bg-green-50' : 'bg-blue-50'}>
        <div className="flex items-center gap-2">
          {status === 'erro' ? (
            <AlertTriangle className="h-6 w-6 text-red-600" />
          ) : status === 'completo' ? (
            <Check className="h-6 w-6 text-green-600" />
          ) : (
            <Database className="h-6 w-6 text-blue-600" />
          )}
          <CardTitle>Recuperação de Tabelas</CardTitle>
        </div>
        <CardDescription>
          {status === 'erro' ? 'Erro ao verificar ou criar tabelas' : 
           status === 'completo' ? 'Tabelas verificadas com sucesso' : 
           'Verificando e criando tabelas ausentes'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Alert variant={status === 'erro' ? "destructive" : "default"} className="mb-4">
            <AlertTitle>
              {status === 'verificando' ? 'Verificando tabelas' : 
               status === 'criando' ? 'Criando tabelas' :
               status === 'completo' ? 'Operação concluída' : 'Erro'}
            </AlertTitle>
            <AlertDescription>
              {mensagem}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
          
          {tabelasFaltantes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Tabelas faltantes:</h4>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {tabelasFaltantes.map(tabela => (
                  <li key={tabela}>{tabela}</li>
                ))}
              </ul>
            </div>
          )}
          
          {sqlParaCriar && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">SQL para criar tabela:</h4>
              <div className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-64 border">
                <pre className="whitespace-pre-wrap">{sqlParaCriar}</pre>
              </div>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(sqlParaCriar);
                    toast({
                      title: "SQL copiado",
                      description: "O código SQL foi copiado para a área de transferência"
                    });
                  }}
                >
                  Copiar SQL
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 mt-4">
        {tabelasFaltantes.length > 0 && status !== 'criando' && (
          <Button 
            onClick={criarTabelas} 
            className="w-full"
            disabled={status === 'criando'}
          >
            {status === 'criando' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Criando Tabelas...
              </>
            ) : (
              'Criar Tabelas Faltantes'
            )}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={verificarTabelas}
          disabled={status === 'verificando' || status === 'criando'}
        >
          {status === 'verificando' ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar Novamente'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 