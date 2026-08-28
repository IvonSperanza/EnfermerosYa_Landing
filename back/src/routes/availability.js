import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

function toTimeComponents(iso) {
  const d = new Date(iso);
  return { year: d.getFullYear(), month: d.getMonth(), date: d.getDate() };
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayBoundary(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Genera slots de 30 min dentro de rango, respetando la duración de la consulta
function buildSlots(ranges, appointmentDuration) {
  const slots = [];
  for (const r of ranges) {
    let start = timeToMinutes(r.start);
    const end = timeToMinutes(r.end);
    while (start + appointmentDuration <= end) {
      const h = Math.floor(start / 60);
      const m = start % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      start += 30;
    }
  }
  return slots;
}

// Disponibilidad del cliente: GET /api/availability/:professionalId?days=14
router.get('/:professionalId', async (req, res, next) => {
  try {
    const professionalId = req.params.professionalId;
    const days = Math.min(Number(req.query.days) || 14, 60);

    const [weeklyRes, settingsRes, blockedRes, leavesRes, bookingsRes] = await Promise.all([
      pool.query('SELECT weekday, start_time, end_time, is_e_consult FROM availability_weekly WHERE professional_id = $1', [professionalId]),
      pool.query('SELECT appointment_duration FROM availability_settings WHERE professional_id = $1', [professionalId]),
      pool.query('SELECT blocked_date FROM availability_blocked_dates WHERE professional_id = $1', [professionalId]),
      pool.query('SELECT from_date, to_date FROM availability_leaves WHERE professional_id = $1', [professionalId]),
      pool.query(`SELECT starts_at, duration_minutes FROM appointments
                  WHERE professional_id = $1 AND status IN ('pendiente','confirmada')`, [professionalId]),
    ]);

    const duration = settingsRes.rows[0]?.appointment_duration || 30;
    const blocked = new Set(blockedRes.rows.map((r) => dateKey(r.blocked_date)));
    const bookedKeys = new Set();
    for (const b of bookingsRes.rows) {
      const d = new Date(b.starts_at);
      bookedKeys.add(`${dateKey(d)}|${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }

    // Agrupar rangos por weekday
    const weekly = {};
    for (const r of weeklyRes.rows) {
      if (r.is_e_consult) continue;
      if (!weekly[r.weekday]) weekly[r.weekday] = [];
      weekly[r.weekday].push({ start: r.start_time.slice(0, 5), end: r.end_time.slice(0, 5) });
    }

    const today = dayBoundary(new Date());
    const result = [];
    for (let i = 0; i < days; i += 1) {
      const date = addDays(today, i);
      const key = dateKey(date);
      const weekday = ((date.getDay() + 6) % 7) + 1;

      const onLeave = leavesRes.rows.some((l) => key >= dateKey(l.from_date) && key <= dateKey(l.to_date));
      const isBlocked = blocked.has(key);

      let slots = [];
      if (!onLeave && !isBlocked) {
        slots = buildSlots(weekly[weekday] || [], duration)
          .filter((slot) => !bookedKeys.has(`${key}|${slot}`));
      }

      result.push({ date: date.toISOString(), label: i, slots });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
