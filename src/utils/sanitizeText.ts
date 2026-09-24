/**
 * Sanitizes user input string against XSS, script injection, and malicious characters
 */
export function sanitizeUserInput(input: string | undefined | null): string {
  if (!input) return '';
  if (typeof input !== 'string') return String(input);

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}
