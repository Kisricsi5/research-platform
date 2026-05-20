import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadCV, uploadAvatar } from '../middleware/upload';
import * as student from '../controllers/student.controller';
import * as application from '../controllers/application.controller';

const router = Router();

router.use(authenticate, requireRole('STUDENT'));

router.get('/profile', student.getProfile);
router.put('/profile', student.upsertProfile);
router.post('/cv', uploadCV.single('cv'), student.uploadCV);
router.post('/avatar', uploadAvatar.single('avatar'), student.uploadAvatar);

router.get('/applications', student.getApplications);
router.get('/applications/:id', student.getApplication);
router.post('/applications', application.submitApplication);

router.get('/saved-professors', student.getSavedProfessors);
router.post('/saved-professors', student.saveProfessor);
router.delete('/saved-professors/:professorId', student.unsaveProfessor);

export default router;
