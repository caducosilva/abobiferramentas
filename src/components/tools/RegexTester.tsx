import { useState, useMemo } from 'react';
import { Sparkles, Copy, Check, Regex, AlertCircle } from 'lucide-react';

interface RegexTesterProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function RegexTester({ onCopyToast }: RegexTesterProps) {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState(
    'Entre em contato via suporte@abobiferramentas.com ou pelo email comercial contato@empresa.com.br para orçamentos.'
  );
  const [copied, setCopied] = useState(false);

  const flagString = useMemo(() => {
    let f = '';
    if (flags.g) f += 'g';
    if (flags.i) f += 'i';
    if (flags.m) f += 'm';
    if (flags.s) f += 's';
    return f;
  }, [flags]);

  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], error: null, highlightedHtml: testText };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const allMatches: Array<{ match: string; index: number; groups: string[] }> = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        let lastIdx = 0;
        let safeLoop = 0;
        while ((m = regex.exec(testText)) !== null && safeLoop < 1000) {
          safeLoop++;
          allMatches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (regex.lastIndex === lastIdx) {
            regex.lastIndex++;
          }
          lastIdx = regex.lastIndex;
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          allMatches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      // Montar HTML com destaque
      let html = '';
      let currentIndex = 0;

      allMatches.forEach((m) => {
        html += escapeHtml(testText.slice(currentIndex, m.index));
        html += `<mark class="bg-amber-300 dark:bg-amber-500/40 text-slate-900 dark:text-amber-200 px-1 py-0.5 rounded font-bold">${escapeHtml(m.match)}</mark>`;
        currentIndex = m.index + m.match.length;
      });
      html += escapeHtml(testText.slice(currentIndex));

      return { matches: allMatches, error: null, highlightedHtml: html };
    } catch (err: any) {
      return { matches: [], error: err.message, highlightedHtml: escapeHtml(testText) };
    }
  }, [pattern, flagString, testText]);

  function escapeHtml(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopyToast('Expressão copiada com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Regex className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Testador de Expressões Regulares (Regex)</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-slate-500">Flags:</span>
          {(['g', 'i', 'm', 's'] as const).map((flag) => (
            <button
              key={flag}
              onClick={() => setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
              className={`px-2.5 py-1 rounded font-mono font-bold transition cursor-pointer ${
                flags[flag]
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
              title={
                flag === 'g'
                  ? 'Global (todas as correspondências)'
                  : flag === 'i'
                  ? 'Case-insensitive (ignorar maiúsculas/minúsculas)'
                  : flag === 'm'
                  ? 'Multiline (^ e $ casam início/fim de linha)'
                  : 'DotAll (. casa quebra de linha)'
              }
            >
              /{flag}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Pattern Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Padrão da Regex</label>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5">
          <span className="text-slate-400 font-mono text-sm font-bold">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Digite sua expressão regular aqui..."
            className="w-full bg-transparent font-mono text-sm outline-none text-slate-900 dark:text-white"
          />
          <span className="text-slate-400 font-mono text-sm font-bold">/{flagString}</span>
          <button
            onClick={() => handleCopy(`/${pattern}/${flagString}`)}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Copiar Regex completa"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Erro na Regex: {error}</span>
          </div>
        )}
      </div>

      {/* Test String Input and Highlight View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Texto de Teste</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Cole o texto de teste aqui..."
            rows={8}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Resultado com Destaque ({matches.length} matches)</span>
          </div>
          <div
            className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[220px] whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>

      {/* Captured Groups List */}
      {matches.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Itens Capturados ({matches.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <span className="text-indigo-500 font-bold">#{idx + 1}: </span>
                  <span className="text-slate-800 dark:text-slate-100 font-semibold">{m.match}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">idx: {m.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
