Claro! Aqui está a versão atualizada do seu README com as informações da equipe, membros, disciplina, curso e universidade, conforme solicitado:

---

# 📚 Aplicação de Geração e Manipulação de Usuários Fictícios

Este projeto foi desenvolvido como parte da disciplina **Autoração Multimídia II**, do curso de **Bacharelado em Sistemas e Mídias Digitais** da **Universidade Federal do Ceará (UFC)**.

## 👥 Equipe

**BOBBIE GOODS DA SILVA**

* Anna Fátima Pontes de Oliveira - 566500
* Jerbesson Silva da Costa - 493608

## 👨‍🏫 Docente Responsável

**Prof. Wellington W. F. Sarmento**  
Instituto Universidade Virtual (UFC Virtual) | Universidade Federal do Ceará (UFC)

---

## ✅ Requisitos Funcionais

| ID     | Descrição                                                                |
| ------ | ------------------------------------------------------------------------ |
| RF0001 | Gerar usuários fictícios com nome, idade, endereço e e-mail              |
| RF0002 | Listar os usuários em uma interface web com paginação                    |
| RF0003 | Ordenar os usuários por nome ou idade, de forma crescente ou decrescente |
| RF0004 | Inserir um novo usuário na base de dados (arquivo JSON)                  |
| RF0005 | Atualizar os dados de um usuário pelo ID                                 |
| RF0006 | Remover um usuário pelo ID                                               |
| RF0007 | Salvar e manter persistência dos usuários em arquivo JSON                |

---

## 📘 Acesso ao Tutorial

Você pode acessar um tutorial completo sobre esta aplicação de exemplo através deste link:
👉 [`tutorial.md`](./public/tutorial.md)

---

## 📂 Estrutura dos Arquivos

* `server.js`: servidor Express com API RESTful
* `index.html`: interface de listagem
* `script.js`: funções de carregamento, ordenação e paginação
* `style.css`: estilo da interface
* `usuarios.json`: banco de dados local
* `gerar_usuarios_fake.js`: gera usuários fictícios

---

## 📘 Funcionalidades

| ID     | Descrição                                                                | Implementado |
| ------ | ------------------------------------------------------------------------ | ------------ |
| RF0001 | Gerar usuários fictícios com nome, idade, endereço e e-mail              | ☑️           |
| RF0002 | Listar os usuários em uma interface web com paginação                    | ☑️           |
| RF0003 | Ordenar os usuários por nome ou idade, de forma crescente ou decrescente | ☑️           |
| RF0004 | Inserir um novo usuário na base de dados (arquivo JSON)                  | ☑️           |
| RF0005 | Atualizar os dados de um usuário (pelo ID)                               | ⬜            |
| RF0006 | Remover um usuário do sistema (pelo ID)                                  | ⬜            |
| RF0007 | Salvar e manter persistência dos usuários em arquivo JSON                | ⬜            |
| RNF002 | Paginar os usuários usando API (/list-users/\:count?)                    | ⬜            |

---

## 🚀 Tecnologias Utilizadas

* **Node.js**
* **Express**
* **@faker-js/faker**
* **UUID**
* **Body-Parser**
* **CORS**
* **HTML + JavaScript puro (sem frameworks)**

---

## 🛠️ Como Baixar e Executar a Aplicação

### ⚠️ IMPORTANTE: Criando um arquivo com *1.000.000 de usuários fictícios*

Para utilizar corretamente o projeto, é necessário criar o arquivo `usuarios.json`. Ele pode ser gerado executando o seguinte comando no terminal, dentro da pasta do projeto:

```bash
node gerar_usuarios_fake.js
```

A explicação do funcionamento da geração dos usuários se encontra no arquivo [`criando-json-usuarios.md`](./criando-json-usuarios.md).

---

### 1. Clone o repositório

```bash
git clone https://github.com/seuusuario/usuarios-app.git
cd usuarios-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute a API de geração de usuários

```bash
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT.

---

Se quiser, posso gerar também um `tutorial.md` ou o `criando-json-usuarios.md` com base nesse README.
