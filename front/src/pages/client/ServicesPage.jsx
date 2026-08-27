import { useEffect, useState } from 'react';
import { ArrowRight, Clock, MapPin, MonitorSmartphone, Search, Stethoscope } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { catalogService } from '../../services/clientApi';
import { formatCurrency } from '../../lib/format';
import { MODALITIES } from '../../lib/status';

const SERVICE_ICONS = {
  'cat-consulta-medica': Stethoscope,
  'cat-consulta-enfermeria': Stethoscope,
  'cat-cuidados-domiciliarios': MapPin,
  'cat-signos-vitales': MonitorSmartphone,
  'cat-curaciones': Clock,
  'cat-medicacion': Clock,
  'cat-seguimiento': Clock,
  'cat-econsulta': MonitorSmartphone,
  'cat-atencion-domicilio': MapPin,
};

const MODALITY_LABELS = Object.fromEntries(Object.entries(MODALITIES).map(([key, value]) => [key, value.label]));

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [services, setServices] = useState([]);

  const load = () => {
    setLoading(true);
    setError(false);
    catalogService
      .listServices()
      .then((items) => {
        setServices(items);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Servicios de salud</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Atenciones que podés reservar con profesionales verificados.</p>
      </header>

      {services.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No hay servicios publicados por ahora" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.id] || Stethoscope;
            return (
              <li key={service.id}>
                <article className="card flex h-full flex-col p-5 transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-action">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-right text-sm font-extrabold text-navy-800">
                      Desde {formatCurrency(service.priceFrom)}
                    </p>
                  </div>
                  <h3 className="mt-3 text-base font-extrabold text-navy-800">{service.name}</h3>
                  <p className="mt-1 flex-1 text-xs font-medium leading-relaxed text-slate-500">{service.description}</p>
                  <dl className="mt-3 space-y-1.5 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                      <dt className="sr-only">Duración</dt>
                      <dd>≈ {service.durationMinutes} minutos</dd>
                    </div>
                  </dl>
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Modalidades de ${service.name}`}>
                    {service.modalities.map((modality) => (
                      <li key={modality}>
                        <Badge variant={MODALITIES[modality]?.badge || 'neutral'}>{MODALITY_LABELS[modality]}</Badge>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <Search className="h-3 w-3" /> {service.professionalsCount} disponibles
                    </span>
                    <Link
                      to={`/cliente/profesionales?especialidad=${service.specialtyId}&modalidad=${service.modalities[0]}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-action transition-colors hover:text-action-dark"
                    >
                      Buscar profesionales
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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
