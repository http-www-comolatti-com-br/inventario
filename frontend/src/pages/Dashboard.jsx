import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  HiOutlineCube, HiOutlineCheckCircle, HiOutlineDesktopComputer, HiOutlineCog,
  HiOutlineExclamationCircle, HiOutlineTrendingUp, HiOutlineXCircle, HiOutlineClipboardList
} from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [porCategoria, setPorCategoria] = useState([]);
  const [porDestinatario, setPorDestinatario] = useState([]);
  const [movRecentes, setMovRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [r, c, d, m] = await Promise.all([
        api.get('/dashboard/resumo'),
        api.get('/dashboard/por-categoria'),
        api.get('/dashboard/por-destinatario'),
        api.get('/dashboard/movimentacoes-recentes'),
      ]);
      setResumo(r.data);
      setPorCategoria(c.data);
      setPorDestinatario(d.data);
      setMovRecentes(m.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
    </div>
  );

  const pieData = resumo ? [
    { name: 'Disponíveis', value: resumo.unidades_disponiveis },
    { name: 'Em Uso', value: resumo.unidades_em_uso },
    { name: 'Manutenção', value: resumo.unidades_manutencao },
    { name: 'Baixados', value: resumo.unidades_baixadas },
  ].filter(d => d.value > 0) : [];

  const tipoMovLabels = { entrada: 'Entrada', entrega: 'Entrega', devolucao: 'Devolução', transferencia: 'Transferência', manutencao: 'Manutenção', baixa: 'Baixa' };
  const statusLabels = { disponivel: 'Disponível', em_uso: 'Em Uso', manutencao: 'Manutenção', baixado: 'Baixado' };

  const stats = resumo ? [
    { label: 'Total de Modelos', value: resumo.total_modelos, icon: HiOutlineCube, color: 'from-cyber-cyan to-cyan-400', click: () => navigate('/modelos') },
    { label: 'Disponíveis', value: resumo.unidades_disponiveis, icon: HiOutlineCheckCircle, color: 'from-cyber-green to-emerald-400', click: () => navigate('/unidades?status=disponivel') },
    { label: 'Em Uso', value: resumo.unidades_em_uso, icon: HiOutlineDesktopComputer, color: 'from-cyber-blue to-blue-400', click: () => navigate('/unidades?status=em_uso') },
    { label: 'Manutenção', value: resumo.unidades_manutencao, icon: HiOutlineCog, color: 'from-cyber-yellow to-amber-400', click: () => navigate('/unidades?status=manutencao') },
    { label: 'Baixados', value: resumo.unidades_baixadas, icon: HiOutlineXCircle, color: 'from-cyber-red to-red-400', click: () => navigate('/unidades?status=baixado') },
    { label: 'Consumíveis Estoque', value: resumo.total_consumiveis_estoque, icon: HiOutlineClipboardList, color: 'from-cyber-purple to-violet-400', click: () => navigate('/estoque') },
    { label: 'Alertas Mínimo', value: resumo.alertas_estoque_minimo, icon: HiOutlineExclamationCircle, color: 'from-orange-500 to-amber-500', click: () => navigate('/estoque') },
    { label: 'Movimentações 30d', value: resumo.movimentacoes_30_dias, icon: HiOutlineTrendingUp, color: 'from-pink-500 to-rose-400', click: () => navigate('/movimentacoes') },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title text-3xl">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do inventário de TI</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} onClick={stat.click} className="stat-card cursor-pointer group">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center opacity-60`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
          )}
        </div>

        {/* Bar Chart - Por Destinatário */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ranking por Destinatário</h3>
          {porDestinatario.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porDestinatario.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="nome_completo" width={120} stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="total_itens" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Itens em posse" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">Nenhum dado disponível</div>
          )}
        </div>
      </div>

      {/* Movimentações Recentes */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Movimentações Recentes</h3>
          <button onClick={() => navigate('/movimentacoes')} className="text-cyber-cyan text-sm hover:underline">Ver todas →</button>
        </div>
        {movRecentes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Item</th>
                  <th className="text-left p-3">Destinatário</th>
                  <th className="text-left p-3">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movRecentes.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="p-3 text-gray-400">{new Date(m.criado_em).toLocaleString('pt-BR')}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-lg bg-cyber-cyan/10 text-cyber-cyan text-xs font-semibold">
                        {tipoMovLabels[m.tipo] || m.tipo}
                      </span>
                    </td>
                    <td className="p-3 text-white">{m.modelo_nome}</td>
                    <td className="p-3 text-gray-300">{m.destinatario_nome || '—'}</td>
                    <td className="p-3 text-gray-400">{m.usuario_nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada</p>
        )}
      </div>
    </div>
  );
}
