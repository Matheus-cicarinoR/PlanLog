import { Servico, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatDate, formatHours } from './formatters';

export const getWhatsAppReceiptText = (servico: Servico, config: ConfiguracoesSistema): string => {
  const isPaid = servico.status === 'pago';
  const isPartial = servico.status === 'parcial';
  
  const statusBadge = isPaid 
    ? '*PAGAMENTO CONCLUIDO*' 
    : isPartial 
      ? '*PAGAMENTO PARCIAL*' 
      : '*PAGAMENTO EM ABERTO*';

  const companyName = config.nome_empresa || 'TERRAFORTE PRO';

  let msg = `*${companyName.toUpperCase()}*\n`;
  msg += `*COMPROVANTE DE SERVICO - RETROESCAVADEIRA*\n`;
  msg += `----------------------------------------\n\n`;

  // Dados do Atendimento
  msg += `*Cliente:* ${servico.cliente}\n`;
  msg += `*Data:* ${formatDate(servico.data_servico)}\n`;
  msg += `*Horas Trabalhadas:* ${formatHours(servico.tempo_horas)}\n`;
  msg += `*Valor da Hora:* ${formatCurrency(servico.valor_hora || 250.0)}/h\n`;

  if (servico.operador_responsavel) {
    msg += `*Operador:* ${servico.operador_responsavel}\n`;
  }

  if (servico.localizacao) {
    msg += `*Local:* ${servico.localizacao}\n`;
  }

  if (servico.descricao_servico) {
    msg += `*Descricao do Servico:* ${servico.descricao_servico}\n`;
  }

  msg += `\n----------------------------------------\n`;
  msg += `*RESUMO FINANCEIRO*\n`;
  msg += `----------------------------------------\n`;
  msg += `*VALOR TOTAL:* ${formatCurrency(servico.valor_total)}\n`;

  if (isPartial) {
    msg += `*Valor Pago:* ${formatCurrency(servico.valor_pago)}\n`;
    msg += `*Saldo Restante:* ${formatCurrency(servico.saldo_devedor)}\n`;
  }

  msg += `*Forma de Pagamento:* ${servico.forma_pagamento.toUpperCase()}${servico.detalhe_pagamento ? ` (${servico.detalhe_pagamento})` : ''}\n`;
  msg += `*Status:* ${statusBadge}\n`;

  if (servico.data_pagamento) {
    msg += `*Data do Recebimento:* ${formatDate(servico.data_pagamento)}\n`;
  }

  // Dados do PIX caso ainda haja saldo ou para facilidade
  if (servico.saldo_devedor > 0 && config.chave_pix_empresa) {
    msg += `\n----------------------------------------\n`;
    msg += `*DADOS PARA PAGAMENTO VIA PIX*\n`;
    msg += `*Chave PIX:* \`${config.chave_pix_empresa}\`\n`;
    if (config.nome_titular_pix) {
      msg += `*Titular:* ${config.nome_titular_pix}\n`;
    }
    msg += `*Valor a Pagar:* ${formatCurrency(servico.saldo_devedor)}\n`;
  }

  msg += `\n----------------------------------------\n`;
  if (config.telefone_contato) {
    msg += `*Duvidas ou Contato:* ${config.telefone_contato}\n`;
  }
  msg += `Agradecemos a confianca e preferencia!`;

  return msg;
};

export const openWhatsApp = (phoneOrText: string, textOrUndefined?: string) => {
  let phone = '';
  let text = '';
  if (textOrUndefined !== undefined) {
    phone = phoneOrText;
    text = textOrUndefined;
  } else {
    text = phoneOrText;
  }
  
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const encodedText = encodeURIComponent(text);
  
  // URL oficial com suporte robusto a UTF-8 e parâmetros universais
  const url = cleanPhone 
    ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedText}` 
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  // Criar link temporário para evitar truncamento de caracteres e problemas de popup
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
