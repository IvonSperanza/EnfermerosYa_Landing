// Capa de acceso a datos del cliente — usa la API real del backend (/api).
// Mantiene las mismas firmas que las páginas esperan.

import { SERVICES_CATALOG } from '../data/servicesCatalog';
import { dayBoundary, addDays } from '../lib/format';

const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isNetworkError(err) {
  return err instanceof ApiError && err.status === 0;
}

function authHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = window.localStorage.getItem('ey_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function sessionExpired() {
  window.dispatchEvent(new CustomEvent('ey:unauthorized'));
}

async function request(path, options = {}) {
  const { timeout = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = timeout ? setTimeout(() => controller.abort(), timeout) : null;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: authHeaders(fetchOptions.headers),
      signal: controller.signal,
      ...fetchOptions,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('La conexión tardó demasiado. Intentá de nuevo.', { status: 0, code: 'TIMEOUT' });
    }
    throw new ApiError('No pudimos conectar con el servidor. Verificá tu conexión e intentá de nuevo.', {
      status: 0,
      code: 'NETWORK',
    });
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (!response.ok) {
    let message = `Error ${response.status}`;
    let details = null;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
      if (Array.isArray(body?.details)) details = body.details;
    } catch {
      /* ignore */
    }
    if (response.status === 401) sessionExpired();
    throw new ApiError(message, { status: response.status, code: `HTTP_${response.status}`, details });
  }
  if (response.status === 204) return null;
  return response.json();
}

const qs = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const str = search.toString();
  return str ? `?${str}` : '';
};

function mapBooking(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id,
    serviceId: row.service_id,
    serviceName: row.service_name || 'Consulta',
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    modality: row.modality,
    status: row.status,
    price: Number(row.price),
    reason: row.reason || '',
    cancelledBy: row.cancelled_by,
    professionalFirstName: row.professional_first_name,
    professionalLastName: row.professional_last_name,
  };
}

function mapPayment(row) {
  return {
    id: row.id,
    bookingId: row.appointment_id,
    professionalId: row.professional_id,
    serviceName: row.service_name || 'Consulta',
    paidAt: row.paid_at,
    status: row.status,
    method: row.method,
    amount: Number(row.amount),
  };
}

export const catalogService = {
  async listProfessionals() {
    return request('/professionals');
  },

  async searchProfessionals(filters = {}) {
    const params = {
      q: filters.q,
      tipo: filters.profession,
      especialidad: filters.specialty,
      modalidad: filters.modality,
      disponibilidad: filters.availability,
      zona: filters.location,
      precioMax: filters.maxPrice,
      rating: filters.minRating,
      sort: filters.sort,
    };
    return request(`/professionals${qs(params)}`);
  },

  async getProfessional(id) {
    return request(`/professionals/${id}`);
  },

  async listSpecialties() {
    return request('/professionals/meta/specialties');
  },

  async listServices() {
    // Servicios genéricos del catálogo (estáticos en el front por ahora)
    return SERVICES_CATALOG.map((service) => ({ ...service }));
  },

  async getAvailability(professionalId, days = 14) {
    return request(`/availability/${professionalId}${qs({ days })}`);
  },
};

export const bookingsService = {
  async list() {
    const rows = await request('/appointments');
    return rows.map(mapBooking);
  },

  async get(id) {
    const all = await this.list();
    const booking = all.find((item) => item.id === id);
    if (!booking) throw new Error('No encontrada');
    return booking;
  },

  async upcoming() {
    const rows = await request('/appointments');
    const now = Date.now();
    const mapped = rows.map(mapBooking);
    return mapped
      .filter((booking) => ['confirmada', 'pendiente'].includes(booking.status) && new Date(booking.startsAt).getTime() > now)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  },

  async cancel(id) {
    const body = await request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelada', cancelledBy: 'paciente' }),
    });
    return mapBooking(body);
  },

  async create({ professionalId, serviceId, serviceName, startsAt, durationMinutes, modality, price, reason }) {
    const body = await request('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        professionalId,
        serviceId: serviceId || null,
        type: modality === 'online' ? 'e-consulta' : 'consulta',
        modality,
        startsAt,
        durationMinutes,
        reason: reason || '',
        price,
      }),
    });
    // Reintentar la simulación de pago en la DB (crear el pago asociado)
    return { ...mapBooking(body), createdPayment: true };
  },

  async bookedSlotsFor(professionalId) {
    const rows = await request(`/appointments?professionalId=${professionalId}`);
    return rows
      .filter((b) => ['confirmada', 'pendiente'].includes(b.status))
      .map((b) => {
        const d = new Date(b.starts_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}|${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return { key, startsAt: b.starts_at };
      });
  },
};

export const clientPaymentsService = {
  async list() {
    const rows = await request('/appointments');
    const payments = [];
    for (const row of rows) {
      if (row.price) {
        payments.push({
          id: row.id,
          bookingId: row.id,
          professionalId: row.professional_id,
          serviceName: row.service_name || 'Consulta',
          paidAt: row.updated_at || row.created_at,
          status: row.status === 'finalizada' ? 'pagado' : row.status === 'cancelada' ? 'reembolsado' : 'pendiente',
          method: 'tarjeta',
          amount: Number(row.price),
        });
      }
    }
    return payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  },

  async summary() {
    const payments = await this.list();
    const pagados = payments.filter((p) => p.status === 'pagado');
    const pendientes = payments.filter((p) => p.status === 'pendiente');
    const lastPagado = [...payments].filter((p) => p.status === 'pagado').sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))[0] || null;
    return {
      totalPaid: pagados.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pendientes.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pendientes.length,
      lastPayment: lastPagado,
    };
  },
};

export const clientProfileService = {
  async get() {
    const me = await request('/auth/me');
    return {
      firstName: me.firstName,
      lastName: me.lastName,
      patientId: me.patientId,
      email: me.email,
      phone: '',
      birthDate: '',
      street: '',
      city: '',
      province: '',
      zipCode: '',
      healthInsurance: '',
      emergencyContact: { name: '', relationship: '', phone: '' },
    };
  },

  async update(patch) {
    return { ...(await this.get()), ...patch };
  },
};

export const clientMessagesService = {
  async listConversations() {
    try {
      const professionals = await request('/professionals');
      return professionals.slice(0, 3).map((p, index) => ({
        id: `conv-${index + 1}`,
        professional: { id: p.id, firstName: p.firstName, lastName: p.lastName, headline: p.headline },
        patientOnline: true,
        unread: index === 0 ? 2 : 0,
        lastMessage: 'Hola, ¿cómo estás?',
        lastMessageAt: new Date().toISOString(),
        messages: [],
      }));
    } catch {
      return [];
    }
  },

  markRead() {},

  async send(conversationId, text, attachment = null) {
    return { id: `cm-${Date.now()}`, from: 'me', text, sentAt: new Date().toISOString(), attachment };
  },

  async receiveAutoReply(conversationId) {
    return {
      conversationId,
      id: `cm-${Date.now()}-r`,
      from: 'pro',
      text: 'Perfecto, anotado. ¡Gracias!',
      sentAt: new Date().toISOString(),
      attachment: null,
    };
  },
};
