export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
}

export function calculateTextStats(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const wordsArray = text.trim().split(/\s+/).filter(Boolean);
  const words = wordsArray.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length;
  const lines = text.split(/\n/).length;
  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
  };
}

export function transformText(text: string, type: string): string {
  if (!text) return '';

  switch (type) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'titlecase':
      return text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    case 'sentencecase':
      return text
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s+)([a-zà-ú])/g, (match) => match.toUpperCase());
    case 'camelcase':
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');
    case 'kebabcase':
    case 'slugify':
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    case 'snakecase':
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    case 'removeSpaces':
      return text.replace(/[ \t]+/g, ' ').trim();
    case 'removeDuplicateLines':
      return Array.from(new Set(text.split('\n'))).join('\n');
    case 'sortLines':
      return text
        .split('\n')
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .join('\n');
    default:
      return text;
  }
}

export function getTopWords(text: string, limit = 5): { word: string; count: number }[] {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');

  const words = clean.split(/\s+/).filter((w) => w.length > 2); // ignore tiny stop words
  const counts: Record<string, number> = {};

  for (const w of words) {
    counts[w] = (counts[w] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
