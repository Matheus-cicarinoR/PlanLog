import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  DollarSign, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  Tractor,
  UserPlus,
  Phone,
  MapPin,
  Plus,
  Navigation,
  Lock,
  ArrowRightLeft
} from 'lucide-react';
import { Servico, PaymentMethod, PaymentStatus, ConfiguracoesSistema, Maquina, Cliente, TipoRegistroServico } from '../types';
import { useSystemState } from '../context/SystemContext';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (servico: Servico) => void;
  servicoToEdit?: Servico | null;
  config: ConfiguracoesSistema;
  maquinas: Maquina[];
  selectedMaquinaId: string;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  servicoToEdit,
  config,
  maquinas,
  selectedMaquinaId,
}) => {
  const { clientes, handleSaveCliente, operadores } = useSystemState();

  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistroServico>('servico_cliente');
  const [cliente, setCliente] = useState('');
  const [clienteId, setClienteId] = useState<string | undefined>(undefined);
  const [tempoHoras, setTempoHoras] = useState<number>(1.0);
  const [tempoDeslocamentoHoras, setTempoDeslocamentoHoras] = useState<number>(0);
  const [valorHora, setValorHora] = useState<number>(config.valor_hora_padrao || 250.0);
  const [valorTotal, setValorTotal] = useState<number>(250.0);
  const [valorPago, setValorPago] = useState<number>(250.0);
  const [status, setStatus] = useState<PaymentStatus>('pago');
  const [formaPagamento, setFormaPagamento] = useState<PaymentMethod>('pix');
  const [detalhePagamento, setDetalhePagamento] = useState('');
  const [dataServico, setDataServico] = useState(new Date().toISOString().split('T')[0]);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [entregueA, setEntregueA] = useState('Caixa Empresa');
  const [operadorResponsavel, setOperadorResponsavel] = useState('Jurandir');
  const [descricaoServico, setDescricaoServico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [maquinaId, setMaquinaId] = useState('maq-default');

  // Estado para inline quick add de cliente
  const [showQuickAddClient, setShowQuickAddClient] = useState(false);
  const [quickClientNome, setQuickClientNome] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');
  const [quickClientCity, setQuickClientCity] = useState('');
  const [quickClientAddress, setQuickClientAddress] = useState('');

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

  // Carregar dados para edição
  useEffect(() => {
    if (servicoToEdit) {
      setTipoRegistro(servicoToEdit.tipo_registro || 'servico_cliente');
      setCliente(servicoToEdit.cliente);
      setClienteId(servicoToEdit.cliente_id);
      setTempoHoras(servicoToEdit.tempo_horas);
      setTempoDeslocamentoHoras(servicoToEdit.tempo_deslocamento_horas || 0);
      setValorHora(servicoToEdit.valor_hora || config.valor_hora_padrao || 250.0);
      setValorTotal(servicoToEdit.valor_total);
      setValorPago(servicoToEdit.valor_pago);
      setStatus(servicoToEdit.status);
      setFormaPagamento(servicoToEdit.forma_pagamento);
      setDetalhePagamento(servicoToEdit.detalhe_pagamento || '');
      setDataServico(servicoToEdit.data_servico);
      setDataPagamento(servicoToEdit.data_pagamento || '');
      setEntregueA(servicoToEdit.entregue_a || 'Caixa Empresa');
      setOperadorResponsavel(servicoToEdit.operador_responsavel || (operadores[0]?.nome || 'Jurandir'));
      setDescricaoServico(servicoToEdit.descricao_servico || '');
      setObservacoes(servicoToEdit.observacoes || '');
      setMaquinaId(servicoToEdit.maquina_id || 'maq-default');
    } else {
      // Padrão novo serviço
      setTipoRegistro('servico_cliente');
      setCliente('');
      setClienteId(undefined);
      setTempoHoras(1.0);
      setTempoDeslocamentoHoras(0);
      const activeMaq = maquinas.find(m => m.id === selectedMaquinaId);
      const defaultRate = activeMaq ? activeMaq.valor_hora_padrao : (config.valor_hora_padrao || 250.0);
      setValorHora(defaultRate);
      setValorTotal(defaultRate);
      setValorPago(defaultRate);
      setStatus('pago');
      setFormaPagamento('pix');
      setDetalhePagamento('');
      setDataServico(new Date().toISOString().split('T')[0]);
      setDataPagamento(new Date().toISOString().split('T')[0]);
      setEntregueA('Caixa Empresa');
      setOperadorResponsavel(operadores[0]?.nome || 'Jurandir');
      setDescricaoServico('');
      setObservacoes('');
      setMaquinaId(selectedMaquinaId === 'todas' ? (maquinas[0]?.id || 'maq-default') : (selectedMaquinaId || maquinas[0]?.id || 'maq-default'));
    }
    setShowQuickAddClient(false);
  }, [servicoToEdit, config, isOpen, maquinas, selectedMaquinaId, operadores]);

  // Alternar Tipo de Registro
  const handleSwitchTipoRegistro = (tipo: TipoRegistroServico) => {
    setTipoRegistro(tipo);
    if (tipo === 'deslocamento_interno') {
      setCliente('Deslocamento Interno (Frota)');
      setClienteId('cli-deslocamento-interno');
      setValorHora(0);
      setValorTotal(0);
      setValorPago(0);
      setStatus('pago');
      setFormaPagamento('a_definir');
      setTempoDeslocamentoHoras(0);
      if (!descricaoServico) {
        setDescricaoServico('Deslocamento entre bases / mobilização de máquina');
      }
    } else {
      setCliente('');
      setClienteId(undefined);
      const activeMaq = maquinas.find(m => m.id === maquinaId);
      const defaultRate = activeMaq ? activeMaq.valor_hora_padrao : (config.valor_hora_padrao || 250.0);
      setValorHora(defaultRate);
      const calculatedTotal = Number((tempoHoras * defaultRate).toFixed(2));
      setValorTotal(calculatedTotal);
      setValorPago(calculatedTotal);
      setStatus('pago');
      setFormaPagamento('pix');
      setDescricaoServico('');
    }
  };

  // Recalcular valor quando tempo ou valor hora mudar
  const handleTempoChange = (val: number) => {
    setTempoHoras(val);
    if (tipoRegistro === 'deslocamento_interno') {
      setValorTotal(0);
      setValorPago(0);
      return;
    }
    const calculatedTotal = Number((val * valorHora).toFixed(2));
    setValorTotal(calculatedTotal);
    if (status === 'pago') {
      setValorPago(calculatedTotal);
    } else if (status === 'pendente') {
      setValorPago(0);
    }
  };

  const handleValorHoraChange = (val: number) => {
    setValorHora(val);
    if (tipoRegistro === 'deslocamento_interno') return;
    const calculatedTotal = Number((tempoHoras * val).toFixed(2));
    setValorTotal(calculatedTotal);
    if (status === 'pago') {
      setValorPago(calculatedTotal);
    }
  };

  const handleStatusChange = (newStatus: PaymentStatus) => {
    setStatus(newStatus);
    if (newStatus === 'pago') {
      setValorPago(valorTotal);
      if (!dataPagamento) setDataPagamento(new Date().toISOString().split('T')[0]);
    } else if (newStatus === 'pendente') {
      setValorPago(0);
      setDataPagamento('');
      setFormaPagamento('a_definir');
    } else if (newStatus === 'parcial') {
      if (valorPago === valorTotal || valorPago === 0) {
        setValorPago(Number((valorTotal / 2).toFixed(2)));
      }
    }
  };

  const handleSelectClientOption = (val: string) => {
    if (val === '__new__') {
      setShowQuickAddClient(true);
      return;
    }
    const found = clientes.find(c => c.id === val);
    if (found) {
      setCliente(found.nome);
      setClienteId(found.id);
      if (found.endereco && !descricaoServico) {
        setDescricaoServico(`Local: ${found.endereco}${found.cidade ? ` (${found.cidade})` : ''}`);
      }
    } else {
      setCliente('');
      setClienteId(undefined);
    }
  };

  const handleSaveQuickClient = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!quickClientNome.trim()) {
      alert('Por favor, digite o nome completo do cliente.');
      return;
    }

    const newCli: Cliente = {
      id: `cli-${Date.now()}`,
      nome: quickClientNome.trim(),
      telefone: quickClientPhone.trim(),
      cidade: quickClientCity.trim(),
      endereco: quickClientAddress.trim(),
      created_at: new Date().toISOString()
    };

    await handleSaveCliente(newCli);
    setCliente(newCli.nome);
    setClienteId(newCli.id);
    if (newCli.endereco) {
      setDescricaoServico(`Local: ${newCli.endereco}${newCli.cidade ? ` (${newCli.cidade})` : ''}`);
    }
    setShowQuickAddClient(false);
    setQuickClientNome('');
    setQuickClientPhone('');
    setQuickClientCity('');
    setQuickClientAddress('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoRegistro === 'servico_cliente' && (!clienteId || !cliente.trim())) {
      alert('Por favor, selecione um cliente cadastrado ou clique em "+ Novo" para cadastrar um novo cliente.');
      setShowQuickAddClient(true);
      return;
    }

    const isDeslocamento = tipoRegistro === 'deslocamento_interno';
    const finalTotal = isDeslocamento ? 0 : Number(valorTotal);
    const pago = isDeslocamento ? 0 : status === 'pago' ? finalTotal : status === 'pendente' ? 0 : valorPago;
    const saldo = Math.max(0, finalTotal - pago);

    const updatedServico: Servico = {
      id: servicoToEdit?.id || `srv-${Date.now()}`,
      tipo_registro: tipoRegistro,
      maquina_id: maquinaId,
      cliente_id: isDeslocamento ? undefined : clienteId,
      cliente: isDeslocamento ? 'Deslocamento Interno (Frota)' : cliente.trim(),
      tempo_horas: Number(tempoHoras),
      tempo_deslocamento_horas: isDeslocamento ? 0 : Number(tempoDeslocamentoHoras || 0),
      valor_hora: isDeslocamento ? 0 : Number(valorHora),
      valor_total: finalTotal,
      valor_pago: Number(pago),
      saldo_devedor: Number(saldo),
      forma_pagamento: isDeslocamento ? 'a_definir' : formaPagamento,
      detalhe_pagamento: detalhePagamento.trim(),
      data_servico: dataServico,
      data_pagamento: isDeslocamento || status === 'pendente' ? undefined : dataPagamento || undefined,
      status: isDeslocamento ? 'pago' : saldo === 0 ? 'pago' : pago > 0 ? 'parcial' : 'pendente',
      entregue_a: isDeslocamento ? undefined : entregueA,
      operador_responsavel: operadorResponsavel,
      descricao_servico: descricaoServico.trim(),
      observacoes: observacoes.trim(),
      created_at: servicoToEdit?.created_at || new Date().toISOString(),
    };

    onSave(updatedServico);
    onClose();
  };

  if (!isOpen) return null;

  const saldoRestante = Math.max(0, valorTotal - (status === 'pago' ? valorTotal : status === 'pendente' ? 0 : valorPago));
  const isDeslocamento = tipoRegistro === 'deslocamento_interno';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card Centered */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Fixed Header with Mode Switch */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-slate-100 shadow-md ${isDeslocamento ? 'bg-blue-500 shadow-blue-500/20 text-white' : 'bg-slate-700 shadow-slate-700/20'}`}>
              {isDeslocamento ? <Navigation className="w-5 h-5 stroke-[2.5]" /> : <Tractor className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {servicoToEdit 
                  ? (isDeslocamento ? 'Editar Deslocamento' : 'Editar Serviço')
                  : (isDeslocamento ? 'Registrar Deslocamento de Frota' : 'Novo Serviço de Retroescavadeira')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDeslocamento 
                  ? 'Mobilização e trânsito interno para cálculo de diesel e horímetro (não faturável).'
                  : 'Preencha os dados do cliente, horas trabalhadas e forma de pagamento.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Mode Switch Tabs */}
            {!servicoToEdit && (
              <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleSwitchTipoRegistro('servico_cliente')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    !isDeslocamento 
                      ? 'bg-slate-700 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Tractor className="w-3.5 h-3.5" />
                  Serviço Cliente
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchTipoRegistro('deslocamento_interno')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDeslocamento 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Deslocamento
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs sm:text-sm">
            
            {/* Deslocamento Info Banner */}
            {isDeslocamento && (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 animate-fadeIn">
                <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 space-y-0.5">
                  <p className="font-bold">Registro Operacional Interno (Não Cobrado ao Cliente)</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Este deslocamento computará no <strong>horímetro real da máquina</strong> e na <strong>média de consumo de diesel (L/h)</strong>, mas não gerará faturamento nem aparecerá em recibos de clientes.
                  </p>
                </div>
              </div>
            )}

            {/* Linha 1: Cliente / Máquina / Operador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Cliente (ou Indicador de Deslocamento Interno) */}
              {!isDeslocamento ? (
                <div className="sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Cliente Cadastrado *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddClient(!showQuickAddClient)}
                      className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      {showQuickAddClient ? 'Fechar' : 'Novo'}
                    </button>
                  </div>

                  {!showQuickAddClient ? (
                    <div className="space-y-1">
                      <select
                        value={clienteId || ''}
                        onChange={(e) => handleSelectClientOption(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                        required={!isDeslocamento}
                      >
                        <option value="">Selecione o cliente...</option>
                        {clientes.map((cli) => (
                          <option key={cli.id} value={cli.id}>
                            👤 {cli.nome} {cli.telefone ? `(${cli.telefone})` : ''}
                          </option>
                        ))}
                        <option value="__new__">➕ + Cadastrar Novo Cliente Agora</option>
                      </select>

                      {clientes.length === 0 && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">
                          Nenhum cliente cadastrado. Clique em "+ Novo" acima para cadastrar.
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Form de Cadastro Rápido Obrigatório de Cliente */
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                        Cadastrar Novo Cliente
                      </span>
                      <input
                        type="text"
                        placeholder="Nome completo *"
                        value={quickClientNome}
                        onChange={(e) => setQuickClientNome(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        placeholder="Telefone / WhatsApp"
                        value={quickClientPhone}
                        onChange={(e) => setQuickClientPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        placeholder="Cidade / Endereço"
                        value={quickClientAddress}
                        onChange={(e) => setQuickClientAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                      />
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={handleSaveQuickClient}
                          className="flex-1 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-black text-xs cursor-pointer"
                        >
                          Salvar e Selecionar
                        </button>
                        {clientes.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowQuickAddClient(false)}
                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                          >
                            Voltar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="sm:col-span-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-500" /> Finalidade
                  </label>
                  <div className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-blue-700 dark:text-blue-300 font-bold flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                    Trânsito Interno de Frota
                  </div>
                </div>
              )}

              {/* Máquina */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Tractor className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Máquina Vinculada *
                </label>
                <select
                  value={maquinaId}
                  onChange={(e) => {
                    setMaquinaId(e.target.value);
                    if (!isDeslocamento) {
                      const targetM = maquinas.find(m => m.id === e.target.value);
                      if (targetM?.valor_hora_padrao) {
                        setValorHora(targetM.valor_hora_padrao);
                        const total = Number((tempoHoras * targetM.valor_hora_padrao).toFixed(2));
                        setValorTotal(total);
                        if (status === 'pago') setValorPago(total);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  {maquinas.map((maq) => (
                    <option key={maq.id} value={maq.id}>
                      🚜 {maq.nome} ({maq.placa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operador */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Operador / Motorista
                </label>
                <select
                  value={operadorResponsavel}
                  onChange={(e) => setOperadorResponsavel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  {operadores.map((op) => (
                    <option key={op.id} value={op.nome}>
                      👤 {op.nome} ({op.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linha 2: Cálculos de Horas e Deslocamento */}
            {!isDeslocamento ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Horas Faturadas ao Cliente
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Base do Recibo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                      Tempo Trabalhado (Cobrado)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={tempoHoras}
                      onChange={(e) => handleTempoChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-mono font-bold text-base focus:outline-none focus:border-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                      Taxa da Hora (R$/h)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={valorHora}
                      onChange={(e) => handleValorHoraChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                      Valor Total a Cobrar (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={valorTotal}
                      onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-slate-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Sub-seção: Deslocamento Interno Embutido */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-500" />
                      Deslocamento / Trânsito da Máquina (Opcional)
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 inline-flex items-center gap-1 w-fit">
                      <Lock className="w-3 h-3" /> Custo Interno (Invisível no Recibo)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={tempoDeslocamentoHoras || ''}
                          onChange={(e) => setTempoDeslocamentoHoras(Math.max(0, parseFloat(e.target.value) || 0))}
                          placeholder="0.0 horas de trânsito"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400 font-mono font-bold text-sm focus:outline-none focus:border-blue-400"
                        />
                        <span className="text-xs font-bold text-slate-500 shrink-0">horas</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span>Horímetro Real da Máquina:</span>
                      <strong className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                        {(Number(tempoHoras) + Number(tempoDeslocamentoHoras || 0)).toFixed(1)}h
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Modo Deslocamento Dedicado */
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Tempo de Operação do Deslocamento
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 text-xs font-medium mb-1">
                      Horas Rodadas / Horímetro Consumido *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={tempoHoras}
                        onChange={(e) => setTempoHoras(parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 1.5"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 font-mono font-bold text-base focus:outline-none focus:border-blue-400"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">horas</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Impacto no Sistema:</p>
                    <p>• Soma <strong>{tempoHoras}h</strong> no horímetro total da máquina.</p>
                    <p>• Computa no cálculo de consumo de diesel (L/h).</p>
                  </div>
                </div>
              </div>
            )}

            {/* Linha 3: Status de Pagamento (Apenas no Modo Serviço Cliente) */}
            {!isDeslocamento && (
              <>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
                    Status do Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pago')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        status === 'pago'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> 100% Pago
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange('pendente')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        status === 'pendente'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Em Aberto (Dívida)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange('parcial')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        status === 'parcial'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Pagamento Parcial
                    </button>
                  </div>
                </div>

                {/* Se status for Parcial */}
                {status === 'parcial' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 animate-fadeIn">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
                        Valor Pago Agora (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={valorPago}
                        onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono font-bold focus:outline-none focus:border-slate-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">
                        Saldo Restante a Cobrar (R$)
                      </label>
                      <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-red-500/30 rounded-lg text-red-500 dark:text-red-400 font-mono font-bold flex items-center h-[38px]">
                        R$ {saldoRestante.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Forma de Pagamento e Destino/Repasse */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro em Espécie</option>
                      <option value="cartao">Cartão Débito/Crédito</option>
                      <option value="misto">Misto (Ex: Pix + Dinheiro)</option>
                      <option value="a_definir">A Definir / Não Pago</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Valor Entregue a / Destino do Dinheiro
                    </label>
                    <select
                      value={entregueA}
                      onChange={(e) => setEntregueA(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="Caixa Empresa">Caixa Geral Empresa</option>
                      <option value="Erica">Erica (Financeiro)</option>
                      <option value="Jurandir">Jurandir (Operador)</option>
                      <option value="Outro">Outro Responsável</option>
                    </select>
                  </div>
                </div>

                {/* Detalhe do Pagamento */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Detalhes do Pagamento / Observação da Planilha
                  </label>
                  <input
                    type="text"
                    value={detalhePagamento}
                    onChange={(e) => setDetalhePagamento(e.target.value)}
                    placeholder="Ex: 100,00 dinheiro e 75,00 no pix | 5.000,00 no pix falta 5.000,00"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
                  />
                </div>
              </>
            )}

            {/* Datas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> 
                  {isDeslocamento ? 'Data do Deslocamento' : 'Data de Execução do Serviço'}
                </label>
                <input
                  type="date"
                  required
                  value={dataServico}
                  onChange={(e) => setDataServico(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                />
              </div>

              {!isDeslocamento && status !== 'pendente' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Data do Pagamento
                  </label>
                  <input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Descrição / Motivo */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                {isDeslocamento ? 'Trajeto / Motivo do Deslocamento' : 'Descrição do Trabalho Realizado'}
              </label>
              <input
                type="text"
                value={descricaoServico}
                onChange={(e) => setDescricaoServico(e.target.value)}
                placeholder={isDeslocamento ? "Ex: Garagem ➔ Fazenda Santa Clara / Ida para oficina" : "Ex: Abertura de vala, limpeza de terreno, corte de barranco..."}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Footer (Fixed at Bottom of Modal) */}
          <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="text-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">
                {isDeslocamento ? 'Horas de Operação:' : 'Valor Total a Cobrar:'}
              </span>
              <span className={`text-base font-black font-mono ${isDeslocamento ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {isDeslocamento ? `${tempoHoras}h (Não faturável)` : `R$ ${valorTotal.toFixed(2)}`}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition-transform flex items-center gap-2 cursor-pointer ${
                  isDeslocamento
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-700/20'
                }`}
              >
                {isDeslocamento ? (
                  <>
                    <Navigation className="w-4 h-4" />
                    <span>{servicoToEdit ? 'Atualizar Deslocamento' : 'Salvar Deslocamento'}</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                    <span>{servicoToEdit ? 'Atualizar Serviço' : 'Salvar Serviço'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
