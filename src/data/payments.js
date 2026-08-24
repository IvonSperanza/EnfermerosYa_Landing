import { addDays } from '../lib/format';

function at(dayOffset, hours, minutes = 0) {
  const date = addDays(new Date(), dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const INITIAL_PAYMENTS = [
  { id: 'pay-001', date: at(-1, 16, 12), patientId: 'pat-001', service: 'Control de salud integral', method: 'mercado_pago', status: 'pagado', amount: 15000 },
  { id: 'pay-002', date: at(-2, 10, 40), patientId: 'pat-002', service: 'Consulta clínica', method: 'tarjeta', status: 'pagado', amount: 12000 },
  { id: 'pay-003', date: at(-3, 20, 5), patientId: 'pat-004', service: 'E-consulta de seguimiento', method: 'mercado_pago', status: 'pagado', amount: 6000 },
  { id: 'pay-004', date: at(0, 9, 15), patientId: 'pat-006', service: 'Consulta clínica', method: 'mercado_pago', status: 'pendiente', amount: 12000 },
  { id: 'pay-005', date: at(-5, 18, 30), patientId: 'pat-003', service: 'Visita a domicilio', method: 'transferencia', status: 'pendiente', amount: 18000 },
  { id: 'pay-006', date: at(-7, 11, 22), patientId: 'pat-007', service: 'Consulta clínica', method: 'mercado_pago', status: 'pagado', amount: 12000 },
  { id: 'pay-007', date: at(-10, 15, 48), patientId: 'pat-004', service: 'E-consulta de seguimiento', method: 'mercado_pago', status: 'reembolsado', amount: 6000 },
  { id: 'pay-008', date: at(-14, 9, 5), patientId: 'pat-001', service: 'Consulta clínica', method: 'tarjeta', status: 'pagado', amount: 12000 },
];

export const MONTHLY_REVENUE = [
  { month: -5, label: 'Marzo', value: 386000 },
  { month: -4, label: 'Abril', value: 421000 },
  { month: -3, label: 'Mayo', value: 398000 },
  { month: -2, label: 'Junio', value: 462000 },
  { month: -1, label: 'Julio', value: 512000 },
  { month: 0, label: 'Agosto', value: 347000 },
];
