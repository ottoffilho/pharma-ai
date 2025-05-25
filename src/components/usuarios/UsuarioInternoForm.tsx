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

// Esquema de validação condicional com Zod
const usuarioInternoSchema = z.object({
  nome_completo: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email_contato: z.string().email("Email inválido"),
  cargo_perfil: z.string().min(1, "Selecione um cargo"),
  telefone_contato: z.string().optional(),
  ativo: z.boolean().default(true),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional(),
  confirmar_senha: z.string().optional(),
}).refine((data) => {
  // Se não estamos editando (criação) ou senha está presente (edição com alteração de senha)
  if (data.senha) {
    return data.senha === data.confirmar_senha;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmar_senha"],
});

// Tipo dos dados do formulário baseado no schema Zod
type UsuarioInternoFormData = z.infer<typeof usuarioInternoSchema>;

// Props do componente de formulário
interface UsuarioInternoFormProps {
  usuarioId?: string;
  usuarioData?: Omit<UsuarioInternoFormData, 'senha' | 'confirmar_senha'> & { 
    supabase_auth_id?: string 
  };
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
  const [showPasswordFields, setShowPasswordFields] = React.useState(!isEditing);

  // Inicializar o formulário com react-hook-form e validação zod
  const form = useForm<UsuarioInternoFormData>({
    resolver: zodResolver(usuarioInternoSchema),
    defaultValues: {
      nome_completo: usuarioData?.nome_completo || "",
      email_contato: usuarioData?.email_contato || "",
      cargo_perfil: usuarioData?.cargo_perfil || "",
      telefone_contato: usuarioData?.telefone_contato || "",
      ativo: usuarioData?.ativo ?? true,
      senha: "",
      confirmar_senha: "",
    },
    mode: "onBlur", // Validar ao sair do campo
  });

  // Function to handle the form submission
  const onSubmit = async (data: UsuarioInternoFormData) => {
    setIsSaving(true);
    try {
      if (isEditing && usuarioId) {
        // Update existing user
        const { error } = await supabase
          .from("usuarios_internos")
          .update({
            nome_completo: data.nome_completo,
            email_contato: data.email_contato,
            cargo_perfil: data.cargo_perfil,
            telefone_contato: data.telefone_contato || null,
            ativo: data.ativo,
          })
          .eq("id", usuarioId);

        if (error) throw error;

        // If the email was changed, we need to update the email in Supabase Auth
        const originalEmail = usuarioData?.email_contato;
        if (data.email_contato !== originalEmail && usuarioData?.supabase_auth_id) {
          toast({
            title: "Atualização de email Auth necessária",
            description: "A atualização do email no sistema de autenticação requer uma função Edge. Por favor, implemente esta funcionalidade.",
            variant: "default",
          });
          
          // Here would be the place to call an Edge Function to update the email
          // const { error: authError } = await supabase.functions.invoke("update-user-email", {
          //   body: { user_id: usuarioData.supabase_auth_id, email: data.email_contato }
          // });
          // if (authError) throw new Error(`Erro ao atualizar email: ${authError.message}`);
        }

        // If a password was provided, we would need to update the password in Supabase Auth
        if (data.senha && usuarioData?.supabase_auth_id) {
          toast({
            title: "Atualização de senha Auth necessária",
            description: "A atualização da senha no sistema de autenticação requer uma função Edge. Por favor, implemente esta funcionalidade.",
            variant: "default",
          });
          
          // Here would be the place to call an Edge Function to update the password
          // const { error: authError } = await supabase.functions.invoke("update-user-password", {
          //   body: { user_id: usuarioData.supabase_auth_id, password: data.senha }
          // });
          // if (authError) throw new Error(`Erro ao atualizar senha: ${authError.message}`);
        }

        toast({
          title: "Usuário atualizado",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        // Create new user - first create in Auth
        if (!data.senha) {
          throw new Error("Senha é obrigatória para criar um novo usuário");
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email_contato,
          password: data.senha,
        });

        if (authError) {
          // Handle specific signUp errors
          if (authError.message.includes("already registered")) {
            throw new Error("Este email já está registrado no sistema");
          }
          throw new Error(`Erro na criação da conta: ${authError.message}`);
        }

        if (!authData.user?.id) {
          throw new Error("Não foi possível obter o ID do usuário criado");
        }

        // Then create in our table, with reference to auth.users
        const novoUsuario = {
          nome_completo: data.nome_completo,
          email_contato: data.email_contato,
          cargo_perfil: data.cargo_perfil,
          telefone_contato: data.telefone_contato || null,
          ativo: data.ativo,
          supabase_auth_id: authData.user.id,
        };
        
        const { error } = await supabase
          .from("usuarios_internos")
          .insert(novoUsuario);

        if (error) {
          // If we fail to insert into usuarios_internos, we should try to remove the user from auth
          // This requires an admin function, so we just notify about the issue
          toast({
            title: "Atenção",
            description: "Usuário foi criado no sistema de autenticação, mas falhou ao criar o perfil. Informações do Auth podem precisar de limpeza manual.",
            variant: "destructive",
          });
          throw error;
        }

        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }

      // Return to the listing page after success
      navigate("/admin/usuarios");
    } catch (error: unknown) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro ao salvar",
        description: (error instanceof Error ? error.message : 'Erro desconhecido') || "Ocorreu um erro ao salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to cancel and go back to the listing page
  const handleCancel = () => {
    navigate("/admin/usuarios");
  };

  // Toggle to show/hide password fields in edit mode
  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (!showPasswordFields) {
      // Clear password fields when they are hidden
      form.setValue("senha", "");
      form.setValue("confirmar_senha", "");
    }
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

          {/* Toggle to show/hide password fields in edit mode */}
          {isEditing && (
            <div className="col-span-1 md:col-span-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={togglePasswordFields}
              >
                {showPasswordFields ? "Cancelar alteração de senha" : "Alterar senha"}
              </Button>
            </div>
          )}

          {/* Conditional password fields */}
          {(!isEditing && showPasswordFields) || (isEditing && showPasswordFields) ? (
            <>
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEditing ? "Nova Senha" : "Senha"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmar_senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar {isEditing ? "Nova Senha" : "Senha"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme a senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
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
