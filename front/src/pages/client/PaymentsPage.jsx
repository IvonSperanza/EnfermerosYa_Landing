import { useEffect, useMemo, useState } from 'react';
import { Clock3, CreditCard, Download, ReceiptText, Wallet } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { Link } from '../../router/Router';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { clientPaymentsService } from '../../services/clientApi';
import { useToast } from '../../context/ToastContext';
import useProfessionalLookup from './useProfessionalLookup';
import { formatCurrency, formatDate, formatFullDate } from '../../lib/format';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../lib/status';

export default function PaymentsPage() {
  const toast = useToast();
  const professionals = useProfessionalLookup();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState('todos');
  const [receiptPayment, setReceiptPayment] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([clientPaymentsService.list(), clientPaymentsService.summary()])
      .then(([paymentList, summaryData]) => {
        setPayments(paymentList);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const monthsAvailable = useMemo(
    () => Array.from(new Set(payments.map((payment) => payment.paidAt.slice(0, 7)))),
    [payments],
  );

  const filtered = useMemo(
    () =>
      payments.filter((payment) => {
        if (statusFilter !== 'todos' && payment.status !== statusFilter) return false;
        if (monthFilter !== 'todos' && !payment.paidAt.startsWith(monthFilter)) return false;
        return true;
      }),
    [payments, statusFilter, monthFilter],
  );

  const downloadReceipt = (payment) => {
    const professional = professionals[payment.professionalId];
    const lines = [
      'EnfermerosYa — Comprobante de pago',
      '------------------------------------',
      `Comprobante: ${payment.id.toUpperCase()}`,
      `Fecha: ${formatFullDate(payment.paidAt)}`,
      `Profesional: ${professional ? `${professional.firstName} ${professional.lastName}` : payment.professionalId}`,
      `Servicio: ${payment.serviceName}`,
      `Método de pago: ${PAYMENT_METHODS[payment.method]?.label || payment.method}`,
      `Estado: ${PAYMENT_STATUS[payment.status]?.label || payment.status}`,
      `Importe: ${formatCurrency(payment.amount)}`,
      '------------------------------------',
      'Documento generado automáticamente por EnfermerosYa.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `comprobante-${payment.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Comprobante descargado.');
  };

  if (loading && !error) return <PageLoader />;
  if (error || !summary) return <ErrorState onRetry={load} />;

  return (
    <div className="animate-fade-up space-y-5">
      <header>
        <h2 className="text-xl font-extrabold tracking-tight text-navy-800 sm:text-2xl">Mis pagos</h2>
        <p className="mt-0.5 text-sm font-medium text-slate-500">Historial de pagos de tus consultas.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3">
        <li>
          <StatCard icon={Wallet} tone="blue" label="Total pagado" value={formatCurrency(summary.totalPaid)} sub="Suma de pagos acreditados" />
        </li>
        <li>
          <StatCard icon={Clock3} tone="amber" label="Pagos pendientes" value={formatCurrency(summary.pendingAmount)} sub={`${summary.pendingCount} ${summary.pendingCount === 1 ? 'pago pendiente' : 'pagos pendientes'}`} />
        </li>
        <li>
          <StatCard
            icon={CreditCard}
            tone="emerald"
            label="Último pago"
            value={summary.lastPayment ? formatCurrency(summary.lastPayment.amount) : '—'}
            sub={summary.lastPayment ? `${summary.lastPayment.serviceName} · ${formatDate(summary.lastPayment.paidAt)}` : 'Sin pagos aún'}
          />
        </li>
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado" className="form-input w-auto py-2.5 text-xs">
          <option value="todos">Todos los estados</option>
          {Object.entries(PAYMENT_STATUS).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} aria-label="Filtrar por mes" className="form-input w-auto py-2.5 text-xs">
          <option value="todos">Todo el año</option>
          {monthsAvailable.map((month) => (
            <option key={month} value={month}>{new Date(`${month}-15`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</option>
          ))}
        </select>
        {(statusFilter !== 'todos' || monthFilter !== 'todos') && (
          <button type="button" onClick={() => { setStatusFilter('todos'); setMonthFilter('todos'); }} className="text-xs font-bold text-action hover:text-action-dark">
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ReceiptText} title="No hay pagos con estos filtros" description="Probá cambiando el estado o el mes seleccionado." />
      ) : (
        <>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Fecha', 'Profesional', 'Servicio', 'Método', 'Estado', 'Importe', ''].map((heading) => (
                    <th key={heading} scope="col" className="table-th">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((payment) => {
                  const professional = professionals[payment.professionalId];
                  return (
                    <tr key={payment.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="table-td whitespace-nowrap font-semibold capitalize text-slate-600">{formatDate(payment.paidAt)}</td>
                      <td className="table-td">
                        <span className="flex items-center gap-2.5">
                          <Avatar name={professional ? `${professional.firstName} ${professional.lastName}` : '?'} size="sm" />
                          <span className="font-bold text-navy-800">{professional ? `${professional.firstName} ${professional.lastName}` : '—'}</span>
                        </span>
                      </td>
                      <td className="table-td text-slate-600">{payment.serviceName}</td>
                      <td className="table-td text-slate-600">{PAYMENT_METHODS[payment.method]?.label}</td>
                      <td className="table-td"><Badge variant={PAYMENT_STATUS[payment.status]?.badge}>{PAYMENT_STATUS[payment.status]?.label}</Badge></td>
                      <td className="table-td font-extrabold text-navy-800">{formatCurrency(payment.amount)}</td>
                      <td className="table-td text-right">
                        <button type="button" onClick={() => setReceiptPayment(payment)} className="text-xs font-bold text-action transition-colors hover:text-action-dark">
                          Ver comprobante
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((payment) => {
              const professional = professionals[payment.professionalId];
              return (
                <li key={payment.id}>
                  <article className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={professional ? `${professional.firstName} ${professional.lastName}` : '?'} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-navy-800">{professional ? `${professional.firstName} ${professional.lastName}` : '—'}</p>
                          <p className="truncate text-xs font-medium text-slate-500">{payment.serviceName}</p>
                        </div>
                      </div>
                      <Badge variant={PAYMENT_STATUS[payment.status]?.badge}>{PAYMENT_STATUS[payment.status]?.label}</Badge>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="font-semibold text-slate-400">Fecha</dt>
                        <dd className="font-bold capitalize text-navy-800">{formatDate(payment.paidAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-400">Método</dt>
                        <dd className="font-bold text-navy-800">{PAYMENT_METHODS[payment.method]?.label}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-400">Importe</dt>
                        <dd className="text-sm font-extrabold text-navy-800">{formatCurrency(payment.amount)}</dd>
                      </div>
                    </dl>
                    <button type="button" onClick={() => setReceiptPayment(payment)} className="btn-secondary mt-3 w-full justify-center py-2 text-xs">
                      Ver comprobante
                    </button>
                  </article>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Modal open={Boolean(receiptPayment)} onClose={() => setReceiptPayment(null)} title="Comprobante de pago" size="sm">
        {receiptPayment && (() => {
          const professional = professionals[receiptPayment.professionalId];
          return (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <p className="font-extrabold tracking-tight text-navy-800">Enfermeros<span className="text-action">Ya</span></p>
                  <Badge variant={PAYMENT_STATUS[receiptPayment.status]?.badge}>{PAYMENT_STATUS[receiptPayment.status]?.label}</Badge>
                </div>
                <dl className="mt-3 space-y-2">
                  {[['Comprobante', receiptPayment.id.toUpperCase()],
                    ['Fecha', formatDate(receiptPayment.paidAt)],
                    ['Profesional', professional ? `${professional.firstName} ${professional.lastName}` : '—'],
                    ['Servicio', receiptPayment.serviceName],
                    ['Método', PAYMENT_METHODS[receiptPayment.method]?.label]].map(([term, value]) => (
                    <div key={term} className="flex items-center justify-between gap-3">
                      <dt className="text-xs font-semibold text-slate-400">{term}</dt>
                      <dd className="text-right text-xs font-bold capitalize text-navy-800">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p>
                  <p className="text-lg font-extrabold text-navy-800">{formatCurrency(receiptPayment.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => downloadReceipt(receiptPayment)} className="btn-primary py-2.5 text-xs">
                  <Download className="h-4 w-4" /> Descargar
                </button>
                {receiptPayment.bookingId && (
                  <Link to={`/cliente/reservas/${receiptPayment.bookingId}`} onClick={() => setReceiptPayment(null)} className="btn-secondary justify-center py-2.5 text-xs">
                    Ver consulta
                  </Link>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
