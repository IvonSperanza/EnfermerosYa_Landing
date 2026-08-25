import { Menu } from 'lucide-react';
import { Link, useRouter } from '../../router/Router';
import Avatar from '../ui/Avatar';

const PAGE_TITLES = [
  ['/cliente/reservar', 'Nueva reserva'],
  ['/cliente/profesionales/', 'Perfil del profesional'],
  ['/cliente/profesionales', 'Buscar profesionales'],
  ['/cliente/especialidades', 'Especialidades'],
  ['/cliente/servicios', 'Servicios de salud'],
  ['/cliente/reservas/', 'Detalle de reserva'],
  ['/cliente/reservas', 'Mis reservas'],
  ['/cliente/e-consultas/', 'Consulta online'],
  ['/cliente/e-consultas', 'E-consultas'],
  ['/cliente/mensajes', 'Mensajes'],
  ['/cliente/pagos', 'Mis pagos'],
  ['/cliente/historial', 'Historial de consultas'],
  ['/cliente/perfil', 'Mi perfil'],
  ['/cliente/configuracion', 'Configuración'],
  ['/cliente/dashboard', 'Inicio'],
];

export default function ClientTopbar({ onOpenMobileMenu }) {
  const { pathname } = useRouter();

  const pageTitle =
    PAGE_TITLES.find(([prefix]) =>
      prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`),
    )?.[1] || 'Portal del paciente';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-navy-800 transition-colors hover:border-action hover:text-action lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-base font-extrabold tracking-tight text-navy-800 sm:text-lg">
          {pageTitle}
        </h1>

        <Link
          to="/cliente/perfil"
          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
          aria-label="Ir a mi perfil"
        >
          <Avatar name="María López" size="md" />
        </Link>
      </div>
    </header>
  );
}
