import { pool } from '../src/db/pool.js';
import { hashPassword } from '../src/lib/auth.js';

// Datos coherentes con los mocks del frontend
// (front/src/data/clientProfessionals.js, professional.js, patients.js, specialties.js).
// Las contraseñas de los usuarios seed son todas "enfermerosya123".

const SEED_PASSWORD = 'enfermerosya123';
const PRO_PHONE = '+54 9 11 0000-0000';

// --- Especialidades (id = slug en el front) --------------------------------
const SPECIALTIES = [
  ['Clínica Médica', 'clinica-medica', 1],
  ['Pediatría', 'pediatria', 2],
  ['Cardiología', 'cardiologia', 3],
  ['Dermatología', 'dermatologia', 4],
  ['Salud Mental', 'salud-mental', 5],
  ['Geriatría', 'geriatria', 6],
  ['Enfermería General', 'enfermeria-general', 7],
  ['Cuidados Domiciliarios', 'cuidados-domiciliarios', 8],
];

// --- Profesionales (espejo de CLIENT_PROFESSIONALS) ------------------------
// pro-001 incluye los detalles extra del perfil detallado (professional.js).
const PROFESSIONALS = [
  {
    frontId: 'pro-001',
    firstName: 'María',
    lastName: 'González',
    profession: 'medico',
    specialty: 'clinica-medica',
    headline: 'Médica Clínica',
    licenseNumber: 'MP 123456',
    licenseProvince: 'CABA',
    verificationStatus: 'verified',
    birthDate: '1986-03-14',
    dni: '34.567.890',
    rating: 4.9,
    reviewsCount: 132,
    consultationsCount: 860,
    experienceYears: 12,
    description:
      'Médica clínica con enfoque en atención primaria y acompañamiento de pacientes crónicos. Me caracterizo por una escucha atenta, explicaciones claras y un seguimiento cercano de cada tratamiento.',
    modalities: ['presencial', 'domicilio', 'online'],
    availableNow: true,
    availableToday: true,
    status: 'disponible',
    address: {
      street: 'Av. Cabildo', number: '1245', floor: '4', apartment: 'B',
      city: 'CABA', province: 'Buenos Aires', zipCode: 'C1426',
      zone: 'Belgrano · Palermo · Colegiales', lat: -34.562, lng: -58.456,
    },
    showApproximateLocation: true,
    priceFrom: 12000,
    eConsultPrice: 6000,
    services: [
      { name: 'Consulta clínica', description: 'Evaluación completa en consultorio con indicaciones y estudios si corresponden.', durationMinutes: 30, price: 12000, modalities: ['presencial', 'domicilio'] },
      { name: 'Control de salud integral', description: 'Chequeo preventivo con revisión de historia clínica y plan de cuidado personalizado.', durationMinutes: 45, price: 15000, modalities: ['presencial'] },
      { name: 'E-consulta de seguimiento', description: 'Seguimiento por chat de tratamientos en curso, con respuesta inmediata.', durationMinutes: 20, price: 6000, modalities: ['online'] },
    ],
  },
  {
    frontId: 'pro-002',
    firstName: 'Diego',
    lastName: 'Ramírez',
    profession: 'enfermero',
    specialty: 'enfermeria-general',
    headline: 'Enfermero Profesional',
    licenseNumber: 'EN 78412',
    licenseProvince: 'CABA',
    verificationStatus: 'verified',
    rating: 4.8,
    reviewsCount: 98,
    consultationsCount: 540,
    experienceYears: 9,
    description:
      'Enfermero profesional matriculado con amplia experiencia en cuidados domiciliarios, curaciones y aplicación de medicación. Trabajo con trato cercano y explicando cada paso al paciente y su familia.',
    modalities: ['domicilio', 'online'],
    availableNow: true,
    availableToday: true,
    status: 'disponible',
    office: { street: 'Atención únicamente a domicilio', city: 'CABA' },
    zone: 'Palermo · Villa Crespo · Chacarita',
    priceFrom: 8000,
    eConsultPrice: 4500,
    services: [
      { name: 'Control de signos vitales', description: 'Medición de presión arterial, glucemia, saturación y temperatura con registro para tu médico.', durationMinutes: 20, price: 7500, modalities: ['domicilio'] },
      { name: 'Curaciones', description: 'Curación de heridas superficiales y complejas con materiales descartables incluidos.', durationMinutes: 40, price: 11000, modalities: ['domicilio'] },
      { name: 'Aplicación de medicación', description: 'Aplicación de inyectables y administración de tratamiento prescripto.', durationMinutes: 20, price: 8500, modalities: ['domicilio', 'online'] },
    ],
  },
  {
    frontId: 'pro-003',
    firstName: 'Carolina',
    lastName: 'Ferreyra',
    profession: 'medico',
    specialty: 'pediatria',
    headline: 'Médica Pediatra',
    licenseNumber: 'MP 98221',
    licenseProvince: 'CABA',
    verificationStatus: 'verified',
    rating: 4.9,
    reviewsCount: 210,
    consultationsCount: 1240,
    experienceYears: 15,
    description:
      'Pediatra con enfoque en acompañamiento familiar. Atiendo niños y adolescentes desde un enfoque integral, priorizando la escucha y las explicaciones claras para los papás.',
    modalities: ['presencial', 'online'],
    availableNow: false,
    availableToday: true,
    status: 'ocupado',
    office: { street: 'Vuelta de Obligado 2850, PB', city: 'CABA' },
    zone: 'Belgrano · Núñez',
    priceFrom: 16000,
    eConsultPrice: 8000,
    services: [
      { name: 'Consulta pediátrica', description: 'Consulta presencial para bebés, niños y adolescentes con controles de crecimiento.', durationMinutes: 30, price: 16000, modalities: ['presencial'] },
      { name: 'Control de niño sano', description: 'Control pediátrico programado con curvas de crecimiento y calendario de vacunas.', durationMinutes: 40, price: 18000, modalities: ['presencial'] },
      { name: 'E-consulta pediátrica', description: 'Resolvé dudas sobre salud infantil por chat, con guía de cuándo asistir presencialmente.', durationMinutes: 20, price: 8000, modalities: ['online'] },
    ],
  },
  {
    frontId: 'pro-004',
    firstName: 'Andrés',
    lastName: 'Molina',
    profession: 'medico',
    specialty: 'cardiologia',
    headline: 'Médico Cardiólogo',
    licenseNumber: 'MP 65120',
    licenseProvince: 'CABA',
    verificationStatus: 'verified',
    rating: 4.7,
    reviewsCount: 76,
    consultationsCount: 430,
    experienceYears: 18,
    description:
      'Cardiólogo clínico especializado en prevención cardiovascular y manejo de hipertensión. Estudios cardiológicos completos en consultorio.',
    modalities: ['presencial'],
    availableNow: false,
    availableToday: false,
    status: 'offline',
    office: { street: 'Av. Santa Fe 3120, 6º A', city: 'CABA' },
    zone: 'Recoleta · Barrio Norte',
    priceFrom: 22000,
    eConsultPrice: 0,
    services: [
      { name: 'Consulta cardiológica', description: 'Evaluación cardiovascular completa con electrocardiograma incluido.', durationMinutes: 45, price: 22000, modalities: ['presencial'] },
      { name: 'Control de hipertensión', description: 'Seguimiento de presión arterial con ajuste de tratamiento y monitoreo.', durationMinutes: 30, price: 17000, modalities: ['presencial'] },
    ],
  },
  {
    frontId: 'pro-005',
    firstName: 'Silvina',
    lastName: 'Ocampo',
    profession: 'medico',
    specialty: 'dermatologia',
    headline: 'Médica Dermatóloga',
    licenseNumber: 'MP 88730',
    licenseProvince: 'Buenos Aires',
    verificationStatus: 'verified',
    rating: 4.6,
    reviewsCount: 143,
    consultationsCount: 720,
    experienceYears: 11,
    description:
      'Dermatología clínica y preventiva. Diagnóstico y tratamiento de lesiones de piel, acné, dermatitis y controles anuales de lunares.',
    modalities: ['presencial', 'online'],
    availableNow: false,
    availableToday: true,
    status: 'disponible',
    office: { street: 'Maipú 1842, 2º A', city: 'Vicente López' },
    zone: 'Vicente López · Olivos',
    priceFrom: 20000,
    eConsultPrice: 9000,
    services: [
      { name: 'Consulta dermatológica', description: 'Diagnóstico y tratamiento de afecciones de piel, cabello y uñas.', durationMinutes: 30, price: 20000, modalities: ['presencial'] },
      { name: 'Control de lunares', description: 'Dermatoscopia anual para prevención y detección temprana.', durationMinutes: 30, price: 24000, modalities: ['presencial'] },
      { name: 'E-consulta dermatológica', description: 'Evaluación de imágenes de lesiones o erupciones con recomendaciones iniciales.', durationMinutes: 20, price: 9000, modalities: ['online'] },
    ],
  },
  {
    frontId: 'pro-006',
    firstName: 'Enrique',
    lastName: 'Ferrer',
    profession: 'enfermero',
    specialty: 'cuidados-domiciliarios',
    headline: 'Enfermero Geriátrico',
    licenseNumber: 'EN 51207',
    licenseProvince: 'Buenos Aires',
    verificationStatus: 'verified',
    rating: 4.9,
    reviewsCount: 167,
    consultationsCount: 980,
    experienceYears: 22,
    description:
      'Especialista en cuidados gerontológicos a domicilio. Acompañamiento de adultos mayores, movilización, higiene y confort con protocolos de seguridad.',
    modalities: ['domicilio'],
    availableNow: false,
    availableToday: false,
    status: 'offline',
    office: { street: 'Atención únicamente a domicilio', city: 'GBA Norte' },
    zone: 'Vicente López · San Isidro',
    priceFrom: 10000,
    eConsultPrice: 0,
    services: [
      { name: 'Cuidados domiciliarios', description: 'Atención integral en el hogar: higiene, movilización, prevención de úlceras y compañía.', durationMinutes: 60, price: 13000, modalities: ['domicilio'] },
      { name: 'Control de signos vitales', description: 'Monitoreo regular de constantes vitales con informe para el médico tratante.', durationMinutes: 20, price: 8000, modalities: ['domicilio'] },
    ],
  },
  {
    frontId: 'pro-007',
    firstName: 'Valeria',
    lastName: 'Sosa',
    profession: 'medico',
    specialty: 'salud-mental',
    headline: 'Médica Psiquiatra',
    licenseNumber: 'MP 104556',
    licenseProvince: 'CABA',
    verificationStatus: 'verified',
    rating: 4.8,
    reviewsCount: 89,
    consultationsCount: 610,
    experienceYears: 14,
    description:
      'Psiquiatría clínica con abordaje humano y basado en evidencia. Ansiedad, depresión, trastornos del sueño y acompañamiento psicofarmacológico.',
    modalities: ['presencial', 'online'],
    availableNow: true,
    availableToday: true,
    status: 'disponible',
    office: { street: 'Bulnes 1240, 3º C', city: 'CABA' },
    zone: 'Almagro · Balvanera',
    priceFrom: 25000,
    eConsultPrice: 12000,
    services: [
      { name: 'Consulta psiquiátrica', description: 'Entrevista de evaluación diagnóstica y plan terapéutico.', durationMinutes: 45, price: 25000, modalities: ['presencial', 'online'] },
      { name: 'Seguimiento de pacientes', description: 'Consultas de seguimiento para ajuste de tratamiento en curso.', durationMinutes: 30, price: 18000, modalities: ['presencial', 'online'] },
    ],
  },
  {
    frontId: 'pro-008',
    firstName: 'Roberto',
    lastName: 'Quintero',
    profession: 'medico',
    specialty: 'geriatria',
    headline: 'Médico Geriatra',
    licenseNumber: 'MP 77109',
    licenseProvince: 'CABA',
    verificationStatus: 'verified',
    rating: 4.7,
    reviewsCount: 64,
    consultationsCount: 380,
    experienceYears: 20,
    description:
      'Geriatría integral: evaluación cognitiva, polimedicación, caídas y planificación del cuidado de personas mayores junto a sus familias.',
    modalities: ['presencial', 'domicilio', 'online'],
    availableNow: false,
    availableToday: true,
    status: 'disponible',
    office: { street: 'Rivadavia 4920, 1º B', city: 'CABA' },
    zone: 'Caballito · Flores',
    priceFrom: 21000,
    eConsultPrice: 9500,
    services: [
      { name: 'Consulta geriátrica', description: 'Evaluación integral del adulto mayor con informe para la familia.', durationMinutes: 45, price: 21000, modalities: ['presencial', 'domicilio'] },
      { name: 'Consulta a domicilio', description: 'Atención geriátrica en la casa del paciente cuando trasladarse es difícil.', durationMinutes: 60, price: 26000, modalities: ['domicilio'] },
      { name: 'E-consulta geriátrica', description: 'Orientación remota para familiares cuidadores sobre el día a día.', durationMinutes: 25, price: 9500, modalities: ['online'] },
    ],
  },
  {
    frontId: 'pro-009',
    firstName: 'Lucía',
    lastName: 'Herrera',
    profession: 'enfermero',
    specialty: 'enfermeria-general',
    headline: 'Enfermera Profesional',
    licenseNumber: 'EN 99384',
    licenseProvince: 'CABA',
    verificationStatus: 'pending',
    rating: 4.5,
    reviewsCount: 31,
    consultationsCount: 120,
    experienceYears: 5,
    description:
      'Enfermera profesional con foco en cuidados ambulatorios: curaciones, vacunas, controles y educación al paciente para el autocuidado.',
    modalities: ['presencial', 'domicilio', 'online'],
    availableNow: true,
    availableToday: true,
    status: 'disponible',
    office: { street: 'Avenida Ricardo Balbín 2450', city: 'CABA' },
    zone: 'Saavedra · Nuñez',
    priceFrom: 7000,
    eConsultPrice: 4000,
    services: [
      { name: 'Consulta de enfermería', description: 'Valoración de cuidados necesarios y plan de atención de enfermería.', durationMinutes: 30, price: 7000, modalities: ['presencial', 'online'] },
      { name: 'Aplicación de medicación', description: 'Colocación de inyectables y control de tratamiento indicado.', durationMinutes: 20, price: 6500, modalities: ['domicilio'] },
    ],
  },
];

