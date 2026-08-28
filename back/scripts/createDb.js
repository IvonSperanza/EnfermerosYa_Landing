import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Conecta al servidor postgres (sin DB específica) para crear la base
const admin = new pg.Client({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: 'postgres',
});

const dbName = process.env.PGDATABASE || 'enfermerosya';

try {
  await admin.connect();
  const res = await admin.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
  if (res.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Base de datos "${dbName}" creada.`);
  } else {
    console.log(`La base de datos "${dbName}" ya existe.`);
  }
} catch (err) {
  console.error('Error creando la base de datos:', err.message);
  process.exitCode = 1;
} finally {
  await admin.end();
}
