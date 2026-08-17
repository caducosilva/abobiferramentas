// Comparação de texto linha a linha, usada pelo Comparador de Textos.
//
// O algoritmo é o clássico da maior subsequência comum (LCS): a tabela de programação dinâmica
// diz o maior trecho que as duas versões têm em comum, e o caminho de volta por ela transforma
// isso na lista de linhas iguais, removidas e adicionadas. É o mesmo princípio do `diff` do git.

export type DiffType = 'igual' | 'removido' | 'adicionado';

export interface DiffLine {
  type: DiffType;
  text: string;
  /** Número da linha no texto original (undefined quando a linha só existe no novo) */
  leftNumber?: number;
  /** Número da linha no texto novo (undefined quando a linha só existe no original) */
  rightNumber?: number;
}

export interface DiffSummary {
  lines: DiffLine[];
  added: number;
  removed: number;
  unchanged: number;
  /** true quando a entrada passou do limite e a comparação caiu para o modo posicional */
  truncated: boolean;
}

// A tabela LCS ocupa (n+1)*(m+1) inteiros. Acima disso o navegador engasgaria, então textos
// gigantes caem para uma comparação posicional, que é mais pobre mas instantânea.
const MAX_LINES_FOR_LCS = 1500;

export interface DiffOptions {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
}

function normalize(line: string, options: DiffOptions): string {
  let result = line;
  if (options.ignoreWhitespace) result = result.trim().replace(/\s+/g, ' ');
  if (options.ignoreCase) result = result.toLowerCase();
  return result;
}

function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.replace(/\r\n/g, '\n').split('\n');
}

/** Fallback para entradas muito grandes: compara linha N com linha N, sem detectar deslocamento. */
function positionalDiff(left: string[], right: string[], options: DiffOptions): DiffSummary {
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  const total = Math.max(left.length, right.length);
  for (let i = 0; i < total; i++) {
    const leftLine = left[i];
    const rightLine = right[i];

    if (leftLine !== undefined && rightLine !== undefined) {
      if (normalize(leftLine, options) === normalize(rightLine, options)) {
        lines.push({ type: 'igual', text: rightLine, leftNumber: i + 1, rightNumber: i + 1 });
        unchanged++;
      } else {
        lines.push({ type: 'removido', text: leftLine, leftNumber: i + 1 });
        lines.push({ type: 'adicionado', text: rightLine, rightNumber: i + 1 });
        removed++;
        added++;
      }
    } else if (leftLine !== undefined) {
      lines.push({ type: 'removido', text: leftLine, leftNumber: i + 1 });
      removed++;
    } else if (rightLine !== undefined) {
      lines.push({ type: 'adicionado', text: rightLine, rightNumber: i + 1 });
      added++;
    }
  }

  return { lines, added, removed, unchanged, truncated: true };
}

export function diffTexts(
  originalText: string,
  newText: string,
  options: DiffOptions = {}
): DiffSummary {
  const left = splitLines(originalText);
  const right = splitLines(newText);

  if (left.length > MAX_LINES_FOR_LCS || right.length > MAX_LINES_FOR_LCS) {
    return positionalDiff(left, right, options);
  }

  const leftKeys = left.map((line) => normalize(line, options));
  const rightKeys = right.map((line) => normalize(line, options));

  // table[i][j] = tamanho da maior subsequência comum entre left[i..] e right[j..]
  const table: number[][] = Array.from({ length: left.length + 1 }, () =>
    new Array(right.length + 1).fill(0)
  );

  for (let i = left.length - 1; i >= 0; i--) {
    for (let j = right.length - 1; j >= 0; j--) {
      table[i][j] =
        leftKeys[i] === rightKeys[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (leftKeys[i] === rightKeys[j]) {
      lines.push({ type: 'igual', text: right[j], leftNumber: i + 1, rightNumber: j + 1 });
      unchanged++;
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      lines.push({ type: 'removido', text: left[i], leftNumber: i + 1 });
      removed++;
      i++;
    } else {
      lines.push({ type: 'adicionado', text: right[j], rightNumber: j + 1 });
      added++;
      j++;
    }
  }

  while (i < left.length) {
    lines.push({ type: 'removido', text: left[i], leftNumber: i + 1 });
    removed++;
    i++;
  }
  while (j < right.length) {
    lines.push({ type: 'adicionado', text: right[j], rightNumber: j + 1 });
    added++;
    j++;
  }

  return { lines, added, removed, unchanged, truncated: false };
}
