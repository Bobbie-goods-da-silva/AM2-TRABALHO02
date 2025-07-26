// teste-comparativo-append-vs-tradicional.js
// Comparativo de performance: appendUsuarioJson vs método tradicional

const fs = require('fs');
const path = require('path');
const { adicionarUsuario } = require('./user-control');
const usuariosPath = path.join(__dirname, 'usuarios.json');

// Método tradicional: lê, faz parse, adiciona, reescreve
async function adicionarUsuarioTradicional(novoUsuario) {
  const start = Date.now();
  let arr = [];
  let readSize = 0;
  let readTime = 0;
  let writeTime = 0;

  if (fs.existsSync(usuariosPath)) {
    const readStart = Date.now();
    const conteudo = await fs.promises.readFile(usuariosPath, 'utf8');
    readTime = Date.now() - readStart;
    readSize = conteudo.length;
    arr = conteudo.trim() ? JSON.parse(conteudo) : [];
  }

  arr.push(novoUsuario);

  const writeStart = Date.now();
  await fs.promises.writeFile(usuariosPath, JSON.stringify(arr, null, 2));
  writeTime = Date.now() - writeStart;

  const total = Date.now() - start;
  console.log('--- MÉTODO TRADICIONAL ---');
  console.log('Tempo para leitura do arquivo:', readTime, 'ms');
  console.log('Tamanho do arquivo lido:', readSize, 'bytes');
  console.log('Tempo para escrita do arquivo:', writeTime, 'ms');
  console.log('Tempo total:', total, 'ms');
}

async function main() {
  const usuarioAppend = {
    nome: 'Comparativo Append',
    email: 'append@comparativo.com',
    criadoEm: new Date().toISOString()
  };
  const usuarioTradicional = {
    nome: 'Comparativo Tradicional',
    email: 'tradicional@comparativo.com',
    criadoEm: new Date().toISOString()
  };

  console.log('Testando método APPEND...');
  await adicionarUsuario(usuarioAppend);
  console.log('Testando método TRADICIONAL...');
  await adicionarUsuarioTradicional(usuarioTradicional);
}

main().catch(console.error);
