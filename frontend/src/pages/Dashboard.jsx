import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  HiOutlineServer, HiOutlineCheckCircle, HiOutlineDesktopComputer, HiOutlineCog,
  HiOutlineExclamationCircle, HiOutlineTrendingUp, HiOutlineXCircle, HiOutlineClipboardList,
  HiOutlineArrowRight, HiOutlineSwitchHorizontal, HiOutlineArchive, HiOutlineUserGroup,
  HiOutlineCube, HiOutlineChevronRight
} from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = {
  disponivel: { color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Disponíveis', icon: HiOutlineCheckCircle, desc: 'Prontos para entrega' },
  em_uso: { color: '#3b82f6', bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Em Uso', icon: HiOutlineDesktopComputer, desc: 'Entregues a destinatários' },
  manutencao: { color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Manutenção', icon: HiOutlineCog, desc: 'Em reparo ou análise' },
  baixado: { color: '#ef4444', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', label: 'Baixados', icon: HiOutlineXCircle, desc: 'Descartados ou inutilizados' },
};

const MOV_COLORS = {
  entrada: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: '📥' },
  entrega: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: '📦' },
  devolucao: { bg: 'bg-violet-500/15', text: 'text-violet-400', icon: '🔄' },
  transferencia: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: '🔀' },
  manutencao: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: '🔧' },
  baixa: { bg: 'bg-red-500/15', text: 'text-red-400', icon: '❌' },
};

const tipoMovLabels = { entrada: 'Entrada', entrega: 'Entrega', devolucao: 'Devolução', transferencia: 'Transferência', manutencao: 'Manutenção', baixa: 'Baixa' };

