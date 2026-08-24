import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search, UserRoundX } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Form';
import { PATIENT_STATUS } from '../../lib/status';
import { formatDate, isSameDay } from '../../lib/format';
import { Link } from '../../router/Router';
import { patientsService } from '../../services/mockApi';
import { cn } from '../../lib/utils';

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'inactivos', label: 'Inactivos' },
  { id: 'proximos', label: 'Con consulta próxima' },
];

const SORT_OPTIONS = [
  { value: 'nombre', label: 'Ordenar por nombre' },
  { value: 'ultima', label: 'Última consulta' },
  { value: 'proxima', label: 'Próxima consulta' },
];

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [sort, setSort] = useState('nombre');

  const load = () => {
    setLoading(true);
    setError(false);
    patientsService
      .list()
      .then(setPatients)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      if (query && !fullName.includes(query)) return false;
      if (filter === 'activos') return patient.status === 'activo';
      if (filter === 'inactivos') return patient.status === 'inactivo';
      if (filter === 'proximos') return Boolean(patient.nextVisitAt) && new Date(patient.nextVisitAt) >= new Date();
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'nombre') return `${a.lastName}`.localeCompare(`${b.lastName}`);
      if (sort === 'ultima') return new Date(b.lastVisitAt || 0) - new Date(a.lastVisitAt || 0);
      return new Date(a.nextVisitAt || Infinity) - new Date(b.nextVisitAt || Infinity);
    });

    return result;
  }, [patients, search, filter, sort]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-navy-800">Mis pacientes</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">{filtered.length} de {patients.length} pacientes</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar paciente…"
            aria-label="Buscar paciente"
            className="form-input pl-10"
          />
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtrar pacientes" className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
                filter === option.id ? 'bg-navy-800 text-white shadow-sm' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:text-navy-800',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar pacientes" className="w-full sm:w-56">
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserRoundX}
          title="No encontramos pacientes"
          description="Probá con otro nombre o cambiá los filtros para ver más resultados."
        />
      ) : (
        <>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full">
              <caption className="sr-only">Listado de pacientes</caption>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th scope="col" className="table-th">Paciente</th>
                  <th scope="col" className="table-th">Edad</th>
                  <th scope="col" className="table-th">Última consulta</th>
                  <th scope="col" className="table-th">Próxima consulta</th>
                  <th scope="col" className="table-th">Estado</th>
                  <th scope="col" className="table-th text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((patient) => (
                  <PatientRow key={patient.id} patient={patient} />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((patient) => (
              <li key={patient.id}>
                <Link to={`/profesional/pacientes/${patient.id}`} className="card flex items-center gap-3.5 p-4 transition-shadow hover:shadow-lg">
                  <Avatar name={`${patient.firstName} ${patient.lastName}`} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-800">{patient.firstName} {patient.lastName}</p>
                    <p className="text-xs font-medium text-slate-500">{patient.age} años</p>
                    <p className="mt-1 text-xs font-medium capitalize text-slate-400">
                      Última: {patient.lastVisitAt ? formatDate(patient.lastVisitAt) : '—'}
                    </p>
                  </div>
                  <Badge variant={PATIENT_STATUS[patient.status].badge}>{PATIENT_STATUS[patient.status].label}</Badge>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PatientRow({ patient }) {
  const hasUpcoming = Boolean(patient.nextVisitAt) && new Date(patient.nextVisitAt) >= new Date();

  return (
    <tr className="transition-colors hover:bg-blue-50/40">
      <td className="table-td">
        <Link to={`/profesional/pacientes/${patient.id}`} className="flex items-center gap-3 group">
          <Avatar name={`${patient.firstName} ${patient.lastName}`} size="sm" />
          <span>
            <span className="block font-bold text-navy-800 group-hover:text-action">
              {patient.firstName} {patient.lastName}
            </span>
            <span className="block text-xs font-medium text-slate-400">{patient.healthInsurance}</span>
          </span>
        </Link>
      </td>
      <td className="table-td">{patient.age}</td>
      <td className="table-td capitalize">{patient.lastVisitAt ? formatDate(patient.lastVisitAt) : '—'}</td>
      <td className="table-td capitalize">
        {hasUpcoming ? (
          <span className="font-semibold text-action">{formatDate(patient.nextVisitAt)}{isSameDay(patient.nextVisitAt, new Date()) ? ' · hoy' : ''}</span>
        ) : (
          '—'
        )}
      </td>
      <td className="table-td">
        <Badge variant={PATIENT_STATUS[patient.status].badge}>{PATIENT_STATUS[patient.status].label}</Badge>
      </td>
      <td className="table-td text-right">
        <Link to={`/profesional/pacientes/${patient.id}`} className="btn-secondary px-3.5 py-2 text-xs">
          Ver paciente
        </Link>
      </td>
    </tr>
  );
}
