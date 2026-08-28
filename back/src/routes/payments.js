import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// Listar pagos (de un profesional por defecto), unidos con el paciente de la cita
router.get('/', async (req, res, next) => {
  try {
    const { professionalId } = req.query;
    const conditions = [];
    const params = [];
    if (professionalId) {
      params.push(professionalId);
      conditions.push(`p.professional_id = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`
      SELECT p.*,
             u_pat.first_name AS patient_first_name, u_pat.last_name AS patient_last_name,
             a.starts_at AS appointment_starts_at
      FROM payments p
      LEFT JOIN appointments a ON a.id = p.appointment_id
      LEFT JOIN patient_profiles pat ON pat.id = a.patient_id
      LEFT JOIN users u_pat ON u_pat.id = pat.user_id
      ${where}
      ORDER BY p.paid_at DESC NULLS LAST, p.created_at DESC
    `, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Ingresos mensuales (últimos 6 meses) para el panel profesional
router.get('/me/monthly-revenue', async (req, res, next) => {
  try {
    const { professionalId } = req.query;
    const params = [];
    let where = '';
    if (professionalId) {
      params.push(professionalId);
      where = `WHERE p.professional_id = $${params.length} AND p.status = 'pagado'`;
    } else {
      where = `WHERE p.status = 'pagado'`;
    }

    const { rows } = await pool.query(
      `SELECT to_char(date_trunc('month', paid_at), 'YYYY-MM') AS month_key,
              COALESCE(SUM(p.amount), 0)::numeric(12,2) AS total
       FROM payments p
       ${where}
         AND paid_at >= date_trunc('month', now()) - interval '5 months'
       GROUP BY date_trunc('month', paid_at)
       ORDER BY month_key`,
      params,
    );

    const byKey = Object.fromEntries(rows.map((r) => [r.month_key, Number(r.total)]));
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const result = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ label: monthNames[d.getMonth()], value: byKey[key] || 0 });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
