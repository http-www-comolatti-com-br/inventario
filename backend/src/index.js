require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDatabase = require('./db/init');

const app = express();
const PORT = process.env.PORT || 8201;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/destinatarios', require('./routes/destinatarios'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/modelos', require('./routes/modelos'));
app.use('/api/estoque', require('./routes/estoque'));
app.use('/api/unidades', require('./routes/unidades'));
app.use('/api/movimentacoes', require('./routes/movimentacoes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicializar banco e subir servidor
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar o servidor:', err);
    // Tentar novamente em 5 segundos (aguardar banco ficar pronto)
    console.log('⏳ Tentando novamente em 5 segundos...');
    setTimeout(start, 5000);
  }
}

start();
