/**
 * ReportsView.tsx
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
import { ReportsManager } from '../components/ReportsManager';
import { ReceiptModal } from '../components/ReceiptModal';
import type { Servico } from '../types';

const ReportsView = () => {
  const systemState = useSystemState();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptService, setReceiptService] = useState<Servico | null>(null);

  return (
    <div className="flex-1 w-full p-4">
      <ReportsManager
        servicos={systemState.filteredServicos}
        manutencoes={systemState.filteredManutencoes}
        operadores={systemState.operadores}
        abastecimentos={systemState.filteredAbastecimentos}
        config={systemState.dynamicConfig}
        startDate={systemState.startDate}
        endDate={systemState.endDate}
        onGenerateReceipt={(s) => {
          setReceiptService(s);
          setIsReceiptModalOpen(true);
        }}
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

export default ReportsView;
