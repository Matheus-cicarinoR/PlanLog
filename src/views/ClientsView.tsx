/**
 * ClientsView.tsx
 * 
 * PROPÓSITO:
 * View (página) responsável por renderizar o layout e injetar estados no componente de gerência.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React, { useState } from 'react';
import { useSystemState } from '../context/SystemContext';
import { ClientsManager } from '../components/ClientsManager';
import { ReceiptModal } from '../components/ReceiptModal';
import { ServiceModal } from '../components/ServiceModal';
import type { Servico } from '../types';

const ClientsView = () => {
  const systemState = useSystemState();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptService, setReceiptService] = useState<Servico | null>(null);

  const handleOpenReceipt = (servico: Servico) => {
    setReceiptService(servico);
    setIsReceiptModalOpen(true);
  };

  const handleOpenNewServiceForClient = (clienteNome: string, clienteId?: string) => {
    systemState.openNewServiceModal();
  };

  return (
    <div className="flex-1 w-full p-4">
      <ClientsManager
        clientes={systemState.clientes}
        servicos={systemState.filteredServicos}
        maquinas={systemState.maquinas}
        config={systemState.dynamicConfig}
        onSaveCliente={systemState.handleSaveCliente}
        onDeleteCliente={systemState.handleDeleteCliente}
        onOpenNewServiceForClient={handleOpenNewServiceForClient}
        onQuickSettleService={systemState.handleQuickSettleService}
        onGenerateReceipt={handleOpenReceipt}
      />
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        servico={receiptService}
        config={systemState.dynamicConfig}
      />
    </div>
  );
};

export default ClientsView;
