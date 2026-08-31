/**
 * MaintenanceView.tsx
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
import { MaintenanceManager } from '../components/MaintenanceManager';
import { MaintenanceModal } from '../components/MaintenanceModal';
import type { Manutencao } from '../types';

const MaintenanceView = () => {
    const systemState = useSystemState();
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [maintenanceToEdit, setMaintenanceToEdit] = useState<Manutencao | null>(null);

    return (
        <div className="flex-1 w-full p-4">
            <MaintenanceManager
                manutencoes={systemState.filteredManutencoes}
                config={systemState.dynamicConfig}
                onOpenNewMaintenance={() => {
                    setMaintenanceToEdit(null);
                    setIsMaintenanceModalOpen(true);
                }}
                onEditMaintenance={(m) => {
                    setMaintenanceToEdit(m);
                    setIsMaintenanceModalOpen(true);
                }}
                onDeleteMaintenance={systemState.handleDeleteMaintenance}
            />
            <MaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                onSave={systemState.handleSaveMaintenance}
                manutencaoToEdit={maintenanceToEdit}
                config={systemState.dynamicConfig}
                maquinas={systemState.maquinas}
                selectedMaquinaId={systemState.selectedMaquinaId}
            />
        </div>
    );
};

export default MaintenanceView;