// --- Pacientes (espejo de patients.js: pat-001 a pat-003) ------------------
const PATIENTS = [
  {
    frontId: 'pat-001', firstName: 'María', lastName: 'López',
    email: 'maria.lopez@gmail.com', phone: '+54 9 11 6325-8847',
    birthDate: '1958-11-02', dni: '12.789.456', healthInsurance: 'OSDE 210',
    address: 'Virrey del Pino 2380, 3º A', city: 'CABA',
    emergencyName: 'Jorge López (hijo)', emergencyPhone: '+54 9 11 5540-1928',
    notes: 'Hipertensa controlada. Prefiere turnos por la tarde.',
  },
  {
    frontId: 'pat-002', firstName: 'Carlos', lastName: 'Pérez',
    email: 'carlosperez@outlook.com', phone: '+54 9 11 4412-9033',
    birthDate: '1970-05-21', dni: '20.334.112', healthInsurance: 'Swiss Medical',
    address: 'Monroe 1875', city: 'CABA',
    emergencyName: 'Lucía Pérez', emergencyPhone: '+54 9 11 6620-4471',
    notes: 'Seguimiento de colesterol y presión anual.',
  },
  {
    frontId: 'pat-003', firstName: 'Rosa', lastName: 'Fernández',
    email: 'rosafernandez@yahoo.com.ar', phone: '+54 9 11 2287-5566',
    birthDate: '1949-08-30', dni: '8.992.331', healthInsurance: 'IOMA',
    address: 'Ciudad de la Paz 2450', city: 'Vicente López',
    emergencyName: 'Ana Fernández (hija)', emergencyPhone: '+54 9 11 4778-2290',
    notes: 'Movilidad reducida. Atención siempre a domicilio.',
  },
];

