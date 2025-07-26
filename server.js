/**
 * server.js
 *
 * Servidor Express para cadastro e listagem de usuários usando armazenamento em arquivo JSON com controle de concorrência.
 *
 * Funcionalidades:
 * - Servir arquivos estáticos da pasta /public (ex: index.html).
 * - Rota GET /list-users/:count? para listar até N usuários cadastrados.
 * - Rota POST /cadastrar-usuario para cadastrar novo usuário com ID único.
 * - Persistência em arquivo JSON com bloqueio de escrita/leitura seguro (via proper-lockfile).
 *
 * Autor: Prof. Wellington Sarmento (com pitacos do Braniac 😎)
 * Data: 2025
 */

// -----------------------------------------------------------------------------
// IMPORTAÇÃO DE MÓDULOS
// -----------------------------------------------------------------------------

const express = require("express"); // Framework para criação de APIs e servidores HTTP
const cors = require("cors"); // Middleware para permitir requisições de outras origens (CORS)
const path = require("path"); // Lida com caminhos de arquivos e diretórios
const { v4: uuidv4 } = require("uuid"); // Gera IDs únicos universais (UUID v4)

const { lerUsuarios, salvarUsuarios } = require("./user-control.js"); // Módulo de controle de leitura/escrita com lock

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DO SERVIDOR
// -----------------------------------------------------------------------------

const app = express(); // Cria uma aplicação Express

// Define o host e a porta (usa variáveis de ambiente se existirem)
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

let num; // Variável para armazenar o número de usuários a serem lidos do arquivo

// Ativa o parser de JSON para o corpo das requisições
app.use(express.json());

// Define a pasta "public" como estática (servirá arquivos HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Habilita CORS para permitir requisições de outras origens
app.use(cors());

// -----------------------------------------------------------------------------
// ROTAS
// -----------------------------------------------------------------------------

/**
 * Rota principal - GET /
 * Retorna o arquivo HTML inicial (index.html) da pasta "public"
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Rota GET /list-users/:count?
 * Retorna um número limitado de usuários do arquivo usuarios.json
 *
 * @param {number} count (opcional) - número máximo de usuários a retornar (default: 100)
 */

app.get("/list-users/:count?", async (req, res) => {
  num = parseInt(req.params.count, 10); // Converte o parâmetro para número inteiro
  if (isNaN(num)) num = 100; // Valor padrão se não for fornecido
  if (num == 0) {
    // Se não houver limite, retorna todos os usuários
    console.log(`Nenhum limite aplicado. Retornando todos os usuários.`);
    num = 10000; // Define um número máximo para evitar sobrecarga
  } else if (num < 0) {
    num = 100;
  } else if (num > 10000) {
    num = 10000; // Limita o número máximo de usuários a 10.000
    console.log(`Número máximo de usuários a retornar: ${num}`);
  }

  try {
    const todos = await lerUsuarios(num); // Lê N usuários do arquivo
    res.json(todos); // Retorna os usuários como JSON
  } catch (err) {
    console.error("❌ Falha ao ler usuários:", err);
    res.status(500).json({ error: "Não foi possível ler usuários." });
  }
});

/**
 * Rota POST /cadastrar-usuario
 * Recebe dados no corpo da requisição e adiciona um novo usuário ao arquivo JSON.
 *
 * @body {string} nome - Nome do usuário
 * @body {number} idade - Idade do usuário
 * @body {string} endereco - Endereço
 * @body {string} email - E-mail
 */
app.post("/cadastrar-usuario", async (req, res) => {
  try {
    const usuarios = await lerUsuarios(0); // Garante dados atualizados

    const novoUsuario = {
      id: uuidv4(), // Gera um UUID para o novo usuário
      nome: req.body.nome,
      idade: req.body.idade,
      endereco: req.body.endereco,
      email: req.body.email,
    };

    usuarios.push(novoUsuario); // Adiciona à lista
    await salvarUsuarios(usuarios); // Salva no arquivo com lock
    console.log(`✔️ Usuário cadastrado: ${JSON.stringify(novoUsuario)}`);
    res.status(201).json({
      ok: true,
      message: "Usuário cadastrado com sucesso!",
      usuario: novoUsuario,
    });
  } catch (err) {
    console.error("❌ Erro ao cadastrar usuário:", err);
    res.status(500).json({ error: "Não foi possível cadastrar usuário." });
  }
});

