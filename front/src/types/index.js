/**
 * Contratos de datos del Portal del Personal de Salud.
 * El proyecto es JavaScript: estos typedefs documentan la forma esperada
 * por los servicios y componentes, y quedan listos para migrar a TypeScript
 * o validar contra la API real cuando exista backend.
 *
 * @typedef {'verified'|'pending'|'rejected'} VerificationStatus
 * @typedef {'online'|'busy'|'unavailable'|'offline'} AvailabilityStatus
 *
 * @typedef {Object} HealthcareProfessional
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {'medico'|'enfermero'} profession
 * @property {string} specialty
 * @property {string} licenseNumber
 * @property {string} licenseProvince
 * @property {VerificationStatus} verificationStatus
 * @property {AvailabilityStatus} availabilityStatus
 * @property {string|null} avatar
 * @property {string} description
 * @property {number} experienceYears
 * @property {string} email
 * @property {string} phone
 * @property {string} birthDate
 * @property {string} dni
 * @property {{street: string, number: string, floor: string, apartment: string, city: string, province: string, zipCode: string, zoneLabel: string, lat: number, lng: number}} address
 * @property {boolean} acceptsHomeVisits
 * @property {boolean} acceptsInOffice
 * @property {boolean} acceptsOnline
 * @property {boolean} showApproximateLocation
 * @property {{id: string, name: string, price: number, durationMinutes: number}[]} services
 * @property {number} rating
 * @property {number} reviewsCount
 *
 * @typedef {Object} Patient
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} birthDate
 * @property {number} age
 * @property {string} dni
 * @property {'activo'|'inactivo'} status
 * @property {string} phone
 * @property {string} email
 * @property {string} address
 * @property {{name: string, phone: string}} emergencyContact
 * @property {string} healthInsurance
 * @property {string|null} lastVisitAt
 * @property {string|null} nextVisitAt
 * @property {string|null} notes
 *
 * @typedef {'confirmada'|'pendiente'|'cancelada'|'en-curso'|'finalizada'} AppointmentStatus
 * @typedef {'presencial'|'domicilio'|'online'} AppointmentModality
 *
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} patientId
 * @property {string} startsAt ISO datetime
 * @property {number} durationMinutes
 * @property {string} type clave de APPOINTMENT_TYPES
 * @property {AppointmentModality} modality
 * @property {AppointmentStatus} status
 * @property {string} reason motivo de la consulta
 * @property {string} notes notas privadas del profesional
 * @property {number} price
 *
 * @typedef {Object} DayRange
 * @property {string} start "HH:mm"
 * @property {string} end "HH:mm"
 *
 * @typedef {Object} Availability
 * @property {Record<string, DayRange[]>} weekly horario semanal (1=lunes … 7=domingo)
 * @property {Record<string, DayRange[]>} eConsultWeekly franjas exclusivas para e-consultas
 * @property {number} appointmentDuration minutos por consulta
 * @property {number} bufferMinutes descanso entre consultas
 * @property {number} minBookingNoticeHours anticipación mínima de reserva
 * @property {string[]} blockedDates fechas "YYYY-MM-DD" bloqueadas
 * @property {{id: string, from: string, to: string, label: string}[]} leaves vacaciones y licencias
 *
 * @typedef {Object} Message
 * @property {string} id
 * @property {'pro'|'patient'} from
 * @property {string} text
 * @property {string} sentAt ISO datetime
 * @property {{name: string}|null} attachment adjunto mock
 *
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} patientId
 * @property {Message[]} messages
 * @property {boolean} unread
 * @property {boolean} patientOnline
 *
 * @typedef {'pagado'|'pendiente'|'cancelado'|'reembolsado'} PaymentStatus
 *
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} date ISO datetime
 * @property {string} patientId
 * @property {string} service
 * @property {'mercado_pago'|'transferencia'|'tarjeta'} method
 * @property {PaymentStatus} status
 * @property {number} amount
 *
 * @typedef {Object} MedicalDocument
 * @property {string} id
 * @property {string} patientId null para documentación del profesional
 * @property {'estudio'|'receta'|'informe'|'indicacion'} kind
 * @property {string} title
 * @property {string} uploadedAt ISO datetime
 * @property {'verified'|'pending'|'rejected'} status
 * @property {string} size etiqueta de tamaño mock
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'appointment'|'message'|'payment'|'system'} kind
 * @property {string} title
 * @property {string} body
 * @property {string} sentAt ISO datetime
 * @property {boolean} read
 */
export {};
