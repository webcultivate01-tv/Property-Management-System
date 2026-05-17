import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, period = 'one-time') {
  if (price == null) return '—';
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  const formatted = formatter.format(price);
  if (period === 'monthly') return `${formatted}/mo`;
  if (period === 'yearly') return `${formatted}/yr`;
  return formatted;
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function timeAgo(date) {
  if (!date) return '';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
}

export const propertyTypeLabels = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  plot: 'Plot',
  commercial: 'Commercial',
  office: 'Office',
  pg: 'PG / Hostel',
};

export const statusColors = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  sold: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  rented: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  draft: 'bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  new: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  interested: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  closed: 'bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  spam: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};
