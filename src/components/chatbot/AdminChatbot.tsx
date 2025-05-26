import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Loader2, User, Bot, Database, TrendingUp, Package, FileText, DollarSign, Users, Calendar, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp?: Date;
  data?: any; // Para dados estruturados
}

interface AdminChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminChatbot: React.FC<AdminChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gerar ID de sessão único
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `admin_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  // Carregar histórico de conversa do localStorage
  const loadConversationHistory = () => {
    try {
      const savedHistory = localStorage.getItem(`pharma_admin_chat_${sessionId}`);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Converter timestamps de volta para Date objects
        const historyWithDates = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(historyWithDates);
        return true; // Indica que havia histórico
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
    return false; // Não havia histórico
  };

  // Salvar conversa no localStorage
  const saveConversationHistory = (newMessages: ChatMessage[]) => {
    try {
      localStorage.setItem(`pharma_admin_chat_${sessionId}`, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  // Limpar histórico de conversa
  const clearConversationHistory = () => {
    try {
      localStorage.removeItem(`pharma_admin_chat_${sessionId}`);
      setMessages([]);
      // Adicionar mensagem de boas-vindas novamente
      setTimeout(() => {
                 addMessage(
           `🤖 Histórico limpo! Olá novamente!

Posso responder **qualquer pergunta** sobre seus dados da farmácia em tempo real.

💡 **Exemplos:** "Como está meu estoque?", "Faturamento do mês", "Produtos acabando"

Como posso te ajudar?`, 
           'bot',
           null,
           true
         );
      }, 500);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };

  const addMessage = (text: string, sender: ChatMessage['sender'], data?: any, useTypingEffect: boolean = false) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: useTypingEffect ? '' : text,
      sender,
      timestamp: new Date(),
      data
    };
    
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      // Salvar no localStorage sempre que adicionar uma mensagem
      saveConversationHistory(updatedMessages);
      return updatedMessages;
    });

    // Efeito de digitação para mensagens do bot
    if (useTypingEffect && sender === 'bot') {
      let currentText = '';
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          currentText += text[charIndex];
          setMessages((prevMessages) => {
            const updatedMessages = prevMessages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, text: currentText }
                : msg
            );
            // Salvar estado atualizado
            saveConversationHistory(updatedMessages);
            return updatedMessages;
          });
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 20);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasInitialized && sessionId) {
      setIsLoading(false);
      setHasInitialized(true);
      
      // Tentar carregar histórico existente
      const hasHistory = loadConversationHistory();
      
      // Se não há histórico, mostrar mensagem de boas-vindas
      if (!hasHistory) {
        setMessages([]);
        setInputValue('');
        setTimeout(() => {
          addMessage(
            `🤖 Olá! Sou seu assistente da farmácia.

Posso responder **qualquer pergunta** sobre seus dados em tempo real - estoque, vendas, receitas, fornecedores, financeiro e muito mais!

💡 **Exemplos:** "Como está meu estoque?", "Faturamento do mês", "Produtos acabando"

Como posso te ajudar?`, 
            'bot',
            null,
            true
          );
        }, 500);
      }
    } else if (!isOpen) {
      setHasInitialized(false);
    }
  }, [isOpen, hasInitialized, sessionId]);

  // Função inteligente para processar linguagem natural
  const processNaturalLanguage = async (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    try {
      // === CONSULTAS DE ESTOQUE ===
      if (message.includes('estoque') && (message.includes('como') || message.includes('situação'))) {
        const { data: produtos, error } = await supabase
          .from('insumos')
          .select('nome, estoque_atual, estoque_minimo, tipo')
          .not('estoque_atual', 'is', null);
        
        if (error) throw error;
        
        const totalProdutos = produtos?.length || 0;
        const produtosEmFalta = produtos?.filter(p => p.estoque_atual < p.estoque_minimo).length || 0;
        const produtosOk = totalProdutos - produtosEmFalta;
        
        addMessage(
          `📦 **Situação do seu estoque:**
          
📊 **Resumo geral:**
• Total de produtos: ${totalProdutos}
• Produtos com estoque OK: ${produtosOk}
• Produtos em falta/baixo: ${produtosEmFalta}

