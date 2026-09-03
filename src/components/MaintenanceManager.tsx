/**
 * MaintenanceManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de MaintenanceManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState, useMemo } from 'react';
import { 
 Wrench, 
 Plus, 
 Calendar, 
 Gauge, 
 DollarSign, 
 ShieldAlert, 
 CheckCircle2, 
 Clock, 
 AlertTriangle, 
 Edit3, 
 Trash2,
 Sparkles
} from 'lucide-react';
import { Manutencao, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatDate, formatHours } from '../lib/formatters';
import { TablePagination } from './shared/TablePagination';

interface MaintenanceManagerProps {
 manutencoes: Manutencao[];
 config: ConfiguracoesSistema;
 onOpenNewMaintenance: () => void;
 onEditMaintenance: (manutencao: Manutencao) => void;
 onDeleteMaintenance: (id: string) => void;
}

export const MaintenanceManager: React.FC<MaintenanceManagerProps> = ({
 manutencoes,
 config,
 onOpenNewMaintenance,
 onEditMaintenance,
 onDeleteMaintenance,
}) => {
 const [filterTipo, setFilterTipo] = useState<string>('todos');
 const [currentPage, setCurrentPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);

 const totalCusto = manutencoes.reduce((acc, m) => acc + m.valor_total, 0);

 // Cálculos de Troca de Óleo
 const horasDesdeUltimoOleo = config.horimetro_atual - config.ultimo_oleo_horimetro;
 const horasRestantesOleo = Math.max(0, config.intervalo_troca_oleo_horas - horasDesdeUltimoOleo);
 const percentualOleoRestante = Math.max(0, Math.min(100, Math.round((horasRestantesOleo / config.intervalo_troca_oleo_horas) * 100)));

 const filtered = useMemo(() => {
  return manutencoes.filter((m) => {
   if (filterTipo === 'todos') return true;
   return m.tipo === filterTipo;
  });
 }, [manutencoes, filterTipo]);

 const paginated = useMemo(() => {
  if (pageSize >= filtered.length) return filtered;
  const start = (currentPage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
 }, [filtered, currentPage, pageSize]);

 const handleFilterChange = (tipo: string) => {
  setFilterTipo(tipo);
  setCurrentPage(1);
 };

 return (
  <div className="space-y-6 pb-12">
   {/* Header do Módulo */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
     <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
      <span>Manutenções, Óleo & Peças</span>
      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono border border-slate-200 ">
       {manutencoes.length} registros
      </span>
     </h2>
     <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
      Gerenciamento preventivo e corretivo para garantir a durabilidade e segurança da máquina.
     </p>
    </div>

    <button
     onClick={onOpenNewMaintenance}
     className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800  text-white font-black text-xs sm:text-sm transition-transform active:scale-95 shadow-sm cursor-pointer"
    >
     <Plus className="w-4 h-4 stroke-[2.5]" />
     <span>Registrar Manutenção</span>
    </button>
   </div>

   {/* PAINEL DE TELEMETRIA DO ÓLEO E REVISÕES PREVENTIVAS */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
    
    {/* Card 1: Rastreador de Troca de Óleo */}
    <div className="md:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5 sm:space-y-4">
     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
       <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-500/20 shrink-0">
        <Gauge className="w-5 h-5" />
       </div>
       <div>
        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
         Rastreador de Revisão: Óleo do Motor & Filtros
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-500 ">Intervalo recomendado: a cada {config.intervalo_troca_oleo_horas}h</p>
       </div>
      </div>

      <span className={`self-start sm:self-auto text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
       horasRestantesOleo <= 25 ? 'bg-red-50 text-red-600 border border-red-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-500/30'
      }`}>
       {horasRestantesOleo.toFixed(1)}h restantes
      </span>
     </div>

     {/* Barra de Progresso */}
     <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-500 flex-wrap gap-1">
       <span>Última: {formatHours(config.ultimo_oleo_horimetro)}</span>
       <span className="text-amber-600 font-bold">Atual: {formatHours(config.horimetro_atual)}</span>
       <span>Alvo: {formatHours(config.ultimo_oleo_horimetro + config.intervalo_troca_oleo_horas)}</span>
      </div>
      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 ">
       <div
        className={`h-full rounded-full transition-all duration-500 ${
         percentualOleoRestante > 50
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
          : percentualOleoRestante > 20
          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
          : 'bg-gradient-to-r from-red-600 to-red-500 animate-pulse'
        }`}
        style={{ width: `${percentualOleoRestante}%` }}
       />
      </div>
     </div>

     <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-[11px] sm:text-xs">
      <div>
       <span className="text-slate-500 block truncate">Vida Útil:</span>
       <span className="font-bold text-slate-800 ">{percentualOleoRestante}%</span>
      </div>
      <div>
       <span className="text-slate-500 block truncate">Rodadas:</span>
       <span className="font-bold text-slate-800 ">{horasDesdeUltimoOleo.toFixed(1)}h</span>
      </div>
      <div>
       <span className="text-slate-500 block truncate">Filtros:</span>
       <span className="font-bold text-amber-600 truncate block">Óleo, Comb., Ar</span>
      </div>
     </div>
    </div>

    {/* Card 2: Resumo Financeiro de Oficina */}
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
     <div>
      <div className="flex items-center justify-between mb-2">
       <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 ">Total em Manutenção</span>
       <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-500/20">
        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
       </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-orange-600 font-mono tracking-tight">
       {formatCurrency(totalCusto)}
      </div>
      <p className="text-xs text-slate-500 mt-2">
       Média de <strong>{formatCurrency(totalCusto / (manutencoes.length || 1))}</strong> por intervenção.
      </p>
     </div>

     <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between text-xs">
      <span className="text-slate-500 ">Paradas Urgentes:</span>
      <span className="text-emerald-600 font-bold flex items-center gap-1">
       <CheckCircle2 className="w-3.5 h-3.5" /> 0 Atualmente
      </span>
     </div>
    </div>

   </div>

   {/* Filtros por Categoria de Manutenção */}
   <div className="flex items-center gap-1.5 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
    {[
     { id: 'todos', label: 'Todas' },
     { id: 'troca_oleo', label: 'Óleo & Filtros' },
     { id: 'hidraulico', label: 'Hidráulico' },
     { id: 'dentes_cacamba', label: 'Caçamba' },
     { id: 'preventiva', label: 'Preventiva / Graxa' },
     { id: 'corretiva', label: 'Corretivas' },
    ].map((tab) => (
     <button
      key={tab.id}
      onClick={() => handleFilterChange(tab.id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
       filterTipo === tab.id
        ? 'bg-slate-900 text-white  font-bold shadow-sm'
        : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 '
      }`}
     >
      {tab.label}
     </button>
    ))}
   </div>

   {/* LISTA DE MANUTENÇÕES */}
   <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {paginated.map((item) => {
      const isDone = item.status === 'concluido';
      const isScheduled = item.status === 'agendado';
      const isUrgent = item.status === 'urgente';

      return (
       <div
        key={item.id}
        className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex flex-col justify-between"
       >
        <div>
         <div className="flex items-start justify-between gap-3 mb-2">
          <div>
           <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 ">
            {item.tipo.replace('_', ' ')}
           </span>
           <h3 className="text-base font-bold text-slate-900 mt-1.5">
            {item.titulo}
           </h3>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border ${
           isDone
            ? 'bg-emerald-50 text-emerald-600 border-emerald-500/30'
            : isScheduled
            ? 'bg-blue-50 text-blue-600 border-blue-500/30'
            : 'bg-red-50 text-red-600 border-red-500/30'
          }`}>
           {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
           <span className="capitalize">{item.status}</span>
          </span>
         </div>

         {item.descricao_pecas && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
           <strong>Peças:</strong> {item.descricao_pecas}
          </p>
         )}

         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-500 ">
          <div>
           <span className="text-slate-500 block">Horímetro:</span>
           <span className="font-bold text-amber-600 font-mono">{formatHours(item.horimetro_momento)}</span>
          </div>
          <div>
           <span className="text-slate-500 block">Data:</span>
           <span className="font-semibold text-slate-600 ">{formatDate(item.data_manutencao)}</span>
          </div>
          <div>
           <span className="text-slate-500 block">Mecânico:</span>
           <span className="font-semibold text-slate-600 ">{item.mecanico_responsavel || 'Oficina'}</span>
          </div>
         </div>
        </div>

        <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
         <div>
          <span className="text-[10px] text-slate-500 block">Custo Total</span>
          <span className="text-lg font-black text-slate-900 font-mono">{formatCurrency(item.valor_total)}</span>
         </div>

         <div className="flex items-center gap-1.5">
          <button
           onClick={() => onEditMaintenance(item)}
           className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 transition-colors"
           title="Editar Registro"
          >
           <Edit3 className="w-4 h-4" />
          </button>
          <button
           onClick={() => onDeleteMaintenance(item.id)}
           className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
           title="Excluir"
          >
           <Trash2 className="w-4 h-4" />
          </button>
         </div>
        </div>
       </div>
      );
     })}
    </div>

    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
     <TablePagination
      currentPage={currentPage}
      totalItems={filtered.length}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
     />
    </div>
   </div>
  </div>
 );
};
