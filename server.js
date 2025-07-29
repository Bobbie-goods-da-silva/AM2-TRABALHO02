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
const routes = require('./routes'); // Importa as rotas da aplicação

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DO SERVIDOR
// -----------------------------------------------------------------------------

const app = express(); // Cria uma aplicação Express

// Define o host e a porta (usa variáveis de ambiente se existirem)
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

// Ativa o parser de JSON para o corpo das requisições
app.use(express.json());
// Define a pasta "public" como estática (servirá arquivos HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Habilita CORS para permitir requisições de outras origens
app.use(cors());

// -----------------------------------------------------------------------------
// ROTAS
// -----------------------------------------------------------------------------

app.use('/', routes); // Usa o roteador para todas as rotas

// -----------------------------------------------------------------------------
// EXECUÇÃO DO SERVIDOR
// -----------------------------------------------------------------------------

// Inicia o servidor e escuta na porta especificada
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
