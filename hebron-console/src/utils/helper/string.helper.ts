import DOMPurify from 'dompurify';

export const orUndefined = (value?: any) => value || undefined;
export const isNullish = (value: any) => value === null || value === undefined;

/**
 * Sanitizes an HTML string to prevent XSS attacks using DOMPurify.
 */
export const sanitizeHtml = (html?: string | null): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html);
};

/**
 * Strips all HTML tags and entities, returning clean plain text suitable for preview snippets.
 */
export const stripHtml = (html?: string | null): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};
