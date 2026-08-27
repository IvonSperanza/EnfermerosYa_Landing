function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}
function hoursAgo(hours) {
  return minutesAgo(hours * 60);
}

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-001',
    patientId: 'pat-001',
    patientOnline: true,
    unread: 2,
    messages: [
      { id: 'm-1', from: 'patient', text: 'Buenas tardes, doctora. Le comento que desde ayer me siento un poco mareada.', sentAt: hoursAgo(3), attachment: null },
      { id: 'm-2', from: 'pro', text: 'Hola María. ¿La presión se la mediste hoy? Si podés pasame los valores.', sentAt: hoursAgo(2.8), attachment: null },
      { id: 'm-3', from: 'patient', text: 'Sí, me tomé la presión dos veces: 150/95 y 148/92.', sentAt: hoursAgo(2.5), attachment: null },
      { id: 'm-4', from: 'pro', text: 'Gracias. Mantengamos el reposo y seguimos con la medicación como te indiqué en la última visita.', sentAt: hoursAgo(2.2), attachment: null },
      { id: 'm-5', from: 'pro', text: 'Nos vemos hoy a las 15:30 en el consultorio y lo revisamos con calma.', sentAt: hoursAgo(2.1), attachment: null },
      { id: 'm-6', from: 'patient', text: 'Perfecto, muchas gracias doctora.', sentAt: minutesAgo(45), attachment: null },
      { id: 'm-7', from: 'patient', text: 'Una consulta, ¿puedo tomar mate igual?', sentAt: minutesAgo(12), attachment: null },
    ],
  },
  {
    id: 'conv-002',
    patientId: 'pat-006',
    patientOnline: false,
    unread: 0,
    messages: [
      { id: 'm-8', from: 'patient', text: 'Doctora, buenos días. Me llegó el resultado del laboratorio.', sentAt: hoursAgo(26), attachment: null },
      { id: 'm-9', from: 'pro', text: '¡Hola Jorge! Enviámelo por acá cuando puedas y lo revisamos juntos.', sentAt: hoursAgo(25.5), attachment: null },
      { id: 'm-10', from: 'patient', text: 'Ahí se lo adjunto.', sentAt: hoursAgo(25.4), attachment: { name: 'laboratorio-jorge.pdf' } },
      { id: 'm-11', from: 'pro', text: 'Ya lo miré. La glucemia está un poco elevada, te recomiendo el turno del jueves para ajustar el tratamiento.', sentAt: hoursAgo(24), attachment: null },
      { id: 'm-12', from: 'patient', text: 'Listo, quedo a la espera del turno. Gracias.', sentAt: hoursAgo(23.6), attachment: null },
    ],
  },
  {
    id: 'conv-003',
    patientId: 'pat-004',
    patientOnline: true,
    unread: 1,
    messages: [
      { id: 'm-13', from: 'patient', text: 'Hola! Te escribo por la e-consulta de anoche, el dolor lumbar bajó bastante.', sentAt: minutesAgo(90), attachment: null },
      { id: 'm-14', from: 'pro', text: 'Qué bueno, Martín. Seguí con el frío local y evitá esfuerzos hasta el viernes.', sentAt: minutesAgo(80), attachment: null },
      { id: 'm-15', from: 'patient', text: '¿Puedo ir al gimnasio pero tranquilo? 😅', sentAt: minutesAgo(30), attachment: null },
    ],
  },
  {
    id: 'conv-004',
    patientId: 'pat-007',
    patientOnline: false,
    unread: 0,
    messages: [
      { id: 'm-16', from: 'patient', text: 'Buenas! Quería reprogramar el control dermatológico si es posible.', sentAt: hoursAgo(50), attachment: null },
      { id: 'm-17', from: 'pro', text: 'Hola Lucía, sin problema. Te propongo el lunes a las 17:00 o el miércoles a las 18:30.', sentAt: hoursAgo(49), attachment: null },
      { id: 'm-18', from: 'patient', text: 'El lunes a las 17:00 me queda perfecto, gracias!', sentAt: hoursAgo(48), attachment: null },
    ],
  },
];

export const AUTO_REPLIES = [
  'Listo, gracias doctora!',
  'Perfecto, anotado.',
  'Muchas gracias por la rapidez!',
  'Entendido, cualquier cosa le escribo.',
];
