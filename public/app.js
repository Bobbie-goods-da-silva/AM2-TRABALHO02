/**
 * app.js
 * 
 * Roteador de cliente (client-side router) para SPA
 * Gerencia a navegação entre as diferentes views da aplicação
 */

// Variáveis globais
let usuarios = [];
let termoPesquisa = "";
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

// Mapeamento de rotas para títulos de página
const pageTitles = {
  '': 'Lista de Usuários',
  '#/': 'Lista de Usuários',
  '#/cadastro': 'Cadastro de Usuário',
  '#/alterar': 'Alterar Usuário',
  '#/remover': 'Remover Usuário'
};

/**
 * Exibe o loader no contêiner de conteúdo
 */
function showLoader() {
  const appContent = document.getElementById('app-content');
  let loaderEl = document.getElementById('global-loader');
  if (!loaderEl) {
    loaderEl = document.createElement('div');
    loaderEl.className = 'loader';
    loaderEl.id = 'global-loader';
    appContent.appendChild(loaderEl);
  }
}

/**
 * Remove o loader do contêiner de conteúdo
 */
function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.remove();
  }
}

/**
 * Exibe uma mensagem no topo do contêiner de conteúdo
 * @param {string} message - Texto da mensagem
 * @param {string} type - Tipo da mensagem ('success' ou 'error')
 */
function showMessage(message, type) {
  const appContent = document.getElementById('app-content');
  
  // Remove mensagens anteriores
  const existingMessages = appContent.querySelectorAll('.message');
  existingMessages.forEach(msg => msg.remove());
  
  // Cria nova mensagem
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  
  // Insere no topo do contêiner
  // Insere antes do main-content-area se existir, ou como primeiro filho
  const mainContentArea = document.getElementById('main-content-area');
  if (mainContentArea) {
    appContent.insertBefore(messageEl, mainContentArea);
  } else {
    appContent.insertBefore(messageEl, appContent.firstChild);
  }
  
  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 5000);
}

/**
 * Função assíncrona que carrega os usuários da API
 */
async function carregarUsuarios() {
  try {
    // Usa a rota existente que já funciona, com parâmetro 0 para retornar todos
    const resposta = await fetch('/list-users/0');
    usuarios = await resposta.json();
    console.log('Usuários carregados:', usuarios.length);
    atualizarPaginacao(); // Chama a atualização da paginação após carregar
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    showMessage('Erro ao carregar usuários: ' + error.message, 'error');
  }
}

/**
 * Atualiza os dados exibidos na página atual
 */
