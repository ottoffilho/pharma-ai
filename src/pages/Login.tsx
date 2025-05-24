import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { AuthError } from '@supabase/supabase-js';
import { checkLoginAttempts, recordLoginAttempt } from '@/lib/auth-utils';
import PharmaHorizonLogo from '@/assets/logo/phama-horizon.png';
import LoginBackground from '@/assets/images/loginback2.jpg';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginBlocked, setLoginBlocked] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async (): Promise<void> => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erro ao buscar sessão:", error.message);
      }
      if (session) {
        navigate('/admin/pedidos');
      }
    };
    checkSession();
  }, [navigate]);

  // Verificar status de bloqueio quando o email mudar
  useEffect(() => {
    if (email) {
      const { canLogin, message } = checkLoginAttempts(email);
      setLoginBlocked(canLogin ? null : message || "Conta temporariamente bloqueada devido a muitas tentativas.");
    } else {
      setLoginBlocked(null);
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o login está bloqueado
    const { canLogin, message } = checkLoginAttempts(email);
    if (!canLogin) {
      toast({
        title: "Acesso bloqueado",
        description: message || "Muitas tentativas falhas. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setLoginBlocked(message || null);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Registrar login bem-sucedido
      recordLoginAttempt(email, true);

      toast({
        title: "Login realizado com sucesso!",
        description: "Você está sendo redirecionado para a área administrativa.",
      });
      navigate('/admin/pedidos');
    } catch (errUntyped: unknown) {
      const err = errUntyped as AuthError;

      // Registrar tentativa falha
      recordLoginAttempt(email, false);
      
      // Registrar o erro detalhado apenas para depuração
      console.error("Erro detalhado de login:", err);
      
      // Verificar novamente após a tentativa falha
      const { canLogin, message } = checkLoginAttempts(email);
      if (!canLogin) {
        setLoginBlocked(message || null);
      }
      
      // Mensagem genérica para o usuário
      toast({
        title: "Erro ao realizar login",
        description: loginBlocked || err.message || "Credenciais inválidas ou problema no servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${LoginBackground})` }}
    >
      <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <img src={PharmaHorizonLogo} alt="Pharma.AI Horizon Logo" className="w-32 h-auto mx-auto mb-6" />
          <CardDescription>
            Bem-vindo! Faça login para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            {loginBlocked && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {loginBlocked}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || !!loginBlocked}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
