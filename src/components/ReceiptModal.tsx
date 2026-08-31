import React, { useState, useEffect } from 'react';
import { X, Receipt, Send, Download, Copy, Check, Printer, Tractor } from 'lucide-react';
import { Servico, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatDate, formatHours } from '../lib/formatters';
import { generateServiceReceiptPDF } from '../lib/pdfGenerator';
import { getWhatsAppReceiptText, openWhatsApp } from '../lib/whatsapp';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  servico: Servico | null;
  config: ConfiguracoesSistema;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  servico,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

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

  if (!isOpen || !servico) return null;

  const whatsappText = getWhatsAppReceiptText(servico, config);

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    openWhatsApp(phoneNumber, whatsappText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">Comprovante & Recibo de Serviço</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cliente: <strong className="text-amber-600 dark:text-amber-400">{servico.cliente}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs sm:text-sm">
          
          {/* Card Visual do Recibo */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4 font-sans text-xs sm:text-sm">
            
            {/* Header da Empresa */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                  <Tractor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-wide">{config.nome_empresa}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Máquina: {config.modelo_maquina}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                servico.status === 'pago' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
              }`}>
                {servico.status.toUpperCase()}
              </span>
            </div>

            {/* Grid de Detalhes */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Cliente:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{servico.cliente}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Data de Execução:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(servico.data_servico)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Horas Trabalhadas:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{formatHours(servico.tempo_horas)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Taxa por Hora:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(servico.valor_hora || 250)}/h</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Forma de Pagamento:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{servico.forma_pagamento}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Data Pagamento:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(servico.data_pagamento) || 'Em Aberto'}</span>
              </div>
            </div>

            {/* Total */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Valor Total do Serviço</span>
                <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{formatCurrency(servico.valor_total)}</span>
              </div>
              {servico.saldo_devedor > 0 && (
                <div className="text-right">
                  <span className="text-[11px] text-red-500 dark:text-red-400 block">Saldo Restante a Pagar</span>
                  <span className="text-base font-black text-red-500 dark:text-red-400 font-mono">{formatCurrency(servico.saldo_devedor)}</span>
                </div>
              )}
            </div>

            {/* PIX */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Chave PIX para Pagamento:</span>
              <div className="flex items-center justify-between font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-slate-100">{config.chave_pix_empresa}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">({config.nome_titular_pix})</span>
              </div>
            </div>

          </div>

          {/* Envio via WhatsApp */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Enviar Direto para o WhatsApp do Cliente
            </h4>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="DDD + Número (ex: 11987654321) ou deixe em branco"
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
              />
              <button
                onClick={handleSendWhatsApp}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Ações de Exportação */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
              <span>{copied ? 'Texto Copiado!' : 'Copiar Texto'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generateServiceReceiptPDF(servico, config)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Baixar Comprovante em PDF</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
