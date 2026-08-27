import { useEffect, useMemo, useState } from 'react';
import { Download, FileClock, FileText, Search } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { bookingsService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import useProfessionalLookup from './useProfessionalLookup';
import { formatCurrency, formatDate } from '../../lib/format';
import { DOCUMENT_KINDS, MODALITIES } from '../../lib/status';

const TABS = [
  { id: 'todas', label: 'Todas' },
  { id: 'notas', label: 'Con notas' },
  { id: 'documentos', label: 'Con documentos' },
];

export default function HistoryPage() {
  const toast = useToast();
  const professionals = useProfessionalLookup();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('todas');
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('todos');
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    bookingsService
      .list()
      .then((items) => {
        setBookings(items.filter((booking) => booking.status === 'finalizada'));
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings
      .filter((booking) => {
        if (tab === 'notas' && !booking.sharedNotes) return false;
        if (tab === 'documentos' && !(booking.documents || []).length) return false;
        if (kindFilter !== 'todos' && !(booking.documents || []).some((document) => document.kind === kindFilter)) return false;
        if (term) {
          const professional = professionals[booking.professionalId];
          const haystack = `${professional ? `${professional.firstName} ${professional.lastName}` : ''} ${booking.serviceName} ${booking.reason}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  }, [bookings, tab, kindFilter, search, professionals]);

  const downloadDocument = (document, booking) => {
    const lines = [
      'EnfermerosYa — Documento de consulta',
      '------------------------------------',
      `Tipo: ${DOCUMENT_KINDS[document.kind]?.label || document.kind}`,
      `Archivo: ${document.fileName}`,
      `Consulta: ${booking.serviceName} (${formatDate(booking.startsAt)})`,
      `Paciente: María López`,
      '------------------------------------',
      'Documento simulado con fines de demostración.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = document.fileName.replace(/\.pdf$/, '.txt');
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Documento descargado.');
  };

  if (loading && !error) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Historial de consultas</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Notas clínicas y documentos de tus consultas finalizadas.</p>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por profesional, servicio o motivo…"
            aria-label="Buscar en el historial"
            className="form-input pl-10"
          />
        </div>
        <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value)} aria-label="Filtrar por tipo de documento" className="form-input w-full py-2.5 text-xs sm:w-auto">
          <option value="todos">Todo tipo de documento</option>
          {Object.entries(DOCUMENT_KINDS).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title="Sin resultados en el historial"
          description="Cuando finalices consultas van a aparecer acá con sus notas y documentos."
          action={<Link to="/cliente/profesionales" className="btn-primary">Buscar profesional</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((booking) => {
            const professional = professionals[booking.professionalId];
            const fullName = professional ? `${professional.firstName} ${professional.lastName}` : 'Profesional';
            const documents = booking.documents || [];
            const expanded = expandedId === booking.id;
            return (
              <li key={booking.id}>
                <article className="card p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <Avatar name={fullName} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-extrabold text-navy-800">{fullName}</h3>
                      <p className="truncate text-xs font-semibold text-slate-500">{booking.serviceName}</p>
                      <p className="mt-1 text-sm font-bold capitalize text-action">{formatDate(booking.startsAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge variant={MODALITIES[booking.modality]?.badge}>{MODALITIES[booking.modality]?.label}</Badge>
                      <span className="text-xs font-bold text-slate-400">{formatCurrency(booking.price)}</span>
                    </div>
                  </div>

                  <p className="mt-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-slate-600">
                    <span className="font-bold text-navy-800">Motivo: </span>{booking.reason}
                  </p>

                  {(booking.sharedNotes || documents.length > 0) && (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : booking.id)}
                        aria-expanded={expanded}
                        className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-navy-800 transition-colors hover:border-action hover:text-action"
                      >
                        Ver notas y documentos
                        <span aria-hidden="true" className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}>▾</span>
                      </button>
                      {expanded && (
                        <div className="animate-fade-up mt-3 space-y-3 rounded-xl bg-blue-50/60 p-4">
                          {booking.sharedNotes && (
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-action">Notas del profesional</p>
                              <p className="mt-1.5 text-sm font-medium leading-relaxed text-navy-800">{booking.sharedNotes}</p>
                            </div>
                          )}
                          {documents.length > 0 && (
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-action">Documentos</p>
                              <ul className="mt-1.5 space-y-2">
                                {documents.map((document) => (
                                  <li key={document.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 shadow-sm">
                                    <span className="flex min-w-0 items-center gap-2.5">
                                      <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                                      <span className="min-w-0">
                                        <span className="block truncate text-xs font-bold text-navy-800">{document.fileName}</span>
                                        <Badge variant={DOCUMENT_KINDS[document.kind]?.badge}>{DOCUMENT_KINDS[document.kind]?.label}</Badge>
                                      </span>
                                    </span>
                                    <button type="button" onClick={() => downloadDocument(document, booking)} className="toolbar-btn shrink-0" aria-label={`Descargar ${document.fileName}`}>
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                    <Link to={`/cliente/reservas/${booking.id}`} className="btn-secondary justify-center py-2 text-xs">Ver consulta</Link>
                    <Link to={`/cliente/profesionales/${booking.professionalId}`} className="btn-secondary justify-center py-2 text-xs">Ver perfil</Link>
                    <Link to={`/cliente/reservar?profesional=${booking.professionalId}&servicio=${booking.serviceId}`} className="btn-primary col-span-2 justify-center py-2 text-xs sm:col-span-1">Repetir consulta</Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
