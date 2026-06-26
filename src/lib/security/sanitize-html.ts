/**
 * Allowlist HTML sanitizer for admin-authored rich text (news articles).
 * Strips scripts, event handlers, and dangerous URLs.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'a', 'h2', 'h3', 'h4', 'blockquote', 'span', 'div',
]);

const GLOBAL_FORBIDDEN = /(<\/?)(script|iframe|object|embed|form|input|button|link|meta|style|svg|math)(\s|>|\/)/gi;
const EVENT_HANDLER = /\s(on\w+|formaction|xmlns)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URL = /(\s(href|src|xlink:href)\s*=\s*["']?\s*)javascript:/gi;
const DATA_URL = /(\s(href|src)\s*=\s*["']?\s*)data:/gi;

function stripForbiddenBlocks(html: string): string {
  return html
    .replace(GLOBAL_FORBIDDEN, '$1')
    .replace(EVENT_HANDLER, '')
    .replace(JS_URL, '$1#blocked')
    .replace(DATA_URL, '$1#blocked');
}

function sanitizeTag(tagMatch: string): string {
  const openMatch = tagMatch.match(/^<\/?([a-z0-9]+)/i);
  if (!openMatch) return '';
  const tagName = openMatch[1].toLowerCase();
  if (!ALLOWED_TAGS.has(tagName)) return '';

  if (tagMatch.startsWith('</')) {
    return `</${tagName}>`;
  }

  if (tagName === 'a') {
    const hrefMatch = tagMatch.match(/\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? '';
    if (href && !/^https?:\/\//i.test(href.trim())) {
      return `<${tagName}>`;
    }
    const safeHref = href.trim().replace(/"/g, '&quot;');
    return safeHref ? `<a href="${safeHref}" rel="noopener noreferrer">` : `<${tagName}>`;
  }

  return `<${tagName}>`;
}

export function sanitizeRichHtml(html: string, maxLength = 50000): string {
  if (!html.trim()) return '';

  let cleaned = stripForbiddenBlocks(html.trim().slice(0, maxLength));
  cleaned = cleaned.replace(/<\/?[a-z][^>]*>/gi, (tag) => sanitizeTag(tag));
  return cleaned;
}