function atualizarPaginacao() {
  // Filtra usuários pelo termo de pesquisa
  let usuariosFiltrados = termoPesquisa
    ? usuarios.filter(u =>
        u.nome.toLowerCase().includes(termoPesquisa) ||
        u.email.toLowerCase().includes(termoPesquisa) ||
        (u.endereco && u.endereco.toLowerCase().includes(termoPesquisa))
      )
    : usuarios;

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);
  paginaAtual = Math.max(1, Math.min(paginaAtual, totalPaginas));

  // Obtém o contêiner principal para o conteúdo da view
  const mainContentArea = document.getElementById('main-content-area');
  if (!mainContentArea) {
    console.error('Elemento #main-content-area não encontrado. A página pode não ter sido inicializada corretamente.');
    return;
  }

  // Obtém o título da página atual
  const hash = window.location.hash || '';
  const pageTitle = pageTitles[hash] || 'Página Não Encontrada';

  // Renderiza barra de paginação e pesquisa
  let paginacaoHtml = `
    <div id="paginacao" class="paginacao">
      <input type="text" id="barraPesquisa" placeholder="Pesquisar..." value="${termoPesquisa}" style="padding: 0.4em 1em; font-size: 1em; border-radius: 4px; border: 1px solid #ccc; min-width: 180px; margin-right: 1.5rem;" />
      <div class="controle-paginas">
        <button onclick="paginaAnterior()" ${paginaAtual <= 1 ? 'disabled' : ''}>⬅ Anterior</button>
        Página <span id="paginaAtual">${paginaAtual}</span> de <span id="totalPaginas">${totalPaginas}</span>
        <button onclick="proximaPagina()" ${paginaAtual >= totalPaginas ? 'disabled' : ''}>Próxima ➡</button>
      </div>
    </div>
  `;
  // Renderiza tabela de usuários
  const inicio = (paginaAtual - 1) * usuariosPorPagina;
  const fim = inicio + usuariosPorPagina;
  const tabelaHtml = gerarTabelaHtml(usuariosFiltrados.slice(inicio, fim));
  
  // Constrói todo o HTML da página (título, paginação, tabela)
  mainContentArea.innerHTML = `
    <h2 id="page-title">${pageTitle}</h2>
    ${paginacaoHtml}
    ${tabelaHtml}
  `;

  // Adiciona listener para pesquisa dinâmica e restaura foco/cursor
  const barraPesquisa = document.getElementById('barraPesquisa');
  if (barraPesquisa) {
    // Evita múltiplos listeners
    barraPesquisa.oninput = null;
    barraPesquisa.addEventListener('input', (e) => {
      // Salva posição do cursor
      const pos = barraPesquisa.selectionStart;
      termoPesquisa = e.target.value.toLowerCase();
      paginaAtual = 1;
      atualizarPaginacao();
      // Após atualizar, restaura foco e posição do cursor
      setTimeout(() => {
        const novaBarra = document.getElementById('barraPesquisa');
        if (novaBarra) {
          novaBarra.focus();
          novaBarra.setSelectionRange(pos, pos);
        }
      }, 0);
    });
    // Garante que o campo mantenha o foco ao renderizar
    barraPesquisa.focus();
  }
}
// Função para gerar o HTML da tabela de usuários
function gerarTabelaHtml(data) {
  let hash = window.location.hash || '';
  let botaoAcaoHeader = '';
  if (hash === '#/alterar') {
    botaoAcaoHeader = '<th>Ações</th>';
  } else if (hash === '#/remover') {
    botaoAcaoHeader = '<th>Ações</th>';
  }

  // Helper function to get sort indicator
  const getSortIndicator = (campo) => {
    if (ordemAtual.campo === campo) {
      return ordemAtual.crescente ? ' ▲' : ' ▼';
    }
    return '';
  };

  let html = `<table id="tabelaUsuarios">
    <thead>
      <tr>
        <th onclick="ordenarTabela('nome')">Nome${getSortIndicator('nome')}</th>
        <th onclick="ordenarTabela('idade')">Idade${getSortIndicator('idade')}</th>
        <th onclick="ordenarTabela('endereco')">Endereço${getSortIndicator('endereco')}</th>
        <th onclick="ordenarTabela('email')">Email${getSortIndicator('email')}</th>
        ${botaoAcaoHeader}
      </tr>
    </thead>
    <tbody>
  `;
  data.forEach(u => {
    let botaoAcao = '';
    if (hash === '#/alterar') {
      botaoAcao = `<td><button onclick="editarUsuario('${u.id}')">✏️ Editar</button></td>`;
    } else if (hash === '#/remover') {
      botaoAcao = `<td><button onclick="removerUsuario('${u.id}')">🗑️ Remover</button></td>`;
    }
    html += `
      <tr>
        <td>${u.nome}</td>
        <td>${u.idade}</td>
        <td>${u.endereco || 'N/A'}</td>
        <td>${u.email}</td>
        ${botaoAcao}
      </tr>
    `;
  });
  html += '</tbody></table>';
  return html;
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
  const pageTitle = pageTitles[hash] || 'Página Não Encontrada';
  
  if (!viewPath) {
    console.error(`Rota não encontrada: ${hash}`);
    window.location.hash = '#/';
    return;
  }
  
  // Mostra o loader antes de carregar a view
  showLoader();
  
  try {
    const response = await fetch(viewPath);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar view: ${response.status}`);
    }
    
    const html = await response.text(); // O HTML da view pode ser vazio para algumas rotas agora
    const appContent = document.getElementById('app-content');
    
    // Limpa o conteúdo principal e cria o contêiner para a view
    appContent.innerHTML = `<div id="main-content-area"></div>`;
    const mainContentArea = document.getElementById('main-content-area');
    
    console.log('View carregada:', viewPath);
    
    // Ações específicas para cada rota
    switch (hash) {
      case '':
      case '#/':
      case '#/alterar':
      case '#/remover':
        // Para estas rotas, o título e o conteúdo (tabela/paginação) são gerados por atualizarPaginacao
        await carregarUsuarios();
        break;
        
      case '#/cadastro':
        // Para a rota de cadastro, injetamos o título e o HTML do formulário
        mainContentArea.innerHTML = `<h2 id="page-title">${pageTitle}</h2>` + html;
        setupCadastroForm();
        break;
    }
    
    // Remove o loader após carregar tudo
    hideLoader();
    
  } catch (error) {
    console.error('Erro ao carregar a view:', error);
    hideLoader();
    document.getElementById('app-content').innerHTML = '<h2>Erro ao carregar a página</h2>';
    showMessage('Erro ao carregar a página', 'error');
  }
}

/**
 * Configura o formulário de cadastro
 */
function setupCadastroForm() {
  // Os elementos do formulário agora estarão dentro de #main-content-area
  const formulario = document.getElementById("formulario");
  
  if (formulario) {
    formulario.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const nome = document.getElementById("nome").value;
      const idade = document.getElementById("idade").value;
      const endereco = document.getElementById("endereco").value;
      const email = document.getElementById("email").value;
      
      // Mostra loader durante o envio
      showLoader();
      
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
        
        // Remove loader
        hideLoader();
        
        if (response.ok) {
          showMessage(`Usuário ${resultado.usuario.nome} cadastrado com sucesso!`, 'success');
          
          const novoUsuarioDiv = document.getElementById("novoUsuario");
          if (novoUsuarioDiv) {
            novoUsuarioDiv.innerHTML = `
              <h3>Usuário Cadastrado:</h3>
              <p><strong>Nome:</strong> ${resultado.usuario.nome}</p>
              <p><strong>Idade:</strong> ${resultado.usuario.idade}</p>
              <p><strong>Endereço:</strong> ${resultado.usuario.endereco}</p>
              <p><strong>Email:</strong> ${resultado.usuario.email}</p>
            `;
          }
          formulario.reset();
        } else {
          showMessage(`Erro ao cadastrar usuário: ${resultado.error}`, 'error');
        }
      } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        hideLoader();
        showMessage('Erro ao conectar com o servidor', 'error');
      }
    });
  }
}

/**
 * Função para editar usuário usando modal customizado
 */
async function editarUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return;
  
  // Preenche os campos do modal com os dados do usuário
  document.getElementById('modalNome').value = usuario.nome;
  document.getElementById('modalIdade').value = usuario.idade;
  document.getElementById('modalEndereco').value = usuario.endereco || '';
  document.getElementById('modalEmail').value = usuario.email;
  
  // Armazena o ID do usuário que está sendo editado
  const modal = document.getElementById('modalEdicao');
  modal.setAttribute('data-usuario-id', id);
  
  // Exibe o modal
  modal.style.display = 'flex';
}

/**
 * Função para remover usuário
 */
async function removerUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return;
  
  if (!confirm(`Tem certeza que deseja remover o usuário ${usuario.nome}?`)) {
    return;
  }

  showLoader();

  try {
    const response = await fetch(`/remover-usuario/${id}`, {
      method: "DELETE",
    });

    const resultado = await response.json();
    hideLoader();
    
    if (resultado.ok) {
      showMessage(`Usuário ${usuario.nome} removido com sucesso!`, 'success');
      carregarUsuarios(); // Recarrega a lista para refletir a remoção
    } else {
      showMessage(`Erro ao remover usuário: ${resultado.error || "Erro desconhecido"}`, 'error');
    }
  } catch (error) {
    console.error("Erro:", error);
    hideLoader();
    showMessage('Erro ao conectar com o servidor', 'error');
  }
}

/**
 * Função para fechar o modal de edição
 */
function fecharModalEdicao() {
  const modal = document.getElementById('modalEdicao');
  modal.style.display = 'none';
  
  // Limpa os campos do formulário
  document.getElementById('formEdicao').reset();
  
  // Remove o atributo data-usuario-id
  modal.removeAttribute('data-usuario-id');
}

/**
 * Função para salvar as alterações do usuário
 */
async function salvarEdicaoUsuario(dadosUsuario, id) {
  showLoader();
  
  try {
    const response = await fetch(`/atualizar-usuario/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: dadosUsuario.nome,
        idade: parseInt(dadosUsuario.idade),
        endereco: dadosUsuario.endereco,
        email: dadosUsuario.email,
      }),
    });
    
    const resultado = await response.json();
    hideLoader();
    
    if (resultado.ok) {
      showMessage(`Usuário ${dadosUsuario.nome} atualizado com sucesso!`, 'success');
      fecharModalEdicao();
      carregarUsuarios();
    } else {
      showMessage(`Erro ao atualizar usuário: ${resultado.error || "Erro desconhecido"}`, 'error');
    }
  } catch (error) {
    console.error("Erro:", error);
    hideLoader();
    showMessage('Erro ao conectar com o servidor', 'error');
  }
}

