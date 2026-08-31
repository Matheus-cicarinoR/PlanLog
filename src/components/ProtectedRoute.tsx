import React from 'react';
import { Navigate, useLocation } from 'react-router';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const sessionUser = sessionStorage.getItem('terraforte_session_user');
  
  if (!sessionUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
