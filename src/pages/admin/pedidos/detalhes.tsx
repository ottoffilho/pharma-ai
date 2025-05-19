import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Medication {
  name: string;
  dinamization?: string;
  form?: string;
  quantity?: number;
  unit?: string;
  dosage_instructions?: string;
}

interface ProcessedPrescription {
  id: string;
  raw_recipe_id: string;
  processed_at: string;
  patient_name: string | null;
  patient_dob: string | null;
  prescriber_name: string | null;
  prescriber_identifier: string | null;
  medications: Medication[];
  validation_status: string;
  validation_notes: string | null;
}

interface OrderData {
  id: string;
  status: string;
  payment_status: string;
  // Other order fields if needed
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'awaiting_quote', label: 'Aguardando Orçamento' },
  { value: 'quote_sent', label: 'Orçamento Enviado' },
  { value: 'awaiting_approval', label: 'Aguardando Aprovação Cliente' },
  { value: 'approved', label: 'Pedido Aprovado' },
  { value: 'awaiting_payment', label: 'Aguardando Pagamento' },
  { value: 'payment_confirmed', label: 'Pagamento Confirmado' },
  { value: 'in_progress', label: 'Em Manipulação' },
  { value: 'ready_for_pickup', label: 'Pronto para Retirada' },
  { value: 'ready_for_delivery', label: 'Pronto para Entrega' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'canceled', label: 'Cancelado' }
];

const PrescriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<ProcessedPrescription | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch prescription details
  const prescriptionQuery = useQuery({
    queryKey: ['prescription', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data, error } = await supabase
        .from('receitas_processadas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data to ensure medications are properly typed
      const transformedMedications = Array.isArray(data.medications) 
        ? data.medications.map((med: any) => ({
            name: med.name || '',
            dinamization: med.dinamization,
            form: med.form,
            quantity: med.quantity,
            unit: med.unit || 'unidades',
            dosage_instructions: med.dosage_instructions
          }))
        : [];

      // Create a properly typed ProcessedPrescription object
      const typedPrescription: ProcessedPrescription = {
        id: data.id,
        raw_recipe_id: data.raw_recipe_id,
        processed_at: data.processed_at,
        patient_name: data.patient_name,
        patient_dob: data.patient_dob,
        prescriber_name: data.prescriber_name,
        prescriber_identifier: data.prescriber_identifier,
        medications: transformedMedications,
        validation_status: data.validation_status,
        validation_notes: data.validation_notes
      };

      return typedPrescription;
    },
    enabled: Boolean(id),
    meta: {
      onSuccess: (data: ProcessedPrescription) => {
        setPrescription(data);
        setIsLoading(false);
      },
      onError: (err: any) => {
        console.error('Error fetching prescription:', err);
        setError('Não foi possível carregar os detalhes da receita.');
        toast({
          title: "Erro ao carregar receita",
          description: err.message || "Ocorreu um erro ao carregar os detalhes da receita.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  });

  // Query to fetch order details
  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      // Find order where processed_recipe_id matches the current prescription id
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('processed_recipe_id', id)
        .single();

      if (error) throw error;

      return data as OrderData;
    },
    enabled: Boolean(id),
    meta: {
      onSuccess: (data: OrderData) => {
        setSelectedStatus(data.status);
      }
    }
  });

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!orderQuery.data?.id) {
        throw new Error('ID do pedido não encontrado');
      }

      // Get current user ID for history
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Start a transaction to update both tables
      // 1. Update the order status
      const { data: updatedOrder, error: updateError } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', orderQuery.data.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      // 2. Add a record to the history table
      const historyRecord = {
        pedido_id: orderQuery.data.id,
        status_anterior: orderQuery.data.status,
        status_novo: newStatus,
        usuario_id: userId,
        observacao: null // Could add an optional note field in the future
      };
      
      const { error: historyError } = await supabase
        .from('historico_status_pedidos')
        .insert(historyRecord);
        
      if (historyError) throw historyError;
      
      return updatedOrder;
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: `O status do pedido foi atualizado para "${STATUS_OPTIONS.find(opt => opt.value === selectedStatus)?.label || selectedStatus}"`,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao atualizar o status do pedido.",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não informada';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <Badge variant="success">
            Validado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="warning">
            Pendente
          </Badge>
        );
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Rascunho</Badge>;
      case 'awaiting_quote':
      case 'quote_sent':
      case 'awaiting_approval':
      case 'awaiting_payment':
        return <Badge variant="warning">
          {STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
        </Badge>;
      case 'approved':
      case 'payment_confirmed':
      case 'in_progress':
        return <Badge variant="info">
          {STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
        </Badge>;
      case 'ready_for_pickup':
      case 'ready_for_delivery':
      case 'shipped':
      case 'delivered':
        return <Badge variant="success">
          {STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
        </Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Use the direct data from useQuery instead of relying solely on state variables
    if (prescriptionQuery.data) {
      setPrescription(prescriptionQuery.data);
      setIsLoading(false);
    }
    
    if (orderQuery.data) {
      setSelectedStatus(orderQuery.data.status);
    }
    
    if (prescriptionQuery.error) {
      console.error('Error fetching prescription:', prescriptionQuery.error);
      setError('Não foi possível carregar os detalhes da receita.');
      setIsLoading(false);
    }
  }, [prescriptionQuery.data, prescriptionQuery.error, orderQuery.data]);

  if (isLoading || prescriptionQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="container-section py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-homeo-accent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || prescriptionQuery.error || !prescription) {
    return (
      <AdminLayout>
        <div className="container-section py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-xl font-semibold mb-2">Receita não encontrada</h2>
            <p className="text-muted-foreground mb-4">{error || "Esta receita não existe ou foi removida."}</p>
            <Link to="/admin/pedidos">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista de pedidos
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-section py-8">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Link to="/admin/pedidos" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de pedidos
            </Link>
            <h1 className="heading-lg">Detalhes da Receita</h1>
          </div>
          <div className="print:hidden">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Status and Date Card */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status da Receita</h3>
                  <div className="mt-1">{getStatusBadge(prescription.validation_status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status do Pedido</h3>
                  <div className="mt-1">
                    {orderQuery.data ? (
                      getOrderStatusBadge(orderQuery.data.status)
                    ) : (
                      <Badge variant="outline">Pedido não encontrado</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Processamento</h3>
                  <p>{formatDate(prescription.processed_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ID da Receita</h3>
                  <p className="text-xs text-muted-foreground font-mono">{prescription.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Card */}
          {orderQuery.data && (
            <Card>
              <CardHeader>
                <CardTitle>Atualizar Status do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-2/3">
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um novo status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isPending || selectedStatus === orderQuery.data.status}
                    className="w-full sm:w-auto"
                  >
                    {updateStatusMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Atualizar Status
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient and Prescriber Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Paciente e Prescritor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Paciente</h3>
                  <p className="text-lg font-medium mb-1">{prescription.patient_name || 'Nome não informado'}</p>
                  <p className="text-sm text-muted-foreground">
                    Data de Nascimento: {prescription.patient_dob ? formatDate(prescription.patient_dob) : 'Não informada'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Prescritor</h3>
                  <p className="text-lg font-medium mb-1">{prescription.prescriber_name || 'Nome não informado'}</p>
                  <p className="text-sm text-muted-foreground">
                    Identificação: {prescription.prescriber_identifier || 'Não informada'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos Prescritos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Dinamização</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Instruções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescription.medications.map((medication, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{medication.name}</TableCell>
                      <TableCell>{medication.dinamization || '-'}</TableCell>
                      <TableCell>{medication.form || '-'}</TableCell>
                      <TableCell>{medication.quantity || 0} {medication.unit || 'unidades'}</TableCell>
                      <TableCell>{medication.dosage_instructions || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Validation Notes */}
          {prescription.validation_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas de Validação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{prescription.validation_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PrescriptionDetailsPage;
