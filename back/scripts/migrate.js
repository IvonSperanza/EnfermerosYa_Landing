import { pool } from '../src/db/pool.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

try {
  await pool.query(schema);
  console.log('Migración aplicada correctamente (schema.sql).');
} catch (err) {
  console.error('Error aplicando el esquema:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
