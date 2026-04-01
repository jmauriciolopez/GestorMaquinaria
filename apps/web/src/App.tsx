import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import DashboardOperativo from './pages/DashboardOperativo';
import Activos from './pages/Activos';
import ActivoDetail from './pages/ActivoDetail';
import Clientes from './pages/Clientes';
import Alquileres from './pages/Alquileres';
import Devoluciones from './pages/Devoluciones';
import Mantenimiento from './pages/Mantenimiento';
import Penalidades from './pages/Penalidades';
import Configuracion from './pages/Configuracion';
import Login from './pages/Login';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOperativo />} />
          <Route path="/activos" element={<Activos />} />
          <Route path="/activos/:id" element={<ActivoDetail />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/alquileres" element={<Alquileres />} />
          <Route path="/devoluciones" element={<Devoluciones />} />
          <Route path="/mantenimiento" element={<Mantenimiento />} />
          <Route path="/penalidades" element={<Penalidades />} />
          <Route path="/configuracion" element={<Configuracion />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
