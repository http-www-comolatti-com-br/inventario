const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/movimentacoes
router.get('/', auth, async (req, res) => {
  try {
    const { tipo, modelo_id, unidade_id, destinatario_id, data_inicio, data_fim } = req.query;
    let query = `SELECT mov.*, 
                        usr.nome_completo as usuario_nome,
                        m.nome as modelo_nome, m.marca, m.tipo as modelo_tipo,
                        d.nome_completo as destinatario_nome,
                        do2.nome_completo as destinatario_origem_nome,
                        un.numero_serie, un.etiqueta_patrimonial
                 FROM movimentacoes mov
                 LEFT JOIN usuarios usr ON mov.usuario_id = usr.id
                 LEFT JOIN modelos m ON mov.modelo_id = m.id
                 LEFT JOIN destinatarios d ON mov.destinatario_id = d.id
                 LEFT JOIN destinatarios do2 ON mov.destinatario_origem_id = do2.id
                 LEFT JOIN unidades un ON mov.unidade_id = un.id
                 WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (tipo) { query += ` AND mov.tipo = $${idx++}`; params.push(tipo); }
    if (modelo_id) { query += ` AND mov.modelo_id = $${idx++}`; params.push(modelo_id); }
    if (unidade_id) { query += ` AND mov.unidade_id = $${idx++}`; params.push(unidade_id); }
    if (destinatario_id) { query += ` AND (mov.destinatario_id = $${idx} OR mov.destinatario_origem_id = $${idx})`; params.push(destinatario_id); idx++; }
    if (data_inicio) { query += ` AND mov.criado_em >= $${idx++}`; params.push(data_inicio); }
    if (data_fim) { query += ` AND mov.criado_em <= $${idx++}`; params.push(data_fim); }
    query += ' ORDER BY mov.criado_em DESC LIMIT 500';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar movimentações:', err);
    res.status(500).json({ error: 'Erro ao buscar movimentações.' });
  }
});

// POST /api/movimentacoes/entrada
router.post('/entrada', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { modelo_id, unidade_id, quantidade, observacao } = req.body;

    // Verificar modelo
    const modelo = await client.query('SELECT * FROM modelos WHERE id = $1', [modelo_id]);
    if (modelo.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Modelo não encontrado.' }); }

    if (modelo.rows[0].tipo === 'consumivel') {
      if (!quantidade || quantidade <= 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Quantidade deve ser maior que zero.' }); }
      await client.query(
        'UPDATE estoque SET quantidade_disponivel = quantidade_disponivel + $1, atualizado_em = NOW() WHERE modelo_id = $2',
        [quantidade, modelo_id]
      );
    } else {
      // Patrimônio: marcar unidade como disponível
      if (!unidade_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade é obrigatória para patrimônio.' }); }
      await client.query(
        "UPDATE unidades SET status = 'disponivel', destinatario_id = NULL, atualizado_em = NOW() WHERE id = $1",
        [unidade_id]
      );
    }

    const estoque = modelo.rows[0].tipo === 'consumivel'
      ? await client.query('SELECT id FROM estoque WHERE modelo_id = $1', [modelo_id])
      : { rows: [{ id: null }] };

    const mov = await client.query(
      `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, estoque_id, quantidade, usuario_id, observacao)
       VALUES ('entrada', $1, $2, $3, $4, $5, $6) RETURNING *`,
      [modelo_id, unidade_id || null, estoque.rows[0]?.id || null, quantidade || null, req.user.id, observacao || null]
    );

    await client.query('COMMIT');
    res.status(201).json(mov.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na entrada:', err);
    res.status(500).json({ error: 'Erro ao registrar entrada.' });
  } finally {
    client.release();
  }
});

// POST /api/movimentacoes/entrada-massa
router.post('/entrada-massa', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { modelo_id, tipo, seriais, quantidade, observacao } = req.body;

    if (!modelo_id) return res.status(400).json({ error: 'Modelo é obrigatório.' });

    await client.query('BEGIN');

    // Verificar modelo
    const modeloRes = await client.query('SELECT * FROM modelos WHERE id = $1', [modelo_id]);
    if (modeloRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Modelo não encontrado.' });
    }
    const modelo = modeloRes.rows[0];

    const movimentacoesCriadas = [];

    if (modelo.tipo === 'consumivel') {
      if (!quantidade || quantidade <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Quantidade é obrigatória para consumíveis.' });
      }

      // Atualizar estoque
      await client.query(
        'UPDATE estoque SET quantidade_disponivel = quantidade_disponivel + $1, atualizado_em = NOW() WHERE modelo_id = $2',
        [quantidade, modelo_id]
      );

      const estoqueRes = await client.query('SELECT id FROM estoque WHERE modelo_id = $1', [modelo_id]);
      
      const mov = await client.query(
        `INSERT INTO movimentacoes (tipo, modelo_id, estoque_id, quantidade, usuario_id, observacao)
         VALUES ('entrada', $1, $2, $3, $4, $5) RETURNING *`,
        [modelo_id, estoqueRes.rows[0]?.id || null, quantidade, req.user.id, observacao || 'Entrada em massa']
      );
      movimentacoesCriadas.push(mov.rows[0]);

    } else {
      // Patrimônio
      if (!seriais || !Array.isArray(seriais) || seriais.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Lista de seriais é obrigatória para patrimônio.' });
      }

      for (const serial of seriais) {
        const serialTrim = serial.trim();
        if (!serialTrim) continue;

        // Criar unidade
        const unidadeRes = await client.query(
          `INSERT INTO unidades (modelo_id, numero_serie, status, criado_em, atualizado_em)
           VALUES ($1, $2, 'disponivel', NOW(), NOW()) RETURNING id`,
          [modelo_id, serialTrim]
        );
        const unidadeId = unidadeRes.rows[0].id;

        // Registrar movimentação
        const mov = await client.query(
          `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, usuario_id, observacao, criado_em)
           VALUES ('entrada', $1, $2, $3, $4, NOW()) RETURNING *`,
          [modelo_id, unidadeId, req.user.id, observacao || 'Entrada em massa (Patrimônio)']
        );
        movimentacoesCriadas.push(mov.rows[0]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Entrada em massa realizada com sucesso', itens: movimentacoesCriadas });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na entrada em massa:', err);
    res.status(500).json({ error: 'Erro ao processar entrada em massa.' });
  } finally {
    client.release();
  }
});

// POST /api/movimentacoes/entrega
router.post('/entrega', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { modelo_id, unidade_id, quantidade, destinatario_id, observacao } = req.body;

    if (!destinatario_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Destinatário é obrigatório.' }); }

    const modelo = await client.query('SELECT * FROM modelos WHERE id = $1', [modelo_id]);
    if (modelo.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Modelo não encontrado.' }); }

    if (modelo.rows[0].tipo === 'consumivel') {
      if (!quantidade || quantidade <= 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Quantidade deve ser maior que zero.' }); }
      const est = await client.query('SELECT * FROM estoque WHERE modelo_id = $1', [modelo_id]);
      if (est.rows.length === 0 || est.rows[0].quantidade_disponivel < quantidade) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Saldo insuficiente em estoque.' });
      }
      await client.query(
        'UPDATE estoque SET quantidade_disponivel = quantidade_disponivel - $1, atualizado_em = NOW() WHERE modelo_id = $2',
        [quantidade, modelo_id]
      );
    } else {
      if (!unidade_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade é obrigatória para patrimônio.' }); }
      const un = await client.query('SELECT * FROM unidades WHERE id = $1', [unidade_id]);
      if (un.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Unidade não encontrada.' }); }
      if (un.rows[0].status !== 'disponivel') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade não está disponível para entrega.' }); }
      await client.query(
        "UPDATE unidades SET status = 'em_uso', destinatario_id = $1, atualizado_em = NOW() WHERE id = $2",
        [destinatario_id, unidade_id]
      );
    }

    const estoque = modelo.rows[0].tipo === 'consumivel'
      ? await client.query('SELECT id FROM estoque WHERE modelo_id = $1', [modelo_id])
      : { rows: [{ id: null }] };

    const mov = await client.query(
      `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, estoque_id, quantidade, destinatario_id, usuario_id, observacao)
       VALUES ('entrega', $1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [modelo_id, unidade_id || null, estoque.rows[0]?.id || null, quantidade || null, destinatario_id, req.user.id, observacao || null]
    );

    await client.query('COMMIT');
    res.status(201).json(mov.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na entrega:', err);
    res.status(500).json({ error: 'Erro ao registrar entrega.' });
  } finally {
    client.release();
  }
});

