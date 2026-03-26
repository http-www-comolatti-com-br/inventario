import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuickAddModal from '../components/QuickAddModal';
import {
  HiOutlineServer, HiOutlineCheckCircle, HiOutlineDesktopComputer, HiOutlineCog,
  HiOutlineExclamationCircle, HiOutlineSwitchHorizontal, HiOutlineXCircle, HiOutlineClipboardList,
  HiOutlineArrowRight, HiOutlineArchive, HiOutlineUserGroup,
  HiOutlineCube, HiOutlineChevronRight, HiOutlineLightningBolt
} from 'react-icons/hi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  disponivel: { color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Disponíveis em Estoque', icon: HiOutlineCheckCircle, desc: 'Prontos para uso' },
  em_uso: { color: '#3b82f6', bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Em Uso no Campo', icon: HiOutlineDesktopComputer, desc: 'Com destinatários' },
  manutencao: { color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Manutenção', icon: HiOutlineCog, desc: 'Aguardando reparo' },
  baixado: { color: '#ef4444', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', label: 'Baixados', icon: HiOutlineXCircle, desc: 'Inutilizados' },
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
  const [quickModal, setQuickModal] = useState(false);
  const [resumo, setResumo] = useState(null);
  const [porCategoria, setPorCategoria] = useState([]);
  const [porDestinatario, setPorDestinatario] = useState([]);
  const [movRecentes, setMovRecentes] = useState([]);
  const [consumiveisCriticos, setConsumiveisCriticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [r, c, d, m, cc] = await Promise.all([
        api.get('/dashboard/resumo'),
        api.get('/dashboard/por-categoria'),
        api.get('/dashboard/por-destinatario'),
        api.get('/dashboard/movimentacoes-recentes'),
        api.get('/dashboard/consumiveis-criticos'),
      ]);
      setResumo(r.data);
      setPorCategoria(c.data);
      setPorDestinatario(d.data);
      setMovRecentes(m.data);
      setConsumiveisCriticos(cc.data);
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
  const totalAtivos = resumo ? (resumo.unidades_disponiveis + resumo.unidades_em_uso + resumo.unidades_manutencao) : 0;

  const pieData = resumo ? [
    { name: 'Disponíveis', value: resumo.unidades_disponiveis, key: 'disponivel' },
    { name: 'Em Uso', value: resumo.unidades_em_uso, key: 'em_uso' },
    { name: 'Manutenção', value: resumo.unidades_manutencao, key: 'manutencao' },
    { name: 'Baixados', value: resumo.unidades_baixadas, key: 'baixado' },
  ] : [];

  const pieDataFiltered = pieData.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ════ HEADER ════ */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title text-3xl">Torre de Controle</h1>
          <p className="text-gray-500 mt-1">Visão integral de patrimônios fixos e abastecimento de lotes consumíveis</p>
        </div>
        <button
          onClick={() => setQuickModal(true)}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold hover:shadow-[0_0_20px_rgba(4,217,255,0.4)] transition-all hover:scale-105"
        >
          <HiOutlineLightningBolt className="w-5 h-5 text-dark-900" /> Ação Rápida Universal
        </button>
      </div>

      {/* ════ SEÇÃO 1: OS 4 MAIORES KPIs ════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Patrimônios */}
        <div onClick={() => navigate('/unidades')} className="stat-card cursor-pointer group p-5 border-l-4 border-l-cyber-cyan border-r-0 border-t-0 border-b-0 hover:bg-dark-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center">
              <HiOutlineServer className="w-5 h-5 text-cyber-cyan" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{totalAtivos}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Patrimônios Ativos</p>
          <p className="text-[10px] text-gray-500 mt-1">Equipamentos rastreáveis e etiquetados</p>
        </div>

        {/* KPI 2: Consumíveis */}
        <div onClick={() => navigate('/estoque')} className="stat-card cursor-pointer group p-5 border-l-4 border-l-cyber-purple border-r-0 border-t-0 border-b-0 hover:bg-dark-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyber-purple/10 flex items-center justify-center">
              <HiOutlineArchive className="w-5 h-5 text-cyber-purple" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{resumo?.total_consumiveis_estoque || 0}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Estoque Físico Lotes</p>
          <p className="text-[10px] text-gray-500 mt-1">Volume de mouses, teclados, adaptadores...</p>
        </div>

        {/* KPI 3: Reposição */}
        <div onClick={() => navigate('/estoque')} className={`stat-card cursor-pointer group p-5 border-l-4 border-r-0 border-t-0 border-b-0 hover:bg-dark-700/50 transition-all ${resumo?.alertas_estoque_minimo > 0 ? 'border-l-cyber-yellow shadow-[0_0_20px_rgba(255,204,0,0.1)]' : 'border-l-cyber-green'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${resumo?.alertas_estoque_minimo > 0 ? 'bg-cyber-yellow/10' : 'bg-cyber-green/10'}`}>
              <HiOutlineExclamationCircle className={`w-5 h-5 ${resumo?.alertas_estoque_minimo > 0 ? 'text-cyber-yellow' : 'text-cyber-green'}`} />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{resumo?.alertas_estoque_minimo || 0}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Alerta de Reposição</p>
          <p className="text-[10px] text-gray-500 mt-1">{resumo?.alertas_estoque_minimo > 0 ? 'Atenção: Itens em limite crítico' : 'Todos os itens normais no estoque'}</p>
        </div>

        {/* KPI 4: Movimentações */}
        <div onClick={() => navigate('/movimentacoes')} className="stat-card cursor-pointer group p-5 border-l-4 border-l-pink-500 border-r-0 border-t-0 border-b-0 hover:bg-dark-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <HiOutlineSwitchHorizontal className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <p className="text-4xl font-black text-white">{resumo?.movimentacoes_30_dias || 0}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">Volume Operacional</p>
          <p className="text-[10px] text-gray-500 mt-1">Ações registradas pela equipe em 30 d.</p>
        </div>
      </div>

      {/* ════ SEÇÃO 2: ÁREA DE SAÚDE (DUPLA) ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ESQUERDA: Visão Patrimonial */}
        <div className="glass-card p-6 flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1"><span className="text-cyber-cyan mr-2">●</span>Balanço Patrimonial</h3>
            <p className="text-xs text-gray-500">Alocação atual do maquinário físico rastreável</p>
          </div>
          
          <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-48 h-48 flex-shrink-0">
              {pieDataFiltered.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieDataFiltered} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={0} stroke="transparent" strokeWidth={0} dataKey="value" label={renderCustomLabel} labelLine={false}>
                      {pieDataFiltered.map((entry) => (
                        <Cell 
                          key={entry.key} 
                          fill={STATUS_COLORS[entry.key].color} 
                          stroke={STATUS_COLORS[entry.key].color}
                          strokeWidth={1}
                          onClick={() => navigate(`/unidades?status=${entry.key}`)}
                          className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value, name) => [`${value} maq.`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600"><HiOutlineServer className="w-8 h-8 opacity-30" /></div>
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              {Object.entries(STATUS_COLORS).map(([key, cfg]) => {
                const value = pieData.find(d => d.key === key)?.value || 0;
                const pct = totalUnidades > 0 ? Math.round((value / totalUnidades) * 100) : 0;
                if(value === 0 && key !== 'disponivel' && key !== 'em_uso') return null; // hide 0 unless it's main statuses
                const Icon = cfg.icon;
                return (
                  <div 
                    key={key} 
                    onClick={() => navigate(`/unidades?status=${key}`)}
                    className={`border border-dark-600 rounded-lg p-2.5 ${cfg.bg} flex items-center gap-3 cursor-pointer hover:scale-[1.02] hover:border-cyber-cyan/30 transition-all`}
                  >
                    <div className={`p-1.5 rounded-md text-dark-900 bg-current overflow-hidden flex-shrink-0`} style={{ color: cfg.color }}>
                      <Icon className="w-4 h-4 text-dark-900" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className={`text-[12px] font-bold tracking-wide uppercase ${cfg.text}`}>{cfg.label}</p>
                        <p className="text-sm font-black text-white">{value}</p>
                      </div>
                      <div className="w-full h-1 bg-dark-800/60 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DIREITA: Termômetro de Consumíveis */}
        <div className="glass-card p-6 flex flex-col h-full">
           <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1"><span className="text-cyber-purple mr-2">●</span>Termômetro de Consumíveis</h3>
              <p className="text-xs text-gray-500">Lotes que estão chegando ao fim ou já esgotados</p>
            </div>
            <button onClick={() => navigate('/estoque')} className="text-[11px] font-bold uppercase tracking-wider text-cyber-purple hover:text-white transition-colors bg-cyber-purple/10 px-3 py-1.5 rounded-lg border border-cyber-purple/20 hover:border-cyber-purple">Abrir Estoque</button>
          </div>

          <div className="flex-1 space-y-4 pt-2">
            {consumiveisCriticos.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2 pb-6">
                <HiOutlineArchive className="w-10 h-10 opacity-30 text-cyber-green" />
                <p className="text-sm">Seu estoque de consumíveis está confortável.</p>
              </div>
            ) : consumiveisCriticos.map(item => {
              const diff = item.quantidade_disponivel - item.quantidade_minima;
              let statusTheme = 'text-cyber-green bg-cyber-green';
              let bgTheme = 'bg-cyber-green/10 border-cyber-green/30';
              if (item.quantidade_disponivel === 0) {
                statusTheme = 'text-red-500 bg-red-500'; bgTheme = 'bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
              } else if (diff <= 3) {
                statusTheme = 'text-amber-500 bg-amber-500'; bgTheme = 'bg-amber-500/10 border-amber-500/30';
              } else if (diff <= 10) {
                statusTheme = 'text-cyber-yellow bg-cyber-yellow'; bgTheme = 'bg-cyber-yellow/10 border-cyber-yellow/30';
              }
              
              // calculando progresso visual (minimo = 20% visualmente se for 0, pra barra existir)
              const ratio = item.quantidade_minima > 0 ? (item.quantidade_disponivel / (item.quantidade_minima * 2)) * 100 : 100;
              const barWidth = Math.min(Math.max(ratio, 5), 100);

              return (
                <div key={item.id} className={`p-3 rounded-xl border ${bgTheme}`}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[13px] font-bold text-white truncate max-w-[200px]">{item.nome}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.marca} • <span className="opacity-70">Aviso a partir de {item.quantidade_minima}</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black leading-none text-white">{item.quantidade_disponivel} <span className="text-[10px] font-normal text-gray-500">und</span></p>
                    </div>
                  </div>
                  {/* Gauge Bar */}
                  <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden border border-dark-600/50">
                    <div className={`h-full rounded-full transition-all duration-1000 bg-current`} style={{ width: `${barWidth}%`, color: statusTheme.split(' ')[0].replace('text-', '') }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ════ SEÇÃO 3: HISTOGRAMAS E CATEGORIAS ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico: Por Categoria */}
        <div className="glass-card p-6 border-t-2 border-t-cyan-500/50">
          <h3 className="text-lg font-semibold text-white mb-1">Distribuição de Patrimônio</h3>
          <p className="text-xs text-gray-500 mb-6">Unidades ativas aglomeradas por suas naturezas/categorias</p>
          {porCategoria.filter(c => c.total_unidades > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={porCategoria.filter(c => c.total_unidades > 0).slice(0, 7)} margin={{ left: 0, right: 0 }}>
                <XAxis dataKey="categoria" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} width={30} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value) => [`${value} un.`, 'Total']} />
                <Bar dataKey="total_unidades" radius={[4, 4, 0, 0]} maxBarSize={45}>
                   {porCategoria.filter(c => c.total_unidades > 0).slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(190, 90%, ${50 - index * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <HiOutlineCube className="w-10 h-10 mb-2 opacity-30" />
              <p>Nenhuma categoria</p>
            </div>
          )}
        </div>

        {/* Gráfico: Ranking por Destinatário */}
        <div className="glass-card p-6 border-t-2 border-t-violet-500/50">
          <h3 className="text-lg font-semibold text-white mb-1">Posseiros de Equipamentos</h3>
          <p className="text-xs text-gray-500 mb-4">Colaboradores com o maior número de ferramentas em posse.</p>
          {porDestinatario.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={porDestinatario.slice(0, 7)} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis type="category" dataKey="nome_completo" width={110} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + '…' : v} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value) => [`${value} un.`, 'Posse']} />
                <Bar dataKey="total_itens" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {porDestinatario.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(260, 80%, ${65 - index * 3}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <HiOutlineUserGroup className="w-10 h-10 mb-2 opacity-30" />
              <p>Nenhuma entrega registrada</p>
            </div>
          )}
        </div>
      </div>

      {/* ════ SEÇÃO 4: LOG VIVO DE MOVIMENTAÇÕES ════ */}
      <div className="glass-card p-6 border-l-2 border-l-dark-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white"><span className="text-pink-500 mr-2">●</span>Linha do Tempo</h3>
            <p className="text-xs text-gray-500 mt-0.5">Visão crônica das últimas 10 modificações no sistema, incluindo lotes e seriais.</p>
          </div>
          <button onClick={() => navigate('/movimentacoes')} className="flex items-center gap-1 text-pink-400 text-xs uppercase tracking-widest font-bold hover:text-white transition-colors bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/20 hover:border-pink-500">
            Audit Geral <HiOutlineArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {movRecentes.length > 0 ? (
          <div className="space-y-4">
            {movRecentes.map((m) => {
              const movStyle = MOV_COLORS[m.tipo] || MOV_COLORS.entrada;
              const data = new Date(m.criado_em);
              const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
              const horaStr = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              
              const isLote = !m.numero_serie;

              return (
                <div key={m.id} className="flex gap-4 p-4 rounded-xl border border-dark-600/30 bg-dark-800/20 hover:bg-dark-700/50 transition-colors">
                  <div className={`w-12 h-12 rounded-xl ${movStyle.bg} flex items-center justify-center flex-shrink-0 text-2xl border ${movStyle.bg.replace('/15', '/30')}`}>
                    {movStyle.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${movStyle.bg} ${movStyle.text} border border-current`}>
                        {tipoMovLabels[m.tipo]}
                      </span>
                      <span className="text-white font-bold text-sm truncate">{m.modelo_nome}</span>
                      
                      {isLote ? (
                        <span className="px-2 py-0.5 text-[10px] bg-cyber-purple/20 text-cyber-purple font-bold rounded">({m.quantidade} em Lote)</span>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono bg-dark-900 px-2 py-0.5 rounded">[{m.numero_serie}]</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {m.destinatario_nome && (
                         <>
                          <HiOutlineUserGroup className="w-3.5 h-3.5 text-cyber-cyan" />
                          <span className="text-gray-300 font-medium">{m.destinatario_nome}</span>
                          <span className="text-dark-600">|</span>
                        </>
                      )}
                      <span className="opacity-70">Logado por</span> <span className="text-gray-400 font-medium">{m.usuario_nome}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col justify-center">
                    <p className="text-sm text-gray-300 font-bold">{dataStr}</p>
                    <p className="text-xs text-gray-600 font-medium">{horaStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <HiOutlineClipboardList className="w-12 h-12 mb-2 opacity-30" />
            <p>Histórico em branco</p>
          </div>
        )}
      </div>

      <QuickAddModal isOpen={quickModal} onClose={() => setQuickModal(false)} onSuccess={loadData} />
    </div>
  );
}
