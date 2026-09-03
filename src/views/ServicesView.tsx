/**
 * ServicesView.tsx
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
import { ServicesManager } from '../components/ServicesManager';
import { ServiceModal } from '../components/ServiceModal';
import { ReceiptModal } from '../components/ReceiptModal';
import type { Servico } from '../types';

const ServicesView = () => {
  const systemState = useSystemState();
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Servico | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptService, setReceiptService] = useState<Servico | null>(null);

  return (
    <div className="flex-1 w-full p-4">
      <ServicesManager
        servicos={systemState.filteredServicos}
        config={systemState.dynamicConfig}
        initialFilter={undefined}
        onOpenNewService={() => {
          setServiceToEdit(null);
          setIsServiceModalOpen(true);
        }}
        onEditService={(s) => {
          setServiceToEdit(s);
          setIsServiceModalOpen(true);
        }}
        onDeleteService={systemState.handleDeleteService}
        onQuickSettleService={systemState.handleQuickSettleService}
        onGenerateReceipt={(s) => {
          setReceiptService(s);
          setIsReceiptModalOpen(true);
        }}
      />
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={systemState.handleSaveService}
        servicoToEdit={serviceToEdit}
        config={systemState.dynamicConfig}
        maquinas={systemState.maquinas}
        selectedMaquinaId={systemState.selectedMaquinaId}
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

export default ServicesView;
