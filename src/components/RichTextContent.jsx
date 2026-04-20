'use client';

function looksLikeHtml(value = '') {
  return /<[^>]+>/.test(value);
}

function normalizeHtml(html = '') {
  if (!html) return '';
  return looksLikeHtml(html)
    ? html
    : html
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('');
}

/**
 * @param {{ html: string, className?: string, style?: import('react').CSSProperties }} props
 */
export default function RichTextContent({
  html,
  className = '',
  style = undefined,
}) {
  const normalized = normalizeHtml(html);

  if (!normalized) return null;

  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: normalized }}
    />
  );
}
