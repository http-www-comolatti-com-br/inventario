const express = require('express');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/estoque
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo, m.part_number,
              c.nome as categoria_nome, c.subcategoria
       FROM estoque e
       JOIN modelos m ON e.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       ORDER BY m.nome`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estoque.' });
  }
});

// GET /api/estoque/alertas
router.get('/alertas', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo,
              c.nome as categoria_nome, c.subcategoria
       FROM estoque e
       JOIN modelos m ON e.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       WHERE e.quantidade_disponivel <= e.quantidade_minima AND e.quantidade_minima > 0
       ORDER BY e.quantidade_disponivel ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar alertas.' });
  }
});

// GET /api/estoque/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo, m.part_number, m.especificacoes,
              c.nome as categoria_nome, c.subcategoria
       FROM estoque e
       JOIN modelos m ON e.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item de estoque não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar item de estoque.' });
  }
});

// PUT /api/estoque/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantidade_minima, local_armazenagem } = req.body;
    const result = await pool.query(
      `UPDATE estoque SET quantidade_minima=$1, local_armazenagem=$2, atualizado_em=NOW()
       WHERE id=$3 RETURNING *`,
      [quantidade_minima || 0, local_armazenagem || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item não encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar estoque.' });
  }
});

// DELETE /api/estoque/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar se o item existe
    const item = await client.query(
      'SELECT e.*, m.nome as modelo_nome FROM estoque e JOIN modelos m ON e.modelo_id = m.id WHERE e.id = $1',
      [req.params.id]
    );
    if (item.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item de estoque não encontrado.' });
    }

    const { modelo_id, quantidade_disponivel, modelo_nome } = item.rows[0];

    // Bloquear se ainda há saldo em estoque
    if (quantidade_disponivel > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: `Não é possível excluir "${modelo_nome}" pois ainda há ${quantidade_disponivel} unidade(s) em estoque. Zere o saldo antes de excluir.`
      });
    }

    // Verificar se há movimentações vinculadas ao modelo
    const movs = await client.query(
      'SELECT COUNT(*) FROM movimentacoes WHERE modelo_id = $1',
      [modelo_id]
    );
    const temHistorico = parseInt(movs.rows[0].count) > 0;

    // Excluir o registro de estoque
    await client.query('DELETE FROM estoque WHERE id = $1', [req.params.id]);

    // Se não tem histórico, excluir também o modelo
    if (!temHistorico) {
      await client.query('DELETE FROM modelos WHERE id = $1', [modelo_id]);
    }

    await client.query('COMMIT');
    res.json({
      message: temHistorico
        ? `Item "${modelo_nome}" removido do estoque. O modelo foi mantido por possuir histórico de movimentações.`
        : `Item "${modelo_nome}" excluído com sucesso.`,
      modelo_excluido: !temHistorico
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir item de estoque:', err);
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Item possui registros vinculados e não pode ser excluído.' });
    }
    res.status(500).json({ error: 'Erro ao excluir item de estoque.' });
  } finally {
    client.release();
  }
});

module.exports = router;
