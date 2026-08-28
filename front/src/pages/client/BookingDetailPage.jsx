import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, CreditCard, MapPin, MessageSquare, Stethoscope } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Link, useRouter } from '../../router/Router';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { bookingsService, clientMessagesService, clientPaymentsService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import useProfessionalLookup from './useProfessionalLookup';
import { formatCurrency, formatFullDate, formatTime } from '../../lib/format';
import { APPOINTMENT_STATUS, MODALITIES, PAYMENT_METHODS } from '../../lib/status';

const ENTRY_WINDOW_MINUTES = 15;

export default function BookingDetailPage({ bookingId }) {
  const toast = useToast();
  const { navigate } = useRouter();
  const professionals = useProfessionalLookup();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([bookingsService.get(bookingId), clientPaymentsService.list()])
      .then(([bookingData, payments]) => {
        setBooking(bookingData);
        setPayment(payments.find((item) => item.bookingId === bookingId) || null);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, [bookingId]);

  if (loading && !error) return <PageLoader />;
  if (error || !booking) return <ErrorState onRetry={load} />;

  const professional = professionals[booking.professionalId];
  const fullName = professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional';
  const isCancellable = ['confirmada', 'pendiente'].includes(booking.status);
  const isOnline = booking.modality === 'online';
  const startsAt = new Date(booking.startsAt);
  const now = Date.now();
  const canEnterRoom = isOnline
    && ['confirmada', 'pendiente'].includes(booking.status)
    && now >= startsAt.getTime() - ENTRY_WINDOW_MINUTES * 60_000;

  const handleCancel = async () => {
    try {
      await bookingsService.cancel(booking.id);
      setBooking((current) => ({ ...current, status: 'cancelada', cancelledBy: 'paciente' }));
      toast.success('La reserva fue cancelada.');
    } catch {
      setCancelOpen(false);
      toast.error('No pudimos cancelar la reserva. Probá nuevamente.');
    }
  };

  return (
    <div className="animate-fade-up space-y-5">
      <Link to="/cliente/reservas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-action">
        <ArrowLeft className="h-4 w-4" /> Mis reservas
      </Link>

      <header className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar name={fullName} size="xl" onlineStatus={professional?.availableNow ? 'online' : undefined} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight text-navy-800">{fullName}</h2>
            {professional?.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 text-action" aria-label="Verificado" />}
            <Badge variant={APPOINTMENT_STATUS[booking.status]?.badge}>{APPOINTMENT_STATUS[booking.status]?.label}</Badge>
          </div>
          <p className="text-sm font-semibold text-slate-600">{professional?.headline}</p>
          {professional && (
            <Link to={`/cliente/profesionales/${professional.id}`} className="mt-1 inline-block text-xs font-bold text-action hover:text-action-dark">
              Ver perfil del profesional
            </Link>
          )}
        </div>
        <div className="grid shrink-0 gap-2 sm:w-48">
          <Link to="/cliente/mensajes" className="btn-secondary justify-center py-2.5 text-xs">
            <MessageSquare className="h-4 w-4" /> Enviar mensaje
          </Link>
          {isCancellable && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Cancelar reserva
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="consulta-title" className="card p-5 sm:p-6">
          <h3 id="consulta-title" className="text-base font-extrabold text-navy-800">Consulta</h3>
          <dl className="mt-4 space-y-3.5 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-action"><Stethoscope className="h-4 w-4" /></span>
              <div>
                <dt className="sr-only">Servicio</dt>
                <dd className="font-bold text-navy-800">{booking.serviceName}</dd>
                <dd className="text-xs font-medium text-slate-500">{booking.reason}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-action"><CalendarDays className="h-4 w-4" /></span>
              <div>
                <dt className="sr-only">Fecha y hora</dt>
                <dd className="font-semibold capitalize text-navy-800">{formatFullDate(booking.startsAt)}</dd>
                <dd className="text-xs font-medium text-slate-500">{formatTime(booking.startsAt)} hs · {booking.durationMinutes} minutos</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><MapPin className="h-4 w-4" /></span>
              <div>
                <dt className="sr-only">Modalidad</dt>
                <dd className="font-bold text-navy-800"><Badge variant={MODALITIES[booking.modality]?.badge}>{MODALITIES[booking.modality]?.label}</Badge></dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="h-4 w-4" /></span>
              <div>
                <dt className="sr-only">Precio</dt>
                <dd className="font-extrabold text-navy-800">{formatCurrency(booking.price)}</dd>
                <dd className="text-xs font-medium text-slate-500">
                  {payment ? `Pago ${PAYMENT_METHODS[payment.method]?.label || payment.method}${payment.status !== 'pagado' ? ` · ${payment.status}` : ''}` : 'Pago pendiente de acreditación'}
                </dd>
              </div>
            </div>
          </dl>
        </section>

        <section aria-labelledby="ubicacion-title" className="card p-5 sm:p-6">
          <h3 id="ubicacion-title" className="text-base font-extrabold text-navy-800">Ubicación</h3>
          {isOnline ? (
            <div className="mt-4 space-y-3">
              <p className="rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-action">Consulta online</p>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Vas a poder ingresar unos minutos antes del horario desde acá o desde la reserva.
              </p>
              {canEnterRoom ? (
                <Link to={`/cliente/e-consultas/${booking.professionalId}`} className="btn-primary w-full py-3 text-xs">
                  Ingresar a e-consulta
                </Link>
              ) : (
                <>
                  <button type="button" disabled className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-5 py-3 text-xs font-semibold text-slate-400">
                    Ingresar a e-consulta
                  </button>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Se habilita 15 minutos antes · {formatFullDate(booking.startsAt)} {formatTime(booking.startsAt)} hs
                  </p>
                </>
              )}
            </div>
          ) : booking.modality === 'presencial' ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-bold text-navy-800">{professional?.office.street}</p>
              <p className="font-medium capitalize text-slate-500">{professional?.office.city}</p>
              <p className="text-xs font-medium text-slate-400">Te recomendamos llegar 10 minutos antes.</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${professional?.office.street} ${professional?.office.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary mt-2 inline-flex w-full justify-center py-2.5 text-xs"
              >
                Ver en el mapa
              </a>
            </div>
          ) : (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-bold text-navy-800">A domicilio</p>
              <p className="font-medium text-slate-600">Virrey del Pino 2380, 3º A, CABA</p>
              <p className="text-xs font-medium text-slate-400">El profesional va a tu domicilio en el horario reservado.</p>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar reserva"
        message="¿Querés cancelar esta consulta? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar reserva"
        cancelLabel="Volver"
      />
    </div>
  );
}
