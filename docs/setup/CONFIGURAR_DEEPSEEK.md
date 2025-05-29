# 🚀 Configuração Rápida do DeepSeek

## ⚡ **MÉTODO RÁPIDO (Recomendado)**

### **1. Execute o script automático:**
```powershell
.\scripts\setup-deepseek.ps1
```

### **2. Cole sua chave quando solicitado**
- O script irá guiá-lo através do processo
- Sua chave será automaticamente configurada no arquivo `.env`

---

## 🔧 **MÉTODO MANUAL**

### **1. Obter chave do DeepSeek:**
1. Acesse: https://platform.deepseek.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Clique em "Create new secret key"
5. Copie a chave gerada (começa com `sk-`)

### **2. Configurar no projeto:**
1. Abra o arquivo `.env` na raiz do projeto
2. Encontre a linha: `VITE_DEEPSEEK_API_KEY=sk-sua-chave-deepseek-aqui`
3. Substitua `sk-sua-chave-deepseek-aqui` pela sua chave real
4. Salve o arquivo

### **3. Exemplo:**
```bash
# Antes
VITE_DEEPSEEK_API_KEY=sk-sua-chave-deepseek-aqui

# Depois (com sua chave real)
VITE_DEEPSEEK_API_KEY=sk-1234567890abcdef1234567890abcdef
```

---

## ✅ **TESTAR A CONFIGURAÇÃO**

### **1. Reiniciar o servidor:**
```bash
npm run dev
```

### **2. Testar processamento:**
1. Acesse: http://localhost:5173/admin/pedidos/nova-receita
2. Faça upload de uma imagem de receita
3. Clique em "Processar Receita com IA"
4. Verifique se os dados são extraídos corretamente

---

## 🚨 **PROBLEMAS COMUNS**

### **Erro: "Chave da API DeepSeek não configurada"**
- ✅ Verifique se o arquivo `.env` existe
- ✅ Confirme se a variável `VITE_DEEPSEEK_API_KEY` está definida
- ✅ Reinicie o servidor de desenvolvimento

### **Erro: "Erro na API DeepSeek: 401"**
- ✅ Chave inválida ou expirada
- ✅ Verifique se copiou a chave completa
- ✅ Gere uma nova chave se necessário

---

## 💰 **CUSTOS**

| Operação | Custo DeepSeek | Custo OpenAI | Economia |
|----------|----------------|--------------|----------|
| 1 receita | $0.001 | $0.02 | 95% |
| 100 receitas/dia | $0.10 | $2.00 | 95% |
| 1000 receitas/mês | $3.00 | $60.00 | 95% |

---

## 📞 **SUPORTE**

Se tiver problemas:
1. Verifique o arquivo `docs/setup/configuracao-deepseek.md` para guia detalhado
2. Execute o script `.\scripts\setup-deepseek.ps1` novamente
3. Verifique se sua chave está ativa em https://platform.deepseek.com/

---

**🎉 Após configurar, você terá processamento de receitas com IA funcionando!** 