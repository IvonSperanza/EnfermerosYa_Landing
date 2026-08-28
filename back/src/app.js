import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';

import professionalsRouter from './routes/professionals.js';
import appointmentsRouter from './routes/appointments.js';
import patientsRouter from './routes/patients.js';
import availabilityRouter from './routes/availability.js';
import availabilityAdminRouter from './routes/availabilityAdmin.js';
import paymentsRouter from './routes/payments.js';
import authRouter from './routes/auth.js';
import meRouter from './routes/me.js';
import messagesRouter from './routes/messages.js';
import documentsRouter from './routes/documents.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/professionals', professionalsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/availability', availabilityAdminRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/professional', meRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/notifications', notificationsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
