import { useState } from 'react';
import { Copy, Binary, Check, ShieldCheck, FileUp, X } from 'lucide-react';
import { encodeBase64, decodeBase64, computeHash, computeFileHash } from '../../utils/cryptoUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

type Mode = 'texto' | 'arquivo';

const FILE_ALGORITHMS = ['SHA-256', 'SHA-1', 'SHA-512'] as const;

export function Base64HashTools({ onCopyToast }: ToolProps) {
  const [mode, setMode] = useState<Mode>('texto');
  const [inputText, setInputText] = useState('MultiTool 2026');
  const [b64Output, setB64Output] = useState(encodeBase64('MultiTool 2026'));
  const [sha256Hash, setSha256Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [hashingFile, setHashingFile] = useState(false);
  const [expectedHash, setExpectedHash] = useState('');

  const handleFileSelect = async (selected: File | null) => {
    setFile(selected);
    setFileHashes({});
    if (!selected) return;

    setHashingFile(true);
    try {
      const entries = await Promise.all(
        FILE_ALGORITHMS.map(async (algo) => [algo, await computeFileHash(selected, algo)] as const)
      );
      setFileHashes(Object.fromEntries(entries));
    } catch {
      onCopyToast('Não foi possível calcular o hash deste arquivo.');
    } finally {
      setHashingFile(false);
    }
  };

  const matchResult =
    expectedHash.trim() && fileHashes['SHA-256']
      ? Object.values(fileHashes).some((h: string) => h.toLowerCase() === expectedHash.trim().toLowerCase())
      : null;

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

      <div className="flex gap-2">
        <button
          onClick={() => setMode('texto')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            mode === 'texto'
              ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          Texto
        </button>
        <button
          onClick={() => setMode('arquivo')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            mode === 'arquivo'
              ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          Arquivo
        </button>
      </div>

      {mode === 'texto' && (
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
      )}

      {mode === 'arquivo' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              O arquivo é lido e processado inteiramente no seu navegador. Ele nunca é enviado para nenhum servidor.
            </p>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center gap-2 p-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition">
              <FileUp className="w-8 h-8 text-slate-400" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Clique ou arraste um arquivo aqui
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
                <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => handleFileSelect(null)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {hashingFile && <p className="text-xs text-slate-400 text-center">Calculando hashes...</p>}

          {file && !hashingFile && Object.keys(fileHashes).length > 0 && (
            <>
              <div className="space-y-3">
                {FILE_ALGORITHMS.map((algo) => (
                  <div
                    key={algo}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Hash {algo}
                      </span>
                      <button
                        onClick={() => handleCopy(fileHashes[algo], `file-${algo}`)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `file-${algo}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copiar
                      </button>
                    </div>
                    <div className="font-mono text-xs break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      {fileHashes[algo]}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block">
                  Comparar com hash esperado (opcional):
                </label>
                <input
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value)}
                  placeholder="Cole aqui o hash publicado pela fonte do arquivo..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono outline-none"
                />
                {matchResult !== null && (
                  <p
                    className={`text-xs font-bold mt-2 ${
                      matchResult ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {matchResult ? '✓ Hash confere com o valor informado.' : '✗ Hash não confere com o valor informado.'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'texto' && (
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
      )}
    </div>
  );
}