/**
 * Rota PUT /atualizar-usuario/:id
 * Atualiza os dados de um usuário existente
 *
 * @param {string} id - ID do usuário a ser atualizado
 * @body {string} nome - Novo nome (opcional)
 * @body {number} idade - Nova idade (opcional)
 * @body {string} endereco - Novo endereço (opcional)
 * @body {string} email - Novo email (opcional)
 */

/**
 * Qual o "verb" HTTP usar para atualizar um recurso?
 *
 * Primeiro, pesquisei verbos do HTTP relacionados a atualização de recursos. Encontrei dois principais:
 *
 * PUT:
 * Este verbo é usado para substituir completamente um recurso existente pelos novos dados fornecidos no corpo da solicitação.
 * Se o recurso não existir no URI especificado, uma solicitação PUT também pode ser usada para criá-lo, efetivamente
 * substituindo um recurso "inexistente" por um novo.
 *
 * PATCH:
 * Este verbo é usado para aplicar modificações parciais a um recurso existente. Somente os campos ou propriedades específicos
 * que precisam ser alterados são incluídos no corpo da solicitação, deixando outras partes do recurso intactas. Isso é
 * frequentemente preferido ao * lidar com recursos grandes ou complexos, onde o envio de toda a representação do recurso
 * para uma pequena alteração seria ineficiente.
 *
 * Em resumo, embora PUT e PATCH sejam usados para atualizar dados, a principal distinção reside em se todo o recurso
 * está sendo substituído (PUT) ou apenas partes específicas estão sendo modificadas (PATCH).
 *
 * Assim, usei o verb PUT" para a autalização de usuários,
 * pois a intenção é atualizar todos os campos do usuário, mesmo que alguns não sejam alterados
 * (ou seja, enviar todos os campos do usuário, mesmo que não sejam alterados).
 *
 * */

app.put("/atualizar-usuario/:id", async (req, res) => {
  try {
    const usuarios = await lerUsuarios(0);
    const usuarioIndex = usuarios.findIndex((u) => u.id === req.params.id);

    if (usuarioIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Atualiza apenas os campos fornecidos
    if (req.body.nome) usuarios[usuarioIndex].nome = req.body.nome;
    if (req.body.idade) usuarios[usuarioIndex].idade = req.body.idade;
    if (req.body.endereco) usuarios[usuarioIndex].endereco = req.body.endereco;
    if (req.body.email) usuarios[usuarioIndex].email = req.body.email;

    await salvarUsuarios(usuarios);
    console.log(
      `✔️ Usuário atualizado: ${JSON.stringify(usuarios[usuarioIndex])}`
    );
    res.json({
      ok: true,
      message: "Usuário atualizado com sucesso!",
      usuario: usuarios[usuarioIndex],
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Não foi possível atualizar usuário." });
  }
});

/**
 * Rota DELETE /remover-usuario/:id
 * Remove um usuário do sistema
 *
 * @param {string} id - ID do usuário a ser removido
 */
app.delete("/remover-usuario/:id", async (req, res) => {
  try {
    let usuarios = await lerUsuarios(0);
    const usuarioIndex = usuarios.findIndex((u) => u.id === req.params.id);

    if (usuarioIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const usuarioRemovido = usuarios[usuarioIndex];
    usuarios = usuarios.filter((u) => u.id !== req.params.id);

    await salvarUsuarios(usuarios);
    console.log(`✔️ Usuário removido: ${JSON.stringify(usuarioRemovido)}`);
    res.json({
      ok: true,
      message: "Usuário removido com sucesso!",
      usuario: usuarioRemovido,
    });
  } catch (err) {
    console.error("❌ Erro ao remover usuário:", err);
    res.status(500).json({ error: "Não foi possível remover usuário." });
  }
});

// -----------------------------------------------------------------------------
// EXECUÇÃO DO SERVIDOR
// -----------------------------------------------------------------------------

// Inicia o servidor e escuta na porta especificada
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
