import api from './client';
import { User } from '../types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  signup: (data: { email: string; password: string; role: 'STUDENT' | 'PROFESSOR' }) =>
    api.post<LoginResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  getMe: () => api.get<User>('/auth/me').then((r) => r.data),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then((r) => r.data),
};
