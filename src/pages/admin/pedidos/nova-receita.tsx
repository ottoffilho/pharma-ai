
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Image, FileArchive, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUploadDropzone from '@/components/FileUploadDropzone';
import AdminLayout from '@/components/layouts/AdminLayout';

const NovaReceitaPage: React.FC = () => {
  const [uploadMethod, setUploadMethod] = useState<'upload_arquivo' | 'digitacao'>('upload_arquivo');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFilesChange = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
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
    
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      for (const file of files) {
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('receitas')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL of the file
        const { data: { publicUrl } } = supabase.storage
          .from('receitas')
          .getPublicUrl(filePath);
          
        // Save record in the database
        const { error: dbError } = await supabase
          .from('receitas_raw')
          .insert({
            uploaded_by_user_id: user.id,
            file_url: filePath,
            file_name: file.name,
            file_mime_type: file.type,
            input_type: uploadMethod,
            status: 'received',
          });
          
        if (dbError) {
          throw dbError;
        }
      }
      
      toast({
        title: "Receita enviada com sucesso!",
        description: "Os arquivos foram enviados e estão prontos para processamento.",
      });
      
      // Clear the form
      setFiles([]);
      
      // Redirect to list view or stay on the page
      // navigate('/admin/pedidos'); // Uncomment when list view is ready
      
    } catch (error: any) {
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
              disabled={isUploading || files.length === 0}
              className="w-full md:w-auto"
            >
              {isUploading ? (
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
    </AdminLayout>
  );
};

export default NovaReceitaPage;
