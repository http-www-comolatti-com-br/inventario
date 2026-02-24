import { useState, useEffect } from 'react';
import api from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineQrcode, HiOutlineFilter } from 'react-icons/hi';

export default function Consultas() {
  const [resultados, setResultados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrUnidade, setQrUnidade] = useState(null);
  const [filtros, setFiltros] = useState({ tipo: '', status: '', categoria_id: '', destinatario_id: '', busca: '' });

  useEffect(() => { loadAux(); }, []);

  const loadAux = async () => {
    try {
      const [c, d] = await Promise.all([api.get('/categorias'), api.get('/destinatarios')]);
      setCategorias(c.data);
      setDestinatarios(d.data);
    } catch {}
  };

  const buscar = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.status) params.status = filtros.status;
      if (filtros.busca) params.busca = filtros.busca;
      if (filtros.destinatario_id) params.destinatario_id = filtros.destinatario_id;

      const res = await api.get('/unidades', { params });
      setResultados(res.data);
    } catch { toast.error('Erro na busca.'); }
    finally { setLoading(false); }
  };

  const statusLabels = { disponivel: 'Disponível', em_uso: 'Em Uso', manutencao: 'Manutenção', baixado: 'Baixado' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Consultas e Filtros</h1>
        <p className="text-gray-500 mt-1">Busque equipamentos por diversos critérios</p>
      </div>

      {/* Filtros */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineFilter className="w-5 h-5 text-cyber-cyan" />
          <h3 className="text-white font-semibold">Filtros de Busca</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Busca por texto</label>
            <input value={filtros.busca} onChange={e => setFiltros({...filtros, busca: e.target.value})} className="input-field" placeholder="Série, etiqueta, nome..." />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select value={filtros.status} onChange={e => setFiltros({...filtros, status: e.target.value})} className="select-field">
              <option value="">Todos</option>
              <option value="disponivel">Disponível</option>
              <option value="em_uso">Em Uso</option>
              <option value="manutencao">Manutenção</option>
              <option value="baixado">Baixado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Destinatário</label>
            <select value={filtros.destinatario_id} onChange={e => setFiltros({...filtros, destinatario_id: e.target.value})} className="select-field">
              <option value="">Todos</option>
              {destinatarios.map(d => <option key={d.id} value={d.id}>{d.nome_completo}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={buscar} className="btn-primary w-full flex items-center justify-center gap-2">
              <HiOutlineSearch className="w-5 h-5" /> Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-10 h-10 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>
      ) : resultados.length > 0 ? (
        <div className="table-container">
          <div className="p-4 border-b border-dark-600/30">
            <span className="text-gray-400 text-sm">{resultados.length} resultado(s) encontrado(s)</span>
          </div>
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Item</th>
                <th className="text-left p-4">Nº Série</th>
                <th className="text-left p-4">Etiqueta</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Destinatário</th>
                <th className="text-left p-4">Local</th>
                <th className="text-right p-4">QR</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="p-4">
                    <p className="text-white font-medium">{u.modelo_nome}</p>
                    <p className="text-xs text-gray-500">{u.marca} {u.modelo_modelo}</p>
                  </td>
                  <td className="p-4 text-gray-300 font-mono text-xs">{u.numero_serie || '—'}</td>
                  <td className="p-4 text-gray-300 font-mono text-xs">{u.etiqueta_patrimonial || '—'}</td>
                  <td className="p-4"><span className={`status-${u.status}`}>{statusLabels[u.status]}</span></td>
                  <td className="p-4 text-gray-300">{u.destinatario_nome || '—'}</td>
                  <td className="p-4 text-gray-400">{u.local || '—'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setQrUnidade(u); setQrModal(true); }} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-cyber-green transition-colors">
                      <HiOutlineQrcode className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <HiOutlineSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Use os filtros acima para buscar equipamentos</p>
        </div>
      )}

      <QRCodeModal isOpen={qrModal} onClose={() => setQrModal(false)} unidade={qrUnidade} />
    </div>
  );
}
