import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET || 'desarrollo-secreto-cambiar-en-produccion';
const BCRYPT_ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash || '');
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function getUserFromToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function extractUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return getUserFromToken(header.slice(7));
}

// Middleware: valida el JWT (Authorization: Bearer <token>) y expone req.user.
// Un 401 si falta o el token es inválido.
export function requireAuth(req, res, next) {
  const user = extractUser(req);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  req.user = user;
  return next();
}
