import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup, HiOutlineEye, HiOutlineSearch } from 'react-icons/hi';

export default function Destinatarios() {
  const [destinatarios, setDestinatarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [itensModal, setItensModal] = useState(false);
  const [itensDestinatario, setItensDestinatario] = useState([]);
  const [selectedDest, setSelectedDest] = useState(null);
  const [adSearch, setAdSearch] = useState('');
  const [adResults, setAdResults] = useState([]);
  const [adLoading, setAdLoading] = useState(false);
  const [form, setForm] = useState({ nome_completo: '', setor: '', filial: '', ativo: true, observacoes: '', telefone: '', cidade: '', origem: 'local' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await api.get('/destinatarios'); setDestinatarios(res.data); }
    catch { toast.error('Erro ao carregar destinatários.'); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditing(null); setForm({ nome_completo: '', setor: '', filial: '', ativo: true, observacoes: '', telefone: '', cidade: '', origem: 'local' }); setAdSearch(''); setAdResults([]); setModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ nome_completo: d.nome_completo, setor: d.setor || '', filial: d.filial || '', ativo: d.ativo, observacoes: d.observacoes || '', telefone: d.telefone || '', cidade: d.cidade || '', origem: d.origem || 'local' }); setModal(true); };

  const verItens = async (d) => {
    setSelectedDest(d);
    try {
      const res = await api.get(`/destinatarios/${d.id}/itens`);
      setItensDestinatario(res.data);
      setItensModal(true);
    } catch { toast.error('Erro ao carregar itens.'); }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.nome_completo) return toast.error('Nome é obrigatório.');
    try {
      if (editing) { await api.put(`/destinatarios/${editing.id}`, form); toast.success('Destinatário atualizado!'); }
      else { await api.post('/destinatarios', form); toast.success('Destinatário criado!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const remove = async (id) => {
    if (!confirm('Deseja excluir este destinatário?')) return;
    try { await api.delete(`/destinatarios/${id}`); toast.success('Destinatário excluído!'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erro ao excluir.'); }
  };

  const handleADSearch = async () => {
    if (!adSearch) return;
    setAdLoading(true);
    try {
      const res = await api.get(`/destinatarios/search-ad?q=${adSearch}`);
      setAdResults(res.data);
      if (res.data.length === 0) toast.error('Nenhum usuário encontrado no AD.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro na busca AD.');
    } finally {
      setAdLoading(false);
    }
  };

  const selectADUser = (u) => {
    setForm({
      ...form,
      nome_completo: u.nome_completo,
      setor: u.setor,
      filial: u.filial,
      telefone: u.telefone,
      cidade: u.cidade,
      origem: 'ad'
    });
    setAdResults([]);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Destinatários</h1>
          <p className="text-gray-500 mt-1">Pessoas que recebem equipamentos de TI</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" /> Novo Destinatário</button>
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Setor</th>
              <th className="text-left p-4">Filial</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {destinatarios.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhum destinatário cadastrado</td></tr>
            ) : destinatarios.map(d => (
              <tr key={d.id} className="table-row">
                <td className="p-4 text-white font-medium flex items-center gap-2"><HiOutlineUserGroup className="w-4 h-4 text-cyber-cyan" /> {d.nome_completo}</td>
                <td className="p-4 text-gray-400">{d.setor || '—'}</td>
                <td className="p-4 text-gray-400">{d.filial || '—'}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${d.ativo ? 'bg-cyber-green/20 text-cyber-green' : 'bg-gray-600/20 text-gray-500'}`}>
                    {d.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => verItens(d)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-purple transition-colors" title="Ver itens"><HiOutlineEye className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-cyan transition-colors" title="Editar"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(d.id)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-red transition-colors" title="Excluir"><HiOutlineTrash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Destinatário' : 'Novo Destinatário'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna de Busca AD (apenas novo) */}
          {!editing && (
            <div className="md:col-span-1 border-r border-dark-600 pr-6 space-y-4">
              <h3 className="text-sm font-semibold text-cyber-cyan flex items-center gap-2">
                <HiOutlineSearch /> Importar do AD
              </h3>
              <div className="flex gap-2">
                <input 
                  value={adSearch} 
                  onChange={e => setAdSearch(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleADSearch()}
                  className="input-field text-xs" 
                  placeholder="Nome no AD..." 
                />
                <button type="button" onClick={handleADSearch} className="p-2 btn-secondary"><HiOutlineSearch /></button>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {adLoading ? (
                  <p className="text-xs text-gray-500 animate-pulse">Buscando...</p>
                ) : adResults.map((u, i) => (
                  <button key={i} type="button" onClick={() => selectADUser(u)} 
                    className="w-full text-left p-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-dark-500 transition-colors group">
                    <p className="text-xs font-medium text-white group-hover:text-cyber-cyan">{u.nome_completo}</p>
                    <p className="text-[10px] text-gray-400">{u.setor}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulário Principal */}
          <form onSubmit={save} className={`${editing ? 'md:col-span-3' : 'md:col-span-2'} space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo *</label>
                <input 
                  value={form.nome_completo} 
                  disabled={form.origem === 'ad'}
                  onChange={e => setForm({...form, nome_completo: e.target.value})} 
                  className={`input-field ${form.origem === 'ad' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder="Nome completo" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Setor</label>
                <input 
                  value={form.setor} 
                  disabled={form.origem === 'ad'}
                  onChange={e => setForm({...form, setor: e.target.value})} 
                  className={`input-field ${form.origem === 'ad' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder="Ex: TI" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Filial</label>
                <input 
                  value={form.filial} 
                  disabled={form.origem === 'ad'}
                  onChange={e => setForm({...form, filial: e.target.value})} 
                  className={`input-field ${form.origem === 'ad' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder="Ex: Matriz" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                <input 
                  value={form.telefone} 
                  disabled={form.origem === 'ad'}
                  onChange={e => setForm({...form, telefone: e.target.value})} 
                  className={`input-field ${form.origem === 'ad' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder="(00) 00000-0000" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cidade</label>
                <input 
                  value={form.cidade} 
                  disabled={form.origem === 'ad'}
                  onChange={e => setForm({...form, cidade: e.target.value})} 
                  className={`input-field ${form.origem === 'ad' ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  placeholder="Cidade" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-400">Ativo</label>
              <button type="button" onClick={() => setForm({...form, ativo: !form.ativo})}
                className={`w-12 h-6 rounded-full transition-colors ${form.ativo ? 'bg-cyber-green' : 'bg-dark-500'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.ativo ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              {form.origem === 'ad' && <span className="text-[10px] bg-cyber-blue/20 text-cyber-blue px-2 py-0.5 rounded-md border border-cyber-blue/30">Sincronizado com AD</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Observações</label>
              <textarea value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} className="input-field h-20" />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary flex-1">Salvar</button>
              <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Itens em posse */}
      <Modal isOpen={itensModal} onClose={() => setItensModal(false)} title={`Itens de ${selectedDest?.nome_completo || ''}`} size="lg">
        {itensDestinatario.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum item em posse deste destinatário</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Nº Série</th>
                  <th className="text-left p-3">Etiqueta</th>
                  <th className="text-left p-3">Local</th>
                </tr>
              </thead>
              <tbody>
                {itensDestinatario.map(i => (
                  <tr key={i.id} className="table-row">
                    <td className="p-3 text-white">{i.modelo_nome}</td>
                    <td className="p-3 text-gray-400 font-mono text-xs">{i.numero_serie || '—'}</td>
                    <td className="p-3 text-gray-400 font-mono text-xs">{i.etiqueta_patrimonial || '—'}</td>
                    <td className="p-3 text-gray-400">{i.local || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
