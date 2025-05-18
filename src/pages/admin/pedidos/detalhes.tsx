
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
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

const PrescriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prescription, setPrescription] = useState<ProcessedPrescription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('receitas_processadas')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setPrescription(data as ProcessedPrescription);
      } catch (err: any) {
        console.error('Error fetching prescription:', err);
        setError('Não foi possível carregar os detalhes da receita.');
        toast({
          title: "Erro ao carregar receita",
          description: err.message || "Ocorreu um erro ao carregar os detalhes da receita.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescription();
  }, [id, toast]);

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
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Validado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendente
          </Badge>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
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

  if (error || !prescription) {
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <div className="mt-1">{getStatusBadge(prescription.validation_status)}</div>
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
