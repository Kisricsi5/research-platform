import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Tight limit ONLY on abuse-prone endpoints (credential stuffing, email spam).
// /me and /refresh run on every page load and must never be throttled this hard.
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});

router.post('/signup', strictLimiter, asyncHandler(auth.signup));
router.post('/login', strictLimiter, asyncHandler(auth.login));
router.post('/refresh', asyncHandler(auth.refresh));
router.get('/verify-email', asyncHandler(auth.verifyEmail));
router.post('/resend-verification', authenticate, strictLimiter, asyncHandler(auth.resendVerification));
router.post('/forgot-password', strictLimiter, asyncHandler(auth.forgotPassword));
router.post('/reset-password', strictLimiter, asyncHandler(auth.resetPassword));
router.get('/me', authenticate, asyncHandler(auth.getMe));

export default router;
