import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import InsumoForm from "@/components/estoque/InsumoForm";
import LotesInsumoTable from "@/components/estoque/LotesInsumoTable";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditarInsumoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Buscar dados do insumo
  const {
    data: insumo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["insumo", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do insumo não fornecido");

      const { data, error } = await supabase
        .from("insumos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Insumo não encontrado");
      
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="w-full py-6 flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-homeo-green" />
            <p>Carregando dados do insumo...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="w-full py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar dados do insumo: {(error as Error).message}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/admin/estoque/insumos")}>
              Voltar para Insumos
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full py-6">
        <Tabs defaultValue="dados">
          <TabsList className="mb-6">
            <TabsTrigger value="dados">Dados do Insumo</TabsTrigger>
            <TabsTrigger value="lotes">Lotes do Insumo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dados">
            <InsumoForm 
              initialData={insumo} 
              isEditing={true} 
              insumoId={id} 
            />
          </TabsContent>
          
          <TabsContent value="lotes">
            {id && <LotesInsumoTable insumoId={id} insumoNome={insumo?.nome} />}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
