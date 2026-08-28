import { Router } from 'express';
import { pool } from '../db/pool.js';
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
} from '../lib/auth.js';

const router = Router();

// Login: verifica credenciales y emite un JWT real
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.password_hash
       FROM users u WHERE u.email = $1`,
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const match = await verifyPassword(password, rows[0].password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      token: signToken(user),
    });
  } catch (err) {
    next(err);
  }
});

// Registro: crea usuario con contraseña hasheada y devuelve el JWT
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = 'patient' } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, contraseña, nombre y apellido son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, email, first_name, last_name, role`,
      [email, passwordHash, firstName, lastName, role],
    );

    const user = rows[0];
    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      token: signToken(user),
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
});

// Perfil del usuario autenticado
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role,
              pp.id AS professional_id,
              pat.id AS patient_id,
              pp.profession, pp.specialty_id, pp.verification_status
       FROM users u
       LEFT JOIN professional_profiles pp ON pp.user_id = u.id
       LEFT JOIN patient_profiles pat ON pat.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      professionalId: u.professional_id,
      patientId: u.patient_id,
      profession: u.profession,
      verificationStatus: u.verification_status,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
