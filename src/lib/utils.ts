import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts Persian and Arabic numerals to English digits.
 */
export function en(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

/**
 * Converts English digits to Persian numerals.
 */
export function fa(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] || d);
}

/**
 * Formats a number with Persian digits (۰–۹), thousands separator «٬» (U+066C), and «تومان».
 */
export function formatToman(num: number | string, includeUnit = true): string {
  if (num === undefined || num === null || num === '') return '';
  const clean = en(num).replace(/\D/g, '');
  if (!clean) return '';
  const withSeparators = clean.replace(/\B(?=(\d{3})+(?!\d))/g, '\u066C');
  const persianDigits = fa(withSeparators);
  return includeUnit ? `${persianDigits} تومان` : persianDigits;
}

