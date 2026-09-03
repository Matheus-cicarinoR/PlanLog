/**
 * OperatorsView.tsx
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
import { OperatorManager } from '../components/OperatorManager';

const OperatorsView = () => {
  const systemState = useSystemState();

  return (
    <div className="flex-1 w-full p-4">
      <OperatorManager
        operadores={systemState.operadores}
        servicos={systemState.filteredServicos}
        config={systemState.dynamicConfig}
        onUpdateOperador={systemState.handleUpdateOperador}
      />
    </div>
  );
};

export default OperatorsView;
