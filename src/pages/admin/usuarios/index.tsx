
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, UserCheck, UserX, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Usuario {
  id: string;
  nome_completo: string;
  email_contato: string;
  cargo_perfil: string;
  ativo: boolean;
}

const UsuariosListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for activation/deactivation dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  
  // Query para buscar os usuários
  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios_internos')
        .select('*')
        .order('nome_completo', { ascending: true });
        
      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }
      
      return data as Usuario[];
    }
  });

  // Mutation para atualizar o status do usuário
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, newStatus }: { userId: string; newStatus: boolean }) => {
      const { error } = await supabase
        .from('usuarios_internos')
        .update({ ativo: newStatus })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, newStatus };
    },
    onSuccess: ({ newStatus }) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      
      toast({
        title: newStatus ? "Usuário ativado" : "Usuário desativado",
        description: newStatus ? 
          "O usuário foi reativado com sucesso." : 
          "O usuário foi desativado com sucesso.",
        variant: newStatus ? "success" : "default",
      });
      
      setStatusDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Erro ao atualizar status do usuário:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do usuário. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const handleToggleStatus = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setStatusDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (selectedUser) {
      toggleStatusMutation.mutate({ 
        userId: selectedUser.id, 
        newStatus: !selectedUser.ativo 
      });
    }
  };

  const handleNovoUsuario = () => {
    navigate('/admin/usuarios/novo');
  };

  const handleEditarUsuario = (id: string) => {
    navigate(`/admin/usuarios/editar/${id}`);
  };

  return (
    <>
      <AdminLayout>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
            <Button onClick={handleNovoUsuario}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-homeo-green" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              <p>Ocorreu um erro ao carregar os usuários.</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          ) : usuarios && usuarios.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo/Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[130px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome_completo}</TableCell>
                    <TableCell>{usuario.email_contato}</TableCell>
                    <TableCell>{usuario.cargo_perfil}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? "success" : "secondary"}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditarUsuario(usuario.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(usuario)}
                          disabled={toggleStatusMutation.isPending && selectedUser?.id === usuario.id}
                        >
                          {toggleStatusMutation.isPending && selectedUser?.id === usuario.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : usuario.ativo ? (
                            <UserX className="h-4 w-4 text-red-500" /> 
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md border">
              <Users className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </AdminLayout>

      {/* Activation/Deactivation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.ativo 
                ? "Desativar usuário" 
                : "Ativar usuário"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.ativo 
                ? `Tem certeza que deseja desativar o usuário ${selectedUser?.nome_completo}? Ele não poderá mais acessar o sistema.` 
                : `Tem certeza que deseja reativar o usuário ${selectedUser?.nome_completo}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmToggleStatus}
              className={selectedUser?.ativo 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : ""}
            >
              {toggleStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedUser?.ativo ? "Desativando..." : "Ativando..."}
                </>
              ) : (
                selectedUser?.ativo ? "Sim, desativar" : "Sim, reativar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UsuariosListPage;
