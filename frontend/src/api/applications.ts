import api from './client';
import { Application, ApplicationMessage, PaginatedResponse } from '../types';

export interface FitAnalysis {
  fitLevel: 'Strong' | 'Moderate' | 'Limited';
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestedQuestions: string[];
}

export const applicationsApi = {
  // Student
  submit: (data: { professorId: string; projectId?: string | null; coverLetter: string; availability?: string }) =>
    api.post<Application>('/student/applications', data).then((r) => r.data),

  getMyApplications: () =>
    api.get<Application[]>('/student/applications').then((r) => r.data),

  getMyApplication: (id: string) =>
    api.get<Application>(`/student/applications/${id}`).then((r) => r.data),

  // Professor
  getReceived: (params?: { status?: string; page?: number; limit?: number; project?: string }) =>
    api.get<PaginatedResponse<Application>>('/professor/applications', { params }).then((r) => r.data),

  getReceivedById: (id: string) =>
    api.get<Application>(`/professor/applications/${id}`).then((r) => r.data),

  updateStatus: (id: string, data: { status: string; professorNotes?: string }) =>
    api.put<Application>(`/professor/applications/${id}/status`, data).then((r) => r.data),

  analyzeFit: (id: string) =>
    api.post<FitAnalysis>(`/professor/applications/${id}/analyze`).then((r) => r.data),
};

export const messagesApi = {
  list: (applicationId: string) =>
    api.get<ApplicationMessage[]>(`/applications/${applicationId}/messages`).then((r) => r.data),

  send: (applicationId: string, body: string) =>
    api.post<ApplicationMessage>(`/applications/${applicationId}/messages`, { body }).then((r) => r.data),
};

export const configApi = {
  get: () => api.get<{ aiFitAnalysis: boolean }>('/config').then((r) => r.data),
};
