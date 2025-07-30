/**
 * routes.js
 *
 * Define as rotas da aplicação para o servidor Express.
 *
 * Autor: Prof. Wellington Sarmento (com pitacos do Braniac 😎)
 * Data: 2025
 */

// -----------------------------------------------------------------------------
// IMPORTAÇÃO DE MÓDULOS
// -----------------------------------------------------------------------------

const express = require("express"); // Framework para criação de APIs e servidores HTTP
const router = express.Router(); // Cria um objeto de roteador
const path = require("path"); // Lida com caminhos de arquivos e diretórios
const { v4: uuidv4 } = require("uuid"); // Gera IDs únicos universais (UUID v4)

const { lerUsuarios, salvarUsuarios, adicionarUsuario } = require("./user-control.js"); // Controle de leitura/escrita e append
const { sanitizarEValidarUsuario } = require('./validacao'); // Middleware de validação e sanitização

// -----------------------------------------------------------------------------
// ROTAS
// -----------------------------------------------------------------------------

/**
 * Rota principal - GET /
 * Retorna o arquivo HTML inicial (index.html) da pasta "public"
 */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Rota para servir arquivos da pasta views
 * GET /views/:filename
 */
router.get("/views/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, "public", "views", filename));
});

/**
 * Rota GET /list-users/:count?
 * Retorna um número limitado de usuários do arquivo usuarios.json
 *
 * @param {number} count (opcional) - número máximo de usuários a retornar (sem limite máximo)
 */
router.get("/list-users/:count?", async (req, res) => {
  let num = parseInt(req.params.count, 10);
  if (isNaN(num) || num < 0) num = 0; // Se não informado ou negativo, retorna todos

  try {
    const todos = await lerUsuarios(num); // Se num=0, lerUsuarios deve retornar todos
    res.json(todos);
  } catch (err) {
    console.error("❌ Falha ao ler usuários:", err);
    res.status(500).json({ error: "Não foi possível ler usuários." });
  }
});

/**
 * Rota GET /usuarios
 * Retorna todos os usuários do arquivo usuarios.json
 */
router.get("/usuarios", async (req, res) => {
  try {
    const todos = await lerUsuarios(0); // 0 = retorna todos
    res.json(todos);
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
router.post("/cadastrar-usuario", sanitizarEValidarUsuario, async (req, res) => {
  try {
    // Usa dados limpos do middleware
    const dados = req.sanitizedBody;
    const novoUsuario = {
      id: uuidv4(),
      ...dados,
      criadoEm: new Date().toISOString(),
    };
    // Append seguro no arquivo JSON
    await adicionarUsuario(novoUsuario);
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
router.put("/atualizar-usuario/:id", sanitizarEValidarUsuario, async (req, res) => {
  try {
    const usuarios = await lerUsuarios(0);
    const usuarioIndex = usuarios.findIndex((u) => u.id === req.params.id);

    if (usuarioIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Mescla dados existentes com os dados limpos
    const dadosAtualizados = req.sanitizedBody;
    usuarios[usuarioIndex] = { ...usuarios[usuarioIndex], ...dadosAtualizados };

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
router.delete("/remover-usuario/:id", async (req, res) => {
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

module.exports = router;