/**
 * ClientsManager.tsx
 * 
 * PROPÓSITO:
 * Componente responsável pela listagem e manipulação de registros de ClientsManager.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { 
 Users, 
 UserPlus, 
 Search, 
 Phone, 
 MapPin, 
 FileText, 
 DollarSign, 
 Calendar, 
 Edit3, 
 Trash2, 
 X, 
 Tractor, 
 Clock, 
 CheckCircle2, 
 AlertCircle, 
 Send, 
 Plus, 
 ExternalLink,
 Building,
 CreditCard,
 Receipt
} from 'lucide-react';
import { Cliente, Servico, ConfiguracoesSistema, Maquina } from '../types';
import { formatCurrency, formatHours, formatDate } from '../lib/formatters';
import { getWhatsAppReceiptText, openWhatsApp } from '../lib/whatsapp';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TablePagination } from './shared/TablePagination';
import { ScrollableTableContainer } from './shared/ScrollableTableContainer';

interface ClientsManagerProps {
 clientes: Cliente[];
 servicos: Servico[];
 maquinas: Maquina[];
 config: ConfiguracoesSistema;
 onSaveCliente: (cliente: Cliente) => Promise<void>;
 onDeleteCliente: (id: string) => Promise<void>;
 onOpenNewServiceForClient?: (clienteNome: string, clienteId?: string) => void;
 onQuickSettleService?: (servico: Servico) => Promise<void>;
 onGenerateReceipt?: (servico: Servico) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
 clientes,
 servicos,
 maquinas,
 config,
 onSaveCliente,
 onDeleteCliente,
 onOpenNewServiceForClient,
 onQuickSettleService,
 onGenerateReceipt,
}) => {
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState<'all' | 'devedor' | 'frequente'>('all');
 const [currentPage, setCurrentPage] = useState(1);
 const [pageSize, setPageSize] = useState(9);
 
 // Modais
 const [isClientModalOpen, setIsClientModalOpen] = useState(false);
 const [editingClient, setEditingClient] = useState<Cliente | null>(null);
 const [selectedClientForHistory, setSelectedClientForHistory] = useState<Cliente | null>(null);

 const handleSearchChange = (val: string) => {
  setSearchTerm(val);
  setCurrentPage(1);
 };

 const handleStatusFilterChange = (status: 'all' | 'devedor' | 'frequente') => {
  setStatusFilter(status);
  setCurrentPage(1);
 };

 // Travar o scroll da página no fundo enquanto qualquer modal de cliente estiver aberto
 useEffect(() => {
  if (isClientModalOpen || selectedClientForHistory !== null) {
   document.body.style.overflow = 'hidden';
  } else {
   document.body.style.overflow = 'unset';
  }
  return () => {
   document.body.style.overflow = 'unset';
  };
 }, [isClientModalOpen, selectedClientForHistory]);

 // Form fields
 const [nome, setNome] = useState('');
 const [telefone, setTelefone] = useState('');
 const [cpfCnpj, setCpfCnpj] = useState('');
 const [email, setEmail] = useState('');
 const [endereco, setEndereco] = useState('');
 const [cidade, setCidade] = useState('');
 const [observacoes, setObservacoes] = useState('');

 const handleOpenNewClient = () => {
  setEditingClient(null);
  setNome('');
  setTelefone('');
  setCpfCnpj('');
  setEmail('');
  setEndereco('');
  setCidade('');
  setObservacoes('');
  setIsClientModalOpen(true);
 };

 const handleOpenEditClient = (cli: Cliente) => {
  setEditingClient(cli);
  setNome(cli.nome);
  setTelefone(cli.telefone || '');
  setCpfCnpj(cli.cpf_cnpj || '');
  setEmail(cli.email || '');
  setEndereco(cli.endereco || '');
  setCidade(cli.cidade || '');
  setObservacoes(cli.observacoes || '');
  setIsClientModalOpen(true);
 };

 const handleSubmitClient = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!nome.trim()) return;

  const clienteData: Cliente = {
   id: editingClient?.id || `cli-${Date.now()}`,
   nome: nome.trim(),
   telefone: telefone.trim(),
   cpf_cnpj: cpfCnpj.trim(),
   email: email.trim(),
   endereco: endereco.trim(),
   cidade: cidade.trim(),
   observacoes: observacoes.trim(),
   created_at: editingClient?.created_at || new Date().toISOString(),
  };

  await onSaveCliente(clienteData);
  setIsClientModalOpen(false);
 };

 // Estatísticas calculadas por cliente
 const clientStatsMap = useMemo(() => {
  const map: Record<string, {
   totalServicos: number;
   totalHoras: number;
   totalFaturado: number;
   totalPago: number;
   saldoDevedor: number;
   ultimoServicoData?: string;
  }> = {};

  clientes.forEach(cli => {
   map[cli.nome.toLowerCase()] = {
    totalServicos: 0,
    totalHoras: 0,
    totalFaturado: 0,
    totalPago: 0,
    saldoDevedor: 0,
   };
  });

  servicos.forEach(s => {
   const cliKey = (s.cliente || '').trim().toLowerCase();
   if (!map[cliKey]) {
    map[cliKey] = {
     totalServicos: 0,
     totalHoras: 0,
     totalFaturado: 0,
     totalPago: 0,
     saldoDevedor: 0,
    };
   }

   map[cliKey].totalServicos += 1;
   map[cliKey].totalHoras += Number(s.tempo_horas) || 0;
   map[cliKey].totalFaturado += Number(s.valor_total) || 0;
   map[cliKey].totalPago += Number(s.valor_pago) || 0;
   map[cliKey].saldoDevedor += Number(s.saldo_devedor) || 0;
   
   if (!map[cliKey].ultimoServicoData || new Date(s.data_servico) > new Date(map[cliKey].ultimoServicoData!)) {
    map[cliKey].ultimoServicoData = s.data_servico;
   }
  });

  return map;
 }, [clientes, servicos]);

 // Totais Gerais dos Clientes
 const totalFaturadoClientes = servicos.reduce((acc, s) => acc + (Number(s.valor_total) || 0), 0);
 const totalDevedorClientes = servicos.reduce((acc, s) => acc + (Number(s.saldo_devedor) || 0), 0);
 const clientesComDebito = clientes.filter(c => (clientStatsMap[c.nome.toLowerCase()]?.saldoDevedor || 0) > 0).length;

 // Filtragem de clientes
 const filteredClientes = useMemo(() => {
  return clientes.filter(cli => {
   const stats = clientStatsMap[cli.nome.toLowerCase()] || { saldoDevedor: 0, totalServicos: 0 };
   
   const matchesSearch = 
    cli.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cli.telefone && cli.telefone.includes(searchTerm)) ||
    (cli.cpf_cnpj && cli.cpf_cnpj.includes(searchTerm)) ||
    (cli.cidade && cli.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cli.endereco && cli.endereco.toLowerCase().includes(searchTerm.toLowerCase()));

   if (!matchesSearch) return false;

   if (statusFilter === 'devedor') return stats.saldoDevedor > 0;
   if (statusFilter === 'frequente') return stats.totalServicos >= 2;

   return true;
  });
 }, [clientes, searchTerm, statusFilter, clientStatsMap]);

 const paginatedClientes = useMemo(() => {
  if (pageSize >= filteredClientes.length) return filteredClientes;
  const start = (currentPage - 1) * pageSize;
  return filteredClientes.slice(start, start + pageSize);
 }, [filteredClientes, currentPage, pageSize]);

 return (
  <div className="space-y-6 pb-12">
   {/* Header & KPI Summary */}
   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
    <div className="flex items-center gap-3">
     <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
      <Users className="w-6 h-6" />
     </div>
     <div>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
       Gestão de Clientes
       <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-500/30">
        {clientes.length} cadastrados
       </Badge>
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 ">
       Cadastre clientes, consulte históricos de locações, faturamento e saldos devedores.
      </p>
     </div>
    </div>

    <Button
     onClick={handleOpenNewClient}
     className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800  text-white font-black shadow-md shadow-slate-900/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
    >
     <UserPlus className="w-4 h-4 stroke-[2.5]" />
     Novo Cliente
    </Button>
   </div>

   {/* KPI Cards */}
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-500/20 shrink-0">
      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Total Clientes</span>
      <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{clientes.length}</span>
     </div>
    </div>

    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-500/20 shrink-0">
      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Faturamento Total</span>
      <span className="text-sm sm:text-lg font-black text-emerald-600 font-mono block truncate">{formatCurrency(totalFaturadoClientes)}</span>
     </div>
    </div>

    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-500/20 shrink-0">
      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Saldo Devedor</span>
      <span className="text-sm sm:text-lg font-black text-red-600 font-mono block truncate">{formatCurrency(totalDevedorClientes)}</span>
     </div>
    </div>

    <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2.5 sm:gap-3">
     <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-500/20 shrink-0">
      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
     </div>
     <div className="min-w-0 flex-1">
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">Com Pendências</span>
      <span className="text-base sm:text-lg font-black text-slate-900 font-mono">{clientesComDebito} <span className="text-[11px] font-normal text-slate-500">cli</span></span>
     </div>
    </div>
   </div>

   {/* Filter & Search Bar */}
   <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200 ">
    <div className="relative w-full sm:w-80">
     <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
     <input
      type="text"
      placeholder="Pesquisar por nome, telefone, cidade..."
      value={searchTerm}
      onChange={(e) => handleSearchChange(e.target.value)}
      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
     />
    </div>

    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
     <button
      onClick={() => handleStatusFilterChange('all')}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
       statusFilter === 'all'
        ? 'bg-amber-500 text-slate-950 shadow-sm'
        : 'bg-white text-slate-600 border border-slate-200 '
      }`}
     >
      Todos ({clientes.length})
     </button>
     <button
      onClick={() => handleStatusFilterChange('devedor')}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
       statusFilter === 'devedor'
        ? 'bg-red-600 text-white shadow-sm'
        : 'bg-white text-slate-600 border border-slate-200 '
      }`}
     >
      Com Débito ({clientesComDebito})
     </button>
     <button
      onClick={() => handleStatusFilterChange('frequente')}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
       statusFilter === 'frequente'
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-white text-slate-600 border border-slate-200 '
      }`}
     >
      Frequentes
     </button>
    </div>
   </div>

   {/* Clientes Grid */}
   {filteredClientes.length === 0 ? (
    <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
     <Users className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-1" />
     <h4 className="font-bold text-slate-800 ">Nenhum cliente encontrado</h4>
     <p className="text-xs text-slate-500 mt-1">Cadastre um novo cliente ou altere os filtros de pesquisa.</p>
    </div>
   ) : (
    <div className="space-y-4">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginatedClientes.map((cli) => {
       const stats = clientStatsMap[cli.nome.toLowerCase()] || {
        totalServicos: 0,
        totalHoras: 0,
        totalFaturado: 0,
        totalPago: 0,
        saldoDevedor: 0,
       };

       return (
        <div
         key={cli.id}
         className="bg-white border border-slate-200 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
        >
         <div>
          {/* Top Name & Actions */}
          <div className="flex items-start justify-between gap-2">
           <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
             {cli.nome}
            </h3>
            {cli.cidade && (
             <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-amber-500" />
              {cli.cidade} {cli.endereco ? `• ${cli.endereco}` : ''}
             </p>
            )}
           </div>

           <div className="flex items-center gap-1 shrink-0">
            <button
             onClick={() => handleOpenEditClient(cli)}
             className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
             title="Editar Cliente"
            >
             <Edit3 className="w-4 h-4" />
            </button>
            <button
             onClick={async () => {
              if (confirm(`Deseja excluir o cliente "${cli.nome}"?`)) {
               await onDeleteCliente(cli.id);
              }
             }}
             className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
             title="Excluir Cliente"
            >
             <Trash2 className="w-4 h-4" />
            </button>
           </div>
          </div>

          {/* Contact Info */}
          <div className="mt-3 space-y-1 text-xs">
           {cli.telefone && (
            <a
             href={`tel:${cli.telefone}`}
             className="text-slate-600 hover:text-amber-500 flex items-center gap-1.5 truncate"
            >
             <Phone className="w-3.5 h-3.5 text-slate-400" />
             {cli.telefone}
            </a>
           )}
           {cli.cpf_cnpj && (
            <p className="text-slate-500 flex items-center gap-1.5 truncate">
             <Building className="w-3.5 h-3.5 text-slate-400" />
             Doc: {cli.cpf_cnpj}
            </p>
           )}
          </div>
         </div>

         {/* Financial Stats Matrix */}
         <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
           <span className="text-slate-500 font-medium">Horas Contratadas:</span>
           <span className="font-mono font-bold text-slate-800 ">{formatHours(stats.totalHoras)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
           <span className="text-slate-500 font-medium">Total Faturado:</span>
           <span className="font-mono font-bold text-slate-900 ">{formatCurrency(stats.totalFaturado)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
           <span className="text-slate-500 font-medium">Saldo Devedor:</span>
           {stats.saldoDevedor > 0 ? (
            <span className="font-mono font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 ">
             {formatCurrency(stats.saldoDevedor)}
            </span>
           ) : (
            <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
             <CheckCircle2 className="w-3.5 h-3.5" /> Quitado
            </span>
           )}
          </div>
         </div>

         {/* Action Buttons */}
         <div className="flex items-center gap-2 pt-1">
          <Button
           size="sm"
           variant="outline"
           className="flex-1 text-xs font-bold border-slate-200 hover:bg-slate-100 cursor-pointer"
           onClick={() => setSelectedClientForHistory(cli)}
          >
           <FileText className="w-3.5 h-3.5 mr-1" />
           Histórico ({stats.totalServicos})
          </Button>

          {onOpenNewServiceForClient && (
           <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
            onClick={() => onOpenNewServiceForClient(cli.nome, cli.id)}
           >
            <Plus className="w-3.5 h-3.5 mr-1 stroke-[3]" />
            Novo Serviço
           </Button>
          )}
         </div>
        </div>
       );
      })}
     </div>

     <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <TablePagination
       currentPage={currentPage}
       totalItems={filteredClientes.length}
       pageSize={pageSize}
       pageSizeOptions={[6, 9, 15, 30]}
       onPageChange={setCurrentPage}
       onPageSizeChange={setPageSize}
      />
     </div>
    </div>
   )}

   {/* MODAL: CRIAR / EDITAR CLIENTE (CENTERED IN MIDDLE OF SCREEN) */}
   {isClientModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
     <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 border-b border-slate-200 shrink-0">
       <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
         <UserPlus className="w-5 h-5" />
        </div>
        <div>
         <h3 className="text-base font-black text-slate-900 ">
          {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
         </h3>
         <p className="text-xs text-slate-500">Dados de contato e cobrança do cliente.</p>
        </div>
       </div>
       <button
        onClick={() => setIsClientModalOpen(false)}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      {/* Scrollable Form Body */}
      <form onSubmit={handleSubmitClient} className="flex flex-col flex-1 overflow-hidden">
       <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs sm:text-sm">
        <div>
         <label className="block text-slate-700 font-bold mb-1">
          Nome Completo / Razão Social *
         </label>
         <input
          type="text"
          required
          placeholder="Ex: João da Silva / Fazenda Esperança"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
         />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
         <div>
          <label className="block text-slate-700 font-bold mb-1">
           Telefone / WhatsApp
          </label>
          <input
           type="text"
           placeholder="Ex: (48) 99999-9999"
           value={telefone}
           onChange={(e) => setTelefone(e.target.value)}
           className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
          />
         </div>

         <div>
          <label className="block text-slate-700 font-bold mb-1">
           CPF ou CNPJ
          </label>
          <input
           type="text"
           placeholder="Ex: 000.000.000-00"
           value={cpfCnpj}
           onChange={(e) => setCpfCnpj(e.target.value)}
           className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
          />
         </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
         <div>
          <label className="block text-slate-700 font-bold mb-1">
           Cidade / Região
          </label>
          <input
           type="text"
           placeholder="Ex: Criciúma - SC"
           value={cidade}
           onChange={(e) => setCidade(e.target.value)}
           className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
          />
         </div>

         <div>
          <label className="block text-slate-700 font-bold mb-1">
           Endereço / Localização / Referência
          </label>
          <input
           type="text"
           placeholder="Ex: Linha Batista, km 4"
           value={endereco}
           onChange={(e) => setEndereco(e.target.value)}
           className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
          />
         </div>
        </div>

        <div>
         <label className="block text-slate-700 font-bold mb-1">
          Observações Internas
         </label>
         <textarea
          rows={2}
          placeholder="Informações adicionais sobre o cliente, formas de cobrança, preferências..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-400"
         />
        </div>
       </div>

       {/* Fixed Footer */}
       <div className="flex items-center justify-end gap-3 px-5 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <button
         type="button"
         onClick={() => setIsClientModalOpen(false)}
         className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
        >
         Cancelar
        </button>
        <button
         type="submit"
         className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 cursor-pointer"
        >
         {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* MODAL: HISTÓRICO COMPLETO DO CLIENTE (CENTERED IN MIDDLE OF SCREEN) */}
   {selectedClientForHistory && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
     <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 border-b border-slate-200 shrink-0">
       <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-500 text-white font-bold">
         <FileText className="w-5 h-5" />
        </div>
        <div>
         <h3 className="text-base font-black text-slate-900 ">
          Histórico de Serviços: {selectedClientForHistory.nome}
         </h3>
         <p className="text-xs text-slate-500">Extrato detalhado de todas as locações e pagamentos.</p>
        </div>
       </div>
       <button
        onClick={() => setSelectedClientForHistory(null)}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      {/* Content List */}
      <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3">
       {(() => {
        const clientServices = servicos.filter(
         s => (s.cliente || '').trim().toLowerCase() === selectedClientForHistory.nome.trim().toLowerCase()
        ).sort((a, b) => new Date(b.data_servico).getTime() - new Date(a.data_servico).getTime());

        if (clientServices.length === 0) {
         return (
          <div className="text-center py-8">
           <Tractor className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
           <p className="text-xs text-slate-500">Nenhum serviço registrado para este cliente ainda.</p>
          </div>
         );
        }

        return clientServices.map(s => {
         const maq = maquinas.find(m => m.id === s.maquina_id);
         return (
          <div
           key={s.id}
           className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
           <div className="space-y-1">
            <div className="flex items-center gap-2">
             <span className="font-bold text-slate-900 ">
              {formatDate(s.data_servico)}
             </span>
             <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              🚜 {maq?.nome || 'Máquina'}
             </span>
             <Badge variant={s.status === 'pago' ? 'success' : s.status === 'parcial' ? 'warning' : 'destructive'}>
              {s.status.toUpperCase()}
             </Badge>
            </div>
            <p className="text-slate-500 ">
             {s.tempo_horas}h × {formatCurrency(s.valor_hora)} • Operador: {s.operador_responsavel || 'Jurandir'}
            </p>
            {s.descricao_servico && (
             <p className="text-slate-600 italic">{s.descricao_servico}</p>
            )}
           </div>

           <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 ">
            <div className="text-right">
             <span className="text-[10px] text-slate-400 block font-bold uppercase">Total</span>
             <span className="font-black text-amber-500 font-mono text-sm">{formatCurrency(s.valor_total)}</span>
            </div>
            {s.status !== 'pago' && onQuickSettleService && (
             <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-8 cursor-pointer"
              onClick={async () => {
               await onQuickSettleService(s);
              }}
             >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Quitar
             </Button>
            )}
            {onGenerateReceipt && (
             <Button
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:bg-blue-50 h-8 cursor-pointer"
              onClick={() => onGenerateReceipt(s)}
              title="Gerar Comprovante PDF"
             >
              <Receipt className="w-3.5 h-3.5" />
             </Button>
            )}
            <Button
             size="sm"
             variant="ghost"
             className="text-emerald-600 hover:bg-emerald-50 h-8 cursor-pointer"
             onClick={() => {
              const text = getWhatsAppReceiptText(s, config);
              openWhatsApp(selectedClientForHistory.telefone || '', text);
             }}
             title="Enviar Comprovante WhatsApp"
            >
             <Send className="w-3.5 h-3.5" />
            </Button>
           </div>
          </div>
         );
        });
       })()}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
       <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectedClientForHistory(null)}
        className="text-xs font-bold cursor-pointer"
       >
        Fechar
       </Button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
};
