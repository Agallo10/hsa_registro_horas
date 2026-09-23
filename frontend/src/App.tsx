import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginView } from './auth/LoginView';
import { AdminRoute, ProtectedRoute } from './auth/ProtectedRoute';
import { CalendarioView } from './features/calendario/CalendarioView';
import { ReporteView } from './features/reporte/ReporteView';
import { UsuariosView } from './features/usuarios/UsuariosView';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<CalendarioView />} />
          <Route element={<AdminRoute />}>
            <Route path="/reporte" element={<ReporteView />} />
            <Route path="/usuarios" element={<UsuariosView />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
