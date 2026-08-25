/**
 * @typedef {Object} ClientProfessional
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {'medico'|'enfermero'} profession
 * @property {string} specialty
 * @property {string} headline
 * @property {'verified'|'pending'} verificationStatus
 * @property {number} rating
 * @property {number} reviewsCount
 * @property {number} consultationsCount
 * @property {number} experienceYears
 * @property {string} description
 * @property {string[]} modalities
 * @property {boolean} availableNow
 * @property {boolean} availableToday
 * @property {boolean} acceptsOnline
 * @property {string} city
 * @property {string} zone
 * @property {{street: string, city: string}} office
 * @property {number} priceFrom
 * @property {number} eConsultPrice
 * @property {string} licenseNumber
 * @property {string} reason
 * @property {{id: string, name: string, description: string, durationMinutes: number, price: number, modalities: string[]}[]} services
 */

/**
 * @typedef {Object} Specialty
 * @property {string} id
 * @property {string} name
 * @property {string} description
 */

/**
 * @typedef {Object} ServiceOffering
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} durationMinutes
 * @property {string[]} modalities
 * @property {number} priceFrom
 * @property {string} specialtyId
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} patientId
 * @property {string} professionalId
 * @property {string} serviceId
 * @property {string} serviceName
 * @property {string} startsAt ISO datetime
 * @property {number} durationMinutes
 * @property {'presencial'|'domicilio'|'online'} modality
 * @property {'confirmada'|'pendiente'|'cancelada'|'finalizada'} status
 * @property {number} price
 * @property {string} [reason]
 * @property {string} [cancelledBy]
 * @property {string} [sharedNotes] Notas visibles para el paciente
 * @property {{id: string, kind: string, fileName: string}[]} [documents]
 */

/**
 * @typedef {Object} ClientPayment
 * @property {string} id
 * @property {string} bookingId
 * @property {string} professionalId
 * @property {string} serviceName
 * @property {string} paidAt ISO datetime
 * @property {'pagado'|'pendiente'|'cancelado'|'reembolsado'} status
 * @property {'tarjeta'|'transferencia'|'mercado_pago'} method
 * @property {number} amount
 */

/**
 * @typedef {Object} ClientConversation
 * @property {string} id
 * @property {string} professionalId
 * @property {boolean} professionalOnline
 * @property {number} unread
 * @property {{id: string, from: 'pro'|'me', text: string, sentAt: string, attachment?: {name: string}|null}[]} messages
 */

export {};
