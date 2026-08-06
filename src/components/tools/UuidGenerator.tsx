import { useState } from 'react';
import { Copy, RefreshCw, Check, Fingerprint } from 'lucide-react';
import { generateUUIDs } from '../../utils/cryptoUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function UuidGenerator({ onCopyToast }: ToolProps) {
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>(generateUUIDs(1, false, true));
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const handleGenerate = () => {
    const rateCheck = checkAndConsumeRateLimit('gerador-uuid');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido. Aguarde para gerar novamente!');
      return;
    }
    setBlockedResult(null);

    setUuids(generateUUIDs(count, uppercase, hyphens));
  };

  const handleCopySingle = (id: string, idx: number) => {
    navigator.clipboard.writeText(id);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
    onCopyToast('UUID copiado!');
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    onCopyToast(`${uuids.length} UUIDs copiados!`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="gerador-uuid"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">
            Quantidade
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl outline-none"
          >
            <option value={1}>1 UUID</option>
            <option value={5}>5 UUIDs</option>
            <option value={10}>10 UUIDs</option>
            <option value={20}>20 UUIDs</option>
            <option value={50}>50 UUIDs</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            MAIÚSCULAS
          </label>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            Com Hífen (-)
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" /> Gerar UUIDs
        </button>
        {uuids.length > 1 && (
          <button
            onClick={handleCopyAll}
            className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl flex items-center gap-2 transition cursor-pointer text-sm"
          >
            <Copy className="w-4 h-4" /> Copiar Todos
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {uuids.map((id, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700"
          >
            <span className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 select-all">
              {id}
            </span>
            <button
              onClick={() => handleCopySingle(id, idx)}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIdx === idx ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
