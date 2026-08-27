import { useRef, useState } from 'react';
import { Bell, CalendarClock, CheckCheck, CreditCard, Menu, MessageSquare, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useRouter } from '../../router/Router';
import useDismissable from '../../hooks/useDismissable';
import Avatar from '../ui/Avatar';
import StatusPill from './StatusPill';
import { useProfessional } from '../../context/ProfessionalContext';
import { notificationsService } from '../../services/mockApi';
import { chatTimestamp } from '../../lib/format';

const NOTIFICATION_ICONS = {
  appointment: { icon: CalendarClock, class: 'bg-blue-50 text-action' },
  message: { icon: MessageSquare, class: 'bg-violet-50 text-violet-600' },
  payment: { icon: CreditCard, class: 'bg-emerald-50 text-emerald-600' },
  system: { icon: Settings, class: 'bg-amber-50 text-amber-600' },
};

const PAGE_TITLES = [
  ['/profesional/dashboard', 'Inicio'],
  ['/profesional/pacientes/', 'Paciente'],
  ['/profesional/pacientes', 'Mis pacientes'],
  ['/profesional/agenda', 'Agenda'],
  ['/profesional/disponibilidad', 'Disponibilidad'],
  ['/profesional/e-consultas', 'E-consultas'],
  ['/profesional/mensajes', 'Mensajes'],
  ['/profesional/pagos', 'Pagos'],
  ['/profesional/perfil', 'Mi perfil'],
  ['/profesional/configuracion', 'Configuración'],
];

export default function ProfessionalTopbar({ onOpenMobileMenu }) {
  const { pathname } = useRouter();
  const { availabilityStatus, updateStatus } = useProfessional();

  const [notifications, setNotifications] = useState([]);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  useDismissable(bellRef, bellOpen, () => setBellOpen(false));

  const openBell = () => {
    setBellOpen(true);
    if (!loadedOnce) {
      notificationsService.list().then((items) => {
        setNotifications(items);
        setLoadedOnce(true);
      });
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAllRead = async () => {
    await notificationsService.markAllRead();
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const pageTitle =
    PAGE_TITLES.find(([prefix]) =>
      prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`),
    )?.[1] || 'Portal del profesional';

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

        <StatusPill status={availabilityStatus} onChange={updateStatus} />

        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => (bellOpen ? setBellOpen(false) : openBell())}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-navy-800 transition-colors hover:border-action hover:text-action"
            aria-label={`Notificaciones${unreadCount ? ` (${unreadCount} sin leer)` : ''}`}
            aria-expanded={bellOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-float">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-extrabold text-navy-800">Notificaciones</p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-action transition-colors hover:text-action-dark"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar leídas
                  </button>
                )}
              </div>
              <ul className="scroll-area max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {notifications.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm font-medium text-slate-400">Sin notificaciones</li>
                )}
                {notifications.map((notification) => {
                  const iconConfig = NOTIFICATION_ICONS[notification.kind] || NOTIFICATION_ICONS.system;
                  const Icon = iconConfig.icon;
                  return (
                    <li key={notification.id} className={cn('flex gap-3 px-4 py-3', !notification.read && 'bg-blue-50/40')}>
                      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconConfig.class)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-navy-800">{notification.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-500">{notification.body}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {chatTimestamp(notification.sentAt)}
                        </p>
                      </div>
                      {!notification.read && <span className="ml-auto mt-2 h-2 w-2 shrink-0 rounded-full bg-action" aria-hidden="true" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />

        <Link to="/profesional/perfil" className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-action" aria-label="Ir a mi perfil">
          <Avatar name="María González" size="md" />
        </Link>
      </div>
    </header>
  );
}
