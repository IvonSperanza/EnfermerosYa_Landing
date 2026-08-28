import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getCurrentProfessionalId } from '../lib/currentPro.js';

const router = Router();

function mapNotification(row) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body || '',
    sentAt: row.sent_at,
    read: row.is_read,
  };
}

// Notificaciones del profesional actual
router.get('/me', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });
    const userRes = await pool.query('SELECT user_id FROM professional_profiles WHERE id = $1', [professionalId]);
    const userId = userRes.rows[0]?.user_id;
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY sent_at DESC',
      [userId],
    );
    res.json(rows.map(mapNotification));
  } catch (err) {
    next(err);
  }
});

// Marcar todas como leídas
router.post('/me/read-all', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });
    const userRes = await pool.query('SELECT user_id FROM professional_profiles WHERE id = $1', [professionalId]);
    const userId = userRes.rows[0]?.user_id;
    await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
