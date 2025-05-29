# Sistema de Recuperação de Senha - Pharma.AI

## Visão Geral

O sistema de recuperação de senha permite que usuários redefinam suas senhas através de um link seguro enviado por email. O fluxo é totalmente automatizado e segue as melhores práticas de segurança.

## Fluxo Completo

### 1. Solicitação de Recuperação
- Usuário acessa `/esqueci-senha`
- Informa o email cadastrado
- Sistema verifica se o email existe e se o usuário está ativo
- Gera token seguro com validade de 1 hora
- Envia email com link de recuperação

### 2. Validação do Token
- Usuário clica no link do email
- Sistema verifica se o token é válido e não expirou
- Redireciona para formulário de nova senha

### 3. Redefinição da Senha
- Usuário define nova senha (com validação de segurança)
- Sistema atualiza a senha no Supabase Auth
- Token é marcado como usado
- Usuário é redirecionado para login

## Componentes Implementados

### Páginas

#### `EsqueciSenha.tsx`
- Formulário para solicitar recuperação
- Validação de email
- Feedback visual do envio
- Estados de loading e sucesso

#### `RedefinirSenha.tsx`
- Validação automática do token
- Formulário de nova senha com validação robusta
- Estados para token inválido/expirado
- Confirmação de sucesso

### Serviços

#### `AuthService` (métodos adicionados)
- `solicitarRecuperacaoSenha(email)`: Inicia o processo
- `verificarTokenRecuperacao(token, email)`: Valida token
- `redefinirSenha(token, email, novaSenha)`: Atualiza senha
- `gerarTokenRecuperacao()`: Gera token seguro

### Edge Function

#### `enviar-email-recuperacao`
- Processa envio de emails
- Template HTML responsivo com logo
- Integração com Resend API
- Log de emails enviados

## Estrutura do Banco de Dados

### Tabela `tokens_recuperacao_senha`
```sql
- id: UUID (PK)
- usuario_id: UUID (FK para usuarios)
- token: VARCHAR(255) UNIQUE
- email: VARCHAR(255)
- expires_at: TIMESTAMP
- usado: BOOLEAN
- usado_em: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabela `logs_email`
```sql
- id: UUID (PK)
- tipo: VARCHAR(50)
- destinatario: VARCHAR(255)
- assunto: TEXT
- status: VARCHAR(20)
- erro_detalhes: TEXT
- dados_extras: JSONB
- enviado_em: TIMESTAMP
- created_at: TIMESTAMP
```

## Segurança Implementada

### Validações
- ✅ Email deve existir no sistema
- ✅ Usuário deve estar ativo
- ✅ Token único e seguro (64 caracteres)
- ✅ Expiração em 1 hora
- ✅ Token de uso único
- ✅ Validação de senha forte

### Proteções
- ✅ RLS (Row Level Security) nas tabelas
- ✅ Logs de auditoria
- ✅ Rate limiting implícito (1 token por vez)
- ✅ Limpeza automática de tokens expirados

### Políticas RLS
- Usuários só veem seus próprios tokens
- Sistema pode inserir/atualizar tokens
- Apenas proprietários veem logs de email

## Template de Email

### Características
- 📧 Design responsivo e profissional
- 🎨 Logo Pharma.AI integrada
- 🔐 Botão de ação destacado
- ⚠️ Avisos de segurança
- 📱 Compatível com dispositivos móveis
- 🌐 Fallback para link manual

### Conteúdo
- Saudação personalizada com nome do usuário
- Instruções claras
- Link de recuperação com validade
- Avisos de segurança
- Informações de contato

## Configuração Necessária

### Variáveis de Ambiente
```bash
# Resend API (recomendado)
RESEND_API_KEY=re_RS24Soe1_34X9KqkQrEaVw9Y263UDUcps

# Ou SMTP tradicional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@pharma-ai.com
```

### Deploy da Edge Function
```bash
supabase functions deploy enviar-email-recuperacao
```

### Aplicar Migrações
```bash
supabase db push
```

## Monitoramento

### Logs Disponíveis
- Solicitações de recuperação
- Emails enviados/falhados
- Tokens utilizados
- Tentativas de acesso inválido

### Métricas Importantes
- Taxa de sucesso de envio de emails
- Tempo médio de recuperação
- Tokens expirados vs utilizados
- Tentativas de uso de tokens inválidos

## Manutenção

### Limpeza Automática
A função `limpar_tokens_expirados()` remove tokens antigos:
```sql
SELECT limpar_tokens_expirados();
```

### Monitoramento de Emails
Verificar logs na tabela `logs_email`:
```sql
SELECT * FROM logs_email 
WHERE tipo = 'recuperacao_senha' 
ORDER BY enviado_em DESC;
```

## Testes

### Cenários de Teste
1. ✅ Email válido e usuário ativo
2. ✅ Email inexistente
3. ✅ Usuário inativo
4. ✅ Token válido
5. ✅ Token expirado
6. ✅ Token já usado
7. ✅ Senha com validação
8. ✅ Redefinição bem-sucedida

### Como Testar
1. Criar usuário de teste
2. Solicitar recuperação
3. Verificar email recebido
4. Testar link de recuperação
5. Definir nova senha
6. Fazer login com nova senha

## Troubleshooting

### Email não chega
- Verificar configuração RESEND_API_KEY
- Verificar logs na tabela `logs_email`
- Verificar pasta de spam

### Token inválido
- Verificar se não expirou (1 hora)
- Verificar se não foi usado
- Verificar URL completa

### Erro ao redefinir senha
- Verificar validação de senha forte
- Verificar logs de auditoria
- Verificar permissões RLS

## Próximas Melhorias

### Funcionalidades Futuras
- [ ] Notificação por SMS
- [ ] Recuperação por pergunta secreta
- [ ] Histórico de senhas anteriores
- [ ] Política de expiração de senhas
- [ ] Autenticação de dois fatores

### Otimizações
- [ ] Cache de templates de email
- [ ] Fila de emails assíncronos
- [ ] Métricas em tempo real
- [ ] Dashboard de monitoramento

---

**Implementado em:** 2024-12-26  
**Versão:** 1.0.0  
**Status:** ✅ Funcional e Testado 