${produtosEmFalta > 0 ? `⚠️ **Atenção necessária:**
${produtos?.filter(p => p.estoque_atual < p.estoque_minimo).slice(0, 5).map((p, i) => 
  `${i + 1}. ${p.nome} - Atual: ${p.estoque_atual} | Mínimo: ${p.estoque_minimo}`
).join('\n')}` : '✅ **Parabéns!** Todos os produtos estão com estoque adequado.'}`,
          'bot',
          produtos
        );
        return;
      }

      // === PRODUTOS ACABANDO ===
      if (message.includes('acabando') || message.includes('terminando') || (message.includes('produtos') && message.includes('falta'))) {
        const { data: allProducts, error } = await supabase
          .from('insumos')
          .select('nome, estoque_atual, estoque_minimo, tipo')
          .not('estoque_atual', 'is', null)
          .not('estoque_minimo', 'is', null);
        
        if (error) throw error;
        
        const produtosAcabando = allProducts?.filter(produto => 
          produto.estoque_atual <= produto.estoque_minimo * 1.2 // 20% acima do mínimo
        ) || [];
        
        addMessage(
          `⚠️ **Produtos que estão acabando:**
          
${produtosAcabando.length > 0 ? 
  produtosAcabando.slice(0, 10).map((p, i) => {
    const status = p.estoque_atual < p.estoque_minimo ? '🔴 CRÍTICO' : '🟡 BAIXO';
    return `${i + 1}. **${p.nome}**
   ${status} - Atual: ${p.estoque_atual} | Mínimo: ${p.estoque_minimo}
   Tipo: ${p.tipo || 'N/A'}`;
  }).join('\n\n') + 
  (produtosAcabando.length > 10 ? `\n\n... e mais ${produtosAcabando.length - 10} produtos` : '')
  : '✅ **Ótima notícia!** Nenhum produto está acabando no momento.'}`,
          'bot',
          produtosAcabando
        );
        return;
      }

      // === BUSCA DE PRODUTO ESPECÍFICO COM PREÇO ===
      if (message.includes('valor') || message.includes('preço') || message.includes('quanto custa')) {
        // Extrair nome do produto da pergunta
        let productName = '';
        const patterns = [
          /(?:valor|preço|quanto custa).*?(?:do|da|de)?\s*(?:produto\s+)?["']?([^"'?]+)["']?/i,
          /["']([^"']+)["']/i, // Produto entre aspas
          /produto\s+([^\s?]+)/i // Após "produto"
        ];
        
        for (const pattern of patterns) {
          const match = userMessage.match(pattern);
          if (match && match[1]) {
            productName = match[1].trim();
            break;
          }
        }
        
        if (productName.length > 2) {
          const { data, error } = await supabase
            .from('insumos')
            .select('nome, tipo, estoque_atual, estoque_minimo, custo_unitario, unidade_medida')
            .ilike('nome', `%${productName}%`)
            .limit(5);
          
          if (error) throw error;
          
          if (data && data.length > 0) {
                          addMessage(
                `💰 **Informações sobre "${productName}":**
                
${data.map((p, i) => 
  `${i + 1}. **${p.nome}**
   💵 Custo unitário: R$ ${p.custo_unitario?.toFixed(2) || '0,00'}
   📦 Estoque atual: ${p.estoque_atual || 0} ${p.unidade_medida || 'un'}
   📊 Estoque mínimo: ${p.estoque_minimo || 0} ${p.unidade_medida || 'un'}
   🏷️ Tipo: ${p.tipo || 'N/A'}`
).join('\n\n')}`,
                'bot',
                data
              );
          } else {
            addMessage(
              `🔍 Não encontrei nenhum produto com o nome "${productName}".
              
💡 **Dicas:**
• Verifique a grafia
• Tente usar apenas parte do nome
• Use "buscar [nome]" para uma busca mais ampla`,
              'bot'
            );
          }
        } else {
          addMessage(
            `🤔 Não consegui identificar qual produto você quer consultar.
            
