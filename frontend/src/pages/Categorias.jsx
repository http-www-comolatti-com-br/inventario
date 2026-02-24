import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTag } from 'react-icons/hi';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', subcategoria: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch { toast.error('Erro ao carregar categorias.'); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditing(null); setForm({ nome: '', subcategoria: '' }); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ nome: c.nome, subcategoria: c.subcategoria || '' }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.nome) return toast.error('Nome é obrigatório.');
    try {
      if (editing) {
        await api.put(`/categorias/${editing.id}`, form);
        toast.success('Categoria atualizada!');
      } else {
        await api.post('/categorias', form);
        toast.success('Categoria criada!');
      }
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const remove = async (id) => {
    if (!confirm('Deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoria excluída!');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao excluir.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="text-gray-500 mt-1">Gerencie as categorias de itens de TI</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Nova Categoria
        </button>
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Subcategoria</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-gray-500">Nenhuma categoria cadastrada</td></tr>
            ) : categorias.map(c => (
              <tr key={c.id} className="table-row">
                <td className="p-4 text-white font-medium flex items-center gap-2">
                  <HiOutlineTag className="w-4 h-4 text-cyber-cyan" /> {c.nome}
                </td>
                <td className="p-4 text-gray-400">{c.subcategoria || '—'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-cyan transition-colors">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(c.id)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-red transition-colors ml-1">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria'} size="sm">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome *</label>
            <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="input-field" placeholder="Ex: Periféricos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Subcategoria</label>
            <input value={form.subcategoria} onChange={e => setForm({...form, subcategoria: e.target.value})} className="input-field" placeholder="Ex: Mouse" />
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
