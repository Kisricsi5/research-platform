import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import professorRoutes from './routes/professor.routes';
import publicRoutes from './routes/public.routes';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.frontendUrl, credentials: true }));
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

// Error handler
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
});

export default app;
