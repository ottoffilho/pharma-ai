import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Save, 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Upload,
  Building2,
  User,
  FileText,
  Package,
  Users,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import logger from "@/lib/logger";
import type { Fornecedor, FornecedorContato, FornecedorDocumento } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Schema de validação com Zod
const fornecedorSchema = z.object({
  // Informações Gerais
  tipo_pessoa: z.enum(["PJ", "PF"]),
  documento: z.string().min(11, "Documento é obrigatório"),
  nome: z.string().min(1, "Nome/Razão Social é obrigatório").max(255, "Nome muito longo"),
  nome_fantasia: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Email deve ter um formato válido",
    }),
  telefone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Telefone deve ter pelo menos 10 dígitos",
    }),
  endereco: z.string().optional(),
  cep: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  afe_anvisa: z.string().optional(),
  tipo_fornecedor: z.string().optional(),
  contato: z.string().optional(),
});

type FornecedorFormValues = z.infer<typeof fornecedorSchema>;

interface FornecedorFormProps {
  initialData?: Fornecedor;
  isEditing?: boolean;
  fornecedorId?: string;
}

interface TipoFornecedor {
  id: string;
  nome: string;
  descricao: string;
}

interface FornecedorItem {
  id: string;
  tipo_item: "insumo" | "embalagem";
  item_id: string;
  item_nome: string;
  codigo_fornecedor: string;
  preco_compra: number;
}



