import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome_completo: '', login: '', senha: '', perfil: 'comum', ativo: true, setor: '', filial: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await api.get('/usuarios'); setUsuarios(res.data); }
    catch { toast.error('Erro ao carregar usuários.'); }
    finally { setLoading(false); }
  };

  const openNew = () => { setEditing(null); setForm({ nome_completo: '', login: '', senha: '', perfil: 'comum', ativo: true, setor: '', filial: '' }); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ nome_completo: u.nome_completo, login: u.login, senha: '', perfil: u.perfil, ativo: u.ativo, setor: u.setor || '', filial: u.filial || '' }); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.nome_completo || !form.login || (!editing && !form.senha)) return toast.error('Preencha os campos obrigatórios.');
    try {
      const data = { ...form };
      if (editing && !data.senha) delete data.senha;
      if (editing) { await api.put(`/usuarios/${editing.id}`, data); toast.success('Usuário atualizado!'); }
      else { await api.post('/usuarios', data); toast.success('Usuário criado!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const remove = async (id) => {
    if (!confirm('Deseja excluir este usuário?')) return;
    try { await api.delete(`/usuarios/${id}`); toast.success('Usuário excluído!'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erro ao excluir.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Usuários do Sistema</h1>
          <p className="text-gray-500 mt-1">Gerencie os usuários com acesso ao sistema</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" /> Novo Usuário</button>
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Login</th>
              <th className="text-left p-4">Perfil</th>
              <th className="text-left p-4">Setor</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="table-row">
                <td className="p-4 text-white font-medium flex items-center gap-2"><HiOutlineUsers className="w-4 h-4 text-cyber-cyan" /> {u.nome_completo}</td>
                <td className="p-4 text-gray-300 font-mono">{u.login}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.perfil === 'admin' ? 'bg-cyber-purple/20 text-cyber-purple' : 'bg-cyber-blue/20 text-cyber-blue'}`}>
                    {u.perfil === 'admin' ? 'Administrador' : 'Comum'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{u.setor || '—'}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.ativo ? 'bg-cyber-green/20 text-cyber-green' : 'bg-gray-600/20 text-gray-500'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-cyan transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                  {u.login !== 'admin' && (
                    <button onClick={() => remove(u.id)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-red transition-colors ml-1"><HiOutlineTrash className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo *</label>
            <input value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Login *</label>
              <input value={form.login} onChange={e => setForm({...form, login: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Senha {editing ? '(deixe vazio para manter)' : '*'}</label>
              <input type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Perfil</label>
              <select value={form.perfil} onChange={e => setForm({...form, perfil: e.target.value})} className="select-field">
                <option value="comum">Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Setor</label>
              <input value={form.setor} onChange={e => setForm({...form, setor: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Filial</label>
              <input value={form.filial} onChange={e => setForm({...form, filial: e.target.value})} className="input-field" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-400">Ativo</label>
            <button type="button" onClick={() => setForm({...form, ativo: !form.ativo})}
              className={`w-12 h-6 rounded-full transition-colors ${form.ativo ? 'bg-cyber-green' : 'bg-dark-500'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${form.ativo ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
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
