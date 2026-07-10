import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApplicationStatus, CompensationType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function getAvatarUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `/${path.replace(/\\/g, '/')}`;
}

export const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  INTERVIEW_REQUESTED: 'Interview Requested',
};

export const statusColors: Record<ApplicationStatus, string> = {
  PENDING: 'badge-gray',
  UNDER_REVIEW: 'badge-blue',
  ACCEPTED: 'badge-green',
  REJECTED: 'badge-red',
  INTERVIEW_REQUESTED: 'badge-yellow',
};

export const compensationLabels: Record<CompensationType, string> = {
  UNPAID: 'Unpaid / Volunteer',
  PAID: 'Paid',
  CREDIT: 'Course Credit',
  STIPEND: 'Stipend',
};

export const compensationColors: Record<CompensationType, string> = {
  UNPAID: 'badge-gray',
  PAID: 'badge-green',
  CREDIT: 'badge-blue',
  STIPEND: 'badge-yellow',
};

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
