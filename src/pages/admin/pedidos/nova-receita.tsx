
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, Image, FileArchive, File, X, Loader2, 
  CheckCircle, AlertTriangle, Calendar, Split, Eye, Plus, Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import FileUploadDropzone from '@/components/FileUploadDropzone';
import AdminLayout from '@/components/layouts/AdminLayout';
import PrescriptionReviewForm from '@/components/PrescriptionReviewForm';
import { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import PatientPrescriberInfo from '@/components/prescription/PatientPrescriberInfo';
import MedicationsSection from '@/components/prescription/MedicationsSection';
import ValidationSection from '@/components/prescription/ValidationSection';
import OriginalPrescriptionPreview from '@/components/prescription/OriginalPrescriptionPreview';

interface Medication {
  name: string;
  dinamization?: string;
  form?: string;
  quantity?: number;
  unit?: string;
  dosage_instructions?: string;
}

interface IAExtractedData {
  medications: Medication[];
  patient_name?: string;
  patient_dob?: string;
  prescriber_name?: string;
  prescriber_identifier?: string;
}

// Mock data to simulate IA response
const mockIAResponse: IAExtractedData = {
  medications: [
    {
      name: "Arnica Montana",
      dinamization: "30CH",
      form: "Glóbulos",
      quantity: 10,
      unit: "unidades",
      dosage_instructions: "5 glóbulos, 3x ao dia"
    },
    {
      name: "Belladonna",
      dinamization: "6CH",
      form: "Glóbulos",
      quantity: 5,
      unit: "unidades",
      dosage_instructions: "3 glóbulos antes de dormir"
    }
  ],
  patient_name: "Maria Silva",
  patient_dob: "1985-06-15",
  prescriber_name: "Dr. João Santos",
  prescriber_identifier: "CRM 12345-SP"
};

const NovaReceitaPage: React.FC = () => {
  const [uploadMethod, setUploadMethod] = useState<'upload_arquivo' | 'digitacao'>('upload_arquivo');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [extractedData, setExtractedData] = useState<IAExtractedData | null>(null);
  const [uploadedRecipeId, setUploadedRecipeId] = useState<string | null>(null);
  const [showValidationArea, setShowValidationArea] = useState(false);
  const [validationView, setValidationView] = useState<'split' | 'preview'>('split');
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationNotes, setValidationNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [rawRecipeId, setRawRecipeId] = useState<string>('mock-recipe-id-' + Date.now());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Modo de desenvolvimento para mostrar a interface diretamente
  const [devMode, setDevMode] = useState(true);

  // Se estiver em modo de desenvolvimento, mostrar a área de validação com dados mockados
  React.useEffect(() => {
    if (devMode) {
      setExtractedData(mockIAResponse);
      setShowValidationArea(true);
      setProcessStatus('success');
    }
  }, [devMode]);

  const handleFilesChange = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    // Reset states when new files are added
    setProcessStatus('idle');
    setExtractedData(null);
    setUploadedRecipeId(null);
    setShowValidationArea(false);
    setValidationProgress(0);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcessarReceita = async () => {
    if (files.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione pelo menos um arquivo para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProcessStatus('processing');
    
    try {
      // Modo de desenvolvimento - pular autenticação
      let lastUploadedRecipeId = 'mock-recipe-id-' + Date.now();
      setUploadedRecipeId(lastUploadedRecipeId);
      
      // Simulate AI processing with progress updates
      const progressInterval = setInterval(() => {
        setValidationProgress(prev => {
          const newProgress = prev + (5 + Math.random() * 10);
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);
      
      // Simulate AI processing completion after a delay
      setTimeout(() => {
        clearInterval(progressInterval);
        setValidationProgress(100);
        setIsProcessing(false);
        setProcessStatus('success');
        setExtractedData(mockIAResponse);
        setShowValidationArea(true);
        
        toast({
          title: "Processamento concluído",
          description: "A IA extraiu os dados da receita com sucesso.",
        });
      }, 2500);
      
    } catch (error: any) {
      setProcessStatus('error');
      toast({
        title: "Erro ao processar a receita",
        description: error.message || "Ocorreu um erro ao enviar os arquivos. Tente novamente.",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle medication changes
  const handleMedicationChange = (index: number, field: keyof Medication, value: any) => {
    if (extractedData) {
      const updatedData = { ...extractedData };
      updatedData.medications[index] = {
        ...updatedData.medications[index],
        [field]: value
      };
      setExtractedData(updatedData);
    }
  };

  // Handle adding new medication
  const handleAddMedication = () => {
    if (extractedData) {
      const updatedData = { ...extractedData };
      updatedData.medications = [
        ...updatedData.medications,
        { 
          name: '', 
          dinamization: '', 
          form: '', 
          quantity: 1, 
          unit: 'unidades',
          dosage_instructions: '' 
        }
      ];
      setExtractedData(updatedData);
    }
  };

  // Handle removing medication
  const handleRemoveMedication = (index: number) => {
    if (extractedData) {
      const updatedData = { ...extractedData };
      updatedData.medications = updatedData.medications.filter((_, i) => i !== index);
      setExtractedData(updatedData);
    }
  };

  // Handle patient data changes - Fixed the type issue
  const handlePatientChange = (field: string, value: string) => {
    if (extractedData) {
      const updatedData = { ...extractedData } as IAExtractedData;
      if (field === 'patient_name' || field === 'patient_dob') {
        (updatedData as any)[field] = value;
      }
      setExtractedData(updatedData);
    }
  };

  // Handle prescriber data changes - Fixed the type issue
  const handlePrescriberChange = (field: string, value: string) => {
    if (extractedData) {
      const updatedData = { ...extractedData } as IAExtractedData;
      if (field === 'prescriber_name' || field === 'prescriber_identifier') {
        (updatedData as any)[field] = value;
      }
      setExtractedData(updatedData);
    }
  };

  const handleSaveProcessedRecipe = async () => {
    if (!extractedData) return;

    setIsSaving(true);
    
    try {
      // Get current user ID - for development purposes using a mock ID
      // In production, this would be fetched from Supabase Auth
      const mockUserId = '00000000-0000-0000-0000-000000000000'; // Mock user ID for dev
      
      // Prepare data for receitas_processadas
      const processedRecipeData = {
        raw_recipe_id: rawRecipeId,
        processed_by_user_id: mockUserId,
        // Cast medications array to Json type to satisfy TypeScript
        medications: extractedData.medications as unknown as Json,
        patient_name: extractedData.patient_name || null,
        patient_dob: extractedData.patient_dob || null,
        prescriber_name: extractedData.prescriber_name || null,
        prescriber_identifier: extractedData.prescriber_identifier || null,
        validation_status: 'validated',
        validation_notes: validationNotes || null
      };

      // Check if a processed recipe already exists for this raw recipe ID
      const { data: existingProcessedRecipe, error: fetchError } = await supabase
        .from('receitas_processadas')
        .select('id')
        .eq('raw_recipe_id', rawRecipeId)
        .maybeSingle();

      let processedRecipeId;
      
      if (fetchError) {
        throw new Error(`Error checking for existing processed recipe: ${fetchError.message}`);
      }

      // Update or insert the processed recipe
      if (existingProcessedRecipe?.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('receitas_processadas')
          .update(processedRecipeData)
          .eq('id', existingProcessedRecipe.id);

        if (updateError) {
          throw new Error(`Error updating processed recipe: ${updateError.message}`);
        }
        
        processedRecipeId = existingProcessedRecipe.id;
      } else {
        // Insert new record
        const { data: newProcessedRecipe, error: insertError } = await supabase
          .from('receitas_processadas')
          .insert(processedRecipeData)
          .select('id')
          .single();

        if (insertError) {
          throw new Error(`Error creating processed recipe: ${insertError.message}`);
        }
        
        processedRecipeId = newProcessedRecipe.id;
      }

      // Create a draft order linked to the processed recipe
      const orderData = {
        processed_recipe_id: processedRecipeId,
        created_by_user_id: mockUserId,
        channel: 'web',
        status: 'draft',
        payment_status: 'pending',
        notes: validationNotes || null,
        metadata: {
          source: 'prescription_validation',
          patient_name: extractedData.patient_name,
          medications_count: extractedData.medications.length
        }
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('pedidos')
        .insert(orderData)
        .select('id')
        .single();

      if (orderError) {
        throw new Error(`Error creating draft order: ${orderError.message}`);
      }

      toast({
        title: "Receita validada com sucesso",
        description: "Um rascunho de pedido foi criado e está pronto para orçamentação.",
      });

      // Navigate to orders page after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/pedidos');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving validated prescription:', error);
      toast({
        title: "Erro ao salvar dados validados",
        description: error.message || "Ocorreu um erro ao salvar os dados validados.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleValidationView = () => {
    setValidationView(validationView === 'split' ? 'preview' : 'split');
  };

  const handleCancelValidation = () => {
    // Navigate back to the orders list
    navigate('/admin/pedidos');
  };

  // Generate preview URL for the first file if it's an image
  const previewUrl = React.useMemo(() => {
    if (files.length > 0 && files[0].type.includes('image')) {
      return URL.createObjectURL(files[0]);
    }
    return null;
  }, [files]);

  // Simulate processing on mount for development mode
  useEffect(() => {
    if (devMode) {
      setRawRecipeId('mock-recipe-id-' + Date.now());
      setExtractedData(mockIAResponse);
      setShowValidationArea(true);
      setProcessStatus('success');
    }
  }, [devMode]);

  return (
    <AdminLayout>
      <div className="container-section py-8">
        {devMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-700">
              <strong>Modo de desenvolvimento ativo:</strong> Interface de validação exibida automaticamente com dados mockados.
              Autenticação temporariamente desativada para testes.
            </p>
          </div>
        )}

        <h1 className="heading-lg mb-8">Nova Entrada de Receita</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left column: Upload area */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Upload de Receita</CardTitle>
              <CardDescription>
                Faça o upload de receitas para processamento pela IA
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="upload_arquivo" onValueChange={(value) => setUploadMethod(value as 'upload_arquivo' | 'digitacao')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="upload_arquivo">Upload de Arquivo</TabsTrigger>
                  <TabsTrigger value="digitacao" disabled>Digitação Manual</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload_arquivo">
                  <div className="space-y-6">
                    <FileUploadDropzone 
                      onFilesChange={handleFilesChange}
                      maxFiles={5}
                      acceptedFileTypes={{
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png'],
                        'application/pdf': ['.pdf'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                      }}
                    />
                    
                    {files.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Arquivos selecionados:</h3>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                {file.type.includes('image') ? (
                                  <Image className="h-5 w-5 text-homeo-blue" />
                                ) : file.type.includes('pdf') ? (
                                  <FileText className="h-5 w-5 text-homeo-accent" />
                                ) : file.type.includes('document') ? (
                                  <FileArchive className="h-5 w-5 text-homeo-green" />
                                ) : (
                                  <File className="h-5 w-5 text-gray-400" />
                                )}
                                <span className="text-sm truncate max-w-xs">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {processStatus !== 'idle' && !devMode && (
                      <div className="mt-6 p-4 border rounded-md bg-muted">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {processStatus === 'processing' && (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin text-homeo-accent" />
                                <span>Processando receita com IA...</span>
                              </>
                            )}
                            {processStatus === 'success' && (
                              <>
                                <CheckCircle className="h-5 w-5 text-homeo-green" />
                                <span>Processamento concluído com sucesso!</span>
                              </>
                            )}
                            {processStatus === 'error' && (
                              <>
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <span>Erro ao processar a receita. Tente novamente.</span>
                              </>
                            )}
                          </div>
                          
                          {processStatus === 'processing' && (
                            <div className="w-full">
                              <Progress value={validationProgress} className="h-2" />
                              <p className="text-xs text-right mt-1 text-muted-foreground">
                                {Math.round(validationProgress)}% concluído
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="digitacao">
                  <div className="p-4 border border-dashed rounded-md bg-muted flex items-center justify-center">
                    <p className="text-center text-muted-foreground py-8">
                      Esta funcionalidade estará disponível em breve.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter>
              {!devMode && (
                <Button 
                  onClick={handleProcessarReceita} 
                  disabled={isUploading || files.length === 0 || processStatus === 'processing'}
                  className="w-full md:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : processStatus === 'processing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : processStatus === 'success' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Visualizar Dados Extraídos
                    </>
                  ) : (
                    <>
                      Processar Receita com IA
                    </>
                  )}
                </Button>
              )}
              {devMode && !showValidationArea && (
                <Button 
                  onClick={() => {
                    setExtractedData(mockIAResponse);
                    setShowValidationArea(true);
                    setProcessStatus('success');
                  }}
                  className="w-full md:w-auto"
                >
                  Mostrar Interface de Validação (Modo Dev)
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Right column: Validation area (visible only after successful processing) */}
          {showValidationArea && extractedData && (
            <Card className="w-full">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Dados da Receita para Validação Humana</CardTitle>
                  <CardDescription>
                    Revise e ajuste os dados extraídos pela IA antes de criar o pedido
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Validação de Dados
                </Badge>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleValidationView}
                    className="flex items-center gap-2"
                  >
                    {validationView === 'split' ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Modo Visualização</span>
                      </>
                    ) : (
                      <>
                        <Split className="h-4 w-4" />
                        <span>Modo Dividido</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className={cn(
                  "grid gap-6",
                  validationView === 'split' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}>
                  {/* Original prescription preview */}
                  {validationView === 'split' && (
                    <OriginalPrescriptionPreview 
                      previewUrl={previewUrl}
                      originalFiles={files}
                    />
                  )}
                  
                  {/* Prescription data validation form */}
                  <div className={validationView === 'preview' ? "border rounded-md p-4" : ""}>
                    <div className="space-y-6">
                      {/* Patient and Prescriber Information */}
                      <PatientPrescriberInfo 
                        patientName={extractedData.patient_name || ''}
                        patientDob={extractedData.patient_dob || ''}
                        prescriberName={extractedData.prescriber_name || ''}
                        prescriberIdentifier={extractedData.prescriber_identifier || ''}
                        onPatientChange={handlePatientChange}
                        onPrescriberChange={handlePrescriberChange}
                      />
                      
                      <Separator />
                      
                      {/* Medications */}
                      <MedicationsSection 
                        medications={extractedData.medications}
                        onMedicationChange={handleMedicationChange}
                        onAddMedication={handleAddMedication}
                        onRemoveMedication={handleRemoveMedication}
                      />
                      
                      <Separator />
                      
                      {/* Validation Notes and Submit */}
                      <ValidationSection 
                        validationNotes={validationNotes}
                        onValidationNotesChange={(value) => setValidationNotes(value)}
                        onSubmit={handleSaveProcessedRecipe}
                        onCancel={handleCancelValidation}
                        isSaving={isSaving}
                        disableSubmit={extractedData.medications.length === 0}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NovaReceitaPage;
