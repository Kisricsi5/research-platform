import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import { asyncHandler } from '../utils/asyncHandler';
import * as professor from '../controllers/professor.controller';
import * as project from '../controllers/project.controller';

const router = Router();

router.use(authenticate, requireRole('PROFESSOR'));

router.get('/profile', asyncHandler(professor.getOwnProfile));
router.put('/profile', asyncHandler(professor.upsertProfile));
router.post('/avatar', uploadAvatar.single('avatar'), asyncHandler(professor.uploadAvatar));
router.get('/dashboard', asyncHandler(professor.getDashboardStats));

router.get('/projects', asyncHandler(project.getMyProjects));
router.post('/projects', asyncHandler(project.createProject));
router.put('/projects/:id', asyncHandler(project.updateProject));
router.delete('/projects/:id', asyncHandler(project.deleteProject));

router.get('/applications', asyncHandler(professor.getReceivedApplications));
router.get('/applications/:id', asyncHandler(professor.getApplicationById));
router.get('/applications/:id/cv', asyncHandler(professor.getApplicationCvLink));
router.post('/applications/:id/analyze', asyncHandler(professor.analyzeApplicationFit));
router.put('/applications/:id/status', asyncHandler(professor.updateApplicationStatus));

export default router;
