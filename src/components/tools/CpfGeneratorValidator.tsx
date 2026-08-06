import { useState } from 'react';
import { Copy, RefreshCw, Check, Sparkles, CheckCircle, XCircle, Info } from 'lucide-react';
import { generateCPF, validateCPF, CPF_STATES, CPFValidationResult } from '../../utils/cpfCnpj';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function CpfGeneratorValidator({ onCopyToast }: ToolProps) {
  const [activeTab, setActiveTab] = useState<'gerar' | 'validar'>('gerar');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  // Generator State
  const [formatted, setFormatted] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('any');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [generatedCpfs, setGeneratedCpfs] = useState<string[]>([generateCPF(true)]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Validator State
  const [inputCpf, setInputCpf] = useState('');
  const [validationResult, setValidationResult] = useState<CPFValidationResult | null>(null);

  const handleGenerate = () => {
    const rateCheck = checkAndConsumeRateLimit('gerador-cpf');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições excedido. Aguarde para gerar novamente!');
      return;
    }
    setBlockedResult(null);

    const stateDigit = selectedState === 'any' ? undefined : parseInt(selectedState, 10);
    const list: string[] = [];
    for (let i = 0; i < batchCount; i++) {
      list.push(generateCPF(formatted, stateDigit));
    }
    setGeneratedCpfs(list);
  };

  const handleCopySingle = (cpf: string, index: number) => {
    navigator.clipboard.writeText(cpf);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
    onCopyToast('CPF copiado!');
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedCpfs.join('\n'));
    onCopyToast(`${generatedCpfs.length} CPFs copiados!`);
  };

  const handleValidate = (val: string) => {
    setInputCpf(val);
    if (val.trim()) {
      const rateCheck = checkAndConsumeRateLimit('validador-cpf');
      if (!rateCheck.allowed) {
        setBlockedResult(rateCheck);
        onCopyToast('⚠️ Limite de requisições atingido.');
        return;
      }
      setBlockedResult(null);
      setValidationResult(validateCPF(val));
    } else {
      setValidationResult(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId={activeTab === 'gerar' ? 'gerador-cpf' : 'validador-cpf'}
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Tool Header Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6 pb-2 gap-4">
        <button
          onClick={() => setActiveTab('gerar')}
          className={`pb-3 text-sm sm:text-base font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'gerar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Gerar CPF
        </button>
        <button
          onClick={() => setActiveTab('validar')}
          className={`pb-3 text-sm sm:text-base font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'validar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Validar CPF
        </button>
      </div>

      {activeTab === 'gerar' ? (
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Formatting Toggle */}
            <div className="flex flex-col justify-center">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Formatação</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormatted(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    formatted
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Com Pontos
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

            {/* State Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                Região / Estado
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="any">Aleatório (Qualquer Estado)</option>
                {Object.entries(CPF_STATES).map(([digit, states]) => (
                  <option key={digit} value={digit}>
                    Dígito {digit} ({states})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                Quantidade
              </label>
              <select
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1 CPF</option>
                <option value={5}>5 CPFs</option>
                <option value={10}>10 CPFs</option>
                <option value={20}>20 CPFs</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar {batchCount > 1 ? `${batchCount} CPFs` : 'Novo CPF'}
            </button>
            {generatedCpfs.length > 1 && (
              <button
                onClick={handleCopyAll}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl flex items-center gap-2 transition cursor-pointer text-sm"
              >
                <Copy className="w-4 h-4" />
                Copiar Todos
              </button>
            )}
          </div>

          {/* Generated Result Output */}
          <div className="space-y-3">
            {generatedCpfs.map((cpf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-800 transition"
              >
                <span className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100">
                  {cpf}
                </span>
                <button
                  onClick={() => handleCopySingle(cpf, idx)}
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
        /* VALIDATOR TAB */
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              Digite ou cole o número do CPF para verificar:
            </label>
            <input
              type="text"
              placeholder="Ex: 123.456.789-00 ou 12345678900"
              value={inputCpf}
              onChange={(e) => handleValidate(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-mono text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Validation Feedback */}
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
                  <p className="text-sm opacity-90 mb-4">
                    CPF Formatado: <strong className="font-mono">{validationResult.formatted}</strong>
                  </p>

                  {/* Mathematical details */}
                  <div className="space-y-2 text-xs bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Detalhamento dos dígitos verificadores:</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div>
                        1º Dígito Esperado: <strong>{validationResult.step1.expectedDigit}</strong> | Encontrado: <strong>{validationResult.step1.actualDigit}</strong> ({validationResult.step1.isMatch ? '✓ Ok' : '✗ Falhou'})
                      </div>
                      <div>
                        2º Dígito Esperado: <strong>{validationResult.step2.expectedDigit}</strong> | Encontrado: <strong>{validationResult.step2.actualDigit}</strong> ({validationResult.step2.isMatch ? '✓ Ok' : '✗ Falhou'})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              O CPF (Cadastro de Pessoas Físicas) usa um algoritmo oficial da Receita Federal baseado em
              Módulo 11 para calcular os dois últimos dígitos de validação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
