import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import * as professor from '../controllers/professor.controller';
import * as project from '../controllers/project.controller';

const router = Router();

router.use(authenticate, requireRole('PROFESSOR'));

router.get('/profile', professor.getOwnProfile);
router.put('/profile', professor.upsertProfile);
router.post('/avatar', uploadAvatar.single('avatar'), professor.uploadAvatar);
router.get('/dashboard', professor.getDashboardStats);

router.get('/projects', project.getMyProjects);
router.post('/projects', project.createProject);
router.put('/projects/:id', project.updateProject);
router.delete('/projects/:id', project.deleteProject);

router.get('/applications', professor.getReceivedApplications);
router.get('/applications/:id', professor.getApplicationById);
router.post('/applications/:id/analyze', professor.analyzeApplicationFit);
router.put('/applications/:id/status', professor.updateApplicationStatus);

export default router;
