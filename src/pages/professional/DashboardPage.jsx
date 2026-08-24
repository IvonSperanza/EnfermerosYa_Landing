import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, BadgeCheck, CalendarDays, CreditCard, MessageSquareText, Stethoscope, Users, Wallet } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Avatar from '../../components/ui/Avatar';
import { PageLoader, ErrorState, EmptyState } from '../../components/ui/Feedback';
import AppointmentDetail from '../../components/professional/AppointmentDetail';
import { appointmentsService, patientsService, paymentsService } from '../../services/mockApi';
import { APPOINTMENT_TYPES } from '../../lib/status';
import { formatCurrency, formatMonthShort, formatTime, greetingByHour, isSameDay, relativeDayLabel } from '../../lib/format';
import { Link } from '../../router/Router';
import { useProfessional } from '../../context/ProfessionalContext';
import { PROFESSIONAL } from '../../data/professional';
import { StatusDot } from '../../components/professional/StatusPill';

const VERIFIED = { badge: 'success' };

export default function DashboardPage() {
  const { acceptsEConsults, availabilityStatus } = useProfessional();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [pendingPayments, setPendingPayments] = useState({ count: 0, total: 0 });
  const [selectedId, setSelectedId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([appointmentsService.list(), patientsService.list(), paymentsService.monthlyRevenue(), paymentsService.list()])
      .then(([appointmentList, patientList, revenue, paymentList]) => {
        setAppointments(appointmentList);
        setPatients(patientList);
        setMonthlyRevenue(revenue[revenue.length - 1]?.value || 0);
        const pending = paymentList.filter((payment) => payment.status === 'pendiente');
        setPendingPayments({
          count: pending.length,
          total: pending.reduce((sum, payment) => sum + payment.amount, 0),
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayAppointments = appointments.filter((appointment) => isSameDay(appointment.startsAt, now));
    const upcoming = appointments
      .filter((appointment) => ['pendiente', 'confirmada', 'en-curso'].includes(appointment.status))
      .filter((appointment) => new Date(appointment.startsAt) >= now)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    const pendingEConsults = appointments.filter((appointment) => appointment.type === 'e-consulta' && appointment.status === 'pendiente');
    const activePatients = patients.filter((patient) => patient.status === 'activo');

    return {
      todayCount: todayAppointments.length,
      upcoming,
      pendingEConsults: pendingEConsults.length,
      activePatients: activePatients.length,
    };
  }, [appointments, patients]);

  const selected = appointments.find((appointment) => appointment.id === selectedId) || null;

  const handleCancelled = (id) => {
    setAppointments((current) => current.map((appointment) => (appointment.id === id ? { ...appointment, status: 'cancelada' } : appointment)));
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  const verification = VERIFIED;

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{relativeDayLabel(new Date())} · Portal del personal de salud</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-navy-800 sm:text-3xl">
            {greetingByHour()}, María
          </h2>
          <p className="mt-1.5 text-sm font-medium text-slate-500">Este es el resumen de tu actividad.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-card">
          <StatusDot status={availabilityStatus} />
          <span className="text-sm font-semibold text-navy-800">
            {acceptsEConsults ? 'Disponible para e-consulta' : 'Fuera de línea'}
          </span>
          <Link to="/profesional/e-consultas" className="ml-2 text-xs font-bold text-action hover:text-action-dark">
            Cambiar
          </Link>
        </div>
      </header>

      <section aria-label="Resumen de actividad" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} tone="blue" label="Pacientes activos" value={stats.activePatients} href="/profesional/pacientes" />
        <StatCard icon={Stethoscope} tone="emerald" label="Consultas de hoy" value={stats.todayCount} sub={stats.todayCount === 1 ? 'Consulta agendada' : 'Consultas agendadas'} href="/profesional/agenda" />
        <StatCard icon={CalendarDays} tone="violet" label="Próximas consultas" value={stats.upcoming.length} sub="Próximos 7 días" href="/profesional/agenda" />
        <StatCard icon={MessageSquareText} tone="amber" label="E-consultas pendientes" value={stats.pendingEConsults} href="/profesional/e-consultas" />
        <StatCard icon={CreditCard} tone="red" label="Pagos pendientes" value={pendingPayments.count} sub={`${formatCurrency(pendingPayments.total)} por cobrar`} href="/profesional/pagos" />
        <StatCard icon={Wallet} tone="blue" label="Ingresos del mes" value={formatCurrency(monthlyRevenue)} sub={`Acumulado de ${formatMonthShort(new Date())}`} href="/profesional/pagos" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-extrabold text-navy-800">Próximas consultas</h3>
            <Link to="/profesional/agenda" className="inline-flex items-center gap-1 text-sm font-semibold text-action transition-all hover:gap-2">
              Ver agenda <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          {stats.upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No tenés consultas próximas"
              description="Cuando un paciente reserve un turno va a aparecer acá y en tu agenda."
              className="m-5"
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.upcoming.slice(0, 5).map((appointment) => {
                const patient = patients.find((item) => item.id === appointment.patientId);
                const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente';
                return (
                  <li key={appointment.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-blue-50/40">
                    <Avatar name={name} size="md" onlineStatus={appointment.modality === 'online' ? 'online' : undefined} />
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate text-sm font-bold text-navy-800">{name}</p>
                      <p className="text-xs font-medium text-slate-500 capitalize">
                        {relativeDayLabel(appointment.startsAt)} · {formatTime(appointment.startsAt)}
                      </p>
                    </div>
                    <div className="min-w-0 basis-44">
                      <p className="truncate text-sm font-semibold text-slate-600">{APPOINTMENT_TYPES[appointment.type]?.label}</p>
                      <p className="text-xs font-medium capitalize text-slate-400">
                        {appointment.modality === 'presencial' && 'Presencial'}
                        {appointment.modality === 'domicilio' && 'A domicilio'}
                        {appointment.modality === 'online' && 'Online'}
                      </p>
                    </div>
                    <AppointmentChip status={appointment.status} />
                    <button type="button" onClick={() => setSelectedId(appointment.id)} className="btn-secondary px-3.5 py-2 text-xs">
                      Ver consulta
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-base font-extrabold text-navy-800">Estado de tu perfil</h3>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50/70 p-3.5">
              <BadgeCheck className={`mt-0.5 h-5 w-5 shrink-0 ${verification.badge === 'success' ? 'text-emerald-600' : 'text-amber-500'}`} />
              <div>
                <p className="text-sm font-bold text-navy-800">Verificación profesional</p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500">
                  Tu identidad y matrícula fueron verificadas correctamente.
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-slate-500">Matrícula</dt>
                <dd className="font-bold text-navy-800">{PROFESSIONAL.licenseNumber}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-slate-500">Calificación</dt>
                <dd className="font-bold text-navy-800">★ 4.9 · 132 reseñas</dd>
              </div>
            </dl>
            <Link to="/profesional/perfil" className="btn-secondary mt-4 w-full py-2.5 text-xs">
              Gestionar perfil
            </Link>
          </div>

          <div className="card overflow-hidden p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-navy-800">E-consultas</h3>
              <Activity className={`h-5 w-5 ${acceptsEConsults ? 'text-emerald-500' : 'text-slate-300'}`} />
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              {acceptsEConsults
                ? 'Estás apareciendo como disponible para atender consultas por chat.'
                : 'Activá las e-consultas para recibir consultas por chat y generar ingresos extra.'}
            </p>
            <Link to="/profesional/e-consultas" className={acceptsEConsults ? 'btn-secondary mt-4 w-full py-2.5 text-xs' : 'btn-primary mt-4 w-full py-2.5 text-xs'}>
              {acceptsEConsults ? 'Configurar e-consultas' : 'Activar e-consultas'}
            </Link>
          </div>
        </div>
      </section>

      <AppointmentDetail appointment={selected} onClose={() => setSelectedId(null)} onCancelled={handleCancelled} />
    </div>
  );
}

function AppointmentChip({ status }) {
  const styles = {
    confirmada: 'bg-emerald-50 text-emerald-700',
    pendiente: 'bg-amber-100 text-amber-700',
    'en-curso': 'bg-sky-100 text-sky-700',
  };
  const labels = { confirmada: 'Confirmada', pendiente: 'Pendiente', 'en-curso': 'En curso' };
  return (
    <span className={`hidden whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold xl:inline-flex ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {labels[status] || status}
    </span>
  );
}
