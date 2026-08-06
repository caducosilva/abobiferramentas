import { useState } from 'react';
import { Copy, RefreshCw, Check, CheckCircle, XCircle, Info } from 'lucide-react';
import { generateCNPJ, validateCNPJ } from '../../utils/cpfCnpj';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function CnpjGeneratorValidator({ onCopyToast }: ToolProps) {
  const [activeTab, setActiveTab] = useState<'gerar' | 'validar'>('gerar');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  // Generator State
  const [formatted, setFormatted] = useState(true);
  const [batchCount, setBatchCount] = useState(1);
  const [generatedCnpjs, setGeneratedCnpjs] = useState<string[]>([generateCNPJ(true)]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Validator State
  const [inputCnpj, setInputCnpj] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string; formatted: string } | null>(null);

  const handleGenerate = () => {
    const rateCheck = checkAndConsumeRateLimit('gerador-cnpj');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido. Aguarde para gerar novamente!');
      return;
    }
    setBlockedResult(null);

    const list: string[] = [];
    for (let i = 0; i < batchCount; i++) {
      list.push(generateCNPJ(formatted));
    }
    setGeneratedCnpjs(list);
  };

  const handleCopySingle = (cnpj: string, index: number) => {
    navigator.clipboard.writeText(cnpj);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
    onCopyToast('CNPJ copiado!');
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedCnpjs.join('\n'));
    onCopyToast(`${generatedCnpjs.length} CNPJs copiados!`);
  };

  const handleValidate = (val: string) => {
    setInputCnpj(val);
    if (val.trim()) {
      const rateCheck = checkAndConsumeRateLimit('gerador-cnpj');
      if (!rateCheck.allowed) {
        setBlockedResult(rateCheck);
        onCopyToast('⚠️ Limite de requisições excedido.');
        return;
      }
      setBlockedResult(null);
      setValidationResult(validateCNPJ(val));
    } else {
      setValidationResult(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="gerador-cnpj"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 pb-2 gap-4">
        <button
          onClick={() => setActiveTab('gerar')}
          className={`pb-3 text-sm sm:text-base font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'gerar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Gerar CNPJ
        </button>
        <button
          onClick={() => setActiveTab('validar')}
          className={`pb-3 text-sm sm:text-base font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'validar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Validar CNPJ
        </button>
      </div>

      {activeTab === 'gerar' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                Formatação
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormatted(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    formatted
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Com Pontos e Barra
                </button>
                <button
                  onClick={() => setFormatted(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    !formatted
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Apenas Números
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                Quantidade
              </label>
              <select
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl outline-none"
              >
                <option value={1}>1 CNPJ</option>
                <option value={5}>5 CNPJs</option>
                <option value={10}>10 CNPJs</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar {batchCount > 1 ? `${batchCount} CNPJs` : 'Novo CNPJ'}
            </button>
            {generatedCnpjs.length > 1 && (
              <button
                onClick={handleCopyAll}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl flex items-center gap-2 transition cursor-pointer text-sm"
              >
                <Copy className="w-4 h-4" /> Copiar Todos
              </button>
            )}
          </div>

          <div className="space-y-3">
            {generatedCnpjs.map((cnpj, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-800 transition"
              >
                <span className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100">
                  {cnpj}
                </span>
                <button
                  onClick={() => handleCopySingle(cnpj, idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    copiedIndex === idx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-4 h-4" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" /> Copiar
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              Digite ou cole o número do CNPJ para verificar:
            </label>
            <input
              type="text"
              placeholder="Ex: 00.000.000/0001-91 ou 00000000000191"
              value={inputCnpj}
              onChange={(e) => handleValidate(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {validationResult && (
            <div
              className={`p-6 rounded-2xl border ${
                validationResult.isValid
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {validationResult.isValid ? (
                  <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-lg font-bold mb-1">{validationResult.message}</h4>
                  <p className="text-sm opacity-90">
                    CNPJ Formatado: <strong className="font-mono">{validationResult.formatted}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              O CNPJ (Cadastro Nacional da Pessoa Jurídica) é um identificador de 14 dígitos mantido pela
              Receita Federal do Brasil.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
