import { useEffect, useMemo, useState } from 'react';
import { BellRing, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Avatar from '../../components/ui/Avatar';
import { EmptyState, PageLoader, ErrorState } from '../../components/ui/Feedback';
import { Select } from '../../components/ui/Form';
import { PaymentStatusBadge } from '../../components/professional/StatusBadges';
import { paymentsService, patientsService } from '../../services/mockApi';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../lib/status';
import { formatCurrency, formatShortCurrency, formatShortDate, formatMonthYear } from '../../lib/format';
import { useToast } from '../../context/ToastContext';

export default function PaymentsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [statusFilter, setStatusFilter] = useState('todos');
  const [serviceFilter, setServiceFilter] = useState('todos');

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([paymentsService.list(), paymentsService.monthlyRevenue(), patientsService.list()])
      .then(([paymentList, revenueList, patientList]) => {
        setPayments(paymentList);
        setRevenue(revenueList);
        setPatientsMap(Object.fromEntries(patientList.map((patient) => [patient.id, patient])));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = payments.filter((payment) => {
      const date = new Date(payment.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const received = thisMonth.filter((payment) => payment.status === 'pagado');
    const pending = payments.filter((payment) => payment.status === 'pendiente');
    const total = payments.filter((payment) => ['pagado', 'pendiente'].includes(payment.status));

    return {
      monthRevenue: received.reduce((sum, payment) => sum + payment.amount, 0) || thisMonth.reduce((sum, payment) => sum + payment.amount, 0),
      receivedCount: (received.length ? received : thisMonth).length,
      pendingTotal: pending.reduce((sum, payment) => sum + payment.amount, 0),
      pendingCount: pending.length,
      totalAccumulated: total.reduce((sum, payment) => sum + payment.amount, 0),
    };
  }, [payments]);

  const services = useMemo(() => [...new Set(payments.map((payment) => payment.service))], [payments]);

  const filtered = useMemo(
    () =>
      payments
        .filter((payment) => statusFilter === 'todos' || payment.status === statusFilter)
        .filter((payment) => serviceFilter === 'todos' || payment.service === serviceFilter)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [payments, statusFilter, serviceFilter],
  );

  if (loading) return <PageLoader />;
  if (error) return <ErrorState onRetry={load} />;

  const maxRevenue = Math.max(...revenue.map((entry) => entry.value), 1);

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800">Pagos</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Gestioná tus ingresos, pagos pendientes y cobros de la plataforma.</p>
      </header>

      <section aria-label="Resumen financiero" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} tone="emerald" label="Ingresos del mes" value={formatCurrency(stats.monthRevenue)} sub={formatMonthYear(new Date())} />
        <StatCard icon={CreditCard} tone="blue" label="Pagos recibidos" value={stats.receivedCount} sub="Este mes" />
        <StatCard icon={Wallet} tone="amber" label="Pagos pendientes" value={formatCurrency(stats.pendingTotal)} sub={`${stats.pendingCount} pago(s)`} />
        <StatCard icon={TrendingUp} tone="violet" label="Total acumulado" value={formatCurrency(stats.totalAccumulated)} sub="Histórico en la plataforma" />
      </section>

      <section className="card p-5 sm:p-6" aria-label="Ingresos mensuales">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-navy-800">Ingresos mensuales</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">Últimos 6 meses</p>
          </div>
          <p className="text-sm font-extrabold text-emerald-600">+{Math.round(((revenue[revenue.length - 1]?.value || 1) / (revenue[revenue.length - 2]?.value || 1) - 1) * 100)}%</p>
        </div>
        <div className="mt-6 flex h-44 items-end gap-3 sm:gap-5" role="img" aria-label={`Gráfico de ingresos mensuales: ${revenue.map((entry) => `${entry.label} ${formatCurrency(entry.value)}`).join(', ')}`}>
          {revenue.map((entry, index) => {
            const isCurrent = index === revenue.length - 1;
            return (
              <div key={entry.label} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-extrabold text-navy-800 opacity-0 transition-opacity group-hover:opacity-100 sm:text-xs">
                  {formatShortCurrency(entry.value)}
                </span>
                <div
                  title={`${entry.label}: ${formatCurrency(entry.value)}`}
                  style={{ height: `${Math.max(6, (entry.value / maxRevenue) * 100)}%` }}
                  className={`w-full max-w-[52px] rounded-t-lg transition-all ${isCurrent ? 'bg-action' : 'bg-blue-100 group-hover:bg-blue-200'}`}
                />
                <span className={`truncate text-[11px] font-bold ${isCurrent ? 'text-action' : 'text-slate-400'}`}>{entry.label.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Historial de pagos">
        <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-base font-extrabold text-navy-800">Historial de pagos</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado" className="sm:w-44">
              <option value="todos">Todos los estados</option>
              {Object.entries(PAYMENT_STATUS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </Select>
            <Select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} aria-label="Filtrar por servicio" className="sm:w-56">
              <option value="todos">Todos los servicios</option>
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </Select>
          </div>
        </header>

        {filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Sin pagos para estos filtros"
            description="Probá cambiando el estado o el servicio seleccionado."
          />
        ) : (
          <>
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full">
                <caption className="sr-only">Historial de pagos</caption>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th scope="col" className="table-th">Fecha</th>
                    <th scope="col" className="table-th">Paciente</th>
                    <th scope="col" className="table-th">Servicio</th>
                    <th scope="col" className="table-th">Método</th>
                    <th scope="col" className="table-th">Estado</th>
                    <th scope="col" className="table-th text-right">Importe</th>
                    <th scope="col" className="table-th text-right"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((payment) => {
                    const patient = patientsMap[payment.patientId];
                    return (
                      <tr key={payment.id} className="transition-colors hover:bg-blue-50/40">
                        <td className="table-td whitespace-nowrap capitalize">{formatShortDate(payment.date)}, {new Date(payment.date).getFullYear()}</td>
                        <td className="table-td">
                          <span className="flex items-center gap-2.5">
                            <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : '?'} size="xs" />
                            <span className="font-bold text-navy-800">{patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}</span>
                          </span>
                        </td>
                        <td className="table-td">{payment.service}</td>
                        <td className="table-td">{PAYMENT_METHODS[payment.method]?.label}</td>
                        <td className="table-td"><PaymentStatusBadge status={payment.status} /></td>
                        <td className="table-td text-right font-extrabold text-navy-800">{formatCurrency(payment.amount)}</td>
                        <td className="table-td text-right">
                          {payment.status === 'pendiente' && (
                            <button
                              type="button"
                              onClick={() => toast.success(`Recordatorio enviado a ${patient?.firstName || 'el paciente'}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-action transition-colors hover:bg-blue-50"
                            >
                              <BellRing className="h-3.5 w-3.5" /> Recordar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {filtered.map((payment) => {
                const patient = patientsMap[payment.patientId];
                return (
                  <li key={payment.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient ? `${patient.firstName} ${patient.lastName}` : '?'} size="sm" />
                        <div>
                          <p className="text-sm font-bold text-navy-800">{patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}</p>
                          <p className="text-xs font-medium capitalize text-slate-400">{formatShortDate(payment.date)} · {PAYMENT_METHODS[payment.method]?.label}</p>
                        </div>
                      </div>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <p className="text-xs font-semibold text-slate-500">{payment.service}</p>
                      <p className="text-base font-extrabold text-navy-800">{formatCurrency(payment.amount)}</p>
                    </div>
                    {payment.status === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => toast.success(`Recordatorio enviado a ${patient?.firstName || 'el paciente'}`)}
                        className="btn-secondary mt-3 w-full py-2 text-xs"
                      >
                        Enviar recordatorio
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
