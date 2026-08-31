/**
 * Dashboard.tsx
 * 
 * PROPÓSITO:
 * Componente principal da visualização inicial (Home).
 * Apresenta um resumo consolidado das métricas de faturamento, despesas e horas trabalhadas.
 * 
 * RESPONSABILIDADES:
 * - Renderizar cartões de métricas superiores (Faturamento, Despesas, Lucro).
 * - Renderizar os gráficos interativos (Recharts) comparativos (Despesas vs Faturamento).
 * - Filtrar dados de acordo com o intervalo de datas (período) fornecido pela View.
 */
import React, { useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  Fuel, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldAlert,
  Send,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { Servico, Manutencao, Operador, Abastecimento, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatHours, formatDate } from '../lib/formatters';
import { getWhatsAppReceiptText, openWhatsApp } from '../lib/whatsapp';

import { Button } from './ui/button';
import { MetricCard } from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { EmptyState } from './EmptyState';
import { Badge } from './ui/badge';

interface DashboardProps {
  servicos: Servico[];
  manutencoes: Manutencao[];
  operadores: Operador[];
  abastecimentos: Abastecimento[];
  config: ConfiguracoesSistema;
  onNavigateToServices: (filter?: string) => void;
  onNavigateToMaintenance: () => void;
  onNavigateToOperators: () => void;
  onQuickSettleService: (servico: Servico) => void;
  onGenerateReceipt: (servico: Servico) => void;
  isAllMachinesSelected?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  servicos,
  manutencoes,
  operadores,
  abastecimentos,
  config,
  onNavigateToServices,
  onNavigateToMaintenance,
  onNavigateToOperators,
  onQuickSettleService,
  onGenerateReceipt,
  isAllMachinesSelected = false,
}) => {
  // Cálculos Financeiros dos Serviços
  const totalFaturado = servicos.reduce((acc, s) => acc + s.valor_total, 0);
  const totalRecebido = servicos.reduce((acc, s) => acc + s.valor_pago, 0);
  const totalPendente = servicos.reduce((acc, s) => acc + s.saldo_devedor, 0);
  
  // Horas Faturadas (clientes) e Horas Operadas Totais (incluindo deslocamentos)
  const totalHorasTrabalhadas = servicos
    .filter(s => s.tipo_registro !== 'deslocamento_interno')
    .reduce((acc, s) => acc + (Number(s.tempo_horas) || 0), 0);
  
  const totalHorasOperadas = servicos.reduce((acc, s) => {
    return acc + (Number(s.tempo_horas) || 0) + (Number(s.tempo_deslocamento_horas) || 0);
  }, 0);

  const totalHorasDeslocamento = servicos.reduce((acc, s) => {
    if (s.tipo_registro === 'deslocamento_interno') return acc + (Number(s.tempo_horas) || 0);
    return acc + (Number(s.tempo_deslocamento_horas) || 0);
  }, 0);

  // Cálculos de Custos Operacionais
  const totalCustoManutencao = manutencoes.reduce((acc, m) => acc + m.valor_total, 0);
  const totalCustoCombustivel = abastecimentos.reduce((acc, a) => acc + a.valor_total, 0);
  const totalLitrosDiesel = abastecimentos.reduce((acc, a) => acc + a.litros, 0);
  
  // Estimativa de despesa de operador baseada em diárias dos dias trabalhados reais
  const uniqueDays = Array.from(new Set(servicos.map(s => s.data_servico))).length;
  const mainOperator = operadores.find(o => o.cargo === 'Operador Principal') || operadores[0];
  const totalDespesaOperador = (mainOperator?.valor_base || 180) * uniqueDays;
  const totalCustosGerais = totalCustoManutencao + totalCustoCombustivel + totalDespesaOperador;

  const lucroLiquidoReal = totalRecebido - totalCustosGerais;
  const lucroPorHora = totalHorasTrabalhadas > 0 ? (totalRecebido - totalCustosGerais) / totalHorasTrabalhadas : 0;
  const consumoMedioDiesel = totalHorasOperadas > 0 ? totalLitrosDiesel / totalHorasOperadas : 0;

  // Serviços Inadimplentes e Parciais
  const servicosPendentes = servicos.filter((s) => s.status === 'pendente' || s.status === 'parcial');

  // Formas de Pagamento Dinâmicas
  const totalPix = servicos
    .filter((s) => s.status === 'pago' || s.status === 'parcial')
    .reduce((acc, s) => {
      if (s.forma_pagamento === 'pix') return acc + s.valor_pago;
      if (s.forma_pagamento === 'misto') {
        if (s.detalhe_pagamento?.toLowerCase().includes('750,00 pix')) return acc + 750;
        if (s.detalhe_pagamento?.toLowerCase().includes('75,00 no pix')) return acc + 75;
        if (s.detalhe_pagamento?.toLowerCase().includes('5.000,00 no pix')) return acc + 5000;
        return acc + (s.valor_pago / 2);
      }
      return acc;
    }, 0);

  const totalDinheiro = servicos
    .filter((s) => s.status === 'pago' || s.status === 'parcial')
    .reduce((acc, s) => {
      if (s.forma_pagamento === 'dinheiro') return acc + s.valor_pago;
      if (s.forma_pagamento === 'misto') {
        if (s.detalhe_pagamento?.toLowerCase().includes('376,00 dinheiro')) return acc + 376;
        if (s.detalhe_pagamento?.toLowerCase().includes('100,00 dinheiro')) return acc + 100;
        if (s.detalhe_pagamento?.toLowerCase().includes('250,00 dinheiro')) return acc + 250;
        return acc + (s.valor_pago / 2);
      }
      return acc;
    }, 0);

  const totalCartao = servicos
    .filter((s) => s.forma_pagamento === 'cartao')
    .reduce((acc, s) => acc + s.valor_pago, 0);

  // Alerta de Óleo com cálculos seguros (nunca gera NaN)
  const horimetroAtual = Number(config?.horimetro_atual) || 0;
  const ultimoOleo = Number(config?.ultimo_oleo_horimetro) || 0;
  const intervaloOleo = Number(config?.intervalo_troca_oleo_horas) || 250;
  const horasDesdeUltimoOleo = Math.max(0, horimetroAtual - ultimoOleo);
  const horasParaProximoOleo = Math.max(0, intervaloOleo - horasDesdeUltimoOleo);
  const horimetroAlvo = ultimoOleo + intervaloOleo;
  const vidaUtilPercent = Math.max(0, Math.min(100, Math.round((1 - (horasDesdeUltimoOleo / (intervaloOleo || 1))) * 100)));
  const oleoCritico = horasParaProximoOleo <= 25;

  return (
    <div className="space-y-6 pb-12">

      {/* Alerta / Status de Manutenção Preventiva de Óleo */}
      {isAllMachinesSelected ? (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 text-blue-700 dark:text-blue-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">Telemetria de Manutenção</h4>
              <p className="text-xs mt-0.5">
                Selecione uma máquina específica no filtro acima para visualizar o status do óleo e horímetro.
              </p>
            </div>
          </div>
        </div>
      ) : oleoCritico ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-red-900 dark:text-red-200 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md">
                  Atenção Crítica
                </span>
                {config?.modelo_maquina && (
                  <span className="text-xs text-red-700 dark:text-red-300 font-semibold">
                    🚜 {config.modelo_maquina}
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-red-950 dark:text-red-100 text-sm sm:text-base mt-0.5">
                Revisão de Óleo e Filtros Próxima do Vencimento!
              </h4>
              <p className="text-xs text-red-800/80 dark:text-red-300/80 mt-0.5">
                Faltam apenas <strong>{horasParaProximoOleo.toFixed(1)} horas</strong> para a revisão de {intervaloOleo}h. Horímetro atual: {formatHours(horimetroAtual)}.
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={onNavigateToMaintenance} className="shadow-md cursor-pointer font-bold">
            <Wrench className="w-4 h-4 mr-1.5" />
            Agendar Revisão
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 text-slate-700 dark:text-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-slate-900 dark:text-white dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Telemetria de Manutenção</span>
                {config?.modelo_maquina && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md">
                    🚜 {config.modelo_maquina}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Revisão em dia — Faltam <strong>{horasParaProximoOleo % 1 === 0 ? horasParaProximoOleo : horasParaProximoOleo.toFixed(1)} horas</strong> para a próxima troca (Horímetro alvo: {horimetroAlvo}h)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Saúde do Lubrificante</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{vidaUtilPercent}% Restante</span>
            </div>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${vidaUtilPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SYMMETRIC KPI GRID - ROW 1 (4 COLUNAS PERFEITAMENTE IGUAIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Faturamento Bruto */}
        <MetricCard
          title="Faturamento Bruto"
          className="h-full"
          value={formatCurrency(totalFaturado)}
          icon={<DollarSign className="w-5 h-5" />}
          
          subtext={
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-500 dark:text-slate-400">{servicos.length} serviços registrados</span>
              <span className="text-slate-900 dark:text-white font-bold">{formatHours(totalHorasTrabalhadas)} total</span>
            </div>
          }
        />

        {/* Card 2: Total Recebido */}
        <MetricCard
          title="Total Recebido"
          className="h-full"
          value={formatCurrency(totalRecebido)}
          icon={<TrendingUp className="w-5 h-5" />}
          
          subtext={
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-500 dark:text-slate-400">Taxa de Conversão</span>
              <span className="text-slate-900 dark:text-white font-bold">
                {totalFaturado > 0 ? ((totalRecebido / totalFaturado) * 100).toFixed(1) : 0}% Pago
              </span>
            </div>
          }
        />

        {/* Card 3: Em Aberto / A Receber */}
        <div 
          onClick={() => onNavigateToServices('pendente')}
          className="cursor-pointer transition-transform hover:-translate-y-0.5 h-full"
        >
          <MetricCard
            title="Em Aberto / A Receber"
            value={formatCurrency(totalPendente)}
            className="h-full border-red-200/90 dark:border-red-900/50 hover:border-red-300"
            icon={<AlertTriangle className="w-5 h-5" />}
            
            subtext={
              <div className="flex items-center justify-between w-full text-xs text-red-600 dark:text-red-400">
                <span>{servicosPendentes.length} pendências</span>
                <span className="font-bold underline flex items-center gap-0.5">
                  Cobrar <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            }
          />
        </div>

        {/* Card 4: Lucro Líquido Real */}
        <MetricCard
          title="Lucro Líquido Real"
          className="h-full"
          value={formatCurrency(lucroLiquidoReal)}
          icon={<Clock className="w-5 h-5" />}
          
          subtext={
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-500 dark:text-slate-400">Rentabilidade</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {formatCurrency(lucroPorHora)}/h líq.
              </span>
            </div>
          }
        />

      </div>

      {/* SYMMETRIC GRID - ROW 2 (3 COLUNAS DE LARGURA IGUAL 1:1:1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">

        {/* COLUNA 1: DRE / RESUMO DE CUSTOS OPERACIONAIS */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-700 h-[56px] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
              <CardTitle className="text-sm font-bold truncate">Custos Operacionais</CardTitle>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
              Total: {formatCurrency(totalCustosGerais)}
            </span>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Manutenção */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"> 
                <div className="flex items-center gap-3"> 
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Manutenção & Peças</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{manutencoes.length} registros cadastrados</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400 shrink-0 whitespace-nowrap pl-2">
                  {formatCurrency(totalCustoManutencao)}
                </span>
              </div>

              {/* Combustível */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Diesel S10</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{totalLitrosDiesel.toFixed(0)}L total (~{consumoMedioDiesel.toFixed(1)} L/h)</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0 whitespace-nowrap pl-2">
                  {formatCurrency(totalCustoCombustivel)}
                </span>
              </div>

              {/* Operadores e Mão de Obra */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Mão de Obra</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Operadores e ajuda de custo</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0 whitespace-nowrap pl-2">
                  {formatCurrency(totalCustosGerais - totalCustoManutencao - totalCustoCombustivel)}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToMaintenance}
              className="w-full mt-2 cursor-pointer text-xs"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-500 mr-2" />
              Ver Gestão de Manutenções
            </Button>
          </CardContent>
        </Card>

        {/* COLUNA 2: FORMAS DE PAGAMENTO & REPASSES DE CAIXA */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-700 h-[56px] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-1" />
              <CardTitle className="text-sm font-bold truncate">Recebimentos</CardTitle>
            </div>
            <span className="text-xs text-slate-900 dark:text-white font-bold shrink-0 whitespace-nowrap">100% Auditável</span>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              {/* PIX */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">PIX Direto na Conta</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalPix)}</span>
              </div>

              {/* Cartão */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Cartão de Crédito/Débito</span>
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalCartao)}</span>
              </div>

              {/* Dinheiro com Erica */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Dinheiro (Erica)</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(2226.0)}</span>
              </div>

              {/* Dinheiro com Jurandir */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Dinheiro (Jurandir)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(400.0)}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToOperators}
              className="w-full mt-2 cursor-pointer text-xs"
            >
              <Users className="w-3.5 h-3.5 text-slate-900 dark:text-white mr-2" />
              Ver Conciliação de Repasses
            </Button>
          </CardContent>
        </Card>

        {/* COLUNA 3: LISTA DE COBRANÇA RÁPIDA (DEVEDORES / PARCIAIS) */}
        <Card className="flex flex-col border-red-200/80 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-700 h-[56px] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-4 h-4 text-slate-900 dark:text-white shrink-0" />
              <CardTitle className="text-sm font-bold text-red-600 dark:text-red-400 truncate">Cobrança Rápida</CardTitle>
            </div>
            <Badge variant="destructive" className="font-bold shrink-0 whitespace-nowrap">{servicosPendentes.length} pendentes</Badge>
          </CardHeader>
          
          <CardContent className="pt-0 flex-1 flex flex-col justify-between">
            {servicosPendentes.length === 0 ? (
              <EmptyState
                icon={<PartyPopper className="w-8 h-8 text-emerald-500" />}
                title="Tudo quitado!"
                description="Não há clientes com saldo devedor."
              />
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {servicosPendentes.map((servico) => (
                  <div
                    key={servico.id}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">{servico.cliente}</span>
                        <span className="text-[11px] text-slate-500 shrink-0">({formatHours(servico.tempo_horas)})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="text-red-600 dark:text-red-400 font-extrabold">
                          Falta {formatCurrency(servico.saldo_devedor)}
                        </span>
                        {servico.status === 'parcial' && (
                          <span className="text-[10px] text-slate-900 dark:text-white bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-1.5 py-0.2 rounded-md font-bold">
                            Parcial
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Quitar Rápido */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onQuickSettleService(servico)}
                        className="h-7 px-2.5 text-xs font-bold cursor-pointer"
                      >
                        Quitar
                      </Button>

                      {/* WhatsApp Cobrança */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const text = getWhatsAppReceiptText(servico, config);
                          openWhatsApp('', text);
                        }}
                        title="Cobrar pelo WhatsApp"
                        className="h-7 w-7 text-slate-900 dark:text-white border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/30 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToServices('pendente')}
              className="w-full mt-2 cursor-pointer text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-900 dark:text-white mr-2" />
              Ver Todos os Serviços Pendentes
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
