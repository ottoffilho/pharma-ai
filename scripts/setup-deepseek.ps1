# Script PowerShell para configurar a chave do DeepSeek
# Uso: .\scripts\setup-deepseek.ps1

Write-Host "🤖 Configurador da API DeepSeek - Pharma.AI" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo .env existe
$envFile = ".\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "💡 Criando arquivo .env a partir do env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".\env.example") {
        Copy-Item ".\env.example" ".\.env"
        Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green
    } else {
        Write-Host "❌ Arquivo env.example não encontrado!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📋 Para obter sua chave do DeepSeek:" -ForegroundColor Yellow
Write-Host "   1. Acesse: https://platform.deepseek.com/" -ForegroundColor White
Write-Host "   2. Faça login ou crie uma conta" -ForegroundColor White
Write-Host "   3. Vá em 'API Keys'" -ForegroundColor White
Write-Host "   4. Clique em 'Create new secret key'" -ForegroundColor White
Write-Host "   5. Copie a chave gerada" -ForegroundColor White
Write-Host ""

# Solicitar a chave do usuário
$apiKey = Read-Host "🔑 Cole sua chave do DeepSeek aqui"

# Validar a chave
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ Chave não pode estar vazia!" -ForegroundColor Red
    exit 1
}

if (-not $apiKey.StartsWith("sk-")) {
    Write-Host "⚠️  Aviso: A chave não parece ser válida (deve começar com 'sk-')" -ForegroundColor Yellow
}

# Ler o conteúdo atual do .env
$envContent = Get-Content $envFile -Raw

# Atualizar ou adicionar a chave
if ($envContent -match "VITE_DEEPSEEK_API_KEY=") {
    # Substituir a linha existente
    $envContent = $envContent -replace "VITE_DEEPSEEK_API_KEY=.*", "VITE_DEEPSEEK_API_KEY=$apiKey"
} else {
    # Adicionar a configuração
    $envContent += "`n# DeepSeek IA`nVITE_DEEPSEEK_API_KEY=$apiKey`n"
}

# Salvar o arquivo
Set-Content -Path $envFile -Value $envContent

Write-Host ""
Write-Host "✅ Chave do DeepSeek configurada com sucesso!" -ForegroundColor Green
Write-Host "🔄 Reinicie o servidor de desenvolvimento (npm run dev)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Execute: npm run dev" -ForegroundColor White
Write-Host "   2. Acesse: http://localhost:5173/admin/pedidos/nova-receita" -ForegroundColor White
Write-Host "   3. Teste o upload de uma receita" -ForegroundColor White
Write-Host ""
Write-Host "💰 Custo estimado: $0.001 por receita processada" -ForegroundColor Green 