// teste-validacao-dados.js
// Testes automatizados para validar a função de sanitização e validação de dados

const { validarDadosUsuario } = require('./server');

// Desativar execução do servidor durante os testes
process.env.TEST_MODE = true;

function testePalavrasProibidas() {
  console.log('Teste: Palavras proibidas');
  const dados = { nome: 'SELECT nome FROM tabela', email: 'DELETE FROM email' };
  const resultado = validarDadosUsuario(dados);
  console.assert(resultado.nome === ' nome  tabela', 'Erro: Palavras proibidas não foram removidas corretamente do nome');
  console.assert(resultado.email === ' FROM email', 'Erro: Palavras proibidas não foram removidas corretamente do email');
  console.log('Resultado:', resultado);
}

function testeCaracteresProibidos() {
  console.log('Teste: Caracteres proibidos');
  const dados = { nome: '"Nome"', email: "'email@t.com'" };
  const resultado = validarDadosUsuario(dados);
  console.assert(resultado.nome === 'Nome', 'Erro: Caracteres proibidos não foram removidos corretamente do nome');
  console.assert(resultado.email === 'email@t.com', 'Erro: Caracteres proibidos não foram removidos corretamente do email');
  console.log('Resultado:', resultado);
}

function testeEspacos() {
  console.log('Teste: Espaços no início e fim');
  const dados = { nome: '   Nome   ', email: '   email@t.com   ' };
  const resultado = validarDadosUsuario(dados);
  console.assert(resultado.nome === 'Nome', 'Erro: Espaços não foram removidos corretamente do nome');
  console.assert(resultado.email === 'email@t.com', 'Erro: Espaços não foram removidos corretamente do email');
  console.log('Resultado:', resultado);
}

function runAllTests() {
  testePalavrasProibidas();
  testeCaracteresProibidos();
  testeEspacos();
}

runAllTests();
