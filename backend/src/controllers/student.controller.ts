import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import path from 'path';
import fs from 'fs';

const profileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  university: z.string().min(1).max(200),
  major: z.string().min(1).max(200),
  graduationYear: z.coerce.number().int().min(2020).max(2035),
  gpa: z.coerce.number().min(0).max(4.0).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  skills: z.array(z.string()).default([]),
  researchInterests: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
});

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  res.json(profile);
}

export async function upsertProfile(req: AuthRequest, res: Response): Promise<void> {
  const data = profileSchema.parse(req.body);

  const profile = await prisma.studentProfile.upsert({
    where: { userId: req.user!.userId },
    update: data,
    create: { ...data, userId: req.user!.userId },
  });

  res.json(profile);
}

export async function uploadCV(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });

  // Remove old CV if exists
  if (profile?.cvFilePath) {
    const oldPath = profile.cvFilePath;
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const cvFilePath = req.file.path;
  const updated = await prisma.studentProfile.upsert({
    where: { userId: req.user!.userId },
    update: { cvFilePath },
    create: {
      userId: req.user!.userId,
      firstName: '',
      lastName: '',
      university: '',
      major: '',
      graduationYear: new Date().getFullYear(),
      cvFilePath,
    },
  });

  res.json({ cvFilePath: updated.cvFilePath, message: 'CV uploaded successfully' });
}

export async function uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (profile?.profilePicture) {
    const oldPath = profile.profilePicture;
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const profilePicture = req.file.path;
  const updated = await prisma.studentProfile.upsert({
    where: { userId: req.user!.userId },
    update: { profilePicture },
    create: {
      userId: req.user!.userId,
      firstName: '',
      lastName: '',
      university: '',
      major: '',
      graduationYear: new Date().getFullYear(),
      profilePicture,
    },
  });

  res.json({ profilePicture: updated.profilePicture });
}

export async function getApplications(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const applications = await prisma.application.findMany({
    where: { studentId: profile.id },
    include: {
      professor: {
        select: {
          id: true, firstName: true, lastName: true, title: true,
          department: true, university: true, profilePicture: true,
        },
      },
      project: {
        select: { id: true, title: true, compensationType: true, hoursPerWeek: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(applications);
}

export async function getApplication(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const app = await prisma.application.findFirst({
    where: { id: req.params.id, studentId: profile.id },
    include: {
      professor: true,
      project: true,
    },
  });

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  res.json(app);
}

export async function getSavedProfessors(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.json([]);
    return;
  }

  const saved = await prisma.savedProfessor.findMany({
    where: { studentId: profile.id },
    include: {
      professor: {
        select: {
          id: true, firstName: true, lastName: true, title: true,
          department: true, university: true, profilePicture: true,
          researchAreas: true, acceptingStudents: true, bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(saved);
}

export async function saveProfessor(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(400).json({ error: 'Please complete your profile first' });
    return;
  }

  const { professorId } = z.object({ professorId: z.string() }).parse(req.body);

  const professor = await prisma.professorProfile.findUnique({ where: { id: professorId } });
  if (!professor) {
    res.status(404).json({ error: 'Professor not found' });
    return;
  }

  const saved = await prisma.savedProfessor.upsert({
    where: { studentId_professorId: { studentId: profile.id, professorId } },
    update: {},
    create: { studentId: profile.id, professorId },
  });

  res.status(201).json(saved);
}

export async function unsaveProfessor(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  await prisma.savedProfessor.deleteMany({
    where: { studentId: profile.id, professorId: req.params.professorId },
  });

  res.json({ message: 'Removed from saved' });
}
