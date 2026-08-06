import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, Key, Lock, ShieldAlert } from 'lucide-react';
import { generatePassword, calculatePasswordStrength, PasswordOptions } from '../../utils/cryptoUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function PasswordGenerator({ onCopyToast }: ToolProps) {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    useUpper: true,
    useLower: true,
    useNumbers: true,
    useSymbols: true,
    avoidAmbiguous: true,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const handleGenerate = (isManual = false) => {
    if (isManual) {
      const rateCheck = checkAndConsumeRateLimit('gerador-senhas');
      if (!rateCheck.allowed) {
        setBlockedResult(rateCheck);
        onCopyToast('⚠️ Limite de requisições excedido.');
        return;
      }
      setBlockedResult(null);
    }
    const pwd = generatePassword(options);
    setPassword(pwd);
  };

  useEffect(() => {
    handleGenerate(false);
  }, [options]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopyToast('Senha copiada com segurança!');
  };

  const strength = calculatePasswordStrength(password);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="gerador-senhas"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Generated Password Box */}
      <div className="relative p-5 bg-slate-900 text-white dark:bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xl sm:text-2xl font-mono tracking-wider font-bold text-indigo-300 break-all select-all text-center sm:text-left">
          {password}
        </span>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleGenerate(true)}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer"
            title="Gerar outra senha"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer text-sm ${
              copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copiada!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar Senha
              </>
            )}
          </button>
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Força da Senha:
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-white ${strength.color}`}>
            {strength.label} ({strength.entropy} bits)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {/* Length Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tamanho da Senha:</label>
            <span className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
              {options.length} caracteres
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Character Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.useUpper}
              onChange={(e) => setOptions({ ...options, useUpper: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Letras Maiúsculas (A-Z)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.useLower}
              onChange={(e) => setOptions({ ...options, useLower: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Letras Minúsculas (a-z)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.useNumbers}
              onChange={(e) => setOptions({ ...options, useNumbers: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Números (0-9)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.useSymbols}
              onChange={(e) => setOptions({ ...options, useSymbols: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Símbolos (!@#$%)
            </span>
          </label>

          <label className="sm:col-span-2 flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.avoidAmbiguous}
              onChange={(e) => setOptions({ ...options, avoidAmbiguous: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Evitar caracteres ambíguos (ex: l, 1, I, O, 0)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
