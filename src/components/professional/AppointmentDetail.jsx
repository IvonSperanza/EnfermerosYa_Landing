import { useEffect, useState } from 'react';
import { CalendarDays, Clock, FileText, MapPin, MessageSquare, StickyNote, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { useToast } from '../../context/ToastContext';
import { appointmentsService, patientsService } from '../../services/mockApi';
import { APPOINTMENT_TYPES } from '../../lib/status';
import { formatFullDate, formatTime } from '../../lib/format';
import { Link } from '../../router/Router';
import ConfirmDialog from '../ui/ConfirmDialog';
import { AppointmentStatusBadge, ModalityBadge } from './StatusBadges';
import { INITIAL_CONVERSATIONS } from '../../data/messages';

export default function AppointmentDetail({ appointment, onClose, onCancelled }) {
  const toast = useToast();
  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!appointment) return undefined;
    let active = true;
    setNotes(appointment.notes || '');
    patientsService
      .get(appointment.patientId)
      .then((data) => active && setPatient(data))
      .catch(() => active && setPatient(null));
    return () => {
      active = false;
    };
  }, [appointment]);

  if (!appointment) return null;

  const typeConfig = APPOINTMENT_TYPES[appointment.type];
  const duration = appointment.durationMinutes;
  const isCancellable = ['pendiente', 'confirmada'].includes(appointment.status);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await appointmentsService.saveNotes(appointment.id, notes);
    setSavingNotes(false);
    toast.success('Notas guardadas correctamente');
  };

  const handleCancel = async () => {
    await appointmentsService.cancel(appointment.id);
    toast.success('La consulta fue cancelada');
    onCancelled?.(appointment.id);
  };

  return (
    <>
      <Modal open={Boolean(appointment)} onClose={onClose} title="Detalle de la consulta" position="right">
        <div className="flex items-center justify-between gap-3">
          <AppointmentStatusBadge status={appointment.status} />
          <ModalityBadge modality={appointment.modality} />
        </div>

        <section className="card mt-4 flex items-center gap-3.5 p-4">
          <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : '…'} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-navy-800">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Cargando paciente…'}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {patient ? `${patient.age} años · ${patient.healthInsurance}` : '\u00A0'}
            </p>
          </div>
          {patient && (
            <Link
              to={`/profesional/pacientes/${patient.id}`}
              onClick={onClose}
              className="btn-secondary shrink-0 px-3 py-2 text-xs"
            >
              Ver paciente
            </Link>
          )}
        </section>

        <dl className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-action" />
            <dt className="sr-only">Fecha</dt>
            <dd className="font-semibold capitalize text-navy-800">{formatFullDate(appointment.startsAt)}</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 shrink-0 text-action" />
            <dt className="sr-only">Hora</dt>
            <dd className="font-medium text-slate-600">
              {formatTime(appointment.startsAt)} · {duration} min
            </dd>
          </div>
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 shrink-0 text-action" />
            <dt className="sr-only">Tipo</dt>
            <dd className="font-medium text-slate-600">{typeConfig?.label || appointment.type}</dd>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-action" />
            <dt className="sr-only">Lugar</dt>
            <dd className="font-medium text-slate-600">
              {appointment.modality === 'online' && 'E-consulta por chat'}
              {appointment.modality === 'domicilio' && (patient?.address || 'Domicilio del paciente')}
              {appointment.modality === 'presencial' && 'Consultorio · Av. Cabildo 1245, CABA'}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="form-label flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Motivo de la consulta
          </p>
          <p className="rounded-xl bg-blue-50/60 p-3 text-sm font-medium leading-relaxed text-navy-800">
            {appointment.reason}
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="appointment-notes" className="form-label flex items-center gap-1.5">
            <StickyNote className="h-3.5 w-3.5" /> Notas privadas
          </label>
          <textarea
            id="appointment-notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Escribí observaciones internas sobre esta consulta…"
            className="form-input resize-none"
          />
          <button type="button" onClick={handleSaveNotes} disabled={savingNotes} className="btn-secondary mt-2 w-full py-2.5 text-xs">
            {savingNotes ? 'Guardando…' : 'Guardar notas'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
          {patient && (
            <Link
              to={conversationForPatient(patient.id) ? `/profesional/mensajes?c=${conversationForPatient(patient.id)}` : '/profesional/mensajes'}
              onClick={onClose}
              className="btn-primary py-2.5 text-xs"
            >
              <MessageSquare className="h-4 w-4" />
              Enviar mensaje
            </Link>
          )}
          {isCancellable ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
              Cancelar consulta
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-400"
            >
              No cancelable
            </button>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar consulta"
        message="¿Querés cancelar esta consulta? El paciente recibirá una notificación con la cancelación."
        confirmLabel="Sí, cancelar"
      />
    </>
  );
}

function conversationForPatient(patientId) {
  return INITIAL_CONVERSATIONS.find((conversation) => conversation.patientId === patientId)?.id;
}