// Custom label para o gráfico de rosca
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
      {value}
    </text>
  );
};

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [porCategoria, setPorCategoria] = useState([]);
  const [porDestinatario, setPorDestinatario] = useState([]);
  const [movRecentes, setMovRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

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

  const totalUnidades = resumo ? (resumo.unidades_disponiveis + resumo.unidades_em_uso + resumo.unidades_manutencao + resumo.unidades_baixadas) : 0;

  const pieData = resumo ? [
    { name: 'Disponíveis', value: resumo.unidades_disponiveis, key: 'disponivel' },
    { name: 'Em Uso', value: resumo.unidades_em_uso, key: 'em_uso' },
    { name: 'Manutenção', value: resumo.unidades_manutencao, key: 'manutencao' },
    { name: 'Baixados', value: resumo.unidades_baixadas, key: 'baixado' },
  ] : [];

  const pieDataFiltered = pieData.filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title text-3xl">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do inventário de TI — acompanhe equipamentos, consumíveis e movimentações</p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO 1: RESUMO GERAL — 3 cards grandes lado a lado               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card: Total de Equipamentos (Patrimônio) */}
        <div onClick={() => navigate('/unidades')} className="stat-card cursor-pointer group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan to-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyan-400/10 flex items-center justify-center">
              <HiOutlineServer className="w-6 h-6 text-cyber-cyan" />
            </div>
            <HiOutlineChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyber-cyan transition-colors" />
          </div>
          <p className="text-gray-400 text-sm">Total de Equipamentos</p>
          <p className="text-4xl font-bold text-white mt-1">{totalUnidades}</p>
          <p className="text-xs text-gray-500 mt-2">Unidades patrimoniais cadastradas</p>
        </div>

        {/* Card: Total de Consumíveis em Estoque */}
        <div onClick={() => navigate('/estoque')} className="stat-card cursor-pointer group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-purple to-violet-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-purple/20 to-violet-400/10 flex items-center justify-center">
              <HiOutlineArchive className="w-6 h-6 text-cyber-purple" />
            </div>
            <HiOutlineChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyber-purple transition-colors" />
          </div>
          <p className="text-gray-400 text-sm">Consumíveis em Estoque</p>
          <p className="text-4xl font-bold text-white mt-1">{resumo?.total_consumiveis_estoque || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Itens de consumo disponíveis</p>
        </div>

        {/* Card: Movimentações nos últimos 30 dias */}
        <div onClick={() => navigate('/movimentacoes')} className="stat-card cursor-pointer group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-400/10 flex items-center justify-center">
              <HiOutlineSwitchHorizontal className="w-6 h-6 text-pink-400" />
            </div>
            <HiOutlineChevronRight className="w-5 h-5 text-gray-600 group-hover:text-pink-400 transition-colors" />
          </div>
          <p className="text-gray-400 text-sm">Movimentações (30 dias)</p>
          <p className="text-4xl font-bold text-white mt-1">{resumo?.movimentacoes_30_dias || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Entradas, entregas, devoluções e mais</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO 2: STATUS DOS EQUIPAMENTOS — gráfico + cards de status       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Status dos Equipamentos (Patrimônio)</h3>
        <p className="text-sm text-gray-500 mb-6">Cada equipamento cadastrado possui um status que indica sua situação atual. Clique em um status para ver os itens.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Gráfico de rosca */}
          <div className="lg:col-span-2 flex items-center justify-center">
            {pieDataFiltered.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={renderCustomLabel}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.key} fill={STATUS_COLORS[entry.key].color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                    formatter={(value, name) => [`${value} unidade(s)`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-gray-500">
                <HiOutlineServer className="w-12 h-12 mb-2 opacity-30" />
                <p>Nenhum equipamento cadastrado</p>
              </div>
            )}
          </div>

          {/* Cards de status com descrição */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            {Object.entries(STATUS_COLORS).map(([key, cfg]) => {
              const value = pieData.find(d => d.key === key)?.value || 0;
              const pct = totalUnidades > 0 ? Math.round((value / totalUnidades) * 100) : 0;
              const Icon = cfg.icon;
              return (
                <div
                  key={key}
                  onClick={() => navigate(`/unidades?status=${key}`)}
                  className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border} cursor-pointer hover:scale-[1.02] transition-all`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${cfg.text}`} />
                    <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{value}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">{cfg.desc}</p>
                    <span className={`text-xs font-semibold ${cfg.text}`}>{pct}%</span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full h-1.5 bg-dark-800/60 rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO 3: ALERTAS (se houver)                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {resumo && resumo.alertas_estoque_minimo > 0 && (
        <div onClick={() => navigate('/estoque')} className="glass-card p-5 border-l-4 border-amber-500 cursor-pointer hover:bg-dark-600/40 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <HiOutlineExclamationCircle className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-amber-400 font-semibold">Alerta de Estoque Mínimo</p>
              <p className="text-sm text-gray-400 mt-0.5">
                Existem <span className="text-amber-400 font-bold">{resumo.alertas_estoque_minimo}</span> item(ns) consumível(is) com estoque abaixo do mínimo configurado. Clique para verificar.
              </p>
            </div>
            <HiOutlineArrowRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO 4: GRÁFICOS — Por Categoria + Por Destinatário               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: Por Categoria */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Equipamentos por Categoria</h3>
          <p className="text-xs text-gray-500 mb-4">Quantidade de unidades patrimoniais agrupadas por categoria</p>
          {porCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porCategoria.slice(0, 8)} margin={{ left: 10, right: 10 }}>
                <XAxis
                  dataKey="categoria"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(value) => [`${value} unidade(s)`, 'Equipamentos']}
                />
                <Bar dataKey="total_unidades" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Equipamentos" maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <HiOutlineCube className="w-10 h-10 mb-2 opacity-30" />
              <p>Nenhuma categoria com equipamentos</p>
            </div>
          )}
        </div>

        {/* Gráfico: Ranking por Destinatário */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Ranking por Destinatário</h3>
          <p className="text-xs text-gray-500 mb-4">Colaboradores com mais equipamentos em posse atualmente</p>
          {porDestinatario.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porDestinatario.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nome_completo"
                  width={110}
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v}
                />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(value) => [`${value} equipamento(s)`, 'Em posse']}
                />
                <Bar dataKey="total_itens" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Equipamentos" maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <HiOutlineUserGroup className="w-10 h-10 mb-2 opacity-30" />
              <p>Nenhum destinatário com equipamentos</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO 5: MOVIMENTAÇÕES RECENTES — formato timeline                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Movimentações Recentes</h3>
            <p className="text-xs text-gray-500 mt-0.5">Últimas atividades registradas no sistema</p>
          </div>
          <button onClick={() => navigate('/movimentacoes')} className="flex items-center gap-1 text-cyber-cyan text-sm hover:underline font-medium">
            Ver todas <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>

        {movRecentes.length > 0 ? (
          <div className="space-y-3">
            {movRecentes.map((m, i) => {
              const movStyle = MOV_COLORS[m.tipo] || MOV_COLORS.entrada;
              const data = new Date(m.criado_em);
              const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
              const horaStr = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={m.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-dark-600/30 transition-colors">
                  {/* Ícone do tipo */}
                  <div className={`w-10 h-10 rounded-xl ${movStyle.bg} flex items-center justify-center flex-shrink-0 text-lg`}>
                    {movStyle.icon}
                  </div>
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${movStyle.bg} ${movStyle.text}`}>
                        {tipoMovLabels[m.tipo] || m.tipo}
                      </span>
                      <span className="text-white font-medium text-sm truncate">{m.modelo_nome}</span>
                      {m.numero_serie && (
                        <span className="text-xs text-gray-500 font-mono">({m.numero_serie})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      {m.destinatario_nome && (
                        <>
                          <HiOutlineUserGroup className="w-3 h-3" />
                          <span className="text-gray-400">{m.destinatario_nome}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>por {m.usuario_nome}</span>
                    </div>
                  </div>
                  {/* Data/hora */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 font-medium">{dataStr}</p>
                    <p className="text-xs text-gray-500">{horaStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <HiOutlineClipboardList className="w-12 h-12 mb-2 opacity-30" />
            <p>Nenhuma movimentação registrada ainda</p>
            <p className="text-xs mt-1">Comece registrando uma entrada ou entrega de equipamento</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO 6: ATALHOS RÁPIDOS                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Nova Entrada', desc: 'Registrar recebimento', icon: '📥', path: '/movimentacoes', color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' },
            { label: 'Nova Entrega', desc: 'Entregar equipamento', icon: '📦', path: '/movimentacoes', color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40' },
            { label: 'Cadastrar Item', desc: 'Novo modelo de item', icon: '➕', path: '/modelos', color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40' },
            { label: 'Consultar', desc: 'Buscar equipamento', icon: '🔍', path: '/consultas', color: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 hover:border-violet-500/40' },
          ].map((action, i) => (
            <div
              key={i}
              onClick={() => navigate(action.path)}
              className={`p-4 rounded-xl bg-gradient-to-br ${action.color} border cursor-pointer transition-all hover:scale-[1.02]`}
            >
              <span className="text-2xl">{action.icon}</span>
              <p className="text-white font-medium text-sm mt-2">{action.label}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
