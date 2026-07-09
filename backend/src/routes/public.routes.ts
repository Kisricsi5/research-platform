import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as professor from '../controllers/professor.controller';
import * as project from '../controllers/project.controller';
import * as application from '../controllers/application.controller';

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

// Notifications (any authenticated user)
router.get('/notifications', authenticate, asyncHandler(application.getNotifications));
router.patch('/notifications/:id/read', authenticate, asyncHandler(application.markNotificationRead));
router.patch('/notifications/read-all', authenticate, asyncHandler(application.markAllNotificationsRead));

export default router;