💡 **Exemplos:**
• "Qual valor do produto Arnica Montana?"
• "Preço da Sabadilla"
• "Quanto custa Calendula?"`,
            'bot'
          );
        }
        return;
      }

      // === FATURAMENTO E VENDAS ===
      if (message.includes('faturamento') || message.includes('vendas') || message.includes('receita')) {
        let startDate = new Date();
        let periodo = 'hoje';
        
        if (message.includes('mês') || message.includes('mensal')) {
          startDate.setDate(1); // Primeiro dia do mês
          periodo = 'este mês';
        } else if (message.includes('semana')) {
          startDate.setDate(startDate.getDate() - startDate.getDay()); // Domingo da semana
          periodo = 'esta semana';
        } else {
          startDate.setHours(0, 0, 0, 0); // Início do dia
        }
        
        const { data, error } = await supabase
          .from('pedidos')
          .select('total_amount, created_at, status')
          .gte('created_at', startDate.toISOString())
          .in('status', ['finalizado', 'entregue']);
        
        if (error) throw error;
        
        const totalFaturamento = data?.reduce((sum, pedido) => 
          sum + (pedido.total_amount || 0), 0
        ) || 0;
        
        const ticketMedio = data?.length ? totalFaturamento / data.length : 0;
        
        addMessage(
          `💰 **Faturamento ${periodo}:**
          
📊 **Resumo financeiro:**
• Valor total: R$ ${totalFaturamento.toFixed(2)}
• Pedidos finalizados: ${data?.length || 0}
• Ticket médio: R$ ${ticketMedio.toFixed(2)}

${data?.length > 0 ? `📈 **Performance:**
• Maior venda: R$ ${Math.max(...data.map(p => p.total_amount || 0)).toFixed(2)}
• Menor venda: R$ ${Math.min(...data.map(p => p.total_amount || 0)).toFixed(2)}` : '📋 Nenhuma venda registrada no período.'}`,
          'bot',
          data
        );
        return;
      }

      // === CLIENTES ===
      if (message.includes('cliente') && (message.includes('quantos') || message.includes('total'))) {
        // Assumindo que temos uma tabela de clientes ou podemos extrair dos pedidos
        const { data: pedidos, error } = await supabase
          .from('pedidos')
          .select('id, client_id, metadata')
          .not('client_id', 'is', null);
        
        if (error) throw error;
        
        // Contar clientes únicos
        const clientesUnicos = new Set();
        pedidos?.forEach(pedido => {
          if (pedido.client_id) {
            clientesUnicos.add(pedido.client_id);
          }
        });
        
        addMessage(
          `👥 **Informações sobre clientes:**
          
📊 **Estatísticas:**
• Clientes únicos: ${clientesUnicos.size}
• Total de pedidos: ${pedidos?.length || 0}
• Média de pedidos por cliente: ${clientesUnicos.size ? (pedidos?.length / clientesUnicos.size).toFixed(1) : '0'}

💡 **Dica:** Para análises mais detalhadas, acesse o módulo de Relatórios.`,
          'bot',
          Array.from(clientesUnicos)
        );
        return;
      }

      // === RECEITAS PROCESSADAS ===
      if (message.includes('receita') && (message.includes('hoje') || message.includes('processada') || message.includes('quantas'))) {
        const { data, error } = await supabase
          .from('receitas_processadas')
          .select('*')
          .gte('created_at', new Date().toISOString().split('T')[0]);
        
        if (error) throw error;
        
        addMessage(
          `📋 **Receitas processadas hoje:** ${data?.length || 0}
          
${data?.length > 0 ? `✅ **Status das receitas:**
${data.slice(0, 5).map((r: any, i: number) => 
  `${i + 1}. ${r.patient_name || 'Paciente não informado'} - ${r.validation_status}`
).join('\n')}

${data.length > 5 ? `\n... e mais ${data.length - 5} receitas` : ''}` : '❌ Nenhuma receita processada hoje ainda.'}`,
          'bot',
          data
        );
        return;
      }

      // === PEDIDOS ===
      if (message.includes('pedido') && (message.includes('hoje') || message.includes('status') || message.includes('quantos'))) {
        const { data, error } = await supabase
          .from('pedidos')
          .select('status, created_at')
          .gte('created_at', new Date().toISOString().split('T')[0]);
        
        if (error) throw error;
        
        const statusCount = data?.reduce((acc: any, pedido: any) => {
          acc[pedido.status] = (acc[pedido.status] || 0) + 1;
          return acc;
        }, {});
        
        addMessage(
          `📋 **Pedidos de hoje:** ${data?.length || 0}
          
