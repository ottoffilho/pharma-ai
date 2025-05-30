import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usar service role para inserções

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para dividir texto em chunks
function splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sections = text.split(/\n(?=#{1,6}\s)/); // Dividir por cabeçalhos
  
  for (const section of sections) {
    if (section.length <= maxChunkSize) {
      chunks.push(section.trim());
    } else {
      // Se a seção for muito grande, dividir por parágrafos
      const paragraphs = section.split('\n\n');
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length <= maxChunkSize) {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = paragraph;
        }
      }
      
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
    }
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filtrar chunks muito pequenos
}

// Função para gerar embeddings (usando OpenAI como exemplo)
async function generateEmbedding(text: string): Promise<number[]> {
  // ATENÇÃO: Esta é uma implementação simulada para desenvolvimento
  // Em produção, deve ser substituída por uma chamada real para OpenAI API ou outro serviço
  console.log(`[SIMULADO] Gerando embedding para texto de ${text.length} caracteres`);
  console.warn('⚠️  AVISO: Usando embeddings simulados. Substituir por implementação real em produção.');
  
  // Retornar embedding simulado de 1536 dimensões (tamanho OpenAI ada-002)
  // TODO: Implementar chamada real para OpenAI API ou outro serviço de embeddings
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
}

// Função principal para vectorizar o documento
async function vectorizeDocument() {
  try {
    console.log('📄 Iniciando vectorização do documento...');
    
    // Ler o arquivo
    const documentPath = path.join(process.cwd(), 'docs/implementacoes/proposta_consolidada_cadastro(versao_final).md');
    const documentContent = fs.readFileSync(documentPath, 'utf-8');
    
    console.log(`📖 Documento carregado: ${documentContent.length} caracteres`);
    
    // Dividir em chunks
    const chunks = splitTextIntoChunks(documentContent, 800);
    console.log(`✂️  Documento dividido em ${chunks.length} chunks`);
    
    // Limpar tabela existente
    console.log('🗑️  Limpando chunks existentes...');
    const { error: deleteError } = await supabase
      .from('document_chunks')
      .delete()
      .eq('document_name', 'proposta_consolidada_cadastro');
    
    if (deleteError) {
      console.error('Erro ao limpar chunks existentes:', deleteError);
    }
    
    // Processar chunks em lotes
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      console.log(`🔄 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
      
      const chunksToInsert = [];
      
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const chunkIndex = i + j;
        
        // Gerar embedding
        const embedding = await generateEmbedding(chunk);
        
        // Extrair metadados do chunk
        const lines = chunk.split('\n');
        const firstLine = lines[0];
        let section = 'Geral';
        let subsection = '';
        
        // Detectar seção baseada em headers
        if (firstLine.startsWith('#')) {
          section = firstLine.replace(/^#+\s*/, '').trim();
        }
        
        // Detectar módulos
        if (chunk.includes('M0')) {
          const moduleMatch = chunk.match(/M\d+[-_][A-Z_]+/);
          if (moduleMatch) {
            subsection = moduleMatch[0];
          }
        }
        
        chunksToInsert.push({
          content: chunk,
          embedding: `[${embedding.join(',')}]`, // Formato PostgreSQL array
          document_name: 'proposta_consolidada_cadastro',
          chunk_index: chunkIndex,
          metadata: {
            section,
            subsection,
            word_count: chunk.split(/\s+/).length,
            char_count: chunk.length,
            has_code: chunk.includes('```') || chunk.includes('yaml'),
            has_technical_terms: /tecnologia:|stack:|implementação:/i.test(chunk)
          }
        });
      }
      
      // Inserir lote no Supabase
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(chunksToInsert);
      
      if (insertError) {
        console.error(`Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, insertError);
      } else {
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido com sucesso`);
      }
      
      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 Vectorização completa!');
    
    // Verificar inserção
    const { data: chunks_count, error: countError } = await supabase
      .from('document_chunks')
      .select('id', { count: 'exact' })
      .eq('document_name', 'proposta_consolidada_cadastro');
    
    if (countError) {
      console.error('Erro ao verificar chunks:', countError);
    } else {
      console.log(`📊 Total de chunks inseridos: ${chunks_count?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante vectorização:', error);
  }
}

// Executar a vectorização diretamente
vectorizeDocument();

export { vectorizeDocument }; 