
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Trash2, Save, ArrowRight, FileText, Image, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Medication {
  name: string;
  dinamization?: string;
  form?: string;
  quantity?: number;
  dosage_instructions?: string;
}

interface PrescriptionData {
  medications: Medication[];
  patient_name?: string;
  patient_dob?: string;
  prescriber_name?: string;
  prescriber_identifier?: string;
}

interface PrescriptionReviewFormProps {
  initialData: PrescriptionData;
  onSubmit: (data: PrescriptionData) => void;
  originalFiles: File[];
}

const PrescriptionReviewForm: React.FC<PrescriptionReviewFormProps> = ({ 
  initialData, 
  onSubmit,
  originalFiles 
}) => {
  const [formData, setFormData] = useState<PrescriptionData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Preview file functionality
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);

  React.useEffect(() => {
    // Generate preview for the first file
    if (originalFiles.length > 0) {
      const file = originalFiles[0];
      if (file.type.includes('image')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [originalFiles]);

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { name: '', dinamization: '', form: '', quantity: 1, dosage_instructions: '' }
      ]
    });
  };

  const handleRemoveMedication = (index: number) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: any) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const handleChange = (field: keyof Omit<PrescriptionData, 'medications'>, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const validateForm = () => {
    // Basic validation - check that all medications have at least a name
    if (formData.medications.length === 0) {
      toast({
        title: "Validação falhou",
        description: "Adicione pelo menos um medicamento à receita",
        variant: "destructive",
      });
      return false;
    }
    
    for (const med of formData.medications) {
      if (!med.name || med.name.trim() === '') {
        toast({
          title: "Validação falhou",
          description: "Todos os medicamentos devem ter um nome",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setReviewComplete(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: "Receita validada com sucesso",
        description: "Os dados foram salvos e um pedido foi criado",
      });
    } catch (error) {
      setReviewComplete(false);
      toast({
        title: "Erro ao salvar receita",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (reviewComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-semibold">Receita Validada com Sucesso!</h2>
        <p className="text-muted-foreground">
          Os dados foram salvos e um pedido foi criado com base nesta receita.
        </p>
        <Button onClick={() => window.location.href = '/admin/pedidos'} className="mt-4">
          Ver Lista de Pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Validação de Receita</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
          Dados Extraídos pela IA
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original prescription preview */}
        <div>
          <h3 className="text-lg font-medium mb-2">Receita Original</h3>
          
          {previewUrl ? (
            <div className="border rounded-md overflow-hidden h-64">
              <img 
                src={previewUrl} 
                alt="Receita" 
                className="w-full h-full object-contain bg-gray-100"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center border rounded-md h-64 bg-gray-50">
              {originalFiles.length > 0 && (
                <div className="flex flex-col items-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>{originalFiles[0].name}</span>
                  <a 
                    href={URL.createObjectURL(originalFiles[0])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-homeo-blue mt-2"
                  >
                    Abrir arquivo
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {originalFiles.length > 1 && (
                <>Mais {originalFiles.length - 1} arquivo(s) anexado(s)</>
              )}
            </p>
          </div>
        </div>

        {/* Patient and prescriber info */}
        <div>
          <h3 className="text-lg font-medium mb-2">Informações Gerais</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Nome do Paciente</label>
                <Input 
                  value={formData.patient_name || ''}
                  onChange={(e) => handleChange('patient_name', e.target.value)}
                  placeholder="Nome completo do paciente"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Data de Nascimento</label>
                <Input 
                  type="date" 
                  value={formData.patient_dob || ''}
                  onChange={(e) => handleChange('patient_dob', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Nome do Prescritor</label>
                <Input 
                  value={formData.prescriber_name || ''}
                  onChange={(e) => handleChange('prescriber_name', e.target.value)}
                  placeholder="Nome do médico/prescritor"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Identificação do Prescritor (CRM)</label>
                <Input 
                  value={formData.prescriber_identifier || ''}
                  onChange={(e) => handleChange('prescriber_identifier', e.target.value)}
                  placeholder="Ex: CRM 12345-SP"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Medications section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Medicamentos</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddMedication}
            type="button"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Adicionar Medicamento
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.medications.map((medication, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Medicamento {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveMedication(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Nome <span className="text-red-500">*</span></label>
                    <Input 
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      placeholder="Nome do medicamento"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Dinamização</label>
                    <Input 
                      value={medication.dinamization || ''}
                      onChange={(e) => handleMedicationChange(index, 'dinamization', e.target.value)}
                      placeholder="Ex: 30CH"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Forma</label>
                    <Input 
                      value={medication.form || ''}
                      onChange={(e) => handleMedicationChange(index, 'form', e.target.value)}
                      placeholder="Ex: Glóbulos, Gotas"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Quantidade</label>
                    <Input 
                      type="number" 
                      value={medication.quantity || ''}
                      onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || undefined)}
                      placeholder="Quantidade"
                      min="1"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Posologia / Instruções</label>
                    <Textarea 
                      value={medication.dosage_instructions || ''}
                      onChange={(e) => handleMedicationChange(index, 'dosage_instructions', e.target.value)}
                      placeholder="Instruções de uso"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {formData.medications.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">Nenhum medicamento adicionado</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddMedication}
                type="button"
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Adicionar Medicamento
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => onSubmit(initialData)}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving || formData.medications.length === 0}
          className="min-w-[180px]"
        >
          {isSaving ? (
            <>Processando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Validar e Criar Pedido
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionReviewForm;
