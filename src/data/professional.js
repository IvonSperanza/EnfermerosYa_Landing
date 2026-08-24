export const PROFESSIONAL = {
  id: 'pro-001',
  firstName: 'María',
  lastName: 'González',
  profession: 'medico',
  specialty: 'Clínica',
  licenseNumber: 'MP 123456',
  licenseProvince: 'CABA',
  verificationStatus: 'verified',
  availabilityStatus: 'online',
  avatar: null,
  description:
    'Médica clínica con enfoque en atención primaria y acompañamiento de pacientes crónicos. Me caracterizo por una escucha atenta, explicaciones claras y un seguimiento cercano de cada tratamiento.',
  experienceYears: 12,
  email: 'maria.gonzalez@enfermerosya.com',
  phone: '+54 9 11 4588-2210',
  birthDate: '1986-03-14',
  dni: '34.567.890',
  address: {
    street: 'Av. Cabildo',
    number: '1245',
    floor: '4',
    apartment: 'B',
    city: 'CABA',
    province: 'Buenos Aires',
    zipCode: 'C1426',
    zoneLabel: 'Belgrano, CABA',
    lat: -34.562,
    lng: -58.456,
  },
  acceptsHomeVisits: true,
  acceptsInOffice: true,
  acceptsOnline: true,
  showApproximateLocation: true,
  services: [
    { id: 'srv-1', name: 'Consulta clínica', price: 12000, durationMinutes: 30 },
    { id: 'srv-2', name: 'Control de salud integral', price: 15000, durationMinutes: 45 },
    { id: 'srv-3', name: 'E-consulta de seguimiento', price: 6000, durationMinutes: 20 },
  ],
  rating: 4.9,
  reviewsCount: 132,
};

export const VERIFICATION_DOCS = [
  { id: 'vdoc-1', kind: 'DNI', fileName: 'dni-frente-dorso.pdf', uploadedAt: '2026-06-02', status: 'verified' },
  { id: 'vdoc-2', kind: 'Matrícula', fileName: 'matricula-mp-123456.pdf', uploadedAt: '2026-06-02', status: 'verified' },
  { id: 'vdoc-3', kind: 'Título', fileName: 'titulo-universidad.pdf', uploadedAt: '2026-06-04', status: 'verified' },
  { id: 'vdoc-4', kind: 'Certificaciones', fileName: 'certificado-reanimacion.pdf', uploadedAt: '2026-07-18', status: 'pending' },
];

export function professionalFullName(professional = PROFESSIONAL) {
  return `${professional.firstName} ${professional.lastName}`;
}

export function professionalTitle(professional = PROFESSIONAL) {
  return professional.profession === 'medico' ? 'Médica' : 'Enfermero/a';
}
