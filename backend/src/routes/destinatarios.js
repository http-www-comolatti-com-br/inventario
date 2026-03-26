const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/destinatarios
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinatarios ORDER BY nome_completo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar destinatários.' });
  }
});

// GET /api/destinatarios/search-ad - Buscar usuários no Active Directory
router.get('/search-ad', auth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Termo de busca é obrigatório.' });
  try {
    const adService = require('../services/adService');
    const users = await adService.searchUsers(q);
    res.json(users);
  } catch (err) {
    console.error('Erro na busca AD:', err);
    res.status(500).json({ error: `Erro na busca AD: ${err.message}` });
  }
});

// GET /api/destinatarios/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinatarios WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Destinatário não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar destinatário.' });
  }
});

// GET /api/destinatarios/:id/itens - Itens em posse do destinatário
router.get('/:id/itens', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo, m.tipo,
              c.nome as categoria_nome, c.subcategoria
       FROM unidades u
       JOIN modelos m ON u.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       WHERE u.destinatario_id = $1 AND u.status = 'em_uso'
       ORDER BY m.nome`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar itens do destinatário.' });
  }
});


// POST /api/destinatarios
router.post('/', auth, async (req, res) => {
  try {
    const { nome_completo, setor, filial, ativo, observacoes, telefone, cidade, origem } = req.body;
    if (!nome_completo) return res.status(400).json({ error: 'Nome completo é obrigatório.' });
    const result = await pool.query(
      `INSERT INTO destinatarios (nome_completo, setor, filial, ativo, observacoes, telefone, cidade, origem)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nome_completo, setor || null, filial || null, ativo !== false, observacoes || null, telefone || null, cidade || null, origem || 'local']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar destinatário.' });
  }
});

// PUT /api/destinatarios/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { nome_completo, setor, filial, ativo, observacoes, telefone, cidade } = req.body;
    const result = await pool.query(
      `UPDATE destinatarios SET nome_completo=$1, setor=$2, filial=$3, ativo=$4, observacoes=$5, telefone=$6, cidade=$7, atualizado_em=NOW()
       WHERE id=$8 RETURNING *`,
      [nome_completo, setor || null, filial || null, ativo, observacoes || null, telefone || null, cidade || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Destinatário não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar destinatário.' });
  }
});

// DELETE /api/destinatarios/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM destinatarios WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Destinatário não encontrado.' });
    res.json({ message: 'Destinatário excluído com sucesso.' });
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Destinatário possui itens vinculados.' });
    res.status(500).json({ error: 'Erro ao excluir destinatário.' });
  }
});

module.exports = router;
