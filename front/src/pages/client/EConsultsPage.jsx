import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, MonitorSmartphone, Search } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import RatingStars from '../../components/client/RatingStars';
import { catalogService } from '../../services/clientApi';
import { SPECIALTIES } from '../../data/specialties';
import { formatCurrency } from '../../lib/format';
import { cn } from '../../lib/utils';

export default function EConsultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [filters, setFilters] = useState({ q: '', profession: 'todos', specialty: 'todas', maxPrice: '', minRating: '', onlyNow: true });

  const load = () => {
    setLoading(true);
    setError(false);
    catalogService
      .searchProfessionals({ acceptsOnline: true, sort: 'rating' })
      .then((items) => {
        setProfessionals(items);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    return professionals.filter((professional) => {
      if (filters.onlyNow && !professional.availableNow) return false;
      if (term && !`${professional.firstName} ${professional.lastName}`.toLowerCase().includes(term)) return false;
      if (filters.profession !== 'todos' && professional.profession !== filters.profession) return false;
      if (filters.specialty !== 'todas' && professional.specialty !== filters.specialty) return false;
      if (filters.maxPrice && professional.eConsultPrice > Number(filters.maxPrice)) return false;
      if (filters.minRating && professional.rating < Number(filters.minRating)) return false;
      return true;
    });
  }, [professionals, filters]);

  if (loading && !error) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <section className="card overflow-hidden bg-gradient-to-r from-violet-50 via-blue-50/60 to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-action text-white shadow-sm">
            <MonitorSmartphone className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-navy-800 sm:text-xl">E-consultas</h2>
            <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
              Consultá por chat con médicos y enfermeros verificados, sin salir de casa. Respuesta inmediata, historial guardado y pago seguro.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            placeholder="Buscar profesional…"
            aria-label="Buscar profesional para e-consulta"
            className="form-input pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 lg:flex">
          <select
            value={filters.profession}
            onChange={(event) => setFilters((current) => ({ ...current, profession: event.target.value }))}
            aria-label="Tipo de profesional"
            className="form-input py-2.5 text-xs"
          >
            <option value="todos">Todos</option>
            <option value="medico">Médico/a</option>
            <option value="enfermero">Enfermero/a</option>
          </select>
          <select
            value={filters.specialty}
            onChange={(event) => setFilters((current) => ({ ...current, specialty: event.target.value }))}
            aria-label="Especialidad"
            className="form-input py-2.5 text-xs"
          >
            <option value="todas">Toda especialidad</option>
            {SPECIALTIES.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
            ))}
          </select>
          <select
            value={filters.maxPrice}
            onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
            aria-label="Precio máximo"
            className="form-input py-2.5 text-xs"
          >
            <option value="">Cualquier precio</option>
            <option value="6000">Hasta $6.000</option>
            <option value="9000">Hasta $9.000</option>
            <option value="12000">Hasta $12.000</option>
          </select>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-navy-800 transition-colors hover:border-action">
            <input
              type="checkbox"
              checked={filters.onlyNow}
              onChange={(event) => setFilters((current) => ({ ...current, onlyNow: event.target.checked }))}
              className="h-4 w-4 accent-blue-600"
            />
            Disponibles ahora
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MonitorSmartphone}
          title="Sin profesionales disponibles con estos filtros"
          description="Desactivá 'Disponibles ahora' para ver también profesionales con e-consulta programada."
          action={
            <button type="button" onClick={() => setFilters({ q: '', profession: 'todos', specialty: 'todas', maxPrice: '', minRating: '', onlyNow: false })} className="btn-secondary">
              Ver todos
            </button>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((professional) => (
            <li key={professional.id}>
              <article className="card flex h-full flex-col p-5 transition-shadow hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <Avatar name={`${professional.firstName} ${professional.lastName}`} size="lg" onlineStatus={professional.availableNow ? 'online' : undefined} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-extrabold text-navy-800">{professional.firstName} {professional.lastName}</h3>
                      {professional.verificationStatus === 'verified' && <BadgeCheck className="h-4 w-4 shrink-0 text-action" aria-label="Verificado" />}
                    </div>
                    <p className="truncate text-xs font-semibold text-slate-500">{professional.headline}</p>
                    <span className={cn('mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold', professional.availableNow ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', professional.availableNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')} aria-hidden="true" />
                      {professional.availableNow ? 'Disponible ahora' : 'Fuera de línea'}
                    </span>
                  </div>
                </div>
                <div className="mt-3"><RatingStars rating={professional.rating} reviewsCount={professional.reviewsCount} /></div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <p className="text-sm font-extrabold text-navy-800">{formatCurrency(professional.eConsultPrice)}<span className="ml-1 text-[11px] font-medium text-slate-400">/ 20 min chat</span></p>
                </div>
                <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-3">
                  {professional.availableNow ? (
                    <Link to={`/cliente/e-consultas/${professional.id}`} className="btn-primary col-span-2 justify-center py-2.5 text-xs">Consultar ahora</Link>
                  ) : (
                    <>
                      <Link to={`/cliente/profesionales/${professional.id}`} className="btn-secondary justify-center py-2.5 text-xs">Ver perfil</Link>
                      <Link to={`/cliente/reservar?profesional=${professional.id}&servicio=${professional.services.find((service) => service.modalities.includes('online'))?.id || ''}`} className="btn-primary justify-center py-2.5 text-xs">Reservar</Link>
                    </>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-xs font-medium text-slate-400">
        Las e-consultas no reemplazan la atención presencial ante urgencias.
      </p>
    </div>
  );
}
