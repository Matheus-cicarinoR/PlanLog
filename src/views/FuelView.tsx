/**
 * FuelView.tsx
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
import { FuelManager } from '../components/FuelManager';
import { FuelModal } from '../components/FuelModal';

const FuelView = () => {
  const systemState = useSystemState();
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

  return (
    <div className="flex-1 w-full p-4">
      <FuelManager
        abastecimentos={systemState.filteredAbastecimentos}
        servicos={systemState.filteredServicos}
        config={systemState.dynamicConfig}
        onOpenNewFuel={() => setIsFuelModalOpen(true)}
        onDeleteFuel={systemState.handleDeleteFuel}
      />
      <FuelModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSave={systemState.handleSaveFuel}
        config={systemState.dynamicConfig}
        maquinas={systemState.maquinas}
        selectedMaquinaId={systemState.selectedMaquinaId}
      />
    </div>
  );
};

export default FuelView;
