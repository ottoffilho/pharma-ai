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
import { supabase } from '@/integrations/supabase/client';

// URL do Webhook do n8n (deve vir de uma variável de ambiente)
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_LEAD_WEBHOOK_URL || "https://ottoffilho.app.n8n.cloud/webhook-test/pharma-ai";
// URL do Handler do LLM (deve vir de uma variável de ambiente)
const CHATBOT_LLM_HANDLER_URL = import.meta.env.VITE_CHATBOT_LLM_HANDLER_URL;

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
      }, 30); // 30ms entre cada caractere para efeito suave
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
    setIsLoading(true);
    addMessage("Obrigado! Estamos salvando suas informações...", 'system');
    
    try {
      // 1. Salvar no Supabase primeiro (dados principais)
      console.log("Salvando no Supabase:", finalLeadData);
      
      const { data: supabaseData, error: supabaseError } = await (supabase as any)
        .rpc('insert_lead_chatbot', {
          p_nome_contato: finalLeadData.nomeContato,
          p_nome_farmacia: finalLeadData.nomeFarmacia,
          p_email: finalLeadData.email,
          p_telefone: finalLeadData.telefone || null,
          p_transcricao: JSON.stringify(conversationTranscript.map(m => ({
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp
          })).slice(0, 20))
        });

      if (supabaseError) {
        console.error("Erro ao salvar no Supabase:", supabaseError);
        throw new Error('Falha ao salvar no banco de dados.');
      }

      console.log("Dados salvos no Supabase:", supabaseData);

      // 2. Enviar para n8n (notificações, automações, etc.)
      const leadId = Array.isArray(supabaseData) && (supabaseData as any).length > 0 ? (supabaseData as any)[0]?.id : 'unknown';
      console.log("Enviando para n8n:", { ...finalLeadData, supabase_id: leadId });
      
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...finalLeadData,
          supabase_id: leadId,
          messages_transcription: conversationTranscript.map(m => ({
            sender: m.sender, 
            text: m.text, 
            timestamp: m.timestamp 
          })).slice(0, 20),
          origem: 'chatbot_landing',
          saved_to_supabase: true
        }),
      });

      if (!n8nResponse.ok) {
        console.warn("N8N submission failed but data was saved to Supabase:", n8nResponse.status);
        // Não falha aqui pois o dado principal já foi salvo
      } else {
        const n8nResponseData = await n8nResponse.json();
        console.log("Resposta do n8n:", n8nResponseData);
      }
      
      addMessage("Seus dados foram salvos com sucesso! Nossa equipe entrará em contato em breve.", 'bot', true);
      setConversationStep('finished');
      
    } catch (error) {
      console.error('Erro ao processar lead:', error);
      addMessage("Desculpe, tivemos um problema ao salvar seus dados. Por favor, tente novamente mais tarde ou entre em contato por outro canal.", 'bot', true);
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