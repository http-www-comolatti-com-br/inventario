import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import QuickAddModal from '../components/QuickAddModal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineXCircle, HiOutlineLightningBolt } from 'react-icons/hi';

const TIPOS = [
  { value: 'entrada', label: 'Entrada', color: 'bg-cyber-green/20 text-cyber-green' },
  { value: 'entrega', label: 'Entrega', color: 'bg-cyber-blue/20 text-cyber-blue' },
  { value: 'devolucao', label: 'Devolução', color: 'bg-cyber-purple/20 text-cyber-purple' },
  { value: 'transferencia', label: 'Transferência', color: 'bg-cyber-yellow/20 text-cyber-yellow' },
  { value: 'manutencao', label: 'Manutenção', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'baixa', label: 'Baixa', color: 'bg-cyber-red/20 text-cyber-red' },
];

// Tipos que NÃO são cobertos pelo Wizard (operações pós-entrega)
const TIPOS_OPERACAO = ['devolucao', 'transferencia', 'manutencao', 'baixa'];

function getStatusFilter(tipoMov) {
  if (tipoMov === 'entrega') return 'disponivel';
  if (tipoMov === 'devolucao') return 'em_uso';
  if (tipoMov === 'transferencia') return 'em_uso';
  return '';
}

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [quickModal, setQuickModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [tipoMov, setTipoMov] = useState('devolucao');
  const [form, setForm] = useState({ modelo_id: '', unidade_id: '', quantidade: '', destinatario_id: '', observacao: '' });

  useEffect(() => { load(); loadAux(); }, []);
  useEffect(() => { load(); }, [filtroTipo]);

  const load = async () => {
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      const res = await api.get('/movimentacoes', { params });
      setMovimentacoes(res.data);
    } catch { toast.error('Erro ao carregar movimentações.'); }
    finally { setLoading(false); }
  };

  const loadAux = async () => {
    try {
      const [m, d] = await Promise.all([api.get('/modelos'), api.get('/destinatarios')]);
      setModelos(m.data);
      setDestinatarios(d.data.filter(dd => dd.ativo));
    } catch {}
  };

  const loadUnidades = async (modelo_id, statusFilter) => {
    try {
      const params = { modelo_id };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/unidades', { params });
      setUnidades(res.data);
    } catch {}
  };

  const openNew = (tipo) => {
    setTipoMov(tipo);
    setForm({ modelo_id: '', unidade_id: '', quantidade: '', destinatario_id: '', observacao: '' });
    setUnidades([]);
    setModal(true);
  };

  const onModeloChange = (modelo_id, tipoAtual) => {
    const tipo = tipoAtual || tipoMov;
    setForm(prev => ({ ...prev, modelo_id, unidade_id: '' }));
    const modelo = modelos.find(m => m.id == modelo_id);
    if (modelo && modelo.tipo === 'patrimonio') {
      const statusFilter = getStatusFilter(tipo);
      loadUnidades(modelo_id, statusFilter);
    } else {
      setUnidades([]);
    }
  };

  const selectedModelo = modelos.find(m => m.id == form.modelo_id);
  const isPatrimonio = selectedModelo?.tipo === 'patrimonio';
  const needDestinatario = ['transferencia'].includes(tipoMov);

  const save = async (e) => {
    e.preventDefault();
    if (!form.modelo_id) return toast.error('Selecione um modelo.');
    if (isPatrimonio && !form.unidade_id) return toast.error('Selecione a unidade.');
    if (!isPatrimonio && (!form.quantidade || form.quantidade <= 0)) return toast.error('Informe a quantidade.');
    if (needDestinatario && !form.destinatario_id) return toast.error('Selecione o destinatário.');
    try {
      const data = { ...form };
      if (!isPatrimonio) { data.quantidade = parseInt(data.quantidade); delete data.unidade_id; }
      else { delete data.quantidade; }
      if (!needDestinatario) delete data.destinatario_id;

      await api.post(`/movimentacoes/${tipoMov}`, data);
      toast.success('Movimentação registrada!');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao registrar movimentação.'); }
  };

  const cancelar = async (id) => {
    const motivo = prompt('Motivo do cancelamento:');
    if (!motivo) return;
    try {
      await api.put(`/movimentacoes/${id}/cancelar`, { motivo });
      toast.success('Movimentação cancelada!');
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao cancelar.'); }
  };

  const tipoColor = (tipo) => TIPOS.find(t => t.value === tipo)?.color || 'bg-gray-600/20 text-gray-400';
  const tipoLabel = (tipo) => TIPOS.find(t => t.value === tipo)?.label || tipo;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Movimentações</h1>
          <p className="text-gray-500 mt-1">Registre e acompanhe todas as movimentações de estoque</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Botão principal: Entrada Rápida (cobre Entrada + Entrega) */}
          <button
            onClick={() => setQuickModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <HiOutlineLightningBolt className="w-4 h-4" /> Entrada Rápida
          </button>

          {/* Botões de operações pós-entrega */}
          {TIPOS_OPERACAO.map(t => {
            const cfg = TIPOS.find(x => x.value === t);
            return (
              <button
                key={t}
                onClick={() => openNew(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 ${cfg.color} border border-transparent hover:border-current`}
              >
                <HiOutlinePlus className="w-3 h-3 inline mr-1" /> {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="select-field w-48">
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left p-4">Data</th>
              <th className="text-left p-4">Tipo</th>
              <th className="text-left p-4">Item</th>
              <th className="text-center p-4">Qtd</th>
              <th className="text-left p-4">Destinatário</th>
              <th className="text-left p-4">Usuário</th>
              <th className="text-left p-4">Observação</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">Nenhuma movimentação registrada</td></tr>
            ) : movimentacoes.map(m => (
              <tr key={m.id} className={`table-row ${m.cancelado ? 'opacity-40' : ''}`}>
                <td className="p-4 text-gray-400 whitespace-nowrap text-xs">{new Date(m.criado_em).toLocaleString('pt-BR')}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${tipoColor(m.tipo)}`}>{tipoLabel(m.tipo)}</span></td>
                <td className="p-4 text-white">{m.modelo_nome}{m.numero_serie ? ` (${m.numero_serie})` : ''}</td>
                <td className="p-4 text-center text-gray-300">{m.quantidade || '—'}</td>
                <td className="p-4 text-gray-300">{m.destinatario_nome || '—'}</td>
                <td className="p-4 text-gray-400">{m.usuario_nome}</td>
                <td className="p-4 text-gray-400 max-w-xs truncate">{m.cancelado ? `❌ ${m.motivo_cancelamento}` : (m.observacao || '—')}</td>
                <td className="p-4 text-right">
                  {!m.cancelado && (
                    <button onClick={() => cancelar(m.id)} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-red transition-colors" title="Cancelar">
                      <HiOutlineXCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para operações pós-entrega (Devolução, Transferência, Manutenção, Baixa) */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={`Registrar ${tipoLabel(tipoMov)}`}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Modelo/Item *</label>
            <select
              value={form.modelo_id}
              onChange={e => onModeloChange(e.target.value, tipoMov)}
              className="select-field"
            >
              <option value="">Selecione...</option>
              {modelos.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.tipo === 'patrimonio' ? 'Patrimônio' : 'Consumível'}) - {m.marca}
                </option>
              ))}
            </select>
          </div>

          {isPatrimonio && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Unidade *</label>
              <select
                value={form.unidade_id}
                onChange={e => setForm({ ...form, unidade_id: e.target.value })}
                className="select-field"
              >
                <option value="">Selecione a unidade...</option>
                {unidades.length === 0 && form.modelo_id ? (
                  <option disabled value="">
                    {tipoMov === 'devolucao' ? 'Nenhuma unidade em uso para devolução' :
                     tipoMov === 'transferencia' ? 'Nenhuma unidade em uso para transferência' :
                     'Nenhuma unidade cadastrada'}
                  </option>
                ) : null}
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.numero_serie || u.etiqueta_patrimonial || `ID ${u.id}`} — {u.status}{u.destinatario_nome ? ` (${u.destinatario_nome})` : ''}
                  </option>
                ))}
              </select>
              {isPatrimonio && form.modelo_id && unidades.length === 0 && (
                <p className="text-xs text-cyber-yellow mt-1">
                  {tipoMov === 'devolucao' && '⚠ Não há unidades com status "Em Uso" para este modelo.'}
                  {tipoMov === 'transferencia' && '⚠ Não há unidades com status "Em Uso" para este modelo.'}
                  {(tipoMov === 'manutencao' || tipoMov === 'baixa') && '⚠ Nenhuma unidade cadastrada para este modelo.'}
                </p>
              )}
            </div>
          )}

          {!isPatrimonio && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Quantidade *</label>
              <input
                type="number"
                min="1"
                value={form.quantidade}
                onChange={e => setForm({ ...form, quantidade: e.target.value })}
                className="input-field"
                placeholder="Quantidade"
              />
            </div>
          )}

          {needDestinatario && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Novo Destinatário *</label>
              <select
                value={form.destinatario_id}
                onChange={e => setForm({ ...form, destinatario_id: e.target.value })}
                className="select-field"
              >
                <option value="">Selecione...</option>
                {destinatarios.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.nome_completo}{d.setor ? ` - ${d.setor}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Observação</label>
            <textarea
              value={form.observacao}
              onChange={e => setForm({ ...form, observacao: e.target.value })}
              className="input-field h-20"
              placeholder="Motivo ou observação da movimentação"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Registrar {tipoLabel(tipoMov)}</button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Wizard de Entrada Rápida */}
      <QuickAddModal isOpen={quickModal} onClose={() => setQuickModal(false)} onSuccess={load} />
    </div>
  );
}
