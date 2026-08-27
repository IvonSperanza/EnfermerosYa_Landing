import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarPlus, FileClock, MonitorSmartphone, Search, Stethoscope } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { Link, useRouter } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import ProfessionalCard from '../../components/client/ProfessionalCard';
import { catalogService, bookingsService } from '../../services/clientApi';
import { SPECIALTIES } from '../../data/specialties';
import { formatCurrency, formatFullDate, formatTime } from '../../lib/format';
import { APPOINTMENT_STATUS, MODALITIES } from '../../lib/status';
import { professionalFullName } from '../../data/clientProfessionals';

const QUICK_ACCESS = [
  { id: 'buscar', icon: Search, title: 'Buscar profesional', description: 'Médicos y enfermeros verificados cerca tuyo.', href: '/cliente/profesionales', tone: 'bg-blue-50 text-action' },
  { id: 'reservar', icon: CalendarPlus, title: 'Reservar consulta', description: 'Elegí profesional, horario y modalidad en pasos simples.', href: '/cliente/reservar', tone: 'bg-emerald-50 text-emerald-600' },
  { id: 'econsulta', icon: MonitorSmartphone, title: 'E-consulta', description: 'Consultá por chat con un disponible ahora.', href: '/cliente/e-consultas', tone: 'bg-violet-50 text-violet-600' },
  { id: 'reservas', icon: CalendarCheck, title: 'Ver reservas', description: 'Gestioná tus turnos próximos y pasados.', href: '/cliente/reservas', tone: 'bg-amber-50 text-amber-600' },
  { id: 'historial', icon: FileClock, title: 'Ver historial', description: 'Notas y documentos de tus consultas anteriores.', href: '/cliente/historial', tone: 'bg-red-50 text-red-500' },
];

