import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

function ageFrom(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function mapPatient(row, visits) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    birthDate: row.birth_date,
    age: ageFrom(row.birth_date),
    status: 'activo',
    dni: row.dni,
    phone: row.phone,
    email: row.email,
    address: [row.address_street, row.address_city].filter(Boolean).join(', '),
    emergencyContact: { name: row.emergency_contact_name, phone: row.emergency_contact_phone },
    healthInsurance: row.health_insurance,
    lastVisitAt: visits.lastVisitAt || null,
    nextVisitAt: visits.nextVisitAt || null,
    notes: row.notes,
  };
}

// Listar pacientes del profesional actual
router.get('/', async (req, res, next) => {
  try {
    const { professionalId } = req.query;
    const params = [];
    let join = '';
    if (professionalId) {
      params.push(professionalId);
      join = `JOIN appointments a ON a.patient_id = pat.id AND a.professional_id = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT DISTINCT pat.id, pat.birth_date, pat.dni, pat.health_insurance, pat.address_street,
              pat.address_city, pat.address_province, pat.emergency_contact_name,
              pat.emergency_contact_phone, pat.notes, pat.last_visit_at,
              u.first_name, u.last_name, u.email, u.phone
       FROM patient_profiles pat
       JOIN users u ON u.id = pat.user_id
       ${join}
       ORDER BY u.last_name, u.first_name`,
      params,
    );

    // Cálculo de último/próximo turno por paciente
    const patients = await Promise.all(rows.map(async (row) => {
      let visits = {};
      if (professionalId) {
        const v = await pool.query(
          `SELECT max(CASE WHEN status IN ('finalizada','cancelada') THEN starts_at END) AS last,
                  min(CASE WHEN status IN ('confirmada','pendiente') AND starts_at >= now() THEN starts_at END) AS next
           FROM appointments WHERE patient_id = $1 AND professional_id = $2`,
          [row.id, professionalId],
        );
        visits = { lastVisitAt: v.rows[0]?.last, nextVisitAt: v.rows[0]?.next };
      }
      return mapPatient(row, visits);
    }));

    res.json(patients);
  } catch (err) {
    next(err);
  }
});

// Detalle de un paciente
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT pat.*, u.first_name, u.last_name, u.email, u.phone
       FROM patient_profiles pat
       JOIN users u ON u.id = pat.user_id
       WHERE pat.id = $1`,
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' });

    const v = await pool.query(
      `SELECT max(CASE WHEN status IN ('finalizada','cancelada') THEN starts_at END) AS last,
              min(CASE WHEN status IN ('confirmada','pendiente') AND starts_at >= now() THEN starts_at END) AS next
       FROM appointments WHERE patient_id = $1`,
      [req.params.id],
    );
    res.json(mapPatient(rows[0], { lastVisitAt: v.rows[0]?.last, nextVisitAt: v.rows[0]?.next }));
  } catch (err) {
    next(err);
  }
});

export default router;
