# Soluções para Erros de Autenticação - Pharma.AI

## Resumo dos Erros Identificados

### 1. Erro 400 (Bad Request) na Atualização de Usuários
**Erro:** `PATCH https://hjwebmpvaaeogbfqxwub.supabase.co/rest/v1/usuarios?supabase_auth_id=eq.35cad295-3bdc-46ba-84cc-2fdee13f05d9 400 (Bad Request)`

**Causa:** Problema com as políticas RLS (Row Level Security) ou estrutura da tabela.

**Solução Implementada:**
- Verificação e correção das políticas RLS
- Melhoria no tratamento de erros
- Atualização assíncrona do último acesso para não bloquear o carregamento

### 2. Erro de Campo "updated_at" Inexistente
**Erro:** `record "new" has no field "updated_at"`

**Causa:** O trigger `update_updated_at_column()` estava tentando acessar um campo `updated_at` que não existe na tabela `usuarios`. A tabela usa `atualizado_em` em vez de `updated_at`.

**Solução Implementada:**
```sql
-- Criação de função específica para tabela usuarios
CREATE OR REPLACE FUNCTION update_usuarios_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger específico para usuarios
CREATE TRIGGER update_usuarios_atualizado_em
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_usuarios_atualizado_em();
```

### 3. Erro 404 na Edge Function excluir-usuario
**Erro:** `POST https://hjwebmpvaaeogbfqxwub.supabase.co/functions/v1/excluir-usuario 404 (Not Found)`

**Causa:** A Edge Function estava tentando acessar uma tabela `permissoes_usuario` que não existe. A tabela correta é `permissoes`.

**Solução Implementada:**
- Corrigida a consulta para usar a tabela `permissoes` correta
- Ajustada a verificação de permissões para usar os UUIDs corretos dos perfis
- Corrigida a ação de permissão de `EXCLUIR` para `DELETAR` (conforme banco)
- Deployada nova versão da Edge Function

**Código Corrigido:**
```typescript
// Buscar permissões do usuário atual
const { data: permissoesUsuario, error: permError } = await supabase
  .from('permissoes')
  .select('modulo, acao, permitido')
  .eq('perfil_id', usuarioAtual.perfil_id)
  .eq('permitido', true)

// Verificar permissões usando UUID correto do perfil Proprietário
const temPermissao = usuarioAtual.perfil_id === '42142fe1-756d-4ff2-b92a-58a7ea8b77fa' || 
  permissoesUsuario?.some((p: any) => 
    p.modulo === 'USUARIOS_PERMISSOES' && 
    (p.acao === 'DELETAR' || p.acao === 'ADMINISTRAR')
  )
```

### 4. Timeout de Segurança
**Erro:** `⏰ useAuthSimple - Timeout de segurança`

**Causa:** Consultas ao banco de dados estavam demorando mais que o esperado, causando timeout.

**Soluções Implementadas:**

#### 3.1. Timeouts Específicos por Operação
```typescript
// Timeout para buscar dados do usuário (3 segundos)
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Timeout ao buscar usuário')), 3000);
});

// Timeout para buscar permissões (2 segundos)
const permissoesTimeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Timeout ao buscar permissões')), 2000);
});
```

#### 3.2. Uso de Promise.race para Controle de Timeout
```typescript
const result = await Promise.race([
  userDataPromise,
  timeoutPromise
]) as any;
```

#### 3.3. Atualização Assíncrona do Último Acesso
```typescript
// Fazer atualização em background para não bloquear carregamento
setTimeout(async () => {
  try {
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('supabase_auth_id', user.id);
    // ... tratamento de erro
  } catch (err) {
    // ... log de erro sem interromper fluxo
  }
}, 1000); // Aguardar 1 segundo antes de tentar atualizar
```

## Melhorias de Performance Implementadas

### 1. Cache de Autenticação
- Implementação de cache local com TTL de 5 minutos
- Redução de consultas repetidas ao banco
- Fallback para localStorage quando sessionStorage falha

### 2. Consultas Otimizadas
- Uso de índices apropriados na tabela usuarios
- Consultas específicas com campos necessários
- Timeouts individuais para cada operação

### 3. Tratamento de Erros Robusto
- Logs detalhados para debugging
- Fallbacks para operações não críticas
- Não interrupção do fluxo principal por erros secundários

## Políticas RLS Atualizadas

### Política para Atualização de Último Acesso
```sql
CREATE POLICY "Usuários podem atualizar seu próprio ultimo_acesso" ON usuarios
    FOR UPDATE USING (auth.uid() = supabase_auth_id)
    WITH CHECK (auth.uid() = supabase_auth_id);
```

### Política para Administradores
```sql
CREATE POLICY "Administradores têm acesso total" ON usuarios
    FOR ALL USING (
        (EXISTS (
            SELECT 1 FROM usuarios u
            JOIN perfis_usuario p ON u.perfil_id = p.id
            WHERE u.supabase_auth_id = auth.uid() 
            AND p.tipo = 'PROPRIETARIO'
        )) 
        OR 
        (auth.jwt() ->> 'role' = 'service_role')
    );
```

## Monitoramento e Debugging

### Logs Implementados
- `✅` Operações bem-sucedidas
- `⚠️` Avisos e erros não críticos
- `❌` Erros críticos
- `🔄` Operações em andamento
- `⏰` Timeouts

### Métricas de Performance
- Tempo de carregamento do usuário
- Taxa de sucesso das consultas
- Frequência de timeouts
- Uso do cache de autenticação

## Próximos Passos

1. **Monitoramento Contínuo**
   - Implementar métricas de performance
   - Alertas para timeouts frequentes
   - Dashboard de saúde da autenticação

2. **Otimizações Futuras**
   - Implementar paginação para permissões
   - Cache distribuído para múltiplas instâncias
   - Compressão de dados de sessão

3. **Testes Automatizados**
   - Testes de carga para autenticação
   - Testes de timeout e recuperação
   - Validação de políticas RLS

---

*Última atualização: 2024-12-26*
*Versão: 1.0.0* 