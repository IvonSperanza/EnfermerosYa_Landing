import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

const PROFESSIONAL_SELECT = `
  SELECT p.id, p.profession, p.headline, p.description, p.experience_years,
         p.rating, p.reviews_count, p.consultations_count,
         p.availability_status, p.verification_status,
         p.accepts_home_visits, p.accepts_in_office, p.accepts_online,
         p.available_now, p.available_today,
         p.address_city AS city, p.address_zone AS zone,
         p.address_street, p.address_number, p.address_floor, p.address_apartment,
         p.license_number, p.latitude, p.longitude,
         p.price_from, p.e_consult_price,
         s.slug AS specialty, s.name AS specialty_name,
         u.first_name, u.last_name
  FROM professional_profiles p
  JOIN users u ON u.id = p.user_id
  LEFT JOIN specialties s ON s.id = p.specialty_id
`;

// Mapea una fila de la BD al objeto que espera el front
function toClientProfessional(row) {
  const modalities = [];
  if (row.accepts_in_office) modalities.push('presencial');
  if (row.accepts_home_visits) modalities.push('domicilio');
  if (row.accepts_online) modalities.push('online');

  const priceFrom = row.price_from ?? 0;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    profession: row.profession,
    specialty: row.specialty,
    headline: row.headline,
    rating: Number(row.rating) || 0,
    reviewsCount: row.reviews_count,
    consultationsCount: row.consultations_count,
    experienceYears: row.experience_years,
    description: row.description,
    modalities,
    availableNow: row.available_now,
    availableToday: row.available_today,
    status: row.availability_status === 'online' ? 'disponible' : 'offline',
    city: row.city,
    zone: row.zone,
    office: {
      street: [row.address_street, row.address_number, row.address_floor ? `${row.address_floor}${row.address_apartment ? ` ${row.address_apartment}` : ''}` : null].filter(Boolean).join(' '),
      city: row.city,
    },
    priceFrom,
    eConsultPrice: Number(row.e_consult_price) || 0,
    licenseNumber: row.license_number,
    verificationStatus: row.verification_status,
    acceptsOnline: row.accepts_online,
    services: [],
  };
}

function mapService(s) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    price: Number(s.price),
    durationMinutes: s.duration_minutes,
    modalities: s.modality === 'online' ? ['online'] : s.modality === 'domicilio' ? ['domicilio'] : ['presencial'],
  };
}

async function loadServices(professionalId) {
  const { rows } = await pool.query(
    `SELECT id, name, description, price, duration_minutes, modality, is_e_consult
     FROM services WHERE professional_id = $1 AND is_active = true`,
    [professionalId],
  );
  return rows.map(mapService);
}

// Listar / buscar profesionales (catálogo público)
router.get('/', async (req, res, next) => {
  try {
    const { q, tipo, especialidad, modalidad, disponibilidad, zona, precioMax, rating, sort } = req.query;
    const conditions = ['p.verification_status = \'verified\''];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(CONCAT(u.first_name, ' ', u.last_name, ' ', p.headline) ILIKE $${params.length})`);
    }
    if (tipo && tipo !== 'todos') {
      params.push(tipo);
      conditions.push(`p.profession = $${params.length}`);
    }
    if (especialidad && especialidad !== 'todas') {
      params.push(especialidad);
      conditions.push(`s.slug = $${params.length}`);
    }
    if (modalidad && modalidad !== 'todas') {
      if (modalidad === 'presencial') conditions.push('p.accepts_in_office = true');
      if (modalidad === 'domicilio') conditions.push('p.accepts_home_visits = true');
      if (modalidad === 'online') conditions.push('p.accepts_online = true');
    }
    if (disponibilidad === 'now') conditions.push('p.available_now = true');
    if (disponibilidad === 'today') conditions.push('p.available_today = true');
    if (zona) {
      params.push(`%${zona}%`);
      conditions.push(`(CONCAT(p.address_zone, ' ', p.address_city) ILIKE $${params.length})`);
    }
    if (precioMax) {
      params.push(Number(precioMax));
      conditions.push(`p.price_from <= $${params.length}`);
    }
    if (rating) {
      params.push(Number(rating));
      conditions.push(`p.rating >= $${params.length}`);
    }

    const orderMap = {
      rating: 'p.rating DESC',
      priceAsc: 'p.price_from ASC',
      priceDesc: 'p.price_from DESC',
      reviews: 'p.reviews_count DESC',
    };
    const order = orderMap[sort] || 'p.rating DESC';

    const { rows } = await pool.query(
      `${PROFESSIONAL_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY ${order}`,
      params,
    );

    const professionals = await Promise.all(rows.map(async (row) => {
      const prof = toClientProfessional(row);
      prof.services = await loadServices(row.id);
      return prof;
    }));

    res.json(professionals);
  } catch (err) {
    next(err);
  }
});

// Detalle de un profesional
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `${PROFESSIONAL_SELECT} WHERE p.id = $1`,
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Profesional no encontrado' });

    const professional = toClientProfessional(rows[0]);
    professional.services = await loadServices(req.params.id);
    professional.reviews = [];

    res.json(professional);
  } catch (err) {
    next(err);
  }
});

// Servicios de un profesional
router.get('/:id/services', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM services WHERE professional_id = $1 AND is_active = true',
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Especialidades disponibles (forma esperada por el front)
router.get('/meta/specialties', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.description, s.slug,
             COUNT(p.id)::int AS professionals_count
      FROM specialties s
      LEFT JOIN professional_profiles p ON p.specialty_id = s.id AND p.verification_status = 'verified'
      GROUP BY s.id, s.name, s.description, s.slug
      ORDER BY s.sort_order
    `);
    res.json(rows.map((r) => ({
      id: r.slug,
      name: r.name,
      description: r.description,
      professionalsCount: r.professionals_count,
    })));
  } catch (err) {
    next(err);
  }
});

export default router;
