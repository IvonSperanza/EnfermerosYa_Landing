import { INITIAL_APPOINTMENTS } from '../data/appointments';
import { INITIAL_AVAILABILITY } from '../data/availability';
import { INITIAL_DOCUMENTS } from '../data/documents';
import { INITIAL_CONVERSATIONS, AUTO_REPLIES } from '../data/messages';
import { PATIENTS } from '../data/patients';
import { INITIAL_PAYMENTS, MONTHLY_REVENUE } from '../data/payments';
import { PROFESSIONAL, VERIFICATION_DOCS } from '../data/professional';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

const LATENCY_MS = 350;

function delay(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(typeof value === 'function' ? value() : value), LATENCY_MS);
  });
}

const state = {
  professional: { ...PROFESSIONAL },
  verificationDocs: VERIFICATION_DOCS.map((doc) => ({ ...doc })),
  patients: PATIENTS.map((patient) => ({ ...patient })),
  appointments: INITIAL_APPOINTMENTS.map((appointment) => ({ ...appointment })),
  availability: JSON.parse(JSON.stringify(INITIAL_AVAILABILITY)),
  conversations: INITIAL_CONVERSATIONS.map((conversation) => ({
    ...conversation,
    messages: conversation.messages.map((message) => ({ ...message })),
  })),
  payments: INITIAL_PAYMENTS.map((payment) => ({ ...payment })),
  documents: INITIAL_DOCUMENTS.map((document) => ({ ...document })),
  notifications: INITIAL_NOTIFICATIONS.map((notification) => ({ ...notification })),
};

let idCounter = 100;
const nextId = (prefix) => `${prefix}-${(idCounter += 1)}`;

export const profileService = {
  getProfile: () => delay(() => ({ ...state.professional })),
  updateProfile: (patch) =>
    delay(() => {
      state.professional = {
        ...state.professional,
        ...patch,
        address: { ...state.professional.address, ...(patch.address || {}) },
      };
      return { ...state.professional };
    }),
  updateVerificationDoc: (docId, patch) =>
    delay(() => {
      const index = state.verificationDocs.findIndex((doc) => doc.id === docId);
      if (index !== -1) {
        state.verificationDocs[index] = { ...state.verificationDocs[index], ...patch };
      }
      return [...state.verificationDocs];
    }),
};

export const patientsService = {
  list: () => delay(() => state.patients.map((patient) => ({ ...patient }))),
  get: (id) =>
    delay(() => {
      const patient = state.patients.find((item) => item.id === id);
      if (!patient) throw new Error('Paciente no encontrado');
      return { ...patient };
    }),
};

export const appointmentsService = {
  list: () => delay(() => state.appointments.map((appointment) => ({ ...appointment }))),
  create: (appointment) =>
    delay(() => {
      const created = { ...appointment, id: nextId('apt') };
      state.appointments = [...state.appointments, created];

      const patient = state.patients.find((item) => item.id === created.patientId);
      if (patient && (!patient.nextVisitAt || new Date(created.startsAt) < new Date(patient.nextVisitAt))) {
        patient.nextVisitAt = created.startsAt;
      }
      return { ...created };
    }),
  cancel: (id) =>
    delay(() => {
      const index = state.appointments.findIndex((appointment) => appointment.id === id);
      if (index === -1) throw new Error('Consulta no encontrada');
      state.appointments[index] = { ...state.appointments[index], status: 'cancelada' };
      return { ...state.appointments[index] };
    }),
  saveNotes: (id, notes) =>
    delay(() => {
      const index = state.appointments.findIndex((appointment) => appointment.id === id);
      if (index === -1) throw new Error('Consulta no encontrada');
      state.appointments[index] = { ...state.appointments[index], notes };
      return { ...state.appointments[index] };
    }),
};

export const availabilityService = {
  get: () => delay(() => JSON.parse(JSON.stringify(state.availability))),
  save: (availability) =>
    delay(() => {
      state.availability = JSON.parse(JSON.stringify(availability));
      return availability;
    }),
};

export const messagesService = {
  listConversations: () =>
    delay(() =>
      state.conversations.map((conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) => ({ ...message })),
      })),
    ),
  markRead: (conversationId) => {
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (conversation) conversation.unread = false;
  },
  send: (conversationId, text, attachment = null) =>
    new Promise((resolve) => {
      const message = {
        id: nextId('m'),
        from: 'pro',
        text,
        sentAt: new Date().toISOString(),
        attachment,
      };
      const conversation = state.conversations.find((item) => item.id === conversationId);
      if (conversation) conversation.messages.push(message);
      setTimeout(() => resolve({ ...message }), 180);
    }),
  receiveAutoReply: (conversationId) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const reply = {
          id: nextId('m'),
          from: 'patient',
          text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
          sentAt: new Date().toISOString(),
          attachment: null,
        };
        const conversation = state.conversations.find((item) => item.id === conversationId);
        if (conversation) conversation.messages.push(reply);
        resolve(reply ? { ...reply, conversationId } : null);
      }, 1400);
    }),
};

export const paymentsService = {
  list: () => delay(() => state.payments.map((payment) => ({ ...payment }))),
  monthlyRevenue: () => delay(() => MONTHLY_REVENUE.map((entry) => ({ ...entry }))),
};

export const documentsService = {
  listByPatient: (patientId) =>
    delay(() =>
      state.documents
        .filter((document) => document.patientId === patientId)
        .map((document) => ({ ...document })),
    ),
  upload: ({ patientId, kind, title }) =>
    delay(() => {
      const document = {
        id: nextId('doc'),
        patientId,
        kind,
        title,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        size: `${Math.floor(Math.random() * 3) + 1},${Math.floor(Math.random() * 9)} MB`,
      };
      state.documents = [document, ...state.documents];
      return { ...document };
    }),
  remove: (documentId) =>
    delay(() => {
      state.documents = state.documents.filter((document) => document.id !== documentId);
      return true;
    }),
};

export const notificationsService = {
  list: () => delay(() => state.notifications.map((notification) => ({ ...notification }))),
  markAllRead: () =>
    delay(() => {
      state.notifications = state.notifications.map((notification) => ({ ...notification, read: true }));
      return true;
    }),
};
