
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Image, FileArchive, File, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUploadDropzone from '@/components/FileUploadDropzone';
import AdminLayout from '@/components/layouts/AdminLayout';
import PrescriptionReviewForm from '@/components/PrescriptionReviewForm';

interface IAExtractedData {
  medications: Array<{
    name: string;
    dinamization?: string;
    form?: string;
    quantity?: number;
    dosage_instructions?: string;
  }>;
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
      dosage_instructions: "5 glóbulos, 3x ao dia"
    },
    {
      name: "Belladonna",
      dinamization: "6CH",
      form: "Glóbulos",
      quantity: 5,
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFilesChange = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    // Reset states when new files are added
    setProcessStatus('idle');
    setExtractedData(null);
    setUploadedRecipeId(null);
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
        setShowReviewSheet(true);
        
        toast({
          title: "Processamento concluído",
          description: "A IA extraiu os dados da receita com sucesso.",
        });
      }, 2000);
      
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

      const { error } = await supabase
        .from('receitas_processadas')
        .insert({
          raw_recipe_id: uploadedRecipeId,
          processed_by_user_id: user.id,
          medications: validatedData.medications,
          patient_name: validatedData.patient_name,
          patient_dob: validatedData.patient_dob,
          prescriber_name: validatedData.prescriber_name,
          prescriber_identifier: validatedData.prescriber_identifier,
          raw_ia_output: extractedData
        });

      if (error) throw error;

      toast({
        title: "Receita validada com sucesso",
        description: "Os dados foram salvos e um rascunho de pedido foi criado.",
      });

      // Close the review sheet and reset states
      setShowReviewSheet(false);
      setFiles([]);
      setExtractedData(null);
      setProcessStatus('idle');
      setUploadedRecipeId(null);

      // Navigate to the orders page (future implementation)
      // navigate('/admin/pedidos');
      
    } catch (error: any) {
      toast({
        title: "Erro ao salvar dados validados",
        description: error.message || "Ocorreu um erro ao salvar os dados validados.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container-section py-8">
        <h1 className="heading-lg mb-8">Nova Entrada de Receita</h1>
        
        <Card className="w-full max-w-4xl mx-auto">
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
                    <div className="mt-6 p-4 border rounded-md">
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
              {processStatus === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Processar Receita com IA
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Prescription Review Sheet */}
      <Sheet open={showReviewSheet} onOpenChange={setShowReviewSheet}>
        <SheetContent side="right" className="w-full md:max-w-xl lg:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Revisar e Validar Receita</SheetTitle>
            <SheetDescription>
              Confira os dados extraídos pela IA e faça correções se necessário
            </SheetDescription>
          </SheetHeader>
          
          {extractedData && (
            <PrescriptionReviewForm 
              initialData={extractedData} 
              onSubmit={handleSaveProcessedRecipe} 
              originalFiles={files}
            />
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default NovaReceitaPage;
