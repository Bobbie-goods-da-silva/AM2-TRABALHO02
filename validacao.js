// validacao.js (Versão Corrigida e Completa)

function sanitizarEValidarUsuario(req, res, next) {
  // Ignora rotas que não sejam de cadastro ou atualização
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }

  const dados = { ...req.body };
  const errors = [];

  // --- 1. VALIDAÇÃO DE DADOS OBRIGATÓRIOS ---
  if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim() === '') {
    errors.push('O campo "nome" é obrigatório.');
  }
  if (!dados.idade || isNaN(parseInt(dados.idade))) {
    errors.push('O campo "idade" deve ser um número válido.');
  }
  if (!dados.email || typeof dados.email !== 'string') {
    errors.push('O campo "email" é obrigatório.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, message: 'Dados inválidos.', errors });
  }

  // --- 2. SANITIZAÇÃO (LIMPEZA DOS DADOS) ---
  const camposTextuais = ['nome', 'endereco', 'email'];
  const palavrasProibidas = /\b(SELECT|UPDATE|DELETE|ORDER BY|FROM|WHERE|CREATE|TABLE|DATABASE)\b/gi;
  const caracteresProibidos = /["'?:=]/g;

  for (const campo of camposTextuais) {
    if (dados[campo]) {
      let valor = String(dados[campo]).trim();
      valor = valor.replace(caracteresProibidos, '');
      valor = valor.replace(palavrasProibidas, '');
      dados[campo] = valor.trim();
    }
  }

  // --- 3. VALIDAÇÃO PÓS-SANITIZAÇÃO ---
  if (dados.nome.trim() === '') {
    errors.push('O campo "nome" tornou-se inválido após a limpeza.');
  }
  if (dados.email.trim() === '') {
    errors.push('O campo "email" tornou-se inválido após a limpeza.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, message: 'Dados inválidos após sanitização.', errors });
  }

  // Anexa dados limpos
  req.sanitizedBody = dados;

  // Tudo certo, pode continuar para a rota principal
  next();
}

// Exporta middleware com nome descritivo
module.exports = { sanitizarEValidarUsuario };
