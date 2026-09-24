/**
 * Security and URL Sanitizer utility
 */

export function sanitizeSafeUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Allow standard relative URLs or http/https URLs or data image URLs
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:')
  ) {
    // Strip script vectors or javascript: pseudo protocols
    if (/javascript\s*:/i.test(trimmed) || /data\s*:\s*text\/html/i.test(trimmed)) {
      return '';
    }
    return trimmed;
  }

  return '';
}

export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}

export function sanitizeRichHtml(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}

export function sanitizeLatexSource(input: string | undefined | null): string {
  if (!input) return '';
  return String(input)
    .replace(/\\(write18|input|include|catcode|def|let|futurelet|csname|endcsname)\b/gi, '')
    .trim();
}
