import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// Node exits on unhandled rejections by default, which turns a single failed
// query into a full restart that drops every in-flight request. Route handlers
// forward errors via asyncHandler; this catches anything that slips past
// (e.g. fire-and-forget email sends) and keeps the server up.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

// Render terminates TLS at its proxy; trust it so client IPs (and the
// rate limiter) see the real address instead of the proxy's.
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  env.frontendUrl,
  'https://labyro.com',
  'https://www.labyro.com',
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

// Rate limiting. Generous on purpose: whole campuses share a NAT IP, and the
// app polls notifications — a strict per-IP cap here reads as "site is down".
// Sensitive auth endpoints get their own tight limiter in auth.routes.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' },
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api', publicRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Public feature flags (no secrets exposed — booleans only)
app.get('/api/config', (_req, res) => {
  res.json({ aiFitAnalysis: typeof process.env.ANTHROPIC_API_KEY === 'string' && process.env.ANTHROPIC_API_KEY.length > 0 });
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
