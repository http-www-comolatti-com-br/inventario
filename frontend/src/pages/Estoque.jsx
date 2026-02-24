import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function Estoque() {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantidade_minima: 0, local_armazenagem: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await api.get('/estoque'); setEstoque(res.data); }
    catch { toast.error('Erro ao carregar estoque.'); }
    finally { setLoading(false); }
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({ quantidade_minima: e.quantidade_minima || 0, local_armazenagem: e.local_armazenagem || '' });
    setModal(true);
  };

  const save = async (ev) => {
    ev.preventDefault();
    try {
      await api.put(`/estoque/${editing.id}`, form);
      toast.success('Estoque atualizado!');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Estoque de Consumíveis</h1>
        <p className="text-gray-500 mt-1">Controle de quantidade de itens consumíveis</p>
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Item</th>
              <th className="text-left p-4">Categoria</th>
              <th className="text-center p-4">Disponível</th>
              <th className="text-center p-4">Mínimo</th>
              <th className="text-left p-4">Local</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {estoque.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Nenhum consumível cadastrado</td></tr>
            ) : estoque.map(e => {
              const alerta = e.quantidade_minima > 0 && e.quantidade_disponivel <= e.quantidade_minima;
              return (
                <tr key={e.id} className={`table-row ${alerta ? 'bg-cyber-red/5' : ''}`}>
                  <td className="p-4">
                    <p className="text-white font-medium">{e.modelo_nome}</p>
                    <p className="text-xs text-gray-500">{e.marca} {e.modelo_modelo}</p>
                  </td>
                  <td className="p-4 text-gray-400">{e.categoria_nome || '—'}</td>
                  <td className="p-4 text-center">
                    <span className={`text-2xl font-bold ${alerta ? 'text-cyber-red' : 'text-cyber-green'}`}>
                      {e.quantidade_disponivel}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-400">{e.quantidade_minima}</td>
                  <td className="p-4 text-gray-400">{e.local_armazenagem || '—'}</td>
                  <td className="p-4 text-center">
                    {alerta ? (
                      <span className="flex items-center justify-center gap-1 text-cyber-red text-xs font-semibold">
                        <HiOutlineExclamationCircle className="w-4 h-4" /> Estoque baixo
                      </span>
                    ) : (
                      <span className="text-cyber-green text-xs font-semibold">OK</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-cyan transition-colors">
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Configurar Estoque" size="sm">
        <form onSubmit={save} className="space-y-4">
          <div className="glass-card p-4 mb-4">
            <p className="text-white font-medium">{editing?.modelo_nome}</p>
            <p className="text-sm text-gray-400">Quantidade atual: <span className="text-cyber-cyan font-bold">{editing?.quantidade_disponivel}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Quantidade Mínima (alerta)</label>
            <input type="number" min="0" value={form.quantidade_minima} onChange={e => setForm({...form, quantidade_minima: parseInt(e.target.value) || 0})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Local de Armazenagem</label>
            <input value={form.local_armazenagem} onChange={e => setForm({...form, local_armazenagem: e.target.value})} className="input-field" placeholder="Ex: Almoxarifado A" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">Salvar</button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
