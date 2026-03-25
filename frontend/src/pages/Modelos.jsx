import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import QuickAddModal from '../components/QuickAddModal';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineCube, HiOutlineLightningBolt } from 'react-icons/hi';

export default function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [quickModal, setQuickModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [form, setForm] = useState({ tipo: 'patrimonio', categoria_id: '', nome: '', marca: '', modelo: '', part_number: '', especificacoes: '', observacoes: '' });

  useEffect(() => { load(); loadCategorias(); }, []);
  useEffect(() => { load(); }, [filtroTipo, filtroBusca]);

  const load = async () => {
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroBusca) params.busca = filtroBusca;
      const res = await api.get('/modelos', { params });
      setModelos(res.data);
    } catch { toast.error('Erro ao carregar modelos.'); }
    finally { setLoading(false); }
  };

  const loadCategorias = async () => {
    try { const res = await api.get('/categorias'); setCategorias(res.data); } catch {}
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ tipo: m.tipo, categoria_id: m.categoria_id || '', nome: m.nome, marca: m.marca || '', modelo: m.modelo || '', part_number: m.part_number || '', especificacoes: m.especificacoes || '', observacoes: m.observacoes || '' });
    setEditModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.tipo) return toast.error('Tipo e nome são obrigatórios.');
    try {
      const data = { ...form, categoria_id: form.categoria_id || null };
      await api.put(`/modelos/${editing.id}`, data);
      toast.success('Modelo atualizado!');
      setEditModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const remove = async (id) => {
    if (!confirm('Deseja excluir este modelo?')) return;
    try { await api.delete(`/modelos/${id}`); toast.success('Modelo excluído!'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erro ao excluir.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Modelos de Itens</h1>
          <p className="text-gray-500 mt-1">Gerencie os modelos de equipamentos e consumíveis</p>
        </div>
        <button onClick={() => setQuickModal(true)} className="btn-primary flex items-center gap-2">
          <HiOutlineLightningBolt className="w-5 h-5" /> Entrada Rápida
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="select-field w-48">
          <option value="">Todos os tipos</option>
          <option value="patrimonio">Patrimônio</option>
          <option value="consumivel">Consumível</option>
        </select>
        <input value={filtroBusca} onChange={e => setFiltroBusca(e.target.value)} className="input-field w-64" placeholder="Buscar por nome, marca ou modelo..." />
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Tipo</th>
              <th className="text-left p-4">Categoria</th>
              <th className="text-left p-4">Marca</th>
              <th className="text-left p-4">Modelo</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {modelos.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhum modelo cadastrado</td></tr>
            ) : modelos.map(m => (
              <tr key={m.id} className="table-row">
                <td className="p-4 text-white font-medium">
                  <div className="flex items-center gap-2">
                    <HiOutlineCube className="w-4 h-4 text-cyber-cyan flex-shrink-0" /> {m.nome}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${m.tipo === 'patrimonio' ? 'bg-cyber-blue/20 text-cyber-blue' : 'bg-cyber-purple/20 text-cyber-purple'}`}>
                    {m.tipo === 'patrimonio' ? 'Patrimônio' : 'Consumível'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{m.categoria_nome ? `${m.categoria_nome}${m.subcategoria ? ` / ${m.subcategoria}` : ''}` : '—'}</td>
                <td className="p-4 text-gray-300">{m.marca || '—'}</td>
                <td className="p-4 text-gray-300">{m.modelo || '—'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-cyan transition-colors" title="Editar modelo"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(m.id)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-red transition-colors ml-1" title="Excluir modelo"><HiOutlineTrash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de EDIÇÃO (mantido para editar modelos existentes) */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Editar Modelo">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
              <select value={form.tipo} disabled className="select-field opacity-60 cursor-not-allowed">
                <option value="patrimonio">Patrimônio</option>
                <option value="consumivel">Consumível</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
              <select value={form.categoria_id} onChange={e => setForm({...form, categoria_id: e.target.value})} className="select-field">
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}{c.subcategoria ? ` / ${c.subcategoria}` : ''}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Item *</label>
            <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="input-field" placeholder="Ex: Notebook Dell Latitude 5520" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Marca</label>
              <input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} className="input-field" placeholder="Ex: Dell" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Modelo</label>
              <input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} className="input-field" placeholder="Ex: Latitude 5520" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Part Number</label>
            <input value={form.part_number} onChange={e => setForm({...form, part_number: e.target.value})} className="input-field" placeholder="Opcional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Especificações</label>
            <textarea value={form.especificacoes} onChange={e => setForm({...form, especificacoes: e.target.value})} className="input-field h-20" placeholder="Ex: i5-1145G7, 16GB RAM, 256GB SSD" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} className="input-field h-16" placeholder="Observações adicionais" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Salvar Alterações</button>
            <button type="button" onClick={() => setEditModal(false)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Wizard de Entrada Rápida */}
      <QuickAddModal isOpen={quickModal} onClose={() => setQuickModal(false)} onSuccess={load} />
    </div>
  );
}
