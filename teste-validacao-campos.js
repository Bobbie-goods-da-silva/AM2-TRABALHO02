// teste-validacao-campos.js
// Testes automatizados para validar a nova abordagem de sanitização e validação

const { sanitizarEValidarUsuario } = require('./validacao.js');

function runTest(testName, mockReq) {
  console.log(`\n--- Testando: ${testName} ---`);

  const mockRes = {
    status: function(code) {
      console.log(`Status: ${code}`);
      return this;
    },
    json: function(data) {
      console.log('Resposta JSON:', data);
    }
  };

  const mockNext = () => {
    console.log('Resultado: Middleware passou (chamou next()).');
    console.log('Dados Limpos:', mockReq.sanitizedBody);
  };

  sanitizarEValidarUsuario(mockReq, mockRes, mockNext);
}

// Simula requisição POST
const reqValida = {
  method: 'POST',
  body: {
    nome: "Usuário Válido",
    idade: 25,
    email: "valido@teste.com"
  }
};
runTest("Dados válidos devem passar", reqValida);

const reqComLixo = {
  method: 'POST',
  body: {
    nome: "  Hacker' DELETE FROM Tabela: ",
    idade: 99,
    email: "lixo@teste.com"
  }
};
runTest("Sanitização de palavras e caracteres proibidos", reqComLixo);

const reqInvalida = {
  method: 'POST',
  body: {
    idade: 30,
    email: "teste@teste.com"
  }
};
runTest("Dados faltando (nome) devem falhar", reqInvalida);

const reqPosInvalida = {
  method: 'POST',
  body: {
    nome: " ''??:: ",
    idade: 50,
    email: "outro@teste.com"
  }
};
runTest("Nome inválido após sanitização", reqPosInvalida);
