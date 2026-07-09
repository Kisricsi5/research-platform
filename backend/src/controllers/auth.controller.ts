import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { AuthRequest } from '../types';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'PROFESSOR']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Academic domains: name@x.edu, name@x.edu.au, name@x.ac.uk, etc.
function isAcademicEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return /(^|\.)edu(\.[a-z]{2,3})?$/.test(domain) || /(^|\.)ac\.[a-z]{2,3}$/.test(domain);
}

export async function signup(req: Request, res: Response): Promise<void> {
  const { email, password, role } = signupSchema.parse(req.body);

  if (role === 'PROFESSOR' && !isAcademicEmail(email)) {
    res.status(400).json({
      error: 'Professor accounts require a university email address (e.g. name@university.edu).',
    });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const verificationToken = uuidv4();

  const user = await prisma.user.create({
    data: { email, password: hashed, role, verificationToken },
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch {
    // Don't block signup if email fails in dev
    console.warn('Failed to send verification email');
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  res.status(201).json({
    message: 'Account created. Please verify your email.',
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, emailVerified: user.emailVerified },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  const profile =
    user.role === 'STUDENT'
      ? await prisma.studentProfile.findUnique({ where: { userId: user.id } })
      : await prisma.professorProfile.findUnique({ where: { userId: user.id } });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      hasProfile: !!profile,
      profileId: profile?.id ?? null,
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.query as { token: string };
  if (!token) {
    res.status(400).json({ error: 'Token required' });
    return;
  }

  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  res.json({ message: 'Email verified successfully' });
}

export async function resendVerification(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (user.emailVerified) {
    res.status(400).json({ error: 'Your email is already verified.' });
    return;
  }

  const verificationToken = uuidv4();
  await prisma.user.update({ where: { id: user.id }, data: { verificationToken } });

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch {
    res.status(502).json({ error: 'Could not send the email right now. Please try again shortly.' });
    return;
  }

  res.json({ message: 'Verification email sent. Check your inbox (and spam folder).' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (user) {
    const token = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
    try {
      await sendPasswordResetEmail(email, token);
    } catch {
      console.warn('Failed to send password reset email');
    }
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    token: z.string(),
    password: z.string().min(8),
  });
  const { token, password } = schema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ message: 'Password reset successfully' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, role: true, emailVerified: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const profile =
    user.role === 'STUDENT'
      ? await prisma.studentProfile.findUnique({ where: { userId: user.id } })
      : await prisma.professorProfile.findUnique({ where: { userId: user.id } });

  res.json({
    ...user,
    hasProfile: !!profile,
    profileId: profile?.id ?? null,
    profile,
  });
}
