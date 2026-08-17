import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, GitCompare } from 'lucide-react';
import { diffTexts } from '../../utils/diffUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

const ROW_STYLE = {
  igual: 'text-slate-600 dark:text-slate-300',
  removido:
    'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-l-2 border-red-400',
  adicionado:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-400',
} as const;

const ROW_PREFIX = { igual: ' ', removido: '-', adicionado: '+' } as const;

export function TextDiff({ onCopyToast }: ToolProps) {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const result = useMemo(
    () => diffTexts(original, modified, { ignoreCase, ignoreWhitespace }),
    [original, modified, ignoreCase, ignoreWhitespace]
  );

  const visibleLines = onlyChanges
    ? result.lines.filter((line) => line.type !== 'igual')
    : result.lines;

  const hasInput = original.trim().length > 0 || modified.trim().length > 0;
  const identical = hasInput && result.added === 0 && result.removed === 0;

  const handleSwap = () => {
    setOriginal(modified);
    setModified(original);
  };

  const handleCopyDiff = () => {
    const rateCheck = checkAndConsumeRateLimit('comparador-texto');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('Limite de comparações atingido. Aguarde alguns segundos.');
      return;
    }
    setBlockedResult(null);

    const text = result.lines.map((line) => `${ROW_PREFIX[line.type]} ${line.text}`).join('\n');
    navigator.clipboard.writeText(text);
    onCopyToast('Diferenças copiadas no formato de patch!');
  };

  const textareaClass =
    'w-full h-56 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 resize-y';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="comparador-texto"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Texto original
          </label>
          <textarea
            value={original}
            onChange={(event) => setOriginal(event.target.value)}
            placeholder="Cole aqui a primeira versão do texto ou do código..."
            className={textareaClass}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
            Texto novo
          </label>
          <textarea
            value={modified}
            onChange={(event) => setModified(event.target.value)}
            placeholder="Cole aqui a versão alterada..."
            className={textareaClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        {[
          { label: 'Ignorar maiúsculas', checked: ignoreCase, toggle: setIgnoreCase },
          { label: 'Ignorar espaços', checked: ignoreWhitespace, toggle: setIgnoreWhitespace },
          { label: 'Só as diferenças', checked: onlyChanges, toggle: setOnlyChanges },
        ].map((option) => (
          <label
            key={option.label}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={option.checked}
              onChange={(event) => option.toggle(event.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            {option.label}
          </label>
        ))}

        <button
          onClick={handleSwap}
          className="ml-auto px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" /> Inverter lados
        </button>
      </div>

      {hasInput && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Adicionadas', value: result.added, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Removidas', value: result.removed, color: 'text-red-600 dark:text-red-400' },
              { label: 'Iguais', value: result.unchanged, color: 'text-slate-600 dark:text-slate-300' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center"
              >
                <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {identical ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 text-center">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Os dois textos são idênticos
                {(ignoreCase || ignoreWhitespace) && ' com as regras de comparação escolhidas'}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  {visibleLines.map((line, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 px-3 py-1 font-mono text-xs ${ROW_STYLE[line.type]}`}
                    >
                      <span className="shrink-0 w-16 text-right text-slate-400 dark:text-slate-500 select-none">
                        {line.leftNumber ?? ''}
                        {' '}
                        {line.rightNumber ?? ''}
                      </span>
                      <span className="shrink-0 w-3 font-bold select-none">
                        {ROW_PREFIX[line.type]}
                      </span>
                      <span className="whitespace-pre-wrap break-all">{line.text || ' '}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyDiff}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar diferenças
                </button>
                {result.truncated && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    Texto muito grande: a comparação foi feita linha por posição, sem detectar
                    trechos deslocados.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!hasInput && (
        <div className="text-center py-10 space-y-2 text-slate-400 dark:text-slate-500">
          <GitCompare className="w-8 h-8 mx-auto" />
          <p className="text-xs font-semibold">
            Cole as duas versões acima para ver o que mudou, linha por linha.
          </p>
        </div>
      )}
    </div>
  );
}