// POST /api/movimentacoes/devolucao
router.post('/devolucao', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { modelo_id, unidade_id, quantidade, observacao } = req.body;

    const modelo = await client.query('SELECT * FROM modelos WHERE id = $1', [modelo_id]);
    if (modelo.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Modelo não encontrado.' }); }

    if (modelo.rows[0].tipo === 'consumivel') {
      if (!quantidade || quantidade <= 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Quantidade deve ser maior que zero.' }); }
      await client.query(
        'UPDATE estoque SET quantidade_disponivel = quantidade_disponivel + $1, atualizado_em = NOW() WHERE modelo_id = $2',
        [quantidade, modelo_id]
      );
    } else {
      if (!unidade_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade é obrigatória para patrimônio.' }); }
      const un = await client.query('SELECT * FROM unidades WHERE id = $1', [unidade_id]);
      if (un.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Unidade não encontrada.' }); }
      if (un.rows[0].status !== 'em_uso') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade não está em uso para devolução.' }); }
      await client.query(
        "UPDATE unidades SET status = 'disponivel', destinatario_id = NULL, atualizado_em = NOW() WHERE id = $1",
        [unidade_id]
      );
    }

    const estoque = modelo.rows[0].tipo === 'consumivel'
      ? await client.query('SELECT id FROM estoque WHERE modelo_id = $1', [modelo_id])
      : { rows: [{ id: null }] };

    const mov = await client.query(
      `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, estoque_id, quantidade, usuario_id, observacao)
       VALUES ('devolucao', $1, $2, $3, $4, $5, $6) RETURNING *`,
      [modelo_id, unidade_id || null, estoque.rows[0]?.id || null, quantidade || null, req.user.id, observacao || null]
    );

    await client.query('COMMIT');
    res.status(201).json(mov.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na devolução:', err);
    res.status(500).json({ error: 'Erro ao registrar devolução.' });
  } finally {
    client.release();
  }
});

// POST /api/movimentacoes/transferencia
router.post('/transferencia', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { modelo_id, unidade_id, destinatario_id, observacao } = req.body;

    if (!destinatario_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Novo destinatário é obrigatório.' }); }
    if (!unidade_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade é obrigatória para transferência.' }); }

    const un = await client.query('SELECT * FROM unidades WHERE id = $1', [unidade_id]);
    if (un.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Unidade não encontrada.' }); }
    if (un.rows[0].status !== 'em_uso') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade precisa estar em uso para transferência.' }); }

    const destinatario_origem_id = un.rows[0].destinatario_id;

    await client.query(
      "UPDATE unidades SET destinatario_id = $1, atualizado_em = NOW() WHERE id = $2",
      [destinatario_id, unidade_id]
    );

    const mov = await client.query(
      `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, destinatario_id, destinatario_origem_id, usuario_id, observacao)
       VALUES ('transferencia', $1, $2, $3, $4, $5, $6) RETURNING *`,
      [modelo_id, unidade_id, destinatario_id, destinatario_origem_id, req.user.id, observacao || null]
    );

    await client.query('COMMIT');
    res.status(201).json(mov.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na transferência:', err);
    res.status(500).json({ error: 'Erro ao registrar transferência.' });
  } finally {
    client.release();
  }
});

// POST /api/movimentacoes/manutencao
router.post('/manutencao', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { modelo_id, unidade_id, observacao } = req.body;

    if (!unidade_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade é obrigatória.' }); }

    const un = await client.query('SELECT * FROM unidades WHERE id = $1', [unidade_id]);
    if (un.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Unidade não encontrada.' }); }
    if (un.rows[0].status === 'baixado') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade baixada não pode ir para manutenção.' }); }

    const destinatario_anterior = un.rows[0].destinatario_id;

    await client.query(
      "UPDATE unidades SET status = 'manutencao', destinatario_id = NULL, atualizado_em = NOW() WHERE id = $1",
      [unidade_id]
    );

    const mov = await client.query(
      `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, destinatario_origem_id, usuario_id, observacao)
       VALUES ('manutencao', $1, $2, $3, $4, $5) RETURNING *`,
      [modelo_id, unidade_id, destinatario_anterior, req.user.id, observacao || null]
    );

    await client.query('COMMIT');
    res.status(201).json(mov.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na manutenção:', err);
    res.status(500).json({ error: 'Erro ao registrar manutenção.' });
  } finally {
    client.release();
  }
});

// POST /api/movimentacoes/baixa
router.post('/baixa', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { modelo_id, unidade_id, observacao } = req.body;

    if (!unidade_id) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade é obrigatória.' }); }

    const un = await client.query('SELECT * FROM unidades WHERE id = $1', [unidade_id]);
    if (un.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Unidade não encontrada.' }); }
    if (un.rows[0].status === 'baixado') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Unidade já está baixada.' }); }

    await client.query(
      "UPDATE unidades SET status = 'baixado', destinatario_id = NULL, atualizado_em = NOW() WHERE id = $1",
      [unidade_id]
    );

    const mov = await client.query(
      `INSERT INTO movimentacoes (tipo, modelo_id, unidade_id, usuario_id, observacao)
       VALUES ('baixa', $1, $2, $3, $4) RETURNING *`,
      [modelo_id, unidade_id, req.user.id, observacao || null]
    );

    await client.query('COMMIT');
    res.status(201).json(mov.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro na baixa:', err);
    res.status(500).json({ error: 'Erro ao registrar baixa.' });
  } finally {
    client.release();
  }
});

// PUT /api/movimentacoes/:id/cancelar
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const { motivo } = req.body;
    if (!motivo) return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório.' });
    const result = await pool.query(
      'UPDATE movimentacoes SET cancelado = TRUE, motivo_cancelamento = $1 WHERE id = $2 AND cancelado = FALSE RETURNING *',
      [motivo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Movimentação não encontrada ou já cancelada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cancelar movimentação.' });
  }
});

module.exports = router;
