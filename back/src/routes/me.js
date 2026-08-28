import { Router } from 'express';
import { pool } from '../db/pool.js';
import { getCurrentProfessionalId } from '../lib/currentPro.js';

const router = Router();

function mapVerificationDoc(row) {
  return {
    id: row.id,
    kind: row.kind,
    fileName: row.file_name,
    uploadedAt: row.uploaded_at ? row.uploaded_at.toISOString().slice(0, 10) : null,
    status: row.status,
  };
}

// Obtener el perfil completo del profesional actual (forma del panel)
router.get('/', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const { rows } = await pool.query(
      `SELECT pp.*, u.email, u.first_name, u.last_name, u.phone,
              s.name AS specialty_name, s.slug AS specialty_slug
       FROM professional_profiles pp
       JOIN users u ON u.id = pp.user_id
       LEFT JOIN specialties s ON s.id = pp.specialty_id
       WHERE pp.id = $1`,
      [professionalId],
    );
    const p = rows[0];

    const services = await pool.query(
      `SELECT id, name, description, price, duration_minutes, modality, is_e_consult
       FROM services WHERE professional_id = $1 AND is_active = true`,
      [professionalId],
    );

    res.json({
      id: professionalId,
      firstName: p.first_name,
      lastName: p.last_name,
      profession: p.profession,
      specialty: p.specialty_name,
      licenseNumber: p.license_number,
      licenseProvince: p.license_province,
      verificationStatus: p.verification_status,
      availabilityStatus: p.availability_status,
      avatar: null,
      description: p.description,
      experienceYears: p.experience_years,
      email: p.email,
      phone: p.phone,
      birthDate: p.birth_date,
      dni: p.dni,
      address: {
        street: p.address_street,
        number: p.address_number,
        floor: p.address_floor,
        apartment: p.address_apartment,
        city: p.address_city,
        province: p.address_province,
        zipCode: p.address_zip_code,
        zoneLabel: p.address_zone,
        lat: p.latitude ? Number(p.latitude) : null,
        lng: p.longitude ? Number(p.longitude) : null,
      },
      acceptsHomeVisits: p.accepts_home_visits,
      acceptsInOffice: p.accepts_in_office,
      acceptsOnline: p.accepts_online,
      showApproximateLocation: p.show_approximate_location,
      services: services.rows.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: Number(s.price),
        durationMinutes: s.duration_minutes,
        modality: s.modality,
        isEConsult: s.is_e_consult,
      })),
      rating: Number(p.rating) || 0,
      reviewsCount: p.reviews_count,
    });
  } catch (err) {
    next(err);
  }
});

// Actualizar perfil del profesional actual
router.patch('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });

    const b = req.body;
    const updates = [];
    const params = [];
    const push = (column, value) => {
      if (value === undefined) return;
      params.push(value);
      updates.push(`${column} = $${params.length}`);
    };

    push('license_number', b.licenseNumber);
    push('license_province', b.licenseProvince);
    push('experience_years', b.experienceYears);
    push('description', b.description);
    push('accepts_home_visits', b.acceptsHomeVisits);
    push('accepts_in_office', b.acceptsInOffice);
    push('accepts_online', b.acceptsOnline);
    push('show_approximate_location', b.showApproximateLocation);

    await client.query('BEGIN');

    if (b.firstName || b.lastName || b.phone || b.email) {
      const uf = [];
      const up = [professionalId];
      if (b.firstName) { up.push(b.firstName); uf.push(`first_name = $${up.length}`); }
      if (b.lastName) { up.push(b.lastName); uf.push(`last_name = $${up.length}`); }
      if (b.phone) { up.push(b.phone); uf.push(`phone = $${up.length}`); }
      if (b.email) { up.push(b.email); uf.push(`email = $${up.length}`); }
      if (uf.length) {
        await client.query(
          `UPDATE users SET ${uf.join(', ')} WHERE id = (SELECT user_id FROM professional_profiles WHERE id = $1)`,
          up,
        );
      }
    }

    if (b.address) {
      const a = b.address;
      push('address_street', a.street);
      push('address_number', a.number);
      push('address_floor', a.floor);
      push('address_apartment', a.apartment);
      push('address_city', a.city);
      push('address_province', a.province);
      push('address_zip_code', a.zipCode);
      push('address_zone', a.zoneLabel);
      if (a.lat !== undefined && a.lat !== null) push('latitude', a.lat);
      if (a.lng !== undefined && a.lng !== null) push('longitude', a.lng);
    }

    if (updates.length) {
      params.push(professionalId);
      await client.query(
        `UPDATE professional_profiles SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params,
      );
    }

    // Servicios: si vienen completos, reemplazar
    if (Array.isArray(b.services)) {
      await client.query('DELETE FROM services WHERE professional_id = $1', [professionalId]);
      for (const s of b.services) {
        await client.query(
          `INSERT INTO services (professional_id, name, description, price, duration_minutes, modality, is_e_consult, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
          [professionalId, s.name, s.description || null, Number(s.price) || 0,
            Number(s.durationMinutes) || 30, s.modality || 'presencial', Boolean(s.isEConsult)],
        );
      }
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

// Documentos de verificación
router.get('/verification', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });
    const { rows } = await pool.query(
      'SELECT * FROM verification_documents WHERE professional_id = $1 ORDER BY uploaded_at DESC',
      [professionalId],
    );
    res.json(rows.map(mapVerificationDoc));
  } catch (err) {
    next(err);
  }
});

router.patch('/verification/:docId', async (req, res, next) => {
  try {
    const professionalId = await getCurrentProfessionalId();
    if (!professionalId) return res.status(404).json({ error: 'Profesional no encontrado' });
    const b = req.body;
    const fields = [];
    const params = [req.params.docId, professionalId];
    if (b.status) { params.push(b.status); fields.push(`status = $${params.length}`); }
    if (b.uploadedAt) { params.push(b.uploadedAt); fields.push(`uploaded_at = $${params.length}`); }
    if (fields.length === 0) return res.status(400).json({ error: 'Nada para actualizar' });

    const { rows } = await pool.query(
      `UPDATE verification_documents SET ${fields.join(', ')}
       WHERE id = $1 AND professional_id = $2 RETURNING *`,
      params,
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(mapVerificationDoc(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
