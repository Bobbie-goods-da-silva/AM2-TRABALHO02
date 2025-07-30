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
 * Exibe o loader no contêiner de conteúdo
 */
function showLoader() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = '<div class="loader"></div>';
}

/**
 * Remove o loader do contêiner de conteúdo
 */
function hideLoader() {
  const loader = document.querySelector('.loader');
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
  appContent.insertBefore(messageEl, appContent.firstChild);
  
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

  // Atualiza estado dos botões de paginação
  const btnAnterior = document.querySelector('.paginacao button:first-child');
  const btnProxima = document.querySelector('.paginacao button:last-child');
  
  if (btnAnterior) btnAnterior.disabled = paginaAtual <= 1;
  if (btnProxima) btnProxima.disabled = paginaAtual >= totalPaginas;

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
  
  // Mostra o loader antes de carregar a view
  showLoader();
  
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
    
    // Remove o loader após carregar tudo
    hideLoader();
    
    // Condicionalmente mostra ou esconde a seção de paginação
    const paginacao = document.getElementById('paginacao');
    if (hash === '#/') {
      paginacao.style.display = 'block';
    } else {
      paginacao.style.display = 'none';
    }
    
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
      carregarUsuarios();
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
