import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineServer, HiOutlineShieldCheck, HiOutlineStatusOnline } from 'react-icons/hi';

export default function ConfiguracoesAD() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [form, setForm] = useState({
    host: '',
    porta: 389,
    base_dn: '',
    bind_dn: '',
    senha: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/config/ad');
      if (res.data) {
        setForm({ ...res.data, senha: '' });
      }
    } catch {
      toast.error('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/config/ad', form);
      toast.success('Configurações salvas com sucesso!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleTest = async () => {
    if (!form.host || !form.base_dn || !form.bind_dn || !form.senha) {
      return toast.error('Preencha todos os campos para testar.');
    }
    setTesting(true);
    try {
      const res = await api.post('/config/ad/test', form);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Falha na conexão.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <HiOutlineServer className="text-cyber-cyan" /> Configurações do Active Directory
        </h1>
        <p className="text-gray-500 mt-1">Configure a conexão para importar dados de usuários automaticamente.</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Host / IP do Servidor AD</label>
              <input 
                value={form.host} 
                onChange={e => setForm({...form, host: e.target.value})} 
                className="input-field" 
                placeholder="Ex: 192.168.1.10 ou ad.empresa.local"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Porta</label>
              <input 
                type="number" 
                value={form.porta} 
                onChange={e => setForm({...form, porta: parseInt(e.target.value)})} 
                className="input-field" 
                placeholder="Padrão: 389"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Base DN (Onde buscar os usuários)</label>
            <input 
              value={form.base_dn} 
              onChange={e => setForm({...form, base_dn: e.target.value})} 
              className="input-field" 
              placeholder="Ex: dc=empresa,dc=local"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Bind DN (Usuário de serviço)</label>
              <input 
                value={form.bind_dn} 
                onChange={e => setForm({...form, bind_dn: e.target.value})} 
                className="input-field" 
                placeholder="Ex: usuario@empresa.local ou cn=Admin..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Senha</label>
              <input 
                type="password" 
                value={form.senha} 
                onChange={e => setForm({...form, senha: e.target.value})} 
                className="input-field" 
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 border-t border-dark-600">
            <button 
              type="submit" 
              className="btn-primary px-8 flex items-center gap-2"
            >
              <HiOutlineShieldCheck className="w-5 h-5" /> Salvar Configurações
            </button>
            <button 
              type="button" 
              onClick={handleTest}
              disabled={testing}
              className="btn-secondary px-8 flex items-center gap-2 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10"
            >
              <HiOutlineStatusOnline className={`w-5 h-5 ${testing ? 'animate-pulse' : ''}`} /> 
              {testing ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl">
        <h3 className="text-blue-400 font-semibold flex items-center gap-2 mb-2">
          💡 Dica de Mapeamento
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          O sistema buscará automaticamente os seguintes atributos:
          <br /><br />
          • <strong>DisplayName:</strong> Nome do Destinatário
          <br />• <strong>Description:</strong> Setor do Destinatário
          <br />• <strong>Office:</strong> Filial do Destinatário
          <br />• <strong>TelephoneNumber:</strong> Telefone
          <br />• <strong>L (City):</strong> Cidade
        </p>
      </div>
    </div>
  );
}
