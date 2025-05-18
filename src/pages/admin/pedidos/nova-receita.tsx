
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Image, FileArchive, File, X, Loader2, CheckCircle, AlertTriangle, Calendar, Split, Eye } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import FileUploadDropzone from '@/components/FileUploadDropzone';
import AdminLayout from '@/components/layouts/AdminLayout';
import PrescriptionReviewForm from '@/components/PrescriptionReviewForm';
import { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

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
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showValidationArea, setShowValidationArea] = useState(false);
  const [validationView, setValidationView] = useState<'split' | 'preview'>('split');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFilesChange = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    // Reset states when new files are added
    setProcessStatus('idle');
    setExtractedData(null);
    setUploadedRecipeId(null);
    setShowValidationArea(false);
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
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      let lastUploadedRecipeId = null;
      
      for (const file of files) {
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receitas')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Save record in the database
        const { error: dbError, data: recipeData } = await supabase
          .from('receitas_raw')
          .insert({
            uploaded_by_user_id: user.id,
            file_url: filePath,
            file_name: file.name,
            file_mime_type: file.type,
            input_type: uploadMethod,
            status: 'received',
          })
          .select('id')
          .single();
          
        if (dbError) {
          throw dbError;
        }

        lastUploadedRecipeId = recipeData.id;
      }
      
      setUploadedRecipeId(lastUploadedRecipeId);
      
      // Simulate AI processing with a delay
      setTimeout(() => {
        setIsProcessing(false);
        setProcessStatus('success');
        setExtractedData(mockIAResponse);
        setShowValidationArea(true);
        
        toast({
          title: "Processamento concluído",
          description: "A IA extraiu os dados da receita com sucesso.",
        });
      }, 1500);
      
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

  const handleSaveProcessedRecipe = async (validatedData: IAExtractedData) => {
    if (!uploadedRecipeId) {
      toast({
        title: "Erro ao salvar",
        description: "ID da receita não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Create a structured object for insert that conforms to the table schema
      // We need to use type casting for the medications array and raw_ia_output
      const dataToInsert = {
        raw_recipe_id: uploadedRecipeId,
        processed_by_user_id: user.id,
        medications: validatedData.medications as unknown as Json,
        patient_name: validatedData.patient_name,
        patient_dob: validatedData.patient_dob,
        prescriber_name: validatedData.prescriber_name,
        prescriber_identifier: validatedData.prescriber_identifier,
        raw_ia_output: extractedData as unknown as Json,
        validation_status: 'validated'
      };

      const { error } = await supabase
        .from('receitas_processadas')
        .insert(dataToInsert);

      if (error) throw error;

      toast({
        title: "Receita validada com sucesso",
        description: "Os dados foram salvos e um pedido foi criado.",
      });

      // Reset states
      setTimeout(() => {
        setFiles([]);
        setExtractedData(null);
        setProcessStatus('idle');
        setUploadedRecipeId(null);
        setShowValidationArea(false);

        // Navigate to the orders page
        navigate('/admin/pedidos');
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Erro ao salvar dados validados",
        description: error.message || "Ocorreu um erro ao salvar os dados validados.",
        variant: "destructive",
      });
    }
  };

  const toggleMobilePreview = () => {
    setShowMobilePreview(!showMobilePreview);
  };

  const toggleValidationView = () => {
    setValidationView(validationView === 'split' ? 'preview' : 'split');
  };

  // Generate preview URL for the first file if it's an image
  const previewUrl = React.useMemo(() => {
    if (files.length > 0 && files[0].type.includes('image')) {
      return URL.createObjectURL(files[0]);
    }
    return null;
  }, [files]);

  return (
    <AdminLayout>
      <div className="container-section py-8">
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
                    
                    {processStatus !== 'idle' && (
                      <div className="mt-6 p-4 border rounded-md bg-muted">
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
                    <div className="border rounded-md p-4 bg-gray-50">
                      <h3 className="text-lg font-medium mb-3">Receita Original</h3>
                      
                      {previewUrl ? (
                        <div className="overflow-hidden">
                          <img 
                            src={previewUrl} 
                            alt="Receita" 
                            className="w-full h-auto max-h-[500px] object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center border rounded-md h-64 bg-gray-100">
                          {files.length > 0 && (
                            <div className="flex flex-col items-center text-muted-foreground">
                              <FileText className="h-8 w-8 mb-2" />
                              <span>{files[0].name}</span>
                              <a 
                                href={URL.createObjectURL(files[0])}
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
                          {files.length > 1 && (
                            <>Mais {files.length - 1} arquivo(s) anexado(s)</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Prescription data validation form */}
                  <div className={validationView === 'preview' ? "border rounded-md p-4" : ""}>
                    <div className="space-y-6">
                      {/* Patient Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Informações do Paciente</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="patient_name">Nome do Paciente</Label>
                            <Input 
                              id="patient_name"
                              defaultValue={extractedData.patient_name} 
                              placeholder="Nome completo do paciente"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="patient_dob">Data de Nascimento</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {extractedData.patient_dob ? 
                                    format(new Date(extractedData.patient_dob), "dd/MM/yyyy") : 
                                    "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 pointer-events-auto">
                                <CalendarComponent
                                  mode="single"
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Prescriber Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Informações do Prescritor</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="prescriber_name">Nome do Prescritor</Label>
                            <Input 
                              id="prescriber_name"
                              defaultValue={extractedData.prescriber_name} 
                              placeholder="Nome do médico/prescritor"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="prescriber_identifier">Identificação do Prescritor (CRM)</Label>
                            <Input 
                              id="prescriber_identifier"
                              defaultValue={extractedData.prescriber_identifier} 
                              placeholder="Ex: CRM 12345-SP"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Medications */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium">Medicamentos</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
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
                            }}
                          >
                            <span className="mr-1">+</span> Adicionar Medicamento
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {extractedData.medications.map((med, index) => (
                            <Card key={index} className="overflow-hidden">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-medium">Medicamento {index + 1}</h4>
                                  {extractedData.medications.length > 1 && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => {
                                        const updatedData = { ...extractedData };
                                        updatedData.medications = updatedData.medications.filter((_, i) => i !== index);
                                        setExtractedData(updatedData);
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor={`med_name_${index}`}>Nome <span className="text-red-500">*</span></Label>
                                    <Input 
                                      id={`med_name_${index}`}
                                      defaultValue={med.name} 
                                      placeholder="Nome do medicamento"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`med_dinamization_${index}`}>Dinamização</Label>
                                    <Input 
                                      id={`med_dinamization_${index}`}
                                      defaultValue={med.dinamization} 
                                      placeholder="Ex: 30CH, 6X, LM1"
                                      list="dinamizacoes"
                                    />
                                    <datalist id="dinamizacoes">
                                      <option value="6X" />
                                      <option value="12X" />
                                      <option value="30X" />
                                      <option value="6CH" />
                                      <option value="12CH" />
                                      <option value="30CH" />
                                      <option value="200CH" />
                                      <option value="LM1" />
                                      <option value="LM3" />
                                    </datalist>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`med_form_${index}`}>Forma Farmacêutica</Label>
                                    <Input 
                                      id={`med_form_${index}`}
                                      defaultValue={med.form} 
                                      placeholder="Ex: Glóbulos, Gotas, Tabletes"
                                      list="formas"
                                    />
                                    <datalist id="formas">
                                      <option value="Glóbulos" />
                                      <option value="Gotas" />
                                      <option value="Tabletes" />
                                      <option value="Comprimidos" />
                                      <option value="Pomada" />
                                      <option value="Creme" />
                                    </datalist>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label htmlFor={`med_quantity_${index}`}>Quantidade</Label>
                                      <Input 
                                        id={`med_quantity_${index}`}
                                        type="number" 
                                        defaultValue={med.quantity} 
                                        min="1"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`med_unit_${index}`}>Unidade</Label>
                                      <Input 
                                        id={`med_unit_${index}`}
                                        defaultValue={med.unit || 'unidades'} 
                                        placeholder="Ex: ml, g, unidades"
                                        list="unidades"
                                      />
                                      <datalist id="unidades">
                                        <option value="ml" />
                                        <option value="g" />
                                        <option value="unidades" />
                                        <option value="gotas" />
                                        <option value="glóbulos" />
                                      </datalist>
                                    </div>
                                  </div>
                                  
                                  <div className="md:col-span-2">
                                    <Label htmlFor={`med_instructions_${index}`}>Posologia / Instruções</Label>
                                    <Textarea 
                                      id={`med_instructions_${index}`}
                                      defaultValue={med.dosage_instructions} 
                                      placeholder="Instruções de uso"
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          
                          {extractedData.medications.length === 0 && (
                            <div className="text-center py-8 border border-dashed rounded-md">
                              <p className="text-muted-foreground">Nenhum medicamento adicionado</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const updatedData = { ...extractedData };
                                  updatedData.medications = [
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
                                }}
                                className="mt-2"
                              >
                                <span className="mr-1">+</span> Adicionar Medicamento
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Validation Notes */}
                      <div>
                        <Label htmlFor="validation_notes">Notas Adicionais da Validação</Label>
                        <Textarea 
                          id="validation_notes"
                          placeholder="Observações adicionais sobre esta receita (opcional)"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowValidationArea(false);
                    setProcessStatus('idle');
                  }}
                >
                  Cancelar / Voltar
                </Button>
                <Button
                  onClick={() => handleSaveProcessedRecipe(extractedData)}
                  className="min-w-[210px]"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Validar e Criar Pedido
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NovaReceitaPage;
