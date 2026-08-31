/**
 * CalendarView.tsx
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
import { FleetCalendar } from '../components/FleetCalendar';
import { ReceiptModal } from '../components/ReceiptModal';
import type { Servico } from '../types';

const CalendarView = () => {
    const systemState = useSystemState();
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptService, setReceiptService] = useState<Servico | null>(null);

    const handleOpenReceipt = (servico: Servico) => {
        setReceiptService(servico);
        setIsReceiptModalOpen(true);
    };

    return (
        <div className="flex-1 w-full p-4">
            <FleetCalendar
                servicos={systemState.filteredServicos}
                manutencoes={systemState.filteredManutencoes}
                maquinas={systemState.maquinas}
                operadores={systemState.operadores}
                config={systemState.dynamicConfig}
                selectedMaquinaId={systemState.selectedMaquinaId}
                onSelectMaquina={systemState.handleSelectMaquina}
                onSaveService={systemState.handleSaveService}
                onDeleteService={systemState.handleDeleteService}
                onQuickSettleService={systemState.handleQuickSettleService}
                onSaveMaintenance={systemState.handleSaveMaintenance}
                onDeleteMaintenance={systemState.handleDeleteMaintenance}
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

export default CalendarView;
