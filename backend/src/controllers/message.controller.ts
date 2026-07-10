import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../types';

const messageSchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(3000),
});

/**
 * Loads the application and verifies the requester is one of its two parties.
 * Returns null (after sending the response) when unauthorized.
 */
async function getAuthorizedApplication(req: AuthRequest, res: Response) {
  const app = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      student: { select: { userId: true, firstName: true, lastName: true } },
      professor: { select: { userId: true, firstName: true, lastName: true } },
      project: { select: { title: true } },
    },
  });

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return null;
  }

  const userId = req.user!.userId;
  if (app.student.userId !== userId && app.professor.userId !== userId) {
    res.status(403).json({ error: 'You do not have access to this conversation' });
    return null;
  }

  return app;
}

export async function listMessages(req: AuthRequest, res: Response): Promise<void> {
  const app = await getAuthorizedApplication(req, res);
  if (!app) return;

  const messages = await prisma.applicationMessage.findMany({
    where: { applicationId: app.id },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  res.json(messages);
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  const app = await getAuthorizedApplication(req, res);
  if (!app) return;

  const { body } = messageSchema.parse(req.body);
  const senderId = req.user!.userId;

  const message = await prisma.applicationMessage.create({
    data: { applicationId: app.id, senderId, body },
  });

  // Notify the other party in-app (messaging is deliberately email-free)
  const senderIsProfessor = senderId === app.professor.userId;
  const recipientUserId = senderIsProfessor ? app.student.userId : app.professor.userId;
  const senderName = senderIsProfessor
    ? `${app.professor.firstName} ${app.professor.lastName}`
    : `${app.student.firstName} ${app.student.lastName}`;

  try {
    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'MESSAGE_RECEIVED',
        title: `New message from ${senderName}`,
        message: body.length > 120 ? `${body.slice(0, 120)}…` : body,
        metadata: { applicationId: app.id },
      },
    });
  } catch (err) {
    console.warn('Failed to create message notification:', err);
  }

  res.status(201).json(message);
}
