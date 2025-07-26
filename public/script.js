// Array que armazenará os usuários carregados da API
let usuarios = [];

// Página inicial da tabela
let paginaAtual = 1;

// Define quantos usuários serão exibidos por página
const usuariosPorPagina = 20;

// Define o campo e a ordem (crescente ou decrescente) para a ordenação
let ordemAtual = { campo: "nome", crescente: true };

let TOTAL_USERS = 1000; // Número total de usuários a serem carregados

// Função assíncrona que carrega os usuários da API
async function carregarUsuarios(num) {
  if (isNaN(num) || num < 0) {
    num = TOTAL_USERS; // Valor padrão se não for fornecido ou inválido
  }

  const resposta = await fetch(`/list-users/${num}`);
  usuarios = await resposta.json();
  atualizarPaginacao();
}

// Função que compara duas strings, com ou sem normalização completa
function comparaStrings(a, b, fullCompare = true) {
  const sa = a
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  const sb = b
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  const len = fullCompare ? Math.max(sa.length, sb.length) : 3;

  for (let i = 0; i < len; i++) {
    const c1 = sa.charCodeAt(i) || 0;
    const c2 = sb.charCodeAt(i) || 0;

    if (c1 < c2) return -1;
    if (c1 > c2) return 1;
  }

  return 0;
}

// Função de ordenação com o algoritmo da bolha
function bubbleSort(arr, key, crescente = true) {
  const tipo = typeof arr[0][key];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      let a = arr[j][key];
      let b = arr[j + 1][key];

      let comp = tipo === "string" ? comparaStrings(a, b) : a - b;

      if ((crescente && comp > 0) || (!crescente && comp < 0)) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
}

// Função que ordena a tabela com base no campo clicado
function ordenarTabela(campo) {
  if (ordemAtual.campo === campo) {
    ordemAtual = { campo, crescente: !ordemAtual.crescente };
  } else {
    ordemAtual = { campo, crescente: true };
  }

  bubbleSort(usuarios, ordemAtual.campo, ordemAtual.crescente);
  atualizarPaginacao();
}

// Atualiza os dados exibidos na página atual
function atualizarPaginacao() {
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);
  paginaAtual = Math.max(1, Math.min(paginaAtual, totalPaginas));

  document.getElementById("paginaAtual").innerText = paginaAtual;
  document.getElementById("totalPaginas").innerText = totalPaginas;

  const inicio = (paginaAtual - 1) * usuariosPorPagina;
  const fim = inicio + usuariosPorPagina;

  renderizarTabela(usuarios.slice(inicio, fim));
}

// Função chamada ao clicar em "Página Anterior"
function paginaAnterior() {
  paginaAtual--;
  atualizarPaginacao();
}

// Função chamada ao clicar em "Próxima Página"
function proximaPagina() {
  paginaAtual++;
  atualizarPaginacao();
}

// Função que desenha a tabela com os dados de usuários
function renderizarTabela(data) {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  tbody.innerHTML = "";

  data.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.idade}</td>
      <td>${u.endereco}</td>
      <td>${u.email}</td>
      ${window.adicionarBotaoAcao ? window.adicionarBotaoAcao(u) : ""}
    `;
    tbody.appendChild(tr);
  });
}

// Funções genéricas para editar e remover usuários
async function editarUsuario(id) {
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return;

  const novoNome = prompt("Novo nome:", usuario.nome);
  const novaIdade = prompt("Nova idade:", usuario.idade);
  const novoEndereco = prompt("Novo endereço:", usuario.endereco);
  const novoEmail = prompt("Novo email:", usuario.email);

  if (
    novoNome === null &&
    novaIdade === null &&
    novoEndereco === null &&
    novoEmail === null
  ) {
    return;
  }

  const dadosAtualizados = {};
  if (novoNome !== null) dadosAtualizados.nome = novoNome;
  if (novaIdade !== null) dadosAtualizados.idade = parseInt(novaIdade);
  if (novoEndereco !== null) dadosAtualizados.endereco = novoEndereco;
  if (novoEmail !== null) dadosAtualizados.email = novoEmail;

  try {
    const resposta = await fetch(`/atualizar-usuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosAtualizados),
    });

    const resultado = await resposta.json();
    if (resultado.ok) {
      alert("Usuário atualizado com sucesso!");
      carregarUsuarios(0);
    } else {
      alert(
        "Erro ao atualizar usuário: " + (resultado.error || "Erro desconhecido")
      );
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao conectar com o servidor");
  }
}

async function removerUsuario(id) {
  if (!confirm("Tem certeza que deseja remover este usuário?")) {
    return;
  }

  try {
    const resposta = await fetch(`/remover-usuario/${id}`, {
      method: "DELETE",
    });

    const resultado = await resposta.json();
    if (resultado.ok) {
      alert("Usuário removido com sucesso!");
      carregarUsuarios(0);
    } else {
      alert(
        "Erro ao remover usuário: " + (resultado.error || "Erro desconhecido")
      );
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao conectar com o servidor");
  }
}

// Quando a página for carregada, executa a função que busca os usuários
window.onload = carregarUsuarios;
