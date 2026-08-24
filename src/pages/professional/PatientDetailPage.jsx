import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, CalendarPlus, Download, FileText, FlaskConical, HeartPulse,
  Mail, MapPin, MessageSquare, Phone, Pill, ShieldAlert, Upload, UserRound,
} from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Form';
import { AppointmentStatusBadge, DocumentKindBadge, ModalityBadge } from '../../components/professional/StatusBadges';
import AppointmentDetail from '../../components/professional/AppointmentDetail';
import { appointmentsService, documentsService, patientsService } from '../../services/mockApi';
import { APPOINTMENT_TYPES } from '../../lib/status';
import { formatCurrency, formatDate, formatTime } from '../../lib/format';
import { Link } from '../../router/Router';
import { useToast } from '../../context/ToastContext';
import { INITIAL_CONVERSATIONS } from '../../data/messages';

const TABS = [
  { id: 'info', label: 'Información personal', icon: UserRound },
  { id: 'historial', label: 'Historial', icon: HeartPulse },
  { id: 'documentos', label: 'Documentación', icon: FileText },
];

const KIND_ICONS = { estudio: FlaskConical, receta: Pill, informe: FileText, indicacion: ShieldAlert };
const KIND_OPTIONS = [
  { value: 'estudio', label: 'Estudio' },
  { value: 'receta', label: 'Receta' },
  { value: 'informe', label: 'Informe' },
  { value: 'indicacion', label: 'Indicación' },
];

