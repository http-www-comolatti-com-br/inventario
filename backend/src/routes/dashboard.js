const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/dashboard/resumo
router.get('/resumo', auth, async (req, res) => {
  try {
    // Total de modelos
    const totalModelos = await pool.query('SELECT COUNT(*) as total FROM modelos');

    // Unidades por status
    const unidadesPorStatus = await pool.query(
      `SELECT status, COUNT(*) as total FROM unidades GROUP BY status`
    );

    // Total de unidades (patrimônios ativos, ignorando os baixados/lixo)
    const totalUnidades = await pool.query("SELECT COUNT(*) as total FROM unidades WHERE status != 'baixado'");

    // Total de consumíveis em estoque
    const totalConsumiveis = await pool.query(
      'SELECT COALESCE(SUM(quantidade_disponivel), 0) as total FROM estoque'
    );

    // Alertas de estoque mínimo
    const alertas = await pool.query(
      `SELECT COUNT(*) as total FROM estoque
       WHERE quantidade_disponivel <= quantidade_minima AND quantidade_minima > 0`
    );

    // Movimentações recentes (últimos 30 dias)
    const movRecentes = await pool.query(
      `SELECT COUNT(*) as total FROM movimentacoes
       WHERE criado_em >= NOW() - INTERVAL '30 days' AND cancelado = FALSE`
    );

    const statusMap = {};
    unidadesPorStatus.rows.forEach(r => { statusMap[r.status] = parseInt(r.total); });

    res.json({
      total_modelos: parseInt(totalModelos.rows[0].total),
      total_unidades: parseInt(totalUnidades.rows[0].total),
      total_consumiveis_estoque: parseInt(totalConsumiveis.rows[0].total),
      unidades_disponiveis: statusMap.disponivel || 0,
      unidades_em_uso: statusMap.em_uso || 0,
      unidades_manutencao: statusMap.manutencao || 0,
      unidades_baixadas: statusMap.baixado || 0,
      alertas_estoque_minimo: parseInt(alertas.rows[0].total),
      movimentacoes_30_dias: parseInt(movRecentes.rows[0].total),
    });
  } catch (err) {
    console.error('Erro no dashboard:', err);
    res.status(500).json({ error: 'Erro ao carregar dashboard.' });
  }
});

// GET /api/dashboard/consumiveis-criticos
router.get('/consumiveis-criticos', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.nome, m.marca, COALESCE(e.quantidade_disponivel, 0) as quantidade_disponivel, COALESCE(e.quantidade_minima, 0) as quantidade_minima
       FROM modelos m
       LEFT JOIN estoque e ON e.modelo_id = m.id
       WHERE m.tipo = 'consumivel' AND m.ativo = TRUE
       ORDER BY (COALESCE(e.quantidade_disponivel, 0) - COALESCE(e.quantidade_minima, 0)) ASC, COALESCE(e.quantidade_disponivel, 0) ASC
       LIMIT 4`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar consumíveis críticos:', err);
    res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
});

// GET /api/dashboard/por-categoria
router.get('/por-categoria', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.nome as categoria, 
              COUNT(DISTINCT m.id)::int as total_modelos,
              COUNT(DISTINCT u.id)::int as total_unidades
       FROM categorias c
       LEFT JOIN modelos m ON m.categoria_id = c.id
       LEFT JOIN unidades u ON u.modelo_id = m.id AND u.status != 'baixado'
       GROUP BY c.nome
       ORDER BY total_unidades DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados por categoria.' });
  }
});

// GET /api/dashboard/por-destinatario
router.get('/por-destinatario', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.nome_completo, d.setor, COUNT(u.id) as total_itens
       FROM destinatarios d
       LEFT JOIN unidades u ON u.destinatario_id = d.id AND u.status = 'em_uso'
       WHERE d.ativo = TRUE
       GROUP BY d.id, d.nome_completo, d.setor
       HAVING COUNT(u.id) > 0
       ORDER BY total_itens DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dados por destinatário.' });
  }
});

// GET /api/dashboard/movimentacoes-recentes
router.get('/movimentacoes-recentes', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mov.*, usr.nome_completo as usuario_nome,
              m.nome as modelo_nome, m.tipo as modelo_tipo,
              d.nome_completo as destinatario_nome,
              un.numero_serie, un.etiqueta_patrimonial
       FROM movimentacoes mov
       LEFT JOIN usuarios usr ON mov.usuario_id = usr.id
       LEFT JOIN modelos m ON mov.modelo_id = m.id
       LEFT JOIN destinatarios d ON mov.destinatario_id = d.id
       LEFT JOIN unidades un ON mov.unidade_id = un.id
       WHERE mov.cancelado = FALSE
       ORDER BY mov.criado_em DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar movimentações recentes.' });
  }
});

module.exports = router;