// --- Utilidades -------------------------------------------------------------
function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function mapStatus(status) {
  if (status === 'disponible' || status === 'online') return 'online';
  if (status === 'ocupado') return 'disponible';
  return 'offline';
}

function mapModality(modalities) {
  if (modalities.includes('online')) return 'online';
  if (modalities.includes('domicilio')) return 'domicilio';
  return 'presencial';
}

function parseAddress(office) {
  const match = office?.street?.match(/^(.*?)\s+(\d+)(?:\s*,\s*(.*))?$/);
  if (!match) {
    return { street: office?.street ?? null, number: null, floor: null, apartment: null };
  }
  let floor = null;
  let apartment = null;
  const rest = match[3] ?? null;
  if (rest) {
    const aptMatch = rest.match(/([0-9º]+\s*[A-Za-z]?|[A-Za-z]+)$/);
    if (aptMatch && /[A-Za-z]/.test(aptMatch[1])) apartment = aptMatch[1];
    else floor = rest;
  }
  return { street: match[1], number: match[2], floor, apartment };
}

// --- Seed principal ---------------------------------------------------------
async function seed() {
  const seededHash = await hashPassword(SEED_PASSWORD);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `TRUNCATE appointments, payments, notifications, availability_weekly, availability_settings,
       conversations, messages, documents, services, verification_documents,
       availability_blocked_dates, availability_leaves, patient_profiles, professional_profiles, users
       CASCADE;`,
    );
    // Especialidades (idempotente por slug)
    for (const [name, slug, order] of SPECIALTIES) {
      await client.query(
        `INSERT INTO specialties (name, slug, sort_order) VALUES ($1,$2,$3)
         ON CONFLICT (slug) DO NOTHING`,
        [name, slug, order],
      );
    }
    const specRows = await client.query('SELECT id, slug FROM specialties');
    const specialtyId = Object.fromEntries(specRows.rows.map((r) => [r.slug, r.id]));

    // Usuarios y perfiles profesionales
    const proMap = {};   // frontId -> { userId, profileId, services: [{id, name, price, durationMinutes, modality}] }
    const patMap = {};   // frontId -> { userId, profileId }

    for (const pro of PROFESSIONALS) {
      const email = `${slugify(pro.firstName)}.${slugify(pro.lastName)}@enfermerosya.com`;
      const proUser = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
         VALUES ($1,$2,$3,$4,$5,'professional')
         ON CONFLICT (email) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [email, seededHash, pro.firstName, pro.lastName, PRO_PHONE],
      );

      const base = pro.address ?? {} ;
      const parsed = pro.office
        ? parseAddress(pro.office)
        : { street: base.street, number: base.number, floor: base.floor, apartment: base.apartment };
      const acceptsHome = pro.modalities.includes('domicilio');
      const acceptsOffice = pro.modalities.includes('presencial');
      const acceptsOnline = pro.modalities.includes('online');

      const profile = await client.query(
        `INSERT INTO professional_profiles
          (user_id, profession, specialty_id, license_number, license_province, verification_status,
           availability_status, headline, description, experience_years, birth_date, dni,
           rating, reviews_count, consultations_count,
           address_street, address_number, address_floor, address_apartment, address_city,
           address_province, address_zip_code, address_zone, latitude, longitude,
           show_approximate_location, accepts_home_visits, accepts_in_office, accepts_online,
           available_now, available_today, price_from, e_consult_price)
         VALUES
           ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
            $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
         RETURNING id`,
        [
          proUser.rows[0].id, pro.profession, specialtyId[pro.specialty],
          pro.licenseNumber, pro.licenseProvince ?? 'CABA', pro.verificationStatus ?? 'verified',
          mapStatus(pro.status), pro.headline, pro.description, pro.experienceYears,
          pro.birthDate ?? null, pro.dni ?? null,
          pro.rating ?? 0, pro.reviewsCount ?? 0, pro.consultationsCount ?? 0,
          parsed.street ?? base.street ?? null, parsed.number ?? base.number ?? null,
          parsed.floor ?? base.floor ?? null, parsed.apartment ?? base.apartment ?? null,
          pro.office?.city ?? base.city ?? null,
          base.province ?? 'Buenos Aires', base.zipCode ?? null, pro.zone ?? null,
          base.lat ?? null, base.lng ?? null,
          base.showApproximateLocation ?? false, acceptsHome, acceptsOffice, acceptsOnline,
          pro.availableNow ?? false, pro.availableToday ?? true,
          round2(pro.priceFrom ?? 0), round2(pro.eConsultPrice ?? 0),
        ],
      );

      const services = [];
      for (const svc of pro.services) {
        const modality = mapModality(svc.modalities);
        const result = await client.query(
          `INSERT INTO services (professional_id, name, description, price, duration_minutes, modality, is_e_consult, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,true)
           RETURNING id`,
          [
            profile.rows[0].id, svc.name, svc.description,
            round2(svc.price), svc.durationMinutes, modality, modality === 'online',
          ],
        );
        services.push({ id: result.rows[0].id, name: svc.name, price: round2(svc.price), durationMinutes: svc.durationMinutes, modality });
      }

      proMap[pro.frontId] = {
        userId: proUser.rows[0].id,
        profileId: profile.rows[0].id,
        services,
      };
    }

    // Usuarios y perfiles de pacientes
    for (const pat of PATIENTS) {
      const patUser = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
         VALUES ($1,$2,$3,$4,$5,'patient')
         ON CONFLICT (email) DO UPDATE SET updated_at = now()
         RETURNING id`,
        [pat.email, seededHash, pat.firstName, pat.lastName, pat.phone],
      );
      const patProfile = await client.query(
        `INSERT INTO patient_profiles
          (user_id, birth_date, dni, health_insurance, address_street, address_city, address_province,
           emergency_contact_name, emergency_contact_phone, notes)
         VALUES ($1,$2,$3,$4,$5,$6,'Buenos Aires',$7,$8,$9)
         RETURNING id`,
        [patUser.rows[0].id, pat.birthDate, pat.dni, pat.healthInsurance, pat.address, pat.city,
          pat.emergencyName, pat.emergencyPhone, pat.notes],
      );
      patMap[pat.frontId] = {
        userId: patUser.rows[0].id,
        profileId: patProfile.rows[0].id,
      };
    }

    // Disponibilidad semanal para María González (pro-001)
    const maria = proMap['pro-001'];
    const weekly = [
      [1, '08:00', '12:00', false], [1, '16:00', '20:00', false], [1, '18:00', '21:00', true],
      [2, '08:00', '13:00', false],
      [3, '08:00', '12:00', false], [3, '16:00', '20:00', false], [3, '18:00', '21:00', true],
      [4, '09:00', '14:00', false],
      [5, '09:00', '15:00', false], [5, '15:00', '19:00', true],
      [6, '09:00', '13:00', false],
      [7, '10:00', '12:00', true],
    ];
    for (const [wd, start, end, econsult] of weekly) {
      await client.query(
        `INSERT INTO availability_weekly (professional_id, weekday, start_time, end_time, is_e_consult)
         VALUES ($1,$2,$3,$4,$5)`,
        [maria.profileId, wd, start, end, econsult],
      );
    }

    await client.query(
      `INSERT INTO availability_settings
        (professional_id, appointment_duration, buffer_minutes, min_booking_notice_hours,
         e_consult_enabled, e_consult_duration, e_consult_price)
       VALUES ($1,30,10,4,true,20,6000)`,
      [maria.profileId],
    );

    // Citas de ejemplo para María González (pro-001)
    const byName = Object.fromEntries(maria.services.map((s) => [s.name, s]));
    const appointments = [
      { pat: 'pat-001', type: 'control', modality: 'presencial', status: 'confirmada', offsetDays: 2,
        service: byName['Control de salud integral'], duration: 45, price: 15000,
        reason: 'Control de presión arterial y revisión de medicación.', startTime: '10:00' },
      { pat: 'pat-002', type: 'consulta', modality: 'online', status: 'finalizada', offsetDays: -2,
        service: byName['E-consulta de seguimiento'], duration: 20, price: 6000,
        reason: 'Consulta por chat sobre resultados de laboratorio.', startTime: '16:00' },
      { pat: 'pat-003', type: 'consulta', modality: 'domicilio', status: 'confirmada', offsetDays: 5,
        service: byName['Consulta clínica'], duration: 30, price: 12000,
        reason: 'Rosa prefiere atención a domicilio.', startTime: '09:00' },
      { pat: 'pat-002', type: 'control', modality: 'presencial', status: 'finalizada', offsetDays: -10,
        service: byName['Control de salud integral'], duration: 45, price: 15000,
        reason: 'Seguimiento anual de colesterol y presión.', startTime: '11:00' },
    ];

    for (const a of appointments) {
      const start = new Date();
      start.setDate(start.getDate() + a.offsetDays);
      const [hh, mm] = a.startTime.split(':');
      start.setHours(Number(hh), Number(mm), 0, 0);
      const end = new Date(start.getTime() + a.duration * 60000);

      const apt = await client.query(
        `INSERT INTO appointments
          (professional_id, patient_id, service_id, type, modality, status, starts_at, ends_at,
           duration_minutes, price, reason)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [maria.profileId, patMap[a.pat].profileId, a.service.id,
          a.type, a.modality, a.status, start.toISOString(), end.toISOString(),
          a.duration, a.price, a.reason],
      );
      await client.query(
        `INSERT INTO payments (appointment_id, professional_id, service_name, amount, method, status, paid_at)
         VALUES ($1,$2,$3,$4,$5,$6::payment_status, CASE WHEN $6 = 'pagado' THEN now() ELSE NULL END)`,
        [apt.rows[0].id, maria.profileId, a.service.name, a.price, 'tarjeta',
          a.status === 'finalizada' || a.status === 'confirmada' ? 'pagado' : 'pendiente'],
      );
    }

    // Notificación de ejemplo para la profesional
    await client.query(
      `INSERT INTO notifications (user_id, kind, title, body)
       VALUES ($1,'appointment','Nueva consulta confirmada','Rosa Fernández confirmó la visita a domicilio de mañana a las 09:00.')`,
      [maria.userId],
    );

    // Documentos de verificación de María González (pro-001)
    const VERIFICATION_DOCS = [
      ['dni', 'dni-frente-dorso.pdf', 'verified', 4],
      ['matricula', 'matricula-mp-123456.pdf', 'verified', 4],
      ['titulo', 'titulo-universidad.pdf', 'verified', 2],
      ['certificaciones', 'certificado-reanimacion.pdf', 'pending', 0],
    ];
    for (const [kind, fileName, status, daysAgo] of VERIFICATION_DOCS) {
      await client.query(
        `INSERT INTO verification_documents (professional_id, kind, file_name, status, uploaded_at)
         VALUES ($1,$2,$3,$4, now() - make_interval(days => $5))`,
        [maria.profileId, kind, fileName, status, daysAgo],
      );
    }

    // Conversaciones + mensajes entre María y sus pacientes
    const CONVERSATIONS = [
      {
        patient: 'pat-001',
        messages: [
          ['patient', 'Buenas tardes, doctora. Desde ayer me siento un poco mareada.', -180],
          ['professional', 'Hola María. ¿Te mediste la presión hoy? Pasame los valores.', -170],
          ['patient', 'Sí, dos veces: 150/95 y 148/92.', -150],
          ['patient', 'Una consulta, ¿puedo tomar mate igual?', -12],
        ],
      },
      {
        patient: 'pat-002',
        messages: [
          ['patient', 'Doctora, me llegó el resultado del laboratorio.', -1560],
          ['professional', '¡Hola Carlos! Enviámelo acá cuando puedas y lo revisamos.', -1500],
          ['patient', 'Listo, quedo a la espera del turno. Gracias.', -1330],
        ],
      },
      {
        patient: 'pat-003',
        messages: [
          ['patient', 'Buenas! Quería confirmar la visita a domicilio de mañana.', -60],
          ['professional', 'Hola Rosa, confirmado a las 09:00. Nos vemos mañana.', -50],
          ['patient', '¡Perfecto, muchas gracias!', -40],
        ],
      },
    ];
    for (const conv of CONVERSATIONS) {
      const patientId = patMap[conv.patient].profileId;
      const created = await client.query(
        `INSERT INTO conversations (professional_id, patient_id, last_message_at)
         VALUES ($1,$2,$3) RETURNING id`,
        [maria.profileId, patientId, new Date(Date.now() - conv.messages[0][2] * 60000).toISOString()],
      );
      for (const [senderRole, text, minutesAgo] of conv.messages) {
        const unread = senderRole === 'patient' && minutesAgo < 60;
        await client.query(
          `INSERT INTO messages (conversation_id, sender_role, text, sent_at, is_read)
           VALUES ($1,$2,$3,$4,$5)`,
          [created.rows[0].id, senderRole, text,
            new Date(Date.now() - minutesAgo * 60000).toISOString(), !unread],
        );
      }
    }

    // Documentos médicos por paciente
    const PATIENT_DOCS = [
      ['pat-001', 'informe', 'Electrocardiograma de control', 'verified', 60, '1,2 MB'],
      ['pat-001', 'receta', 'Receta losartán 50mg (crónica)', 'verified', 14, '165 KB'],
      ['pat-002', 'estudio', 'Perfil lipídico — Laboratorio Central', 'verified', 8, '412 KB'],
      ['pat-003', 'estudio', 'Radiografía de rodilla derecha', 'verified', 90, '2,8 MB'],
    ];
    for (const [pat, kind, title, status, daysAgo, size] of PATIENT_DOCS) {
      await client.query(
        `INSERT INTO documents (patient_id, professional_id, kind, title, size_label, status, uploaded_at)
         VALUES ($1,$2,$3,$4,$5,$6, now() - make_interval(days => $7))`,
        [patMap[pat].profileId, maria.profileId, kind, title, size, status, daysAgo],
      );
    }

    await client.query('COMMIT');
    console.log('Seed completado exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en seed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();