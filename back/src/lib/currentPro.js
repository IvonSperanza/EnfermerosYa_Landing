import { pool } from '../db/pool.js';
import { extractUser } from './auth.js';

// Si viene un JWT válido en el request, se resuelve el profesional asociado a ese
// usuario. En desarrollo, sin token, se cae al profesional seed (María González).
export const CURRENT_PRO_EMAIL = 'maria.gonzalez@enfermerosya.com';

export async function getCurrentProfessionalId(req) {
  const user = req ? extractUser(req) : null;
  if (user) {
    const { rows } = await pool.query(
      `SELECT pp.id
       FROM professional_profiles pp
       WHERE pp.user_id = $1
       LIMIT 1`,
      [user.id],
    );
    if (rows[0]?.id) return rows[0].id;
  }

  const { rows } = await pool.query(
    `SELECT pp.id
     FROM professional_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE u.email = $1
     LIMIT 1`,
    [CURRENT_PRO_EMAIL],
  );
  return rows[0]?.id ?? null;
}

export async function getCurrentPatientId(req) {
  const user = req ? extractUser(req) : null;
  if (user) {
    const { rows } = await pool.query(
      `SELECT id FROM patient_profiles WHERE user_id = $1 LIMIT 1`,
      [user.id],
    );
    if (rows[0]?.id) return rows[0].id;
  }
  return null;
}
