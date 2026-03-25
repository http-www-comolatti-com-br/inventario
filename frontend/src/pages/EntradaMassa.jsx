import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  HiOutlineCube, 
  HiOutlineHashtag, 
  HiOutlineSave, 
  HiOutlineArrowLeft, 
  HiOutlineInformationCircle,
  HiOutlineCollection,
  HiOutlinePlusCircle
} from 'react-icons/hi';

export default function EntradaMassa() {
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(true);
  
  const [form, setForm] = useState({
    modelo_id: '',
    seriais: [], // Agora um array de strings
    quantidade: '',
    observacao: ''
  });

  useEffect(() => {
    loadModelos();
  }, []);

  const loadModelos = async () => {
    try {
      const res = await api.get('/modelos');
      setModelos(res.data);
    } catch (err) {
      toast.error('Erro ao carregar modelos.');
    } finally {
      setLoadingModelos(false);
    }
  };

  const selectedModelo = modelos.find(m => m.id == form.modelo_id);
  const isPatrimonio = selectedModelo?.tipo === 'patrimonio';

  // Ajusta o array de seriais quando a quantidade muda
  const handleQuantidadeChange = (val) => {
    const qty = parseInt(val) || 0;
    setForm(prev => {
      let newSeriais = [...prev.seriais];
      if (qty > prev.seriais.length) {
        const diff = qty - prev.seriais.length;
        newSeriais = [...newSeriais, ...Array(diff).fill('')];
      } else if (qty < prev.seriais.length) {
        newSeriais = newSeriais.slice(0, qty);
      }
      return { ...prev, quantidade: val, seriais: newSeriais };
    });
  };

  const handleSerialChange = (index, value) => {
    const newSeriais = [...form.seriais];
    newSeriais[index] = value;
    setForm({ ...form, seriais: newSeriais });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.modelo_id) return toast.error('Selecione um modelo.');
    if (!form.quantidade || form.quantidade <= 0) return toast.error('Informe uma quantidade válida.');
    
    setLoading(true);
    try {
      const payload = {
        modelo_id: form.modelo_id,
        observacao: form.observacao,
        tipo: selectedModelo.tipo
      };

      if (isPatrimonio) {
        const listaSeriais = form.seriais.map(s => s.trim()).filter(s => s !== '');
        
        if (listaSeriais.length < parseInt(form.quantidade)) {
          setLoading(false);
          return toast.error(`Por favor, preencha todos os ${form.quantidade} números de série.`);
        }
        payload.seriais = listaSeriais;
      } else {
        payload.quantidade = parseInt(form.quantidade);
      }

      await api.post('/movimentacoes/entrada-massa', payload);
      toast.success('Entrada em massa realizada com sucesso!');
      navigate('/movimentacoes');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar entrada em massa.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingModelos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-dark-800 border border-dark-600 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Entrada em Massa</h1>
          <p className="text-gray-500 text-sm">Registro rápido de equipamentos e periféricos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-dark-800/50 backdrop-blur-md border border-dark-600/50 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Seleção de Modelo */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <HiOutlineCube className="w-4 h-4 text-cyber-cyan" />
                Modelo do Equipamento / Periférico
              </label>
              <select
                value={form.modelo_id}
                onChange={(e) => setForm({ ...form, modelo_id: e.target.value })}
                className="select-field text-base py-3"
                required
              >
                <option value="">Selecione o modelo desejado...</option>
                {modelos.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nome} | {m.marca} ({m.tipo === 'patrimonio' ? 'Patrimônio' : 'Consumível'})
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de Quantidade - Sempre Visível se houver modelo */}
            {form.modelo_id && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <HiOutlineCollection className="w-4 h-4 text-cyber-cyan" />
                  Quantidade de Itens
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.quantidade}
                    onChange={(e) => handleQuantidadeChange(e.target.value)}
                    className="input-field text-xl py-3 w-32 border-cyber-cyan/30 focus:border-cyber-cyan font-bold text-cyber-cyan"
                    placeholder="0"
                    required
                  />
                  <span className="text-gray-500 text-sm italic">
                    {isPatrimonio ? 'unidades individuais com rastreio' : 'itens para somar ao estoque'}
                  </span>
                </div>
              </div>
            )}

            {/* Listagem de Seriais Dinâmica */}
            {isPatrimonio && form.quantidade > 0 && (
              <div className="space-y-4 pt-4 border-t border-dark-600/50 animate-in fade-in duration-500">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <HiOutlineHashtag className="w-4 h-4 text-cyber-cyan" />
                  Números de Série por Unidade
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {form.seriais.map((serial, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold px-1">Item {index + 1}</p>
                      <input
                        type="text"
                        value={serial}
                        onChange={(e) => handleSerialChange(index, e.target.value)}
                        className="input-field text-sm py-2 border-dark-600 focus:border-cyber-cyan/50"
                        placeholder={`Série do ${index + 1}º item`}
                        required={isPatrimonio}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Observações (Opcional)</label>
              <textarea
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                className="input-field h-24 text-sm"
                placeholder="Ex: NF 1234, Lote de renovação, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.modelo_id || !form.quantidade}
              className={`w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-cyber-cyan/10 transition-all ${loading || !form.modelo_id || !form.quantidade ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <HiOutlineSave className="w-6 h-6" />
                  Confirmar Entrada de {form.quantidade || 0} Itens
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {selectedModelo && (
            <div className="bg-cyber-cyan/5 border border-cyber-cyan/20 rounded-2xl p-6 space-y-3 animate-in slide-in-from-right-4 shadow-lg shadow-cyber-cyan/5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-cyber-cyan font-bold">Resumo do Lote</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPatrimonio ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30' : 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30'}`}>
                  {selectedModelo.tipo}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white leading-tight">{selectedModelo.nome}</h4>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyber-cyan/10">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Marca</p>
                  <p className="text-sm text-gray-300 font-medium">{selectedModelo.marca || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Modelo</p>
                  <p className="text-sm text-gray-300 font-medium">{selectedModelo.modelo || '—'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-dark-800/80 border border-dark-600/50 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="flex items-center gap-2 font-bold text-gray-200">
              <HiOutlineInformationCircle className="w-5 h-5 text-cyber-cyan" />
              Entrada Inteligente
            </h3>
            <ul className="space-y-4 text-xs text-gray-400 leading-relaxed">
              <li className="flex gap-3">
                <HiOutlinePlusCircle className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
                <span>Informe a <b>quantidade total</b> primeiro. O sistema criará os campos necessários automaticamente.</span>
              </li>
              <li className="flex gap-3">
                <HiOutlineHashtag className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
                <span>Para patrimônios, preencha cada número de série para garantir o rastreio individual e futuro inventário.</span>
              </li>
              <li className="flex gap-3">
                <HiOutlineCollection className="w-5 h-5 text-cyber-cyan flex-shrink-0" />
                <span>Itens de estoque (mouses, teclados) apenas incrementam o saldo total, sem necessidade de serial.</span>
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
