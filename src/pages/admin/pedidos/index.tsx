
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, AlertTriangle, FileText, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Json } from '@/integrations/supabase/types';

interface Medication {
  name: string;
  dinamization?: string;
  form?: string;
  quantity?: number;
  dosage_instructions?: string;
}

interface ProcessedPrescription {
  id: string;
  raw_recipe_id: string;
  processed_at: string;
  patient_name: string | null;
  validation_status: string;
  medications: Medication[];
}

const PedidosPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<ProcessedPrescription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('receitas_processadas')
          .select('*')
          .order('processed_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform the data to ensure medications are properly typed
        const typedPrescriptions = data.map(item => {
          // Safely convert the medications JSON to our Medication[] type
          const medications = Array.isArray(item.medications) 
            ? item.medications.map((med: any) => ({
                name: med.name || '',
                dinamization: med.dinamization,
                form: med.form,
                quantity: med.quantity,
                dosage_instructions: med.dosage_instructions
              }))
            : [];
            
          return {
            id: item.id,
            raw_recipe_id: item.raw_recipe_id,
            processed_at: item.processed_at,
            patient_name: item.patient_name,
            validation_status: item.validation_status,
            medications: medications
          };
        });

        setPrescriptions(typedPrescriptions);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Não foi possível carregar as receitas processadas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return (
          <div className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
            <Check className="h-3 w-3" />
            <span>Validado</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            <span>Rejeitado</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            <span>Pendente</span>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <AdminLayout>
      <div className="container-section py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="heading-lg">Pedidos</h1>
          <Link to="/admin/pedidos/nova-receita">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-homeo-accent" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">Erro ao carregar dados</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-lg font-medium mb-4">Nenhum pedido encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Comece adicionando uma nova receita para criar seu primeiro pedido.
            </p>
            <Link to="/admin/pedidos/nova-receita">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="overflow-hidden">
                <div className="bg-gray-50 border-b px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="text-homeo-accent h-4 w-4" />
                    <span className="font-medium">
                      {prescription.patient_name || 'Paciente sem nome'}
                    </span>
                  </div>
                  {getStatusBadge(prescription.validation_status)}
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Data</h3>
                      <p>{formatDate(prescription.processed_at)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Medicamentos</h3>
                      <p>{prescription.medications.length} item(s)</p>
                      <ul className="mt-1 space-y-1">
                        {prescription.medications.slice(0, 2).map((med, index) => (
                          <li key={index} className="text-sm text-muted-foreground truncate">
                            • {med.name} {med.dinamization || ''}
                          </li>
                        ))}
                        {prescription.medications.length > 2 && (
                          <li className="text-sm text-homeo-accent">
                            + {prescription.medications.length - 2} mais...
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="flex justify-start md:justify-end items-center">
                      <Link to={`/admin/pedidos/${prescription.id}`}>
                        <Button variant="outline" size="sm">
                          Visualizar detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PedidosPage;
