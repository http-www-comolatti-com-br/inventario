import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import QRCodeModal from '../components/QRCodeModal';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineQrcode, HiOutlineClipboardList, HiOutlineServer, HiOutlineTrash } from 'react-icons/hi';

export default function Unidades() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.perfil === 'admin';

  const [searchParams] = useSearchParams();
  const [unidades, setUnidades] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [qrModal, setQrModal] = useState(false);
  const [qrUnidade, setQrUnidade] = useState(null);
  const [histModal, setHistModal] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [histUnidade, setHistUnidade] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState(searchParams.get('status') || '');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [form, setForm] = useState({ modelo_id: '', numero_serie: '', etiqueta_patrimonial: '', local: '', observacoes: '' });

  useEffect(() => { loadModelos(); }, []);
  useEffect(() => { load(); }, [filtroStatus, filtroBusca]);

  const load = async () => {
    try {
      const params = {};
      if (filtroStatus) params.status = filtroStatus;
      if (filtroBusca) params.busca = filtroBusca;
      const res = await api.get('/unidades', { params });
      setUnidades(res.data);
    } catch { toast.error('Erro ao carregar unidades.'); }
    finally { setLoading(false); }
  };

  const loadModelos = async () => {
    try { const res = await api.get('/modelos', { params: { tipo: 'patrimonio' } }); setModelos(res.data); } catch {}
  };

  const openNew = () => { setEditing(null); setForm({ modelo_id: '', numero_serie: '', etiqueta_patrimonial: '', local: '', observacoes: '' }); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ modelo_id: u.modelo_id, numero_serie: u.numero_serie || '', etiqueta_patrimonial: u.etiqueta_patrimonial || '', local: u.local || '', observacoes: u.observacoes || '' }); setModal(true); };

  const openQR = (u) => { setQrUnidade(u); setQrModal(true); };

  const openHist = async (u) => {
    setHistUnidade(u);
    try {
      const res = await api.get(`/unidades/${u.id}/historico`);
      setHistorico(res.data);
      setHistModal(true);
    } catch { toast.error('Erro ao carregar histórico.'); }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.modelo_id) return toast.error('Modelo é obrigatório.');
    try {
      if (editing) {
        await api.put(`/unidades/${editing.id}`, form);
        toast.success('Unidade atualizada!');
      } else {
        await api.post('/unidades', form);
        toast.success('Unidade cadastrada!');
      }
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
  };

  const excluir = async (u) => {
    const label = u.numero_serie || u.etiqueta_patrimonial || `ID ${u.id}`;
    const confirmMsg = u.status === 'disponivel'
      ? `Excluir a unidade "${label}"? Esta ação não pode ser desfeita.`
      : `A unidade "${label}" está com status "${statusLabels[u.status]}". Deseja marcá-la como Baixada?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.delete(`/unidades/${u.id}`);
      if (res.data.baixado) {
        toast.success('Unidade marcada como Baixada (possui histórico de movimentações).');
      } else {
        toast.success('Unidade excluída com sucesso!');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao excluir unidade.');
    }
  };

  const statusLabels = { disponivel: 'Disponível', em_uso: 'Em Uso', manutencao: 'Manutenção', baixado: 'Baixado' };
  const statusColors = {
    disponivel: 'bg-cyber-green/20 text-cyber-green',
    em_uso: 'bg-cyber-blue/20 text-cyber-blue',
    manutencao: 'bg-orange-500/20 text-orange-400',
    baixado: 'bg-cyber-red/20 text-cyber-red',
  };
  const tipoMovLabels = { entrada: 'Entrada', entrega: 'Entrega', devolucao: 'Devolução', transferencia: 'Transferência', manutencao: 'Manutenção', baixa: 'Baixa' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Patrimônio</h1>
          <p className="text-gray-500 mt-1">Controle de unidades individuais de equipamentos</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" /> Nova Unidade
        </button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="select-field w-48">
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="em_uso">Em Uso</option>
          <option value="manutencao">Manutenção</option>
          <option value="baixado">Baixado</option>
        </select>
        <input value={filtroBusca} onChange={e => setFiltroBusca(e.target.value)} className="input-field w-72" placeholder="Buscar por série, etiqueta, nome..." />
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Item</th>
              <th className="text-left p-4">Nº Série</th>
              <th className="text-left p-4">Etiqueta</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Destinatário</th>
              <th className="text-left p-4">Local</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">Nenhuma unidade cadastrada</td></tr>
            ) : unidades.map(u => (
              <tr key={u.id} className={`table-row ${u.status === 'baixado' ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <HiOutlineServer className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">{u.modelo_nome}</p>
                      <p className="text-xs text-gray-500">{u.marca} {u.modelo_modelo}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-300 font-mono text-xs">{u.numero_serie || '—'}</td>
                <td className="p-4 text-gray-300 font-mono text-xs">{u.etiqueta_patrimonial || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColors[u.status] || 'bg-gray-600/20 text-gray-400'}`}>
                    {statusLabels[u.status] || u.status}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{u.destinatario_nome || '—'}</td>
                <td className="p-4 text-gray-400">{u.local || '—'}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => openQR(u)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-green transition-colors" title="QR Code">
                    <HiOutlineQrcode className="w-4 h-4" />
                  </button>
                  <button onClick={() => openHist(u)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-purple transition-colors" title="Histórico">
                    <HiOutlineClipboardList className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-cyan transition-colors" title="Editar">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => excluir(u)}
                      className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-red transition-colors"
                      title={u.status === 'em_uso' || u.status === 'manutencao' ? 'Não é possível excluir (em uso/manutenção)' : 'Excluir unidade'}
                      disabled={u.status === 'em_uso' || u.status === 'manutencao'}
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nova/Editar Unidade */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Editar Unidade' : 'Nova Unidade'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Modelo *</label>
            <select value={form.modelo_id} onChange={e => setForm({...form, modelo_id: e.target.value})} className="select-field" disabled={!!editing}>
              <option value="">Selecione o modelo...</option>
              {modelos.map(m => <option key={m.id} value={m.id}>{m.nome} - {m.marca} {m.modelo}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Número de Série</label>
              <input value={form.numero_serie} onChange={e => setForm({...form, numero_serie: e.target.value})} className="input-field" placeholder="SN123456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Etiqueta Patrimonial</label>
              <input value={form.etiqueta_patrimonial} onChange={e => setForm({...form, etiqueta_patrimonial: e.target.value})} className="input-field" placeholder="PAT-001" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Local</label>
            <input value={form.local} onChange={e => setForm({...form, local: e.target.value})} className="input-field" placeholder="Ex: Sala 201" />
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
      </Modal>

      {/* QR Code Modal */}
      <QRCodeModal isOpen={qrModal} onClose={() => setQrModal(false)} unidade={qrUnidade} />

      {/* Histórico Modal */}
      <Modal isOpen={histModal} onClose={() => setHistModal(false)} title={`Histórico - ${histUnidade?.modelo_nome || ''}`} size="lg">
        {historico.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada para esta unidade</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Destinatário</th>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Observação</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(h => (
                  <tr key={h.id} className={`table-row ${h.cancelado ? 'opacity-50 line-through' : ''}`}>
                    <td className="p-3 text-gray-400 whitespace-nowrap">{new Date(h.criado_em).toLocaleString('pt-BR')}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded-lg bg-cyber-cyan/10 text-cyber-cyan text-xs font-semibold">{tipoMovLabels[h.tipo]}</span></td>
                    <td className="p-3 text-gray-300">{h.destinatario_nome || '—'}</td>
                    <td className="p-3 text-gray-400">{h.usuario_nome}</td>
                    <td className="p-3 text-gray-400 max-w-xs truncate">{h.observacao || '—'}</td>
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
