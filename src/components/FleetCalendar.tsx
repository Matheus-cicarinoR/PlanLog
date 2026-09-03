import React, { useState, useMemo, useEffect } from 'react';
import { 
 Calendar as CalendarIcon, 
 ChevronLeft, 
 ChevronRight, 
 Plus, 
 Clock, 
 Wrench, 
 Tractor, 
 User, 
 DollarSign, 
 AlertCircle, 
 CheckCircle2, 
 X, 
 Filter, 
 Layers, 
 Phone, 
 Send, 
 Trash2, 
 Edit3,
 Sparkles,
 ArrowRight,
 List,
 CalendarDays,
 Columns3
} from 'lucide-react';
import { Servico, Manutencao, Maquina, Operador, ConfiguracoesSistema, PaymentMethod, TipoManutencao, Cliente } from '../types';
import { useSystemState } from '../context/SystemContext';
import { formatCurrency, formatHours, formatDate } from '../lib/formatters';
import { getWhatsAppReceiptText, openWhatsApp } from '../lib/whatsapp';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface FleetCalendarProps {
 servicos: Servico[];
 manutencoes: Manutencao[];
 maquinas: Maquina[];
 operadores: Operador[];
 config: ConfiguracoesSistema;
 selectedMaquinaId: string;
 onSelectMaquina: (id: string) => void;
 onSaveService: (servico: Servico) => Promise<void>;
 onDeleteService: (id: string) => Promise<void>;
 onQuickSettleService: (servico: Servico) => Promise<void>;
 onSaveMaintenance: (manutencao: Manutencao) => Promise<void>;
 onDeleteMaintenance: (id: string) => Promise<void>;
 onGenerateReceipt?: (servico: Servico) => void;
}

type CalendarViewMode = 'month' | 'week' | 'list';
type EventFilterType = 'all' | 'servico' | 'manutencao';
type StatusFilterType = 'all' | 'pending' | 'completed';

