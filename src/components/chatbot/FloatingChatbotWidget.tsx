import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bot } from 'lucide-react';
import LeadCaptureChatbot from './LeadCaptureChatbot'; // Ajuste o caminho se necessário

const FloatingChatbotWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-homeo-blue hover:bg-homeo-blue/90 shadow-lg flex items-center justify-center z-50"
        aria-label="Abrir chat com assistente virtual"
      >
        <Bot className="h-8 w-8 text-white" />
      </Button>
      
      {/* O componente LeadCaptureChatbot já usa um Dialog, então ele funcionará como o modal */}
      {/* Podemos precisar ajustar o estilo do DialogContent em LeadCaptureChatbot para um modal maior */}
      <LeadCaptureChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default FloatingChatbotWidget; 