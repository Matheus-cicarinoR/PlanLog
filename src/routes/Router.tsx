// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import  { lazy } from 'react';
import { Navigate, createBrowserRouter, useNavigate } from "react-router";
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginScreen } from '../components/LoginScreen';
import type { AuthUser } from '../types';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// App Views
const DashboardView = Loadable(lazy(() => import('../views/DashboardView')));
const CalendarView = Loadable(lazy(() => import('../views/CalendarView')));
const MachinesView = Loadable(lazy(() => import('../views/MachinesView')));
const ServicesView = Loadable(lazy(() => import('../views/ServicesView')));
const MaintenanceView = Loadable(lazy(() => import('../views/MaintenanceView')));
const OperatorsView = Loadable(lazy(() => import('../views/OperatorsView')));
const FuelView = Loadable(lazy(() => import('../views/FuelView')));
const ClientsView = Loadable(lazy(() => import('../views/ClientsView')));
const ReportsView = Loadable(lazy(() => import('../views/ReportsView')));
const UsersView = Loadable(lazy(() => import('../views/UsersView')));
const WikiView = Loadable(lazy(() => import('../views/WikiView')));

// authentication
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const LoginWrapper = () => {
  const navigate = useNavigate();
  return <LoginScreen onLoginSuccess={(user: AuthUser) => navigate('/')} />;
};

const Router = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', exact: true, element: <DashboardView/> },
      { path: '/agenda', exact: true, element: <CalendarView/> },
      { path: '/calendario', exact: true, element: <CalendarView/> },
      { path: '/clientes', exact: true, element: <ClientsView/> },
      { path: '/maquinas', exact: true, element: <MachinesView/> },
      { path: '/servicos', exact: true, element: <ServicesView/> },
      { path: '/manutencoes', exact: true, element: <MaintenanceView/> },
      { path: '/operadores', exact: true, element: <OperatorsView/> },
      { path: '/combustivel', exact: true, element: <FuelView/> },
      { path: '/relatorios', exact: true, element: <ReportsView/> },
      { path: '/usuarios', exact: true, element: <UsersView/> },
      { path: '/ajuda', exact: true, element: <WikiView/> },
      { path: '/wiki', exact: true, element: <WikiView/> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <LoginWrapper /> },
      { path: '/auth/register', element: <Register /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  }
];

const router = createBrowserRouter(Router)

export default router;
