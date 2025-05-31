# Correção: Erro de Sincronização de Usuários no PDV

## Problema Identificado

**Erro Principal:**
```
POST https://hjwebmpvaaeogbfqxwub.supabase.co/rest/v1/usuarios?select=* 409 (Conflict)
Erro ao criar usuário: {
  code: '23505', 
  details: 'Key (supabase_auth_id)=(35cad295-3bdc-46ba-84cc-2fdee13f05d9) already exists.', 
  hint: null, 
  message: 'duplicate key value violates unique constraint "usuarios_supabase_auth_id_key"'
}
```

**Causa:** O sistema tentava criar um usuário na tabela `usuarios` que já existia, causando violação de constraint única no campo `supabase_auth_id`.

## Solução Implementada

### 1. Edge Function Centralizada

Criamos uma Edge Function dedicada para verificar e sincronizar usuários:

**Arquivo:** `supabase/functions/verificar-sincronizar-usuario/index.ts`

**Funcionalidades:**
- ✅ Verifica se usuário existe por `supabase_auth_id`
- ✅ Fallback para busca por ID direto
- ✅ Sincronização automática de `supabase_auth_id` quando necessário
- ✅ Criação segura de novos usuários
- ✅ Proteção contra race conditions
- ✅ Tratamento robusto de erros de duplicate key

### 2. Lógica Simplificada no PDV

**Antes:** 100+ linhas de lógica complexa no frontend
**Depois:** 15 linhas usando a Edge Function

```typescript
// Usar Edge Function para verificar/sincronizar usuário
const { data: syncResult, error: syncError } = await supabase.functions.invoke('verificar-sincronizar-usuario', {
  body: { auth_id: user.id }
});

if (syncError) {
  console.error('Erro ao sincronizar usuário:', syncError);
  throw new Error('Erro ao verificar usuário no sistema');
}

// Usar o ID do usuário sincronizado
const usuarioId = syncResult.usuario?.id || user.id;
```

### 3. Fluxo de Verificação

1. **Busca por supabase_auth_id** (método principal)
2. **Busca por ID direto** (fallback para dados legados)
3. **Sincronização automática** se necessário
4. **Criação segura** se usuário não existir
5. **Verificação dupla** para evitar race conditions
6. **Tratamento de duplicates** com busca da instância existente

## Melhorias Implementadas

### ✅ Robustez
- Múltiplas camadas de verificação
- Tratamento de race conditions
- Fallbacks automáticos

### ✅ Performance
- Edge Function reutilizável
- Redução da lógica no frontend
- Menos consultas redundantes

### ✅ Manutenibilidade
- Lógica centralizada
- Código mais limpo
- Logs detalhados

### ✅ Segurança
- Validação de autorização
- Verificações duplas
- Tratamento de erros seguros

## Status

- ✅ **Edge Function deployada**
- ✅ **PDV atualizado**
- ✅ **Testes de sincronização implementados**
- ✅ **Documentação criada**

## Como Testar

1. **Login com usuário existente:**
   - Deve sincronizar automaticamente
   - Logs: "✅ Usuário já sincronizado"

2. **Login com usuário novo:**
   - Deve criar usuário na tabela
   - Logs: "✅ Usuário criado e sincronizado"

3. **Race condition simulation:**
   - Múltiplas tentativas simultâneas
   - Deve usar instância existente

## Logs de Sucesso Esperados

```
🔍 Verificando sincronização para user: 35cad295-3bdc-46ba-84cc-2fdee13f05d9
✅ Usuário já sincronizado: Nome do Usuário
✅ Usuário sincronizado: Nome do Usuário | ID: 35cad295-3bdc-46ba-84cc-2fdee13f05d9
```

---

**Data da Correção:** 2025-01-28  
**Status:** ✅ Resolvido  
**Impacto:** Sistema de vendas totalmente funcional 