// Seletor de Farmácia - Sistema Multi-Farmácia
// Módulo: M09-USUARIOS_PERMISSOES

import React, { useState, useCallback } from 'react';
import { useAuthSimple } from '../hooks/useAuthSimple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Crown,
  Users,
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import type { Farmacia, ContextoMultiFarmacia } from '../types';

interface SeletorFarmaciaProps {
  className?: string;
  showCreateButton?: boolean;
  compact?: boolean;
}

/**
 * Componente para seleção e troca de farmácia no sistema multi-farmácia
 */
export const SeletorFarmacia: React.FC<SeletorFarmaciaProps> = ({
  className = '',
  showCreateButton = true,
  compact = false
}) => {
  const { usuario, recarregarUsuario } = useAuthSimple();
  const { toast } = useToast();
  const [trocandoFarmacia, setTrocandoFarmacia] = useState(false);
  const [dialogAberto, setDialogAberto] = useState(false);

  // Extrair contexto multi-farmácia
  const contexto = usuario?.contexto_multi_farmacia;
  const farmaciaAtual = contexto?.farmacia_atual;
  const farmaciasDisponiveis = contexto?.farmacias_disponiveis || [];
  const proprietario = contexto?.proprietario;

  /**
   * Troca a farmácia atual
   */
  const trocarFarmacia = useCallback(async (farmaciaId: string) => {
    if (!farmaciaId || farmaciaId === farmaciaAtual?.id) return;

    try {
      setTrocandoFarmacia(true);

      // Aqui você implementaria a lógica para trocar a farmácia
      // Por exemplo, chamando uma Edge Function ou atualizando o JWT
      
      // Placeholder para implementação futura
      console.log('🔄 Trocando para farmácia:', farmaciaId);
      
      // Recarregar dados do usuário
      await recarregarUsuario();
      
      toast({
        title: 'Farmácia alterada',
        description: 'Você foi redirecionado para a nova farmácia.',
      });

      setDialogAberto(false);
      
    } catch (error) {
      console.error('Erro ao trocar farmácia:', error);
      toast({
        title: 'Erro ao trocar farmácia',
        description: 'Não foi possível alterar a farmácia. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setTrocandoFarmacia(false);
    }
  }, [farmaciaAtual?.id, recarregarUsuario, toast]);

  /**
   * Abre modal para criar nova farmácia
   */
  const criarNovaFarmacia = useCallback(() => {
    // Implementar navegação para página de criação de farmácia
    console.log('🏗️ Criar nova farmácia');
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'A criação de farmácias será implementada em breve.',
    });
  }, [toast]);

  // Se não há contexto multi-farmácia, não renderizar
  if (!contexto || !farmaciaAtual) {
    return null;
  }

  // Versão compacta (para header/navbar)
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="h-4 w-4 text-gray-500" />
        <Select
          value={farmaciaAtual.id}
          onValueChange={trocarFarmacia}
          disabled={trocandoFarmacia || farmaciasDisponiveis.length <= 1}
        >
          <SelectTrigger className="w-[200px] h-8">
            <SelectValue placeholder="Selecionar farmácia" />
          </SelectTrigger>
          <SelectContent>
            {farmaciasDisponiveis.map((farmacia) => (
              <SelectItem key={farmacia.id} value={farmacia.id}>
                <div className="flex items-center gap-2">
                  {farmacia.matriz && <Crown className="h-3 w-3 text-yellow-500" />}
                  <span className="truncate">{farmacia.nome_fantasia}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {trocandoFarmacia && (
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>
    );
  }

  // Versão completa (para dashboard/páginas)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Farmácia Atual</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {farmaciaAtual.matriz && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Crown className="h-3 w-3 mr-1" />
                Matriz
              </Badge>
            )}
            
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ativa
            </Badge>
          </div>
        </div>
        
        <CardDescription>
          {proprietario?.nome} • {farmaciasDisponiveis.length} farmácia(s) disponível(is)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações da farmácia atual */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900">{farmaciaAtual.nome_fantasia}</h4>
            <p className="text-sm text-gray-600">{farmaciaAtual.razao_social}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{farmaciaAtual.endereco_cidade}, {farmaciaAtual.endereco_uf}</span>
            </div>
            
            {farmaciaAtual.telefone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{farmaciaAtual.telefone}</span>
              </div>
            )}
            
            {farmaciaAtual.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{farmaciaAtual.email}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>CNPJ: {farmaciaAtual.cnpj}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Ações */}
        <div className="flex items-center gap-2">
          {/* Trocar farmácia */}
          {farmaciasDisponiveis.length > 1 && (
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={trocandoFarmacia}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Trocar Farmácia
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Farmácia</DialogTitle>
                  <DialogDescription>
                    Escolha a farmácia que deseja acessar. Seus dados e permissões serão ajustados automaticamente.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {farmaciasDisponiveis.map((farmacia) => (
                    <Card 
                      key={farmacia.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        farmacia.id === farmaciaAtual.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => trocarFarmacia(farmacia.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{farmacia.nome_fantasia}</h4>
                              {farmacia.matriz && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Matriz
                                </Badge>
                              )}
                              {farmacia.id === farmaciaAtual.id && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Atual
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{farmacia.endereco_cidade}, {farmacia.endereco_uf}</p>
                            <p className="text-xs text-gray-500">CNPJ: {farmacia.cnpj}</p>
                          </div>
                          
                          {farmacia.id === farmaciaAtual.id && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Criar nova farmácia */}
          {showCreateButton && contexto.pode_criar_farmacia && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={criarNovaFarmacia}
              disabled={contexto.limite_farmacias_atingido}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Farmácia
            </Button>
          )}

          {/* Indicador de limite atingido */}
          {contexto.limite_farmacias_atingido && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Limite de farmácias atingido</span>
            </div>
          )}
        </div>

        {/* Informações do plano */}
        {proprietario?.plano && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Plano: {proprietario.plano.nome}</span>
              <span>{farmaciasDisponiveis.length}/{proprietario.plano.max_farmacias} farmácias</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Hook para acessar informações da farmácia atual
 */
export const useFarmaciaAtual = () => {
  const { usuario } = useAuthSimple();
  
  return {
    farmacia: usuario?.contexto_multi_farmacia?.farmacia_atual,
    proprietario: usuario?.contexto_multi_farmacia?.proprietario,
    farmaciasDisponiveis: usuario?.contexto_multi_farmacia?.farmacias_disponiveis || [],
    podeAlternarFarmacia: (usuario?.contexto_multi_farmacia?.farmacias_disponiveis?.length || 0) > 1,
    podeCriarFarmacia: usuario?.contexto_multi_farmacia?.pode_criar_farmacia || false,
    limiteAtingido: usuario?.contexto_multi_farmacia?.limite_farmacias_atingido || false
  };
};

export default SeletorFarmacia; 