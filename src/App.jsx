import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider as FlowbiteThemeProvider } from 'flowbite-react';
import { flowbiteTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import RequireAuth from './routes/RequireAuth';
import RequireGuest from './routes/RequireGuest';
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MapaPage = lazy(() => import('./pages/MapaPage'));
const CorridasPage = lazy(() => import('./pages/corridas/CorridasPage'));
const CorridaDetalhePage = lazy(() => import('./pages/corridas/CorridaDetalhePage'));
const MotoristasPage = lazy(() => import('./pages/motoristas/MotoristasPage'));
const MotoristaDetalhePage = lazy(() => import('./pages/motoristas/MotoristaDetalhePage'));
const MotoristaFormPage = lazy(() => import('./pages/motoristas/MotoristaFormPage'));
const PassageirosPage = lazy(() => import('./pages/passageiros/PassageirosPage'));
const PassageiroDetalhePage = lazy(() => import('./pages/passageiros/PassageiroDetalhePage'));
const MensagensPage = lazy(() => import('./pages/MensagensPage'));
const NotificacoesPage = lazy(() => import('./pages/NotificacoesPage'));
const LogsPage = lazy(() => import('./pages/LogsPage'));
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <FlowbiteThemeProvider theme={flowbiteTheme}>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route element={<RequireGuest />}>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                  </Route>
                </Route>

                <Route element={<RequireAuth />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/mapa" element={<MapaPage />} />
                    <Route path="/corridas" element={<CorridasPage />} />
                    <Route path="/corridas/:id" element={<CorridaDetalhePage />} />
                    <Route path="/motoristas" element={<MotoristasPage />} />
                    <Route path="/motoristas/novo" element={<MotoristaFormPage />} />
                    <Route path="/motoristas/:id" element={<MotoristaDetalhePage />} />
                    <Route path="/motoristas/:id/editar" element={<MotoristaFormPage />} />
                    <Route path="/passageiros" element={<PassageirosPage />} />
                    <Route path="/passageiros/:id" element={<PassageiroDetalhePage />} />
                    <Route path="/mensagens" element={<MensagensPage />} />
                    <Route path="/notificacoes" element={<NotificacoesPage />} />
                    <Route path="/logs" element={<LogsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </FlowbiteThemeProvider>
    </ThemeProvider>
  );
}
