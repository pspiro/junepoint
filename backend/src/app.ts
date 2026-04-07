import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

import authRouter from './api/auth';
import usersRouter from './api/users';
import loansRouter from './api/loans';
import documentsRouter from './api/documents';
import underwritingRouter from './api/underwriting';
import closingRouter from './api/closing';
import investorRouter from './api/investor';
import messagesRouter from './api/messages';
import notificationsRouter from './api/notifications';
import aiRouter from './api/ai';

const app = express();

const uploadsDir = process.env.UPLOADS_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/loans', loansRouter);
app.use('/api/loans', underwritingRouter);
app.use('/api/loans', closingRouter);
app.use('/api/loans', messagesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api', investorRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiRouter);

app.use('/uploads', express.static(path.resolve(uploadsDir)));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
