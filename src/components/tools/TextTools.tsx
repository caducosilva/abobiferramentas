import { useState, useEffect } from 'react';
import { Copy, Trash2, ArrowDownAZ, Sparkles, Check, Clock, FileText, Hash, Layers } from 'lucide-react';
import { calculateTextStats, transformText, getTopWords } from '../../utils/textUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function TextTools({ onCopyToast }: ToolProps) {
  const [text, setText] = useState(() => {
    return localStorage.getItem('abobi_draft_text') || '';
  });
  const [copied, setCopied] = useState(false);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  useEffect(() => {
    localStorage.setItem('abobi_draft_text', text);
  }, [text]);

  const stats = calculateTextStats(text);
  const topWords = getTopWords(text, 5);

  const handleTransform = (type: string) => {
    const rateCheck = checkAndConsumeRateLimit('contador-texto');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido.');
      return;
    }
    setBlockedResult(null);

    setText((prev) => transformText(prev, type));
    onCopyToast('Texto transformado!');
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopyToast('Texto copiado!');
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="contador-texto"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Stats Header Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Hash className="w-3.5 h-3.5 text-indigo-500" /> Caracteres
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {stats.characters}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ({stats.charactersNoSpaces} sem espaços)
          </span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <FileText className="w-3.5 h-3.5 text-emerald-500" /> Palavras
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {stats.words}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {stats.sentences} frases
          </span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Layers className="w-3.5 h-3.5 text-purple-500" /> Parágrafos
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            {stats.paragraphs}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {stats.lines} linhas
          </span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Leitura
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
            ~{stats.readingTimeMinutes} min
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ritmo médio
          </span>
        </div>
      </div>

      {/* Main Text Area */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Cole ou digite seu texto abaixo:
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
        </div>

        <textarea
          rows={8}
          placeholder="Cole seu texto aqui para contar caracteres, palavras, alterar caixa de texto..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition font-sans text-sm sm:text-base"
        />
      </div>

      {/* Quick Transform Actions */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Transformadores de Caixa de Texto:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTransform('uppercase')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            MAIÚSCULAS
          </button>
          <button
            onClick={() => handleTransform('lowercase')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            minúsculas
          </button>
          <button
            onClick={() => handleTransform('titlecase')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Primeira Letra Maiúscula
          </button>
          <button
            onClick={() => handleTransform('sentencecase')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Início de frase maiúsculo
          </button>
          <button
            onClick={() => handleTransform('camelcase')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer font-mono"
          >
            camelCase
          </button>
          <button
            onClick={() => handleTransform('slugify')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer font-mono"
          >
            slug-para-url
          </button>
          <button
            onClick={() => handleTransform('snakecase')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer font-mono"
          >
            snake_case
          </button>
          <button
            onClick={() => handleTransform('removeSpaces')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Remover Espaços Duplos
          </button>
          <button
            onClick={() => handleTransform('removeDuplicateLines')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Remover Linhas Duplicadas
          </button>
          <button
            onClick={() => handleTransform('sortLines')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Ordenar Linhas A-Z
          </button>
        </div>
      </div>

      {/* Word Frequency Badge List */}
      {topWords.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Palavras mais frequentes no texto:
          </span>
          <div className="flex flex-wrap gap-2">
            {topWords.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg"
              >
                <span>{item.word}</span>
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {item.count}x
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
