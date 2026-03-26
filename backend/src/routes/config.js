const express = require('express');
const router = express.Router();
const pool = require('../db');
const adService = require('../services/adService');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/config/ad - Obter configuração (sem senha por segurança)
router.get('/ad', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, host, porta, base_dn, bind_dn, criado_em, atualizado_em FROM configuracoes_ad ORDER BY id DESC LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configuração do AD.' });
  }
});

// POST /api/config/ad - Salvar configuração
router.post('/ad', auth, adminOnly, async (req, res) => {
  const { host, porta, base_dn, bind_dn, senha } = req.body;
  
  if (!host || !base_dn || !bind_dn || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO configuracoes_ad (host, porta, base_dn, bind_dn, senha)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET 
         host = EXCLUDED.host, 
         porta = EXCLUDED.porta, 
         base_dn = EXCLUDED.base_dn, 
         bind_dn = EXCLUDED.bind_dn, 
         senha = EXCLUDED.senha,
         atualizado_em = NOW()
       RETURNING id, host, porta, base_dn, bind_dn`,
      [host, porta || 389, base_dn, bind_dn, senha]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar configuração do AD.' });
  }
});

// POST /api/config/ad/test - Testar conexão
router.post('/ad/test', auth, adminOnly, async (req, res) => {
  const { host, porta, base_dn, bind_dn, senha } = req.body;
  try {
    await adService.testConnection({ host, porta: porta || 389, base_dn, bind_dn, senha });
    res.json({ success: true, message: 'Conexão estabelecida com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: `Falha na conexão: ${err.message}` });
  }
});

module.exports = router;
