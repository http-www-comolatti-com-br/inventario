const express = require('express');
const QRCode = require('qrcode');
const pool = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/unidades
router.get('/', auth, async (req, res) => {
  try {
    const { status, modelo_id, destinatario_id, busca } = req.query;
    let query = `SELECT u.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo, m.tipo, m.part_number,
                        c.nome as categoria_nome, c.subcategoria,
                        d.nome_completo as destinatario_nome
                 FROM unidades u
                 JOIN modelos m ON u.modelo_id = m.id
                 LEFT JOIN categorias c ON m.categoria_id = c.id
                 LEFT JOIN destinatarios d ON u.destinatario_id = d.id
                 WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (status) { query += ` AND u.status = $${idx++}`; params.push(status); }
    if (modelo_id) { query += ` AND u.modelo_id = $${idx++}`; params.push(modelo_id); }
    if (destinatario_id) { query += ` AND u.destinatario_id = $${idx++}`; params.push(destinatario_id); }
    if (busca) {
      query += ` AND (u.numero_serie ILIKE $${idx} OR u.etiqueta_patrimonial ILIKE $${idx} OR m.nome ILIKE $${idx} OR m.marca ILIKE $${idx})`;
      params.push(`%${busca}%`); idx++;
    }
    query += ' ORDER BY m.nome, u.id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar unidades.' });
  }
});

// GET /api/unidades/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo, m.tipo, m.part_number, m.especificacoes,
              c.nome as categoria_nome, c.subcategoria,
              d.nome_completo as destinatario_nome, d.setor as destinatario_setor
       FROM unidades u
       JOIN modelos m ON u.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       LEFT JOIN destinatarios d ON u.destinatario_id = d.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Unidade não encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar unidade.' });
  }
});

// GET /api/unidades/:id/qrcode - Gerar QR Code da unidade
router.get('/:id/qrcode', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo, m.tipo, m.part_number,
              c.nome as categoria_nome, c.subcategoria,
              d.nome_completo as destinatario_nome
       FROM unidades u
       JOIN modelos m ON u.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       LEFT JOIN destinatarios d ON u.destinatario_id = d.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Unidade não encontrada.' });

    const unidade = result.rows[0];
    const qrData = JSON.stringify({
      id: unidade.id,
      tipo: 'patrimonio',
      item: unidade.modelo_nome,
      marca: unidade.marca,
      modelo: unidade.modelo_modelo,
      serie: unidade.numero_serie,
      etiqueta: unidade.etiqueta_patrimonial,
      status: unidade.status,
      categoria: unidade.categoria_nome,
      destinatario: unidade.destinatario_nome,
      local: unidade.local,
    });

    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    res.json({ qrcode: qrImage, dados: unidade });
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
    res.status(500).json({ error: 'Erro ao gerar QR Code.' });
  }
});

// GET /api/unidades/:id/qrcode/image - QR Code como imagem PNG
router.get('/:id/qrcode/image', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, m.nome as modelo_nome, m.marca, m.modelo as modelo_modelo,
              c.nome as categoria_nome,
              d.nome_completo as destinatario_nome
       FROM unidades u
       JOIN modelos m ON u.modelo_id = m.id
       LEFT JOIN categorias c ON m.categoria_id = c.id
       LEFT JOIN destinatarios d ON u.destinatario_id = d.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Unidade não encontrada.' });

    const unidade = result.rows[0];
    const qrData = JSON.stringify({
      id: unidade.id,
      item: unidade.modelo_nome,
      marca: unidade.marca,
      modelo: unidade.modelo_modelo,
      serie: unidade.numero_serie,
      etiqueta: unidade.etiqueta_patrimonial,
      status: unidade.status,
      destinatario: unidade.destinatario_nome,
    });

    const buffer = await QRCode.toBuffer(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar QR Code.' });
  }
});

// GET /api/unidades/:id/historico
router.get('/:id/historico', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mov.*, u.nome_completo as usuario_nome,
              d.nome_completo as destinatario_nome,
              do2.nome_completo as destinatario_origem_nome
       FROM movimentacoes mov
       LEFT JOIN usuarios u ON mov.usuario_id = u.id
       LEFT JOIN destinatarios d ON mov.destinatario_id = d.id
       LEFT JOIN destinatarios do2 ON mov.destinatario_origem_id = do2.id
       WHERE mov.unidade_id = $1
       ORDER BY mov.criado_em DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico.' });
  }
});

// POST /api/unidades
router.post('/', auth, async (req, res) => {
  try {
    const { modelo_id, numero_serie, etiqueta_patrimonial, local, observacoes } = req.body;
    if (!modelo_id) return res.status(400).json({ error: 'Modelo é obrigatório.' });

    // Verificar se o modelo é do tipo patrimônio
    const modelo = await pool.query('SELECT tipo FROM modelos WHERE id = $1', [modelo_id]);
    if (modelo.rows.length === 0) return res.status(404).json({ error: 'Modelo não encontrado.' });
    if (modelo.rows[0].tipo !== 'patrimonio') return res.status(400).json({ error: 'Modelo deve ser do tipo patrimônio.' });

    const result = await pool.query(
      `INSERT INTO unidades (modelo_id, numero_serie, etiqueta_patrimonial, status, local, observacoes)
       VALUES ($1, $2, $3, 'disponivel', $4, $5) RETURNING *`,
      [modelo_id, numero_serie || null, etiqueta_patrimonial || null, local || null, observacoes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar unidade.' });
  }
});

// PUT /api/unidades/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { numero_serie, etiqueta_patrimonial, local, observacoes } = req.body;
    const result = await pool.query(
      `UPDATE unidades SET numero_serie=$1, etiqueta_patrimonial=$2, local=$3, observacoes=$4, atualizado_em=NOW()
       WHERE id=$5 RETURNING *`,
      [numero_serie || null, etiqueta_patrimonial || null, local || null, observacoes || null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Unidade não encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar unidade.' });
  }
});

// DELETE /api/unidades/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    // Verificar se a unidade existe
    const unidade = await pool.query('SELECT * FROM unidades WHERE id = $1', [req.params.id]);
    if (unidade.rows.length === 0) return res.status(404).json({ error: 'Unidade não encontrada.' });

    const u = unidade.rows[0];

    // Bloquear exclusão se estiver em uso ou em manutenção
    if (u.status === 'em_uso') {
      return res.status(409).json({ error: 'Não é possível excluir uma unidade que está em uso. Registre uma devolução primeiro.' });
    }
    if (u.status === 'manutencao') {
      return res.status(409).json({ error: 'Não é possível excluir uma unidade que está em manutenção.' });
    }

    // Verificar se possui movimentações vinculadas
    const movs = await pool.query('SELECT COUNT(*) FROM movimentacoes WHERE unidade_id = $1', [req.params.id]);
    if (parseInt(movs.rows[0].count) > 0) {
      // Tem histórico: apenas marcar como baixado em vez de deletar fisicamente
      await pool.query(
        "UPDATE unidades SET status = 'baixado', destinatario_id = NULL, atualizado_em = NOW() WHERE id = $1",
        [req.params.id]
      );
      return res.json({ message: 'Unidade possui histórico de movimentações e foi marcada como Baixada para preservar o registro de auditoria.', baixado: true });
    }

    // Sem histórico: exclusão física
    await pool.query('DELETE FROM unidades WHERE id = $1', [req.params.id]);
    res.json({ message: 'Unidade excluída com sucesso.', excluido: true });
  } catch (err) {
    console.error('Erro ao excluir unidade:', err);
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Unidade possui registros vinculados e não pode ser excluída.' });
    }
    res.status(500).json({ error: 'Erro ao excluir unidade.' });
  }
});

module.exports = router;
