import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// En producción (Vercel/Neon) usamos DATABASE_URL con la cadena completa + SSL.
// En desarrollo local se usan las variables PGHOST/PGPORT/... tradicionales.
export const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : undefined,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'enfermerosya',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
      },
);

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
