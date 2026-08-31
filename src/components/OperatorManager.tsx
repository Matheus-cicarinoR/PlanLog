/**
 * OperatorManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de OperatorManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Phone, 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRightLeft,
  Calendar,
  FileCheck
} from 'lucide-react';
import { Operador, Servico, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatHours, formatDate } from '../lib/formatters';
import { OperatorModal } from './OperatorModal';

interface OperatorManagerProps {
  operadores: Operador[];
  servicos: Servico[];
  config: ConfiguracoesSistema;
  onUpdateOperador: (op: Operador) => void;
}

export const OperatorManager: React.FC<OperatorManagerProps> = ({
  operadores,
  servicos,
  onUpdateOperador,
}) => {
  // Extract money values dynamically from mixed payments
  const getDinheiroValue = (s: Servico) => {
    if (s.forma_pagamento === 'dinheiro') return s.valor_pago;
    if (s.forma_pagamento === 'misto' && s.detalhe_pagamento?.toLowerCase().includes('dinheiro')) {
      const match = s.detalhe_pagamento.match(/([\d.,]+)\s*dinheiro/i);
      if (match) {
        const val = parseFloat(match[1].replace('.', '').replace(',', '.'));
        if (!isNaN(val)) return val;
      }
      return s.valor_pago / 2;
    }
    return 0;
  };

  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(operadores.length > 0 ? operadores[0].id : null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operatorToEdit, setOperatorToEdit] = useState<Operador | null>(null);

  const selectedOperator = operadores.find(op => op.id === selectedOperatorId) || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Operadores, Equipe & Prestação de Contas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de diárias, horas trabalhadas e conciliação de dinheiro entregue em mãos.
          </p>
        </div>
      </div>

      {/* SELEÇÃO DE OPERADOR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1 max-w-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Profissional / Operador</span>
          <div className="relative">
            <select
              value={selectedOperatorId || ''}
              onChange={(e) => setSelectedOperatorId(e.target.value || null)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecione um profissional...</option>
              {operadores.map((op) => (
                <option key={op.id} value={op.id}>
                  👤 {op.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => {
              setOperatorToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 h-[42px] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
          >
            <span className="text-sm font-medium">+ Novo Profissional</span>
          </button>
        </div>
      </div>

      {/* DADOS DO OPERADOR SELECIONADO */}
      {selectedOperator ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* COLUNA 1: DADOS CADASTRAIS E PROFISSIONAIS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-100 dark:border-amber-500/20">
                  {selectedOperator.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-0.5">{selectedOperator.nome}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-amber-500">{selectedOperator.cargo}</p>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      selectedOperator.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {selectedOperator.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setOperatorToEdit(selectedOperator);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
              >
                Editar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contato & Pagamento</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Telefone</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedOperator.telefone || 'Não informado'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Remuneração</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      {formatCurrency(selectedOperator.valor_base)} / {selectedOperator.tipo_remuneracao}
                    </span>
                  </div>
                  {selectedOperator.chave_pix && (
                    <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Chave PIX</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {selectedOperator.chave_pix}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedOperator.observacoes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observações</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                    {selectedOperator.observacoes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA 2: CONCILIAÇÃO E HISTÓRICO */}
          {(() => {
            const nomeSearch = selectedOperator.nome.split(' ')[0].toLowerCase();
            const servicosRecebidos = servicos.filter((s) => s.entregue_a?.toLowerCase().includes(nomeSearch));
            const totalRecebido = servicosRecebidos.reduce((acc, s) => acc + getDinheiroValue(s), 0);
            
            const totalHoras = servicos
              .filter((s) => s.operador_responsavel?.toLowerCase().includes(nomeSearch))
              .reduce((acc, s) => acc + (Number(s.tempo_horas) || 0), 0);

            const isFinanceiro = selectedOperator.cargo?.toLowerCase().includes('financeiro') || selectedOperator.cargo?.toLowerCase().includes('admin');
            const colorClass = isFinanceiro ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400";
            const bgClass = isFinanceiro ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800" : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800";

            return (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <span>Produtividade & Conciliação</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                    {servicosRecebidos.length} Recebimentos
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div className={`p-4 rounded-xl border ${bgClass}`}>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">Total Recebido (Dinheiro)</span>
                    <span className={`text-2xl font-black font-mono ${colorClass}`}>
                      {formatCurrency(totalRecebido)}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                      {isFinanceiro ? 'Status do Caixa' : 'Horas Operadas'}
                    </span>
                    {isFinanceiro ? (
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                        <ShieldCheck className="w-5 h-5" /> Conciliado
                      </span>
                    ) : (
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {formatHours(totalHoras)}<span className="text-sm font-medium text-slate-500">h</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-h-[200px] flex flex-col pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Histórico de Recebimentos</h4>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 max-h-[300px]">
                    {servicosRecebidos.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <CreditCard className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Nenhum recebimento registrado.</p>
                      </div>
                    ) : (
                      servicosRecebidos.map((s) => (
                        <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block mb-0.5">{s.cliente}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatDate(s.data_servico)} • {s.detalhe_pagamento || s.forma_pagamento}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(getDinheiroValue(s))}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Nenhum operador selecionado</h3>
          <p className="text-slate-500 mb-4">Selecione um operador na lista acima para visualizar seus dados.</p>
          <button
            onClick={() => {
              setOperatorToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20"
          >
            Cadastrar Novo Profissional
          </button>
        </div>
      )}
      
      <OperatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(op) => {
          onUpdateOperador(op);
          setSelectedOperatorId(op.id);
        }}
        operatorToEdit={operatorToEdit}
      />
    </div>
  );
};
