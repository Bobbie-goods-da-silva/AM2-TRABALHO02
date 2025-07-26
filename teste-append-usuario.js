// teste-append-usuario.js
// Exemplo de teste para adicionar um usuário ao arquivo usuarios.json usando o mecanismo de append

const { adicionarUsuario } = require('./user-control');

async function testarAppend() {
  const novoUsuario = {
    nome: 'Teste do Append',
    email: 'append@example.com',
    idade: 30,
    criadoEm: new Date().toISOString()
  };

  console.log('Testando append de usuário...');
  await adicionarUsuario(novoUsuario);
  console.log('Usuário de teste adicionado!');
}

testarAppend().catch(console.error);
