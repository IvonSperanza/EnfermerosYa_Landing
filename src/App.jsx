import { AuthProvider, RequireRole } from './context/AuthContext';
import { ProfessionalProvider } from './context/ProfessionalContext';
import { ToastProvider } from './context/ToastContext';
import ProfessionalLayout from './components/professional/ProfessionalLayout';
import { Navigate, Link, RouterProvider, matchPath, useRouter } from './router/Router';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/professional/DashboardPage';
import PatientsPage from './pages/professional/PatientsPage';
import PatientDetailPage from './pages/professional/PatientDetailPage';
import AgendaPage from './pages/professional/AgendaPage';
import AvailabilityPage from './pages/professional/AvailabilityPage';
import EConsultsPage from './pages/professional/EConsultsPage';
import MessagesPage from './pages/professional/MessagesPage';
import PaymentsPage from './pages/professional/PaymentsPage';
import ProfilePage from './pages/professional/ProfilePage';
import SettingsPage from './pages/professional/SettingsPage';
import { PROFESSIONAL } from './data/professional';

const PORTAL_ROUTES = [
  { path: '/profesional/dashboard', render: () => <DashboardPage /> },
  { path: '/profesional/pacientes/:id', render: ({ params }) => <PatientDetailPage patientId={params.id} /> },
  { path: '/profesional/pacientes', render: () => <PatientsPage /> },
  { path: '/profesional/agenda', render: () => <AgendaPage /> },
  { path: '/profesional/disponibilidad', render: () => <AvailabilityPage /> },
  { path: '/profesional/e-consultas', render: () => <EConsultsPage /> },
  { path: '/profesional/mensajes', render: () => <MessagesPage /> },
  { path: '/profesional/pagos', render: () => <PaymentsPage /> },
  { path: '/profesional/perfil', render: () => <ProfilePage profile={PROFESSIONAL} /> },
  { path: '/profesional/configuracion', render: () => <SettingsPage /> },
];

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
      <p className="text-5xl font-extrabold text-action">404</p>
      <h2 className="mt-3 text-lg font-extrabold text-navy-800">Página no encontrada</h2>
      <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">
        La dirección que buscás no existe o fue movida.
      </p>
      <Link to="/profesional/dashboard" className="btn-primary mt-6">
        Volver al inicio
      </Link>
    </div>
  );
}

function PortalRouter() {
  const { pathname } = useRouter();

  if (pathname === '/profesional' || pathname === '/profesional/') {
    return <Navigate to="/profesional/dashboard" />;
  }

  for (const route of PORTAL_ROUTES) {
    const match = matchPath(route.path, pathname);
    if (match) {
      return <ProfessionalLayout>{route.render(match)}</ProfessionalLayout>;
    }
  }

  return (
    <ProfessionalLayout>
      <NotFoundPage />
    </ProfessionalLayout>
  );
}

function AppRoutes() {
  const { pathname } = useRouter();

  if (pathname.startsWith('/profesional')) {
    return (
      <RequireRole role="healthcare_professional">
        <PortalRouter />
      </RequireRole>
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <AuthProvider>
          <ProfessionalProvider>
            <AppRoutes />
          </ProfessionalProvider>
        </AuthProvider>
      </ToastProvider>
    </RouterProvider>
  );
}
