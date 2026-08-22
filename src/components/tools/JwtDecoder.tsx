import { useState, useMemo } from 'react';
import { ShieldCheck, Copy, Check, Key, AlertTriangle, Clock } from 'lucide-react';

interface JwtDecoderProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function JwtDecoder({ onCopyToast }: JwtDecoderProps) {
  const [token, setToken] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNhZHVjbyBTaWx2YSIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDgwMDAwMDAsImV4cCI6MTgwMDAwMDAwMH0.signature_sample_only'
  );
  const [copied, setCopied] = useState<string | null>(null);

  const decoded = useMemo(() => {
    const parts = token.trim().split('.');
    if (parts.length < 2) {
      return { header: null, payload: null, signature: null, error: 'Token JWT incompleto (precisa ter 3 partes separadas por ponto).' };
    }

    try {
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const headerJson = JSON.parse(base64UrlDecode(parts[0]));
      const payloadJson = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2] || '';

      return {
        header: headerJson,
        payload: payloadJson,
        signature,
        error: null,
      };
    } catch (err: any) {
      return {
        header: null,
        payload: null,
        signature: null,
        error: 'Erro ao decodificar partes do token: formato Base64 ou JSON inválido.',
      };
    }
  }, [token]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    onCopyToast('Copiado para a área de transferência!', 'success');
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return null;
    const date = new Date(ts * 1000);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')} (${ts})`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Decodificador de JWT (JSON Web Token)</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>100% no seu navegador: nenhum token é enviado para servidores</span>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cole o Token JWT Codificado</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Cole seu token JWT aqui (ex: eyJhbGciOi...)"
          rows={3}
          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
        />
      </div>

      {decoded.error ? (
        <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{decoded.error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-red-500 font-bold">HEADER (Algoritmo e Tipo)</span>
              <button
                onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'header')}
                className="hover:underline flex items-center gap-1 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {copied === 'header' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar</span>
              </button>
            </div>
            <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-red-400 overflow-x-auto min-h-[120px]">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-purple-500 font-bold">PAYLOAD (Dados e Declarações)</span>
              <button
                onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'payload')}
                className="hover:underline flex items-center gap-1 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {copied === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar</span>
              </button>
            </div>
            <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-purple-400 overflow-x-auto min-h-[120px]">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Timestamps helper */}
      {decoded.payload && (
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
          {decoded.payload.iat && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-500">Emitido em (iat):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {formatTimestamp(decoded.payload.iat)}
              </span>
            </div>
          )}
          {decoded.payload.exp && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-500">Expira em (exp):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {formatTimestamp(decoded.payload.exp)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
