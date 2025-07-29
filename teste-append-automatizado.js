// teste-append-automatizado.js
// Testes automatizados para o mecanismo de append no arquivo usuarios.json

const fs = require('fs');
const path = require('path');
const { adicionarUsuario } = require('./user-control');
const usuariosPath = path.join(__dirname, 'usuarios.json');

function resetUsuariosJson(conteudo = '[]') {
  fs.writeFileSync(usuariosPath, conteudo);
}

function lerUsuariosJson() {
  return JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
}

async function testeArquivoVazio() {
  console.log('Teste: Arquivo vazio');
  resetUsuariosJson('');
  await adicionarUsuario({ nome: 'Vazio', email: 'vazio@t.com' });
  const arr = lerUsuariosJson();
  console.log('Resultado:', arr);
}

async function testeArrayVazio() {
  console.log('Teste: Arquivo com []');
  resetUsuariosJson('[]');
  await adicionarUsuario({ nome: 'ArrayVazio', email: 'array@t.com' });
  const arr = lerUsuariosJson();
  console.log('Resultado:', arr);
}

async function testeUmUsuario() {
  console.log('Teste: Arquivo com um usuário');
  resetUsuariosJson(JSON.stringify([{ nome: 'Primeiro', email: 'primeiro@t.com' }], null, 2));
  await adicionarUsuario({ nome: 'Segundo', email: 'segundo@t.com' });
  const arr = lerUsuariosJson();
  console.log('Resultado:', arr);
}

async function testeVariosUsuarios() {
  console.log('Teste: Vários usuários');
  resetUsuariosJson('[]');
  for (let i = 1; i <= 5; i++) {
    await adicionarUsuario({ nome: 'User' + i, email: `user${i}@t.com` });
  }
  const arr = lerUsuariosJson();
  console.log('Resultado:', arr);
}

async function testeCamposEspeciais() {
  console.log('Teste: Campos especiais');
  resetUsuariosJson('[]');
  await adicionarUsuario({ nome: 'Aspas"Simples', email: "'email@t.com'", extra: 'Vírgula, ponto.' });
  const arr = lerUsuariosJson();
  console.log('Resultado:', arr);
}

async function testeArquivoGrande() {
  console.log('Teste: Arquivo grande');
  const arr = [];
  for (let i = 0; i < 1000; i++) arr.push({ nome: 'Big' + i });
  resetUsuariosJson(JSON.stringify(arr, null, 2));
  const start = Date.now();
  await adicionarUsuario({ nome: 'BigLast', email: 'biglast@t.com' });
  const time = Date.now() - start;
  console.log('Tempo para append em arquivo grande:', time, 'ms');
}

async function testeConcorrencia() {
  console.log('Teste: Concorrência (simulado com bloqueio)');
  resetUsuariosJson('[]');
  await Promise.all([
    adicionarUsuario({ nome: 'Conc1' }),
    adicionarUsuario({ nome: 'Conc2' })
  ]);
  const arr = lerUsuariosJson();
  console.log('Resultado:', arr);
  console.assert(arr.length === 2, 'Erro: Concorrência não garantiu ambos os usuários.');
}

async function testeIntegridade() {
  console.log('Teste: Integridade do JSON');
  resetUsuariosJson('[]');
  for (let i = 0; i < 10; i++) await adicionarUsuario({ nome: 'Valido' + i });
  try {
    const arr = lerUsuariosJson();
    console.log('JSON válido:', Array.isArray(arr) && arr.length === 10);
  } catch (e) {
    console.log('JSON inválido!');
  }
}

async function testeLimiteBloqueio() {
  console.log('Teste: Bloqueio (simulado)');
  // Não implementado: simular bloqueio real exigiria manipulação de lockfile ou processos paralelos
  console.log('Teste de bloqueio não implementado (requer ambiente específico).');
}

async function runAll() {
  await testeArquivoVazio();
  await testeArrayVazio();
  await testeUmUsuario();
  await testeVariosUsuarios();
  await testeCamposEspeciais();
  await testeArquivoGrande();
  await testeConcorrencia();
  await testeIntegridade();
  await testeLimiteBloqueio();
}

runAll().catch(console.error);
