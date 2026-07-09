import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/signup', asyncHandler(auth.signup));
router.post('/login', asyncHandler(auth.login));
router.post('/refresh', asyncHandler(auth.refresh));
router.get('/verify-email', asyncHandler(auth.verifyEmail));
router.post('/resend-verification', authenticate, asyncHandler(auth.resendVerification));
router.post('/forgot-password', asyncHandler(auth.forgotPassword));
router.post('/reset-password', asyncHandler(auth.resetPassword));
router.get('/me', authenticate, asyncHandler(auth.getMe));

export default router;
