const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/modelos
router.get('/', auth, async (req, res) => {
  try {
    const { tipo, categoria_id, busca } = req.query;
    let query = `SELECT m.*, c.nome as categoria_nome, c.subcategoria
                 FROM modelos m LEFT JOIN categorias c ON m.categoria_id = c.id WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (tipo) { query += ` AND m.tipo = $${idx++}`; params.push(tipo); }
    if (categoria_id) { query += ` AND m.categoria_id = $${idx++}`; params.push(categoria_id); }
    if (busca) { query += ` AND (m.nome ILIKE $${idx} OR m.marca ILIKE $${idx} OR m.modelo ILIKE $${idx})`; params.push(`%${busca}%`); idx++; }
    query += ' ORDER BY m.nome';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar modelos.' });
  }
});

// GET /api/modelos/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, c.nome as categoria_nome, c.subcategoria
       FROM modelos m LEFT JOIN categorias c ON m.categoria_id = c.id WHERE m.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Modelo não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar modelo.' });
  }
});

// POST /api/modelos
router.post('/', auth, async (req, res) => {
  try {
    const { tipo, categoria_id, nome, marca, modelo, part_number, especificacoes, observacoes } = req.body;
    if (!tipo || !nome) return res.status(400).json({ error: 'Tipo e nome são obrigatórios.' });
    const result = await pool.query(
      `INSERT INTO modelos (tipo, categoria_id, nome, marca, modelo, part_number, especificacoes, observacoes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [tipo, categoria_id || null, nome, marca || null, modelo || null, part_number || null, especificacoes || null, observacoes || null]
    );
    // Se for consumível, criar registro de estoque automaticamente
    if (tipo === 'consumivel') {
      await pool.query(
        'INSERT INTO estoque (modelo_id, quantidade_disponivel, quantidade_minima) VALUES ($1, 0, 0)',
        [result.rows[0].id]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar modelo.' });
  }
});

// PUT /api/modelos/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { tipo, categoria_id, nome, marca, modelo, part_number, especificacoes, observacoes } = req.body;
    const result = await pool.query(
      `UPDATE modelos SET tipo=$1, categoria_id=$2, nome=$3, marca=$4, modelo=$5, part_number=$6, especificacoes=$7, observacoes=$8, atualizado_em=NOW()
       WHERE id=$9 RETURNING *`,
      [tipo, categoria_id || null, nome, marca || null, modelo || null, part_number || null, especificacoes || null, observacoes || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Modelo não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar modelo.' });
  }
});

// DELETE /api/modelos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM modelos WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Modelo não encontrado.' });
    res.json({ message: 'Modelo excluído com sucesso.' });
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Modelo possui itens vinculados.' });
    res.status(500).json({ error: 'Erro ao excluir modelo.' });
  }
});

module.exports = router;
