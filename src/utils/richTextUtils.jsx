import React from 'react';

export const isHtml = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(val);
};

export const plainToHtml = (text) => {
  if (!text) return '<p></p>';
  if (isHtml(text)) return text;
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withBold = escaped
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*(?!\*)([^*\n]+?)(?<!\*)\*(?!\*)/g, '<strong>$1</strong>');
  return withBold
    .split('\n')
    .map(line => `<p>${line || '<br>'}</p>`)
    .join('');
};

export const renderRichText = (value, style = {}) => {
  if (!value) return null;
  const html = isHtml(value) ? value : plainToHtml(value);
  return (
    <div
      className="rich-text-output"
      style={{ lineHeight: '1.5', ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const renderRichTextHtml = (value) => {
  if (!value) return '';
  return isHtml(value) ? value : plainToHtml(value);
};
