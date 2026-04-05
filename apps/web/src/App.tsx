import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import DashboardOperativo from './pages/DashboardOperativo';
import Activos from './pages/Activos';
import ActivoDetail from './pages/ActivoDetail';
import Clientes from './pages/Clientes';
import Alquileres from './pages/Alquileres';
import AlquilerDetail from './pages/AlquilerDetail';
import Finanzas from './pages/Finanzas';
import Devoluciones from './pages/Devoluciones';
import Mantenimiento from './pages/Mantenimiento';
import Penalidades from './pages/Penalidades';
import Configuracion from './pages/Configuracion';
import Reportes from './pages/Reportes';
import Login from './pages/Login';

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ErrorBoundary><DashboardOperativo /></ErrorBoundary>
            } />
            <Route path="/activos" element={
              <ErrorBoundary><Activos /></ErrorBoundary>
            } />
            <Route path="/activos/:id" element={
              <ErrorBoundary><ActivoDetail /></ErrorBoundary>
            } />
            <Route path="/clientes" element={
              <ErrorBoundary><Clientes /></ErrorBoundary>
            } />
            <Route path="/alquileres" element={
              <ErrorBoundary><Alquileres /></ErrorBoundary>
            } />
            <Route path="/alquileres/:id" element={
              <ErrorBoundary><AlquilerDetail /></ErrorBoundary>
            } />
            <Route path="/devoluciones"  element={<Devoluciones />} />
            <Route path="/mantenimiento" element={<Mantenimiento />} />
            <Route path="/penalidades"   element={<Penalidades />} />
            <Route path="/reportes"      element={
              <ErrorBoundary><Reportes /></ErrorBoundary>
            } />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;
