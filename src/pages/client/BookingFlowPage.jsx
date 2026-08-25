import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, CreditCard, Search, Smartphone, Wallet } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Link, useRouter } from '../../router/Router';
import { EmptyState, PageLoader } from '../../components/ui/Feedback';
import { bookingsService, catalogService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import useProfessionalLookup from './useProfessionalLookup';
import { formatCurrency, formatDate, relativeDayLabel, dayBoundary } from '../../lib/format';
import { MODALITIES } from '../../lib/status';
import { cn } from '../../lib/utils';

const STEPS = ['Profesional', 'Servicio', 'Modalidad', 'Fecha', 'Horario', 'Confirmar', 'Pago'];
const PAYMENT_METHODS = [
  { id: 'tarjeta', label: 'Tarjeta de crédito/débito', detail: 'Visa •••• 4523', icon: CreditCard },
  { id: 'mercado_pago', label: 'Mercado Pago', detail: 'Saldo disponible', icon: Smartphone },
  { id: 'transferencia', label: 'Transferencia bancaria', detail: 'CBU al confirmar', icon: Wallet },
];

function timeToIso(dateIso, time) {
  const [hours, minutes] = time.split(':').map(Number);
  return dayBoundary(new Date(dateIso), hours, minutes).toISOString();
}

export default function BookingFlowPage() {
  const toast = useToast();
  const { navigate, query } = useRouter();
  const professionalsMap = useProfessionalLookup();

  const [professionals, setProfessionals] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({
    professionalId: query.get('profesional') || '',
    serviceId: '',
    serviceName: '',
    modality: '',
    dateIso: '',
    time: '',
    price: null,
    durationMinutes: null,
    reason: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [processing, setProcessing] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  useEffect(() => {
    catalogService.listProfessionals().then(setProfessionals);
  }, []);

  useEffect(() => {
    if (!selection.professionalId || !professionalsMap[selection.professionalId]) return;
    catalogService.getAvailability(selection.professionalId).then((days) => {
      setAvailability(days);
      setSelection((current) => {
        if (current.dateIso && days.some((day) => day.date === current.dateIso && day.slots.includes(current.time))) {
          return current;
        }
        return { ...current, dateIso: '', time: '' };
      });
    });
  }, [selection.professionalId, professionalsMap]);

  const professional = selection.professionalId ? professionalsMap[selection.professionalId] : null;

  const filteredProfessionals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const base = term
      ? professionals.filter((item) => `${item.firstName} ${item.lastName} ${item.headline}`.toLowerCase().includes(term))
      : professionals;
    return [...base].sort((a, b) => b.rating - a.rating).slice(0, 8);
  }, [professionals, searchTerm]);

  const selectProfessional = async (candidate) => {
    setSelection((current) => ({
      ...current,
      professionalId: candidate.id,
      serviceId: '',
      serviceName: '',
      modality: candidate.modalities[0],
      dateIso: '',
      time: '',
      price: null,
      durationMinutes: null,
    }));
    setStepIndex(1);
  };

  const selectService = (service) => {
    setSelection((current) => ({
      ...current,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
      modality: current.modality && service.modalities.includes(current.modality)
        ? current.modality
        : professional.modalities.find((option) => service.modalities.includes(option)) || service.modalities[0],
      dateIso: '',
      time: '',
    }));
    setStepIndex(2);
  };

  const allowedModalities = useMemo(
    () => (professional && selection.serviceName
      ? professional.services.find((service) => service.id === selection.serviceId)?.modalities || professional.modalities
      : []),
    [professional, selection.serviceId],
  );

  const selectedDayData = availability.find((day) => day.date === selection.dateIso) || null;

  const canContinue = [
    Boolean(selection.professionalId),
    Boolean(selection.serviceId),
    Boolean(selection.modality),
    Boolean(selection.dateIso),
    Boolean(selection.time),
    true,
    true,
  ][stepIndex];

  const handleNext = () => {
    if (!canContinue) return;
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setExitConfirmOpen((current) => (stepIndex === 0 ? !current : false));
    if (stepIndex > 0) setStepIndex((current) => current - 1);
  };

  const handlePay = async () => {
    if (!professional) return;
    setProcessing(true);
    try {
      const booking = await bookingsService.create({
        professionalId: professional.id,
        serviceId: selection.serviceId,
        serviceName: selection.serviceName,
        startsAt: timeToIso(selection.dateIso, selection.time),
        durationMinutes: selection.durationMinutes,
        modality: selection.modality,
        price: selection.price,
        reason: selection.reason.trim(),
      });
      setCreatedBookingId(booking.id);
      toast.success('¡Reserva confirmada! Te enviamos los detalles por mensaje.');
    } catch {
      toast.error('No pudimos procesar el pago. Probá nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  if (createdBookingId) {
    return (
      <div className="animate-fade-up mx-auto max-w-lg py-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-500" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-navy-800">¡Reserva confirmada!</h2>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          {professional ? `${professional.headline}, ${formatDate(timeToIso(selection.dateIso, selection.time))} · ${selection.time} hs.` : ''}
          {' '}Te enviamos un recordatorio antes de la consulta.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link to={`/cliente/reservas/${createdBookingId}`} className="btn-primary">Ver detalle</Link>
          <Link to="/cliente/reservas" className="btn-secondary">Ir a mis reservas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Nueva reserva</h2>
        <ol className="scrollbar-none mt-4 flex gap-1.5 overflow-x-auto" aria-label="Progreso de la reserva">
          {STEPS.map((label, index) => (
            <li key={label} className="flex min-w-[86px] flex-1 flex-col items-center gap-1.5">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition-colors', index < stepIndex ? 'bg-emerald-100 text-emerald-600' : index === stepIndex ? 'bg-action text-white' : 'bg-slate-100 text-slate-400')}>
                {index < stepIndex ? '✓' : index + 1}
              </div>
              <span className={cn('whitespace-nowrap text-center text-[10px] font-bold uppercase tracking-wide', index <= stepIndex ? 'text-navy-800' : 'text-slate-400')}>
                {label}
              </span>
            </li>
          ))}
        </ol>
      </header>

      <section className="card p-5 sm:p-6">
        {stepIndex === 0 && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Elegí un profesional</h3>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre o especialidad…"
                className="form-input pl-10"
              />
            </div>
            {filteredProfessionals.length === 0 ? (
              <EmptyState title="Sin resultados" description="Probá con otro nombre o especialidad." className="mt-4" />
            ) : (
              <ul className="mt-4 space-y-2">
                {filteredProfessionals.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => selectProfessional(candidate)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3.5 text-left transition-all hover:border-action hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
                    >
                      <Avatar name={`${candidate.firstName} ${candidate.lastName}`} size="md" onlineStatus={candidate.availableNow ? 'online' : undefined} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-extrabold text-navy-800">
                          {candidate.firstName} {candidate.lastName}
                          {candidate.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 text-action" />}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-500">{candidate.headline}</span>
                        <span className="mt-0.5 block text-xs font-bold text-action">Desde {formatCurrency(candidate.priceFrom)}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {stepIndex === 1 && professional && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">¿Qué servicio necesitás?</h3>
            <ul className="mt-4 space-y-2">
              {professional.services.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => selectService(service)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all hover:border-action hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                      selection.serviceId === service.id ? 'border-action bg-blue-50/50' : 'border-slate-200',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold text-navy-800">{service.name}</span>
                      <span className="mt-0.5 block text-xs font-medium text-slate-500">{service.durationMinutes} min · {service.modalities.map((modalityKey) => MODALITIES[modalityKey]?.label).join(', ')}</span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold text-action">{formatCurrency(service.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stepIndex === 2 && professional && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Modalidad</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {allowedModalities.map((modalityKey) => (
                <button
                  key={modalityKey}
                  type="button"
                  onClick={() => setSelection((current) => ({ ...current, modality: modalityKey, dateIso: '', time: '' }))}
                  aria-pressed={selection.modality === modalityKey}
                  className={cn(
                    'rounded-2xl border px-4 py-5 text-sm font-extrabold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                    selection.modality === modalityKey ? 'border-action bg-blue-50 text-action' : 'border-slate-200 text-slate-600 hover:border-action',
                  )}
                >
                  <Badge variant={MODALITIES[modalityKey]?.badge}>{MODALITIES[modalityKey]?.label}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {stepIndex === 3 && professional && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Elegí el día</h3>
            <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
              {availability.map((day, index) => {
                const date = new Date(day.date);
                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={day.slots.length === 0}
                    onClick={() => setSelection((current) => ({ ...current, dateIso: day.date, time: '' }))}
                    aria-pressed={selection.dateIso === day.date}
                    className={cn(
                      'flex w-[68px] shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                      selection.dateIso === day.date ? 'border-action bg-action text-white shadow-sm' : 'border-slate-200 bg-white text-navy-800 hover:border-action',
                      day.slots.length === 0 && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{relativeDayLabel(dayBoundary(date))}</span>
                    <span className="text-lg font-extrabold leading-tight">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-400">
              Los días sin horarios disponibles aparecen deshabilitados.
            </p>
          </div>
        )}

        {stepIndex === 4 && professional && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Elegí el horario</h3>
            {selectedDayData?.slots.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {selectedDayData.slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelection((current) => ({ ...current, time: slot }))}
                    aria-pressed={selection.time === slot}
                    className={cn(
                      'rounded-xl border px-2 py-2.5 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                      selection.time === slot ? 'border-action bg-blue-50 text-action ring-1 ring-action' : 'border-slate-200 text-navy-800 hover:border-action',
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin horarios ese día" description="Volvé atrás y elegí otra fecha." className="mt-4" />
            )}
          </div>
        )}

        {stepIndex === 5 && professional && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Confirmá los datos</h3>
            <dl className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 text-sm">
              {[
                ['Profesional', `${professional.firstName} ${professional.lastName}`],
                ['Servicio', selection.serviceName],
                ['Fecha', formatDate(timeToIso(selection.dateIso, selection.time))],
                ['Horario', `${relativeDayLabel(dayBoundary(new Date(selection.dateIso)))}, ${selection.time} hs · ${selection.durationMinutes} min`],
                ['Modalidad', MODALITIES[selection.modality]?.label],
              ].map(([term, value]) => (
                <div key={term} className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="font-semibold text-slate-500">{term}</dt>
                  <dd className="text-right font-extrabold capitalize text-navy-800">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="font-semibold text-slate-500">Total</dt>
                <dd className="text-right text-lg font-extrabold text-action">{formatCurrency(selection.price)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <label htmlFor="booking-reason" className="form-label">Motivo de la consulta (opcional)</label>
              <textarea
                id="booking-reason"
                rows={2}
                value={selection.reason}
                onChange={(event) => setSelection((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Contale brevemente al profesional qué necesitás…"
                className="form-input resize-none"
              />
            </div>
          </div>
        )}

        {stepIndex === 6 && professional && (
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Pago</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Pagás {formatCurrency(selection.price)} por {MODALITIES[selection.modality]?.label.toLowerCase()} con {professional.firstName} {professional.lastName}.
            </p>
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Método de pago</legend>
              {PAYMENT_METHODS.map((methodOption) => {
                const Icon = methodOption.icon;
                return (
                  <label
                    key={methodOption.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all focus-within:ring-2 focus-within:ring-action',
                      paymentMethod === methodOption.id ? 'border-action bg-blue-50/50' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === methodOption.id}
                      onChange={() => setPaymentMethod(methodOption.id)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <Icon className="h-5 w-5 shrink-0 text-action" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-navy-800">{methodOption.label}</span>
                      <span className="block truncate text-xs font-medium text-slate-500">{methodOption.detail}</span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={handleBack} className="btn-secondary px-4 text-xs">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button type="button" onClick={handleNext} disabled={!canContinue} className="btn-primary px-6 disabled:cursor-not-allowed disabled:opacity-40">
              Siguiente <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={handlePay} disabled={processing} className="btn-primary px-6 disabled:opacity-60">
              {processing ? 'Procesando…' : `Confirmar y pagar ${formatCurrency(selection.price)}`}
            </button>
          )}
        </div>
      </section>

      {professional && (
        <p className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <Avatar name={`${professional.firstName} ${professional.lastName}`} size="xs" />
          Reservando con {professional.firstName} {professional.lastName} · {professional.headline}
        </p>
      )}

      <ConfirmDialog
        open={exitConfirmOpen}
        onClose={() => setExitConfirmOpen(false)}
        onConfirm={() => navigate('/cliente/dashboard')}
        title="Abandonar la reserva"
        message="Si volvés ahora se pierde lo que cargaste en este formulario."
        confirmLabel="Sí, salir"
        cancelLabel="Seguir reservando"
      />
    </div>
  );
}
