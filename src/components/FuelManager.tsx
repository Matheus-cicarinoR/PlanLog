/**
 * FuelManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de FuelManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState, useMemo } from 'react';
import { Fuel, Plus, Calendar, Gauge, DollarSign, Trash2 } from 'lucide-react';
import { Abastecimento, Servico, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatDate, formatHours } from '../lib/formatters';
import { ScrollableTableContainer } from './shared/ScrollableTableContainer';
import { TablePagination } from './shared/TablePagination';

interface FuelManagerProps {
  abastecimentos: Abastecimento[];
  servicos: Servico[];
  config: ConfiguracoesSistema;
  onOpenNewFuel: () => void;
  onDeleteFuel: (id: string) => void;
}

export const FuelManager: React.FC<FuelManagerProps> = ({
  abastecimentos,
  servicos,
  onOpenNewFuel,
  onDeleteFuel,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedAbastecimentos = useMemo(() => {
    if (pageSize >= abastecimentos.length) return abastecimentos;
    const start = (currentPage - 1) * pageSize;
    return abastecimentos.slice(start, start + pageSize);
  }, [abastecimentos, currentPage, pageSize]);

  const totalLitros = abastecimentos.reduce((acc, a) => acc + a.litros, 0);
  const totalGasto = abastecimentos.reduce((acc, a) => acc + a.valor_total, 0);
  
  // Horas totais reais operadas pela frota (trabalho de clientes + deslocamentos internos)
  const totalHorasOperadas = servicos.reduce((acc, s) => {
    const horasBase = Number(s.tempo_horas) || 0;
    const horasDeslocamento = Number(s.tempo_deslocamento_horas) || 0;
    return acc + horasBase + horasDeslocamento;
  }, 0);

  const totalHorasDeslocamento = servicos.reduce((acc, s) => {
    if (s.tipo_registro === 'deslocamento_interno') {
      return acc + (Number(s.tempo_horas) || 0);
    }
    return acc + (Number(s.tempo_deslocamento_horas) || 0);
  }, 0);

  const consumoMedioHoras = totalHorasOperadas > 0 ? totalLitros / totalHorasOperadas : 0;
  const custoCombustivelPorHora = totalHorasOperadas > 0 ? totalGasto / totalHorasOperadas : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Controle de Combustível (Diesel S10)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
              {abastecimentos.length} abastecimentos
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de autonomia, custo por hora real trabalhada e consumo médio em litros/hora (incluindo deslocamentos).
          </p>
        </div>

        <button
          onClick={onOpenNewFuel}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Abastecimento</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Diesel</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono truncate">{totalLitros.toFixed(1)} L</div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 block truncate">Volume total</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Custo Total</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-red-600 dark:text-red-400 font-mono truncate">{formatCurrency(totalGasto)}</div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 block truncate">~R$ {(totalGasto / (totalLitros || 1)).toFixed(2)}/L</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Consumo Médio</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono truncate">{consumoMedioHoras.toFixed(1)} L/h</div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 block truncate">
            {formatHours(totalHorasOperadas)} operadas
            {totalHorasDeslocamento > 0 && ` (${formatHours(totalHorasDeslocamento)} trânsito)`}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Custo / Hora</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono truncate">{formatCurrency(custoCombustivelPorHora)}/h</div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 block truncate">Impacto hora operada</span>
        </div>

      </div>

      {/* HISTÓRICO DE ABASTECIMENTOS: MOBILE CARDS & DESKTOP TABLE */}
      {/* MOBILE VIEW: CARDS (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {paginatedAbastecimentos.map((abs) => (
          <div
            key={abs.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatDate(abs.data)}
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold block">
                  Horímetro: {formatHours(abs.horimetro)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                {abs.tipo_combustivel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Litros</span>
                <span className="font-mono font-black text-slate-900 dark:text-slate-100">{abs.litros.toFixed(1)} L</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Preço/L</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">R$ {abs.preco_litro.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(abs.valor_total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 truncate">{abs.posto_fornecedor || 'Posto'}</span>
              <button
                onClick={() => onDeleteFuel(abs.id)}
                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <TablePagination
            currentPage={currentPage}
            totalItems={abastecimentos.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* DESKTOP VIEW: TABELA (hidden md:block) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 text-sm">
          Histórico de Abastecimentos no Campo e Posto
        </div>

        <ScrollableTableContainer>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-3">Horímetro</th>
                <th className="py-3 px-3">Combustível</th>
                <th className="py-3 px-3">Litros</th>
                <th className="py-3 px-3">Preço / Litro</th>
                <th className="py-3 px-3">Valor Total</th>
                <th className="py-3 px-3">Posto / Local</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedAbastecimentos.map((abs) => (
                <tr key={abs.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-300">{formatDate(abs.data)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{formatHours(abs.horimetro)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                      {abs.tipo_combustivel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{abs.litros.toFixed(1)} L</td>
                  <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">R$ {abs.preco_litro.toFixed(2)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(abs.valor_total)}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{abs.posto_fornecedor || 'Posto'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteFuel(abs.id)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableTableContainer>

        <TablePagination
          currentPage={currentPage}
          totalItems={abastecimentos.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};
