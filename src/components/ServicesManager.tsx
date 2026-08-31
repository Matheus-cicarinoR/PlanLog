/**
 * ServicesManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de ServicesManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileDown, 
  Receipt, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  DollarSign, 
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Servico, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatDate, formatHours } from '../lib/formatters';
import { generateFullServicesReportPDF } from '../lib/pdfGenerator';
import { getWhatsAppReceiptText, openWhatsApp } from '../lib/whatsapp';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { EmptyState } from './EmptyState';
import { Card, CardContent } from './ui/card';
import { ScrollableTableContainer } from './shared/ScrollableTableContainer';
import { TablePagination } from './shared/TablePagination';

interface ServicesManagerProps {
  servicos: Servico[];
  config: ConfiguracoesSistema;
  initialFilter?: string;
  onOpenNewService: () => void;
  onEditService: (servico: Servico) => void;
  onDeleteService: (id: string) => void;
  onQuickSettleService: (servico: Servico) => void;
  onGenerateReceipt: (servico: Servico) => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  servicos,
  config,
  initialFilter,
  onOpenNewService,
  onEditService,
  onDeleteService,
  onQuickSettleService,
  onGenerateReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'todos');
  const [entregueFilter, setEntregueFilter] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtragem inteligente
  const filteredServicos = useMemo(() => {
    return servicos.filter((s) => {
      // Busca textual
      const matchesSearch =
        s.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.forma_pagamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.detalhe_pagamento && s.detalhe_pagamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.entregue_a && s.entregue_a.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.observacoes && s.observacoes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.descricao_servico && s.descricao_servico.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de Status
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'pago' && s.status === 'pago' && s.tipo_registro !== 'deslocamento_interno') ||
        (statusFilter === 'pendente' && s.status === 'pendente') ||
        (statusFilter === 'parcial' && s.status === 'parcial') ||
        (statusFilter === 'deslocamento' && s.tipo_registro === 'deslocamento_interno');

      // Filtro de Destino / Entregue a
      const matchesEntregue =
        entregueFilter === 'todos' ||
        (entregueFilter === 'erica' && s.entregue_a?.toLowerCase().includes('erica')) ||
        (entregueFilter === 'jurandir' && s.entregue_a?.toLowerCase().includes('jurandir')) ||
        (entregueFilter === 'empresa' && (!s.entregue_a || s.entregue_a?.toLowerCase().includes('caixa') || s.entregue_a?.toLowerCase().includes('empresa')));

      return matchesSearch && matchesStatus && matchesEntregue;
    });
  }, [servicos, searchTerm, statusFilter, entregueFilter]);

  // Paginação dos itens filtrados
  const paginatedServicos = useMemo(() => {
    if (pageSize >= filteredServicos.length) return filteredServicos;
    const start = (currentPage - 1) * pageSize;
    return filteredServicos.slice(start, start + pageSize);
  }, [filteredServicos, currentPage, pageSize]);

  // Handlers que resetam para a primeira página ao alterar filtros
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleEntregueFilterChange = (val: string) => {
    setEntregueFilter(val);
    setCurrentPage(1);
  };

  // Totais do filtro atual
  const totalHorasFaturadasFiltro = filteredServicos
    .filter(s => s.tipo_registro !== 'deslocamento_interno')
    .reduce((acc, s) => acc + (Number(s.tempo_horas) || 0), 0);
  
  const totalHorasOperadasFiltro = filteredServicos.reduce((acc, s) => {
    return acc + (Number(s.tempo_horas) || 0) + (Number(s.tempo_deslocamento_horas) || 0);
  }, 0);

  const totalValorFiltro = filteredServicos.reduce((acc, s) => acc + s.valor_total, 0);
  const totalPagoFiltro = filteredServicos.reduce((acc, s) => acc + s.valor_pago, 0);
  const totalDevedorFiltro = filteredServicos.reduce((acc, s) => acc + s.saldo_devedor, 0);

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = ['Cliente,Tempo (h),Valor Total,Valor Pago,Saldo Devedor,Forma Pagamento,Data Pagamento,Observacao/Entregue,Status'];
    const rows = filteredServicos.map(
      (s) =>
        `"${s.cliente}","${s.tempo_horas}","${s.valor_total}","${s.valor_pago}","${s.saldo_devedor}","${s.forma_pagamento}","${s.data_pagamento || ''}","${s.entregue_a || s.observacoes || ''}","${s.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Servicos_Retroescavadeira_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Serviços de Retroescavadeira</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
              {filteredServicos.length} registros
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Planilha inteligente com controle de horímetro, deslocamentos, inadimplência e repasses.
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => generateFullServicesReportPDF(filteredServicos, config)}>
            <FileDown className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          
          <Button variant="secondary" onClick={handleExportCSV}>
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          <Button onClick={onOpenNewService}>
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Serviço</span>
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Campo de Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por cliente, forma de pagamento, observação..."
              />
            </div>

            {/* Filtros por Status */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleStatusFilterChange('todos')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'todos'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Todos ({servicos.length})
              </button>

              <button
                onClick={() => handleStatusFilterChange('pago')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'pago'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Pagos ({servicos.filter((s) => s.status === 'pago' && s.tipo_registro !== 'deslocamento_interno').length})
              </button>

              <button
                onClick={() => handleStatusFilterChange('pendente')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'pendente'
                    ? 'bg-red-500 text-slate-900 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-500/30'
                }`}
              >
                Em Aberto ({servicos.filter((s) => s.status === 'pendente').length})
              </button>

              <button
                onClick={() => handleStatusFilterChange('parcial')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'parcial'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-500/30'
                }`}
              >
                Parciais ({servicos.filter((s) => s.status === 'parcial').length})
              </button>

              <button
                onClick={() => handleStatusFilterChange('deslocamento')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'deslocamento'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-500/30'
                }`}
              >
                Deslocamentos ({servicos.filter((s) => s.tipo_registro === 'deslocamento_interno').length})
              </button>
            </div>
          </div>

          {/* Filtro Secundário: Destino / Repasse */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Repasse / Entrega:
            </span>

            <button
              onClick={() => handleEntregueFilterChange('todos')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                entregueFilter === 'todos'
                  ? 'bg-slate-700 dark:bg-slate-600 text-white font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Todos os Repasses
            </button>

            <button
              onClick={() => handleEntregueFilterChange('erica')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                entregueFilter === 'erica'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              Entregue a Erica ({servicos.filter((s) => s.entregue_a?.toLowerCase().includes('erica')).length})
            </button>

            <button
              onClick={() => handleEntregueFilterChange('jurandir')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                entregueFilter === 'jurandir'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
              }`}
            >
              Entregue a Jurandir ({servicos.filter((s) => s.entregue_a?.toLowerCase().includes('jurandir')).length})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Mini Resumo da Visualização Atual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block">Horas Operadas:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{formatHours(totalHorasOperadasFiltro)}</span>
          <span className="text-[10px] text-slate-400 block">({formatHours(totalHorasFaturadasFiltro)} cobradas)</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block">Valor Faturado:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatCurrency(totalValorFiltro)}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block">Total Recebido:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(totalPagoFiltro)}</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block">Saldo Pendente:</span>
          <span className="font-bold text-red-600 dark:text-red-400 text-sm">{formatCurrency(totalDevedorFiltro)}</span>
        </div>
      </div>

      {/* LISTA DE SERVIÇOS: CARDS EM MOBILE, TABELA EM DESKTOP */}
      {filteredServicos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <EmptyState
            title="Nenhum serviço encontrado"
            description="Não encontramos resultados para a sua busca atual."
            icon={<FileSpreadsheet className="w-8 h-8 text-slate-500" />}
          />
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: CARDS (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {paginatedServicos.map((servico) => {
              const isPending = servico.status === 'pendente';
              const isPartial = servico.status === 'parcial';
              const isPaid = servico.status === 'pago';

              return (
                <div
                  key={servico.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs transition-all space-y-3 ${
                    isPending
                      ? 'border-red-300 dark:border-red-900/60 bg-red-50/20'
                      : isPartial
                      ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Top: Cliente & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        {servico.tipo_registro === 'deslocamento_interno' ? (
                          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            🛣️ {servico.cliente}
                          </span>
                        ) : (
                          servico.cliente
                        )}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>{formatDate(servico.data_servico)} • {formatHours(servico.tempo_horas)}</span>
                        {Number(servico.tempo_deslocamento_horas || 0) > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono font-bold">
                            +{servico.tempo_deslocamento_horas}h trânsito
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={servico.tipo_registro === 'deslocamento_interno' ? 'secondary' : isPaid ? 'success' : isPartial ? 'warning' : 'danger'}
                      className="text-[10px] font-black uppercase shrink-0"
                    >
                      {servico.tipo_registro === 'deslocamento_interno' ? 'Custo Interno' : isPaid ? '100% Pago' : isPartial ? 'Parcial' : 'Em Aberto'}
                    </Badge>
                  </div>

                  {servico.descricao_servico && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      {servico.descricao_servico}
                    </p>
                  )}

                  {/* Financial Mini Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                      <span className="font-extrabold font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(servico.valor_total)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Forma Pgto</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 capitalize truncate block">
                        {servico.forma_pagamento}
                      </span>
                    </div>
                    {isPartial && (
                      <div className="col-span-2 text-red-600 dark:text-red-400 font-bold font-mono text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                        Falta pagar: {formatCurrency(servico.saldo_devedor)}
                      </div>
                    )}
                    {servico.entregue_a && (
                      <div className="col-span-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                        Entregue a: {servico.entregue_a}
                      </div>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {(isPending || isPartial) && (
                      <button
                        onClick={() => onQuickSettleService(servico)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Quitar
                      </button>
                    )}

                    <button
                      onClick={() => onGenerateReceipt(servico)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-500" />
                      Recibo
                    </button>

                    <button
                      onClick={() => {
                        const text = getWhatsAppReceiptText(servico, config);
                        openWhatsApp('', text);
                      }}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                      title="WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onEditService(servico)}
                      className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteService(servico.id)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Mobile Pagination */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <TablePagination
                currentPage={currentPage}
                totalItems={filteredServicos.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </div>

          {/* DESKTOP VIEW: TABELA (hidden md:block) COM DRAG-TO-SCROLL E PAGINAÇÃO */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <ScrollableTableContainer>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-3 text-center">Tempo (h)</th>
                    <th className="py-3.5 px-3">Valor Total</th>
                    <th className="py-3.5 px-3">Forma Pagamento</th>
                    <th className="py-3.5 px-3">Data Pgto</th>
                    <th className="py-3.5 px-3">Observação / Repasse</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
                  {paginatedServicos.map((servico) => {
                    const isPending = servico.status === 'pendente';
                    const isPartial = servico.status === 'parcial';
                    const isPaid = servico.status === 'pago';

                    let rowBg = 'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors';
                    if (isPending) {
                      rowBg = 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 border-l-4 border-l-red-500';
                    } else if (isPartial) {
                      rowBg = 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-l-4 border-l-amber-500';
                    }

                    return (
                      <tr key={servico.id} className={rowBg}>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {servico.tipo_registro === 'deslocamento_interno' ? (
                              <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                                🛣️ {servico.cliente}
                              </span>
                            ) : (
                              <span className={isPending ? 'text-red-600 dark:text-red-400 font-extrabold' : ''}>
                                {servico.cliente}
                              </span>
                            )}
                          </div>
                          {servico.descricao_servico && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-normal truncate max-w-xs">
                              {servico.descricao_servico}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">
                            {formatHours(servico.tempo_horas)}
                          </span>
                          {Number(servico.tempo_deslocamento_horas || 0) > 0 && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold block">
                              +{servico.tempo_deslocamento_horas}h trânsito
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold whitespace-nowrap">
                          {servico.tipo_registro === 'deslocamento_interno' ? (
                            <span className="text-xs text-slate-400 font-normal">Custo Operacional</span>
                          ) : (
                            <>
                              <div className={isPending ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}>
                                {formatCurrency(servico.valor_total)}
                              </div>
                              {isPartial && (
                                <div className="text-xs text-red-600 dark:text-red-400 font-normal">
                                  Falta {formatCurrency(servico.saldo_devedor)}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {servico.forma_pagamento === 'a_definir' ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold text-xs">Em Aberto</span>
                          ) : (
                            <div>
                              <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                                {servico.forma_pagamento}
                              </span>
                              {servico.detalhe_pagamento && servico.detalhe_pagamento !== 'Pix integral' && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                                  {servico.detalhe_pagamento}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                          {formatDate(servico.data_pagamento)}
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                          {servico.entregue_a ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                              <UserCheck className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                              {servico.observacoes || `Entregue a ${servico.entregue_a}`}
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 text-xs">
                              {servico.observacoes || '-'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {isPaid && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="danger" className="gap-1 shadow-sm">
                              <AlertCircle className="w-3 h-3" /> Em Aberto
                            </Badge>
                          )}
                          {isPartial && (
                            <Badge variant="warning">
                              Parcial
                            </Badge>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {(isPending || isPartial) && (
                              <button
                                onClick={() => onQuickSettleService(servico)}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 transition-colors cursor-pointer"
                                title="Marcar como Totalmente Quitado"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => onGenerateReceipt(servico)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                              title="Gerar Recibo / Comprovante"
                            >
                              <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </button>

                            <button
                              onClick={() => {
                                const text = getWhatsAppReceiptText(servico, config);
                                openWhatsApp('', text);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                              title="WhatsApp"
                            >
                              <Send className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onEditService(servico)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onDeleteService(servico.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollableTableContainer>

            {/* Desktop Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredServicos.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </>
      )}
    </div>
  );
};
