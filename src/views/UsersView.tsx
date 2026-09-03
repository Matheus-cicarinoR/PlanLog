/**
 * UsersView.tsx
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
import { UserManager } from '../components/UserManager';

const UsersView = () => {
  const systemState = useSystemState();
  
  // For now, simulate admin user
  const currentUser = {
    id: 'admin',
    nome: 'Admin',
    email: '',
    cargo: 'Administrador',
  };

  return (
    <div className="flex-1 w-full p-4">
      <UserManager
        usuarios={systemState.usuarios}
        currentUser={currentUser as any}
        onSaveUsuario={systemState.handleSaveUsuario}
        onDeleteUsuario={systemState.handleDeleteUsuario}
      />
    </div>
  );
};

export default UsersView;
