import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/modules/usuarios-permissoes/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';

// Schema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, autenticado, carregando } = useAuth();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [fazendoLogin, setFazendoLogin] = useState(false);

  // Se já está autenticado, redireciona para o dashboard
  if (autenticado) {
    return <Navigate to="/admin" replace />;
  }

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFazendoLogin(true);
    try {
      const resultado = await login(data.email, data.senha);
      
      if (resultado.sucesso) {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Redirecionando para seu dashboard...',
        });
        
        // O DashboardRouter irá automaticamente direcionar para o dashboard correto
        navigate('/admin');
      } else {
        toast({
          title: 'Erro no login',
          description: resultado.erro || 'Credenciais inválidas',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setFazendoLogin(false);
    }
  };

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharma.AI</h1>
          <p className="text-gray-600">Sistema de Gestão para Farmácias de Manipulação</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fazer Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo Senha */}
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={mostrarSenha ? 'text' : 'password'}
                            placeholder="Sua senha"
                            autoComplete="current-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={toggleMostrarSenha}
                          >
                            {mostrarSenha ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botão de Login */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={fazendoLogin}
                >
                  {fazendoLogin ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>

                {/* Link para recuperar senha */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={() => navigate('/esqueci-senha')}
                  >
                    Esqueci minha senha
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Informações de demonstração */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Contas de Demonstração</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <strong>Proprietário:</strong> proprietario@farmacia.com / 123456
              </div>
              <div>
                <strong>Farmacêutico:</strong> farmaceutico@farmacia.com / 123456
              </div>
              <div>
                <strong>Atendente:</strong> atendente@farmacia.com / 123456
              </div>
              <div>
                <strong>Manipulador:</strong> manipulador@farmacia.com / 123456
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
