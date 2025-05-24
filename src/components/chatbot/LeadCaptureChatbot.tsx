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
import { Send, X, Loader2, User, Bot } from 'lucide-react';
import pharmaLogo from '@/assets/logo/phama-horizon.png';
// import { supabase } from '@/integrations/supabase/client'; // Temporariamente removido

// URL do Webhook do n8n (deve vir de uma variável de ambiente)
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_LEAD_WEBHOOK_URL || "https://ottoffilho.app.n8n.cloud/webhook-test/pharma-ai";
// URL do Handler do LLM (deve vir de uma variável de ambiente)
const CHATBOT_LLM_HANDLER_URL = import.meta.env.VITE_CHATBOT_LLM_HANDLER_URL;
// URL da Edge Function AI Agent
const AI_AGENT_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/chatbot-ai-agent';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp?: Date;
}

interface LeadData {
  nomeContato: string;
  nomeFarmacia: string;
  email: string;
  telefone: string;
}

interface LeadCaptureChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadCaptureChatbot: React.FC<LeadCaptureChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationStep, setConversationStep] = useState('greeting');
  const [leadData, setLeadData] = useState<Partial<LeadData>>({});
  const [hasInitialized, setHasInitialized] = useState(false);
  const [leadAlreadySent, setLeadAlreadySent] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para garantir foco no input
  const ensureInputFocus = () => {
    setTimeout(() => {
      if (inputRef.current && isOpen && conversationStep !== 'finished' && conversationStep !== 'conversation_ended') {
        inputRef.current.focus();
      }
    }, 100);
  };

  const addMessage = (text: string, sender: ChatMessage['sender'], useTypingEffect: boolean = false) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID generation
      text: useTypingEffect ? '' : text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Efeito de digitação apenas para mensagens do bot
    if (useTypingEffect && sender === 'bot') {
      let currentText = '';
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          currentText += text[charIndex];
          setMessages((prevMessages) => 
            prevMessages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, text: currentText }
                : msg
            )
          );
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // Garantir foco após terminar de digitar
          ensureInputFocus();
        }
      }, 23); // 30ms entre cada caractere para efeito suave -> Alterado para 15ms
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Efeito para manter o foco no input sempre ativo
  useEffect(() => {
    if (isOpen && conversationStep !== 'finished' && conversationStep !== 'conversation_ended') {
      ensureInputFocus();
    }
  }, [isOpen, isLoading, messages, conversationStep]);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      // Reset chat state when opened
      setMessages([]);
      setInputValue('');
      setIsLoading(false);
      setConversationStep('initial_greeting');
      setLeadData({});
      setLeadAlreadySent(false);
      setCurrentSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      setHasInitialized(true);
      
      // Initial bot message with typing effect
      setTimeout(() => {
        addMessage(
          "Olá! Sou o assistente virtual do Pharma.AI. Nosso sistema de gestão para farmácias de manipulação está em desenvolvimento e usa IA para otimizar processos. Gostaria de saber mais ou ser contatado para uma demonstração futura?", 
          'bot',
          true
        );
      }, 500);
    } else if (!isOpen) {
      setHasInitialized(false);
    }
  }, [isOpen, hasInitialized]);

  const handleLlmResponse = (botResponseText: string, nextStep?: string, extractedData?: Partial<LeadData>) => {
    addMessage(botResponseText, 'bot', true); // Sempre usar efeito de digitação para mensagens do bot
    if (nextStep) {
      setConversationStep(nextStep);
    }
    if (extractedData) {
      setLeadData(prevData => ({ ...prevData, ...extractedData }));
    }
    setIsLoading(false);
    
    // Garantir foco no input após resposta do bot
    ensureInputFocus();
  };

  const submitLeadToSupabaseAndN8n = async (finalLeadData: LeadData, conversationTranscript: ChatMessage[]) => {
    // Verificar se o lead já foi enviado para evitar duplicatas
    if (leadAlreadySent) {
      console.log("Lead já foi enviado, pulando envio para n8n");
      return;
    }
    
    setIsLoading(true);
    addMessage("Obrigado! Estamos processando suas informações...", 'system');
    
    try {
      // Enviar para n8n (por enquanto, até configurar Supabase)
      console.log("Enviando dados para n8n:", finalLeadData);
      
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...finalLeadData,
          messages_transcription: conversationTranscript.map(m => ({
            sender: m.sender, 
            text: m.text, 
            timestamp: m.timestamp 
          })).slice(0, 20),
          origem: 'chatbot_landing',
          timestamp: new Date().toISOString(),
          // Informações adicionais
          user_agent: navigator.userAgent,
          page_url: window.location.href
        }),
      });

      if (!n8nResponse.ok) {
        console.error("Falha ao enviar para n8n:", n8nResponse.status);
        throw new Error('Falha ao processar seus dados.');
      }

      const n8nResponseData = await n8nResponse.json();
      console.log("Resposta do n8n:", n8nResponseData);
      
      // Marcar que o lead foi enviado com sucesso
      setLeadAlreadySent(true);
      
      // Nova mensagem final com opção de continuar conversa
      addMessage(`🎯 Perfeito, ${finalLeadData.nomeFarmacia}! 

Seus dados foram registrados e nossa equipe comercial entrará em contato em breve para apresentar uma proposta personalizada.

🤖 Enquanto isso, que tal conhecer melhor como o Pharma.AI pode revolucionar sua farmácia?

Posso explicar:
• Como nossa IA lê receitas automaticamente
• Sistema completo de gestão (estoque, financeiro, fiscal)
• Automações que economizam horas de trabalho
• E muito mais...

💬 Digite **SIM** para saber mais ou **OBRIGADO** para finalizar.`, 'bot', true);
      setConversationStep('offering_additional_info');
      
    } catch (error) {
      console.error('Erro ao processar lead:', error);
      addMessage("Desculpe, tivemos um problema ao processar seus dados. Por favor, tente novamente mais tarde ou entre em contato por outro canal.", 'bot', true);
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para chamar o AI Agent
  const callAIAgent = async (userMessage: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(AI_AGENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          userMessage: userMessage,
          leadData: leadData,
          action: 'ai_conversation'
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Agent error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta do AI Agent:', result);
      
      // Adicionar resposta do AI Agent
      addMessage(result.botResponse, 'bot', true);
      
    } catch (error) {
      console.error('Erro ao chamar AI Agent:', error);
      addMessage("Desculpe, estou com dificuldades técnicas no momento. Nossa equipe pode esclarecer suas dúvidas pessoalmente. Em breve entraremos em contato!", 'bot', true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessageText = inputValue;
    addMessage(userMessageText, 'user');
    setInputValue('');
    setIsLoading(true);

    // Manter foco no input após enviar mensagem
    ensureInputFocus();

    // Se estivermos no step de conversa detalhada, chamar AI Agent diretamente
    if (conversationStep === 'detailed_conversation') {
      await callAIAgent(userMessageText);
      return;
    }

    // Se não houver URL do LLM configurada, simula a coleta de dados
    if (!CHATBOT_LLM_HANDLER_URL) {
        // Simulação da lógica do LLM e coleta de dados (REMOVER QUANDO O LLM ESTIVER INTEGRADO)
        setTimeout(() => {
            let botResponse = "Desculpe, não entendi. Pode repetir?";
            let nextStep = conversationStep;
            let extracted: Partial<LeadData> = {};

            if (conversationStep === 'initial_greeting') {
                const positiveResponses = [
                    'sim', 'com certeza', 'ok', 'gostaria', 'por favor', 'claro', 'quero', 
                    'aceito', 'vamos', 'pode ser', 'tenho interesse', 
                    'me conte', 'adoraria', 'perfeito', 'vamos lá',
                    'pode', 'certo', 'beleza', 'top', 'legal', 'otimo'
                ];
                
                const userText = userMessageText.toLowerCase();
                const isPositive = positiveResponses.some(response => userText.includes(response));
                
                if (isPositive) {
                    botResponse = "Ótimo! Para começarmos, qual o nome da sua farmácia?";
                    nextStep = 'collecting_pharmacy_name';
                } else {
                    botResponse = "Entendido. Se mudar de ideia, estarei por aqui. Obrigado!";
                    nextStep = 'conversation_ended';
                }
            } else if (conversationStep === 'collecting_pharmacy_name') {
                botResponse = `Entendido, ${userMessageText}. E qual o seu nome?`;
                extracted.nomeFarmacia = userMessageText;
                nextStep = 'collecting_contact_name';
            } else if (conversationStep === 'collecting_contact_name') {
                botResponse = `Prazer, ${userMessageText}! Qual o seu e-mail de contato?`;
                extracted.nomeContato = userMessageText;
                nextStep = 'collecting_email';
            } else if (conversationStep === 'collecting_email') {
                // Adicionar validação de email simples aqui se desejar
                botResponse = `Perfeito. E qual o seu telefone? (opcional)`;
                extracted.email = userMessageText;
                nextStep = 'collecting_phone';
            } else if (conversationStep === 'collecting_phone') {
                botResponse = "Excelente! Coletamos todas as informações necessárias.";
                if (userMessageText.toLowerCase() !== 'não' && userMessageText.toLowerCase() !== 'nao') {
                  extracted.telefone = userMessageText;
                }
                nextStep = 'data_collection_complete';
            } else if (conversationStep === 'offering_additional_info') {
                const positiveResponses = ['sim', 'yes', 'quero', 'gostaria', 'claro', 'pode', 'vamos'];
                const negativeResponses = ['obrigado', 'obrigada', 'não', 'nao', 'tchau', 'bye', 'finalizar'];
                
                const userText = userMessageText.toLowerCase();
                const isPositive = positiveResponses.some(response => userText.includes(response));
                const isNegative = negativeResponses.some(response => userText.includes(response));
                
                if (isPositive) {
                    botResponse = `Perfeito! Vou te ajudar a conhecer melhor o Pharma.AI.
                    
🚀 Agora estou conectado com nossa IA especializada que conhece todos os detalhes do sistema!

Sobre o que gostaria de saber mais?
• Gestão de receitas com IA
• Controle de estoque inteligente  
• Módulo fiscal e NF-e
• Relatórios e análises
• Módulos específicos do sistema

Digite sua pergunta e eu vou te dar uma resposta detalhada! 😊`;
                    nextStep = 'detailed_conversation';
                } else if (isNegative) {
                    botResponse = `Muito obrigado pela sua atenção! 
                    
✅ Seus dados foram registrados com sucesso
📞 Nossa equipe entrará em contato em breve
🌟 Aguarde nossa proposta personalizada

Tenha um ótimo dia e até logo! 👋`;
                    nextStep = 'finished';
                } else {
                    botResponse = `Não entendi sua resposta. 
                    
Digite **SIM** se quiser saber mais sobre o Pharma.AI ou **OBRIGADO** para finalizar.`;
                    nextStep = 'offering_additional_info'; // Mantém no mesmo step
                }
            } else if (conversationStep === 'detailed_conversation') {
                // Chamar AI Agent para resposta inteligente - não usar setTimeout aqui
                botResponse = "Processando sua pergunta...";
                nextStep = 'detailed_conversation';
            }
            
            handleLlmResponse(botResponse, nextStep, extracted);

            if (nextStep === 'data_collection_complete') {
                const completeLeadData = { ...leadData, ...extracted } as LeadData;
                if (completeLeadData.email && completeLeadData.nomeFarmacia) {
                    submitLeadToSupabaseAndN8n(completeLeadData, messages);
                } else {
                    addMessage("Parece que faltaram informações essenciais (nome da farmácia ou e-mail). Poderia tentar novamente?", 'bot', true);
                    setConversationStep('initial_greeting'); // Reinicia para tentar de novo
                }
            }
        }, 1000);
        return;
    }

    // Lógica para chamar o backend do LLM (quando CHATBOT_LLM_HANDLER_URL estiver configurado)
    try {
      const response = await fetch(CHATBOT_LLM_HANDLER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Incluir quaisquer outros headers necessários, como autenticação
        },
        body: JSON.stringify({
          userMessage: userMessageText,
          conversationHistory: messages.slice(-5), // Enviar as últimas 5 mensagens para contexto
          conversationStep: conversationStep,
          currentLeadData: leadData,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM handler failed with status: ${response.status}`);
      }

      const result = await response.json();
      handleLlmResponse(result.botResponse, result.nextStep, result.extractedData);
      
      if (result.nextStep === 'data_collection_complete') {
        const completeLeadData = { ...leadData, ...result.extractedData } as LeadData;
        if (completeLeadData.email && completeLeadData.nomeFarmacia) {
            submitLeadToSupabaseAndN8n(completeLeadData, messages);
        } else {
            addMessage("Parece que faltaram informações essenciais (nome da farmácia ou e-mail). Poderia tentar novamente?", 'bot');
            setConversationStep('initial_greeting'); 
        }
      }

    } catch (error) {
      console.error('Erro ao comunicar com o LLM handler:', error);
      addMessage("Desculpe, estou com dificuldades para processar sua mensagem no momento. Tente novamente em alguns instantes.", 'bot', true);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] p-0 flex flex-col max-h-[85vh] [&>button]:hidden">
        <DialogHeader className="p-6 pb-16 relative">
          <DialogTitle className="sr-only">
            Assistente Virtual Pharma.AI
          </DialogTitle>
          <div className="flex justify-center">
            <img 
              src={pharmaLogo} 
              alt="Pharma.AI Logo" 
              className="w-18 h-14 object-contain"
            />
          </div>
          <DialogDescription className="text-center mt-2">
            Converse com nosso assistente virtual para conhecer mais sobre o Pharma.AI e suas funcionalidades.
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 z-10" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </Button>
        </DialogHeader>
        
        <ScrollArea className="flex-grow p-6 pt-0" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] p-3 rounded-lg text-sm ${ 
                    msg.sender === 'user' 
                      ? 'bg-homeo-blue text-white rounded-br-none' 
                      : msg.sender === 'bot' 
                      ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                      : 'bg-yellow-100 text-yellow-800 text-xs italic text-center w-full' /* System message styling */
                  }`}
                >
                  {msg.sender === 'user' && <User className="w-4 h-4 inline mr-1 mb-0.5" />}
                  {msg.sender === 'bot' && <Bot className="w-4 h-4 inline mr-1 mb-0.5" />}
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Digitando...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {conversationStep !== 'finished' && conversationStep !== 'conversation_ended' && (
          <DialogFooter className="p-4 border-t">
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
                placeholder="Digite sua mensagem..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
                disabled={isLoading}
                autoFocus
                onBlur={ensureInputFocus} // Refocar quando perder o foco
              />
              <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === ''} className="bg-homeo-blue hover:bg-homeo-blue/90">
                <Send className="h-5 w-5" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </DialogFooter>
        )}
         { (conversationStep === 'finished' || conversationStep === 'conversation_ended') && (
            <DialogFooter className="p-4 border-t justify-center">
                <Button variant="outline" onClick={onClose}>Fechar Chat</Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureChatbot; 