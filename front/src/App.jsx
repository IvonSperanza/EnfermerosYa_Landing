import { AuthProvider, RequireRole } from './context/AuthContext';
import { ProfessionalProvider } from './context/ProfessionalContext';
import { ToastProvider } from './context/ToastContext';
import ProfessionalLayout from './components/professional/ProfessionalLayout';
import ClientLayout from './components/client/ClientLayout';
import { Navigate, Link, RouterProvider, matchPath, useRouter } from './router/Router';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfessionalLoginPage from './pages/ProfessionalLoginPage';
import RegisterPage from './pages/RegisterPage';
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
import ClientDashboardPage from './pages/client/DashboardPage';
import ProfessionalsPage from './pages/client/ProfessionalsPage';
import ProfessionalProfilePage from './pages/client/ProfessionalProfilePage';
import SpecialtiesPage from './pages/client/SpecialtiesPage';
import ServicesPage from './pages/client/ServicesPage';
import BookingsPage from './pages/client/BookingsPage';
import BookingDetailPage from './pages/client/BookingDetailPage';
import BookingFlowPage from './pages/client/BookingFlowPage';
import EConsultsListPage from './pages/client/EConsultsPage';
import EConsultRoomPage from './pages/client/EConsultRoomPage';
import ClientMessagesPage from './pages/client/ClientMessagesPage';
import ClientPaymentsPage from './pages/client/PaymentsPage';
import HistoryPage from './pages/client/HistoryPage';
import ClientProfilePage from './pages/client/ProfilePage';
import ClientSettingsPage from './pages/client/SettingsPage';

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

const CLIENT_ROUTES = [
  { path: '/cliente/dashboard', render: () => <ClientDashboardPage /> },
  { path: '/cliente/reservar', render: () => <BookingFlowPage /> },
  { path: '/cliente/reservas/:id', render: ({ params }) => <BookingDetailPage bookingId={params.id} /> },
  { path: '/cliente/reservas', render: () => <BookingsPage /> },
  { path: '/cliente/profesionales/:id', render: ({ params }) => <ProfessionalProfilePage professionalId={params.id} /> },
  { path: '/cliente/profesionales', render: () => <ProfessionalsPage /> },
  { path: '/cliente/especialidades', render: () => <SpecialtiesPage /> },
  { path: '/cliente/servicios', render: () => <ServicesPage /> },
  { path: '/cliente/e-consultas/:professionalId', render: ({ params }) => <EConsultRoomPage professionalId={params.professionalId} /> },
  { path: '/cliente/e-consultas', render: () => <EConsultsListPage /> },
  { path: '/cliente/mensajes', render: () => <ClientMessagesPage /> },
  { path: '/cliente/pagos', render: () => <ClientPaymentsPage /> },
  { path: '/cliente/historial', render: () => <HistoryPage /> },
  { path: '/cliente/perfil', render: () => <ClientProfilePage /> },
  { path: '/cliente/configuracion', render: () => <ClientSettingsPage /> },
];

function NotFoundPage({ homeTo = '/profesional/dashboard' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-center">
      <p className="text-5xl font-extrabold text-action">404</p>
      <h2 className="mt-3 text-lg font-extrabold text-navy-800">Página no encontrada</h2>
      <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">
        La dirección que buscás no existe o fue movida.
      </p>
      <Link to={homeTo} className="btn-primary mt-6">
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

function ClientPortalRouter() {
  const { pathname } = useRouter();

  if (pathname === '/cliente' || pathname === '/cliente/') {
    return <Navigate to="/cliente/dashboard" />;
  }

  for (const route of CLIENT_ROUTES) {
    const match = matchPath(route.path, pathname);
    if (match) {
      return <ClientLayout>{route.render(match)}</ClientLayout>;
    }
  }

  return (
    <ClientLayout>
      <NotFoundPage homeTo="/cliente/dashboard" />
    </ClientLayout>
  );
}

function AppRoutes() {
  const { pathname } = useRouter();

  if (pathname === '/profesional/login' || pathname === '/profesional/login/') {
    return <ProfessionalLoginPage />;
  }

  if (pathname.startsWith('/profesional')) {
    return (
      <RequireRole role="healthcare_professional">
        <PortalRouter />
      </RequireRole>
    );
  }

  if (pathname.startsWith('/cliente')) {
    return (
      <RequireRole role="patient" message="Esta sección es exclusiva para pacientes con sesión iniciada.">
        <ClientPortalRouter />
      </RequireRole>
    );
  }

  if (pathname === '/ingresar' || pathname === '/ingresar/') {
    return <LoginPage />;
  }

  if (pathname === '/registrarse' || pathname === '/registrarse/') {
    return <RegisterPage />;
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
