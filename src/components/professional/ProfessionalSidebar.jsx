import { Home, Users, CalendarDays, Clock4, MessagesSquare, MessageSquareText, CreditCard, UserRound, Settings, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { useProfessional } from '../../context/ProfessionalContext';
import { PROFESSIONAL } from '../../data/professional';
import { StatusDot } from './StatusPill';
import { PROFESSIONAL_STATUS } from '../../lib/status';
import Avatar from '../ui/Avatar';

const NAV_ITEMS = [
  { label: 'Inicio', icon: Home, path: '/profesional/dashboard', exact: true },
  { label: 'Mis pacientes', icon: Users, path: '/profesional/pacientes' },
  { label: 'Agenda', icon: CalendarDays, path: '/profesional/agenda' },
  { label: 'Disponibilidad', icon: Clock4, path: '/profesional/disponibilidad' },
  { label: 'E-consultas', icon: MessageSquareText, path: '/profesional/e-consultas' },
  { label: 'Mensajes', icon: MessagesSquare, path: '/profesional/mensajes' },
  { label: 'Pagos', icon: CreditCard, path: '/profesional/pagos' },
  { label: 'Mi perfil', icon: UserRound, path: '/profesional/perfil' },
  { label: 'Configuración', icon: Settings, path: '/profesional/configuracion' },
];

export default function ProfessionalSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }) {
  const { pathname, navigate } = useRouter();
  const { logout } = useAuth();
  const { availabilityStatus } = useProfessional();

  const isActive = (item) =>
    item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);

  const handleLogout = () => {
    onCloseMobile();
    logout();
    navigate('/');
  };

  const nav = (
    <>
      <div className={cn('flex h-16 items-center border-b border-white/10 px-4 lg:px-5')}>
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Ir al inicio de EnfermerosYa">
          <img src="/logo.jpg" alt="" aria-hidden="true" className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm" />
          <span className={cn('text-lg font-extrabold tracking-tight text-white', collapsed && 'lg:hidden')}>
            Enfermeros<span className="text-blue-300">Ya</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Portal del profesional" className="scroll-area flex-1 overflow-y-auto py-4">
        {!collapsed && (
          <p className="mb-2 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-400/80">Portal</p>
        )}
        <ul className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                    active
                      ? 'bg-action text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                    collapsed && 'lg:justify-center',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-white/5 p-3',
            collapsed && 'lg:justify-center lg:bg-transparent lg:p-0',
          )}
        >
          <Avatar name={`${PROFESSIONAL.firstName} ${PROFESSIONAL.lastName}`} size="md" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">Dra. María González</p>
              <p className="truncate text-xs font-medium text-slate-400">Médica Clínica</p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-slate-200">
                <StatusDot status={availabilityStatus} />
                {PROFESSIONAL_STATUS[availabilityStatus]?.label}
              </p>
            </div>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="ml-auto rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Contraer menú
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col bg-navy-800 transition-all duration-300 lg:flex',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        {nav}
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-[70] bg-navy-950/50 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[71] flex w-72 flex-col bg-navy-800 shadow-float transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        {nav}
      </aside>
    </>
  );
}
