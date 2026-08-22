import { useState } from 'react';
import { Copy, Check, Trash2, Database, Code2 } from 'lucide-react';

interface SqlFormatterProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function SqlFormatter({ onCopyToast }: SqlFormatterProps) {
  const [inputSql, setInputSql] = useState(
    'SELECT u.id, u.nome, u.email, p.titulo, p.preco, p.criado_em FROM usuarios u INNER JOIN pedidos p ON u.id = p.usuario_id WHERE p.status = "pago" AND p.preco > 100.00 GROUP BY u.id, p.id ORDER BY p.criado_em DESC LIMIT 50;'
  );
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);

  const formatSql = (sql: string): string => {
    if (!sql.trim()) return '';

    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
      'OUTER JOIN', 'CROSS JOIN', 'JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY',
      'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE',
      'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'WITH', 'AS',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'
    ];

    let clean = sql.replace(/\s+/g, ' ').trim();

    // Normalizar keywords para maiúsculas/minúsculas conforme toggle
    if (uppercaseKeywords) {
      keywords.forEach((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        clean = clean.replace(regex, kw);
      });
    }

    // Quebras de linha antes das principais cláusulas estruturais
    const majorClauses = [
      'SELECT', 'FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'JOIN',
      'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'
    ];

    const indent = ' '.repeat(indentSize);
    let formatted = clean;

    majorClauses.forEach((clause) => {
      const regex = new RegExp(`\\s*\\b(${clause})\\b\\s*`, 'gi');
      formatted = formatted.replace(regex, `\n$1 `);
    });

    // Indentação após quebra
    const lines = formatted.split('\n').filter((l) => l.trim().length > 0);
    const resultLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (i === 0) {
        resultLines.push(line);
      } else if (line.match(/^(AND|OR|ON)\b/i)) {
        resultLines.push(indent + indent + line);
      } else {
        resultLines.push(line);
      }
    }

    return resultLines.join('\n');
  };

  const minifiedSql = (sql: string): string => {
    return sql.replace(/\s+/g, ' ').trim();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopyToast('SQL copiado para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedOutput = formatSql(inputSql);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Formatador & Minificador SQL</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={uppercaseKeywords}
              onChange={(e) => setUppercaseKeywords(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Palavras-chave em MAIÚSCULAS</span>
          </label>

          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span>Indentação:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value={2}>2 espaços</option>
              <option value={4}>4 espaços</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inputs & Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>SQL de Entrada</span>
            <button
              onClick={() => setInputSql('')}
              className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>
          <textarea
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            placeholder="Cole sua query SQL aqui..."
            rows={14}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>SQL Formatado</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(minifiedSql(inputSql))}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1"
                title="Copiar em uma linha só"
              >
                <Code2 className="w-3 h-3" /> Minificar
              </button>
              <button
                onClick={() => handleCopy(formattedOutput)}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto min-h-[300px] h-[340px] select-all leading-relaxed">
            {formattedOutput || '-- O resultado formatado aparecerá aqui'}
          </pre>
        </div>
      </div>
    </div>
  );
}
