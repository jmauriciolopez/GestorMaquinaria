import { Navigate } from 'react-router-dom';

// Esta página fue reemplazada por DashboardOperativo (con datos reales).
// El router en App.tsx ya apunta /dashboard → DashboardOperativo.
// Este archivo se mantiene como redirect por compatibilidad.
const Dashboard = () => <Navigate to="/dashboard" replace />;

export default Dashboard;
