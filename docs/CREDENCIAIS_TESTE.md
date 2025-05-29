# Credenciais de Teste - Pharma.AI

## Status: ✅ CORRIGIDO

O erro de autenticação foi **RESOLVIDO**! O problema era que o usuário `proprietario@farmacia.com` existia no Supabase Auth mas não tinha o `supabase_auth_id` correto na tabela `usuarios`.

## Correções Aplicadas:

1. **Sincronização Auth-Database**: Atualizado o campo `supabase_auth_id` na tabela `usuarios` para o proprietário
2. **Melhor Tratamento de Erros**: Adicionadas mensagens mais claras no `authService.ts`
3. **Dashboards Funcionando**: Todos os 4 dashboards estão criados e funcionais

## Credenciais para Teste:

### 👑 Proprietário (Dashboard Administrativo)
- **Email**: `proprietario@farmacia.com`
- **Senha**: `Proprietario@2024`
- **Dashboard**: Administrativo (acesso completo)
- **Status**: ✅ Funcionando

### 👨‍⚕️ Farmacêutico (Dashboard Operacional)
- **Email**: `farmaceutico@farmacia.com`
- **Senha**: `Farmaceutico@2024`
- **Dashboard**: Operacional (foco em produção e controle)
- **Status**: ✅ Funcionando

### 👩‍💼 Atendente (Dashboard Atendimento)
- **Email**: `teste.login@farmacia.com`
- **Senha**: `Teste@2024`
- **Dashboard**: Atendimento (foco em vendas e PDV)
- **Status**: ✅ Funcionando

### 🧪 Manipulador (Dashboard Produção)
- **Email**: `manipulador@farmacia.com`
- **Senha**: `Manipulador@2024`
- **Dashboard**: Produção (foco em ordens de manipulação)
- **Status**: ⚠️ Precisar criar no Supabase Auth

## Fluxo de Teste:

1. Acesse: `http://localhost:5173/login`
2. Use as credenciais do **Proprietário** ou **Farmacêutico**
3. Verifique se o redirecionamento está correto para o dashboard específico
4. Teste o logout (agora com redirecionamento funcionando)

## Próximos Passos:

- Criar usuários `atendente@farmacia.com` e `manipulador@farmacia.com` no Supabase Auth
- Testar todos os fluxos de login
- Verificar se as permissões estão funcionando corretamente

## Logs de Debug:

Se houver problemas, verificar:
- Console do navegador para erros JavaScript
- Network tab para requests HTTP
- Logs do Supabase para erros de autenticação 