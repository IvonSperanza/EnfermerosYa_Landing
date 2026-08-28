import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getCurrentProfessionalId } from '../lib/currentPro.js';

const router = Router();

function dateToString(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

// GET /api/availability/me -> objeto completo del panel profesional
router.get('/me', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const [weeklyRes, settingsRes, blockedRes, leavesRes] = await Promise.all([
      pool.query('SELECT weekday, start_time, end_time, is_e_consult FROM availability_weekly WHERE professional_id = $1 ORDER BY weekday, start_time', [professionalId]),
      pool.query('SELECT * FROM availability_settings WHERE professional_id = $1', [professionalId]),
      pool.query('SELECT id, blocked_date FROM availability_blocked_dates WHERE professional_id = $1 ORDER BY blocked_date', [professionalId]),
      pool.query('SELECT id, from_date, to_date, label FROM availability_leaves WHERE professional_id = $1 ORDER BY from_date', [professionalId]),
    ]);

    const weekly = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    const eConsultWeekly = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    for (const r of weeklyRes.rows) {
      const range = { start: r.start_time.slice(0, 5), end: r.end_time.slice(0, 5) };
      if (r.is_e_consult) eConsultWeekly[r.weekday].push(range);
      else weekly[r.weekday].push(range);
    }

    const settings = settingsRes.rows[0];

    res.json({
      weekly,
      eConsultWeekly,
      appointmentDuration: settings?.appointment_duration ?? 30,
      bufferMinutes: settings?.buffer_minutes ?? 10,
      minBookingNoticeHours: settings?.min_booking_notice_hours ?? 4,
      blockedDates: blockedRes.rows.map((r) => dateToString(r.blocked_date)),
      leaves: leavesRes.rows.map((l) => ({
        id: l.id,
        from: dateToString(l.from_date),
        to: dateToString(l.to_date),
        label: l.label || 'Licencia',
      })),
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/availability/me
router.put('/me', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const b = req.body;
    await client.query('BEGIN');

    // Settings
    await client.query(
      `INSERT INTO availability_settings
        (professional_id, appointment_duration, buffer_minutes, min_booking_notice_hours,
         e_consult_enabled, e_consult_duration, e_consult_price)
       VALUES ($1,$2,$3,$4,true,$5,$6)
       ON CONFLICT (professional_id) DO UPDATE SET
         appointment_duration = EXCLUDED.appointment_duration,
         buffer_minutes = EXCLUDED.buffer_minutes,
         min_booking_notice_hours = EXCLUDED.min_booking_notice_hours,
         e_consult_enabled = EXCLUDED.e_consult_enabled,
         e_consult_duration = EXCLUDED.e_consult_duration,
         e_consult_price = EXCLUDED.e_consult_price`,
      [professionalId,
        b.appointmentDuration ?? 30, b.bufferMinutes ?? 10, b.minBookingNoticeHours ?? 4,
        b.eConsultDuration ?? 20, b.eConsultPrice ?? 0],
    );

    // Semana tipo presencial + e-consultas
    await client.query('DELETE FROM availability_weekly WHERE professional_id = $1', [professionalId]);
    const weekly = b.weekly || {};
    const eWeekly = b.eConsultWeekly || {};
    for (let wd = 1; wd <= 7; wd += 1) {
      for (const range of weekly[String(wd)] || []) {
        await client.query(
          `INSERT INTO availability_weekly (professional_id, weekday, start_time, end_time, is_e_consult)
           VALUES ($1,$2,$3,$4,false)`,
          [professionalId, wd, range.start, range.end],
        );
      }
      for (const range of eWeekly[String(wd)] || []) {
        await client.query(
          `INSERT INTO availability_weekly (professional_id, weekday, start_time, end_time, is_e_consult)
           VALUES ($1,$2,$3,$4,true)`,
          [professionalId, wd, range.start, range.end],
        );
      }
    }

    // Bloqueos (reemplazar)
    await client.query('DELETE FROM availability_blocked_dates WHERE professional_id = $1', [professionalId]);
    for (const date of b.blockedDates || []) {
      await client.query(
        `INSERT INTO availability_blocked_dates (professional_id, blocked_date) VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [professionalId, date],
      );
    }

    // Licencias (reemplazar)
    await client.query('DELETE FROM availability_leaves WHERE professional_id = $1', [professionalId]);
    for (const leave of b.leaves || []) {
      await client.query(
        `INSERT INTO availability_leaves (professional_id, from_date, to_date, label)
         VALUES ($1,$2,$3,$4)`,
        [professionalId, leave.from, leave.to, leave.label || 'Licencia'],
      );
    }

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
