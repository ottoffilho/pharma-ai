
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definição do esquema de validação com Zod
const usuarioInternoSchema = z.object({
  nome_completo: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email_contato: z.string().email("Email inválido"),
  cargo_perfil: z.string().min(1, "Selecione um cargo"),
  telefone_contato: z.string().optional(),
  ativo: z.boolean().default(true),
});

// Tipo dos dados do formulário baseado no schema Zod
type UsuarioInternoFormData = z.infer<typeof usuarioInternoSchema>;

// Props do componente de formulário
interface UsuarioInternoFormProps {
  usuarioId?: string;
  usuarioData?: UsuarioInternoFormData;
  isEditing: boolean;
}

const UsuarioInternoForm: React.FC<UsuarioInternoFormProps> = ({
  usuarioId,
  usuarioData,
  isEditing,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);

  // Inicializar o formulário com react-hook-form e validação zod
  const form = useForm<UsuarioInternoFormData>({
    resolver: zodResolver(usuarioInternoSchema),
    defaultValues: usuarioData || {
      nome_completo: "",
      email_contato: "",
      cargo_perfil: "",
      telefone_contato: "",
      ativo: true,
    },
  });

  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: UsuarioInternoFormData) => {
    setIsSaving(true);
    try {
      if (isEditing && usuarioId) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from("usuarios_internos")
          .update(data)
          .eq("id", usuarioId);

        if (error) throw error;

        toast({
          title: "Usuário atualizado",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        // Criar novo usuário
        const { error } = await supabase
          .from("usuarios_internos")
          .insert([data]);

        if (error) throw error;

        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }

      // Retornar para a página de listagem após sucesso
      navigate("/admin/usuarios");
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para cancelar e voltar à página de listagem
  const handleCancel = () => {
    navigate("/admin/usuarios");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Campo Nome Completo */}
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Email */}
          <FormField
            control={form.control}
            name="email_contato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Cargo/Perfil */}
          <FormField
            control={form.control}
            name="cargo_perfil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo/Perfil</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Farmacêutico">Farmacêutico</SelectItem>
                    <SelectItem value="Atendente">Atendente</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Telefone */}
          <FormField
            control={form.control}
            name="telefone_contato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Ativo */}
          <FormField
            control={form.control}
            name="ativo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Usuário Ativo</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Determina se o usuário pode acessar o sistema
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Salvar Alterações" : "Salvar Usuário"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UsuarioInternoForm;
