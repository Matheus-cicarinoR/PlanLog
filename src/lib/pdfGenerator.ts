/**
 * pdfGenerator.ts
 * 
 * PROPÓSITO:
 * Centralizar as lógicas de criação e formatação de PDFs do sistema usando as 
 * bibliotecas `jspdf` e `jspdf-autotable`.
 * 
 * RESPONSABILIDADES:
 * - Gerar Relatórios Financeiros (DRE), Recibos de Operador, Extratos de Manutenção e Serviços.
 * - Adicionar os logotipos, títulos, períodos dinâmicos e sumarizações (Totais).
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Servico, ConfiguracoesSistema } from '../types';
import { formatCurrency, formatDate, formatHours } from './formatters';

export const generateServiceReceiptPDF = (servico: Servico, config: ConfiguracoesSistema) => {
 const doc = new jsPDF();

 // Cabeçalho / Identidade Visual
 doc.setFillColor(15, 23, 42); // Slate escuro #0F172A
 doc.rect(0, 0, 210, 40, 'F');

 // Faixa amarela industrial CAT
 doc.setFillColor(245, 158, 11); // Amber #F59E0B
 doc.rect(0, 40, 210, 4, 'F');

 // Nome da Empresa
 doc.setTextColor(255, 255, 255);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(20);
 doc.text(config.nome_empresa.toUpperCase(), 14, 20);

 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(203, 213, 225);
 doc.text(`Telefone: ${config.telefone_contato} | CNPJ/CPF: ${config.cnpj_cpf}`, 14, 28);
 doc.text(`Máquina: ${config.modelo_maquina} (Placa: ${config.placa_identificacao})`, 14, 35);

 // Título do Documento
 doc.setTextColor(15, 23, 42);
 doc.setFontSize(16);
 doc.setFont('helvetica', 'bold');
 doc.text('COMPROVANTE / ORDEM DE SERVIÇO DE RETROESCAVADEIRA', 14, 55);

 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(100, 116, 139);
 doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 14, 62);
 doc.text(`Código do Registro: #${servico.id}`, 150, 62);

 // Linha divisória
 doc.setDrawColor(226, 232, 240);
 doc.line(14, 66, 196, 66);

 // Tabela de Dados do Cliente e Serviço
 autoTable(doc, {
  startY: 72,
  head: [['DADO', 'INFORMAÇÃO']],
  body: [
   ['Cliente / Contratante', servico.cliente],
   ['Data de Execução', formatDate(servico.data_servico)],
   ['Operador Responsável', servico.operador_responsavel || 'Não Informado'],
   ['Descrição do Trabalho', servico.descricao_servico || 'Serviços de terraplanagem / escavação'],
   ['Horas Trabalhadas', formatHours(servico.tempo_horas)],
   ['Valor da Hora Máquina', formatCurrency(servico.valor_hora || 250.0)],
   ['VALOR TOTAL DO SERVIÇO', formatCurrency(servico.valor_total)],
   ['Valor Pago', formatCurrency(servico.valor_pago)],
   ['Saldo Devedor / Em Aberto', formatCurrency(servico.saldo_devedor)],
   ['Forma de Pagamento', servico.forma_pagamento.toUpperCase() + (servico.detalhe_pagamento ? ` (${servico.detalhe_pagamento})` : '')],
   ['Data de Pagamento', formatDate(servico.data_pagamento) || 'Pendente'],
   ['Status Financeiro', servico.status.toUpperCase()],
   ['Recebido / Entregue a', servico.entregue_a || 'Caixa Empresa'],
  ],
  theme: 'grid',
  headStyles: {
   fillColor: [15, 23, 42],
   textColor: [255, 255, 255],
   fontStyle: 'bold',
  },
  styles: {
   fontSize: 10,
   cellPadding: 4,
  },
  columnStyles: {
   0: { fontStyle: 'bold', cellWidth: 60 },
   1: { cellWidth: 120 },
  },
 });

 // Caixa de Informações Bancárias / PIX
 const finalY = (doc as any).lastAutoTable.finalY + 10;

 doc.setFillColor(248, 250, 252);
 doc.setDrawColor(203, 213, 225);
 doc.roundedRect(14, finalY, 182, 35, 3, 3, 'FD');

 doc.setFontSize(11);
 doc.setFont('helvetica', 'bold');
 doc.setTextColor(15, 23, 42);
 doc.text('DADOS PARA PAGAMENTO VIA PIX:', 20, finalY + 10);

 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(51, 65, 85);
 doc.text(`Chave PIX: ${config.chave_pix_empresa}`, 20, finalY + 18);
 doc.text(`Titular da Conta: ${config.nome_titular_pix}`, 20, finalY + 25);
 doc.text(`Telefone de Suporte / Confirmação: ${config.telefone_contato}`, 20, finalY + 31);

 // Rodapé com assinatura
 doc.setFontSize(9);
 doc.setTextColor(148, 163, 184);
 doc.text('___________________________________________', 20, finalY + 60);
 doc.text('Assinatura do Cliente / Contratante', 20, finalY + 66);

 doc.text('___________________________________________', 115, finalY + 60);
 doc.text('TERRAFORTE - Operador / Responsável', 115, finalY + 66);

 // Salvar PDF
 doc.save(`Recibo_Retroescavadeira_${servico.cliente.replace(/\s+/g, '_')}_${servico.id}.pdf`);
};

export const generateFullServicesReportPDF = (servicos: Servico[], config: ConfiguracoesSistema, periodText: string = 'Todo o Período') => {
 const doc = new jsPDF('landscape');

 // Cabeçalho
 doc.setFillColor(15, 23, 42);
 doc.rect(0, 0, 297, 30, 'F');

 doc.setFillColor(245, 158, 11);
 doc.rect(0, 30, 297, 3, 'F');

 doc.setTextColor(255, 255, 255);
 doc.setFont('helvetica', 'bold');
 doc.setFontSize(16);
 doc.text(`${config.nome_empresa.toUpperCase()} — RELATÓRIO GERAL DE SERVIÇOS RETROESCAVADEIRA`, 14, 18);

 doc.setFontSize(9);
 doc.setFont('helvetica', 'normal');
 doc.setTextColor(203, 213, 225);
 doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')} | Máquina: ${config.modelo_maquina} | Período: ${periodText}`, 14, 25);

 const tableData = servicos.map((s) => [
  s.cliente,
  formatHours(s.tempo_horas),
  formatCurrency(s.valor_total),
  formatCurrency(s.valor_pago),
  formatCurrency(s.saldo_devedor),
  s.forma_pagamento.toUpperCase(),
  formatDate(s.data_pagamento),
  s.entregue_a || s.observacoes || '-',
  s.status.toUpperCase(),
 ]);

 autoTable(doc, {
  startY: 38,
  head: [['Cliente', 'Tempo', 'Valor Total', 'Valor Pago', 'Saldo Devedor', 'Forma Pgto', 'Data Pgto', 'Observação / Repasse', 'Status']],
  body: tableData,
  theme: 'striped',
  headStyles: {
   fillColor: [15, 23, 42],
   textColor: [255, 255, 255],
   fontStyle: 'bold',
   fontSize: 9,
  },
  styles: {
   fontSize: 8,
   cellPadding: 2.5,
  },
  didParseCell: (data) => {
   if (data.section === 'body') {
    const row = servicos[data.row.index];
    if (row && row.status === 'pendente') {
     data.cell.styles.textColor = [220, 38, 38]; // Vermelho
     data.cell.styles.fontStyle = 'bold';
    } else if (row && row.status === 'parcial') {
     data.cell.styles.textColor = [217, 119, 6]; // Amarelo/Laranja
    }
   }
  },
 });

 doc.save(`Relatorio_Servicos_Retroescavadeira_${new Date().toISOString().split('T')[0]}.pdf`);
};
