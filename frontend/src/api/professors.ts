import api from './client';
import { ProfessorProfile, PaginatedResponse } from '../types';

export interface ProfessorSearchParams {
  q?: string;
  department?: string;
  researchArea?: string;
  acceptingStudents?: boolean;
  university?: string;
  page?: number;
  limit?: number;
}

export const professorsApi = {
  list: (params: ProfessorSearchParams) =>
    api.get<PaginatedResponse<ProfessorProfile>>('/professors', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ProfessorProfile>(`/professors/${id}`).then((r) => r.data),

  getOwnProfile: () =>
    api.get<ProfessorProfile>('/professor/profile').then((r) => r.data),

  upsertProfile: (data: Partial<ProfessorProfile>) =>
    api.put<ProfessorProfile>('/professor/profile', data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/professor/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getDashboard: () =>
    api.get('/professor/dashboard').then((r) => r.data),
};
