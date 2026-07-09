import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { ProjectSearchQuery } from '../types';

const projectSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(10).max(5000),
  requiredSkills: z.array(z.string()).default([]),
  preferredMajors: z.array(z.string()).default([]),
  preferredYears: z.array(z.enum(['freshman', 'sophomore', 'junior', 'senior', 'graduate'])).default([]),
  hoursPerWeek: z.coerce.number().int().min(1).max(60).optional().nullable(),
  duration: z.string().max(100).optional().nullable(),
  compensationType: z.enum(['UNPAID', 'PAID', 'CREDIT', 'STIPEND']).default('UNPAID'),
  applicationDeadline: z.string().datetime().optional().nullable().or(z.literal('')),
  openToOtherUniversities: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({
    where: { userId: req.user!.userId },
    include: { user: { select: { emailVerified: true } } },
  });
  if (!profile) {
    res.status(400).json({ error: 'Please complete your profile first' });
    return;
  }

  if (!profile.user.emailVerified) {
    res.status(403).json({
      error: 'Please verify your university email before posting an opportunity. Check your inbox for the verification link.',
      code: 'EMAIL_NOT_VERIFIED',
    });
    return;
  }

  const data = projectSchema.parse(req.body);
  const project = await prisma.researchProject.create({
    data: {
      ...data,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
      professorId: profile.id,
    },
  });

  res.status(201).json(project);
}

export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const project = await prisma.researchProject.findFirst({
    where: { id: req.params.id, professorId: profile.id },
  });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const data = projectSchema.partial().parse(req.body);
  const updated = await prisma.researchProject.update({
    where: { id: req.params.id },
    data: {
      ...data,
      applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
    },
  });

  res.json(updated);
}

export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const project = await prisma.researchProject.findFirst({
    where: { id: req.params.id, professorId: profile.id },
  });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  await prisma.researchProject.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
}

export async function getMyProjects(req: AuthRequest, res: Response): Promise<void> {
  const profile = await prisma.professorProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) {
    res.json([]);
    return;
  }

  const projects = await prisma.researchProject.findMany({
    where: { professorId: profile.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(projects);
}

export async function listProjects(req: AuthRequest, res: Response): Promise<void> {
  const query = req.query as ProjectSearchQuery;
  const { take, skip, page } = getPagination(query.page, query.limit);

  const where: Record<string, unknown> = {};

  if (query.isActive !== 'false') {
    where.isActive = true;
    where.isFilled = false;
  }

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.compensationType) {
    where.compensationType = query.compensationType;
  }

  if (query.university) {
    // "My university only": projects from this university that any student may
    // see, i.e. all of that university's postings (restricted ones included,
    // since the requester belongs to it).
    where.professor = {
      university: { equals: query.university, mode: 'insensitive' },
    };
  }

  const [projects, total] = await Promise.all([
    prisma.researchProject.findMany({
      where,
      skip,
      take,
      include: {
        professor: {
          select: {
            id: true, firstName: true, lastName: true, title: true,
            department: true, university: true, profilePicture: true,
            user: { select: { emailVerified: true } },
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.researchProject.count({ where }),
  ]);

  res.json({ data: projects, meta: buildPaginationMeta(total, page, take) });
}

export async function getProjectById(req: AuthRequest, res: Response): Promise<void> {
  const project = await prisma.researchProject.findUnique({
    where: { id: req.params.id },
    include: {
      professor: {
        select: {
          id: true, firstName: true, lastName: true, title: true,
          department: true, university: true, profilePicture: true,
          bio: true, researchAreas: true, labName: true, acceptingStudents: true,
          user: { select: { emailVerified: true } },
        },
      },
    },
  });

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  res.json(project);
}
