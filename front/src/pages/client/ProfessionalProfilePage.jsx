import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarPlus, ChevronRight, MapPin, MessageSquare } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { Link, useRouter } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import RatingStars from '../../components/client/RatingStars';
import { catalogService } from '../../services/clientApi';
import { MODALITIES } from '../../lib/status';
import { formatCurrency, formatDate, relativeDayLabel, dayBoundary } from '../../lib/format';
import { cn } from '../../lib/utils';

const MODALITY_LABELS = Object.fromEntries(Object.entries(MODALITIES).map(([key, value]) => [key, value.label]));

export default function ProfessionalProfilePage({ professionalId }) {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [professional, setProfessional] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [modality, setModality] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([catalogService.getProfessional(professionalId), catalogService.getAvailability(professionalId)])
      .then(([professionalData, availabilityData]) => {
        setProfessional(professionalData);
        setAvailability(availabilityData);
        setSelectedDay(availabilityData.findIndex((day) => day.slots.length > 0));
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, [professionalId]);

  const selectedDayData = availability[selectedDay] || null;

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDay]);

  useEffect(() => {
    if (!professional) return;
    setModality((current) => (current && professional.modalities.includes(current) ? current : professional.modalities[0]));
  }, [professional]);

  const handleContinue = () => {
    if (!selectedDayData || !selectedTime || !modality) return;
    const params = new URLSearchParams({
      profesional: professional.id,
      fecha: selectedDayData.date,
      hora: selectedTime,
      modalidad: modality,
    });
    navigate(`/cliente/reservar?${params.toString()}`);
  };

  if (loading) return <PageLoader />;
  if (error || !professional) return <ErrorState onRetry={load} />;

  const fullName = `${professional.firstName} ${professional.lastName}`;

  return (
    <div className="animate-fade-up space-y-5">
      <Link to="/cliente/profesionales" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-action">
        <ArrowLeft className="h-4 w-4" /> Buscar profesionales
      </Link>

      <header className="card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <Avatar name={fullName} size="xl" onlineStatus={professional.availableNow ? 'online' : undefined} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">{fullName}</h2>
              {professional.verificationStatus === 'verified' ? (
                <Badge variant="success"><BadgeCheck className="h-3.5 w-3.5" /> Perfil verificado</Badge>
              ) : (
                <Badge variant="warning">Verificación en proceso</Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm font-bold text-slate-600">{professional.headline}</p>
            <p className="inline-flex items-center gap-1 text-xs font-medium capitalize text-slate-400">
              <MapPin className="h-3 w-3" /> {professional.zone}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <RatingStars rating={professional.rating} reviewsCount={professional.reviewsCount} />
              <span className="text-xs font-semibold text-slate-400">{professional.consultationsCount} consultas realizadas</span>
              <span className="text-xs font-semibold text-slate-400">{professional.experienceYears} años de experiencia</span>
            </div>
          </div>
          <div className="grid shrink-0 gap-2 sm:flex sm:flex-row lg:flex-col lg:w-44">
            <button type="button" onClick={() => document.getElementById('disponibilidad-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-primary py-2.5 text-xs">
              Reservar consulta
            </button>
            {professional.acceptsOnline && (
              <Link to={`/cliente/mensajes`} className="btn-secondary py-2.5 text-xs">
                <MessageSquare className="h-4 w-4" /> Enviar mensaje
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section aria-labelledby="info-title" className="card p-5 sm:p-6">
            <h3 id="info-title" className="text-base font-extrabold text-navy-800">Sobre el profesional</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{professional.description}</p>
            <dl className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Especialidad</dt>
                <dd className="mt-0.5 font-semibold text-navy-800">{professional.headline}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Experiencia</dt>
                <dd className="mt-0.5 font-semibold text-navy-800">{professional.experienceYears} años</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Matrícula</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1.5 font-semibold text-navy-800">
                  {professional.licenseNumber}
                  {professional.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 text-action" aria-label="Verificada" />}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Consultorio</dt>
                <dd className="mt-0.5 font-semibold text-navy-800">{professional.office.street}, {professional.office.city}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="servicios-title" className="card p-5 sm:p-6">
            <h3 id="servicios-title" className="text-base font-extrabold text-navy-800">Servicios</h3>
            <ul className="mt-4 space-y-3">
              {professional.services.map((service) => (
                <li key={service.id} className="rounded-2xl border border-slate-100 p-4 transition-colors hover:border-blue-200">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-navy-800">{service.name}</h4>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500">{service.description}</p>
                    </div>
                    <p className="shrink-0 text-right text-sm font-extrabold text-navy-800">
                      {formatCurrency(service.price)}
                      <span className="block text-[11px] font-semibold text-slate-400">{service.durationMinutes} min</span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <ul className="flex flex-wrap gap-1.5" aria-label={`Modalidades de ${service.name}`}>
                      {service.modalities.map((modalityKey) => (
                        <li key={modalityKey}>
                          <Badge variant={MODALITIES[modalityKey]?.badge || 'neutral'}>{MODALITY_LABELS[modalityKey] || modalityKey}</Badge>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/cliente/reservar?profesional=${professional.id}&servicio=${service.id}`}
                      className="btn-secondary px-4 py-2 text-xs"
                    >
                      Reservar
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="resenas-title" className="card p-5 sm:p-6">
            <h3 id="resenas-title" className="text-base font-extrabold text-navy-800">Reseñas de pacientes</h3>
            <ul className="mt-4 space-y-3">
              {(professional.reviews || []).map((review) => (
                <li key={`${review.author}-${review.date}`} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={review.author} size="sm" />
                      <p className="text-sm font-bold text-navy-800">{review.author}</p>
                    </div>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{review.text}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{formatDate(review.date)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside id="disponibilidad-card" className="scroll-mt-24 lg:sticky lg:top-24">
          <AvailabilityCard
            availability={availability}
            professional={professional}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            modality={modality}
            onSelectModality={setModality}
            onContinue={handleContinue}
          />
        </aside>
      </div>
    </div>
  );
}

export function AvailabilityCard({
  availability,
  professional,
  selectedDay,
  onSelectDay,
  selectedTime,
  onSelectTime,
  modality,
  onSelectModality,
  onContinue,
}) {
  const dayOptions = useMemo(
    () =>
      availability.map((day, index) => ({
        index,
        date: new Date(day.date),
        slotsCount: day.slots.length,
      })),
    [availability],
  );

  if (dayOptions.every((day) => day.slotsCount === 0)) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="Sin horarios publicados por ahora"
        description="Este profesional todavía no cargó disponibilidad. Probá nuevamente en unos días."
      />
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-base font-extrabold text-navy-800">Próximos horarios disponibles</h3>

      <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Elegí el día">
        {dayOptions.map((day) => (
          <button
            key={day.index}
            type="button"
            role="tab"
            aria-selected={selectedDay === day.index}
            disabled={day.slotsCount === 0}
            onClick={() => onSelectDay(day.index)}
            className={cn(
              'flex w-[68px] shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
              selectedDay === day.index
                ? 'border-action bg-action text-white shadow-sm'
                : 'border-slate-200 bg-white text-navy-800 hover:border-action',
              day.slotsCount === 0 && 'cursor-not-allowed opacity-40',
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
              {relativeDayLabel(dayBoundary(day.date))}
            </span>
            <span className="text-lg font-extrabold leading-tight">{day.date.getDate()}</span>
          </button>
        ))}
      </div>

      {modality && (
        <fieldset className="mt-4">
          <legend className="form-label">Modalidad</legend>
          <div className="flex flex-wrap gap-1.5">
            {professional.modalities.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelectModality(option)}
                aria-pressed={modality === option}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                  modality === option ? 'bg-action text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {MODALITY_LABELS[option]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="mt-4">
        <legend className="form-label">Horario</legend>
        {selectedDayData?.slots.length ? (
          <div className="grid grid-cols-3 gap-2">
            {selectedDayData.slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectTime(slot)}
                aria-pressed={selectedTime === slot}
                className={cn(
                  'rounded-xl border px-2 py-2 text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                  selectedTime === slot
                    ? 'border-action bg-blue-50 text-action ring-1 ring-action'
                    : 'border-slate-200 bg-white text-navy-800 hover:border-action',
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">
            Sin horarios para este día. Elegí otra fecha.
          </p>
        )}
      </fieldset>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500">
          {selectedTime
            ? `${relativeDayLabel(new Date(selectedDayData.date))} · ${selectedTime} · ${MODALITY_LABELS[modality]}`
            : 'Seleccioná día y horario para continuar'}
        </p>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTime || !modality}
          className="btn-primary mt-3 w-full py-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar con la reserva
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
