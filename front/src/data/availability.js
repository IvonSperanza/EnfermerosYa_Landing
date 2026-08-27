import { addDays } from '../lib/format';

export const WEEKDAY_LABELS = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

export const INITIAL_AVAILABILITY = {
  weekly: {
    1: [{ start: '08:00', end: '12:00' }, { start: '16:00', end: '20:00' }],
    2: [{ start: '08:00', end: '13:00' }],
    3: [{ start: '08:00', end: '12:00' }, { start: '16:00', end: '20:00' }],
    4: [{ start: '09:00', end: '14:00' }],
    5: [{ start: '09:00', end: '15:00' }],
    6: [{ start: '09:00', end: '13:00' }],
    7: [],
  },
  eConsultWeekly: {
    1: [{ start: '18:00', end: '21:00' }],
    2: [],
    3: [{ start: '18:00', end: '21:00' }],
    4: [],
    5: [{ start: '15:00', end: '19:00' }],
    6: [],
    7: [{ start: '10:00', end: '12:00' }],
  },
  appointmentDuration: 30,
  bufferMinutes: 10,
  minBookingNoticeHours: 4,
  blockedDates: [addDays(new Date(), 10).toISOString().slice(0, 10)],
  leaves: [
    {
      id: 'leave-1',
      from: addDays(new Date(), 40).toISOString().slice(0, 10),
      to: addDays(new Date(), 47).toISOString().slice(0, 10),
      label: 'Vacaciones de primavera',
    },
  ],
};

export const E_CONSULT_CONFIG = {
  enabled: true,
  durationMinutes: 20,
  price: 6000,
};
