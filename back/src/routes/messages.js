import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getCurrentProfessionalId } from '../lib/currentPro.js';

const router = Router();

function mapMessage(row) {
  return {
    id: row.id,
    from: row.sender_role === 'professional' ? 'pro' : 'patient',
    text: row.text || '',
    sentAt: row.sent_at,
    attachment: row.attachment_name ? { name: row.attachment_name } : null,
    isRead: row.is_read,
  };
}

function mapConversation(row, messages) {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientOnline: row.patient_online ?? false,
    unread: Number(row.unread_count || 0),
    messages: messages.map(mapMessage),
  };
}

// GET /api/messages/me -> conversaciones del profesional actual con sus mensajes
router.get('/me', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const { rows } = await pool.query(
      `SELECT c.id, c.patient_id, c.last_message_at,
              (SELECT count(*) FROM messages m
                WHERE m.conversation_id = c.id AND m.sender_role = 'patient' AND m.is_read = false)::int AS unread_count,
              false AS patient_online
       FROM conversations c
       WHERE c.professional_id = $1
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [professionalId],
    );

    const conversations = [];
    for (const conv of rows) {
      const msgRes = await pool.query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
        [conv.id],
      );
      conversations.push(mapConversation(conv, msgRes.rows));
    }

    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// Enviar mensaje del profesional actual
router.post('/me/:conversationId', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const { text, attachment } = req.body;

    const conv = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND professional_id = $2',
      [req.params.conversationId, professionalId],
    );
    if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversación no encontrada' });

    const { rows } = await pool.query(
      `INSERT INTO messages (conversation_id, sender_role, text, attachment_name)
       VALUES ($1,'professional',$2,$3) RETURNING *`,
      [req.params.conversationId, text || null, attachment?.name || null],
    );
    await pool.query(
      'UPDATE conversations SET last_message_at = now() WHERE id = $1',
      [req.params.conversationId],
    );

    res.status(201).json(mapMessage(rows[0]));
  } catch (err) {
    next(err);
  }
});

// Marcar como leídos los mensajes del paciente en una conversación
router.post('/me/:conversationId/read', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE conversation_id = $1
         AND sender_role = 'patient'
         AND conversation_id IN (SELECT id FROM conversations WHERE professional_id = $2)`,
      [req.params.conversationId, professionalId],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