${statusCount ? Object.entries(statusCount).map(([status, count]) => 
  `• ${status}: ${count} pedido(s)`
).join('\n') : 'Nenhum pedido hoje ainda.'}`,
          'bot',
          data
        );
        return;
      }

      // === BUSCA GERAL ===
      if (message.includes('buscar') || message.includes('procurar') || message.includes('encontrar')) {
        const searchTerm = userMessage.replace(/buscar|procurar|encontrar|produto/gi, '').trim();
        
        if (searchTerm.length > 2) {
          const { data, error } = await supabase
            .from('insumos')
            .select('nome, tipo, estoque_atual, custo_unitario, unidade_medida')
            .ilike('nome', `%${searchTerm}%`)
            .limit(8);
          
          if (error) throw error;
          
                      addMessage(
              `🔍 **Resultados para "${searchTerm}":**
              
${data?.length > 0 ? 
  data.map((p: any, i: number) => 
    `${i + 1}. **${p.nome}**
   💰 Custo: R$ ${p.custo_unitario?.toFixed(2) || '0,00'}
   📦 Estoque: ${p.estoque_atual || 0} ${p.unidade_medida || 'un'}
   🏷️ Tipo: ${p.tipo || 'N/A'}`
  ).join('\n\n')
  : 'Nenhum produto encontrado com esse termo.'}`,
              'bot',
              data
            );
          return;
        }
      }

      // === FORNECEDORES ===
      if (message.includes('fornecedor') && (message.includes('quantos') || message.includes('lista') || message.includes('todos'))) {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('nome, email, telefone, endereco')
          .limit(10);
        
        if (error) throw error;
        
        addMessage(
          `🏭 **Fornecedores cadastrados:** ${data?.length || 0}
          
${data?.length > 0 ? 
  data.map((f: any, i: number) => 
    `${i + 1}. **${f.nome}**
   📧 Email: ${f.email || 'N/A'}
   📞 Telefone: ${f.telefone || 'N/A'}
   📍 Endereço: ${f.endereco || 'N/A'}`
  ).join('\n\n')
  : 'Nenhum fornecedor cadastrado ainda.'}`,
          'bot',
          data
        );
        return;
      }

      // === EMBALAGENS ===
      if (message.includes('embalagem') && (message.includes('estoque') || message.includes('quantas') || message.includes('lista'))) {
        const { data, error } = await supabase
          .from('embalagens')
          .select('nome, tipo, estoque_atual, estoque_minimo, custo_unitario')
          .limit(10);
        
        if (error) throw error;
        
        addMessage(
          `📦 **Embalagens em estoque:** ${data?.length || 0}
          
${data?.length > 0 ? 
  data.map((e: any, i: number) => 
    `${i + 1}. **${e.nome}**
   🏷️ Tipo: ${e.tipo || 'N/A'}
   📦 Estoque: ${e.estoque_atual || 0}
   📊 Mínimo: ${e.estoque_minimo || 0}
   💰 Custo: R$ ${e.custo_unitario?.toFixed(2) || '0,00'}`
  ).join('\n\n')
  : 'Nenhuma embalagem cadastrada ainda.'}`,
          'bot',
          data
        );
        return;
      }

      // === ORDENS DE PRODUÇÃO ===
      if (message.includes('ordem') || message.includes('produção') || message.includes('producao')) {
        const { data, error } = await supabase
          .from('ordens_producao')
          .select('numero_ordem, status, prioridade, quantidade_total, forma_farmaceutica, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) throw error;
        
        const statusCount = data?.reduce((acc: any, ordem: any) => {
          acc[ordem.status] = (acc[ordem.status] || 0) + 1;
          return acc;
        }, {});
        
        addMessage(
          `🏭 **Ordens de Produção:** ${data?.length || 0}
          
📊 **Status das ordens:**
${statusCount ? Object.entries(statusCount).map(([status, count]) => 
  `• ${status}: ${count} ordem(s)`
).join('\n') : 'Nenhuma ordem encontrada.'}

📋 **Últimas ordens:**
${data?.slice(0, 5).map((o: any, i: number) => 
  `${i + 1}. **${o.numero_ordem}**
   Status: ${o.status} | Prioridade: ${o.prioridade}
   Forma: ${o.forma_farmaceutica || 'N/A'}
   Qtd: ${o.quantidade_total}`
).join('\n\n') || 'Nenhuma ordem cadastrada.'}`,
          'bot',
          data
        );
        return;
      }

      // === USUÁRIOS INTERNOS ===
      if (message.includes('usuário') || message.includes('usuario') || message.includes('funcionário') || message.includes('funcionario')) {
        const { data, error } = await supabase
          .from('usuarios_internos')
          .select('nome_completo, cargo_perfil, email_contato, ativo')
          .eq('ativo', true);
        
        if (error) throw error;
        
        const cargoCount = data?.reduce((acc: any, user: any) => {
          acc[user.cargo_perfil] = (acc[user.cargo_perfil] || 0) + 1;
          return acc;
        }, {});
        
        addMessage(
          `👥 **Usuários internos ativos:** ${data?.length || 0}
          
