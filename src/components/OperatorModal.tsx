import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, DollarSign, Briefcase, FileText } from 'lucide-react';
import { Operador } from '../types';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (operador: Operador) => void;
  operatorToEdit?: Operador | null;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  operatorToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Operador>>({
    nome: '',
    cargo: 'Operador Principal',
    telefone: '',
    chave_pix: '',
    tipo_remuneracao: 'diaria',
    valor_base: 0,
    percentual_comissao: 0,
    status: 'ativo',
    observacoes: '',
    total_recebido_em_maos: 0,
    total_repassado_empresa: 0,
  });

  useEffect(() => {
    if (operatorToEdit) {
      setFormData(operatorToEdit);
    } else {
      setFormData({
        nome: '',
        cargo: 'Operador Principal',
        telefone: '',
        chave_pix: '',
        tipo_remuneracao: 'diaria',
        valor_base: 0,
        percentual_comissao: 0,
        status: 'ativo',
        observacoes: '',
        total_recebido_em_maos: 0,
        total_repassado_empresa: 0,
      });
    }
  }, [operatorToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: operatorToEdit?.id || crypto.randomUUID(),
      created_at: operatorToEdit?.created_at || new Date().toISOString(),
      ...formData,
    } as Operador);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                {operatorToEdit ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              <p className="text-xs text-slate-500">
                {operatorToEdit ? 'Atualize os dados do operador.' : 'Cadastre um novo membro da equipe.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nome do Profissional
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                placeholder="Ex: Jurandir Silva"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cargo / Perfil
              </label>
              <select
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="Operador Principal">Operador Principal</option>
                <option value="Operador Substituto">Operador Substituto</option>
                <option value="Ajudante / Servente">Ajudante / Servente</option>
                <option value="Gestor / Financeiro">Gestor / Financeiro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.chave_pix}
                onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                placeholder="Chave PIX para pagamentos"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tipo de Remuneração
              </label>
              <select
                value={formData.tipo_remuneracao}
                onChange={(e) => setFormData({ ...formData, tipo_remuneracao: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="diaria">Diária</option>
                <option value="hora">Por Hora</option>
                <option value="comissao">Comissão</option>
                <option value="fixo_mensal">Fixo Mensal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Valor Base (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.valor_base || ''}
                onChange={(e) => setFormData({ ...formData, valor_base: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                placeholder="0.00"
              />
            </div>

            {formData.tipo_remuneracao === 'comissao' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Percentual de Comissão (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.percentual_comissao || ''}
                  onChange={(e) => setFormData({ ...formData, percentual_comissao: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  placeholder="0.00"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Observações
              </label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 min-h-[80px] custom-scrollbar"
                placeholder="Detalhes adicionais sobre o profissional..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-black text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Profissional
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
