import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as professor from '../controllers/professor.controller';
import * as project from '../controllers/project.controller';
import * as application from '../controllers/application.controller';

const router = Router();

// Public professor/project browsing (auth optional for saved status)
router.get('/professors', (req, res, next) => {
  // Try to attach user if token present, but don't require it
  const auth = req.headers.authorization;
  if (auth) {
    authenticate(req as any, res, next);
  } else {
    next();
  }
}, professor.listProfessors);

router.get('/professors/:id', (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) {
    authenticate(req as any, res, next);
  } else {
    next();
  }
}, professor.getProfessorById);

router.get('/projects', project.listProjects);
router.get('/projects/:id', project.getProjectById);

// Notifications (any authenticated user)
router.get('/notifications', authenticate, application.getNotifications);
router.patch('/notifications/:id/read', authenticate, application.markNotificationRead);
router.patch('/notifications/read-all', authenticate, application.markAllNotificationsRead);

export default router;
