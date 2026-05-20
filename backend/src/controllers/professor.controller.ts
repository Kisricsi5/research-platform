import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { ProfessorSearchQuery } from '../types';
import fs from 'fs';

const profileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  department: z.string().min(1).max(200),
  university: z.string().min(1).max(200),
  researchAreas: z.array(z.string()).default([]),
  labName: z.string().max(200).optional().nullable(),
  labWebsite: z.string().url().optional().nullable().or(z.literal('')),
  bio: z.string().max(3000).optional().nullable(),
  acceptingStudents: z.boolean().default(true),
});

export async function getOwnProfile(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({
    where: { userId: req.user!.userId },
    include: { projects: true },
  });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }
  res.json(profile);
}

export async function upsertProfile(req: AuthRequest, res: Response): Promise<void> {
  const data = profileSchema.parse(req.body);

  const profile = await prisma.professorProfile.upsert({
    where: { userId: req.user!.userId },
    update: data,
    create: { ...data, userId: req.user!.userId },
  });

  res.json(profile);
}

export async function uploadAvatar(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (profile?.profilePicture) {
    if (fs.existsSync(profile.profilePicture)) fs.unlinkSync(profile.profilePicture);
  }

  const updated = await prisma.professorProfile.upsert({
    where: { userId: req.user!.userId },
    update: { profilePicture: req.file.path },
    create: {
      userId: req.user!.userId,
      firstName: '', lastName: '', title: '', department: '', university: '',
      profilePicture: req.file.path,
    },
  });

  res.json({ profilePicture: updated.profilePicture });
}

export async function listProfessors(req: AuthRequest, res: Response): Promise<void> {
  const query = req.query as ProfessorSearchQuery;
  const { take, skip, page } = getPagination(query.page, query.limit);

  const where: Record<string, unknown> = {};

  if (query.q) {
    where.OR = [
      { firstName: { contains: query.q, mode: 'insensitive' } },
      { lastName: { contains: query.q, mode: 'insensitive' } },
      { department: { contains: query.q, mode: 'insensitive' } },
      { bio: { contains: query.q, mode: 'insensitive' } },
      { labName: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.department) {
    where.department = { contains: query.department, mode: 'insensitive' };
  }

  if (query.university) {
    where.university = { contains: query.university, mode: 'insensitive' };
  }

  if (query.researchArea) {
    where.researchAreas = { has: query.researchArea };
  }

  if (query.acceptingStudents === 'true') {
    where.acceptingStudents = true;
  }

  const [professors, total] = await Promise.all([
    prisma.professorProfile.findMany({
      where,
      skip,
      take,
      select: {
        id: true, firstName: true, lastName: true, title: true,
        department: true, university: true, researchAreas: true,
        labName: true, bio: true, profilePicture: true, acceptingStudents: true,
        _count: { select: { projects: { where: { isActive: true } } } },
      },
      orderBy: { lastName: 'asc' },
    }),
    prisma.professorProfile.count({ where }),
  ]);

  res.json({ data: professors, meta: buildPaginationMeta(total, page, take) });
}

export async function getProfessorById(req: AuthRequest, res: Response): Promise<void> {
  const professor = await prisma.professorProfile.findUnique({
    where: { id: req.params.id },
    include: {
      projects: {
        where: { isActive: true, isFilled: false },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!professor) {
    res.status(404).json({ error: 'Professor not found' });
    return;
  }

  // If student is logged in, check if they've saved this professor
  let isSaved = false;
  if (req.user?.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.userId } });
    if (studentProfile) {
      const saved = await prisma.savedProfessor.findUnique({
        where: { studentId_professorId: { studentId: studentProfile.id, professorId: professor.id } },
      });
      isSaved = !!saved;
    }
  }

  res.json({ ...professor, isSaved });
}

// Applications management
export async function getReceivedApplications(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const { status, page, limit } = req.query as { status?: string; page?: string; limit?: string };
  const { take, skip, page: pageNum } = getPagination(page, limit);

  const where: Record<string, unknown> = { professorId: profile.id };
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take,
      include: {
        student: {
          select: {
            id: true, firstName: true, lastName: true, major: true,
            graduationYear: true, gpa: true, skills: true,
            researchInterests: true, profilePicture: true, university: true,
          },
        },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.count({ where }),
  ]);

  res.json({ data: applications, meta: buildPaginationMeta(total, pageNum, take) });
}

export async function getApplicationById(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const app = await prisma.application.findFirst({
    where: { id: req.params.id, professorId: profile.id },
    include: {
      student: true,
      project: true,
    },
  });

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  res.json(app);
}

export async function updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const schema = z.object({
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'INTERVIEW_REQUESTED']),
    professorNotes: z.string().max(2000).optional(),
  });

  const { status, professorNotes } = schema.parse(req.body);

  const app = await prisma.application.findFirst({
    where: { id: req.params.id, professorId: profile.id },
    include: { student: { select: { userId: true, firstName: true } } },
  });

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: { status, ...(professorNotes !== undefined ? { professorNotes } : {}) },
  });

  // Create in-app notification for the student
  await prisma.notification.create({
    data: {
      userId: app.student.userId,
      type: 'STATUS_UPDATE',
      title: 'Application status updated',
      message: `Your application status changed to: ${status.replace('_', ' ')}`,
      metadata: { applicationId: app.id, status },
    },
  });

  res.json(updated);
}

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [activeProjects, totalApplications, recentApplications, pendingApplications] = await Promise.all([
    prisma.researchProject.count({ where: { professorId: profile.id, isActive: true } }),
    prisma.application.count({ where: { professorId: profile.id } }),
    prisma.application.count({ where: { professorId: profile.id, createdAt: { gte: sevenDaysAgo } } }),
    prisma.application.count({ where: { professorId: profile.id, status: 'PENDING' } }),
  ]);

  res.json({ activeProjects, totalApplications, recentApplications, pendingApplications });
}
