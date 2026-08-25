import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Link, useRouter } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import ProfessionalCard from '../../components/client/ProfessionalCard';
import { catalogService } from '../../services/clientApi';
import { SPECIALTIES } from '../../data/specialties';
import { formatCurrency } from '../../lib/format';
import { cn } from '../../lib/utils';

const DEFAULT_FILTERS = {
  q: '',
  profession: 'todos',
  specialty: 'todas',
  modality: 'todas',
  availability: 'todas',
  location: '',
  maxPrice: '',
  minRating: '',
};

const SORT_OPTIONS = [
  { id: 'rating', label: 'Mejor calificación' },
  { id: 'priceAsc', label: 'Menor precio' },
  { id: 'priceDesc', label: 'Mayor precio' },
  { id: 'reviews', label: 'Más reseñas' },
];

function filtersFromQuery(query) {
  return {
    q: query.get('q') || '',
    profession: query.get('tipo') || 'todos',
    specialty: query.get('especialidad') || 'todas',
    modality: query.get('modalidad') || 'todas',
    availability: query.get('disponibilidad') || 'todas',
    location: query.get('zona') || '',
    maxPrice: query.get('precioMax') || '',
    minRating: query.get('rating') || '',
  };
}

export default function ProfessionalsPage() {
  const { navigate, query } = useRouter();
  const [filters, setFilters] = useState(() => filtersFromQuery(query));
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [results, setResults] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = useCallback((currentFilters, currentSort) => {
    setLoading(true);
    setError(false);
    catalogService
      .searchProfessionals({ ...currentFilters, sort: currentSort })
      .then((items) => {
        setResults(items);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    search(filters, sort);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = DEFAULT_FILTERS[key];
      if (value && value !== defaultValue) params.set(key === 'profession' ? 'tipo' : key === 'specialty' ? 'especialidad' : key === 'modality' ? 'modalidad' : key === 'availability' ? 'disponibilidad' : key === 'location' ? 'zona' : key === 'maxPrice' ? 'precioMax' : key === 'minRating' ? 'rating' : key, value);
    });
    const queryString = params.toString();
    navigate(`/cliente/profesionales${queryString ? `?${queryString}` : ''}`, { replace: true });
  }, [filters, sort, search, navigate]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const externalKey = ['q', 'tipo', 'especialidad', 'modalidad', 'disponibilidad', 'zona', 'precioMax', 'rating']
    .map((key) => query.get(key) || '')
    .join('|');

  useEffect(() => {
    const incoming = filtersFromQuery(query);
    const currentSignature = Object.values(filters).join('|');
    const incomingSignature = Object.values(incoming).join('|');
    if (currentSignature !== incomingSignature) {
      setFilters(incoming);
    }
  }, [externalKey, query]);

  const activeCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => value && value !== DEFAULT_FILTERS[key]).length,
    [filters],
  );

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Encontrá el profesional que necesitás</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Médicos y enfermeros verificados por EnfermerosYa.</p>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="Buscar por nombre o especialidad…"
            aria-label="Buscar profesional"
            className="form-input pl-10"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="btn-secondary shrink-0 px-3 lg:hidden"
          aria-label={`Abrir filtros${activeCount ? ` (${activeCount} activos)` : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1 text-[10px] font-extrabold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel filters={filters} onChange={updateFilter} onClear={() => setFilters(DEFAULT_FILTERS)} />
        </aside>

        <section aria-live="polite" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">
              {loading ? 'Buscando…' : `${results.length} ${results.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}`}
            </p>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
              Ordenar por
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="form-input w-auto py-2 text-xs">
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <PageLoader />
          ) : error ? (
            <ErrorState onRetry={() => search(filters, sort)} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No encontramos profesionales con esos filtros"
              description="Probá ampliando la búsqueda: cambiá la especialidad, la zona o el precio máximo."
              action={<button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-secondary">Limpiar filtros</button>}
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {results.map((professional) => (
                <li key={professional.id}>
                  <ProfessionalCard professional={professional} compactActions />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros" position="right">
        <FilterPanel filters={filters} onChange={updateFilter} onClear={() => setFilters(DEFAULT_FILTERS)} />
        <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary mt-5 w-full">
          Ver {results.length} resultados
        </button>
      </Modal>
    </div>
  );
}

function FilterPanel({ filters, onChange, onClear }) {
  return (
    <div className="card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400">Filtros</h3>
        <button type="button" onClick={onClear} className="text-xs font-bold text-action transition-colors hover:text-action-dark">
          Limpiar todo
        </button>
      </div>

      <fieldset>
        <legend className="form-label">Tipo de profesional</legend>
        <div className="space-y-1.5">
          {[['todos', 'Todos'], ['medico', 'Médico/a'], ['enfermero', 'Enfermero/a']].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="radio"
                name="profession"
                checked={filters.profession === value}
                onChange={() => onChange('profession', value)}
                className="h-4 w-4 accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="filter-specialty" className="form-label">Especialidad</label>
        <select id="filter-specialty" value={filters.specialty} onChange={(event) => onChange('specialty', event.target.value)} className="form-input py-2 text-sm">
          <option value="todas">Todas</option>
          {SPECIALTIES.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="form-label">Modalidad</legend>
        <div className="flex flex-wrap gap-1.5">
          {[['todas', 'Todas'], ['presencial', 'Presencial'], ['domicilio', 'A domicilio'], ['online', 'E-consulta']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('modality', value)}
              aria-pressed={filters.modality === value}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                filters.modality === value ? 'bg-action text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="form-label">Disponibilidad</legend>
        <div className="space-y-1.5">
          {[['todas', 'Cualquier momento'], ['now', 'Disponible ahora'], ['today', 'Disponible hoy'], ['week', 'Esta semana']].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="radio"
                name="availability"
                checked={filters.availability === value}
                onChange={() => onChange('availability', value)}
                className="h-4 w-4 accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="filter-location" className="form-label">Ubicación</label>
        <input
          id="filter-location"
          type="text"
          value={filters.location}
          onChange={(event) => onChange('location', event.target.value)}
          placeholder="Ciudad o zona (ej: Palermo)"
          className="form-input py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="filter-price" className="form-label">Precio máximo</label>
        <select id="filter-price" value={filters.maxPrice} onChange={(event) => onChange('maxPrice', event.target.value)} className="form-input py-2 text-sm">
          <option value="">Sin límite</option>
          <option value="10000">{formatCurrency(10000)}</option>
          <option value="15000">{formatCurrency(15000)}</option>
          <option value="20000">{formatCurrency(20000)}</option>
          <option value="25000">{formatCurrency(25000)}</option>
        </select>
      </div>

      <fieldset>
        <legend className="form-label">Calificación</legend>
        <div className="space-y-1.5">
          {[['', 'Todas las calificaciones'], ['4', '★ 4,0 o más'], ['4.5', '★ 4,5 o más']].map(([value, label]) => (
            <label key={label} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === value}
                onChange={() => onChange('minRating', value)}
                className="h-4 w-4 accent-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
