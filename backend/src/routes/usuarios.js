const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/usuarios
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome_completo, login, perfil, ativo, setor, filial, criado_em FROM usuarios ORDER BY nome_completo'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// GET /api/usuarios/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome_completo, login, perfil, ativo, setor, filial, criado_em FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

// POST /api/usuarios
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { nome_completo, login, senha, perfil, ativo, setor, filial } = req.body;
    if (!nome_completo || !login || !senha || !perfil) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome_completo, login, senha, perfil.' });
    }
    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nome_completo, login, senha, perfil, ativo, setor, filial)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nome_completo, login, perfil, ativo, setor, filial`,
      [nome_completo, login, hash, perfil, ativo !== false, setor || null, filial || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Login já existe.' });
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { nome_completo, login, senha, perfil, ativo, setor, filial } = req.body;
    let query, params;
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      query = `UPDATE usuarios SET nome_completo=$1, login=$2, senha=$3, perfil=$4, ativo=$5, setor=$6, filial=$7, atualizado_em=NOW()
               WHERE id=$8 RETURNING id, nome_completo, login, perfil, ativo, setor, filial`;
      params = [nome_completo, login, hash, perfil, ativo, setor || null, filial || null, req.params.id];
    } else {
      query = `UPDATE usuarios SET nome_completo=$1, login=$2, perfil=$3, ativo=$4, setor=$5, filial=$6, atualizado_em=NOW()
               WHERE id=$7 RETURNING id, nome_completo, login, perfil, ativo, setor, filial`;
      params = [nome_completo, login, perfil, ativo, setor || null, filial || null, req.params.id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Login já existe.' });
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    // Não permitir excluir o admin padrão
    const check = await pool.query('SELECT login FROM usuarios WHERE id = $1', [req.params.id]);
    if (check.rows.length > 0 && check.rows[0].login === 'admin') {
      return res.status(403).json({ error: 'Não é permitido excluir o administrador padrão.' });
    }
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

module.exports = router;
