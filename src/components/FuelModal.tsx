import React, { useState, useEffect } from 'react';
import { X, Fuel, DollarSign, Calendar, Gauge, Tractor } from 'lucide-react';
import { Abastecimento, ConfiguracoesSistema, Maquina } from '../types';

interface FuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (abastecimento: Abastecimento) => void;
  config: ConfiguracoesSistema;
  maquinas: Maquina[];
  selectedMaquinaId: string;
}

export const FuelModal: React.FC<FuelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  config,
  maquinas,
  selectedMaquinaId,
}) => {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horimetro, setHorimetro] = useState<number>(config.horimetro_atual || 1000);
  const [tipoCombustivel, setTipoCombustivel] = useState<'Diesel S10' | 'Diesel S500' | 'Arla 32' | 'Óleo Hidráulico'>('Diesel S10');
  const [litros, setLitros] = useState<number>(100.0);
  const [precoLitro, setPrecoLitro] = useState<number>(6.19);
  const [valorTotal, setValorTotal] = useState<number>(619.0);
  const [postoFornecedor, setPostoFornecedor] = useState('Posto Trevo Petrobras');
  const [operador, setOperador] = useState('Jurandir');
  const [observacoes, setObservacoes] = useState('');
  const [maquinaId, setMaquinaId] = useState('maq-default');

  // Travar o scroll da página no fundo enquanto o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const activeMaq = maquinas.find(m => m.id === selectedMaquinaId) || maquinas[0];
    if (activeMaq && !isOpen) {
      setHorimetro(activeMaq.horimetro_atual);
      setMaquinaId(selectedMaquinaId === 'todas' ? (maquinas[0]?.id || 'maq-default') : selectedMaquinaId);
    }
  }, [isOpen, maquinas, selectedMaquinaId]);

  const handleLitrosChange = (val: number) => {
    setLitros(val);
    setValorTotal(Number((val * precoLitro).toFixed(2)));
  };

  const handlePrecoChange = (val: number) => {
    setPrecoLitro(val);
    setValorTotal(Number((litros * val).toFixed(2)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Abastecimento = {
      id: `abs-${Date.now()}`,
      maquina_id: maquinaId,
      data,
      horimetro: Number(horimetro),
      tipo_combustivel: tipoCombustivel,
      litros: Number(litros),
      preco_litro: Number(precoLitro),
      valor_total: Number(valorTotal),
      posto_fornecedor: postoFornecedor.trim(),
      operador: operador.trim(),
      observacoes: observacoes.trim(),
      created_at: new Date().toISOString(),
    };
    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">Registrar Abastecimento</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Controle de combustível (Diesel) da retroescavadeira.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs sm:text-sm">

            {/* Máquina Vinculada */}
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Máquina Vinculada *
              </label>
              <select
                value={maquinaId}
                onChange={(e) => setMaquinaId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
              >
                {maquinas.map((maq) => (
                  <option key={maq.id} value={maq.id}>
                    🚜 {maq.nome} ({maq.placa})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Data
                </label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Horímetro (h)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 1250.5"
                  value={horimetro}
                  onChange={(e) => setHorimetro(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">Litros de Diesel *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={litros}
                    onChange={(e) => handleLitrosChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold text-base focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">Preço por Litro (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoLitro}
                    onChange={(e) => handlePrecoChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold text-base focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorTotal}
                  onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-500/40 rounded-lg text-amber-600 dark:text-amber-400 font-mono font-bold text-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tipo de Combustível</label>
                <select
                  value={tipoCombustivel}
                  onChange={(e) => setTipoCombustivel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                >
                  <option value="Diesel S10">Diesel S10</option>
                  <option value="Diesel S500">Diesel S500</option>
                  <option value="Óleo Hidráulico">Óleo Hidráulico</option>
                  <option value="Arla 32">Arla 32</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Posto / Fornecedor</label>
                <input
                  type="text"
                  value={postoFornecedor}
                  onChange={(e) => setPostoFornecedor(e.target.value)}
                  placeholder="Ex: Posto Trevo Petrobras"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Observações</label>
              <input
                type="text"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Abastecido para o serviço da semana..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

          </div>

          {/* Footer (Fixed) */}
          <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-transform cursor-pointer"
            >
              Salvar Abastecimento
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
