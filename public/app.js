/**
 * app.js
 * 
 * Roteador de cliente (client-side router) para SPA
 * Gerencia a navegação entre as diferentes views da aplicação
 */

// Variáveis globais
let usuarios = [];
let paginaAtual = 1;
const usuariosPorPagina = 20;
let ordemAtual = { campo: "nome", crescente: true };

// Mapeamento de rotas para arquivos HTML parciais
const routes = {
  '': '/views/listagem.html',
  '#/': '/views/listagem.html',
  '#/cadastro': '/views/cadastro.html',
  '#/alterar': '/views/alterar.html',
  '#/remover': '/views/remover.html'
};

/**
 * Função assíncrona que carrega os usuários da API
 */
async function carregarUsuarios(num = 0) {
  try {
    const resposta = await fetch(`/list-users/${num || 1000}`);
    usuarios = await resposta.json();
    console.log('Usuários carregados:', usuarios.length);
    atualizarPaginacao();
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

/**
 * Atualiza os dados exibidos na página atual
 */
function atualizarPaginacao() {
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);
  paginaAtual = Math.max(1, Math.min(paginaAtual, totalPaginas));

  const paginaAtualEl = document.getElementById("paginaAtual");
  const totalPaginasEl = document.getElementById("totalPaginas");
  
  if (paginaAtualEl) paginaAtualEl.innerText = paginaAtual;
  if (totalPaginasEl) totalPaginasEl.innerText = totalPaginas;

  const inicio = (paginaAtual - 1) * usuariosPorPagina;
  const fim = inicio + usuariosPorPagina;

  renderizarTabela(usuarios.slice(inicio, fim));
}

/**
 * Função que desenha a tabela com os dados de usuários
 */
function renderizarTabela(data) {
  const tbody = document.querySelector("#tabelaUsuarios tbody");
  if (!tbody) {
    console.log('Tabela não encontrada');
    return;
  }
  
  tbody.innerHTML = "";

  data.forEach((u) => {
    const tr = document.createElement("tr");
    
    // Determina se deve adicionar botões de ação baseado na rota atual
    const hash = window.location.hash || '';
    let botaoAcao = '';
    
    if (hash === '#/alterar') {
      botaoAcao = `<td><button onclick="editarUsuario('${u.id}')">✏️ Editar</button></td>`;
    } else if (hash === '#/remover') {
      botaoAcao = `<td><button onclick="removerUsuario('${u.id}')">🗑️ Remover</button></td>`;
    }
    
    tr.innerHTML = `
      <td>${u.nome}</td>
      <td>${u.idade}</td>
      <td>${u.endereco || 'N/A'}</td>
      <td>${u.email}</td>
      ${botaoAcao}
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Função de ordenação
 */
function ordenarTabela(campo) {
  if (ordemAtual.campo === campo) {
    ordemAtual.crescente = !ordemAtual.crescente;
  } else {
    ordemAtual.campo = campo;
    ordemAtual.crescente = true;
  }

  usuarios.sort((a, b) => {
    const valorA = a[campo];
    const valorB = b[campo];
    
    let comp;
    if (typeof valorA === "string") {
      comp = valorA.localeCompare(valorB);
    } else {
      comp = valorA - valorB;
    }
    
    return ordemAtual.crescente ? comp : -comp;
  });

  atualizarPaginacao();
}

/**
 * Função chamada ao clicar em "Página Anterior"
 */
function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    atualizarPaginacao();
  }
}

/**
 * Função chamada ao clicar em "Próxima Página"
 */
function proximaPagina() {
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    atualizarPaginacao();
  }
}

/**
 * Função assíncrona que gerencia a navegação entre rotas
 */
async function handleLocation() {
  const hash = window.location.hash || '';
  console.log('Navegando para:', hash);
  
  const viewPath = routes[hash];
  
  if (!viewPath) {
    console.error(`Rota não encontrada: ${hash}`);
    window.location.hash = '#/';
    return;
  }
  
  try {
    const response = await fetch(viewPath);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar view: ${response.status}`);
    }
    
    const html = await response.text();
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = html;
    
    console.log('View carregada:', viewPath);
    
    // Ações específicas para cada rota
    switch (hash) {
      case '':
      case '#/':
      case '#/alterar':
      case '#/remover':
        console.log('Carregando usuários para:', hash);
        await carregarUsuarios();
        break;
        
      case '#/cadastro':
        console.log('Configurando formulário de cadastro');
        setupCadastroForm();
        break;
    }
    
  } catch (error) {
    console.error('Erro ao carregar a view:', error);
    document.getElementById('app-content').innerHTML = '<h2>Erro ao carregar a página</h2>';
  }
}

