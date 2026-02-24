const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/categorias
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nome, subcategoria');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
});

// GET /api/categorias/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categoria.' });
  }
});

// POST /api/categorias
router.post('/', auth, async (req, res) => {
  try {
    const { nome, subcategoria } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });
    const result = await pool.query(
      'INSERT INTO categorias (nome, subcategoria) VALUES ($1, $2) RETURNING *',
      [nome, subcategoria || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
});

// PUT /api/categorias/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { nome, subcategoria } = req.body;
    const result = await pool.query(
      'UPDATE categorias SET nome=$1, subcategoria=$2 WHERE id=$3 RETURNING *',
      [nome, subcategoria || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada.' });
    res.json({ message: 'Categoria excluída com sucesso.' });
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Categoria possui itens vinculados.' });
    res.status(500).json({ error: 'Erro ao excluir categoria.' });
  }
});

module.exports = router;
