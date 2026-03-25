const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'inventario',
  password: process.env.DB_PASSWORD || 'inventario123',
  database: process.env.DB_NAME || 'inventario',
  max: 20, // Aumentado de 10 para 20 conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do banco de dados:', err);
});

module.exports = pool;
