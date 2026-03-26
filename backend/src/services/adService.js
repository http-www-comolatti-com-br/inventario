const ldap = require('ldapjs');
const pool = require('../db');

/**
 * Serviço de Integração com Active Directory
 */
class ADService {
  /**
   * Obtém a configuração do AD do banco de dados
   */
  async getConfig() {
    const result = await pool.query('SELECT * FROM configuracoes_ad ORDER BY id DESC LIMIT 1');
    return result.rows[0];
  }

  /**
   * Testa a conexão com os parâmetros fornecidos
   */
  async testConnection(config) {
    return new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: `ldap://${config.host}:${config.porta}`,
        timeout: 5000,
        connectTimeout: 5000
      });

      client.bind(config.bind_dn, config.senha, (err) => {
        if (err) {
          client.destroy();
          return reject(err);
        }
        client.unbind();
        resolve(true);
      });

      client.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Busca usuários no AD por nome (displayName)
   */
  async searchUsers(query) {
    const config = await this.getConfig();
    if (!config) throw new Error('Configuração do AD não encontrada.');

    return new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url: `ldap://${config.host}:${config.porta}`
      });

      client.bind(config.bind_dn, config.senha, (err) => {
        if (err) {
          client.destroy();
          return reject(err);
        }

        const opts = {
          filter: `(&(objectClass=user)(objectCategory=person)(displayName=*${query}*))`,
          scope: 'sub',
          attributes: ['displayName', 'description', 'physicalDeliveryOfficeName', 'telephoneNumber', 'l', 'sAMAccountName']
        };

        const users = [];

        client.search(config.base_dn, opts, (err, res) => {
          if (err) {
            client.destroy();
            return reject(err);
          }

          res.on('searchEntry', (entry) => {
            const raw = entry.pojo || {};
            const attrs = {};
            if (entry.attributes) {
              entry.attributes.forEach(a => { attrs[a.type] = a.values?.[0] || a.value; });
            }
            const data = { ...raw, ...attrs };
            users.push({
              nome_completo: data.displayName || '',
              setor: data.description || '',
              filial: data.physicalDeliveryOfficeName || '',
              telefone: data.telephoneNumber || '',
              cidade: data.l || '',
              login: data.sAMAccountName || '',
              origem: 'ad'
            });
          });

          res.on('error', (err) => {
            client.destroy();
            reject(err);
          });

          res.on('end', () => {
            client.unbind();
            resolve(users);
          });
        });
      });
    });
  }
}

module.exports = new ADService();