📊 **Por cargo:**
${cargoCount ? Object.entries(cargoCount).map(([cargo, count]) => 
  `• ${cargo}: ${count} pessoa(s)`
).join('\n') : 'Nenhum usuário encontrado.'}

👤 **Lista de usuários:**
${data?.slice(0, 8).map((u: any, i: number) => 
  `${i + 1}. **${u.nome_completo}**
   Cargo: ${u.cargo_perfil}
   Email: ${u.email_contato}`
).join('\n\n') || 'Nenhum usuário cadastrado.'}`,
          'bot',
          data
        );
        return;
      }

      // === MOVIMENTAÇÕES FINANCEIRAS ===
      if (message.includes('movimentação') || message.includes('movimentacao') || message.includes('caixa') || message.includes('financeiro')) {
        const { data, error } = await supabase
          .from('movimentacoes_caixa')
          .select('tipo_movimentacao, valor, descricao, data_movimentacao')
          .gte('data_movimentacao', new Date().toISOString().split('T')[0])
          .order('data_movimentacao', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        const entradas = data?.filter(m => m.tipo_movimentacao === 'entrada').reduce((sum, m) => sum + m.valor, 0) || 0;
        const saidas = data?.filter(m => m.tipo_movimentacao === 'saida').reduce((sum, m) => sum + m.valor, 0) || 0;
        
        addMessage(
          `💰 **Movimentações financeiras hoje:**
          
📊 **Resumo:**
• Entradas: R$ ${entradas.toFixed(2)}
• Saídas: R$ ${saidas.toFixed(2)}
• Saldo: R$ ${(entradas - saidas).toFixed(2)}

📋 **Últimas movimentações:**
${data?.slice(0, 5).map((m: any, i: number) => 
  `${i + 1}. ${m.tipo_movimentacao === 'entrada' ? '💚' : '🔴'} **R$ ${m.valor.toFixed(2)}**
   ${m.descricao}
   ${new Date(m.data_movimentacao).toLocaleTimeString('pt-BR')}`
).join('\n\n') || 'Nenhuma movimentação hoje.'}`,
          'bot',
          data
        );
        return;
      }

      // === LOTES ===
      if (message.includes('lote') && (message.includes('vencimento') || message.includes('validade') || message.includes('vencendo'))) {
        const { data, error } = await supabase
          .from('lotes_insumos')
          .select('numero_lote, data_validade, quantidade_atual, insumos(nome)')
          .not('data_validade', 'is', null)
          .order('data_validade', { ascending: true })
          .limit(10);
        
        if (error) throw error;
        
        const hoje = new Date();
        const em30Dias = new Date();
        em30Dias.setDate(hoje.getDate() + 30);
        
                 const lotesVencendo = data?.filter(l => 
           l.data_validade && new Date(l.data_validade) <= em30Dias
         ) || [];
        
        addMessage(
          `📅 **Lotes por vencimento:**
          
⚠️ **Vencendo em 30 dias:** ${lotesVencendo.length}
          
${lotesVencendo.length > 0 ? 
  lotesVencendo.map((l: any, i: number) => 
         `${i + 1}. **Lote ${l.numero_lote}**
    Produto: ${l.insumos?.nome || 'N/A'}
    Validade: ${l.data_validade ? new Date(l.data_validade).toLocaleDateString('pt-BR') : 'N/A'}
    Quantidade: ${l.quantidade_atual || 0}`
  ).join('\n\n')
  : '✅ Nenhum lote vencendo nos próximos 30 dias!'}`,
          'bot',
          data
        );
        return;
      }

      // === COMANDO DE AJUDA EXPANDIDO ===
      if (message.includes('ajuda') || message.includes('help') || message.includes('comandos')) {
        addMessage(
          `🆘 **Comandos disponíveis:**
          
