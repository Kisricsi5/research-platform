import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.get('/verify-email', auth.verifyEmail);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/me', authenticate, auth.getMe);

export default router;
