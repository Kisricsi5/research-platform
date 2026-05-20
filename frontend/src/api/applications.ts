import api from './client';
import { Application, PaginatedResponse } from '../types';

export const applicationsApi = {
  // Student
  submit: (data: { professorId: string; projectId?: string | null; coverLetter: string; availability?: string }) =>
    api.post<Application>('/student/applications', data).then((r) => r.data),

  getMyApplications: () =>
    api.get<Application[]>('/student/applications').then((r) => r.data),

  getMyApplication: (id: string) =>
    api.get<Application>(`/student/applications/${id}`).then((r) => r.data),

  // Professor
  getReceived: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Application>>('/professor/applications', { params }).then((r) => r.data),

  getReceivedById: (id: string) =>
    api.get<Application>(`/professor/applications/${id}`).then((r) => r.data),

  updateStatus: (id: string, data: { status: string; professorNotes?: string }) =>
    api.put<Application>(`/professor/applications/${id}/status`, data).then((r) => r.data),
};