export default function PatientDetailPage({ patientId }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tab, setTab] = useState('info');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([patientsService.get(patientId), appointmentsService.list(), documentsService.listByPatient(patientId)])
      .then(([patientData, appointmentList, documentList]) => {
        setPatient(patientData);
        setAppointments(appointmentList.filter((appointment) => appointment.patientId === patientId));
        setDocuments(documentList);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [patientId]);

  const history = useMemo(
    () =>
      appointments
        .filter((appointment) => ['finalizada', 'cancelada'].includes(appointment.status))
        .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)),
    [appointments],
  );

  if (loading) return <PageLoader />;
  if (error || !patient) return <ErrorState description="No pudimos cargar los datos de este paciente." onRetry={load} />;

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const conversationId = INITIAL_CONVERSATIONS.find((conversation) => conversation.patientId === patient.id)?.id;
  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedAppointmentId);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    await documentsService.upload({ patientId, kind: 'estudio', title: file.name });
    event.target.value = '';
    load();
    toast.success('Documento subido. Quedó en revisión.');
  };

  const handleDeleteDoc = async () => {
    await documentsService.remove(deleteDocId);
    setDocuments((current) => current.filter((document) => document.id !== deleteDocId));
    toast.success('Documento eliminado');
  };

  return (
    <div className="animate-fade-up space-y-6">
      <Link to="/profesional/pacientes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-action">
        <ArrowLeft className="h-4 w-4" /> Mis pacientes
      </Link>

      <header className="card flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <Avatar name={fullName} size="xl" />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">{fullName}</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              {patient.age} años · DNI {patient.dni} · {patient.healthInsurance}
            </p>
            <div className="mt-2">
              <Badge variant={patient.status === 'activo' ? 'success' : 'neutral'} dot>
                {patient.status === 'activo' ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto">
          <Link
            to={conversationId ? `/profesional/mensajes?c=${conversationId}` : '/profesional/mensajes'}
            className="btn-secondary order-2 sm:order-1"
          >
            <MessageSquare className="h-4 w-4" />
            Enviar mensaje
          </Link>
          <button type="button" onClick={() => setNewAppointmentOpen(true)} className="btn-primary order-1 sm:order-2">
            <CalendarPlus className="h-4 w-4" />
            Nueva consulta
          </button>
        </div>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'info' && (
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-base font-extrabold text-navy-800">Datos personales</h3>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <InfoItem label="Nombre" value={patient.firstName} />
              <InfoItem label="Apellido" value={patient.lastName} />
              <InfoItem label="Fecha de nacimiento" value={`${formatDate(patient.birthDate)} (${patient.age} años)`} />
              <InfoItem label="DNI" value={patient.dni} />
              <InfoItem label="Teléfono" value={patient.phone} icon={Phone} />
              <InfoItem label="Email" value={patient.email} icon={Mail} />
              <InfoItem label="Dirección" value={patient.address} icon={MapPin} className="sm:col-span-2" />
              <InfoItem label="Contacto de emergencia" value={`${patient.emergencyContact.name} · ${patient.emergencyContact.phone}`} icon={Phone} />
              <InfoItem label="Cobertura médica" value={patient.healthInsurance} />
            </dl>
          </div>

          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="text-base font-extrabold text-navy-800">Notas del profesional</h3>
              <p className="mt-3 rounded-xl bg-amber-50/70 p-3.5 text-sm font-medium leading-relaxed text-navy-800">
                {patient.notes || 'Sin notas registradas para este paciente.'}
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-base font-extrabold text-navy-800">Resumen</h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <SummaryRow label="Consultas registradas" value={appointments.length} />
                <SummaryRow label="Documentos" value={documents.length} />
                <SummaryRow label="Última consulta" value={patient.lastVisitAt ? formatDate(patient.lastVisitAt) : '—'} capitalize />
                <SummaryRow label="Próxima consulta" value={patient.nextVisitAt ? formatDate(patient.nextVisitAt) : '—'} capitalize />
              </dl>
            </div>
          </aside>
        </section>
      )}

      {tab === 'historial' && (
        <section aria-label="Historial de consultas">
          {history.length === 0 ? (
            <EmptyState icon={HeartPulse} title="Historial vacío" description="Las consultas finalizadas y canceladas van a aparecer acá." />
          ) : (
            <ol className="relative space-y-0 before:absolute before:left-[11px] before:h-full before:w-px before:bg-slate-200">
              {history.map((appointment) => (
                <li key={appointment.id} className="relative pb-6 pl-10 last:pb-0">
                  <span
                    className={`absolute left-0 top-1 h-[23px] w-[23px] rounded-full border-4 border-white ${
                      appointment.status === 'cancelada' ? 'bg-red-400' : 'bg-action'
                    }`}
                    aria-hidden="true"
                  />
                  <article className="card p-5">
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold capitalize text-navy-800">
                          {formatDate(appointment.startsAt)} · {formatTime(appointment.startsAt)}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">Dra. María González · Médica Clínica</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="blue">{APPOINTMENT_TYPES[appointment.type]?.label}</Badge>
                        <ModalityBadge modality={appointment.modality} />
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                    </header>

                    <div className="mt-4 space-y-3 text-sm">
                      <HistoryRow label="Motivo" value={appointment.reason} />
                      {appointment.notes && <HistoryRow label="Observaciones" value={appointment.notes} />}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Consulta registrada
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                          {formatCurrency(appointment.price)}
                        </span>
                      </div>
                    </div>

                    <footer className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <FileText className="h-3.5 w-3.5" />
                        {documents.length > 0 ? `${documents.length} archivo(s) vinculados` : 'Sin archivos adjuntos'}
                      </span>
                      <button type="button" onClick={() => setSelectedAppointmentId(appointment.id)} className="btn-secondary px-3.5 py-2 text-xs">
                        Ver detalle
                      </button>
                    </footer>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {tab === 'documentos' && (
        <section aria-label="Documentación del paciente">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} aria-hidden="true" tabIndex={-1} />
          <div className="mb-4 flex justify-end">
            <button type="button" onClick={handleUploadClick} className="btn-primary px-4 py-2.5 text-sm">
              <Upload className="h-4 w-4" />
              Subir documento
            </button>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Todavía no hay documentos"
              description="Subí estudios, recetas, informes o indicaciones para mantenerlos asociados a la historia clínica."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {documents.map((document) => {
                const KindIcon = KIND_ICONS[document.kind] || FileText;
                return (
                  <li key={document.id} className="card group relative p-5 transition-shadow hover:shadow-lg">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-action">
                        <KindIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-800" title={document.title}>{document.title}</p>
                        <p className="mt-0.5 text-xs font-medium capitalize text-slate-400">
                          {formatDate(document.uploadedAt)} · {document.size}
                        </p>
                        <div className="mt-2">
                          <DocumentKindBadge kind={document.kind} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => toast.info(`Descarga simulada: ${document.title}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-action hover:text-action-dark"
                      >
                        <Download className="h-3.5 w-3.5" /> Descargar
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDocId(document.id)}
                        className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label={`Eliminar ${document.title}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <AppointmentDetail
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointmentId(null)}
        onCancelled={() => load()}
      />

      <NewAppointmentModal
        open={newAppointmentOpen}
        onClose={() => setNewAppointmentOpen(false)}
        patient={patient}
        onCreated={() => {
          load();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteDocId)}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteDoc}
        title="Eliminar documento"
        message="¿Querés eliminar este documento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
      />
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, className }) {
  return (
    <div className={className}>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy-800">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-action" />}
        <span className="min-w-0 break-words">{value}</span>
      </dd>
    </div>
  );
}

function SummaryRow({ label, value, capitalize }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className={capitalize ? 'font-bold capitalize text-navy-800' : 'font-bold text-navy-800'}>{value}</dd>
    </div>
  );
}

function HistoryRow({ label, value }) {
  return (
    <p>
      <span className="font-bold text-navy-800">{label}: </span>
      <span className="font-medium leading-relaxed text-slate-600">{value}</span>
    </p>
  );
}

function NewAppointmentModal({ open, onClose, patient, onCreated }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    const date = formData.get('date');
    const time = formData.get('time');
    await appointmentsService.create({
      patientId: patient.id,
      startsAt: new Date(`${date}T${time}:00`).toISOString(),
      durationMinutes: Number(formData.get('duration')),
      type: formData.get('type'),
      modality: formData.get('modality'),
      status: 'pendiente',
      reason: formData.get('reason'),
      notes: '',
      price: 12000,
    });
    setSaving(false);
    onClose();
    onCreated();
    toast.success('Consulta creada. Quedó pendiente de confirmación.');
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva consulta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="rounded-xl bg-blue-50/60 p-3 text-sm font-semibold text-navy-800">
          Paciente: {patient.firstName} {patient.lastName}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="form-label">Fecha</span>
            <input name="date" type="date" required defaultValue={tomorrow} min={new Date().toISOString().slice(0, 10)} className="form-input" />
          </label>
          <label className="block">
            <span className="form-label">Hora</span>
            <input name="time" type="time" required defaultValue="10:00" className="form-input" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="form-label">Tipo</span>
            <Select name="type" defaultValue="consulta">
              <option value="consulta">Consulta</option>
              <option value="control">Control</option>
              <option value="curacion">Curación</option>
              <option value="inyectables">Inyectables</option>
            </Select>
          </label>
          <label className="block">
            <span className="form-label">Duración</span>
            <Select name="duration" defaultValue="30">
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </Select>
          </label>
        </div>
        <label className="block">
          <span className="form-label">Modalidad</span>
          <Select name="modality" defaultValue="presencial">
            <option value="presencial">Presencial</option>
            <option value="domicilio">A domicilio</option>
            <option value="online">Online (e-consulta)</option>
          </Select>
        </label>
        <label className="block">
          <span className="form-label">Motivo</span>
          <textarea name="reason" rows={3} required placeholder="Contá brevemente el motivo de la consulta…" className="form-input resize-none" />
        </label>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Creando…' : 'Crear consulta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