export default function ClientDashboardPage() {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [searchForm, setSearchForm] = useState({ q: '', specialty: 'todas', modality: 'todas', location: '', maxPrice: '', minRating: '' });

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([catalogService.searchProfessionals({ sort: 'rating' }), bookingsService.upcoming()])
      .then(([recommended, upcoming]) => {
        setProfessionals(recommended.slice(0, 4));
        setNextBooking(upcoming[0] || null);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const professionalsMap = useMemo(() => Object.fromEntries(professionals.map((professional) => [professional.id, professional])), [professionals]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.q.trim()) params.set('q', searchForm.q.trim());
    if (searchForm.specialty !== 'todas') params.set('especialidad', searchForm.specialty);
    if (searchForm.modality !== 'todas') params.set('modalidad', searchForm.modality);
    if (searchForm.location.trim()) params.set('zona', searchForm.location.trim());
    if (searchForm.maxPrice) params.set('precioMax', searchForm.maxPrice);
    if (searchForm.minRating) params.set('rating', searchForm.minRating);
    navigate(`/cliente/profesionales${params.toString() ? `?${params.toString()}` : ''}`);
  };

  if (loading && !error) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  const bookingProfessional = nextBooking ? professionalsMap[nextBooking.professionalId] : null;

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Hola, María</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">¿Qué necesitás hoy?</p>
      </header>

      <section aria-labelledby="busqueda-principal" className="card p-5 sm:p-6">
        <h3 id="busqueda-principal" className="text-base font-extrabold text-navy-800">¿Qué profesional estás buscando?</h3>
        <form onSubmit={handleSearch} className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchForm.q}
              onChange={(event) => setSearchForm((current) => ({ ...current, q: event.target.value }))}
              placeholder="Buscar médico, enfermero o especialidad..."
              aria-label="Buscar médico, enfermero o especialidad"
              className="form-input py-3 pl-11 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={searchForm.specialty}
              onChange={(event) => setSearchForm((current) => ({ ...current, specialty: event.target.value }))}
              aria-label="Filtrar por especialidad"
              className="form-input py-2.5 text-sm"
            >
              <option value="todas">Toda especialidad</option>
              {SPECIALTIES.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
              ))}
            </select>
            <select
              value={searchForm.modality}
              onChange={(event) => setSearchForm((current) => ({ ...current, modality: event.target.value }))}
              aria-label="Filtrar por modalidad"
              className="form-input py-2.5 text-sm"
            >
              <option value="todas">Toda modalidad</option>
              <option value="presencial">Presencial</option>
              <option value="domicilio">A domicilio</option>
              <option value="online">E-consulta</option>
            </select>
            <input
              type="text"
              value={searchForm.location}
              onChange={(event) => setSearchForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Ubicación (ej: Belgrano)"
              aria-label="Ubicación"
              className="form-input py-2.5 text-sm"
            />
            <select
              value={searchForm.maxPrice}
              onChange={(event) => setSearchForm((current) => ({ ...current, maxPrice: event.target.value }))}
              aria-label="Precio máximo"
              className="form-input py-2.5 text-sm"
            >
              <option value="">Cualquier precio</option>
              <option value="10000">Hasta $10.000</option>
              <option value="15000">Hasta $15.000</option>
              <option value="20000">Hasta $20.000</option>
            </select>
            <select
              value={searchForm.minRating}
              onChange={(event) => setSearchForm((current) => ({ ...current, minRating: event.target.value }))}
              aria-label="Calificación mínima"
              className="form-input py-2.5 text-sm"
            >
              <option value="">Cualquier calificación</option>
              <option value="4">4 estrellas o más</option>
              <option value="4.5">4,5 estrellas o más</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full py-3 sm:w-auto sm:px-8">
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </form>
      </section>

      <section aria-labelledby="accesos-rapidos">
        <h3 id="accesos-rapidos" className="sr-only">Accesos rápidos</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className="card group flex h-full flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-3 text-sm font-extrabold text-navy-800">{item.title}</span>
                  <span className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{item.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {nextBooking && (
        <section aria-labelledby="proxima-reserva">
          <h3 id="proxima-reserva" className="mb-3 text-base font-extrabold text-navy-800">Próxima consulta</h3>
          <div className="card overflow-hidden">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-50 to-transparent p-5 sm:flex-row sm:items-center">
              <Avatar name={bookingProfessional ? professionalFullName(bookingProfessional) : '…'} size="xl" onlineStatus={bookingProfessional?.availableNow ? 'online' : undefined} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-lg font-extrabold text-navy-800">{bookingProfessional ? professionalFullName(bookingProfessional) : 'Profesional'}</h4>
                  <Badge variant={APPOINTMENT_STATUS[nextBooking.status]?.badge}>{APPOINTMENT_STATUS[nextBooking.status]?.label}</Badge>
                </div>
                <p className="text-sm font-semibold text-slate-600">{bookingProfessional?.headline}</p>
                <p className="mt-1 text-sm font-bold capitalize text-action">{formatFullDate(nextBooking.startsAt)} · {formatTime(nextBooking.startsAt)}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Badge variant={MODALITIES[nextBooking.modality]?.badge}>{MODALITIES[nextBooking.modality]?.label}</Badge>
                  <span>{nextBooking.serviceName} · {formatCurrency(nextBooking.price)}</span>
                </p>
              </div>
              <div className="grid shrink-0 gap-2 sm:w-44">
                <Link to={`/cliente/reservas/${nextBooking.id}`} className="btn-primary py-2.5 text-xs">Ver reserva</Link>
                <Link to="/cliente/mensajes" className="btn-secondary py-2.5 text-xs">Enviar mensaje</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {!nextBooking && (
        <EmptyState
          icon={Stethoscope}
          title="No tenés consultas próximas."
          description="Cuando reserves una consulta va a aparecer acá con todos los detalles."
          action={<Link to="/cliente/profesionales" className="btn-primary">Buscar profesional</Link>}
        />
      )}

      <section aria-labelledby="recomendados">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 id="recomendados" className="text-base font-extrabold text-navy-800">Profesionales recomendados para vos</h3>
          <Link to="/cliente/profesionales" className="shrink-0 text-xs font-bold text-action transition-colors hover:text-action-dark">
            Ver todos
          </Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {professionals.map((professional) => (
            <li key={professional.id}>
              <ProfessionalCard professional={professional} reason={professional.reason} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
