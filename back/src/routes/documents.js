import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getCurrentProfessionalId } from '../lib/currentPro.js';

const router = Router();

function mapDocument(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    kind: row.kind,
    title: row.title || row.file_name || 'Documento',
    uploadedAt: row.uploaded_at,
    status: row.status,
    size: row.size_label || '—',
  };
}

// Documentos de un paciente para el profesional actual
router.get('/patient/:patientId', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const { rows } = await pool.query(
      `SELECT * FROM documents
       WHERE patient_id = $1 AND (professional_id = $2 OR professional_id IS NULL)
       ORDER BY uploaded_at DESC`,
      [req.params.patientId, professionalId],
    );
    res.json(rows.map(mapDocument));
  } catch (err) {
    next(err);
  }
});

// Subir documento
router.post('/', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const { patientId, kind, title } = req.body;
    const sizeMb = ((Math.random() * 2.5) + 0.2).toFixed(1).replace('.', ',');
    const { rows } = await pool.query(
      `INSERT INTO documents (patient_id, professional_id, kind, title, file_name, size_label, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending') RETURNING *`,
      [patientId, professionalId, kind || 'estudio', title || null, title || null, `${sizeMb} MB`],
    );
    res.status(201).json(mapDocument(rows[0]));
  } catch (err) {
    next(err);
  }
});

// Eliminar documento
router.delete('/:docId', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    await pool.query(
      'DELETE FROM documents WHERE id = $1 AND professional_id = $2',
      [req.params.docId, professionalId],
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
