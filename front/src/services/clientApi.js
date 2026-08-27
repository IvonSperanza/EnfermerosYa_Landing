import { CLIENT_PROFESSIONALS, REVIEW_POOL, professionalFullName } from '../data/clientProfessionals';
import { SPECIALTIES } from '../data/specialties';
import { SERVICES_CATALOG } from '../data/servicesCatalog';
import { INITIAL_BOOKINGS } from '../data/clientBookings';
import { INITIAL_CLIENT_CONVERSATIONS, AUTO_REPLIES } from '../data/clientMessages';
import { INITIAL_CLIENT_PAYMENTS } from '../data/clientPayments';
import { PATIENTS } from '../data/patients';
import { addDays, dayBoundary, isSameDay } from '../lib/format';

const LATENCY_MS = 350;

function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 100003;
  return hash;
}

const state = {
  professionals: CLIENT_PROFESSIONALS.map((professional) => ({ ...professional })),
  bookings: INITIAL_BOOKINGS.map((booking) => ({ ...booking })),
  conversations: INITIAL_CLIENT_CONVERSATIONS.map((conversation) => ({
    ...conversation,
    messages: conversation.messages.map((message) => ({ ...message })),
  })),
  payments: INITIAL_CLIENT_PAYMENTS.map((payment) => ({ ...payment })),
  patientProfile: {
    ...PATIENTS[0],
    street: 'Virrey del Pino 2380, 3º A',
    city: 'CABA',
    province: 'Buenos Aires',
    zipCode: 'C1426',
    emergencyContact: { name: 'Jorge López', relationship: 'Hijo', phone: '+54 9 11 5540-1928' },
  },
};

const BASE_MORNING = ['08:30', '09:00', '09:30', '10:30', '11:00'];
const BASE_AFTERNOON = ['15:30', '16:00', '16:30', '17:30', '18:00'];

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function slotsForDate(professional, date) {
  if (date.getDay() === 0) return [];
  const seed = hashString(`${professional.id}-${dayKey(date)}`);
  const useMorning = seed % 2 === 0 || professional.modalities.every((modality) => modality === 'domicilio');
  const base = [...(useMorning ? BASE_MORNING : []), ...(seed % 3 !== 2 ? BASE_AFTERNOON : [])];
  return base.filter((_, index) => (seed + index * 7) % 4 !== 0);
}

