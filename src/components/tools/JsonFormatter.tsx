import { useState, useEffect } from 'react';
import { Copy, FileCode2, Check, AlertTriangle, Code, AlignLeft, Sparkles } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

const SAMPLE_JSON = `{
  "app": "abobiferramentas",
  "versao": 1.0,
  "ferramentas": [
    "Gerador de CPF",
    "Validador de CNPJ",
    "Compressor de Imagens"
  ],
  "configuracoes": {
    "modoEscuro": true,
    "idioma": "pt-BR"
  }
}`;

export function JsonFormatter({ onCopyToast }: ToolProps) {
  const [jsonInput, setJsonInput] = useState(() => {
    return localStorage.getItem('abobi_draft_json') || SAMPLE_JSON;
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  useEffect(() => {
    localStorage.setItem('abobi_draft_json', jsonInput);
  }, [jsonInput]);

  const handleFormat = (indentSpaces = 2) => {
    const rateCheck = checkAndConsumeRateLimit('formatador-json');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido.');
      return;
    }
    setBlockedResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, indentSpaces));
      setError(null);
      onCopyToast('JSON Formatado com sucesso!');
    } catch (e: any) {
      setError(e.message || 'Sintaxe JSON inválida');
    }
  };

  const handleMinify = () => {
    const rateCheck = checkAndConsumeRateLimit('formatador-json');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido.');
      return;
    }
    setBlockedResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setError(null);
      onCopyToast('JSON Minificado!');
    } catch (e: any) {
      setError(e.message || 'Sintaxe JSON inválida');
    }
  };

  const handleCopy = () => {
    if (!jsonInput) return;
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopyToast('JSON copiado!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="formatador-json"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <AlignLeft className="w-3.5 h-3.5" /> Formatar (2 Espaços)
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            Formatar (4 Espaços)
          </button>
          <button
            onClick={handleMinify}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" /> Minificar
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setJsonInput(SAMPLE_JSON);
              setError(null);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-2"
          >
            Carregar Exemplo
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div>
        <textarea
          rows={12}
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setError(null);
          }}
          placeholder="Cole seu código JSON aqui..."
          className="w-full p-4 bg-slate-900 text-indigo-300 font-mono text-sm rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
        />
      </div>

      {/* Error Message Feedback */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-bold font-mono">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Erro de Sintaxe JSON: {error}</span>
        </div>
      )}
    </div>
  );
}
