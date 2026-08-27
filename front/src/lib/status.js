export const APPOINTMENT_STATUS = {
  confirmada: { label: 'Confirmada', badge: 'success' },
  pendiente: { label: 'Pendiente', badge: 'warning' },
  cancelada: { label: 'Cancelada', badge: 'danger' },
  'en-curso': { label: 'En curso', badge: 'info' },
  finalizada: { label: 'Finalizada', badge: 'neutral' },
};

export const APPOINTMENT_TYPES = {
  consulta: { label: 'Consulta', icon: 'stethoscope' },
  control: { label: 'Control de enfermería', icon: 'activity' },
  curacion: { label: 'Curación', icon: 'bandage' },
  inyectables: { label: 'Inyectables', icon: 'syringe' },
  'e-consulta': { label: 'E-consulta', icon: 'message' },
  practica: { label: 'Práctica de laboratorio', icon: 'flask' },
};

export const MODALITIES = {
  presencial: { label: 'Presencial', badge: 'blue' },
  domicilio: { label: 'A domicilio', badge: 'violet' },
  online: { label: 'Online', badge: 'info' },
};

export const PAYMENT_STATUS = {
  pagado: { label: 'Pagado', badge: 'success' },
  pendiente: { label: 'Pendiente', badge: 'warning' },
  cancelado: { label: 'Cancelado', badge: 'danger' },
  reembolsado: { label: 'Reembolsado', badge: 'violet' },
};

export const PAYMENT_METHODS = {
  mercado_pago: { label: 'Mercado Pago' },
  transferencia: { label: 'Transferencia' },
  tarjeta: { label: 'Tarjeta' },
};

export const PROFESSIONAL_STATUS = {
  online: { label: 'Activo', dotClass: 'bg-emerald-500', description: 'Recibís consultas y pedidos' },
  busy: { label: 'Ocupado', dotClass: 'bg-amber-500', description: 'Atendiendo, sin nuevas solicitudes' },
  unavailable: { label: 'No disponible', dotClass: 'bg-slate-400', description: 'Pausa temporal' },
  offline: { label: 'Fuera de línea', dotClass: 'bg-slate-300 ring-1 ring-slate-400', description: 'No aparecés como disponible' },
};

export const VERIFICATION_STATUS = {
  verified: { label: 'Verificado', badge: 'success', tone: 'emerald' },
  pending: { label: 'En revisión', badge: 'warning', tone: 'amber' },
  rejected: { label: 'Rechazado', badge: 'danger', tone: 'red' },
};

export const PATIENT_STATUS = {
  activo: { label: 'Activo', badge: 'success' },
  inactivo: { label: 'Inactivo', badge: 'neutral' },
};

export const DOCUMENT_KINDS = {
  estudio: { label: 'Estudio', badge: 'blue' },
  receta: { label: 'Receta', badge: 'violet' },
  informe: { label: 'Informe', badge: 'info' },
  indicacion: { label: 'Indicación', badge: 'success' },
};

export const CLIENT_PROFESSIONAL_STATUS = {
  disponible: { label: 'Disponible', dotClass: 'bg-emerald-500' },
  ocupado: { label: 'Ocupado', dotClass: 'bg-amber-500' },
  offline: { label: 'Fuera de línea', dotClass: 'bg-slate-300 ring-1 ring-slate-400' },
};

export const CLIENT_PROFESSION_TYPES = {
  medico: { label: 'Médico/a', article: 'Médico/a' },
  enfermero: { label: 'Enfermero/a', article: 'Enfermero/a' },
};

export const AVAILABILITY_FILTERS = {
  now: { label: 'Disponible ahora' },
  today: { label: 'Disponible hoy' },
  week: { label: 'Disponible esta semana' },
};

export const RATING_FILTERS = {
  any: { label: 'Todas las calificaciones' },
  4: { label: '4 estrellas o más' },
  4.5: { label: '4,5 estrellas o más' },
};
