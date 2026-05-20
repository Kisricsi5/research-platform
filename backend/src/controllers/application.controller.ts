import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';
import { sendApplicationStatusEmail, sendNewApplicationEmail } from '../utils/email';

const applicationSchema = z.object({
  professorId: z.string(),
  projectId: z.string().optional().nullable(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(5000),
  availability: z.string().max(500).optional().nullable(),
});

export async function submitApplication(req: AuthRequest, res: Response): Promise<void> {
  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!studentProfile) {
    res.status(400).json({ error: 'Please complete your student profile before applying' });
    return;
  }

  const data = applicationSchema.parse(req.body);

  // Check for duplicate application
  const existing = await prisma.application.findFirst({
    where: {
      studentId: studentProfile.id,
      professorId: data.professorId,
      ...(data.projectId ? { projectId: data.projectId } : {}),
    },
  });

  if (existing) {
    res.status(409).json({ error: 'You have already applied to this professor/project' });
    return;
  }

  const professor = await prisma.professorProfile.findUnique({
    where: { id: data.professorId },
    include: { user: { select: { email: true } } },
  });

  if (!professor) {
    res.status(404).json({ error: 'Professor not found' });
    return;
  }

  const application = await prisma.application.create({
    data: {
      studentId: studentProfile.id,
      professorId: data.professorId,
      projectId: data.projectId ?? null,
      coverLetter: data.coverLetter,
      availability: data.availability ?? null,
    },
    include: { project: { select: { title: true } } },
  });

  // Notify professor
  await prisma.notification.create({
    data: {
      userId: professor.userId,
      type: 'APPLICATION_RECEIVED',
      title: 'New application received',
      message: `${studentProfile.firstName} ${studentProfile.lastName} applied to ${application.project?.title ?? 'your research group'}`,
      metadata: { applicationId: application.id },
    },
  });

  const projectTitle = application.project?.title ?? 'your research group';
  try {
    await sendNewApplicationEmail(
      professor.user.email,
      `${professor.firstName} ${professor.lastName}`,
      `${studentProfile.firstName} ${studentProfile.lastName}`,
      projectTitle,
    );
  } catch {
    console.warn('Failed to send new application email');
  }

  res.status(201).json(application);
}

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
}

export async function markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { isRead: true },
  });
  res.json({ message: 'Marked as read' });
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ message: 'All notifications marked as read' });
}
