import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { prisma } from './config/prisma';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import professorRoutes from './routes/professor.routes';
import publicRoutes from './routes/public.routes';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  env.frontendUrl,
  'https://research-platform-lake.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow explicit whitelist, any Vercel deployment for this project, and localhost
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/research-platform.*\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' });
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// Static files (uploaded CVs, avatars)
app.use('/uploads', express.static(path.resolve(env.upload.dir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api', publicRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Debug: what does the process actually see for DATABASE_URL? (safe - no password)
app.get('/health/env', (_req, res) => {
  const raw = process.env.DATABASE_URL;
  res.json({
    DATABASE_URL_defined: typeof raw === 'string',
    DATABASE_URL_length: raw ? raw.length : 0,
    DATABASE_URL_first15: raw ? JSON.stringify(raw.slice(0, 15)) : null,
    DIRECT_URL_defined: typeof process.env.DIRECT_URL === 'string',
    DIRECT_URL_first15: process.env.DIRECT_URL ? JSON.stringify(process.env.DIRECT_URL.slice(0, 15)) : null,
  });
});

// Database connectivity check
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'unreachable', message: err instanceof Error ? err.message : String(err) });
  }
});

// Error handler
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});

export default app;
