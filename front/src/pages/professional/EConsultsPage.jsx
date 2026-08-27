import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, DollarSign, MessageSquareText, Save, Timer, Zap } from 'lucide-react';
import DayRangesEditor from '../../components/professional/DayRangesEditor';
import Badge from '../../components/ui/Badge';
import Switch from '../../components/ui/Switch';
import { PageLoader, ErrorState } from '../../components/ui/Feedback';
import { Input, Select } from '../../components/ui/Form';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import { useProfessional } from '../../context/ProfessionalContext';
import { availabilityService, appointmentsService, patientsService } from '../../services/mockApi';
import { formatCurrency, formatDate, formatTime } from '../../lib/format';
import { Link } from '../../router/Router';
import { cn } from '../../lib/utils';
import { INITIAL_CONVERSATIONS } from '../../data/messages';

const STATUS_OPTIONS = [
  { id: 'online', label: 'Activo', dotClass: 'bg-emerald-500' },
  { id: 'offline', label: 'Fuera de línea', dotClass: 'bg-slate-300 ring-1 ring-slate-400' },
  { id: 'busy', label: 'Ocupado', dotClass: 'bg-amber-500' },
];

export default function EConsultsPage() {
  const toast = useToast();
  const { acceptsEConsults, toggleEConsults, availabilityStatus, updateStatus } = useProfessional();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [config, setConfig] = useState({ durationMinutes: 20, price: 6000 });
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([availabilityService.get(), appointmentsService.list(), patientsService.list()])
      .then(([availabilityData, appointmentList, patientList]) => {
        setAvailability(availabilityData);
        setRequests(appointmentList.filter((appointment) => appointment.type === 'e-consulta' && ['pendiente'].includes(appointment.status)));
        setPatientsMap(Object.fromEntries(patientList.map((patient) => [patient.id, patient])));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading || !availability) return loading ? <PageLoader /> : <ErrorState onRetry={load} />;
  if (error) return <ErrorState onRetry={load} />;

  const handleToggle = (enabled) => {
    toggleEConsults(enabled);
    toast.success(enabled ? 'Ya estás disponible para e-consultas' : 'Desactivaste las e-consultas');
  };

  const handleSave = async () => {
    setSaving(true);
    await availabilityService.save(availability);
    setSaving(false);
    toast.success('Disponibilidad de e-consultas guardada');
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800">E-consultas</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">
          Atendé consultas por chat, definí tus franjas exclusivas y generá ingresos extra sin salir de casa.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-700 to-action/80 p-6 shadow-card sm:p-8" aria-label="Estado de e-consultas">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold',
              acceptsEConsults ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-slate-300',
            )}>
              {acceptsEConsults ? (
                <>
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400" />
                  Disponible para pacientes
                </>
              ) : (
                <>
                  <span aria-hidden="true" className="h-2 w-2 rounded-full ring-1 ring-slate-300" />
                  Fuera de línea
                </>
              )}
            </span>
            <h3 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">Disponible para e-consultas</h3>
            <p className="mt-1.5 max-w-lg text-sm font-medium leading-relaxed text-blue-100">
              {acceptsEConsults
                ? 'Tu perfil aparece con el badge de e-consulta activa y los pacientes pueden enviarte consultas por chat en tus horarios configurados.'
                : 'Al activarlo vas a aparecer como disponible para los pacientes dentro de tus franjas horarias de e-consulta.'}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <Switch checked={acceptsEConsults} onChange={handleToggle} label="" />
            <fieldset>
              <legend className="mb-2 text-[10px] font-bold uppercase tracking-widest text-blue-100">Mi estado ahora</legend>
              <div role="radiogroup" aria-label="Estado actual" className="flex gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={availabilityStatus === option.id}
                    onClick={() => updateStatus(option.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
                      availabilityStatus === option.id ? 'border-white/40 bg-white/15 text-white' : 'border-white/10 bg-transparent text-slate-300 hover:bg-white/10',
                    )}
                  >
                    <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', option.dotClass)} />
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card p-5 sm:p-6 xl:col-span-3" aria-label="Horarios exclusivos para e-consultas">
          <h3 className="text-base font-extrabold text-navy-800">Horarios exclusivos para e-consultas</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
            Estas franjas son solo para atención por chat y no interfieren con tu agenda presencial.
          </p>
          <div className="mt-4 opacity-100">
            <DayRangesEditor
              weekly={availability.eConsultWeekly}
              onChange={(eConsultWeekly) => setAvailability({ ...availability, eConsultWeekly })}
              addLabel="Agregar franja"
            />
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <label className="block">
              <span className="form-label">Duración por consulta</span>
              <Select value={config.durationMinutes} onChange={(event) => setConfig({ ...config, durationMinutes: Number(event.target.value) })}>
                <option value={15}>15 minutos</option>
                <option value={20}>20 minutos</option>
                <option value={30}>30 minutos</option>
              </Select>
            </label>
            <label className="block">
              <span className="form-label">Precio por consulta</span>
              <Input
                type="number"
                min="0"
                step="500"
                value={config.price}
                onChange={(event) => setConfig({ ...config, price: Number(event.target.value) })}
                aria-describedby="ec-price-help"
              />
              <span id="ec-price-help" className="mt-1 block text-[11px] font-semibold text-emerald-600">
                Recibís {formatCurrency(Math.round(config.price * 0.9))} tras la comisión de la plataforma
              </span>
            </label>
          </div>

          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary mt-6 w-full sm:w-auto">
            <Save className="h-4 w-4" />
            {saving ? 'Guardando…' : 'Guardar disponibilidad'}
          </button>
        </section>

        <div className="space-y-6 xl:col-span-2">
          <section className="card p-5 sm:p-6" aria-label="Solicitudes pendientes">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
              <Zap className="h-[18px] w-[18px] text-violet-500" /> Solicitudes pendientes
            </h3>
            {requests.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm font-medium text-slate-400">
                No tenés solicitudes pendientes.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {requests.map((request) => {
                  const patient = patientsMap[request.patientId];
                  return (
                    <li key={request.id} className="rounded-xl border border-slate-200 p-3.5 transition-shadow hover:shadow-card">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : '?'} size="sm" onlineStatus="online" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-navy-800">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}
                          </p>
                          <p className="truncate text-xs font-medium capitalize text-slate-400">
                            {formatDate(request.startsAt)} · {formatTime(request.startsAt)}
                          </p>
                        </div>
                        <Badge variant="warning">Pendiente</Badge>
                      </div>
                      <p className="mt-2.5 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium leading-relaxed text-slate-600">
                        {request.reason}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link to={`/profesional/mensajes?c=${findConversationId(request.patientId)}`} className="btn-primary px-3 py-2 text-xs">
                          Abrir chat
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setRequests((current) => current.filter((item) => item.id !== request.id));
                            toast.success('Solicitud aceptada. Se agregó a tu agenda.');
                          }}
                          className="btn-secondary px-3 py-2 text-xs"
                        >
                          Aceptar turno
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="card p-5 sm:p-6" aria-label="Resumen de e-consultas">
            <h3 className="text-base font-extrabold text-navy-800">Cómo funciona</h3>
            <ul className="mt-3 space-y-3 text-sm font-medium text-slate-600">
              {[
                { icon: CheckCircle2, text: `El paciente paga por adelantado y vos recibís ${formatCurrency(Math.round(config.price * 0.9))} por cada consulta.` },
                { icon: Clock, text: `Cada consulta tiene una duración estimada de ${config.durationMinutes} minutos.` },
                { icon: MessageSquareText, text: 'Respondés desde la sección Mensajes con chat, adjuntos e indicaciones.' },
                { icon: Timer, text: 'Si no respondés dentro del horario prometido, el paciente recibe un reembolso automático.' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-action" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 px-3.5 py-3">
              <DollarSign className="h-4 w-4 shrink-0 text-violet-600" />
              <p className="text-xs font-bold text-violet-700">
                Precio actual: {formatCurrency(config.price)} · {config.durationMinutes} min
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function findConversationId(patientId) {
  return INITIAL_CONVERSATIONS.find((conversation) => conversation.patientId === patientId)?.id;
}