export const catalogService = {
  async listProfessionals() {
    await delay();
    return state.professionals.map((professional) => ({ ...professional }));
  },

  async searchProfessionals(filters = {}) {
    await delay();
    const term = (filters.q || '').trim().toLowerCase();
    const results = state.professionals.filter((professional) => {
      if (term && !`${professional.firstName} ${professional.lastName} ${professional.headline}`.toLowerCase().includes(term)) return false;
      if (filters.profession && filters.profession !== 'todos' && professional.profession !== filters.profession) return false;
      if (filters.specialty && filters.specialty !== 'todas' && professional.specialty !== filters.specialty) return false;
      if (filters.modality && filters.modality !== 'todas' && !professional.modalities.includes(filters.modality)) return false;
      if (filters.availability === 'now' && !professional.availableNow) return false;
      if (filters.availability === 'today' && !professional.availableToday) return false;
      if (filters.location && !`${professional.zone} ${professional.city}`.toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
      if (filters.maxPrice && professional.priceFrom > Number(filters.maxPrice)) return false;
      if (filters.minRating && professional.rating < Number(filters.minRating)) return false;
      if (filters.acceptsOnline && !professional.acceptsOnline) return false;
      return true;
    });

    const sorters = {
      rating: (a, b) => b.rating - a.rating,
      priceAsc: (a, b) => a.priceFrom - b.priceFrom,
      priceDesc: (a, b) => b.priceFrom - a.priceFrom,
      reviews: (a, b) => b.reviewsCount - a.reviewsCount,
    };
    const sorter = sorters[filters.sort];
    return (sorter ? [...results].sort(sorter) : results).map((professional) => ({ ...professional }));
  },

  async getProfessional(id) {
    await delay();
    const professional = state.professionals.find((item) => item.id === id);
    if (!professional) throw new Error('No encontrado');
    const reviewOffset = hashString(id);
    const reviews = Array.from({ length: Math.min(3, REVIEW_POOL.length) }, (_, index) => REVIEW_POOL[(reviewOffset + index * 2) % REVIEW_POOL.length]);
    return { ...professional, reviews };
  },

  async listSpecialties() {
    await delay();
    return SPECIALTIES.map((specialty) => ({
      ...specialty,
      professionalsCount: state.professionals.filter((professional) => professional.specialty === specialty.id).length,
    }));
  },

  async listServices() {
    await delay();
    return SERVICES_CATALOG.map((service) => ({
      ...service,
      professionalsCount: state.professionals.filter(
        (professional) =>
          professional.services.some((offering) => offering.name.toLowerCase().includes(service.name.split(' ')[0].toLowerCase()))
          || professional.specialty === service.specialtyId,
      ).length,
    }));
  },

  async getAvailability(professionalId, days = 14) {
    await delay(250);
    const professional = state.professionals.find((item) => item.id === professionalId);
    if (!professional) throw new Error('No encontrado');
    const today = dayBoundary(new Date());
    return Array.from({ length: days }, (_, index) => {
      const date = addDays(today, index);
      return {
        date: date.toISOString(),
        label: index,
        slots: slotsForDate(professional, date),
      };
    });
  },
};

export const bookingsService = {
  async list() {
    await delay();
    return [...state.bookings].sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)).map((booking) => ({ ...booking }));
  },

  async get(id) {
    await delay();
    const booking = state.bookings.find((item) => item.id === id);
    if (!booking) throw new Error('No encontrada');
    return { ...booking };
  },

  async upcoming() {
    await delay();
    const now = Date.now();
    return state.bookings
      .filter((booking) => ['confirmada', 'pendiente'].includes(booking.status) && new Date(booking.startsAt).getTime() > now)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
      .map((booking) => ({ ...booking }));
  },

  async cancel(id) {
    await delay();
    const booking = state.bookings.find((item) => item.id === id);
    if (!booking) throw new Error('No encontrada');
    booking.status = 'cancelada';
    booking.cancelledBy = 'paciente';
    const payment = state.payments.find((item) => item.bookingId === id && item.status === 'pagado');
    if (payment) payment.status = 'reembolsado';
    return { ...booking };
  },

  async create({ professionalId, serviceId, serviceName, startsAt, durationMinutes, modality, price, reason }) {
    await delay(600);
    const booking = {
      id: `cbk-${Math.floor(Date.now() / 1000)}`,
      patientId: 'pat-001',
      professionalId,
      serviceId,
      serviceName,
      startsAt,
      durationMinutes,
      modality,
      status: 'confirmada',
      price,
      reason: reason || '',
    };
    state.bookings.push(booking);
    state.payments.push({
      id: `cpay-${Math.floor(Date.now() / 1000)}`,
      bookingId: booking.id,
      professionalId,
      serviceName,
      paidAt: new Date().toISOString(),
      status: 'pagado',
      method: 'tarjeta',
      amount: price,
    });
    return { ...booking };
  },

  bookedSlotsFor(professionalId) {
    return state.bookings
      .filter((booking) => booking.professionalId === professionalId && ['confirmada', 'pendiente'].includes(booking.status))
      .map((booking) => ({ key: `${dayKey(new Date(booking.startsAt))}|${String(new Date(booking.startsAt).getHours()).padStart(2, '0')}:${String(new Date(booking.startsAt).getMinutes()).padStart(2, '0')}`, startsAt: booking.startsAt }));
  },
};

export const clientMessagesService = {
  async listConversations() {
    await delay();
    return state.conversations.map((conversation) => ({ ...conversation }));
  },

  markRead(id) {
    const conversation = state.conversations.find((item) => item.id === id);
    if (conversation) conversation.unread = 0;
  },

  async send(conversationId, text, attachment = null) {
    await delay(200);
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (!conversation) throw new Error('Conversación no encontrada');
    const message = { id: `cm-${Date.now()}`, from: 'me', text, sentAt: new Date().toISOString(), attachment };
    conversation.messages.push(message);
    return { ...message };
  },

  async receiveAutoReply(conversationId) {
    await delay(1400);
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (!conversation) return null;
    const text = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
    const message = { id: `cm-${Date.now()}-r`, from: 'pro', text, sentAt: new Date().toISOString(), attachment: null };
    conversation.messages.push(message);
    return { conversationId, ...message };
  },
};

export const clientPaymentsService = {
  async list() {
    await delay();
    return [...state.payments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)).map((payment) => ({ ...payment }));
  },

  async summary() {
    await delay();
    const pagados = state.payments.filter((payment) => payment.status === 'pagado');
    const pendientes = state.payments.filter((payment) => payment.status === 'pendiente');
    const lastPagado = [...state.payments].filter((p) => p.status === 'pagado').sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0] || null;
    return {
      totalPaid: pagados.reduce((sum, payment) => sum + payment.amount, 0),
      pendingAmount: pendientes.reduce((sum, payment) => sum + payment.amount, 0),
      pendingCount: pendientes.length,
      lastPayment: lastPagado ? { ...lastPagado } : null,
    };
  },
};

export const clientProfileService = {
  async get() {
    await delay();
    return { ...state.patientProfile };
  },

  async update(patch) {
    await delay();
    state.patientProfile = { ...state.patientProfile, ...patch };
    return { ...state.patientProfile };
  },
};
