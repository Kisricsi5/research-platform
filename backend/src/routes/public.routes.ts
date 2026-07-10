import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as professor from '../controllers/professor.controller';
import * as project from '../controllers/project.controller';
import * as application from '../controllers/application.controller';
import * as message from '../controllers/message.controller';

const router = Router();

// Try to attach user if token present, but don't require it
function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (auth) {
    authenticate(req as any, res, next);
  } else {
    next();
  }
}

router.get('/professors', optionalAuth, asyncHandler(professor.listProfessors));
router.get('/professors/:id', optionalAuth, asyncHandler(professor.getProfessorById));
router.get('/projects', asyncHandler(project.listProjects));
router.get('/projects/:id', asyncHandler(project.getProjectById));

// Application message thread (only the two parties of the application)
router.get('/applications/:id/messages', authenticate, asyncHandler(message.listMessages));
router.post('/applications/:id/messages', authenticate, asyncHandler(message.sendMessage));

// Notifications (any authenticated user)
router.get('/notifications', authenticate, asyncHandler(application.getNotifications));
router.patch('/notifications/:id/read', authenticate, asyncHandler(application.markNotificationRead));
router.patch('/notifications/read-all', authenticate, asyncHandler(application.markAllNotificationsRead));

export default router;
