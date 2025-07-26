// Define a função que adiciona o botão de ação específico para esta página
window.adicionarBotaoAcao = function (usuario) {
  return `<td><button class="btn-editar" onclick="editarUsuario('${usuario.id}')">Alterar</button></td>`;
};

// Sobrescreve a função renderizarTabela para incluir a coluna de ações
const originalRenderizarTabela = window.renderizarTabela;
window.renderizarTabela = function (data) {
  // Adiciona a coluna de ações no cabeçalho se não existir
  const thead = document.querySelector("#tabelaUsuarios thead tr");
  if (thead.children.length === 4) {
    thead.innerHTML += "<th>Ação</th>";
  }
  originalRenderizarTabela(data);
};

// Carrega os usuários para aplicar as mudanças
window.onload = function () {
  carregarUsuarios(0);
};