export const FleetCalendar: React.FC<FleetCalendarProps> = ({
 servicos,
 manutencoes,
 maquinas,
 operadores,
 config,
 selectedMaquinaId,
 onSelectMaquina,
 onSaveService,
 onDeleteService,
 onQuickSettleService,
 onSaveMaintenance,
 onDeleteMaintenance,
 onGenerateReceipt,
}) => {
 const [currentDate, setCurrentDate] = useState(new Date());
 const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
 const [typeFilter, setTypeFilter] = useState<EventFilterType>('all');
 const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
 const [selectedMobileDay, setSelectedMobileDay] = useState<string>(new Date().toISOString().split('T')[0]);
 
 // Modais
 const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
 const [scheduleType, setScheduleType] = useState<'servico' | 'manutencao'>('servico');
 const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<string>(new Date().toISOString().split('T')[0]);
 
 // Modal de Detalhes
 const [selectedEvent, setSelectedEvent] = useState<{
  type: 'servico' | 'manutencao';
  data: Servico | Manutencao;
 } | null>(null);

 const { clientes, handleSaveCliente } = useSystemState();

 // Travar o scroll da página no fundo enquanto qualquer modal de agendamento ou detalhes estiver aberto
 useEffect(() => {
  if (isScheduleModalOpen || selectedEvent !== null) {
   document.body.style.overflow = 'hidden';
  } else {
   document.body.style.overflow = 'unset';
  }
  return () => {
   document.body.style.overflow = 'unset';
  };
 }, [isScheduleModalOpen, selectedEvent]);

 // Form states para Agendamento de Serviço
 const [svcCliente, setSvcCliente] = useState('');
 const [svcClienteId, setSvcClienteId] = useState<string | undefined>(undefined);
 const [showQuickAddClientInCalendar, setShowQuickAddClientInCalendar] = useState(false);
 const [calQuickClientNome, setCalQuickClientNome] = useState('');
 const [calQuickClientPhone, setCalQuickClientPhone] = useState('');
 const [calQuickClientCity, setCalQuickClientCity] = useState('');
 const [calQuickClientAddress, setCalQuickClientAddress] = useState('');
 const [svcMaquinaId, setSvcMaquinaId] = useState(selectedMaquinaId === 'todas' ? (maquinas[0]?.id || '') : (selectedMaquinaId || maquinas[0]?.id || ''));
 const [svcData, setSvcData] = useState(new Date().toISOString().split('T')[0]);
 const [svcHoras, setSvcHoras] = useState(1.0);
 const [svcValorHora, setSvcValorHora] = useState(250.0);
 const [svcStatus, setSvcStatus] = useState<'pago' | 'pendente' | 'parcial'>('pendente');
 const [svcFormaPagamento, setSvcFormaPagamento] = useState<PaymentMethod>('pix');
 const [svcOperador, setSvcOperador] = useState('Jurandir');
 const [svcDescricao, setSvcDescricao] = useState('');
 const [svcLocalizacao, setSvcLocalizacao] = useState('');

 // Form states para Agendamento de Manutenção
 const [mntTitulo, setMntTitulo] = useState('');
 const [mntMaquinaId, setMntMaquinaId] = useState(selectedMaquinaId === 'todas' ? (maquinas[0]?.id || '') : (selectedMaquinaId || maquinas[0]?.id || ''));
 const [mntData, setMntData] = useState(new Date().toISOString().split('T')[0]);
 const [mntTipo, setMntTipo] = useState<TipoManutencao>('preventiva');
 const [mntStatus, setMntStatus] = useState<'agendado' | 'em_andamento' | 'urgente' | 'concluido'>('agendado');
 const [mntValor, setMntValor] = useState(0);
 const [mntMecanico, setMntMecanico] = useState('');
 const [mntDescricao, setMntDescricao] = useState('');

 // Helper de Navegação de Mês/Ano
 const handlePrevMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
 };

 const handleNextMonth = () => {
  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
 };

 const handleToday = () => {
  setCurrentDate(new Date());
 };

 // Prepara abertura do modal com data pré-selecionada
 const handleOpenScheduleForDate = (dateStr: string, defaultType: 'servico' | 'manutencao' = 'servico') => {
  setSelectedDateForNewEvent(dateStr);
  setSvcData(dateStr);
  setMntData(dateStr);
  setScheduleType(defaultType);
  
  // Set default valor_hora
  const targetMaq = maquinas.find(m => m.id === (selectedMaquinaId !== 'todas' ? selectedMaquinaId : maquinas[0]?.id));
  setSvcValorHora(targetMaq ? Number(targetMaq.valor_hora_padrao) || 250 : 250);
  setSvcMaquinaId(targetMaq?.id || maquinas[0]?.id || '');
  setMntMaquinaId(targetMaq?.id || maquinas[0]?.id || '');
  
  setIsScheduleModalOpen(true);
 };

 // Salvar Novo Cliente Rápido no Calendário
 const handleSaveCalQuickClient = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (!calQuickClientNome.trim()) {
   alert('Por favor, digite o nome completo do cliente.');
   return;
  }

  const newCli: Cliente = {
   id: `cli-${Date.now()}`,
   nome: calQuickClientNome.trim(),
   telefone: calQuickClientPhone.trim(),
   cidade: calQuickClientCity.trim(),
   endereco: calQuickClientAddress.trim(),
   created_at: new Date().toISOString()
  };

  await handleSaveCliente(newCli);
  setSvcCliente(newCli.nome);
  setSvcClienteId(newCli.id);
  if (newCli.endereco && !svcLocalizacao) {
   setSvcLocalizacao(`${newCli.endereco}${newCli.cidade ? ` (${newCli.cidade})` : ''}`);
  }
  setShowQuickAddClientInCalendar(false);
  setCalQuickClientNome('');
  setCalQuickClientPhone('');
  setCalQuickClientCity('');
  setCalQuickClientAddress('');
 };

 // Salvar Novo Serviço
 const handleSaveNewService = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!svcClienteId || !svcCliente.trim()) {
   alert('Por favor, selecione um cliente cadastrado ou clique em "+ Novo" para cadastrar.');
   setShowQuickAddClientInCalendar(true);
   return;
  }

  const totalVal = Number((svcHoras * svcValorHora).toFixed(2));
  const pagoVal = svcStatus === 'pago' ? totalVal : 0;
  const devedorVal = totalVal - pagoVal;

  const newServico: Servico = {
   id: `svc-${Date.now()}`,
   maquina_id: svcMaquinaId,
   cliente_id: svcClienteId,
   cliente: svcCliente.trim(),
   tempo_horas: Number(svcHoras),
   valor_hora: Number(svcValorHora),
   valor_total: totalVal,
   valor_pago: pagoVal,
   saldo_devedor: devedorVal,
   forma_pagamento: svcFormaPagamento,
   data_servico: svcData,
   status: svcStatus,
   operador_responsavel: svcOperador,
   descricao_servico: svcDescricao,
   localizacao: svcLocalizacao,
   created_at: new Date().toISOString(),
  };

  await onSaveService(newServico);
  setIsScheduleModalOpen(false);
  // Reset
  setSvcCliente('');
  setSvcClienteId(undefined);
  setSvcDescricao('');
  setSvcLocalizacao('');
  setShowQuickAddClientInCalendar(false);
 };

 // Salvar Nova Manutenção
 const handleSaveNewMaintenance = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!mntTitulo.trim()) return;

  const targetMaq = maquinas.find(m => m.id === mntMaquinaId);

  const newManutencao: Manutencao = {
   id: `mnt-${Date.now()}`,
   maquina_id: mntMaquinaId,
   titulo: mntTitulo.trim(),
   tipo: mntTipo,
   horimetro_momento: Number(targetMaq?.horimetro_atual || 0),
   valor_total: Number(mntValor) || 0,
   data_manutencao: mntData,
   mecanico_responsavel: mntMecanico.trim(),
   status: mntStatus,
   descricao_pecas: mntDescricao,
   created_at: new Date().toISOString(),
  };

  await onSaveMaintenance(newManutencao);
  setIsScheduleModalOpen(false);
  // Reset
  setMntTitulo('');
  setMntDescricao('');
  setMntMecanico('');
  setMntValor(0);
 };

 // Dias do mês atual para o Grid
 const calendarDays = useMemo(() => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayIndex = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Segunda...
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const days: { date: Date; dateString: string; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Dias do mês anterior para preencher a primeira semana
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayIndex - 1; i >= 0; i--) {
   const d = new Date(year, month - 1, prevMonthLastDay - i);
   const dStr = d.toISOString().split('T')[0];
   days.push({
    date: d,
    dateString: dStr,
    isCurrentMonth: false,
    isToday: dStr === new Date().toISOString().split('T')[0]
   });
  }

  // Dias do mês atual
  for (let i = 1; i <= totalDaysInMonth; i++) {
   const d = new Date(year, month, i);
   const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
   days.push({
    date: d,
    dateString: dStr,
    isCurrentMonth: true,
    isToday: dStr === new Date().toISOString().split('T')[0]
   });
  }

  // Dias do próximo mês para completar 35 ou 42 células (múltiplo de 7)
  const remainingCells = 7 - (days.length % 7);
  if (remainingCells < 7) {
   for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const dStr = d.toISOString().split('T')[0];
    days.push({
     date: d,
     dateString: dStr,
     isCurrentMonth: false,
     isToday: dStr === new Date().toISOString().split('T')[0]
    });
   }
  }

  return days;
 }, [currentDate]);

 // Eventos mapeados por data
 const eventsByDate = useMemo(() => {
  const map: Record<string, { servicos: Servico[]; manutencoes: Manutencao[] }> = {};

  // Filtrar serviços
  servicos.forEach(s => {
   if (selectedMaquinaId && selectedMaquinaId !== 'todas' && s.maquina_id !== selectedMaquinaId) return;
   if (typeFilter === 'manutencao') return;
   if (statusFilter === 'pending' && s.status === 'pago') return;
   if (statusFilter === 'completed' && s.status !== 'pago') return;

   const d = s.data_servico ? s.data_servico.split('T')[0] : '';
   if (!d) return;
   if (!map[d]) map[d] = { servicos: [], manutencoes: [] };
   map[d].servicos.push(s);
  });

  // Filtrar manutenções
  manutencoes.forEach(m => {
   if (selectedMaquinaId && selectedMaquinaId !== 'todas' && m.maquina_id !== selectedMaquinaId) return;
   if (typeFilter === 'servico') return;
   if (statusFilter === 'pending' && m.status === 'concluido') return;
   if (statusFilter === 'completed' && m.status !== 'concluido') return;

   const d = (m.data_manutencao || m.created_at || '').split('T')[0];
   if (!d) return;
   if (!map[d]) map[d] = { servicos: [], manutencoes: [] };
   map[d].manutencoes.push(m);
  });

  return map;
 }, [servicos, manutencoes, selectedMaquinaId, typeFilter, statusFilter]);

 // Estatísticas do Mês Atual
 const monthStats = useMemo(() => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  let countServicos = 0;
  let horasServicos = 0;
  let faturamentoServicos = 0;
  let countManutencoes = 0;
  let manutencoesPendentes = 0;

  servicos.forEach(s => {
   if (selectedMaquinaId && selectedMaquinaId !== 'todas' && s.maquina_id !== selectedMaquinaId) return;
   if (!s.data_servico) return;
   const d = new Date(s.data_servico);
   if (d.getFullYear() === year && d.getMonth() === month) {
    countServicos++;
    horasServicos += Number(s.tempo_horas) || 0;
    faturamentoServicos += Number(s.valor_total) || 0;
   }
  });

  manutencoes.forEach(m => {
   if (selectedMaquinaId && selectedMaquinaId !== 'todas' && m.maquina_id !== selectedMaquinaId) return;
   const dStr = m.data_manutencao || m.created_at;
   if (!dStr) return;
   const d = new Date(dStr);
   if (d.getFullYear() === year && d.getMonth() === month) {
    countManutencoes++;
    if (m.status !== 'concluido') manutencoesPendentes++;
   }
  });

  return {
   totalEventos: countServicos + countManutencoes,
   countServicos,
   horasServicos,
   faturamentoServicos,
   countManutencoes,
   manutencoesPendentes,
  };
 }, [servicos, manutencoes, currentDate, selectedMaquinaId]);

 // Próximos eventos para lista
 const upcomingEvents = useMemo(() => {
  const allList: {
   type: 'servico' | 'manutencao';
   dateStr: string;
   data: Servico | Manutencao;
  }[] = [];

  servicos.forEach(s => {
   if (selectedMaquinaId && selectedMaquinaId !== 'todas' && s.maquina_id !== selectedMaquinaId) return;
   if (typeFilter === 'manutencao') return;
   if (statusFilter === 'pending' && s.status === 'pago') return;
   if (statusFilter === 'completed' && s.status !== 'pago') return;
   allList.push({
    type: 'servico',
    dateStr: s.data_servico ? s.data_servico.split('T')[0] : '',
    data: s,
   });
  });

  manutencoes.forEach(m => {
   if (selectedMaquinaId && selectedMaquinaId !== 'todas' && m.maquina_id !== selectedMaquinaId) return;
   if (typeFilter === 'servico') return;
   if (statusFilter === 'pending' && m.status === 'concluido') return;
   if (statusFilter === 'completed' && m.status !== 'concluido') return;
   allList.push({
    type: 'manutencao',
    dateStr: (m.data_manutencao || m.created_at || '').split('T')[0],
    data: m,
   });
  });

  // Ordenar por data decrescente ou crescente
  return allList.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
 }, [servicos, manutencoes, selectedMaquinaId, typeFilter, statusFilter]);

 const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
 ];

 const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

 return (
  <div className="space-y-6 pb-12">
   {/* Header & Controls Panel */}
   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-6 shadow-sm">
    <div>
     <div className="flex items-center gap-2.5">
      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
       <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div>
       <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
        Agenda da Frota
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-500/30">
         {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Badge>
       </h2>
       <p className="text-xs sm:text-sm text-slate-500 ">
        Visualize toda a programação de serviços, locações e manutenções preventivas/corretivas.
       </p>
      </div>
     </div>
    </div>

    {/* Action Controls */}
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
     {/* Machine Filter Dropdown */}
     <div className="w-full sm:w-auto">
      <select
       value={selectedMaquinaId || 'todas'}
       onChange={(e) => onSelectMaquina(e.target.value)}
       className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500/50 cursor-pointer"
      >
       <option value="todas">🚜 Todas as Máquinas</option>
       {maquinas.map((maq) => (
        <option key={maq.id} value={maq.id}>
         🚜 {maq.nome} ({maq.placa})
        </option>
       ))}
      </select>
     </div>

     {/* Month Navigation */}
     <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 ">
      <button
       onClick={handlePrevMonth}
       className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
       title="Mês Anterior"
      >
       <ChevronLeft className="w-4 h-4" />
      </button>
      <button
       onClick={handleToday}
       className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-amber-500 transition-colors"
      >
       Hoje
      </button>
      <button
       onClick={handleNextMonth}
       className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
       title="Próximo Mês"
      >
       <ChevronRight className="w-4 h-4" />
      </button>
     </div>

     {/* View Mode Toggle */}
     <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 ">
      <button
       onClick={() => setViewMode('month')}
       className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
        viewMode === 'month'
         ? 'bg-white text-amber-600 shadow-sm'
         : 'text-slate-500 hover:text-slate-900 '
       }`}
      >
       <CalendarDays className="w-3.5 h-3.5" />
       Mês
      </button>
      <button
       onClick={() => setViewMode('list')}
       className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
        viewMode === 'list'
         ? 'bg-white text-amber-600 shadow-sm'
         : 'text-slate-500 hover:text-slate-900 '
       }`}
      >
       <List className="w-3.5 h-3.5" />
       Lista
      </button>
     </div>

     {/* Novo Agendamento Button */}
     <Button
      onClick={() => handleOpenScheduleForDate(new Date().toISOString().split('T')[0])}
      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 rounded-xl px-4 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
     >
      <Plus className="w-4 h-4 stroke-[3]" />
      Novo Agendamento
     </Button>
    </div>
   </div>

   {/* KPI Stats Bar for Selected Month */}
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-500/20 shrink-0">
      <Tractor className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Serviços no Mês</span>
      <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
       <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{monthStats.countServicos}</span>
       <span className="text-[11px] sm:text-xs text-blue-600 font-semibold font-mono">({formatHours(monthStats.horasServicos)})</span>
      </div>
     </div>
    </div>

    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-500/20 shrink-0">
      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Faturamento Prev.</span>
      <span className="text-sm sm:text-lg font-black text-emerald-600 font-mono block truncate">{formatCurrency(monthStats.faturamentoServicos)}</span>
     </div>
    </div>

    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-500/20 shrink-0">
      <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Manutenções</span>
      <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
       <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{monthStats.countManutencoes}</span>
       {monthStats.manutencoesPendentes > 0 && (
        <span className="text-[10px] sm:text-xs text-amber-500 font-bold">({monthStats.manutencoesPendentes} pend.)</span>
       )}
      </div>
     </div>
    </div>

    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-500/20 shrink-0">
      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Total Atividades</span>
      <div className="flex items-baseline gap-1">
       <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{monthStats.totalEventos}</span>
       <span className="text-[11px] sm:text-xs text-slate-500">agendas</span>
      </div>
     </div>
    </div>
   </div>

   {/* Filter Chips Bar */}
   <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 ">
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
     <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
      <Filter className="w-3.5 h-3.5" /> Filtrar:
     </span>
     <button
      onClick={() => setTypeFilter('all')}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
       typeFilter === 'all'
        ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
        : 'bg-white text-slate-600 border border-slate-200 '
      }`}
     >
      Todos
     </button>
     <button
      onClick={() => setTypeFilter('servico')}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
       typeFilter === 'servico'
        ? 'bg-blue-600 text-white shadow-sm font-bold'
        : 'bg-white text-slate-600 border border-slate-200 '
      }`}
     >
      🚜 Serviços
     </button>
     <button
      onClick={() => setTypeFilter('manutencao')}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
       typeFilter === 'manutencao'
        ? 'bg-purple-600 text-white shadow-sm font-bold'
        : 'bg-white text-slate-600 border border-slate-200 '
      }`}
     >
      🔧 Manutenções
     </button>
    </div>

    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
     <button
      onClick={() => setStatusFilter('all')}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
       statusFilter === 'all'
        ? 'bg-slate-900 text-white font-bold'
        : 'text-slate-500 hover:text-slate-900 '
      }`}
     >
      Todos Status
     </button>
     <button
      onClick={() => setStatusFilter('pending')}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
       statusFilter === 'pending'
        ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30 font-bold'
        : 'text-slate-500 hover:text-slate-900 '
      }`}
     >
      ⏳ Pendentes
     </button>
     <button
      onClick={() => setStatusFilter('completed')}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
       statusFilter === 'completed'
        ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 font-bold'
        : 'text-slate-500 hover:text-slate-900 '
      }`}
     >
      ✅ Concluídos
     </button>
    </div>
   </div>

   {/* CALENDAR VIEW: MONTH GRID (100% FLUIDO - ZERO SCROLL LATERAL) */}
   {viewMode === 'month' && (
    <div className="space-y-4">
     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2">
       {weekDayNames.map((d, index) => (
        <div 
         key={d} 
         className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
          index === 0 || index === 6 ? 'text-amber-500' : 'text-slate-500 '
         }`}
        >
         <span className="hidden sm:inline">{d}</span>
         <span className="sm:hidden">{d.charAt(0)}</span>
        </div>
       ))}
      </div>

      {/* Days Grid Cells */}
      <div className="grid grid-cols-7 w-full auto-rows-fr divide-x divide-y divide-slate-200 border-b border-slate-200 ">
       {calendarDays.map((dayItem, index) => {
        const dayEvents = eventsByDate[dayItem.dateString] || { servicos: [], manutencoes: [] };
        const totalDayCount = dayEvents.servicos.length + dayEvents.manutencoes.length;
        const isSelected = selectedMobileDay === dayItem.dateString;

        return (
         <div
          key={index}
          onClick={() => setSelectedMobileDay(dayItem.dateString)}
          className={`min-h-[56px] sm:min-h-[135px] p-1 sm:p-2 flex flex-col justify-between transition-colors relative cursor-pointer group ${
           dayItem.isCurrentMonth
            ? 'bg-white '
            : 'bg-slate-50/60 opacity-40'
          } ${
           isSelected
            ? 'ring-2 ring-inset ring-amber-500 bg-amber-50/40 '
            : dayItem.isToday
            ? 'ring-1 ring-inset ring-amber-500/60 bg-amber-50/20 '
            : 'hover:bg-slate-50/80 '
          }`}
         >
          {/* Cell Top Header: Date number & Quick Add Button */}
          <div className="flex items-center justify-between">
           <span
            className={`text-[11px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
             dayItem.isToday
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : isSelected
              ? 'bg-slate-900 text-white font-bold'
              : dayItem.isCurrentMonth
              ? 'text-slate-800 '
              : 'text-slate-400 '
            }`}
           >
            {dayItem.date.getDate()}
           </span>

           {/* Quick "+" Add Button (Desktop only) */}
           <button
            onClick={(e) => {
             e.stopPropagation();
             handleOpenScheduleForDate(dayItem.dateString);
            }}
            className="hidden sm:block opacity-0 group-hover:opacity-100 p-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-sm cursor-pointer"
            title="Agendar neste dia"
           >
            <Plus className="w-3 h-3 stroke-[3]" />
           </button>
          </div>

          {/* MOBILE VIEW: Compact Dots / Badges (sm:hidden) */}
          <div className="sm:hidden flex items-center justify-center gap-0.5 mt-1 flex-wrap">
           {dayEvents.servicos.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
           )}
           {dayEvents.manutencoes.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
           )}
           {totalDayCount > 2 && (
            <span className="text-[8px] font-black text-slate-500 font-mono">+{totalDayCount}</span>
           )}
          </div>

          {/* DESKTOP VIEW: Full Badges (hidden sm:block) */}
          <div className="hidden sm:block flex-1 space-y-1 overflow-y-auto max-h-[70px] sm:max-h-[90px] custom-scrollbar mt-1">
           {/* Serviços */}
           {dayEvents.servicos.map((s) => {
            const maq = maquinas.find(m => m.id === s.maquina_id);
            return (
             <div
              key={s.id}
              onClick={(e) => {
               e.stopPropagation();
               setSelectedEvent({ type: 'servico', data: s });
              }}
              className={`px-1.5 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-all border shadow-2xs flex items-center gap-1 ${
               s.status === 'pago'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : s.status === 'parcial'
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
              }`}
              title={`Serviço: ${s.cliente} - ${maq?.nome || 'Máquina'} (${formatHours(s.tempo_horas)})`}
             >
              <span className="shrink-0">🚜</span>
              <span className="truncate flex-1">{s.cliente}</span>
              <span className="shrink-0 opacity-80">{s.tempo_horas}h</span>
             </div>
            );
           })}

           {/* Manutenções */}
           {dayEvents.manutencoes.map((m) => {
            const maq = maquinas.find(maqItem => maqItem.id === m.maquina_id);
            return (
             <div
              key={m.id}
              onClick={(e) => {
               e.stopPropagation();
               setSelectedEvent({ type: 'manutencao', data: m });
              }}
              className={`px-1.5 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-all border shadow-2xs flex items-center gap-1 ${
               m.status === 'urgente'
                ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 animate-pulse'
                : m.status === 'concluido'
                ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                : 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
              }`}
              title={`Manutenção: ${m.titulo} (${maq?.nome || 'Máquina'}) - Status: ${m.status}`}
             >
              <span className="shrink-0">🔧</span>
              <span className="truncate flex-1">{m.titulo}</span>
             </div>
            );
           })}
          </div>

          {totalDayCount > 3 && (
           <span className="hidden sm:block text-[9px] font-bold text-slate-400 text-right mt-1">
            +{totalDayCount - 3} mais
           </span>
          )}
         </div>
        );
       })}
      </div>
     </div>

     {/* PAINEL DE ATIVIDADES DO DIA SELECIONADO NO MOBILE (sm:hidden) */}
     <div className="sm:hidden p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
       <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Atividades do Dia</span>
        <h4 className="text-sm font-black text-slate-900 ">
         {formatDate(selectedMobileDay)}
        </h4>
       </div>
       <Button
        size="sm"
        onClick={() => handleOpenScheduleForDate(selectedMobileDay)}
        className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs"
       >
        <Plus className="w-3.5 h-3.5 mr-1 stroke-[3]" />
        Agendar
       </Button>
      </div>

      {(() => {
       const dayEvents = eventsByDate[selectedMobileDay] || { servicos: [], manutencoes: [] };
       const hasEvents = dayEvents.servicos.length > 0 || dayEvents.manutencoes.length > 0;

       if (!hasEvents) {
        return (
         <p className="text-xs text-slate-500 py-3 text-center">
          Nenhum agendamento nesta data.
         </p>
        );
       }

       return (
        <div className="space-y-2">
         {dayEvents.servicos.map((s) => (
          <div
           key={s.id}
           onClick={() => setSelectedEvent({ type: 'servico', data: s })}
           className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
          >
           <div className="flex items-center gap-2.5">
            <span className="text-lg">🚜</span>
            <div>
             <h5 className="font-bold text-xs text-slate-900 ">{s.cliente}</h5>
             <span className="text-[10px] text-slate-500 font-mono">
              {formatHours(s.tempo_horas)} • {formatCurrency(s.valor_total)}
             </span>
            </div>
           </div>
           <Badge
            variant={s.status === 'pago' ? 'success' : s.status === 'parcial' ? 'warning' : 'danger'}
            className="text-[9px] font-black uppercase"
           >
            {s.status}
           </Badge>
          </div>
         ))}

         {dayEvents.manutencoes.map((m) => (
          <div
           key={m.id}
           onClick={() => setSelectedEvent({ type: 'manutencao', data: m })}
           className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
          >
           <div className="flex items-center gap-2.5">
            <span className="text-lg">🔧</span>
            <div>
             <h5 className="font-bold text-xs text-slate-900 ">{m.titulo}</h5>
             <span className="text-[10px] text-purple-600 capitalize font-medium">
              {m.tipo.replace('_', ' ')}
             </span>
            </div>
           </div>
           <Badge
            variant={m.status === 'concluido' ? 'success' : m.status === 'urgente' ? 'danger' : 'warning'}
            className="text-[9px] font-black uppercase"
           >
            {m.status}
           </Badge>
          </div>
         ))}
        </div>
       );
      })()}
     </div>
    </div>
   )}

   {/* CALENDAR VIEW: LIST AGENDA */}
   {viewMode === 'list' && (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
     <div className="flex items-center justify-between pb-3 border-b border-slate-200 ">
      <h3 className="font-black text-base text-slate-900 ">
       Próximos Agendamentos & Histórico Cronológico
      </h3>
      <span className="text-xs text-slate-500 font-medium">
       {upcomingEvents.length} atividades encontradas
      </span>
     </div>

     {upcomingEvents.length === 0 ? (
      <div className="text-center py-12">
       <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3 stroke-1" />
       <h4 className="font-bold text-slate-800 ">Nenhum evento agendado</h4>
       <p className="text-xs text-slate-500 mt-1">Clique em "Novo Agendamento" para programar um serviço ou manutenção.</p>
      </div>
     ) : (
      <div className="space-y-3">
       {upcomingEvents.map((item, idx) => {
        const isServico = item.type === 'servico';
        const svc = isServico ? (item.data as Servico) : null;
        const mnt = !isServico ? (item.data as Manutencao) : null;
        const maq = maquinas.find(m => m.id === item.data.maquina_id);

        return (
         <div
          key={idx}
          onClick={() => setSelectedEvent(item)}
          className="p-4 rounded-xl border border-slate-200 hover:border-amber-500/40 bg-slate-50/50 hover:bg-amber-50/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
         >
          <div className="flex items-start sm:items-center gap-3.5">
           <div className={`p-3 rounded-xl shrink-0 ${
            isServico 
             ? 'bg-blue-50 text-blue-600 border border-blue-500/20' 
             : 'bg-purple-50 text-purple-600 border border-purple-500/20'
           }`}>
            {isServico ? <Tractor className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
           </div>
           <div>
            <div className="flex flex-wrap items-center gap-2">
             <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {isServico ? svc?.cliente : mnt?.titulo}
             </h4>
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 ">
              🚜 {maq?.nome || 'Máquina'}
             </span>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isServico
               ? svc?.status === 'pago' ? 'bg-emerald-100 text-emerald-700 ' : 'bg-amber-100 text-amber-700 '
               : mnt?.status === 'concluido' ? 'bg-emerald-100 text-emerald-700 ' : 'bg-purple-100 text-purple-700 '
             }`}>
              {isServico ? svc?.status?.toUpperCase() : mnt?.status?.toUpperCase()}
             </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
             <span className="flex items-center gap-1 font-semibold text-slate-700 ">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
              {formatDate(item.dateStr)}
             </span>
             {isServico && (
              <>
               <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {svc?.tempo_horas} horas
               </span>
               <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Operador: {svc?.operador_responsavel || 'Jurandir'}
               </span>
              </>
             )}
             {!isServico && (
              <span className="flex items-center gap-1">
               <Wrench className="w-3.5 h-3.5" />
               Tipo: {mnt?.tipo}
              </span>
             )}
            </div>
           </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 ">
           <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Valor Total</span>
            <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
             {formatCurrency(isServico ? (svc?.valor_total || 0) : (mnt?.valor_total || 0))}
            </span>
           </div>
           <Button size="sm" variant="ghost" className="text-amber-500 hover:text-amber-600">
            Ver Detalhes <ArrowRight className="w-3.5 h-3.5 ml-1" />
           </Button>
          </div>
         </div>
        );
       })}
      </div>
     )}
    </div>
   )}

   {/* MODAL: NOVO AGENDAMENTO (SERVIÇO OU MANUTENÇÃO) */}
   {isScheduleModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
     <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
       <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
         <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
         <h3 className="font-black text-slate-900 text-base">
          Novo Agendamento na Frota
         </h3>
         <p className="text-xs text-slate-500">Data selecionada: {formatDate(selectedDateForNewEvent)}</p>
        </div>
       </div>
       <button
        onClick={() => setIsScheduleModalOpen(false)}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      {/* Type Switch Tabs */}
      <div className="grid grid-cols-2 p-2 gap-2 bg-slate-100 border-b border-slate-200 shrink-0">
       <button
        type="button"
        onClick={() => setScheduleType('servico')}
        className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
         scheduleType === 'servico'
          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
          : 'text-slate-500 hover:text-slate-900 '
        }`}
       >
        <Tractor className="w-4 h-4" />
        Agendar Serviço / Locação
       </button>
       <button
        type="button"
        onClick={() => setScheduleType('manutencao')}
        className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
         scheduleType === 'manutencao'
          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
          : 'text-slate-500 hover:text-slate-900 '
        }`}
       >
        <Wrench className="w-4 h-4" />
        Agendar Manutenção
       </button>
      </div>

      {/* Scrollable Form Body */}
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
       {scheduleType === 'servico' ? (
        <form onSubmit={handleSaveNewService} className="space-y-4">
         <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
           Máquina / Equipamento *
          </label>
          <select
           value={svcMaquinaId}
           onChange={(e) => {
            setSvcMaquinaId(e.target.value);
            const maq = maquinas.find(m => m.id === e.target.value);
            if (maq?.valor_hora_padrao) setSvcValorHora(maq.valor_hora_padrao);
           }}
           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           required
          >
           {maquinas.map(m => (
            <option key={m.id} value={m.id}>
             🚜 {m.nome} ({m.placa}) - R$ {m.valor_hora_padrao}/h
            </option>
           ))}
          </select>
         </div>

         {/* Cliente Cadastrado com Seleção Obrigatória */}
         <div>
          <div className="flex items-center justify-between mb-1">
           <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-500" /> Cliente Cadastrado *
           </label>
           <button
            type="button"
            onClick={() => setShowQuickAddClientInCalendar(!showQuickAddClientInCalendar)}
            className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-0.5 cursor-pointer"
           >
            <Plus className="w-3 h-3" />
            {showQuickAddClientInCalendar ? 'Fechar' : 'Novo'}
           </button>
          </div>

          {!showQuickAddClientInCalendar ? (
           <div className="space-y-1">
            <select
             value={svcClienteId || ''}
             onChange={(e) => {
              const val = e.target.value;
              if (val === '__new__') {
               setShowQuickAddClientInCalendar(true);
               return;
              }
              const found = clientes.find(c => c.id === val);
              if (found) {
               setSvcCliente(found.nome);
               setSvcClienteId(found.id);
               if (found.endereco && !svcLocalizacao) {
                setSvcLocalizacao(`${found.endereco}${found.cidade ? ` (${found.cidade})` : ''}`);
               }
              } else {
               setSvcCliente('');
               setSvcClienteId(undefined);
              }
             }}
             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
             required
            >
             <option value="">Selecione o cliente cadastrado...</option>
             {clientes.map(cli => (
              <option key={cli.id} value={cli.id}>
               👤 {cli.nome} {cli.telefone ? `(${cli.telefone})` : ''}
              </option>
             ))}
             <option value="__new__">➕ + Cadastrar Novo Cliente Agora</option>
            </select>
            {clientes.length === 0 && (
             <p className="text-[11px] text-amber-600 mt-1 font-semibold">
              Nenhum cliente cadastrado. Clique em "+ Novo" acima para cadastrar.
             </p>
            )}
           </div>
          ) : (
           /* Form de Cadastro Rápido de Cliente */
           <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 animate-fadeIn">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
             Cadastrar Novo Cliente
            </span>
            <input
             type="text"
             placeholder="Nome completo *"
             value={calQuickClientNome}
             onChange={(e) => setCalQuickClientNome(e.target.value)}
             className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 "
            />
            <input
             type="text"
             placeholder="Telefone / WhatsApp"
             value={calQuickClientPhone}
             onChange={(e) => setCalQuickClientPhone(e.target.value)}
             className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 "
            />
            <input
             type="text"
             placeholder="Cidade / Endereço"
             value={calQuickClientAddress}
             onChange={(e) => setCalQuickClientAddress(e.target.value)}
             className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 "
            />
            <div className="flex gap-1.5 pt-1">
             <button
              type="button"
              onClick={handleSaveCalQuickClient}
              className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer"
             >
              Salvar e Selecionar
             </button>
             {clientes.length > 0 && (
              <button
               type="button"
               onClick={() => setShowQuickAddClientInCalendar(false)}
               className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
               Voltar
              </button>
             )}
            </div>
           </div>
          )}
         </div>

         <div className="grid grid-cols-2 gap-3">
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Data do Serviço *
           </label>
           <input
            type="date"
            value={svcData}
            onChange={(e) => setSvcData(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            required
           />
          </div>
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Operador Responsável
           </label>
           <select
            value={svcOperador}
            onChange={(e) => setSvcOperador(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           >
            {operadores.map(op => (
             <option key={op.id} value={op.nome}>{op.nome} ({op.cargo})</option>
            ))}
           </select>
          </div>
         </div>

         <div className="grid grid-cols-2 gap-3">
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Horas Estimadas *
           </label>
           <input
            type="number"
            step="0.5"
            min="0.5"
            value={svcHoras}
            onChange={(e) => setSvcHoras(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
            required
           />
          </div>
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Valor da Hora (R$) *
           </label>
           <input
            type="number"
            step="10"
            min="1"
            value={svcValorHora}
            onChange={(e) => setSvcValorHora(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
            required
           />
          </div>
         </div>

         <div className="grid grid-cols-2 gap-3">
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Status do Pagamento
           </label>
           <select
            value={svcStatus}
            onChange={(e) => setSvcStatus(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           >
            <option value="pendente">⏳ Agendado / Pendente</option>
            <option value="pago">✅ Pago Integralmente</option>
            <option value="parcial">⚠️ Parcialmente Pago</option>
           </select>
          </div>
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Forma de Pagamento
           </label>
           <select
            value={svcFormaPagamento}
            onChange={(e) => setSvcFormaPagamento(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           >
            <option value="pix">PIX</option>
            <option value="dinheiro">Dinheiro (Espécie)</option>
            <option value="cartao">Cartão</option>
            <option value="a_definir">A Definir</option>
           </select>
          </div>
         </div>

         <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
           Descrição dos Trabalhos / Localização
          </label>
          <textarea
           rows={2}
           placeholder="Ex: Escavação de tanque, terraplanagem de platô..."
           value={svcDescricao}
           onChange={(e) => setSvcDescricao(e.target.value)}
           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          />
         </div>

         {/* Summary Box */}
         <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
           <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Previsto</span>
           <span className="text-base font-black text-amber-500 font-mono">
            {formatCurrency(svcHoras * svcValorHora)}
           </span>
          </div>
          <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
           Confirmar Agendamento
          </Button>
         </div>
        </form>
       ) : (
        <form onSubmit={handleSaveNewMaintenance} className="space-y-4">
         <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
           Máquina / Veículo *
          </label>
          <select
           value={mntMaquinaId}
           onChange={(e) => setMntMaquinaId(e.target.value)}
           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           required
          >
           {maquinas.map(m => (
            <option key={m.id} value={m.id}>
             🚜 {m.nome} ({m.placa}) - Horímetro: {m.horimetro_atual}h
            </option>
           ))}
          </select>
         </div>

         <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
           Título da Manutenção *
          </label>
          <input
           type="text"
           placeholder="Ex: Troca de Óleo e Filtros 250h / Reparo Cilindro Hidráulico"
           value={mntTitulo}
           onChange={(e) => setMntTitulo(e.target.value)}
           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
           required
          />
         </div>

         <div className="grid grid-cols-2 gap-3">
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Data Prevista *
           </label>
           <input
            type="date"
            value={mntData}
            onChange={(e) => setMntData(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            required
           />
          </div>
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Tipo de Manutenção
           </label>
           <select
            value={mntTipo}
            onChange={(e) => setMntTipo(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           >
            <option value="preventiva">🛡️ Preventiva</option>
            <option value="troca_oleo">🛢️ Troca de Óleo</option>
            <option value="filtros">🔄 Filtros</option>
            <option value="hidraulico">💧 Sistema Hidráulico</option>
            <option value="corretiva">⚠️ Corretiva</option>
            <option value="pneus_esteiras">⚙️ Esteiras / Pneus</option>
           </select>
          </div>
         </div>

         <div className="grid grid-cols-2 gap-3">
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Status
           </label>
           <select
            value={mntStatus}
            onChange={(e) => setMntStatus(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
           >
            <option value="agendado">📅 Agendado</option>
            <option value="em_andamento">⏳ Em Andamento</option>
            <option value="urgente">🚨 Urgente</option>
            <option value="concluido">✅ Concluído</option>
           </select>
          </div>
          <div>
           <label className="text-xs font-bold text-slate-700 block mb-1">
            Custo Estimado (R$)
           </label>
           <input
            type="number"
            step="10"
            min="0"
            value={mntValor}
            onChange={(e) => setMntValor(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
           />
          </div>
         </div>

         <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
           Mecânico / Fornecedor Responsável
          </label>
          <input
           type="text"
           placeholder="Ex: Mecânica Trator Sul / Oficina do Carlos"
           value={mntMecanico}
           onChange={(e) => setMntMecanico(e.target.value)}
           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          />
         </div>

         <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
           Peças / Descrição dos Itens
          </label>
          <textarea
           rows={2}
           placeholder="Ex: 20L Óleo 15W40, 1 Filtro de combustível, 1 Filtro de ar..."
           value={mntDescricao}
           onChange={(e) => setMntDescricao(e.target.value)}
           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
          />
         </div>

         {/* Summary Box */}
         <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
          <div>
           <span className="text-[10px] uppercase font-bold text-slate-500 block">Custo Estimado</span>
           <span className="text-base font-black text-purple-600 font-mono">
            {formatCurrency(mntValor)}
           </span>
          </div>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-black">
           Agendar Manutenção
          </Button>
         </div>
        </form>
       )}
      </div>
     </div>
    </div>
   )}

   {/* MODAL: DETALHES DO EVENTO SELECIONADO */}
   {selectedEvent && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
     <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-slate-200 flex items-center justify-between ${
       selectedEvent.type === 'servico' ? 'bg-blue-50/50 ' : 'bg-purple-50/50 '
      }`}>
       <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl ${
         selectedEvent.type === 'servico' ? 'bg-blue-500 text-white' : 'bg-purple-600 text-white'
        }`}>
         {selectedEvent.type === 'servico' ? <Tractor className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
        </div>
        <div>
         <h3 className="font-black text-slate-900 text-base">
          {selectedEvent.type === 'servico' ? 'Detalhes do Serviço' : 'Detalhes da Manutenção'}
         </h3>
         <span className="text-xs text-slate-500">
          {formatDate(selectedEvent.type === 'servico' 
           ? (selectedEvent.data as Servico).data_servico 
           : ((selectedEvent.data as Manutencao).data_manutencao || selectedEvent.data.created_at)
          )}
         </span>
        </div>
       </div>
       <button
        onClick={() => setSelectedEvent(null)}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 "
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      {/* Content Body */}
      <div className="p-6 space-y-4">
       {selectedEvent.type === 'servico' ? (
        (() => {
         const s = selectedEvent.data as Servico;
         const maq = maquinas.find(m => m.id === s.maquina_id);

         return (
          <div className="space-y-3.5">
           <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 ">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cliente / Solicitante</span>
            <h4 className="text-lg font-black text-slate-900 ">{s.cliente}</h4>
            {s.localizacao && (
             <p className="text-xs text-slate-500 mt-0.5">📍 {s.localizacao}</p>
            )}
           </div>

           <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipamento</span>
             <span className="font-bold text-slate-800 ">🚜 {maq?.nome || 'Máquina'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Operador</span>
             <span className="font-bold text-slate-800 ">👤 {s.operador_responsavel || 'Jurandir'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Horas & Taxa</span>
             <span className="font-bold text-slate-800 ">{s.tempo_horas}h × {formatCurrency(s.valor_hora)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Pagamento</span>
             <Badge variant={s.status === 'pago' ? 'success' : s.status === 'parcial' ? 'warning' : 'destructive'} className="mt-0.5">
              {s.status.toUpperCase()}
             </Badge>
            </div>
           </div>

           {s.descricao_servico && (
            <div className="text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Descrição</span>
             <p className="text-slate-700 ">{s.descricao_servico}</p>
            </div>
           )}

           <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div>
             <span className="text-[10px] text-slate-500 uppercase font-bold block">Valor Total</span>
             <span className="text-lg font-black text-amber-500 font-mono">{formatCurrency(s.valor_total)}</span>
            </div>
            {s.saldo_devedor > 0 && (
             <div className="text-right">
              <span className="text-[10px] text-red-500 uppercase font-bold block">Saldo Devedor</span>
              <span className="text-sm font-bold text-red-500 font-mono">{formatCurrency(s.saldo_devedor)}</span>
             </div>
            )}
           </div>

           {/* Action buttons */}
           <div className="flex items-center gap-2 pt-2">
            {s.status !== 'pago' && (
             <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              onClick={async () => {
               await onQuickSettleService(s);
               setSelectedEvent(null);
              }}
             >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Quitar Serviço
             </Button>
            )}
            <Button
             variant="outline"
             className="flex-1 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
             onClick={() => {
              if (onGenerateReceipt) {
               onGenerateReceipt(s);
              } else {
               const text = getWhatsAppReceiptText(s, config);
               openWhatsApp(text);
              }
             }}
            >
             <Send className="w-4 h-4 mr-1.5" />
             Recibo WhatsApp
            </Button>
            <Button
             variant="ghost"
             size="icon"
             className="text-red-500 hover:bg-red-50 "
             onClick={async () => {
              if (confirm('Deseja excluir este serviço?')) {
               await onDeleteService(s.id);
               setSelectedEvent(null);
              }
             }}
            >
             <Trash2 className="w-4 h-4" />
            </Button>
           </div>
          </div>
         );
        })()
       ) : (
        (() => {
         const m = selectedEvent.data as Manutencao;
         const maq = maquinas.find(maqItem => maqItem.id === m.maquina_id);

         return (
          <div className="space-y-3.5">
           <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 ">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título da Manutenção</span>
            <h4 className="text-lg font-black text-slate-900 ">{m.titulo}</h4>
            <span className="text-xs font-bold text-purple-600 mt-1 inline-block">
             Tipo: {m.tipo.toUpperCase()}
            </span>
           </div>

           <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipamento</span>
             <span className="font-bold text-slate-800 ">🚜 {maq?.nome || 'Máquina'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
             <Badge variant={m.status === 'concluido' ? 'success' : m.status === 'urgente' ? 'destructive' : 'default'} className="mt-0.5">
              {m.status.toUpperCase()}
             </Badge>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Mecânico / Oficina</span>
             <span className="font-bold text-slate-800 ">{m.mecanico_responsavel || 'Não informado'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block">Horímetro Registro</span>
             <span className="font-bold text-slate-800 ">{m.horimetro_momento}h</span>
            </div>
           </div>

           {m.descricao_pecas && (
            <div className="text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 ">
             <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Peças & Serviços</span>
             <p className="text-slate-700 ">{m.descricao_pecas}</p>
            </div>
           )}

           <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <span className="text-xs font-bold text-slate-700 ">Custo da Manutenção</span>
            <span className="text-lg font-black text-purple-600 font-mono">
             {formatCurrency(m.valor_total)}
            </span>
           </div>

           {/* Action Buttons */}
           <div className="flex items-center gap-2 pt-2">
            {m.status !== 'concluido' && (
             <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              onClick={async () => {
               await onSaveMaintenance({ ...m, status: 'concluido' });
               setSelectedEvent(null);
              }}
             >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Marcar como Concluída
             </Button>
            )}
            <Button
             variant="ghost"
             size="icon"
             className="text-red-500 hover:bg-red-50 ml-auto"
             onClick={async () => {
              if (confirm('Deseja excluir esta manutenção?')) {
               await onDeleteMaintenance(m.id);
               setSelectedEvent(null);
              }
             }}
            >
             <Trash2 className="w-4 h-4" />
            </Button>
           </div>
          </div>
         );
        })()
       )}
      </div>
     </div>
    </div>
   )}
  </div>
 );
};
