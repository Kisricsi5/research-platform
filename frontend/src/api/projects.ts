import api from './client';
import { ResearchProject, PaginatedResponse } from '../types';

export const projectsApi = {
  list: (params?: { q?: string; compensationType?: string; university?: string; year?: string; maxHours?: number; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<ResearchProject>>('/projects', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ResearchProject>(`/projects/${id}`).then((r) => r.data),

  getMine: () =>
    api.get<ResearchProject[]>('/professor/projects').then((r) => r.data),

  create: (data: Partial<ResearchProject>) =>
    api.post<ResearchProject>('/professor/projects', data).then((r) => r.data),

  update: (id: string, data: Partial<ResearchProject>) =>
    api.put<ResearchProject>(`/professor/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/professor/projects/${id}`).then((r) => r.data),
};
