import React, { useState, useEffect } from 'react';
import { X, Wrench, DollarSign, Calendar, Gauge, Tractor } from 'lucide-react';
import { Manutencao, TipoManutencao, ConfiguracoesSistema, Maquina } from '../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (manutencao: Manutencao) => void;
  manutencaoToEdit?: Manutencao | null;
  config: ConfiguracoesSistema;
  maquinas: Maquina[];
  selectedMaquinaId: string;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  manutencaoToEdit,
  config,
  maquinas,
  selectedMaquinaId,
}) => {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoManutencao>('troca_oleo');
  const [horimetroMomento, setHorimetroMomento] = useState<number>(config.horimetro_atual);
  const [proximaRevisaoHoras, setProximaRevisaoHoras] = useState<number>(config.horimetro_atual + 250);
  const [valorTotal, setValorTotal] = useState<number>(850.0);
  const [dataManutencao, setDataManutencao] = useState(new Date().toISOString().split('T')[0]);
  const [mecanicoResponsavel, setMecanicoResponsavel] = useState('Carlos Mecânico');
  const [fornecedor, setFornecedor] = useState('Auto Peças Diesel');
  const [status, setStatus] = useState<'concluido' | 'agendado' | 'em_andamento' | 'urgente'>('concluido');
  const [descricaoPecas, setDescricaoPecas] = useState('');
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
    if (manutencaoToEdit) {
      setTitulo(manutencaoToEdit.titulo);
      setTipo(manutencaoToEdit.tipo);
      setHorimetroMomento(manutencaoToEdit.horimetro_momento);
      setProximaRevisaoHoras(manutencaoToEdit.proxima_revisao_horas || manutencaoToEdit.horimetro_momento + 250);
      setValorTotal(manutencaoToEdit.valor_total);
      setDataManutencao(manutencaoToEdit.data_manutencao);
      setMecanicoResponsavel(manutencaoToEdit.mecanico_responsavel || '');
      setFornecedor(manutencaoToEdit.fornecedor || '');
      setStatus(manutencaoToEdit.status);
      setDescricaoPecas(manutencaoToEdit.descricao_pecas || '');
      setObservacoes(manutencaoToEdit.observacoes || '');
      setMaquinaId(manutencaoToEdit.maquina_id || 'maq-default');
    } else {
      const activeMaq = maquinas.find(m => m.id === selectedMaquinaId) || maquinas[0];
      const currentH = activeMaq ? activeMaq.horimetro_atual : config.horimetro_atual;
      setTitulo('');
      setTipo('troca_oleo');
      setHorimetroMomento(currentH);
      setProximaRevisaoHoras(currentH + 250);
      setValorTotal(650.0);
      setDataManutencao(new Date().toISOString().split('T')[0]);
      setMecanicoResponsavel('Carlos Mecânico');
      setFornecedor('Auto Peças Diesel & Filtros');
      setStatus('concluido');
      setDescricaoPecas('');
      setObservacoes('');
      setMaquinaId(selectedMaquinaId === 'todas' ? (maquinas[0]?.id || 'maq-default') : selectedMaquinaId);
    }
  }, [manutencaoToEdit, config, isOpen, maquinas, selectedMaquinaId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Informe o título da manutenção.');
      return;
    }

    const item: Manutencao = {
      id: manutencaoToEdit?.id || `man-${Date.now()}`,
      maquina_id: maquinaId,
      titulo: titulo.trim(),
      tipo,
      horimetro_momento: Number(horimetroMomento),
      proxima_revisao_horas: proximaRevisaoHoras ? Number(proximaRevisaoHoras) : undefined,
      valor_total: Number(valorTotal),
      data_manutencao: dataManutencao,
      mecanico_responsavel: mecanicoResponsavel.trim(),
      fornecedor: fornecedor.trim(),
      status,
      descricao_pecas: descricaoPecas.trim(),
      observacoes: observacoes.trim(),
      created_at: manutencaoToEdit?.created_at || new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {manutencaoToEdit ? 'Editar Manutenção' : 'Registrar Manutenção ou Peça'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controle de custos de oficina, óleos, filtros e peças da retroescavadeira.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Título / Descrição Principal *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Troca de Óleo Motor..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Tractor className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Máquina *
              </label>
              <select
                value={maquinaId}
                onChange={(e) => setMaquinaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              >
                {maquinas.map((maq) => (
                  <option key={maq.id} value={maq.id}>
                    {maq.nome} ({maq.placa})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Tipo de Manutenção
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoManutencao)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              >
                <option value="troca_oleo">Troca de Óleo & Filtros</option>
                <option value="preventiva">Preventiva Geral / Engraxamento</option>
                <option value="hidraulico">Sistema Hidráulico & Mangueiras</option>
                <option value="dentes_cacamba">Dentes da Caçamba / Pontas</option>
                <option value="pneus_esteiras">Pneus / Rodagem</option>
                <option value="corretiva">Corretiva de Emergência</option>
                <option value="mecanica_geral">Mecânica Geral / Motor</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              >
                <option value="concluido">Concluído</option>
                <option value="agendado">Agendado / Futuro</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="urgente">Urgente / Parada</option>
              </select>
            </div>
          </div>

          {/* Horímetro e Próxima Revisão */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Horímetro no Momento (h)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={horimetroMomento}
                onChange={(e) => setHorimetroMomento(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-amber-600 dark:text-amber-400 font-mono font-bold focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                Próxima Revisão (Horas)
              </label>
              <input
                type="number"
                step="0.1"
                value={proximaRevisaoHoras}
                onChange={(e) => setProximaRevisaoHoras(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Custo Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={valorTotal}
                onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Mecânico, Fornecedor e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Mecânico Responsável
              </label>
              <input
                type="text"
                value={mecanicoResponsavel}
                onChange={(e) => setMecanicoResponsavel(e.target.value)}
                placeholder="Ex: Carlos Mecânico"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Fornecedor / Loja de Peças
              </label>
              <input
                type="text"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: Auto Peças Diesel"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Data
              </label>
              <input
                type="date"
                required
                value={dataManutencao}
                onChange={(e) => setDataManutencao(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Peças Utilizadas */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Peças / Fluidos Utilizados
            </label>
            <input
              type="text"
              value={descricaoPecas}
              onChange={(e) => setDescricaoPecas(e.target.value)}
              placeholder="Ex: 15L Óleo 15W40, Filtro Óleo, 2 Mangueiras 3/4..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações de garantia ou recomendações para o operador..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
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
              {manutencaoToEdit ? 'Atualizar Manutenção' : 'Salvar Manutenção'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
