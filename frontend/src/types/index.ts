export type Role = 'STUDENT' | 'PROFESSOR';

export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'INTERVIEW_REQUESTED';

export type CompensationType = 'UNPAID' | 'PAID' | 'CREDIT' | 'STIPEND';

export interface User {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  hasProfile: boolean;
  profileId: string | null;
  profile?: StudentProfile | ProfessorProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number | null;
  bio?: string | null;
  cvFilePath?: string | null;
  profilePicture?: string | null;
  skills: string[];
  researchInterests: string[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  university: string;
  researchAreas: string[];
  labName?: string | null;
  labWebsite?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
  acceptingStudents: boolean;
  /** Present on public professor/project payloads; true once the university email is confirmed. */
  user?: { emailVerified: boolean };
  projects?: ResearchProject[];
  _count?: { projects?: number; applications?: number };
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchProject {
  id: string;
  professorId: string;
  professor?: Pick<ProfessorProfile, 'id' | 'firstName' | 'lastName' | 'title' | 'department' | 'university' | 'profilePicture' | 'user'>;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredMajors: string[];
  preferredYears?: string[];
  hoursPerWeek?: number | null;
  duration?: string | null;
  compensationType: CompensationType;
  applicationDeadline?: string | null;
  openToOtherUniversities?: boolean;
  isActive: boolean;
  isFilled: boolean;
  _count?: { applications: number };
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  professorId: string;
  projectId?: string | null;
  coverLetter: string;
  availability?: string | null;
  status: ApplicationStatus;
  professorNotes?: string | null;
  student?: StudentProfile;
  professor?: Pick<ProfessorProfile, 'id' | 'firstName' | 'lastName' | 'title' | 'department' | 'university' | 'profilePicture' | 'user'>;
  project?: Pick<ResearchProject, 'id' | 'title' | 'compensationType' | 'hoursPerWeek'>;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationMessage {
  id: string;
  applicationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
