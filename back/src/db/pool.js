import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'enfermerosya',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
});

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
