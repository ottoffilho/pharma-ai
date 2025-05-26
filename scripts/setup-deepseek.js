#!/usr/bin/env node

/**
 * Script para configurar a chave do DeepSeek no arquivo .env
 * Uso: node scripts/setup-deepseek.js [sua-chave-deepseek]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_FILE = path.join(__dirname, '..', '.env');

// Função para ler input do usuário
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Função para atualizar o arquivo .env
function updateEnvFile(apiKey) {
  try {
    if (!fs.existsSync(ENV_FILE)) {
      console.log('❌ Arquivo .env não encontrado!');
      console.log('💡 Execute: copy env.example .env');
      process.exit(1);
    }

    let envContent = fs.readFileSync(ENV_FILE, 'utf8');
    
    // Verificar se já existe a configuração
    if (envContent.includes('VITE_DEEPSEEK_API_KEY=')) {
      // Substituir a linha existente
      envContent = envContent.replace(
        /VITE_DEEPSEEK_API_KEY=.*/,
        `VITE_DEEPSEEK_API_KEY=${apiKey}`
      );
    } else {
      // Adicionar a configuração
      envContent += `\n# DeepSeek IA\nVITE_DEEPSEEK_API_KEY=${apiKey}\n`;
    }

    fs.writeFileSync(ENV_FILE, envContent);
    
    console.log('✅ Chave do DeepSeek configurada com sucesso!');
    console.log('🔄 Reinicie o servidor de desenvolvimento (npm run dev)');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo .env:', error.message);
    return false;
  }
}

// Função para validar a chave
function validateApiKey(key) {
  if (!key || key.trim() === '') {
    return false;
  }
  
  // Verificar se parece com uma chave válida do DeepSeek
  if (!key.startsWith('sk-')) {
    console.log('⚠️  Aviso: A chave não parece ser válida (deve começar com "sk-")');
  }
  
  return true;
}

// Função principal
async function main() {
  console.log('🤖 Configurador da API DeepSeek - Pharma.AI\n');
  
  // Verificar se a chave foi passada como argumento
  let apiKey = process.argv[2];
  
  if (!apiKey) {
    console.log('📋 Para obter sua chave do DeepSeek:');
    console.log('   1. Acesse: https://platform.deepseek.com/');
    console.log('   2. Faça login ou crie uma conta');
    console.log('   3. Vá em "API Keys"');
    console.log('   4. Clique em "Create new secret key"');
    console.log('   5. Copie a chave gerada\n');
    
    apiKey = await askQuestion('🔑 Cole sua chave do DeepSeek aqui: ');
  }
  
  if (!validateApiKey(apiKey)) {
    console.log('❌ Chave inválida! Tente novamente.');
    process.exit(1);
  }
  
  if (updateEnvFile(apiKey.trim())) {
    console.log('\n🎉 Configuração concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:5173/admin/pedidos/nova-receita');
    console.log('   3. Teste o upload de uma receita');
    console.log('\n💰 Custo estimado: $0.001 por receita processada');
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateEnvFile, validateApiKey }; 