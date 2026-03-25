import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineX, HiOutlineCheck, HiOutlineChevronRight, HiOutlineChevronLeft,
  HiOutlineCube, HiOutlineServer, HiOutlineUserGroup, HiOutlineLightningBolt,
  HiOutlinePlus, HiOutlineSearch
} from 'react-icons/hi';

const STEPS = [
  { id: 1, label: 'Equipamento', icon: HiOutlineCube, desc: 'Modelo do equipamento' },
  { id: 2, label: 'Patrimônio', icon: HiOutlineServer, desc: 'Identificação física' },
  { id: 3, label: 'Destinação', icon: HiOutlineUserGroup, desc: 'Para quem vai?' },
];

export default function QuickAddModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dados auxiliares
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);

  // Passo 1 — Modelo
  const [modeloMode, setModeloMode] = useState('existente'); // 'existente' | 'novo'
  const [modeloId, setModeloId] = useState('');
  const [modeloBusca, setModeloBusca] = useState('');
  const [novoModelo, setNovoModelo] = useState({ nome: '', marca: '', modelo: '', categoria_id: '', tipo: 'patrimonio', especificacoes: '' });

  // Passo 2 — Unidade
  const [unidade, setUnidade] = useState({ numero_serie: '', etiqueta_patrimonial: '', local: '', observacoes: '' });

  // Passo 3 — Destinação
  const [destinatarioId, setDestinatarioId] = useState('');
  const [destBusca, setDestBusca] = useState('');
  const [observacao, setObservacao] = useState('');
  const [semDestinacao, setSemDestinacao] = useState(false);

  // IDs criados durante o fluxo
  const [createdModeloId, setCreatedModeloId] = useState(null);
  const [createdUnidadeId, setCreatedUnidadeId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAux();
      resetAll();
    }
  }, [isOpen]);

  const loadAux = async () => {
    setLoading(true);
    try {
      const [m, c, d] = await Promise.all([
        api.get('/modelos', { params: { tipo: 'patrimonio' } }),
        api.get('/categorias'),
        api.get('/destinatarios'),
      ]);
      setModelos(m.data);
      setCategorias(c.data);
      setDestinatarios(d.data.filter(dd => dd.ativo));
    } catch {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setModeloMode('existente');
    setModeloId('');
    setModeloBusca('');
    setNovoModelo({ nome: '', marca: '', modelo: '', categoria_id: '', tipo: 'patrimonio', especificacoes: '' });
    setUnidade({ numero_serie: '', etiqueta_patrimonial: '', local: '', observacoes: '' });
    setDestinatarioId('');
    setDestBusca('');
    setObservacao('');
    setSemDestinacao(false);
    setCreatedModeloId(null);
    setCreatedUnidadeId(null);
  };

  // ─── Filtros de busca ───────────────────────────────────────────────────────
  const modelosFiltrados = modelos.filter(m =>
    !modeloBusca ||
    m.nome.toLowerCase().includes(modeloBusca.toLowerCase()) ||
    m.marca?.toLowerCase().includes(modeloBusca.toLowerCase()) ||
    m.modelo?.toLowerCase().includes(modeloBusca.toLowerCase())
  );

  const destFiltrados = destinatarios.filter(d =>
    !destBusca ||
    d.nome_completo.toLowerCase().includes(destBusca.toLowerCase()) ||
    d.setor?.toLowerCase().includes(destBusca.toLowerCase())
  );

  // ─── Validações por passo ───────────────────────────────────────────────────
  const canAdvanceStep1 = () => {
    if (modeloMode === 'existente') return !!modeloId;
    return !!(novoModelo.nome && novoModelo.marca && novoModelo.categoria_id);
  };

  const canAdvanceStep2 = () => {
    // Pelo menos um identificador
    return !!(unidade.numero_serie || unidade.etiqueta_patrimonial);
  };

  const canFinish = () => {
    return semDestinacao || !!destinatarioId;
  };

  // ─── Navegação ──────────────────────────────────────────────────────────────
  const goNext = async () => {
    if (step === 1) {
      if (!canAdvanceStep1()) {
        toast.error(modeloMode === 'existente' ? 'Selecione um modelo.' : 'Preencha nome, marca e categoria.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!canAdvanceStep2()) {
        toast.error('Informe pelo menos o Nº de Série ou a Etiqueta Patrimonial.');
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // ─── Finalizar ──────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (!canFinish()) {
      toast.error('Selecione um destinatário ou marque "Apenas registrar no estoque".');
      return;
    }

    setSaving(true);
    try {
      // PASSO 1: Criar modelo se necessário
      let finalModeloId = modeloId;
      if (modeloMode === 'novo') {
        const res = await api.post('/modelos', { ...novoModelo, tipo: 'patrimonio' });
        finalModeloId = res.data.id;
        setCreatedModeloId(res.data.id);
      }

      // PASSO 2: Criar unidade (patrimônio)
      const resUnidade = await api.post('/unidades', {
        modelo_id: finalModeloId,
        ...unidade,
      });
      const unidadeId = resUnidade.data.id;
      setCreatedUnidadeId(unidadeId);

      // PASSO 3a: Registrar entrada
      await api.post('/movimentacoes/entrada', {
        modelo_id: finalModeloId,
        unidade_id: unidadeId,
        observacao: observacao || 'Cadastro via Entrada Rápida',
      });

      // PASSO 3b: Registrar entrega ao destinatário (se houver)
      if (!semDestinacao && destinatarioId) {
        await api.post('/movimentacoes/entrega', {
          modelo_id: finalModeloId,
          unidade_id: unidadeId,
          destinatario_id: destinatarioId,
          observacao: observacao || 'Entrega via Entrada Rápida',
        });
      }

      const modeloNome = modeloMode === 'novo'
        ? novoModelo.nome
        : modelos.find(m => m.id == modeloId)?.nome || 'Equipamento';

      const destNome = semDestinacao
        ? 'estoque (disponível)'
        : destinatarios.find(d => d.id == destinatarioId)?.nome_completo || '';

      toast.success(
        semDestinacao
          ? `✅ ${modeloNome} cadastrado e disponível no estoque!`
          : `✅ ${modeloNome} entregue para ${destNome}!`,
        { duration: 4000 }
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar. Verifique os dados.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedModelo = modelos.find(m => m.id == modeloId);
  const selectedDest = destinatarios.find(d => d.id == destinatarioId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600 bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-blue flex items-center justify-center">
              <HiOutlineLightningBolt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Entrada Rápida</h2>
              <p className="text-xs text-gray-500">Cadastre e destine um equipamento em 3 passos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Progress Steps ── */}
        <div className="px-6 py-4 bg-dark-900/30 border-b border-dark-600/50">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone ? 'bg-cyber-green border-cyber-green' :
                      isActive ? 'bg-cyber-cyan/20 border-cyber-cyan' :
                      'bg-dark-700 border-dark-500'
                    }`}>
                      {isDone
                        ? <HiOutlineCheck className="w-5 h-5 text-white" />
                        : <Icon className={`w-5 h-5 ${isActive ? 'text-cyber-cyan' : 'text-gray-500'}`} />
                      }
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-cyber-cyan' : isDone ? 'text-cyber-green' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-gray-600 hidden sm:block">{s.desc}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all ${step > s.id ? 'bg-cyber-green' : 'bg-dark-600'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 min-h-[320px]">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ═══ PASSO 1: MODELO ═══ */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Toggle existente / novo */}
                  <div className="flex gap-2 p-1 bg-dark-900 rounded-xl">
                    <button
                      onClick={() => setModeloMode('existente')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${modeloMode === 'existente' ? 'bg-cyber-cyan text-dark-900' : 'text-gray-400 hover:text-white'}`}
                    >
                      Modelo Existente
                    </button>
                    <button
                      onClick={() => setModeloMode('novo')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${modeloMode === 'novo' ? 'bg-cyber-cyan text-dark-900' : 'text-gray-400 hover:text-white'}`}
                    >
                      <HiOutlinePlus className="w-4 h-4 inline mr-1" />Novo Modelo
                    </button>
                  </div>

                  {modeloMode === 'existente' ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          value={modeloBusca}
                          onChange={e => setModeloBusca(e.target.value)}
                          className="input-field pl-9"
                          placeholder="Buscar modelo por nome, marca..."
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                        {modelosFiltrados.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-6">Nenhum modelo encontrado. Crie um novo acima.</p>
                        ) : modelosFiltrados.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setModeloId(m.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                              modeloId == m.id
                                ? 'border-cyber-cyan bg-cyber-cyan/10 text-white'
                                : 'border-dark-600 bg-dark-700/50 text-gray-300 hover:border-dark-500 hover:bg-dark-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">{m.nome}</p>
                                <p className="text-xs text-gray-500">{m.marca} {m.modelo} {m.categoria_nome ? `· ${m.categoria_nome}` : ''}</p>
                              </div>
                              {modeloId == m.id && <HiOutlineCheck className="w-5 h-5 text-cyber-cyan flex-shrink-0" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Nome do Equipamento *</label>
                          <input value={novoModelo.nome} onChange={e => setNovoModelo({...novoModelo, nome: e.target.value})} className="input-field" placeholder="Ex: Notebook Dell" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Marca *</label>
                          <input value={novoModelo.marca} onChange={e => setNovoModelo({...novoModelo, marca: e.target.value})} className="input-field" placeholder="Ex: Dell" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Modelo / Part Number</label>
                          <input value={novoModelo.modelo} onChange={e => setNovoModelo({...novoModelo, modelo: e.target.value})} className="input-field" placeholder="Ex: Latitude 5420" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Categoria *</label>
                          <select value={novoModelo.categoria_id} onChange={e => setNovoModelo({...novoModelo, categoria_id: e.target.value})} className="select-field">
                            <option value="">Selecione...</option>
                            {categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}{c.subcategoria ? ` / ${c.subcategoria}` : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Especificações</label>
                        <input value={novoModelo.especificacoes} onChange={e => setNovoModelo({...novoModelo, especificacoes: e.target.value})} className="input-field" placeholder="Ex: i5, 16GB RAM, 512GB SSD" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ PASSO 2: UNIDADE ═══ */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-xl text-sm text-gray-400">
                    <span className="text-cyber-cyan font-semibold">Equipamento: </span>
                    {modeloMode === 'existente'
                      ? `${selectedModelo?.nome} — ${selectedModelo?.marca} ${selectedModelo?.modelo || ''}`
                      : `${novoModelo.nome} — ${novoModelo.marca} ${novoModelo.modelo || ''}`
                    }
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Número de Série</label>
                      <input
                        value={unidade.numero_serie}
                        onChange={e => setUnidade({...unidade, numero_serie: e.target.value})}
                        className="input-field"
                        placeholder="SN123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Etiqueta Patrimonial</label>
                      <input
                        value={unidade.etiqueta_patrimonial}
                        onChange={e => setUnidade({...unidade, etiqueta_patrimonial: e.target.value})}
                        className="input-field"
                        placeholder="PAT-00123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Local / Sala</label>
                    <input
                      value={unidade.local}
                      onChange={e => setUnidade({...unidade, local: e.target.value})}
                      className="input-field"
                      placeholder="Ex: Sala 201, Filial SP"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Observações do equipamento</label>
                    <textarea
                      value={unidade.observacoes}
                      onChange={e => setUnidade({...unidade, observacoes: e.target.value})}
                      className="input-field h-16 resize-none"
                      placeholder="Estado de conservação, acessórios inclusos..."
                    />
                  </div>

                  <p className="text-xs text-gray-600">* Informe pelo menos um dos identificadores (Nº Série ou Etiqueta).</p>
                </div>
              )}

              {/* ═══ PASSO 3: DESTINAÇÃO ═══ */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="p-3 bg-dark-700/50 border border-dark-600 rounded-xl text-sm space-y-1">
                    <div className="flex gap-2 text-gray-400">
                      <span className="text-cyber-cyan font-semibold w-24">Equipamento:</span>
                      <span>{modeloMode === 'existente' ? selectedModelo?.nome : novoModelo.nome}</span>
                    </div>
                    <div className="flex gap-2 text-gray-400">
                      <span className="text-cyber-cyan font-semibold w-24">Identificação:</span>
                      <span>{unidade.numero_serie || unidade.etiqueta_patrimonial}</span>
                    </div>
                  </div>

                  {/* Toggle: destinar ou apenas registrar */}
                  <div
                    onClick={() => setSemDestinacao(!semDestinacao)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${semDestinacao ? 'border-cyber-yellow/50 bg-cyber-yellow/5' : 'border-dark-600 bg-dark-700/30 hover:border-dark-500'}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${semDestinacao ? 'bg-cyber-yellow border-cyber-yellow' : 'border-gray-500'}`}>
                      {semDestinacao && <HiOutlineCheck className="w-3 h-3 text-dark-900" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">Apenas registrar no estoque (sem destinatário)</p>
                      <p className="text-xs text-gray-500">O equipamento ficará com status "Disponível"</p>
                    </div>
                  </div>

                  {!semDestinacao && (
                    <>
                      <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          value={destBusca}
                          onChange={e => setDestBusca(e.target.value)}
                          className="input-field pl-9"
                          placeholder="Buscar destinatário por nome ou setor..."
                        />
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                        {destFiltrados.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">Nenhum destinatário encontrado.</p>
                        ) : destFiltrados.map(d => (
                          <button
                            key={d.id}
                            onClick={() => setDestinatarioId(d.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                              destinatarioId == d.id
                                ? 'border-cyber-cyan bg-cyber-cyan/10 text-white'
                                : 'border-dark-600 bg-dark-700/50 text-gray-300 hover:border-dark-500 hover:bg-dark-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">{d.nome_completo}</p>
                                {d.setor && <p className="text-xs text-gray-500">{d.setor}{d.filial ? ` · ${d.filial}` : ''}</p>}
                              </div>
                              {destinatarioId == d.id && <HiOutlineCheck className="w-5 h-5 text-cyber-cyan flex-shrink-0" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Observação da movimentação</label>
                    <input
                      value={observacao}
                      onChange={e => setObservacao(e.target.value)}
                      className="input-field"
                      placeholder="Ex: Equipamento novo para colaborador recém-contratado"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-dark-600 bg-dark-900/30 flex items-center justify-between gap-3">
          <button
            onClick={step === 1 ? onClose : goBack}
            className="btn-secondary flex items-center gap-2 px-5"
            disabled={saving}
          >
            {step === 1 ? (
              <>Cancelar</>
            ) : (
              <><HiOutlineChevronLeft className="w-4 h-4" /> Voltar</>
            )}
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${
                  step === s.id ? 'w-8 bg-cyber-cyan' :
                  step > s.id ? 'w-4 bg-cyber-green' :
                  'w-4 bg-dark-600'
                }`}
              />
            ))}
          </div>

          {step < 3 ? (
            <button
              onClick={goNext}
              className="btn-primary flex items-center gap-2 px-5"
              disabled={loading}
            >
              Próximo <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-primary flex items-center gap-2 px-5 bg-gradient-to-r from-cyber-cyan to-cyber-blue"
              disabled={saving || !canFinish()}
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
              ) : (
                <><HiOutlineCheck className="w-4 h-4" /> Confirmar</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
