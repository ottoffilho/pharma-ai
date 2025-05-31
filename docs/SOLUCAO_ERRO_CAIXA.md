# Solução para Erro: "column abertura_caixa.status does not exist"

## Problema Identificado

O erro indica que a coluna `status` não existe na tabela `abertura_caixa` no banco de dados Supabase. Isso pode acontecer quando as migrações não foram aplicadas corretamente.

## Erro Original
```
GET https://hjwebmpvaaeogbfqxwub.supabase.co/rest/v1/abertura_caixa?select=*%2C…d_fkey%28nome%2Cemail%29&status=eq.aberto&order=data_abertura.desc&limit=1 400 (Bad Request)

caixaService.ts:85 Erro ao obter caixa ativo: 
{code: '42703', details: null, hint: null, message: 'column abertura_caixa.status does not exist'}
```

## Soluções Implementadas

### 1. Correção no Código (caixaService.ts)

O serviço foi modificado para ser mais robusto e lidar com a ausência da coluna `status`:

- **obterCaixaAtivo()**: Agora tenta buscar por `status = 'aberto'` primeiro, e se falhar (erro 42703), usa `data_fechamento IS NULL` como fallback
- **abrirCaixa()**: Tenta inserir com `status` primeiro, e se falhar, insere sem a coluna
- **fecharCaixa()**: Usa `data_fechamento IS NULL` em vez de `status = 'aberto'` na condição WHERE
- **obterHistoricoCaixas()**: Adiciona fallback para o status baseado em `data_fechamento`

### 2. Migração de Correção

Criada migração completa em `supabase/migrations/20250128000010_fix_abertura_caixa_status.sql` que:

- Cria os tipos ENUM necessários (`status_caixa`, `tipo_movimento_caixa`)
- Garante que a tabela `abertura_caixa` existe com todas as colunas
- Adiciona a coluna `status` se não existir
- Configura RLS e políticas
- Cria índices necessários
- Configura triggers para cálculos automáticos

### 3. Script SQL Direto

Criado script em `scripts/fix-caixa-status.sql` para execução manual no SQL Editor do Supabase.

## Como Aplicar a Correção

### Opção 1: Executar Script SQL Manualmente

1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard/project/hjwebmpvaaeogbfqxwub
2. Vá para "SQL Editor"
3. Execute o conteúdo do arquivo `scripts/fix-caixa-status.sql`

### Opção 2: Aplicar Migração via CLI

```bash
# Se o CLI estiver funcionando
npx supabase db push
```

### Opção 3: Verificar se o Problema Já Foi Resolvido

O código agora é resiliente e deve funcionar mesmo sem a coluna `status`. Teste a aplicação:

1. Acesse a página de Controle de Caixa
2. Tente abrir um novo caixa
3. Verifique se não há mais erros no console

## Verificação da Correção

Após aplicar qualquer uma das soluções, execute no SQL Editor:

```sql
-- Verificar se a coluna status existe
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'abertura_caixa'
ORDER BY ordinal_position;

-- Verificar se o tipo enum existe
SELECT typname FROM pg_type WHERE typname = 'status_caixa';
```

## Funcionalidades do Sistema de Caixa

Após a correção, o sistema de caixa terá:

- ✅ Abertura de caixa com valor inicial
- ✅ Controle de status (aberto/fechado/suspenso)
- ✅ Fechamento de caixa com contagem
- ✅ Movimentos de sangria e suprimento
- ✅ Integração com vendas
- ✅ Relatórios e histórico
- ✅ Cálculos automáticos de totais

## Arquivos Modificados

1. `src/services/caixaService.ts` - Serviço mais robusto
2. `supabase/migrations/20250128000010_fix_abertura_caixa_status.sql` - Migração completa
3. `scripts/fix-caixa-status.sql` - Script para execução manual

## Status

- ✅ Código corrigido e resiliente
- ✅ Migração criada
- ✅ Script SQL disponível
- ⏳ Aguardando aplicação no banco de dados

O sistema agora deve funcionar independentemente da presença da coluna `status`, mas recomenda-se aplicar a migração para ter a estrutura completa. 