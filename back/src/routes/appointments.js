import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../lib/auth.js';
import { getCurrentPatientId } from '../lib/currentPro.js';

const router = Router();

router.use(requireAuth);
const SELECT_LIST = `
  SELECT a.*, s.name AS service_name,
         u_pro.first_name AS professional_first_name, u_pro.last_name AS professional_last_name,
         u_pat.first_name AS patient_first_name, u_pat.last_name AS patient_last_name
  FROM appointments a
  LEFT JOIN services s ON s.id = a.service_id
  JOIN professional_profiles pp ON pp.id = a.professional_id
  JOIN users u_pro ON u_pro.id = pp.user_id
  JOIN patient_profiles pat ON pat.id = a.patient_id
  JOIN users u_pat ON u_pat.id = pat.user_id
`;

// Listar citas (filtros opcionales)
router.get('/', async (req, res, next) => {
  try {
    const { professionalId, patientId, status, patient } = req.query;
    const conditions = [];
    const params = [];

    if (professionalId) {
      params.push(professionalId);
      conditions.push(`a.professional_id = $${params.length}`);
    }
    if (patientId || patient) {
      params.push(patientId || patient);
      conditions.push(`a.patient_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    // Si el usuario autenticado es paciente y está listando sus propias reservas
    // (sin filtrar por profesional), solo ve sus propias citas.
    if (req.user?.role === 'patient' && !professionalId) {
      const authedPatientId = patientId || (await getCurrentPatientId(req));
      if (authedPatientId) {
        params.push(authedPatientId);
        conditions.push(`a.patient_id = $${params.length}`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`${SELECT_LIST} ${where} ORDER BY a.starts_at DESC`, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Detalle de una cita
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT_LIST} WHERE a.id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Crear cita (reserva del cliente)
router.post('/', async (req, res, next) => {
    const client = await pool.connect();
    try {
      const {
        professionalId, serviceId, type = 'consulta',
        modality = 'presencial', startsAt, durationMinutes, reason, price,
      } = req.body;

      // El paciente se resuelve desde la sesión (JWT) cuando es posible;
      // en dev sin token, se acepta el patientId del body.
      const authedPatientId = await getCurrentPatientId(req);
      const patientId = authedPatientId || req.body.patientId;
      if (!patientId) {
        await client.query('ROLLBACK');
        return res.status(401).json({ error: 'Paciente no identificado' });
      }

      await client.query('BEGIN');

    // Prevenir doble reserva del mismo slot
    const overlap = await client.query(
      `SELECT 1 FROM appointments
       WHERE professional_id = $1
         AND status IN ('pendiente', 'confirmada')
         AND tsrange(starts_at, ends_at) && tsrange($2::timestamptz, $2::timestamptz + make_interval(mins => $3))
       LIMIT 1`,
      [professionalId, startsAt, Number(durationMinutes) || 30],
    );

    if (overlap.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'El profesional ya tiene una cita en ese horario' });
    }

    const { rows } = await client.query(
      `INSERT INTO appointments
        (professional_id, patient_id, service_id, type, modality, starts_at, ends_at, duration_minutes, reason, price, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'confirmada')
       RETURNING *`,
      [
        professionalId, patientId, serviceId || null, type, modality,
        startsAt, new Date(new Date(startsAt).getTime() + (Number(durationMinutes) || 30) * 60000).toISOString(),
        Number(durationMinutes) || 30, reason || '', price,
      ],
    );

    await client.query('COMMIT');

    // Enviar la cita creada con el nombre del servicio
    const serviceName = serviceId
      ? (await pool.query('SELECT name FROM services WHERE id = $1', [serviceId])).rows[0]?.name
      : null;
    res.status(201).json({ ...rows[0], service_name: serviceName || null });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Actualizar estado / notas / cancelación de una cita
router.patch('/:id', async (req, res, next) => {
  try {
    const { status, notes, cancelledBy } = req.body;
    const fields = [];
    const params = [req.params.id];
    if (status) {
      params.push(status);
      fields.push(`status = $${params.length}`);
    }
    if (notes !== undefined) {
      params.push(notes);
      fields.push(`notes = $${params.length}`);
    }
    if (cancelledBy !== undefined) {
      params.push(cancelledBy);
      fields.push(`cancelled_by = $${params.length}`);
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nada para actualizar' });
    }
    const { rows } = await pool.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      params,
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
