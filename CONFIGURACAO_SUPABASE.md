# Configuração do Supabase - Pharma.AI

## Status Atual
O chatbot está atualmente configurado para funcionar **apenas com webhook n8n**, pois o Supabase ainda não foi configurado. O erro 403 foi resolvido removendo temporariamente a integração com Supabase.

## Para Configurar o Supabase

### 1. Variáveis de Ambiente
Criar arquivo `.env` na raiz do projeto:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Configurações do Chatbot
VITE_N8N_WEBHOOK_URL=https://ottoffilho.app.n8n.cloud/webhook-test/pharma-ai
VITE_CHATBOT_LLM_HANDLER_URL=

# Outras configurações
VITE_APP_NAME=Pharma.AI
```

### 2. Configuração do Banco de Dados

#### a) Criar tabela para leads capturados:

```sql
CREATE TABLE leads_capturados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_contato TEXT NOT NULL,
  nome_farmacia TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  transcricao JSONB,
  origem TEXT DEFAULT 'chatbot_landing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### b) Configurar RLS (Row Level Security):

```sql
-- Habilitar RLS
ALTER TABLE leads_capturados ENABLE ROW LEVEL SECURITY;

-- Política para inserção (permite inserção para usuários anônimos)
CREATE POLICY "Permitir inserção de leads" ON leads_capturados
  FOR INSERT WITH CHECK (true);

-- Política para leitura (apenas usuários autenticados)
CREATE POLICY "Permitir leitura para usuários autenticados" ON leads_capturados
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### c) Criar função RPC para inserção de leads:

```sql
CREATE OR REPLACE FUNCTION insert_lead_chatbot(
  p_nome_contato TEXT,
  p_nome_farmacia TEXT,
  p_email TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_transcricao TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO leads_capturados (
    nome_contato,
    nome_farmacia,
    email,
    telefone,
    transcricao
  )
  VALUES (
    p_nome_contato,
    p_nome_farmacia,
    p_email,
    p_telefone,
    p_transcricao::jsonb
  )
  RETURNING leads_capturados.id, leads_capturados.created_at;
END;
$$;
```

### 3. Reativar a Integração

#### a) Descomentar a importação do Supabase:

No arquivo `src/components/chatbot/LeadCaptureChatbot.tsx`, linha 11:

```typescript
import { supabase } from '@/integrations/supabase/client';
```

#### b) Substituir a função `submitLeadToSupabaseAndN8n`:

```typescript
const submitLeadToSupabaseAndN8n = async (finalLeadData: LeadData, conversationTranscript: ChatMessage[]) => {
  setIsLoading(true);
  addMessage("Obrigado! Estamos salvando suas informações...", 'system');
  
  try {
    // 1. Salvar no Supabase primeiro (dados principais)
    console.log("Salvando no Supabase:", finalLeadData);
    
    const { data: supabaseData, error: supabaseError } = await supabase
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
    const leadId = Array.isArray(supabaseData) && supabaseData.length > 0 ? supabaseData[0]?.id : 'unknown';
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
```

## Status dos Dados Atuais

Enquanto o Supabase não é configurado, todos os leads capturados pelo chatbot estão sendo enviados para o webhook n8n:
- **URL**: `https://ottoffilho.app.n8n.cloud/webhook-test/pharma-ai`
- **Dados incluídos**: Nome, farmácia, e-mail, telefone, transcrição da conversa, timestamp, user agent, URL da página

## Próximos Passos

1. **Configurar projeto Supabase**
2. **Executar migrations SQL acima**
3. **Configurar variáveis de ambiente**
4. **Reativar código do Supabase**
5. **Testar integração completa**

---
*Última atualização: 2024-05-21* 