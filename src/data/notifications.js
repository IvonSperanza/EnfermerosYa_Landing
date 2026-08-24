function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}
function hoursAgo(hours) {
  return minutesAgo(hours * 60);
}

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'ntf-001',
    kind: 'appointment',
    title: 'Nueva consulta confirmada',
    body: 'Rosa Fernández confirmó la visita a domicilio de mañana a las 09:00.',
    sentAt: minutesAgo(35),
    read: false,
  },
  {
    id: 'ntf-002',
    kind: 'message',
    title: 'Mensaje nuevo de María López',
    body: '“Una consulta, ¿puedo tomar mate igual?”',
    sentAt: minutesAgo(12),
    read: false,
  },
  {
    id: 'ntf-003',
    kind: 'payment',
    title: 'Pago recibido',
    body: 'Carlos Pérez acreditó $12.000 por Consulta clínica.',
    sentAt: hoursAgo(5),
    read: false,
  },
  {
    id: 'ntf-004',
    kind: 'system',
    title: 'Certificación en revisión',
    body: 'Tu certificado de reanimación está siendo verificado por nuestro equipo.',
    sentAt: hoursAgo(30),
    read: true,
  },
  {
    id: 'ntf-005',
    kind: 'appointment',
    title: 'Solicitud de e-consulta pendiente',
    body: 'Jorge Díaz solicitó una e-consulta para hoy a las 18:00.',
    sentAt: hoursAgo(8),
    read: true,
  },
];