/**
 * Configura o formulário de cadastro
 */
function setupCadastroForm() {
  const formulario = document.getElementById("formulario");
  
  if (formulario) {
    formulario.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const nome = document.getElementById("nome").value;
      const idade = document.getElementById("idade").value;
      const endereco = document.getElementById("endereco").value;
      const email = document.getElementById("email").value;
      
      try {
        const response = await fetch("/cadastrar-usuario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            idade: parseInt(idade),
            endereco,
            email,
          }),
        });
        
        const resultado = await response.json();
        
        const mensagemDiv = document.getElementById("mensagem");
        const novoUsuarioDiv = document.getElementById("novoUsuario");
        
        if (response.ok) {
          mensagemDiv.innerHTML = `<p style="color: green;">${resultado.message}</p>`;
          novoUsuarioDiv.innerHTML = `
            <h3>Usuário Cadastrado:</h3>
            <p><strong>Nome:</strong> ${resultado.usuario.nome}</p>
            <p><strong>Idade:</strong> ${resultado.usuario.idade}</p>
            <p><strong>Endereço:</strong> ${resultado.usuario.endereco}</p>
            <p><strong>Email:</strong> ${resultado.usuario.email}</p>
          `;
          formulario.reset();
        } else {
          mensagemDiv.innerHTML = `<p style="color: red;">Erro: ${resultado.error}</p>`;
        }
      } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        document.getElementById("mensagem").innerHTML = 
          '<p style="color: red;">Erro ao cadastrar usuário.</p>';
      }
    });
  }
}

/**
 * Função para editar usuário
 */
async function editarUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return;
  
  const nome = prompt("Nome:", usuario.nome);
  const idade = prompt("Idade:", usuario.idade);
  const endereco = prompt("Endereço:", usuario.endereco);
  const email = prompt("Email:", usuario.email);
  
  if (nome && idade && endereco && email) {
    try {
      const response = await fetch(`/atualizar-usuario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          idade: parseInt(idade),
          endereco,
          email,
        }),
      });
      
      const resultado = await response.json();
      if (resultado.ok) {
        alert("Usuário atualizado com sucesso!");
        carregarUsuarios();
      } else {
        alert("Erro ao atualizar usuário: " + (resultado.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor");
    }
  }
}

/**
 * Função para remover usuário
 */
async function removerUsuario(id) {
  if (!confirm("Tem certeza que deseja remover este usuário?")) {
    return;
  }

  try {
    const response = await fetch(`/remover-usuario/${id}`, {
      method: "DELETE",
    });

    const resultado = await response.json();
    if (resultado.ok) {
      alert("Usuário removido com sucesso!");
      carregarUsuarios();
    } else {
      alert("Erro ao remover usuário: " + (resultado.error || "Erro desconhecido"));
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor");
  }
}

// Event listeners
window.addEventListener('hashchange', handleLocation);
window.addEventListener('DOMContentLoaded', handleLocation);

// Expor funções globalmente
window.ordenarTabela = ordenarTabela;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.editarUsuario = editarUsuario;
window.removerUsuario = removerUsuario;
