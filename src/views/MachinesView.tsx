/**
 * MachinesView.tsx
 * 
 * PROPÓSITO:
 * View (página) responsável por renderizar o layout e injetar estados no componente de gerência.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React from 'react';
import { useSystemState } from '../context/SystemContext';
import { MachinesManager } from '../components/MachinesManager';

const MachinesView = () => {
  const systemState = useSystemState();

  return (
    <div className="flex-1 w-full p-4">
      <MachinesManager
        maquinas={systemState.maquinas}
        activeMaquinaId={systemState.selectedMaquinaId}
        onSaveMaquina={systemState.handleSaveMaquina}
        onDeleteMaquina={systemState.handleDeleteMaquina}
        onSelectMaquina={systemState.handleSelectMaquina}
      />
    </div>
  );
};

export default MachinesView;
