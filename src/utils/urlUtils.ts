export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const decodeSlug = (slug: string): string => {
  return slug
    .replace(/-/g, ' ')
    .replace(/\band\b/g, '&')
    .replace(/\b\w/g, l => l.toUpperCase());
};