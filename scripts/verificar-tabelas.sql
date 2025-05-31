-- Script para verificar se as tabelas existem no Supabase
-- Execute este script no SQL Editor para diagnosticar problemas

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('vendas', 'abertura_caixa', 'movimentos_caixa')
ORDER BY table_name;

-- 2. Se a tabela vendas existir, mostrar algumas vendas
SELECT 
    'Vendas existentes:' as info,
    COUNT(*) as total_vendas,
    SUM(CASE WHEN status = 'finalizada' THEN 1 ELSE 0 END) as vendas_finalizadas
FROM public.vendas;

-- 3. Mostrar vendas de hoje (se existirem)
SELECT 
    id,
    numero_venda,
    total,
    status,
    created_at
FROM public.vendas 
WHERE created_at >= CURRENT_DATE 
AND status = 'finalizada'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar usuários auth
SELECT 
    'Usuário atual:' as info,
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1; 