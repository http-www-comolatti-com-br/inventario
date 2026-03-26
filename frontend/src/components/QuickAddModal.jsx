import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineX, HiOutlineCheck, HiOutlineChevronRight, HiOutlineArchive,
  HiOutlinePlus, HiOutlineSearch, HiOutlineArrowRight, HiOutlineSwitchHorizontal,
  HiOutlineCog, HiOutlineXCircle, HiOutlineLightningBolt, HiOutlineUserGroup
} from 'react-icons/hi';

const INTENCOES = [
  { id: 'entrada', label: 'Nova Entrada', desc: 'Cadastrar e estocar compras', icon: HiOutlinePlus, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'entrega', label: 'Entregar Base', desc: 'Tirar da prateleira e dar posse', icon: HiOutlineArrowRight, text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'devolucao', label: 'Devolver', desc: 'Retornar equipamento ao estoque', icon: HiOutlineSwitchHorizontal, text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  { id: 'transferencia', label: 'Transferir', desc: 'Passar de um usuário para outro', icon: HiOutlineUserGroup, text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { id: 'manutencao', label: 'Manutenção', desc: 'Mandar para reparo/conserto', icon: HiOutlineCog, text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'baixa', label: 'Descarte', desc: 'Descartar lixo ou sucata', icon: HiOutlineXCircle, text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
];

export default function QuickAddModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data Global
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // ====== PASSO 1: INTENÇÃO ======
  const [intencao, setIntencao] = useState('');

  // ====== PASSO 2: BUSCA / SELEÇÃO ======
  const [moverType, setMoverType] = useState('patrimonio'); // 'patrimonio' | 'consumivel'
  const [busca, setBusca] = useState('');
  
  // Se intencao === 'entrada'
  const [modeloMode, setModeloMode] = useState('existente'); // 'existente' | 'novo'
  const [novoModelo, setNovoModelo] = useState({ nome: '', marca: '', modelo: '', categoria_id: '', tipo: 'patrimonio' });

  // Seleções Finais
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState(''); // Comum a todos se consumível ou nova entrada
  const [unidadeSelecionadaId, setUnidadeSelecionadaId] = useState(''); // Se for patrimônio já existente

  // ====== PASSO 3: COMPLEMENTO & CONFIRMAÇÃO ======
  const [quantidade, setQuantidade] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [destinatarioId, setDestinatarioId] = useState('');
  const [entregarDireto, setEntregarDireto] = useState(false); // Para "entrada"
  const [observacao, setObservacao] = useState('');

  // Auxiliares de visualização do passo 3
  const [destBusca, setDestBusca] = useState('');

  useEffect(() => {
    if (isOpen) { loadAux(); resetAll(); }
  }, [isOpen]);

  const loadAux = async () => {
    setLoading(true);
    try {
      const [m, c, d, u] = await Promise.all([
        api.get('/modelos', { params: { ativo: true } }),
        api.get('/categorias'),
        api.get('/destinatarios'),
        api.get('/unidades')
      ]);
      setModelos(m.data); setCategorias(c.data);
      setDestinatarios(d.data.filter(dd => dd.ativo));
      // Filtramos baixados no front pois algumas intenções (manutencao -> baixa) precisam ver
      setUnidades(u.data);
    } catch {
      toast.error('Erro ao carregar banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setIntencao('');
    setMoverType('patrimonio');
    setBusca('');
    setModeloMode('existente');
    setNovoModelo({ nome: '', marca: '', modelo: '', categoria_id: '', tipo: 'patrimonio' });
    setModeloSelecionadoId('');
    setUnidadeSelecionadaId('');
    setQuantidade('');
    setNumeroSerie('');
    setEtiqueta('');
    setDestinatarioId('');
    setEntregarDireto(false);
    setObservacao('');
    setDestBusca('');
  };

  // Objetos Ativos
  const activeIntencaoObj = INTENCOES.find(i => i.id === intencao);
  const activeUnidade = unidades.find(u => u.id === unidadeSelecionadaId);
  const activeModelo = modelos.find(m => m.id === parseInt(modeloSelecionadoId));

  // O item atual sendo operado é consumível?
  let isConsumivel = false;
  if (intencao === 'entrada') {
    isConsumivel = modeloMode === 'existente' ? activeModelo?.tipo === 'consumivel' : novoModelo.tipo === 'consumivel';
  } else {
    isConsumivel = (moverType === 'consumivel');
  }

  // ====== FILTROS DA ETAPA 2 ======
  const modelosFiltrados = modelos.filter(m =>
    !busca || m.nome.toLowerCase().includes(busca.toLowerCase()) || m.marca?.toLowerCase().includes(busca.toLowerCase())
  );

  const modelosConsumiveisMovimentacao = modelos.filter(m => m.tipo === 'consumivel').filter(m =>
    !busca || m.nome.toLowerCase().includes(busca.toLowerCase()) || m.marca?.toLowerCase().includes(busca.toLowerCase())
  );

  const unidadesParaAcao = unidades.filter(u => {
    if (u.status === 'baixado' && intencao !== 'entrada') return false; // Nenhuma ação toca em lixo

    if (intencao === 'entrega') return u.status === 'disponivel' || u.status === 'manutencao';
    if (intencao === 'devolucao') return u.status === 'em_uso' || u.status === 'manutencao';
    if (intencao === 'transferencia') return u.status === 'em_uso';
    if (intencao === 'manutencao') return u.status === 'disponivel' || u.status === 'em_uso';
    if (intencao === 'baixa') return u.status !== 'baixado';
    return true;
  }).filter(u =>
    !busca || 
    (u.numero_serie && u.numero_serie.toLowerCase().includes(busca.toLowerCase())) ||
    (u.etiqueta_patrimonial && u.etiqueta_patrimonial.toLowerCase().includes(busca.toLowerCase())) ||
    u.modelo_nome.toLowerCase().includes(busca.toLowerCase()) ||
    (u.destinatario_nome && u.destinatario_nome.toLowerCase().includes(busca.toLowerCase()))
  );

  const destFiltrados = destinatarios.filter(d =>
    !destBusca || d.nome_completo.toLowerCase().includes(destBusca.toLowerCase()) || d.setor?.toLowerCase().includes(destBusca.toLowerCase())
  );


  // ====== NAVEGAÇÃO ======
  const STEPS = [
    { id: 1, label: 'Intenção', desc: 'O que fazer?' },
    { id: 2, label: 'Alvo', desc: 'Item a operar' },
    { id: 3, label: 'Ação', desc: 'Destino/Conclusão' }
  ];

  const goNext = () => {
    // Validações Step 1
    if (step === 1 && !intencao) return toast.error('Escolha uma ação.');

    // Validações Step 2
    if (step === 2) {
      if (intencao === 'entrada') {
        if (modeloMode === 'existente' && !modeloSelecionadoId) return toast.error('Selecione um modelo da lista.');
        if (modeloMode === 'novo' && (!novoModelo.nome || !novoModelo.marca || !novoModelo.categoria_id)) return toast.error('Preencha os campos obrigatórios do novo modelo.');
      } else {
        if (moverType === 'patrimonio' && !unidadeSelecionadaId) return toast.error('Selecione qual equipamento físico sofrerá a ação.');
        if (moverType === 'consumivel' && !modeloSelecionadoId) return toast.error('Selecione qual lote consumível sofrerá a ação.');
      }
    }
    setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // ====== SUBMISSÃO ======
  const handleFinish = async () => {
    // Validações Finais
    if (isConsumivel && (!quantidade || parseInt(quantidade) <= 0)) {
      return toast.error('Para consumíveis, informe uma quantidade válida maior que zero.');
    }
    if (intencao === 'entrada' && !isConsumivel && !numeroSerie) return toast.error('Série obrigatória para patrimônios físicos em entrada.');
    if (['entrega', 'transferencia'].includes(intencao) && !destinatarioId) return toast.error('Destinatário obrigatório para esta ação.');
    if (intencao === 'entrada' && entregarDireto && !destinatarioId) return toast.error('Selecione para quem entregar o equipamento.');
    if (intencao === 'baixa' && !observacao) return toast.error('O Motivo/Observação é OBRIGATÓRIO para dar Baixa (Exclusão) em sistema.');

    setSaving(true);
    try {
      let runModeloId = modeloSelecionadoId;

      // Se for Entrada de Novo Cadastro
      if (intencao === 'entrada' && modeloMode === 'novo') {
        const resMod = await api.post('/modelos', { ...novoModelo });
        runModeloId = resMod.data.id;
      }

      // 1. FLUXO: ENTRADA
      if (intencao === 'entrada') {
        if (isConsumivel) {
          await api.post('/movimentacoes/entrada', {
            modelo_id: runModeloId, quantidade: parseInt(quantidade), observacao: observacao || undefined
          });
          if (entregarDireto && destinatarioId) {
             await api.post('/movimentacoes/entrega', {
              modelo_id: runModeloId, quantidade: parseInt(quantidade), destinatario_id: destinatarioId, observacao: 'Ação Rápida: Entrada e já Entregue'
            });
          }
          toast.success(entregarDireto ? 'Lote cadastrado e transferido!' : 'Lote abastecido!');
        } else {
          // Unidade Patrimonial
          const resUnidade = await api.post('/unidades', { modelo_id: runModeloId, numero_serie: numeroSerie, etiqueta_patrimonial: etiqueta });
          const newId = resUnidade.data.id;
          await api.post('/movimentacoes/entrada', {
            modelo_id: runModeloId, unidade_id: newId, observacao: observacao || undefined
          });
          if (entregarDireto && destinatarioId) {
            await api.post('/movimentacoes/entrega', {
              modelo_id: runModeloId, unidade_id: newId, destinatario_id: destinatarioId, observacao: 'Ação Rápida: Cadastro e Entrega simultânea'
            });
          }
          toast.success('Patrimônio registrado' + (entregarDireto ? ' e entregue!' : '!'));
        }
      } 
      // 2. FLUXOS DE MOVIMENTAÇÃO (Entrega, Devolução, Transferência, Manutenção, Baixa)
      else {
        const payload = { observacao: observacao || undefined };
        
        if (moverType === 'consumivel') {
          payload.modelo_id = modeloSelecionadoId;
          payload.quantidade = parseInt(quantidade);
        } else {
          payload.modelo_id = activeUnidade.modelo_id;
          payload.unidade_id = unidadeSelecionadaId;
        }

        if (intencao === 'entrega' || intencao === 'transferencia') payload.destinatario_id = destinatarioId;

        // Disparo exato para rota do node
        await api.post(`/movimentacoes/${intencao}`, payload);
        toast.success(`Ação de ${activeIntencaoObj.label} registrada com sucesso!`);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar movimentação.');
    } finally {
      setSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-dark-800 border-2 border-dark-600 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-600 bg-dark-900 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple" />
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-lg ${step === 1 ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan' : activeIntencaoObj?.bg + ' ' + activeIntencaoObj?.border + ' ' + activeIntencaoObj?.text}`}>
              {step === 1 ? <HiOutlineLightningBolt className="w-6 h-6" /> : <activeIntencaoObj.icon className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-white font-black text-xl leading-tight">
                {step === 1 ? 'Ação Rápida' : activeIntencaoObj?.label}
              </h2>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
                {step === 1 ? 'Hub Central de Tarefas' : activeIntencaoObj?.desc}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-600 text-gray-500 hover:text-white transition-colors">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* PROGRESS TABS */}
        <div className="flex border-b border-dark-600 bg-dark-900/50 flex-shrink-0">
          {STEPS.map((s, idx) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className={`flex-1 py-3 text-center border-b-2 transition-all ${isActive ? 'border-cyber-cyan bg-cyber-cyan/5' : isDone ? 'border-cyber-cyan/30 text-gray-300' : 'border-transparent text-gray-600'}`}>
                <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-cyber-cyan' : ''}`}>Passo {s.id}</p>
                <p className="text-[10px] mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* BODY */}
        <div className="px-6 py-6 flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-48"><div className="w-10 h-10 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" /></div>
          ) : (
            <div className="w-full">
              
              {/* ================= PASSO 1 ================= */}
              {step === 1 && (
                <div className="animate-fadeIn">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">O que você deseja fazer agora?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {INTENCOES.map(i => (
                      <button
                        key={i.id}
                        onClick={() => { setIntencao(i.id); setStep(2); }}
                        className={`text-left p-4 rounded-2xl border-2 transition-all hover:scale-[1.03] group ${i.bg} ${i.border} hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
                      >
                        <i.icon className={`w-8 h-8 ${i.text} mb-3 group-hover:scale-110 transition-transform`} />
                        <p className="font-bold text-white text-base">{i.label}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{i.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= PASSO 2 ================= */}
              {step === 2 && (
                <div className="animate-fadeIn space-y-5">
                  
                  {/* FLUXO DE ENTRADA (Compra) */}
                  {intencao === 'entrada' ? (
                    <>
                      <div className="flex bg-dark-900 rounded-xl p-1 border border-dark-600 shadow-inner">
                        <button onClick={() => setModeloMode('existente')} className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${modeloMode === 'existente' ? 'bg-dark-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Selecionar Modelo Criado</button>
                        <button onClick={() => setModeloMode('novo')} className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${modeloMode === 'novo' ? 'bg-dark-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Adicionar Modelo Inédito</button>
                      </div>

                      {modeloMode === 'existente' ? (
                         <div className="space-y-3">
                           <div className="relative">
                             <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                             <input value={busca} onChange={e => setBusca(e.target.value)} className="input-field pl-10 h-12 bg-dark-900" placeholder="Buscar televisores, mouses, notebooks..." autoFocus/>
                           </div>
                           <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                             {modelosFiltrados.map(m => (
                               <button key={m.id} onClick={() => setModeloSelecionadoId(m.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${modeloSelecionadoId == m.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-dark-600 bg-dark-800 hover:border-dark-500'}`}>
                                  <div>
                                    <div className="flex gap-2 items-center mb-1">
                                      <p className={`font-bold text-sm ${modeloSelecionadoId == m.id ? 'text-emerald-400' : 'text-white'}`}>{m.nome}</p>
                                      <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded ${m.tipo === 'patrimonio' ? 'bg-cyber-blue/20 text-cyber-blue' : 'bg-cyber-purple/20 text-cyber-purple'}`}>{m.tipo === 'patrimonio' ? 'Série Única' : 'Lote'}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{m.marca} • {m.modelo}</p>
                                  </div>
                                  {modeloSelecionadoId == m.id && <HiOutlineCheck className="w-6 h-6 text-emerald-500" />}
                               </button>
                             ))}
                           </div>
                         </div>
                      ) : (
                        <div className="p-6 border-2 border-dark-600 bg-dark-900 rounded-2xl space-y-5">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Natureza Física *</label>
                            <select value={novoModelo.tipo} onChange={e => setNovoModelo({ ...novoModelo, tipo: e.target.value })} className="select-field h-12">
                              <option value="patrimonio">Item Único Rastreado (Pede Série)</option>
                              <option value="consumivel">Consumível Agrupado (Pede Apenas Quantidade)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Nome Geral *</label>
                            <input value={novoModelo.nome} onChange={e => setNovoModelo({ ...novoModelo, nome: e.target.value })} className="input-field h-12" placeholder="Ex: Monitor UltraWide Gaming" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Marca *</label><input value={novoModelo.marca} onChange={e => setNovoModelo({ ...novoModelo, marca: e.target.value })} className="input-field h-12" placeholder="Ex: Dell" /></div>
                            <div><label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Ref/Modelo</label><input value={novoModelo.modelo} onChange={e => setNovoModelo({ ...novoModelo, modelo: e.target.value })} className="input-field h-12" placeholder="Ex: P2719H" /></div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Categoria *</label>
                            <select value={novoModelo.categoria_id} onChange={e => setNovoModelo({ ...novoModelo, categoria_id: e.target.value })} className="select-field h-12">
                              <option value="">Selecione de onde isso pertence...</option>
                              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome} {c.subcategoria ? `> ${c.subcategoria}`: ''}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // FLUXO DE PESQUISA RESTRITA PARA TRANSFERENCIAS, DEVOLUCOES, MANUTENCAO ETC
                    <>
                      <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Selecione o Item para {activeIntencaoObj.label}</h3>
                      
                      {/* Mostrar Toggle apenas se a Intenção permitir uso de Lotes Consumíveis (Entrega, Devolucao, Baixa) */}
                      {['entrega', 'devolucao', 'baixa'].includes(intencao) && (
                        <div className="flex bg-dark-900 rounded-xl p-1 border border-dark-600 shadow-inner mb-4">
                          <button onClick={() => setMoverType('patrimonio')} className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${moverType === 'patrimonio' ? 'bg-dark-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Ativos com Série</button>
                          <button onClick={() => setMoverType('consumivel')} className={`flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${moverType === 'consumivel' ? 'bg-dark-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Lotes Numéricos</button>
                        </div>
                      )}

                      <div className="relative mb-2">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input value={busca} onChange={e => setBusca(e.target.value)} className="input-field pl-10 h-14 bg-dark-900 border-dark-600 text-base" placeholder="Nome, Série, Etiqueta, Responsável..." autoFocus/>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {moverType === 'patrimonio' ? (
                          unidadesParaAcao.length === 0 ? <p className="text-center text-gray-500 py-8">Nenhum equipamento listável para esta operação.</p> :
                          unidadesParaAcao.map(u => (
                            <button key={u.id} onClick={() => setUnidadeSelecionadaId(u.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${unidadeSelecionadaId === u.id ? activeIntencaoObj.border + ' ' + activeIntencaoObj.bg : 'border-dark-600 bg-dark-800 hover:border-dark-500'}`}>
                               <div>
                                 <p className={`font-bold text-sm mb-1 ${unidadeSelecionadaId === u.id ? activeIntencaoObj.text : 'text-white'}`}>{u.modelo_nome}</p>
                                 <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-400">
                                   <span className="bg-dark-900 px-1.5 py-0.5 rounded">SN: {u.numero_serie}</span>
                                   {u.destinatario_nome && <span className="bg-dark-900 px-1.5 py-0.5 rounded flex items-center gap-1"><HiOutlineUserGroup/> {u.destinatario_nome}</span>}
                                 </div>
                               </div>
                               {unidadeSelecionadaId === u.id && <HiOutlineCheck className={`w-6 h-6 ${activeIntencaoObj.text}`} />}
                            </button>
                          ))
                        ) : (
                           modelosConsumiveisMovimentacao.length === 0 ? <p className="text-center text-gray-500 py-8">Nenhum lote consumível listável.</p> :
                           modelosConsumiveisMovimentacao.map(m => (
                              <button key={m.id} onClick={() => setModeloSelecionadoId(m.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${modeloSelecionadoId === m.id ? activeIntencaoObj.border + ' ' + activeIntencaoObj.bg : 'border-dark-600 bg-dark-800 hover:border-dark-500'}`}>
                               <div>
                                 <p className={`font-bold text-sm mb-1 ${modeloSelecionadoId === m.id ? activeIntencaoObj.text : 'text-white'}`}>{m.nome}</p>
                                 <p className="text-xs text-gray-400">{m.marca} • Consulte saldo na confirmação</p>
                               </div>
                               {modeloSelecionadoId === m.id && <HiOutlineCheck className={`w-6 h-6 ${activeIntencaoObj.text}`} />}
                            </button>
                           ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ================= PASSO 3 ================= */}
              {step === 3 && (
                <div className="animate-fadeIn space-y-6">
                  
                  {/* Banner do Item Selecionado */}
                  <div className={`p-4 rounded-2xl border ${activeIntencaoObj.bg} ${activeIntencaoObj.border} flex items-center gap-4`}>
                    <div className="w-12 h-12 bg-dark-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <HiOutlineArchive className={`w-6 h-6 ${activeIntencaoObj.text}`} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${activeIntencaoObj.text}`}>Item em Operação</p>
                      <p className="font-bold text-white text-base">
                        {intencao === 'entrada' 
                           ? (modeloMode === 'existente' ? activeModelo?.nome : novoModelo.nome) 
                           : (moverType === 'patrimonio' ? activeUnidade?.modelo_nome : activeModelo?.nome)
                        }
                      </p>
                      {moverType === 'patrimonio' && intencao !== 'entrada' && <p className="text-xs text-gray-400 font-mono mt-0.5">SN: {activeUnidade?.numero_serie}</p>}
                    </div>
                  </div>

                  {/* FORMULÁRIO DINÂMICO DE AÇÃO */}

                  {/* Quantidade Mágica (Aparece se for Consumível em Entrada, Entrega, Devolucao, Baixa) */}
                  {isConsumivel && (
                    <div className="bg-dark-900 border border-dark-600 rounded-2xl p-5">
                      <label className="block text-center text-sm font-bold text-white mb-3 tracking-wide">Qual a Quantidade (Números)? *</label>
                      <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} className={`w-full max-w-xs mx-auto block text-center input-field text-3xl font-black h-16 ${activeIntencaoObj.text} font-mono`} placeholder="Ex: 5" autoFocus />
                    </div>
                  )}

                  {/* Cadastro Físico Inicial (Só para Entradas -> Patrimonio) */}
                  {intencao === 'entrada' && !isConsumivel && (
                    <div className="bg-dark-900 border border-dark-600 rounded-2xl p-5 grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Entrada de Serial *</label>
                        <input value={numeroSerie} onChange={e => setNumeroSerie(e.target.value)} className="input-field h-12 text-lg font-mono text-emerald-400" placeholder="SN do Fabricante" autoFocus/>
                      </div>
                      <div className="col-span-2">
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tag Patrimonial (Opcional)</label>
                         <input value={etiqueta} onChange={e => setEtiqueta(e.target.value)} className="input-field h-12" placeholder="INV-204" />
                      </div>
                    </div>
                  )}

                  {/* Seção Destinatário (Para Entrada->Entrega, Entrega, Transferencia) */}
                  {intencao === 'entrada' && (
                    <div onClick={() => setEntregarDireto(!entregarDireto)} className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${entregarDireto ? 'border-cyber-cyan bg-cyber-cyan/10' : 'border-dark-600 bg-dark-900'}`}>
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${entregarDireto ? 'bg-cyber-cyan border-cyber-cyan' : 'border-gray-500'}`}>
                        {entregarDireto && <HiOutlineCheck className="w-3 h-3 text-dark-900 font-bold" />}
                      </div>
                      <p className={`font-semibold text-sm ${entregarDireto ? 'text-cyber-cyan' : 'text-gray-300'}`}>Não guardar. Já desejo entregar à um funcionário agora!</p>
                    </div>
                  )}

                  {(['entrega', 'transferencia'].includes(intencao) || (intencao === 'entrada' && entregarDireto)) && (
                    <div className="space-y-3">
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Para quem vai? *</label>
                       <div className="relative">
                          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input value={destBusca} onChange={e => setDestBusca(e.target.value)} className="input-field pl-10 h-12 bg-dark-900" placeholder="Buscar João, Maria, Vendas..." />
                       </div>
                       <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                         {destFiltrados.map(d => (
                           <button key={d.id} onClick={() => setDestinatarioId(d.id)} className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${destinatarioId === d.id ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan font-bold' : 'border-dark-600 bg-dark-800 hover:border-dark-500 text-gray-300'}`}>
                             {d.nome_completo}
                             {destinatarioId === d.id && <HiOutlineCheck className="w-5 h-5" />}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}

                  {/* Seção Observação / Motivo */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${intencao === 'baixa' ? 'text-red-400' : 'text-gray-400'}`}>
                      {intencao === 'baixa' ? 'Motivo do Descarte (Obrigatório) *' : 'Observação / Informação Extra / Ticket'}
                    </label>
                    <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows="2" className={`input-field bg-dark-900 p-3 resize-none ${intencao === 'baixa' && !observacao ? 'border-red-500/50 focus:border-red-500' : ''}`} placeholder="Descreva aqui o ticket do GLPI, motivo da quebra..." />
                  </div>

                </div>
              )}

            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-5 border-t border-dark-600 bg-dark-900 flex flex-shrink-0 items-center justify-between">
          <button onClick={step === 1 ? onClose : goBack} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-dark-600/50" disabled={saving}>
            {step === 1 ? 'Cancelar' : 'Voltar Passo'}
          </button>

          {step < STEPS.length ? (
            step > 1 && (
            <button onClick={goNext} className="btn-primary py-3 px-8 rounded-xl flex items-center gap-2 font-black tracking-wide text-sm" disabled={loading}>
              Prosseguir <HiOutlineChevronRight className="w-4 h-4" />
            </button>
            )
          ) : (
            <button onClick={handleFinish} className={`py-3 px-8 rounded-xl relative overflow-hidden group shadow-lg flex items-center gap-2 font-black tracking-wide text-sm transition-all hover:scale-105 text-white ${activeIntencaoObj.bg.replace('/10', '')} hover:brightness-110`} disabled={saving}>
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finalizando...</>
              ) : (
                <><HiOutlineCheck className="w-5 h-5" /> Confirmar Ação</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
