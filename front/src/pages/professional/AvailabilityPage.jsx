import { useEffect, useState } from 'react';
import { CalendarOff, Info, Plus, Trash2 } from 'lucide-react';
import DayRangesEditor from '../../components/professional/DayRangesEditor';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader, ErrorState } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Form';
import { useToast } from '../../context/ToastContext';
import { availabilityService } from '../../services/mockApi';
import { formatDate } from '../../lib/format';

const DURATION_OPTIONS = [
  { value: 20, label: '20 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
];

const BUFFER_OPTIONS = [
  { value: 0, label: 'Sin descanso' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 20, label: '20 minutos' },
  { value: 30, label: '30 minutos' },
];

const NOTICE_OPTIONS = [
  { value: 1, label: '1 hora' },
  { value: 4, label: '4 horas' },
  { value: 24, label: '24 horas' },
  { value: 48, label: '48 horas' },
];

export default function AvailabilityPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [saving, setSaving] = useState(false);
  const [blockedDate, setBlockedDate] = useState('');
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', label: '' });
  const [leaveToRemove, setLeaveToRemove] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    availabilityService
      .get()
      .then(setAvailability)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading || !availability) return loading ? <PageLoader /> : <ErrorState onRetry={load} />;
  if (error) return <ErrorState onRetry={load} />;

  const handleSave = async () => {
    for (const [, ranges] of Object.entries(availability.weekly)) {
      for (const range of ranges) {
        if (range.end <= range.start) {
          toast.error('Revisá los horarios: hay bloques donde la hora de fin es menor a la de inicio.');
          return;
        }
      }
    }
    setSaving(true);
    await availabilityService.save(availability);
    setSaving(false);
    toast.success('Disponibilidad guardada correctamente');
  };

  const addBlockedDate = () => {
    if (!blockedDate) return;
    if (availability.blockedDates.includes(blockedDate)) {
      toast.info('Ese día ya está bloqueado.');
      return;
    }
    setAvailability((current) => ({
      ...current,
      blockedDates: [...current.blockedDates, blockedDate].sort(),
    }));
    setBlockedDate('');
    toast.success('Día bloqueado. Recordá guardar los cambios.');
  };

  const removeBlockedDate = (date) => {
    setAvailability((current) => ({
      ...current,
      blockedDates: current.blockedDates.filter((item) => item !== date),
    }));
  };

  const addLeave = (event) => {
    event.preventDefault();
    if (!leaveForm.from || !leaveForm.to) return;
    if (leaveForm.to < leaveForm.from) {
      toast.error('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }
    setAvailability((current) => ({
      ...current,
      leaves: [...current.leaves, { id: `leave-${Date.now()}`, from: leaveForm.from, to: leaveForm.to, label: leaveForm.label || 'Licencia' }],
    }));
    setLeaveForm({ from: '', to: '', label: '' });
    toast.success('Período agregado. Recordá guardar los cambios.');
  };

  const confirmRemoveLeave = () => {
    setAvailability((current) => ({
      ...current,
      leaves: current.leaves.filter((leave) => leave.id !== leaveToRemove),
    }));
    setLeaveToRemove(null);
    toast.success('Período eliminado');
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-navy-800">Horarios de atención</h2>
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            Definí tus días y franjas horarias. Tus pacientes solo podrán reservar dentro de estos horarios.
          </p>
        </div>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary shrink-0">
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </header>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card p-5 sm:p-6 xl:col-span-3" aria-label="Horario semanal">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-navy-800">Semana tipo</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-action">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-action" />
              Franja disponible
            </span>
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
            Podés cargar varios bloques por día. Por ejemplo: lunes de 08:00 a 12:00 y de 16:00 a 20:00.
          </p>
          <div className="mt-4">
            <DayRangesEditor weekly={availability.weekly} onChange={(weekly) => setAvailability({ ...availability, weekly })} />
          </div>
        </section>

        <div className="space-y-6 xl:col-span-2">
          <section className="card p-5 sm:p-6" aria-label="Preferencias de agenda">
            <h3 className="text-base font-extrabold text-navy-800">Preferencias de agenda</h3>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="form-label">Duración de consulta</span>
                <Select
                  value={availability.appointmentDuration}
                  onChange={(event) => setAvailability({ ...availability, appointmentDuration: Number(event.target.value) })}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="form-label">Tiempo entre consultas</span>
                <Select
                  value={availability.bufferMinutes}
                  onChange={(event) => setAvailability({ ...availability, bufferMinutes: Number(event.target.value) })}
                >
                  {BUFFER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="form-label">Anticipación mínima para reservar</span>
                <Select
                  value={availability.minBookingNoticeHours}
                  onChange={(event) => setAvailability({ ...availability, minBookingNoticeHours: Number(event.target.value) })}
                >
                  {NOTICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </label>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-label="Días bloqueados">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-navy-800">
              <CalendarOff className="h-[18px] w-[18px] text-action" /> Días bloqueados
            </h3>
            <div className="mt-4 flex gap-2">
              <input
                type="date"
                value={blockedDate}
                onChange={(event) => setBlockedDate(event.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                aria-label="Fecha a bloquear"
                className="form-input"
              />
              <button type="button" onClick={addBlockedDate} className="btn-secondary shrink-0 px-3" aria-label="Bloquear fecha">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {availability.blockedDates.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {availability.blockedDates.map((date) => (
                  <li key={date}>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 py-1 pl-3 pr-1.5 text-xs font-bold text-red-600 ring-1 ring-red-100">
                      {formatDate(`${date}T12:00:00`)}
                      <button type="button" onClick={() => removeBlockedDate(date)} className="rounded-full p-0.5 transition-colors hover:bg-red-100" aria-label={`Quitar ${date}`}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-400">No tenés días bloqueados.</p>
            )}
          </section>

          <section className="card p-5 sm:p-6" aria-label="Vacaciones y licencias">
            <h3 className="text-base font-extrabold text-navy-800">Vacaciones y licencias</h3>
            <form onSubmit={addLeave} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={leaveForm.from}
                  onChange={(event) => setLeaveForm({ ...leaveForm, from: event.target.value })}
                  aria-label="Desde"
                  className="form-input"
                />
                <input
                  type="date"
                  required
                  value={leaveForm.to}
                  onChange={(event) => setLeaveForm({ ...leaveForm, to: event.target.value })}
                  aria-label="Hasta"
                  className="form-input"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={leaveForm.label}
                  onChange={(event) => setLeaveForm({ ...leaveForm, label: event.target.value })}
                  placeholder="Motivo (opcional)"
                  aria-label="Motivo"
                  className="form-input"
                />
                <button type="submit" className="btn-secondary shrink-0 px-3" aria-label="Agregar período">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>

            {availability.leaves.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {availability.leaves.map((leave) => (
                  <li key={leave.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold capitalize text-navy-800">
                        {formatDate(`${leave.from}T12:00:00`)} — {formatDate(`${leave.to}T12:00:00`)}
                      </p>
                      <p className="text-xs font-medium text-slate-400">{leave.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeaveToRemove(leave.id)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label={`Eliminar ${leave.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-400">Sin vacaciones ni licencias cargadas.</p>
            )}
          </section>

          <div className="flex gap-3 rounded-2xl bg-blue-50/70 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-action" />
            <p className="text-xs font-medium leading-relaxed text-navy-800">
              Al guardar, tu agenda se actualiza al instante y los pacientes solo ven los turnos disponibles dentro de estos horarios.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(leaveToRemove)}
        onClose={() => setLeaveToRemove(null)}
        onConfirm={confirmRemoveLeave}
        title="Eliminar período"
        message="¿Querés eliminar este período de vacaciones o licencia? Tus horarios habituales volverán a mostrarse en esas fechas."
        confirmLabel="Eliminar"
      />
    </div>
  );
}
