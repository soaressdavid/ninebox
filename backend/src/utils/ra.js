function normalizarRa(ra) {
  return String(ra || '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

function validarRa(ra) {
  const valor = normalizarRa(ra);

  // Regra genérica e segura para começar:
  // aceita letras e números, entre 4 e 20 caracteres.
  // Ajuste se o projeto decidir que RA será só numérico.
  return /^\d{4,20}$/.test(valor);
}

module.exports = {
  normalizarRa,
  validarRa
};