// Função utilitária para buscar o JWT do usuário autenticado
async function getAuthHeader() {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function FornecedorForm({
  initialData,
  isEditing = false,
  fornecedorId,
}: FornecedorFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [activeTab, setActiveTab] = useState("geral");
  const [isSearchingDocument, setIsSearchingDocument] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [fornecedorItens, setFornecedorItens] = useState<FornecedorItem[]>([]);
  const [fornecedorContatos, setFornecedorContatos] = useState<FornecedorContato[]>([]);
  const [fornecedorDocumentos, setFornecedorDocumentos] = useState<FornecedorDocumento[]>([]);
  const [showContatoDialog, setShowContatoDialog] = useState(false);
  const [editingContato, setEditingContato] = useState<FornecedorContato | null>(null);
  const [contatoLoading, setContatoLoading] = useState(false);
  const [contatoForm, setContatoForm] = useState({ nome: "", cargo: "", email: "", telefone: "" });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<FornecedorDocumento | null>(null);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [showOrphanDocumentModal, setShowOrphanDocumentModal] = useState(false);
  const [orphanDocument, setOrphanDocument] = useState<FornecedorDocumento | null>(null);

  // Configurar o formulário
  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      tipo_pessoa: "PJ",
      documento: initialData?.nome || "",
      nome: initialData?.nome || "",
      nome_fantasia: "",
      email: initialData?.email || "",
      telefone: initialData?.telefone || "",
      endereco: initialData?.endereco || "",
      cep: "",
      cidade: "",
      estado: "",
      inscricao_estadual: "",
      afe_anvisa: "",
      tipo_fornecedor: "",
      contato: initialData?.contato || "",
    },
  });

  const { isSubmitting } = form.formState;
  const tipoPessoa = form.watch("tipo_pessoa");

  // Limpar documento quando mudar o tipo de pessoa
  useEffect(() => {
    form.setValue("documento", "");
  }, [tipoPessoa]);

  // Buscar tipos de fornecedor (vou criar uma lista mock por enquanto)
  const tiposFornecedor: TipoFornecedor[] = [
    { id: "1", nome: "Farmoquímico", descricao: "Fornecedor de insumos farmacêuticos" },
    { id: "2", nome: "Embalagens", descricao: "Fornecedor de embalagens e materiais" },
    { id: "3", nome: "Equipamentos", descricao: "Fornecedor de equipamentos e instrumentos" },
    { id: "4", nome: "Serviços", descricao: "Prestador de serviços especializados" },
  ];

  // Buscar insumos para o combobox
  const { data: insumos } = useQuery({
    queryKey: ["insumos-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insumos")
        .select("id, nome")
        .eq("is_deleted", false)
        .order("nome");

      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Buscar embalagens para o combobox
  const { data: embalagens } = useQuery({
    queryKey: ["embalagens-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("embalagens")
        .select("id, nome")
        .eq("is_deleted", false)
        .order("nome");

      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Função para mascarar documento (CNPJ/CPF)
  const maskDocument = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    
    if (tipoPessoa === "PJ") {
      // Máscara CNPJ: 00.000.000/0000-00
      return cleanValue
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 18);
    } else {
      // Máscara CPF: 000.000.000-00
      return cleanValue
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2")
        .substring(0, 14);
    }
  };

  // Função para buscar dados por CNPJ/CPF
  const searchDocumentData = async () => {
    try {
      const documento = form.getValues("documento")?.replace(/[^\d]/g, '') || '';
      
      // Validar documento
      if (!documento) {
        toast({
          title: "Documento obrigatório",
          description: "Informe o CNPJ ou CPF para buscar os dados.",
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de documento
      if ((tipoPessoa === "PJ" && documento.length !== 14) || 
          (tipoPessoa === "PF" && documento.length !== 11)) {
        toast({
          title: "Documento inválido",
          description: `Informe um ${tipoPessoa === "PJ" ? "CNPJ" : "CPF"} válido.`,
          variant: "destructive",
        });
        return;
      }

      setIsSearchingDocument(true);
      
      // Chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('buscar-dados-documento', {
        body: { documento }
      });

      if (error) throw error;

      if (data.success) {
        // Preencher os campos com os dados retornados
        form.setValue("tipo_pessoa", data.tipo_pessoa);
        form.setValue("nome", data.razao_social || data.nome || "");
        form.setValue("nome_fantasia", data.nome_fantasia || "");
        form.setValue("endereco", data.endereco_completo || "");
        form.setValue("cep", data.cep || "");
        form.setValue("cidade", data.municipio || "");
        form.setValue("estado", data.uf || "");
        form.setValue("telefone", data.telefone || "");

        toast({
          title: "Dados encontrados",
          description: "As informações foram preenchidas automaticamente.",
        });
      } else {
        toast({
          title: "Dados não encontrados",
          description: data.message || "Não foi possível encontrar os dados do documento informado.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Erro ao buscar dados do documento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar os dados. Preencha manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingDocument(false);
    }
  };

  // Função para salvar o fornecedor
  const onSubmit = async (values: FornecedorFormValues) => {
    try {
      if (!values.nome) {
        throw new Error("Nome é obrigatório");
      }

      console.log('💾 Salvando fornecedor...', { values, isEditing, fornecedorId });

      // Preparar dados expandidos para o fornecedor
      const fornecedorData = {
        nome: values.nome.trim(),
        nome_fantasia: values.nome_fantasia?.trim() || null,
        email: values.email?.trim() || null,
        telefone: values.telefone?.trim() || null,
        endereco: values.endereco?.trim() || null,
        contato: values.contato?.trim() || null,
        documento: values.documento?.trim() || null,
        tipo_pessoa: values.tipo_pessoa,
        cep: values.cep?.trim() || null,
        cidade: values.cidade?.trim() || null,
        estado: values.estado?.trim() || null,
      };

      let savedFornecedorId = fornecedorId;

      if (isEditing && fornecedorId) {
        console.log('📝 Atualizando fornecedor existente...');
        const { error } = await supabase
          .from("fornecedores")
          .update(fornecedorData)
          .eq("id", fornecedorId);

        if (error) throw new Error(error.message);

        console.log('✅ Fornecedor atualizado com sucesso');

        // Contar documentos anexados
        const documentosCount = fornecedorDocumentos.length;
        const contatosCount = fornecedorContatos.length;

        toast({
          title: "✅ Fornecedor atualizado!",
          description: `Dados salvos com sucesso.${documentosCount > 0 ? ` ${documentosCount} documento(s) anexado(s).` : ''}${contatosCount > 0 ? ` ${contatosCount} contato(s) cadastrado(s).` : ''}`,
          duration: 4000
        });
      } else {
        console.log('🆕 Criando novo fornecedor...');
        const { data, error } = await supabase
          .from("fornecedores")
          .insert([fornecedorData])
          .select()
          .single();

        if (error) throw new Error(error.message);
        
        savedFornecedorId = data.id;
        console.log('✅ Novo fornecedor criado com sucesso:', savedFornecedorId);

        toast({
          title: "✅ Fornecedor criado!",
          description: "O novo fornecedor foi adicionado com sucesso. Agora você pode anexar documentos e adicionar contatos.",
          duration: 4000
        });
      }

      // Invalidar cache do React Query
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });

      // Aguardar um pouco para o usuário ver o toast antes de navegar
      setTimeout(() => {
        navigate("/admin/cadastros/fornecedores");
      }, 1500);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("💥 Erro ao salvar fornecedor:", {
        errorCode: (error as Record<string, unknown>)?.code || "unknown",
        errorType: error?.constructor?.name || "unknown",
        message: errorMessage
      });
      
      toast({
        title: "❌ Erro ao salvar",
        description: `Não foi possível salvar o fornecedor: ${errorMessage}`,
        variant: "destructive",
        duration: 6000
      });
    }
  };

  // Componente para adicionar item ao catálogo
  const AddItemDialog = () => {
    const [selectedType, setSelectedType] = useState<"insumo" | "embalagem">("insumo");
    const [selectedItem, setSelectedItem] = useState("");
    const [codigoFornecedor, setCodigoFornecedor] = useState("");
    const [precoCompra, setPrecoCompra] = useState("");

    const handleAddItem = () => {
      if (!selectedItem || !codigoFornecedor || !precoCompra) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos para adicionar o item.",
          variant: "destructive",
        });
        return;
      }

      const items = selectedType === "insumo" ? insumos : embalagens;
      const item = items?.find(i => i.id === selectedItem);

      if (item) {
        const newItem: FornecedorItem = {
          id: Date.now().toString(),
          tipo_item: selectedType,
          item_id: selectedItem,
          item_nome: item.nome,
          codigo_fornecedor: codigoFornecedor,
          preco_compra: parseFloat(precoCompra),
        };

        setFornecedorItens(prev => [...prev, newItem]);
        setShowAddItemDialog(false);
        
        // Limpar campos
        setSelectedItem("");
        setCodigoFornecedor("");
        setPrecoCompra("");

        toast({
          title: "Item adicionado",
          description: "O item foi adicionado ao catálogo do fornecedor.",
        });
      }
    };

    return (
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Catálogo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Tipo de Item</Label>
              <RadioGroup value={selectedType} onValueChange={(value: "insumo" | "embalagem") => setSelectedType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="insumo" id="insumo" />
                  <label htmlFor="insumo">Insumo</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="embalagem" id="embalagem" />
                  <label htmlFor="embalagem">Embalagem</label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione um ${selectedType}`} />
                </SelectTrigger>
                <SelectContent>
                  {(selectedType === "insumo" ? insumos : embalagens)?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Código do Item no Fornecedor</Label>
              <Input
                value={codigoFornecedor}
                onChange={(e) => setCodigoFornecedor(e.target.value)}
                placeholder="Ex: ABC123"
              />
            </div>

            <div>
              <Label>Preço de Compra (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={precoCompra}
                onChange={(e) => setPrecoCompra(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>
              Adicionar Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // 1. Adicione o hook para buscar contatos ao abrir a aba:
  useEffect(() => {
    console.log('useEffect aba contatos:', { activeTab, fornecedorId, isEditing });
    if (activeTab === "contatos" && fornecedorId) {
      fetchContatos();
      fetchDocumentos();
    }
    // eslint-disable-next-line
  }, [activeTab, fornecedorId]);

  // 2. Função para buscar contatos via Edge Function
  const fetchContatos = async () => {
    if (!fornecedorId) return;
    console.log('fetchContatos chamada para fornecedorId:', fornecedorId);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getSupabaseFunctionUrl("fornecedor-contato-crud") + `?fornecedor_id=${fornecedorId}`,
        { headers });
      const data = await res.json();
      console.log('Contatos recebidos:', data);
      setFornecedorContatos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Erro ao buscar contatos:', e);
      toast({ title: "Erro ao buscar contatos", description: e.message, variant: "destructive" });
    }
  };

  // 3. Modal de contato (adicionar/editar)
  const openAddContato = () => {
    setEditingContato(null);
    setContatoForm({ nome: "", cargo: "", email: "", telefone: "" });
    setShowContatoDialog(true);
  };
  const openEditContato = (contato: FornecedorContato) => {
    setEditingContato(contato);
    setContatoForm({ nome: contato.nome, cargo: contato.cargo || "", email: contato.email || "", telefone: contato.telefone || "" });
    setShowContatoDialog(true);
  };
  const closeContatoDialog = () => {
    setShowContatoDialog(false);
    setEditingContato(null);
  };

  const handleContatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContatoForm({ ...contatoForm, [e.target.name]: e.target.value });
  };

  const saveContato = async () => {
    if (!fornecedorId || !contatoForm.nome) {
      toast({ title: "Nome obrigatório", description: "Preencha o nome do contato.", variant: "destructive" });
      return;
    }
    setContatoLoading(true);
    try {
      const method = editingContato ? "PATCH" : "POST";
      const body = editingContato
        ? { id: editingContato.id, ...contatoForm }
        : { fornecedor_id: fornecedorId, ...contatoForm };
      const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
      const res = await fetch(getSupabaseFunctionUrl("fornecedor-contato-crud"), {
        method,
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao salvar contato");
      closeContatoDialog();
      fetchContatos();
      toast({ title: "Contato salvo", description: "Contato salvo com sucesso." });
    } catch (e) {
      toast({ title: "Erro ao salvar contato", description: e.message, variant: "destructive" });
    } finally {
      setContatoLoading(false);
    }
  };

  const deleteContato = async (id: string) => {
    if (!window.confirm("Deseja remover este contato?")) return;
    try {
      const headers = await getAuthHeader();
      const res = await fetch(getSupabaseFunctionUrl("fornecedor-contato-crud") + `?id=${id}`,
        { method: "DELETE", headers });
      if (!res.ok) throw new Error("Erro ao remover contato");
      fetchContatos();
      toast({ title: "Contato removido" });
    } catch (e) {
      toast({ title: "Erro ao remover contato", description: e.message, variant: "destructive" });
    }
  };

  // Função para buscar documentos via Edge Function
  const fetchDocumentos = async () => {
    if (!fornecedorId) {
      console.log('⚠️ fetchDocumentos: fornecedorId não encontrado');
      return;
    }
    
    console.log('📋 fetchDocumentos: Iniciando busca para fornecedorId:', fornecedorId);
    
    try {
      const authHeaders = await getAuthHeader();
      console.log('🔑 fetchDocumentos: Headers de auth preparados:', { hasAuth: !!authHeaders.Authorization });
      
      const functionUrl = getSupabaseFunctionUrl("fornecedor-documento-crud");
      const fullUrl = `${functionUrl}?fornecedor_id=${fornecedorId}`;
      console.log('🌐 fetchDocumentos: URL completa:', fullUrl);
      
      const res = await fetch(fullUrl, { headers: authHeaders });
      
      console.log('📡 fetchDocumentos: Resposta recebida:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ fetchDocumentos: Erro na resposta:', {
          status: res.status,
          statusText: res.statusText,
          errorText
        });
        throw new Error(`Erro ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('✅ fetchDocumentos: Documentos recebidos:', {
        count: Array.isArray(data) ? data.length : 'não é array',
        data: data
      });
      
      setFornecedorDocumentos(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
      console.error('💥 fetchDocumentos: Erro completo:', {
        message: errorMessage,
        stack: e instanceof Error ? e.stack : undefined,
        error: e
      });
      toast({ 
        title: "Erro ao buscar documentos", 
        description: errorMessage || "Erro desconhecido ao buscar documentos", 
        variant: "destructive" 
      });
    }
  };

  // Função para fazer upload de arquivo
  const uploadFile = async (file: File) => {
    console.log('=== INÍCIO DO UPLOAD ===');
    console.log('uploadFile chamada com:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      fornecedorId, 
      isEditing 
    });
    
    if (!fornecedorId) {
      console.error('❌ Erro: fornecedorId não encontrado');
      toast({ 
        title: "Fornecedor necessário", 
        description: "É necessário ter um fornecedor salvo para anexar documentos. Salve o fornecedor primeiro.", 
        variant: "destructive" 
      });
      return;
    }

    // Verificar se o usuário está autenticado
    try {
      const session = await supabase.auth.getSession();
      console.log('🔐 Status da sessão:', {
        hasSession: !!session.data.session,
        hasUser: !!session.data.session?.user,
        userId: session.data.session?.user?.id
      });
      
      if (!session.data.session) {
        console.error('❌ Usuário não autenticado');
        toast({ 
          title: "Erro de autenticação", 
          description: "Você precisa estar logado para fazer upload de documentos.", 
          variant: "destructive" 
        });
        return;
      }
    } catch (authError) {
      console.error('❌ Erro ao verificar autenticação:', authError);
      toast({ 
        title: "Erro de autenticação", 
        description: "Erro ao verificar login. Tente fazer login novamente.", 
        variant: "destructive" 
      });
      return;
    }

    // Verificar se já existe um arquivo com o mesmo nome
    const arquivoExistente = fornecedorDocumentos.find(doc => doc.nome_arquivo === file.name);
    if (arquivoExistente) {
      const confirmar = window.confirm(
        `Já existe um arquivo com o nome "${file.name}". Deseja substituí-lo?`
      );
      if (!confirmar) {
        console.log('⚠️ Upload cancelado pelo usuário - arquivo duplicado');
        return;
      } else {
        // Remover o arquivo existente primeiro
        console.log('🗑️ Removendo arquivo existente antes de substituir...');
        try {
          await deleteDocumento(arquivoExistente.id, arquivoExistente.url);
        } catch (error) {
          console.error('❌ Erro ao remover arquivo existente:', error);
          toast({
            title: "Erro ao substituir arquivo",
            description: "Não foi possível remover o arquivo existente.",
            variant: "destructive"
          });
          return;
        }
      }
    }

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Tipo de arquivo rejeitado:', file.type);
      toast({ 
        title: "Tipo de arquivo não permitido", 
        description: "Apenas PDF, JPG e PNG são aceitos.", 
        variant: "destructive" 
      });
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande:', file.size);
      toast({ 
        title: "Arquivo muito grande", 
        description: "O arquivo deve ter no máximo 10MB.", 
        variant: "destructive" 
      });
      return;
    }

    console.log('✅ Validações passaram, iniciando upload do arquivo:', file.name);
    setUploadingDocument(true);
    
    try {
      // ETAPA 1: Upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${fornecedorId}/${Date.now()}.${fileExt}`;
      
      console.log('📁 ETAPA 1: Fazendo upload para storage:', fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fornecedor-documentos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('❌ ETAPA 1 FALHOU - Erro no upload para storage:', uploadError);
        throw new Error(`Erro no storage: ${uploadError.message}`);
      }

      console.log('✅ ETAPA 1 SUCESSO - Upload para storage bem-sucedido:', uploadData);

      // ETAPA 2: Obter URL pública
      console.log('🔗 ETAPA 2: Gerando URL pública...');
      const { data: { publicUrl } } = supabase.storage
        .from('fornecedor-documentos')
        .getPublicUrl(fileName);

      console.log('✅ ETAPA 2 SUCESSO - URL pública gerada:', publicUrl);

      // ETAPA 3: Preparar headers de autenticação
      console.log('🔑 ETAPA 3: Preparando headers de autenticação...');
      const authHeaders = await getAuthHeader();
      console.log('Headers de auth preparados:', { hasAuth: !!authHeaders.Authorization });

      // ETAPA 4: Salvar metadados no banco via Edge Function
      const headers = { "Content-Type": "application/json", ...authHeaders };
      const payload = {
        fornecedor_id: fornecedorId,
        nome_arquivo: file.name,
        url: publicUrl,
        tipo: file.type
      };
      
      console.log('💾 ETAPA 4: Salvando metadados via Edge Function...');
      console.log('Payload:', payload);
      console.log('Headers:', headers);
      
      const functionUrl = getSupabaseFunctionUrl("fornecedor-documento-crud");
      console.log('URL da função:', functionUrl);
      
      const res = await fetch(functionUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      console.log('📡 Resposta da Edge Function:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ ETAPA 4 FALHOU - Erro na Edge Function:', {
          status: res.status,
          statusText: res.statusText,
          errorText
        });
        
        // Se falhou ao salvar metadados, remover arquivo do storage
        try {
          await supabase.storage
            .from('fornecedor-documentos')
            .remove([fileName]);
          console.log('🧹 Arquivo removido do storage devido ao erro nos metadados');
        } catch (cleanupError) {
          console.error('❌ Erro ao limpar arquivo do storage:', cleanupError);
        }
        
        throw new Error(`Erro ao salvar documento (${res.status}): ${errorText}`);
      }

      const responseData = await res.json();
      console.log('✅ ETAPA 4 SUCESSO - Dados da resposta:', responseData);

      // ETAPA 5: Atualizar lista de documentos
      console.log('🔄 ETAPA 5: Atualizando lista de documentos...');
      await fetchDocumentos();
      
      console.log('🎉 UPLOAD COMPLETO COM SUCESSO!');
      toast({ 
        title: "✅ Documento salvo!", 
        description: `O arquivo "${file.name}" foi enviado e salvo com sucesso.${isEditing ? ' Lembre-se de salvar o formulário para confirmar todas as alterações.' : ''}`,
        duration: isEditing ? 5000 : 3000
      });
      
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
      console.error('💥 ERRO COMPLETO NO UPLOAD:', {
        message: errorMessage,
        stack: e instanceof Error ? e.stack : undefined,
        error: e
      });
      toast({ 
        title: "❌ Erro ao enviar documento", 
        description: errorMessage || "Erro desconhecido. Verifique o console para mais detalhes.", 
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setUploadingDocument(false);
      console.log('=== FIM DO UPLOAD ===');
    }
  };

  // Função para remover documento
  const deleteDocumento = async (id: string, url: string) => {
    console.log('🗑️ Iniciando remoção de documento:', { id, url });
    
    try {
      console.log('🔄 Removendo documento...');
      
      // ETAPA 1: Remover metadados via Edge Function
      console.log('📡 ETAPA 1: Removendo metadados via Edge Function...');
      const headers = await getAuthHeader();
      const res = await fetch(getSupabaseFunctionUrl("fornecedor-documento-crud") + `?id=${id}`, {
        method: "DELETE", 
        headers
      });
      
      console.log('Resposta da Edge Function:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ ETAPA 1 FALHOU - Erro ao remover metadados:', errorText);
        throw new Error(`Erro ao remover documento do banco (${res.status}): ${errorText}`);
      }
      
      console.log('✅ ETAPA 1 SUCESSO - Metadados removidos');

      // ETAPA 2: Remover arquivo do storage
      console.log('🗂️ ETAPA 2: Removendo arquivo do storage...');
      try {
        // Extrair o caminho do arquivo da URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${fornecedorId}/${fileName}`;
        
        console.log('Removendo arquivo do storage:', filePath);
        
        const { error: storageError } = await supabase.storage
          .from('fornecedor-documentos')
          .remove([filePath]);

        if (storageError) {
          console.error('⚠️ ETAPA 2 FALHOU - Erro ao remover do storage:', storageError);
          // Não vamos falhar a operação por causa do storage, pois os metadados já foram removidos
          console.log('⚠️ Continuando mesmo com erro no storage...');
        } else {
          console.log('✅ ETAPA 2 SUCESSO - Arquivo removido do storage');
        }
      } catch (storageError) {
        console.error('⚠️ Erro no storage (não crítico):', storageError);
      }

      // ETAPA 3: Atualizar lista de documentos
      console.log('🔄 ETAPA 3: Atualizando lista de documentos...');
      await fetchDocumentos();
      
      console.log('🎉 REMOÇÃO COMPLETA COM SUCESSO!');
      toast({ 
        title: "✅ Documento removido!", 
        description: "O documento foi removido com sucesso.",
        duration: 3000
      });
      
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
      console.error('💥 ERRO COMPLETO NA REMOÇÃO:', {
        message: errorMessage,
        stack: e instanceof Error ? e.stack : undefined,
        error: e
      });
      toast({ 
        title: "❌ Erro ao remover documento", 
        description: errorMessage || "Erro desconhecido ao remover documento.", 
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Handlers para drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Arquivos arrastados:', files.map(f => f.name));
    files.forEach(uploadFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Arquivos selecionados:', files.map(f => f.name));
    files.forEach(uploadFile);
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para obter ícone do tipo de arquivo
  const getFileIcon = (tipo: string) => {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  };

  // Função para verificar e limpar metadados órfãos
  const verificarELimparMetadados = async () => {
    if (!fornecedorId) return;
    
    console.log('🔍 Verificando consistência entre metadados e storage...');
    
    try {
      const documentosParaRemover = [];
      
      for (const doc of fornecedorDocumentos) {
        try {
          // Verificar se o arquivo existe no storage
          const response = await fetch(doc.url, { method: 'HEAD' });
          
          if (!response.ok) {
            console.log(`❌ Arquivo não encontrado no storage: ${doc.nome_arquivo}`);
            documentosParaRemover.push(doc);
          }
        } catch (error) {
          console.log(`❌ Erro ao verificar arquivo: ${doc.nome_arquivo}`, error);
          documentosParaRemover.push(doc);
        }
      }
      
      if (documentosParaRemover.length > 0) {
        console.log(`🧹 Removendo ${documentosParaRemover.length} metadados órfãos...`);
        
        for (const doc of documentosParaRemover) {
          try {
            // Remover apenas os metadados (não tentar remover do storage)
            const headers = await getAuthHeader();
            const res = await fetch(getSupabaseFunctionUrl("fornecedor-documento-crud") + `?id=${doc.id}`, {
              method: "DELETE", 
              headers
            });
            
            if (res.ok) {
              console.log(`✅ Metadados removidos: ${doc.nome_arquivo}`);
            }
          } catch (error) {
            console.error(`❌ Erro ao remover metadados: ${doc.nome_arquivo}`, error);
          }
        }
        
        // Atualizar lista após limpeza
        await fetchDocumentos();
        
        toast({
          title: "🧹 Limpeza realizada",
          description: `${documentosParaRemover.length} arquivo(s) órfão(s) removido(s) da lista.`,
          duration: 3000
        });
      } else {
        toast({
          title: "Verificação concluída",
          description: "Todos os documentos estão consistentes no banco e no storage.",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('❌ Erro na verificação de consistência:', error);
    }
  };

  // Função para visualizar documento
  const visualizarDocumento = async (doc: FornecedorDocumento) => {
    console.log('👁️ Visualizando documento:', doc);
    
    try {
      // Verificar se a URL está acessível
      console.log('🔍 Verificando se o documento está acessível...');
      const response = await fetch(doc.url, { method: 'HEAD' });
      
      if (!response.ok) {
        console.error('❌ Documento não encontrado no storage:', response.status);
        
        if (response.status === 400 || response.status === 404) {
          // Arquivo não existe - oferecer opção de remover metadados
          setOrphanDocument(doc);
          setShowOrphanDocumentModal(true);
          return;
        } else {
          toast({
            title: "❌ Documento inacessível",
            description: `Erro ${response.status}: O documento não pode ser acessado no momento.`,
            variant: "destructive",
            duration: 5000
          });
        }
        return;
      }
      
      console.log('✅ Documento acessível, abrindo...');
      
      // Abrir em nova aba
      const newWindow = window.open(doc.url, '_blank');
      
      if (!newWindow) {
        // Se o popup foi bloqueado, tentar download
        console.log('⚠️ Popup bloqueado, tentando download...');
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.nome_arquivo;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "📥 Download iniciado",
          description: "O documento está sendo baixado para seu computador.",
          duration: 3000
        });
      } else {
        toast({
          title: "👁️ Documento aberto",
          description: "O documento foi aberto em uma nova aba.",
          duration: 2000
        });
      }
      
    } catch (error) {
      console.error('💥 Erro ao visualizar documento:', error);
      toast({
        title: "❌ Erro ao abrir documento",
        description: "Não foi possível abrir o documento. Verifique sua conexão.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/cadastros/fornecedores")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-semibold">
          {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informações Gerais
            </TabsTrigger>
            <TabsTrigger value="catalogo" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Catálogo de Itens
            </TabsTrigger>
            <TabsTrigger value="contatos" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contatos & Documentos
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* ABA 1: INFORMAÇÕES GERAIS */}
              <TabsContent value="geral" className="p-6 space-y-6">
                {/* Tipo de Pessoa */}
                <FormField
                  control={form.control}
                  name="tipo_pessoa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pessoa</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PJ" id="pj" />
                            <Label htmlFor="pj">Pessoa Jurídica</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PF" id="pf" />
                            <Label htmlFor="pf">Pessoa Física</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Documento com busca */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="documento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {tipoPessoa === "PJ" ? "CNPJ" : "CPF"} *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                              {...field}
                              value={maskDocument(field.value || '')}
                              onChange={(e) => {
                                const maskedValue = maskDocument(e.target.value);
                                field.onChange(maskedValue);
                              }}
                              onBlur={(e) => {
                                field.onBlur(e);
                                // Se tiver um documento válido, busca automaticamente
                                const doc = e.target.value.replace(/[^\d]/g, '');
                                if ((tipoPessoa === "PJ" && doc.length === 14) || (tipoPessoa === "PF" && doc.length === 11)) {
                                  searchDocumentData();
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={searchDocumentData}
                      disabled={isSearchingDocument}
                      className="w-full"
                    >
                      {isSearchingDocument ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Buscar Dados
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Nome/Razão Social e Nome Fantasia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {tipoPessoa === "PJ" ? "Razão Social" : "Nome Completo"} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={tipoPessoa === "PJ" ? "Ex: Empresa ABC Ltda" : "Ex: João Silva"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tipoPessoa === "PJ" && (
                    <FormField
                      control={form.control}
                      name="nome_fantasia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: ABC Farmacêutica"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Email e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Ex: contato@empresa.com.br"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: (11) 99999-9999"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Endereço e CEP */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Rua das Flores, 123"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: São Paulo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Estado e campos específicos para PJ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: SP"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tipoPessoa === "PJ" && (
                    <>
                      <FormField
                        control={form.control}
                        name="inscricao_estadual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inscrição Estadual</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000.000.000.000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="afe_anvisa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AFE ANVISA</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="0000000000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {/* Tipo de Fornecedor e Contato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tipo_fornecedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Fornecedor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposFornecedor.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                {tipo.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contato"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pessoa de Contato Principal</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: João Silva"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* ABA 2: CATÁLOGO DE ITENS */}
              <TabsContent value="catalogo" className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Itens fornecidos por este fornecedor</h3>
                  <Button
                    type="button"
                    onClick={() => setShowAddItemDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item ao Catálogo
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Código no Fornecedor</TableHead>
                        <TableHead>Preço de Compra</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fornecedorItens.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhum item adicionado ao catálogo
                          </TableCell>
                        </TableRow>
                      ) : (
                        fornecedorItens.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant={item.tipo_item === "insumo" ? "default" : "secondary"}>
                                {item.tipo_item === "insumo" ? "Insumo" : "Embalagem"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{item.item_nome}</TableCell>
                            <TableCell>{item.codigo_fornecedor}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(item.preco_compra)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFornecedorItens(prev => prev.filter(i => i.id !== item.id));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* ABA 3: CONTATOS E DOCUMENTOS */}
              <TabsContent value="contatos" className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Seção de Contatos */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contatos
                      </h3>
                      <Button variant="outline" size="sm" onClick={openAddContato}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Contato
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {fornecedorContatos.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                          Nenhum contato adicional cadastrado
                        </div>
                      ) : (
                        fornecedorContatos.map((contato) => (
                          <div key={contato.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{contato.nome}</p>
                                <p className="text-sm text-muted-foreground">{contato.cargo}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditContato(contato)}>
                                  Editar
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteContato(contato.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {contato.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {contato.telefone}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Seção de Documentos */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documentos
                        {fornecedorDocumentos.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {fornecedorDocumentos.length}
                          </Badge>
                        )}
                      </h3>
                      <div className="flex gap-2">
                        {fornecedorDocumentos.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={verificarELimparMetadados}
                            title="Verificar e limpar arquivos órfãos"
                          >
                            🧹 Verificar
                          </Button>
                        )}
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={uploadingDocument || !fornecedorId}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadingDocument ? 'Enviando...' : 'Upload Documento'}
                        </Button>
                      </div>
                    </div>

                    {!fornecedorId && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Salve o fornecedor primeiro para poder anexar documentos.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Área de drag & drop */}
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                          isDragOver 
                            ? 'border-blue-500 bg-blue-50 scale-105' 
                            : 'border-gray-300 hover:border-gray-400'
                        } ${
                          uploadingDocument 
                            ? 'opacity-50 cursor-not-allowed' 
                            : fornecedorId 
                              ? 'cursor-pointer hover:bg-gray-50' 
                              : 'opacity-50 cursor-not-allowed'
                        }`}
                        onDragOver={fornecedorId ? handleDragOver : undefined}
                        onDragLeave={fornecedorId ? handleDragLeave : undefined}
                        onDrop={fornecedorId ? handleDrop : undefined}
                        onClick={fornecedorId && !uploadingDocument ? () => document.getElementById('file-upload')?.click() : undefined}
                      >
                        {uploadingDocument ? (
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                            <p className="text-blue-600 font-medium">Enviando documento...</p>
                            <p className="text-xs text-gray-500 mt-1">Aguarde, não feche esta página</p>
                          </div>
                        ) : (
                          <>
                            <Upload className={`mx-auto h-8 w-8 mb-2 ${fornecedorId ? 'text-gray-400' : 'text-gray-300'}`} />
                            <p className={`${fornecedorId ? 'text-gray-600' : 'text-gray-400'}`}>
                              {fornecedorId 
                                ? 'Arraste documentos aqui ou clique para fazer upload' 
                                : 'Salve o fornecedor primeiro para anexar documentos'
                              }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG até 10MB</p>
                          </>
                        )}
                      </div>

                      {/* Lista de documentos */}
                      {fornecedorDocumentos.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-gray-700">Documentos anexados:</h4>
                            <p className="text-xs text-gray-500">
                              {fornecedorDocumentos.length} documento{fornecedorDocumentos.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {fornecedorDocumentos.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-2xl flex-shrink-0">{getFileIcon(doc.tipo)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate" title={doc.nome_arquivo}>
                                      {doc.nome_arquivo}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Enviado em {new Date(doc.criado_em).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => visualizarDocumento(doc)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Visualizar documento"
                                  >
                                    👁️ Ver
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setDocumentToDelete(doc);
                                      setShowDeleteDocumentModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Remover documento"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 border border-dashed rounded-lg bg-gray-50">
                          <FileText className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                          <p className="text-sm">Nenhum documento anexado</p>
                          {fornecedorId && (
                            <p className="text-xs mt-1">Faça upload do primeiro documento acima</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Modal de contato */}
                <Dialog open={showContatoDialog} onOpenChange={setShowContatoDialog}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingContato ? "Editar Contato" : "Adicionar Contato"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome *</Label>
                        <Input name="nome" value={contatoForm.nome} onChange={handleContatoChange} required maxLength={255} />
                      </div>
                      <div>
                        <Label>Cargo</Label>
                        <Input name="cargo" value={contatoForm.cargo} onChange={handleContatoChange} maxLength={100} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input name="email" value={contatoForm.email} onChange={handleContatoChange} type="email" maxLength={255} />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input name="telefone" value={contatoForm.telefone} onChange={handleContatoChange} maxLength={20} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={closeContatoDialog} disabled={contatoLoading}>Cancelar</Button>
                      <Button onClick={saveContato} loading={contatoLoading} disabled={contatoLoading}>
                        {editingContato ? "Salvar Alterações" : "Adicionar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Botões de ação */}
              <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/cadastros/fornecedores")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`min-w-[120px] ${
                    (fornecedorDocumentos.length > 0 || fornecedorContatos.length > 0) 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Salvar Alterações' : 'Criar Fornecedor'}
                      {(fornecedorDocumentos.length > 0 || fornecedorContatos.length > 0) && (
                        <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                          {fornecedorDocumentos.length + fornecedorContatos.length}
                        </span>
                      )}
                    </>
                  )}
                </Button>
                
                {/* Informações sobre anexos */}
                {(fornecedorDocumentos.length > 0 || fornecedorContatos.length > 0) && (
                  <div className="flex items-center text-sm text-gray-600 ml-4">
                    {fornecedorDocumentos.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {fornecedorDocumentos.length} doc{fornecedorDocumentos.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {fornecedorContatos.length > 0 && (
                      <span className="flex items-center gap-1 ml-3">
                        <Users className="h-4 w-4" />
                        {fornecedorContatos.length} contato{fornecedorContatos.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </form>
          </Form>
        </Tabs>
      </div>

      <AddItemDialog />

      {/* Modal de confirmação de exclusão de documento */}
      <Dialog open={showDeleteDocumentModal} onOpenChange={setShowDeleteDocumentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium mb-2">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
              <p className="text-red-700 text-sm">
                O documento será removido permanentemente do sistema.
              </p>
            </div>
            
            {documentToDelete && (
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(documentToDelete.tipo)}</span>
                  <div>
                    <p className="font-medium text-sm">{documentToDelete.nome_arquivo}</p>
                    <p className="text-xs text-gray-500">
                      Enviado em {new Date(documentToDelete.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-gray-700">
              Tem certeza de que deseja remover este documento?
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDocumentModal(false);
                setDocumentToDelete(null);
              }}
              disabled={deletingDocument}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                if (documentToDelete) {
                  setDeletingDocument(true);
                  try {
                    await deleteDocumento(documentToDelete.id, documentToDelete.url);
                  } finally {
                    setDeletingDocument(false);
                    setShowDeleteDocumentModal(false);
                    setDocumentToDelete(null);
                  }
                }
              }}
              disabled={deletingDocument}
            >
              {deletingDocument ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Documento
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para documento órfão */}
      <Dialog open={showOrphanDocumentModal} onOpenChange={setShowOrphanDocumentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <FileText className="h-5 w-5" />
              Documento Não Encontrado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium mb-2">
                📄 Arquivo não encontrado no storage
              </p>
              <p className="text-orange-700 text-sm">
                O arquivo pode ter sido removido manualmente ou corrompido.
              </p>
            </div>
            
            {orphanDocument && (
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(orphanDocument.tipo)}</span>
                  <div>
                    <p className="font-medium text-sm">{orphanDocument.nome_arquivo}</p>
                    <p className="text-xs text-gray-500">
                      Enviado em {new Date(orphanDocument.criado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-gray-700">
              Deseja remover este item da lista de documentos? Isso irá limpar apenas os metadados, já que o arquivo não existe mais.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowOrphanDocumentModal(false);
                setOrphanDocument(null);
              }}
            >
              Manter na Lista
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                if (orphanDocument) {
                  console.log('🗑️ Removendo metadados órfãos...');
                  try {
                    const headers = await getAuthHeader();
                    const res = await fetch(getSupabaseFunctionUrl("fornecedor-documento-crud") + `?id=${orphanDocument.id}`, {
                      method: "DELETE", 
                      headers
                    });
                    
                    if (res.ok) {
                      await fetchDocumentos();
                      toast({
                        title: "✅ Item removido",
                        description: "O item foi removido da lista de documentos.",
                        duration: 3000
                      });
                    } else {
                      throw new Error('Erro ao remover metadados');
                    }
                  } catch (error) {
                    console.error('❌ Erro ao remover metadados:', error);
                    toast({
                      title: "❌ Erro ao remover",
                      description: "Não foi possível remover o item da lista.",
                      variant: "destructive",
                      duration: 5000
                    });
                  } finally {
                    setShowOrphanDocumentModal(false);
                    setOrphanDocument(null);
                  }
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover da Lista
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 