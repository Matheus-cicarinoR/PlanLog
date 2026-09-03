/**
 * ReportsManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de ReportsManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React from 'react';
import { 
 FileText, 
 Download, 
 Printer, 
 TrendingUp, 
 ShieldAlert, 
 Users, 
 Wrench, 
 Fuel, 
 Receipt,
 FileSpreadsheet
} from 'lucide-react';
import { Servico, Manutencao, Operador, Abastecimento, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatHours, formatDate } from '../lib/formatters';
import { generateFullServicesReportPDF } from '../lib/pdfGenerator';

interface ReportsManagerProps {
 servicos: Servico[];
 manutencoes: Manutencao[];
 operadores: Operador[];
 abastecimentos: Abastecimento[];
 config: ConfiguracoesSistema;
 startDate: string;
 endDate: string;
 onGenerateReceipt: (servico: Servico) => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
 servicos,
 manutencoes,
 operadores,
 abastecimentos,
 config,
 startDate,
 endDate,
 onGenerateReceipt,
}) => {
 const formatPeriod = (start: string, end: string) => {
  if (!start && !end) return 'Todo o Período (Global)';
  const startStr = start ? new Date(start + 'T12:00:00').toLocaleDateString('pt-BR') : 'Início';
  const endStr = end ? new Date(end + 'T12:00:00').toLocaleDateString('pt-BR') : 'Hoje';
  return `${startStr} — ${endStr}`;
 };
 const periodText = formatPeriod(startDate, endDate);
 const totalFaturado = servicos.reduce((acc, s) => acc + s.valor_total, 0);
 const totalRecebido = servicos.reduce((acc, s) => acc + s.valor_pago, 0);
 const totalPendente = servicos.reduce((acc, s) => acc + s.saldo_devedor, 0);
 const totalHoras = servicos.reduce((acc, s) => acc + s.tempo_horas, 0);

 const totalManutencao = manutencoes.reduce((acc, m) => acc + m.valor_total, 0);
 const totalCombustivel = abastecimentos.reduce((acc, a) => acc + a.valor_total, 0);
 
 const totalOperadoresCost = operadores.reduce((acc, op) => {
  if (!op.nome) return acc;
  const nomeSearch = op.nome.split(' ')[0].toLowerCase();
  const servicosDoOperador = servicos.filter(s => 
   s.operador_responsavel?.toLowerCase().includes(nomeSearch)
  );

  let custoOperador = 0;
  if (op.tipo_remuneracao === 'hora') {
   const horas = servicosDoOperador.reduce((sum, s) => sum + (Number(s.tempo_horas) || 0), 0);
   custoOperador = horas * (op.valor_base || 0);
  } else if (op.tipo_remuneracao === 'comissao') {
   const totalFaturadoOp = servicosDoOperador.reduce((sum, s) => sum + (Number(s.valor_total) || 0), 0);
   custoOperador = totalFaturadoOp * ((op.percentual_comissao || 0) / 100);
  } else if (op.tipo_remuneracao === 'diaria') {
   const diasUnicos = new Set(servicosDoOperador.map(s => s.data_servico)).size;
   custoOperador = diasUnicos * (op.valor_base || 0);
  } else if (op.tipo_remuneracao === 'fixo_mensal') {
   custoOperador = op.valor_base || 0;
  }

  return acc + custoOperador;
 }, 0);

 const totalDespesasGerais = totalManutencao + totalCombustivel + totalOperadoresCost;
 const lucroLiquido = totalRecebido - totalDespesasGerais;

 return (
  <div className="space-y-6 pb-12">
   {/* Header */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
     <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
      <span>Relatórios Gerenciais & Emissão de Recibos</span>
     </h2>
     <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
      Demonstrativo de resultado, fechamento de caixa e emissão de comprovantes formais.
     </p>
    </div>

    <button
     onClick={() => generateFullServicesReportPDF(servicos, config, periodText)}
     className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-transform active:scale-95 cursor-pointer"
    >
     <Download className="w-4 h-4 stroke-[2.5]" />
     <span>Baixar Relatório Completo PDF</span>
    </button>
   </div>

   {/* DEMONSTRATIVO DE RESULTADO (DRE SIMPLIFICADO) */}
   <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-1">
     <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-emerald-500 " />
      <span>Fechamento Financeiro Consolidado</span>
     </h3>
     <span className="text-xs text-slate-500 font-mono">
      Período: {periodText}
     </span>
    </div>

    <div className="space-y-3 font-mono text-xs sm:text-sm">
     {/* Receita Bruta */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 gap-1">
      <span className="text-slate-600 font-bold">(+) Faturamento Bruto ({formatHours(totalHoras)})</span>
      <span className="text-slate-900 font-bold text-base font-mono">{formatCurrency(totalFaturado)}</span>
     </div>

     {/* Inadimplência / A Receber */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 gap-1">
      <span className="text-red-500 font-bold">(-) Valores em Aberto / Inadimplência</span>
      <span className="text-red-500 font-bold text-base font-mono">{formatCurrency(totalPendente)}</span>
     </div>

     {/* Receita Efetiva */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 gap-1">
      <span className="text-emerald-600 font-bold">(=) Total Efetivamente Recebido</span>
      <span className="text-emerald-600 font-black text-lg font-mono">{formatCurrency(totalRecebido)}</span>
     </div>

     {/* Custos Operacionais */}
     <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
      <span className="text-slate-500 font-sans font-bold uppercase tracking-wider block">
       (-) Custos Operacionais Diretos
      </span>
      <div className="flex items-center justify-between pl-2 sm:pl-4 text-slate-600 ">
       <span>• Combustível Diesel S10</span>
       <span className="text-amber-500 font-mono font-bold">{formatCurrency(totalCombustivel)}</span>
      </div>
      <div className="flex items-center justify-between pl-2 sm:pl-4 text-slate-600 ">
       <span>• Manutenção & Filtros</span>
       <span className="text-orange-500 font-mono font-bold">{formatCurrency(totalManutencao)}</span>
      </div>
      <div className="flex items-center justify-between pl-2 sm:pl-4 text-slate-600 ">
       <span>• Operador & Diárias</span>
       <span className="text-blue-500 font-mono font-bold">{formatCurrency(totalOperadoresCost)}</span>
      </div>
     </div>

     {/* Lucro Líquido Real */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 via-emerald-50 to-transparent border border-emerald-200 gap-2.5">
      <div>
       <span className="text-xs text-slate-500 block font-sans">Resultado Líquido</span>
       <span className="text-lg sm:text-2xl font-black text-emerald-600 font-mono">
        LUCRO: {formatCurrency(lucroLiquido)}
       </span>
      </div>
      <div className="text-left sm:text-right">
       <span className="text-xs text-slate-500 block font-sans">Rentabilidade</span>
       <span className="text-sm sm:text-base font-bold text-amber-500 font-mono">
        {formatCurrency(lucroLiquido / (totalHoras || 1))}/h
       </span>
      </div>
     </div>

    </div>
   </div>

   {/* SELETOR DE RECIBOS RÁPIDOS */}
   <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
     <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
      <Receipt className="w-4 h-4 text-amber-500 " />
      <span>Emitir Recibo Individual por Cliente</span>
     </h3>
     <span className="text-xs text-slate-500 ">Selecione um cliente para gerar o comprovante</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
     {servicos.map((s) => (
      <button
       key={s.id}
       onClick={() => onGenerateReceipt(s)}
       className="p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-500/50 text-left transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
      >
       <div>
        <span className="font-bold text-xs text-slate-900 block group-hover:text-amber-500 transition-colors">
         {s.cliente}
        </span>
        <span className="text-[11px] text-slate-500 ">
         {formatHours(s.tempo_horas)} • {formatCurrency(s.valor_total)}
        </span>
       </div>
       <span className="p-1.5 rounded-lg bg-white group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-500 transition-colors">
        <Receipt className="w-4 h-4" />
       </span>
      </button>
     ))}
    </div>
   </div>
  </div>
 );
};
