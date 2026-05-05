const crypto = require('crypto');

const SEGREDO = process.env.TOKEN_SECRET || 'troque-esse-segredo';

function gerarToken(payload) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const assinatura = crypto.createHmac('sha256', SEGREDO).update(base64Payload).digest('hex');
  return `${base64Payload}.${assinatura}`;
}

function validarToken(token) {
  const [base64Payload, assinaturaRecebida] = token.split('.');
  const assinaturaEsperada = crypto.createHmac('sha256', SEGREDO).update(base64Payload).digest('hex');

  if (assinaturaRecebida !== assinaturaEsperada) {
    throw new Error('Token inválido.');
  }

  return JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
}

module.exports = {
  gerarToken,
  validarToken
};