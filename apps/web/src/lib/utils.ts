import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function getMatchScoreColor(score: number) {
  if (score >= 80) return 'text-[#2D8A6E] bg-[#EBF7F3] border-[#C2E8DC]';
  if (score >= 65) return 'text-[#9A7B2E] bg-[#FBF5E8] border-[#EDE0C0]';
  return 'text-[#C45C5C] bg-[#FBEEEE] border-[#F0D0D0]';
}

export function getMatchBorderColor(score: number | null) {
  if (score == null) return '#E8E2D9';
  if (score >= 80) return '#2D8A6E';
  if (score >= 65) return '#C4A35A';
  return '#C45C5C';
}

export function formatSalary(min?: number | null, max?: number | null, currency = 'USD') {
  if (!min && !max) return 'Not specified';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `${fmt(min)}+` : `Up to ${fmt(max!)}`;
}

export function daysInStage(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}
