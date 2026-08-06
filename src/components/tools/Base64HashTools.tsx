import { useState } from 'react';
import { Copy, Binary, Check, ShieldCheck } from 'lucide-react';
import { encodeBase64, decodeBase64, computeHash } from '../../utils/cryptoUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function Base64HashTools({ onCopyToast }: ToolProps) {
  const [inputText, setInputText] = useState('MultiTool 2026');
  const [b64Output, setB64Output] = useState(encodeBase64('MultiTool 2026'));
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const handleInputChange = (val: string) => {
    setInputText(val);
    setB64Output(encodeBase64(val));
    computeHash(val, 'SHA-256').then(setSha256Hash);
    computeHash(val, 'SHA-1').then(setSha1Hash);
  };

  const handleDecodeB64 = () => {
    const rateCheck = checkAndConsumeRateLimit('base64-hash');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido.');
      return;
    }
    setBlockedResult(null);

    const decoded = decodeBase64(inputText);
    setB64Output(decoded);
    onCopyToast('Base64 decodificado!');
  };

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
    onCopyToast('Copiado para a área de transferência!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="base64-hash"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />
      <div>
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block">
          Texto de Entrada:
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Digite o texto para codificar em Base64 ou gerar Hashes..."
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono outline-none"
        />
      </div>

      <div className="space-y-4">
        {/* Base64 Output */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Base64
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDecodeB64}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:underline px-2 py-1"
              >
                Decodificar Entrada
              </button>
              <button
                onClick={() => handleCopy(b64Output, 'b64')}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'b64' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                Copiar
              </button>
            </div>
          </div>
          <div className="font-mono text-xs break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {b64Output}
          </div>
        </div>

        {/* SHA-256 Output */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Hash SHA-256
            </span>
            <button
              onClick={() => handleCopy(sha256Hash, 'sha256')}
              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'sha256' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copiar
            </button>
          </div>
          <div className="font-mono text-xs break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {sha256Hash || 'Digite algo para gerar SHA-256'}
          </div>
        </div>

        {/* SHA-1 Output */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Hash SHA-1
            </span>
            <button
              onClick={() => handleCopy(sha1Hash, 'sha1')}
              className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'sha1' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copiar
            </button>
          </div>
          <div className="font-mono text-xs break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {sha1Hash || 'Digite algo para gerar SHA-1'}
          </div>
        </div>
      </div>
    </div>
  );
}
