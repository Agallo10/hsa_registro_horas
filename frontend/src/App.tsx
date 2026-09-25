import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginView } from './auth/LoginView';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { PersonasView } from './features/personas/PersonasView';
import { CalendarioView } from './features/calendario/CalendarioView';
import { ReporteView } from './features/reporte/ReporteView';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<PersonasView />} />
          <Route path="/persona/:id" element={<CalendarioView />} />
          <Route path="/reporte" element={<ReporteView />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
