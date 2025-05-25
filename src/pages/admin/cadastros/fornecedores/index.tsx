import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Loader2, Search, Mail, Phone, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
import type { Fornecedor } from '@/integrations/supabase/types';

const FornecedoresPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State para gerenciar o diálogo de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null);
  
  // State para busca
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar dados de fornecedores do Supabase
  const {
    data: fornecedores,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('nome');

      if (error) throw new Error(error.message);
      return data as Fornecedor[];
    },
  });

  // Mutation para realizar a exclusão
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalida a query para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      
      // Mostra toast de sucesso
      toast({
        title: "Fornecedor excluído",
        description: "O fornecedor foi excluído com sucesso.",
        variant: "default",
      });
      
      // Fecha o diálogo de confirmação
      setDeleteDialogOpen(false);
      setFornecedorToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir fornecedor:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o fornecedor. Verifique se ele não está sendo usado em outros cadastros.",
        variant: "destructive",
      });
    }
  });

  // Filtrar fornecedores com base no termo de busca
  const filteredFornecedores = fornecedores?.filter((fornecedor) =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Função para navegar para a página de criação de fornecedores
  const handleNewFornecedor = () => {
    navigate('/admin/cadastros/fornecedores/novo');
  };

  // Função para navegar para a página de edição de fornecedores
  const handleEditFornecedor = (id: string) => {
    navigate(`/admin/cadastros/fornecedores/editar/${id}`);
  };

  // Função para iniciar o processo de exclusão
  const handleDeleteFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setDeleteDialogOpen(true);
  };

  // Função para confirmar a exclusão
  const confirmDelete = () => {
    if (fornecedorToDelete) {
      deleteMutation.mutate(fornecedorToDelete.id);
    }
  };

  // Render de estado de carregamento
  const renderLoading = () => (
    <>
      {Array(5).fill(null).map((_, index) => (
        <TableRow key={index}>
          {Array(6).fill(null).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  // Render de estado de erro
  const renderError = () => (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-destructive">
          <p className="font-semibold">Erro ao carregar fornecedores</p>
          <p className="text-sm">{(error as Error)?.message || 'Tente novamente mais tarde'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render de estado vazio (sem fornecedores)
  const renderEmpty = () => (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center">
          <p className="font-semibold">Nenhum fornecedor cadastrado</p>
          <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro fornecedor para iniciar o gerenciamento.</p>
          <Button onClick={handleNewFornecedor}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <AdminLayout>
        <div className="container-section py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="heading-lg">Gestão de Fornecedores</h1>
            <Button onClick={handleNewFornecedor}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </div>

          {/* Barra de busca */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de fornecedores */}
          <div className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && renderLoading()}
                {error && renderError()}
                {!isLoading && !error && filteredFornecedores.length === 0 && renderEmpty()}
                {!isLoading && !error && filteredFornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {fornecedor.nome}
                    </TableCell>
                    <TableCell>
                      {fornecedor.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{fornecedor.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fornecedor.telefone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{fornecedor.telefone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fornecedor.contato ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{fornecedor.contato}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {fornecedor.endereco ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-xs" title={fornecedor.endereco}>
                            {fornecedor.endereco}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFornecedor(fornecedor.id)}
                          title="Editar fornecedor"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFornecedor(fornecedor)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir fornecedor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminLayout>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o fornecedor "{fornecedorToDelete?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FornecedoresPage; 