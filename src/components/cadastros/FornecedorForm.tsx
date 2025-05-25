import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import type { Fornecedor } from "@/integrations/supabase/types";

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

interface FornecedorContato {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
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
    } catch (error: any) {
      console.error("Erro ao buscar dados do documento:", error);
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

      // Preparar dados expandidos para o fornecedor
      const fornecedorData = {
        nome: values.nome.trim(),
        nome_fantasia: values.nome_fantasia?.trim() || null,
        email: values.email?.trim() || null,
        telefone: values.telefone?.trim() || null,
        endereco: values.endereco?.trim() || null,
        contato: values.contato?.trim() || null,
        // Campos adicionais (vamos expandir a tabela posteriormente)
        documento: values.documento?.trim() || null,
        tipo_pessoa: values.tipo_pessoa,
        cep: values.cep?.trim() || null,
        cidade: values.cidade?.trim() || null,
        estado: values.estado?.trim() || null,
        inscricao_estadual: values.inscricao_estadual?.trim() || null,
        afe_anvisa: values.afe_anvisa?.trim() || null,
        tipo_fornecedor: values.tipo_fornecedor || null,
      };

      if (isEditing && fornecedorId) {
        const { error } = await supabase
          .from("fornecedores")
          .update(fornecedorData)
          .eq("id", fornecedorId);

        if (error) throw new Error(error.message);

        toast({
          title: "Fornecedor atualizado",
          description: "O fornecedor foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("fornecedores")
          .insert([fornecedorData]);

        if (error) throw new Error(error.message);

        toast({
          title: "Fornecedor criado",
          description: "O novo fornecedor foi adicionado com sucesso.",
        });
      }

      navigate("/admin/cadastros/fornecedores");
    } catch (error: any) {
      logger.error("Erro ao salvar fornecedor", {
        errorCode: error.code || "unknown",
        errorType: error.constructor.name,
      });
      toast({
        title: "Erro",
        description: `Não foi possível salvar o fornecedor. Tente novamente.`,
        variant: "destructive",
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
                      <Button variant="outline" size="sm">
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
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                      </h3>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Documento
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                        <Upload className="mx-auto h-8 w-8 mb-2" />
                        <p>Arraste documentos aqui ou clique para fazer upload</p>
                        <p className="text-xs">PDF, JPG, PNG até 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Botões de ação */}
              <div className="flex justify-end gap-4 p-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/cadastros/fornecedores")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>

      <AddItemDialog />
    </div>
  );
} 