/**
 * Middleware para capitalizar automaticamente campos de texto.
 * Transforma a primeira letra de cada palavra em maiúscula.
 * Exemplo: "periférico mouse" → "Periférico Mouse"
 * 
 * Campos que NÃO devem ser capitalizados:
 * - login, senha, email (campos técnicos)
 * - tipo, perfil, status (campos de enum)
 * - part_number, numero_serie, etiqueta_patrimonial (códigos técnicos)
 * - observacoes, especificacoes (texto livre longo)
 * - quantidade_*, local_armazenagem (valores numéricos ou técnicos)
 */

const CAMPOS_IGNORADOS = new Set([
  'login', 'senha', 'email', 'tipo', 'perfil', 'status',
  'part_number', 'numero_serie', 'etiqueta_patrimonial',
  'observacoes', 'especificacoes', 'observacao',
  'quantidade', 'quantidade_disponivel', 'quantidade_minima',
  'id', 'modelo_id', 'categoria_id', 'destinatario_id',
  'destinatario_origem_id', 'unidade_id', 'estoque_id',
  'usuario_id', 'ativo', 'cancelado', 'motivo_cancelamento',
]);

function capitalizeWords(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      // Preservar preposições e artigos em minúsculo (exceto se for a primeira palavra)
      const lower = word.toLowerCase();
      const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'a', 'o', 'as', 'os', 'um', 'uma'];
      // Retorna a palavra com primeira letra maiúscula
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function capitalizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' && !CAMPOS_IGNORADOS.has(key)) {
        req.body[key] = capitalizeWords(value.trim());
      }
    }
  }
  next();
}

module.exports = { capitalizeBody, capitalizeWords };
