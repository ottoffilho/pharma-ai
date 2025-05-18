
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
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

  const handleExcluir = (id: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exclusão de usuários será implementada em breve.",
      variant: "default"
    });
  };

  const handleNovoUsuario = () => {
    navigate('/admin/usuarios/novo');
  };

  const handleEditarUsuario = (id: string) => {
    navigate(`/admin/usuarios/editar/${id}`);
  };

  return (
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
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome_completo}</TableCell>
                  <TableCell>{usuario.email_contato}</TableCell>
                  <TableCell>{usuario.cargo_perfil}</TableCell>
                  <TableCell>
                    <Badge variant={usuario.ativo ? "default" : "secondary"}>
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
                        onClick={() => handleExcluir(usuario.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
  );
};

export default UsuariosListPage;
