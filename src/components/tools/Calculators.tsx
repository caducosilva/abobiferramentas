import { useState } from 'react';
import { Calculator, Scale, HeartPulse, Percent } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function Calculators({ onCopyToast }: ToolProps) {
  const [activeTab, setActiveTab] = useState<'porcentagem' | 'imc'>('porcentagem');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  // Percentage states
  // 1. What is X% of Y?
  const [percX, setPercX] = useState<string>('15');
  const [percY, setPercY] = useState<string>('250');

  // 2. X is what % of Y?
  const [valX, setValX] = useState<string>('50');
  const [valY, setValY] = useState<string>('200');

  // 3. Percentage change from X to Y
  const [changeFrom, setChangeFrom] = useState<string>('100');
  const [changeTo, setChangeTo] = useState<string>('150');

  // IMC state
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('1.75');

  // Calc Percentage 1
  const numX = parseFloat(percX) || 0;
  const numY = parseFloat(percY) || 0;
  const result1 = (numX / 100) * numY;

  // Calc Percentage 2
  const vX = parseFloat(valX) || 0;
  const vY = parseFloat(valY) || 0;
  const result2 = vY !== 0 ? (vX / vY) * 100 : 0;

  // Calc Percentage 3
  const cFrom = parseFloat(changeFrom) || 0;
  const cTo = parseFloat(changeTo) || 0;
  const result3 = cFrom !== 0 ? ((cTo - cFrom) / cFrom) * 100 : 0;

  // Calc IMC
  const w = parseFloat(weight.replace(',', '.')) || 0;
  const h = parseFloat(height.replace(',', '.')) || 0;
  const imc = h > 0 ? w / (h * h) : 0;

  const getImcClassification = (val: number) => {
    if (val === 0) return { label: 'Aguardando valores', color: 'text-slate-400' };
    if (val < 18.5) return { label: 'Abaixo do Peso', color: 'text-sky-500' };
    if (val < 25) return { label: 'Peso Normal / Ideal', color: 'text-emerald-500' };
    if (val < 30) return { label: 'Sobrepeso', color: 'text-amber-500' };
    if (val < 35) return { label: 'Obesidade Grau I', color: 'text-orange-500' };
    if (val < 40) return { label: 'Obesidade Grau II', color: 'text-rose-500' };
    return { label: 'Obesidade Grau III (Mórbida)', color: 'text-purple-600' };
  };

  const classification = getImcClassification(imc);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="calculadoras"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2 gap-4">
        <button
          onClick={() => setActiveTab('porcentagem')}
          className={`pb-3 text-sm sm:text-base font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'porcentagem'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" /> Porcentagem
        </button>
        <button
          onClick={() => setActiveTab('imc')}
          className={`pb-3 text-sm sm:text-base font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'imc'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" /> Calculadora de IMC
        </button>
      </div>

      {activeTab === 'porcentagem' ? (
        <div className="space-y-6">
          {/* Formula 1 */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              1. Quanto é X% de Y?
            </span>
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              <span>Quanto é</span>
              <input
                type="number"
                value={percX}
                onChange={(e) => setPercX(e.target.value)}
                className="w-20 p-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <span>% de</span>
              <input
                type="number"
                value={percY}
                onChange={(e) => setPercY(e.target.value)}
                className="w-28 p-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <span>?</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">Resultado:</span>
              <span className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {result1.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Formula 2 */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              2. O valor X é qual porcentagem de Y?
            </span>
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              <span>O valor</span>
              <input
                type="number"
                value={valX}
                onChange={(e) => setValX(e.target.value)}
                className="w-24 p-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <span>é qual % de</span>
              <input
                type="number"
                value={valY}
                onChange={(e) => setValY(e.target.value)}
                className="w-28 p-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <span>?</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">Resultado:</span>
              <span className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                {result2.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Formula 3 */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              3. Variação percentual de X para Y (Aumento / Desconto)
            </span>
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              <span>De</span>
              <input
                type="number"
                value={changeFrom}
                onChange={(e) => setChangeFrom(e.target.value)}
                className="w-28 p-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <span>para</span>
              <input
                type="number"
                value={changeTo}
                onChange={(e) => setChangeTo(e.target.value)}
                className="w-28 p-2 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 block">Variação:</span>
              <span
                className={`text-xl font-mono font-extrabold ${
                  result3 >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {result3 >= 0 ? `+${result3.toFixed(2)}%` : `${result3.toFixed(2)}%`}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* IMC CALCULATOR */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                Seu Peso (kg)
              </label>
              <input
                type="text"
                placeholder="Ex: 75"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                Sua Altura (m)
              </label>
              <input
                type="text"
                placeholder="Ex: 1.75"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Seu Índice de Massa Corporal (IMC)
            </span>
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-slate-900 dark:text-slate-100 block">
              {imc > 0 ? imc.toFixed(1) : '--'}
            </span>
            <span className={`text-lg font-extrabold ${classification.color} block`}>
              {classification.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
