import { useEffect, useState } from 'react';
import { CalendarCheck, MessageSquare } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Tabs from '../../components/ui/Tabs';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { bookingsService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import useProfessionalLookup from './useProfessionalLookup';
import { formatCurrency, formatFullDate, formatTime } from '../../lib/format';
import { APPOINTMENT_STATUS, MODALITIES } from '../../lib/status';

const TABS = [
  { id: 'proximas', label: 'Próximas' },
  { id: 'pasadas', label: 'Pasadas' },
  { id: 'canceladas', label: 'Canceladas' },
];

function bucketFor(booking) {
  if (booking.status === 'cancelada') return 'canceladas';
  if (booking.status === 'finalizada') return 'pasadas';
  return 'proximas';
}

export default function BookingsPage() {
  const toast = useToast();
  const professionals = useProfessionalLookup();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('proximas');
  const [cancellingId, setCancellingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    bookingsService
      .list()
      .then((items) => {
        setBookings(items);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const filtered = bookings.filter((booking) => bucketFor(booking) === tab);

  const handleCancel = async () => {
    if (!cancellingId) return;
    try {
      await bookingsService.cancel(cancellingId);
      setBookings((current) => current.map((booking) => (booking.id === cancellingId ? { ...booking, status: 'cancelada', cancelledBy: 'paciente' } : booking)));
      setCancellingId(null);
      toast.success('La reserva fue cancelada. Si habías pagado, el reembolso queda en curso.');
    } catch {
      setCancellingId(null);
      toast.error('No pudimos cancelar la reserva. Probá nuevamente.');
    }
  };

  if (loading && !error) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Mis reservas</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Gestioná tus consultas próximas, pasadas y canceladas.</p>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        tab === 'proximas' ? (
          <EmptyState
            icon={CalendarCheck}
            title="No tenés consultas próximas."
            description="Buscá un profesional y reservá tu próxima consulta en minutos."
            action={<Link to="/cliente/profesionales" className="btn-primary">Buscar profesional</Link>}
          />
        ) : (
          <EmptyState
            icon={CalendarCheck}
            title={tab === 'pasadas' ? 'Todavía no tenés consultas finalizadas' : 'No tenés reservas canceladas'}
            description={tab === 'pasadas' ? 'Cuando finalice una consulta va a aparecer acá.' : 'Las reservas que canceles van a aparecer acá.'}
          />
        )
      ) : (
        <ul className="space-y-3">
          {filtered.map((booking) => {
            const professional = professionals[booking.professionalId];
            const fullName = professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional';
            return (
              <li key={booking.id}>
                <article className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <Avatar name={fullName} size="lg" onlineStatus={professional?.availableNow ? 'online' : undefined} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold text-navy-800">{fullName}</h3>
                      <Badge variant={APPOINTMENT_STATUS[booking.status]?.badge}>{APPOINTMENT_STATUS[booking.status]?.label}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{booking.serviceName}{professional ? ` · ${professional.headline}` : ''}</p>
                    <p className="mt-1 text-sm font-bold capitalize text-action">{formatFullDate(booking.startsAt)} · {formatTime(booking.startsAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <Badge variant={MODALITIES[booking.modality]?.badge}>{MODALITIES[booking.modality]?.label}</Badge>
                    <p className="text-base font-extrabold text-navy-800">{formatCurrency(booking.price)}</p>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-col">
                    <Link to={`/cliente/reservas/${booking.id}`} className="btn-secondary justify-center py-2 text-xs">Ver detalle</Link>
                    <Link to="/cliente/mensajes" className="btn-secondary justify-center py-2 text-xs">
                      <MessageSquare className="h-3.5 w-3.5" /> Mensaje
                    </Link>
                    {['confirmada', 'pendiente'].includes(booking.status) && (
                      <button
                        type="button"
                        onClick={() => setCancellingId(booking.id)}
                        className="col-span-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        Cancelar reserva
                      </button>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(cancellingId)}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancel}
        title="Cancelar reserva"
        message="¿Querés cancelar esta reserva? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
      />
    </div>
  );
}
