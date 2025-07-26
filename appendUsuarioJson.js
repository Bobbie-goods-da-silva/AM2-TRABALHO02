// Função para adicionar um usuário ao final de um arquivo JSON (array de objetos) sem reescrever todo o arquivo.
// Mantém o formato padrão do arquivo JSON.

const fs = require('fs');
const path = require('path');

/**
 * Adiciona um novo usuário ao arquivo usuarios.json usando manipulação de string.
 * Garante que o arquivo continue sendo um array JSON válido.
 *
 * @param {Object} novoUsuario - Objeto do usuário a ser adicionado
 * @param {string} arquivo - Caminho do arquivo JSON (default: usuarios.json na raiz)
 * @returns {Promise<void>}
 */
async function appendUsuarioJson(novoUsuario, arquivo = path.join(__dirname, 'usuarios.json')) {
  console.log('Iniciando appendUsuarioJson...');
  const start = Date.now();
  // Serializa o novo usuário
  const usuarioStr = JSON.stringify(novoUsuario, null, 2);
  console.log('Usuário a adicionar:', usuarioStr);

  // Verifica se o arquivo existe
  if (!fs.existsSync(arquivo)) {
    console.log('Arquivo não existe. Criando novo arquivo com o usuário.');
    await fs.promises.writeFile(arquivo, '[\n' + usuarioStr + '\n]');
    console.log('Usuário adicionado como primeiro elemento. Tempo:', Date.now() - start, 'ms');
    return;
  }

  // Lê o arquivo inteiro como string
  const readStart = Date.now();
  let conteudo = await fs.promises.readFile(arquivo, 'utf8');
  const readEnd = Date.now();
  conteudo = conteudo.trim();
  console.log('Tempo para leitura do arquivo:', readEnd - readStart, 'ms');
  console.log('Tamanho do arquivo lido:', conteudo.length, 'bytes');

  // Caso o arquivo esteja vazio ou só com []
  if (conteudo === '' || conteudo === '[]') {
    console.log('Arquivo vazio ou só com []. Adicionando usuário como primeiro elemento.');
    await fs.promises.writeFile(arquivo, '[\n' + usuarioStr + '\n]');
    console.log('Usuário adicionado como primeiro elemento. Tempo:', Date.now() - start, 'ms');
    return;
  }

  // Remove o ] final
  if (conteudo.endsWith(']')) {
    conteudo = conteudo.slice(0, -1);
    console.log('Removido ] final do array.');
  }

  // Adiciona vírgula se não for o primeiro elemento
  if (!conteudo.endsWith('[')) {
    conteudo += ',\n';
    console.log('Adicionada vírgula para novo elemento.');
  }

  // Adiciona o novo usuário e fecha o array
  conteudo += usuarioStr + '\n]';

  // Escreve de volta
  const writeStart = Date.now();
  await fs.promises.writeFile(arquivo, conteudo);
  const writeEnd = Date.now();
  console.log('Tempo para escrita do arquivo:', writeEnd - writeStart, 'ms');
  console.log('Usuário adicionado com sucesso ao arquivo JSON. Tempo total:', Date.now() - start, 'ms');
}

module.exports = { appendUsuarioJson };
