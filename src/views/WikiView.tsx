/**
 * WikiView.tsx
 * 
 * PROPÓSITO:
 * View (página) responsável por renderizar o layout e injetar estados no componente de gerência.
 * 
 * RESPONSABILIDADES:
 * - Integrar com o SystemContext para consumir dados.
 * - Renderizar a interface gráfica para interação com a entidade correspondente.
 */
import React from 'react';
import { WikiManager } from '../components/WikiManager';

const WikiView: React.FC = () => {
  return <WikiManager />;
};

export default WikiView;
