/**
 * DashboardView.tsx
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
import { Dashboard } from '../components/Dashboard';
import { ReceiptModal } from '../components/ReceiptModal';
import { useNavigate } from 'react-router';
import type { Servico } from '../types';

const DashboardView = () => {
  const systemState = useSystemState();
  const navigate = useNavigate();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptService, setReceiptService] = useState<Servico | null>(null);

  const handleOpenReceipt = (servico: Servico) => {
    setReceiptService(servico);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex-1 w-full p-4" style={{ width: '100%', height: '100%' }}>
      <Dashboard
        servicos={systemState.filteredServicos}
        manutencoes={systemState.filteredManutencoes}
        operadores={systemState.operadores}
        abastecimentos={systemState.filteredAbastecimentos}
        config={systemState.dynamicConfig}
        onNavigateToServices={() => navigate('/servicos')}
        onNavigateToMaintenance={() => navigate('/manutencoes')}
        onNavigateToOperators={() => navigate('/operadores')}
        onQuickSettleService={systemState.handleQuickSettleService}
        onGenerateReceipt={handleOpenReceipt}
        isAllMachinesSelected={!systemState.selectedMaquinaId || systemState.selectedMaquinaId === 'todas'}
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

export default DashboardView;
