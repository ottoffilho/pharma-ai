// Script de teste simples para verificar se os métodos existem
const vendasService = require('./dist/services/vendasService.js');

console.log('Testando métodos do vendasService...');

// Verificar se os métodos existem
const metodos = [
  'listarVendas',
  'obterVenda', 
  'obterEstatisticas',
  'obterCaixaAtivo'
];

metodos.forEach(metodo => {
  if (typeof vendasService.vendasService[metodo] === 'function') {
    console.log(`✅ ${metodo} - OK`);
  } else {
    console.log(`❌ ${metodo} - NÃO ENCONTRADO`);
  }
});

// Verificar se os métodos problemáticos NÃO existem (devem estar ausentes)
const metodosInexistentes = [
  'obterProdutosMaisVendidos',
  'obterEstatisticasPagamentos'
];

metodosInexistentes.forEach(metodo => {
  if (typeof vendasService.vendasService[metodo] === 'function') {
    console.log(`❌ ${metodo} - EXISTE (não deveria)`);
  } else {
    console.log(`✅ ${metodo} - AUSENTE (correto)`);
  }
});

console.log('Teste concluído!'); 