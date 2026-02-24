const fs = require('fs');
const path = require('path');
const pool = require('./index');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✅ Banco de dados inicializado com sucesso');

    // Verificar se admin existe, se não, criar com hash correto
    const res = await client.query("SELECT id FROM usuarios WHERE login = 'admin'");
    if (res.rows.length === 0) {
      const hash = await bcrypt.hash('comolatti', 10);
      await client.query(
        "INSERT INTO usuarios (nome_completo, login, senha, perfil, ativo) VALUES ($1, $2, $3, $4, $5)",
        ['Administrador', 'admin', hash, 'admin', true]
      );
      console.log('✅ Usuário admin criado com sucesso');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }
  } catch (err) {
    console.error('❌ Erro ao inicializar banco de dados:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = initDatabase;
