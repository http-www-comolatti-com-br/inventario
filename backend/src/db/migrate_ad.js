const pool = require('./index');

async function migrate() {
  console.log('--- Iniciando Migração AD ---');
  try {
    // 1. Criar tabela de configuração do AD
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracoes_ad (
        id SERIAL PRIMARY KEY,
        host TEXT NOT NULL,
        porta INTEGER DEFAULT 389,
        base_dn TEXT NOT NULL,
        bind_dn TEXT NOT NULL,
        senha TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW(),
        atualizado_em TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela configuracoes_ad criada/verificada');

    // 2. Adicionar colunas extras em destinatarios
    const columns = [
      { name: 'telefone', type: 'TEXT' },
      { name: 'cidade', type: 'TEXT' },
      { name: 'origem', type: 'TEXT DEFAULT \'local\'' }
    ];

    for (const col of columns) {
      try {
        await pool.query(`ALTER TABLE destinatarios ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Coluna ${col.name} adicionada`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`ℹ️  Coluna ${col.name} já existe`);
        } else {
          throw err;
        }
      }
    }

    console.log('--- Migração AD concluída com sucesso ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
