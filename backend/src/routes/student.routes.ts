import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadCV, uploadAvatar } from '../middleware/upload';
import { asyncHandler } from '../utils/asyncHandler';
import * as student from '../controllers/student.controller';
import * as application from '../controllers/application.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

router.get('/profile', asyncHandler(student.getProfile));
router.put('/profile', asyncHandler(student.upsertProfile));
router.post('/cv', uploadCV.single('cv'), asyncHandler(student.uploadCV));
router.post('/avatar', uploadAvatar.single('avatar'), asyncHandler(student.uploadAvatar));

router.get('/applications', asyncHandler(student.getApplications));
router.get('/applications/:id', asyncHandler(student.getApplication));
router.post('/applications', asyncHandler(application.submitApplication));

router.get('/saved-professors', asyncHandler(student.getSavedProfessors));
router.post('/saved-professors', asyncHandler(student.saveProfessor));
router.delete('/saved-professors/:professorId', asyncHandler(student.unsaveProfessor));

export default router;
