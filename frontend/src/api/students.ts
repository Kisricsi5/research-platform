import api from './client';
import { StudentProfile } from '../types';

export const studentsApi = {
  getProfile: () =>
    api.get<StudentProfile>('/student/profile').then((r) => r.data),

  upsertProfile: (data: Partial<StudentProfile>) =>
    api.put<StudentProfile>('/student/profile', data).then((r) => r.data),

  uploadCV: (file: File) => {
    const form = new FormData();
    form.append('cv', file);
    return api.post('/student/cv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/student/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getSavedProfessors: () =>
    api.get('/student/saved-professors').then((r) => r.data),

  saveProfessor: (professorId: string) =>
    api.post('/student/saved-professors', { professorId }).then((r) => r.data),

  unsaveProfessor: (professorId: string) =>
    api.delete(`/student/saved-professors/${professorId}`).then((r) => r.data),
};