// Event listeners
window.addEventListener('hashchange', handleLocation);
window.addEventListener('DOMContentLoaded', () => {
  handleLocation();
  
  // Event listener para o botão cancelar do modal
  const btnCancelar = document.getElementById('btnCancelarEdicao');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', fecharModalEdicao);
  }
  
  // Event listener para fechar modal clicando no overlay
  const modalOverlay = document.getElementById('modalEdicao');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        fecharModalEdicao();
      }
    });
  }
  
  // Event listener para o formulário de edição
  const formEdicao = document.getElementById('formEdicao');
  if (formEdicao) {
    formEdicao.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const modal = document.getElementById('modalEdicao');
      const usuarioId = modal.getAttribute('data-usuario-id');
      
      if (!usuarioId) {
        showMessage('Erro: ID do usuário não encontrado', 'error');
        return;
      }
      
      const formData = new FormData(formEdicao);
      const dadosUsuario = Object.fromEntries(formData);
      
      // Validação básica
      if (!dadosUsuario.nome || !dadosUsuario.idade || !dadosUsuario.endereco || !dadosUsuario.email) {
        showMessage('Por favor, preencha todos os campos', 'error');
        return;
      }
      
      await salvarEdicaoUsuario(dadosUsuario, usuarioId);
    });
  }
});

// Expor funções globalmente
window.ordenarTabela = ordenarTabela;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.editarUsuario = editarUsuario;
window.removerUsuario = removerUsuario;
window.showLoader = showLoader;
window.hideLoader = hideLoader;
window.showMessage = showMessage;
window.fecharModalEdicao = fecharModalEdicao;