📊 **Consultas gerais:**
• "Como está meu estoque?"
• "Quais produtos estão acabando?"
• "Qual meu faturamento este mês?"
• "Quantos clientes tenho?"

💰 **Preços e produtos:**
• "Qual valor do produto [nome]?"
• "Buscar [nome do produto]"
• "Preço da Arnica Montana"

📋 **Operacional:**
• "Receitas processadas hoje"
• "Pedidos de hoje"
• "Status dos pedidos"
• "Ordens de produção"

🏭 **Gestão:**
• "Lista de fornecedores"
• "Embalagens em estoque"
• "Usuários internos"
• "Movimentações financeiras"
• "Lotes vencendo"

💡 **Dica:** Faça perguntas em linguagem natural! Eu entendo português e consulto seus dados em tempo real.`,
          'bot'
        );
        return;
      }

      // === RESPOSTA PADRÃO INTELIGENTE ===
      addMessage(
        `🤔 Entendi que você quer saber algo sobre seus dados, mas não consegui identificar exatamente o que.

**Algumas sugestões baseadas na sua pergunta:**
• "Como está meu estoque?"
• "Quais produtos estão acabando?"  
• "Qual valor do produto [nome]?"
• "Quantas receitas foram processadas hoje?"
• "Qual meu faturamento este mês?"

💡 **Dica:** Seja mais específico ou use "ajuda" para ver todos os comandos disponíveis!`,
        'bot',
        null,
        true
      );

    } catch (error) {
      console.error('Erro ao processar comando:', error);
      addMessage(
        '❌ Ops! Tive um problema ao consultar os dados. Verifique sua conexão e tente novamente.',
        'bot'
      );
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessageText = inputValue;
    addMessage(userMessageText, 'user');
    setInputValue('');
    setIsLoading(true);

    // Processar comando com IA
    await processNaturalLanguage(userMessageText);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] p-0 flex flex-col max-h-[85vh] [&>button]:hidden">
        <DialogHeader className="p-6 pb-4 relative bg-gradient-to-r from-homeo-blue to-homeo-accent text-white">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Database className="h-6 w-6" />
            Assistente Inteligente Pharma.AI
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            Faça qualquer pergunta sobre seus dados em linguagem natural
          </DialogDescription>
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={clearConversationHistory}
              title="Limpar histórico de conversa"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Limpar histórico</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${ 
                    msg.sender === 'user' 
                      ? 'bg-homeo-blue text-white rounded-br-none' 
                      : msg.sender === 'bot' 
                      ? 'bg-gray-100 text-gray-800 rounded-bl-none border'
                      : 'bg-yellow-100 text-yellow-800 text-xs italic text-center w-full'
                  }`}
                >
                  {msg.sender === 'user' && <User className="w-4 h-4 inline mr-1 mb-0.5" />}
                  {msg.sender === 'bot' && <Bot className="w-4 h-4 inline mr-1 mb-0.5 text-homeo-blue" />}
                  <div className="whitespace-pre-line">{msg.text}</div>
                  
                  {/* Mostrar dados estruturados se houver */}
                  {msg.data && msg.data.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <Badge variant="outline" className="text-xs">
                        {msg.data.length} registro(s) encontrado(s)
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none flex items-center border">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-homeo-blue" />
                  Analisando sua pergunta e consultando dados...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-gray-50">
          <div className="w-full">
            {/* Botões de ação rápida expandidos */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => processNaturalLanguage('como está meu estoque')}
                disabled={isLoading}
                className="text-xs"
              >
                <Package className="h-3 w-3 mr-1" />
                Meu Estoque
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => processNaturalLanguage('produtos acabando')}
                disabled={isLoading}
                className="text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Produtos Acabando
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => processNaturalLanguage('faturamento este mês')}
                disabled={isLoading}
                className="text-xs"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Faturamento
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => processNaturalLanguage('receitas processadas hoje')}
                disabled={isLoading}
                className="text-xs"
              >
                <FileText className="h-3 w-3 mr-1" />
                Receitas Hoje
              </Button>
            </div>
            
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                handleSendMessage(); 
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input 
                ref={inputRef}
                type="text" 
                placeholder="Faça qualquer pergunta... (ex: 'Como está meu estoque?', 'Qual valor da Arnica?')" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                disabled={isLoading}
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || inputValue.trim() === ''} 
                className="bg-homeo-blue hover:bg-homeo-blue/90"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminChatbot; 