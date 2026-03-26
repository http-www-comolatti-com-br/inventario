import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import QuickAddModal from '../components/QuickAddModal';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineCube, HiOutlineLightningBolt, HiOutlineArchive, HiOutlineReply } from 'react-icons/hi';

export default function Modelos() {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [quickModal, setQuickModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('true'); // 'true' = ativos, 'false' = inativos, '' = todos
  
  const [form, setForm] = useState({ tipo: 'patrimonio', categoria_id: '', nome: '', marca: '', modelo: '', part_number: '', especificacoes: '', observacoes: '' });

  useEffect(() => { loadCategorias(); }, []);
  useEffect(() => { load(); }, [filtroTipo, filtroBusca, filtroStatus]);

  const load = async () => {
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroBusca) params.busca = filtroBusca;
      if (filtroStatus) params.ativo = filtroStatus === 'true';

      const res = await api.get('/modelos', { params });
      setModelos(res.data);
    } catch { toast.error('Erro ao carregar modelos.'); }
    finally { setLoading(false); }
  };

  const loadCategorias = async () => {
    try { const res = await api.get('/categorias'); setCategorias(res.data); } catch {}
  };

  const openNew = () => {
    setEditing(null);
    setForm({ tipo: 'consumivel', categoria_id: '', nome: '', marca: '', modelo: '', part_number: '', especificacoes: '', observacoes: '' });
    setEditModal(true);
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
      if (editing) {
        await api.put(`/modelos/${editing.id}`, data);
        toast.success('Modelo atualizado!');
      } else {
        await api.post(`/modelos`, data);
        toast.success('Modelo criado com sucesso!');
      }
      setEditModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const toggleAtivo = async (m) => {
    const acao = m.ativo ? 'arquivar' : 'desarquivar';
    if (!confirm(`Deseja ${acao} este modelo? ${m.ativo ? 'Ele não aparecerá mais em novos cadastros.' : ''}`)) return;
    try { 
      await api.put(`/modelos/${m.id}`, { ...m, ativo: !m.ativo }); 
      toast.success(m.ativo ? 'Modelo arquivado com sucesso!' : 'Modelo restaurado e agora aparece nos menus!'); 
      load(); 
    }
    catch (err) { toast.error(err.response?.data?.error || 'Erro ao alterar status do modelo.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Modelos de Itens</h1>
          <p className="text-gray-500 mt-1">Gerencie os modelos de equipamentos e consumíveis</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNew} className="btn-secondary flex items-center gap-2">
            <HiOutlineCube className="w-5 h-5" /> Novo Modelo
          </button>
          <button onClick={() => setQuickModal(true)} className="btn-primary flex items-center gap-2">
            <HiOutlineLightningBolt className="w-5 h-5" /> Ação Rápida
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="select-field w-40">
          <option value="true">Apenas Ativos</option>
          <option value="false">Apenas Arquivados</option>
          <option value="">Exibir Todos</option>
        </select>
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
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Nenhum modelo compatível com os filtros</td></tr>
            ) : modelos.map(m => (
              <tr key={m.id} className={`table-row ${!m.ativo ? 'opacity-40' : ''}`}>
                <td className="p-4 text-white font-medium">
                  <div className="flex items-center gap-2">
                    <HiOutlineCube className={`w-4 h-4 flex-shrink-0 ${m.ativo ? 'text-cyber-cyan' : 'text-gray-600'}`} /> 
                    <span className={!m.ativo ? 'line-through text-gray-500' : ''}>{m.nome}</span>
                    {!m.ativo && <span className="text-[10px] uppercase font-bold tracking-wider bg-dark-600 border border-dark-500 text-gray-400 px-2 py-0.5 rounded ml-2">Arquivado</span>}
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
                  <button onClick={() => toggleAtivo(m)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-yellow transition-colors ml-1" title={m.ativo ? "Arquivar modelo (Ocultar nos cadastros)" : "Desarquivar modelo (Visível novamente)"}>
                    {m.ativo ? <HiOutlineArchive className="w-4 h-4" /> : <HiOutlineReply className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Genérico de CRIAÇÃO / EDIÇÃO */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title={editing ? "Editar Modelo" : "Novo Modelo"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} disabled={!!editing} className={`select-field ${editing ? 'opacity-60 cursor-not-allowed' : ''}`}>
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

      {/* Wizard de Ação Rápida */}
      <QuickAddModal isOpen={quickModal} onClose={() => setQuickModal(false)} onSuccess={load} />
    </div>
  );
}
