const adService = require('./src/services/adService');

async function testInternal() {
  console.log('--- Iniciando Teste Interno de AD ---');
  try {
    const config = await adService.getConfig();
    console.log('Configuração encontrada:', { ...config, senha: '***' });
    
    if (!config) {
        console.error('❌ Nenhuma configuração de AD no banco!');
        return;
    }

    console.log('Testando busca por "ismael"...');
    const users = await adService.searchUsers('ismael');
    console.log('Usuários encontrados:', users.length);
    console.log(JSON.stringify(users, null, 2));
    
  } catch (err) {
    console.error('❌ ERRO DETALHADO:', err);
  }
}

testInternal();
