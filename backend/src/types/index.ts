import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ProfessorSearchQuery extends PaginationQuery {
  q?: string;
  department?: string;
  researchArea?: string;
  acceptingStudents?: string;
  university?: string;
}

export interface ProjectSearchQuery extends PaginationQuery {
  q?: string;
  skills?: string;
  major?: string;
  compensationType?: string;
  isActive?: string;
}
