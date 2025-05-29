// Script para restaurar o banco de dados após perda de tabelas
// Execute com: node ./src/scripts/restore-db.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Inicializa as variáveis de ambiente
console.log('📝 Tentando carregar variáveis do arquivo .env...');
const result = dotenv.config();

if (result.error) {
  console.log('⚠️ Erro ao carregar o arquivo .env:', result.error.message);
} else {
  console.log('✅ Arquivo .env carregado com sucesso!');
}

// Log das variáveis de ambiente relevantes (apenas para debug, sem mostrar valores completos)
console.log('🔍 Verificando variáveis de ambiente:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '(definida)' : '(não definida)');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '(definida)' : '(não definida)');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '(definida)' : '(não definida)');

// Obtém o diretório atual do módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para o arquivo .env
const envPath = path.resolve(process.cwd(), '.env');
console.log('📁 Procurando .env em:', envPath);
console.log('📁 .env existe?', fs.existsSync(envPath) ? 'Sim' : 'Não');

// Verifica se as variáveis de ambiente estão definidas
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('⚠️ Erro: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são necessárias.');
  console.log('Adicione essas variáveis ao arquivo .env ou passe-as como variáveis de ambiente.');
  
  // Tentar carregar novamente passando caminho explícito
  console.log('🔄 Tentando carregar .env fornecendo caminho explícito...');
  dotenv.config({ path: envPath });
  
  // Verificar novamente
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Segunda tentativa falhou. Verifique se o arquivo .env está na pasta raiz do projeto.');
    process.exit(1);
  } else {
    console.log('✅ Segunda tentativa bem-sucedida!');
  }
}

// Cria cliente Supabase com service role key (necessária para operações admin)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Caminho para o arquivo SQL
const sqlFilePath = path.join(__dirname, 'recriacao-tabelas.sql');

async function main() {
  try {
    console.log('📂 Lendo arquivo SQL...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('⚙️ Executando SQL no banco de dados...');
    
    // Como o Supabase não permite executar scripts SQL grandes diretamente,
    // vamos dividir o script em comandos individuais e executá-los sequencialmente
    const commands = sqlContent
      .split(';')
      .filter(cmd => cmd.trim().length > 0)
      .map(cmd => cmd.trim() + ';');
    
    console.log(`🔢 Total de comandos SQL: ${commands.length}`);
    
    // Contador para acompanhar o progresso
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        // Executa cada comando SQL
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erro no comando #${i+1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
          if (i % 10 === 0 || i === commands.length - 1) {
            console.log(`✓ Progresso: ${i+1}/${commands.length} comandos processados`);
          }
        }
      } catch (cmdError) {
        console.error(`❌ Erro ao executar comando #${i+1}:`, cmdError);
        errorCount++;
      }
    }
    
    console.log('\n=== Resultado da restauração do banco de dados ===');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('🎉 Restauração concluída com sucesso!');
    } else {
      console.log('⚠️ Restauração concluída com alguns erros. Verifique o console para mais detalhes.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a execução do script:', error);
    process.exit(1);
  }
}

// Executa o script
console.log('🚀 Iniciando restauração do banco de dados Pharma.AI...');
main(); 