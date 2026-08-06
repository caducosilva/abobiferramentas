import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

type UnitType = 'length' | 'weight' | 'temperature' | 'data';

export function UnitConverter({ onCopyToast }: ToolProps) {
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  // Length units: meter base
  const [fromUnitLength, setFromUnitLength] = useState('km');
  const [toUnitLength, setToUnitLength] = useState('m');

  // Weight units: gram base
  const [fromUnitWeight, setFromUnitWeight] = useState('kg');
  const [toUnitWeight, setToUnitWeight] = useState('g');

  // Temp
  const [fromTemp, setFromTemp] = useState('C');
  const [toTemp, setToTemp] = useState('F');

  // Data
  const [fromData, setFromData] = useState('GB');
  const [toData, setToData] = useState('MB');

  const val = parseFloat(inputValue) || 0;

  let convertedValue = 0;

  if (unitType === 'length') {
    const meterMultipliers: Record<string, number> = {
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
      inch: 0.0254,
      foot: 0.3048,
      mile: 1609.34,
    };
    const inMeters = val * (meterMultipliers[fromUnitLength] || 1);
    convertedValue = inMeters / (meterMultipliers[toUnitLength] || 1);
  } else if (unitType === 'weight') {
    const gramMultipliers: Record<string, number> = {
      mg: 0.001,
      g: 1,
      kg: 1000,
      ton: 1000000,
      lb: 453.592,
      oz: 28.3495,
    };
    const inGrams = val * (gramMultipliers[fromUnitWeight] || 1);
    convertedValue = inGrams / (gramMultipliers[toUnitWeight] || 1);
  } else if (unitType === 'temperature') {
    // Temp conversion
    let celsius = val;
    if (fromTemp === 'F') celsius = (val - 32) * (5 / 9);
    if (fromTemp === 'K') celsius = val - 273.15;

    if (toTemp === 'C') convertedValue = celsius;
    else if (toTemp === 'F') convertedValue = celsius * (9 / 5) + 32;
    else if (toTemp === 'K') convertedValue = celsius + 273.15;
  } else if (unitType === 'data') {
    const byteMultipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };
    const inBytes = val * (byteMultipliers[fromData] || 1);
    convertedValue = inBytes / (byteMultipliers[toData] || 1);
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="conversor-unidades"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Category selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setUnitType('length')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            unitType === 'length'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Comprimento
        </button>
        <button
          onClick={() => setUnitType('weight')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            unitType === 'weight'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Massa / Peso
        </button>
        <button
          onClick={() => setUnitType('temperature')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            unitType === 'temperature'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Temperatura
        </button>
        <button
          onClick={() => setUnitType('data')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            unitType === 'data'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Dados (Bytes)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Input From */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            De:
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-mono font-bold"
            />

            {unitType === 'length' && (
              <select
                value={fromUnitLength}
                onChange={(e) => setFromUnitLength(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="mm">Milímetros (mm)</option>
                <option value="cm">Centímetros (cm)</option>
                <option value="m">Metros (m)</option>
                <option value="km">Quilômetros (km)</option>
                <option value="inch">Polegadas (in)</option>
                <option value="foot">Pés (ft)</option>
                <option value="mile">Milhas (mi)</option>
              </select>
            )}

            {unitType === 'weight' && (
              <select
                value={fromUnitWeight}
                onChange={(e) => setFromUnitWeight(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="mg">Miligramas (mg)</option>
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="ton">Toneladas (t)</option>
                <option value="lb">Libras (lb)</option>
                <option value="oz">Onças (oz)</option>
              </select>
            )}

            {unitType === 'temperature' && (
              <select
                value={fromTemp}
                onChange={(e) => setFromTemp(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
                <option value="K">Kelvin (K)</option>
              </select>
            )}

            {unitType === 'data' && (
              <select
                value={fromData}
                onChange={(e) => setFromData(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="B">Bytes (B)</option>
                <option value="KB">Kilobytes (KB)</option>
                <option value="MB">Megabytes (MB)</option>
                <option value="GB">Gigabytes (GB)</option>
                <option value="TB">Terabytes (TB)</option>
              </select>
            )}
          </div>
        </div>

        {/* Output To */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Para:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-lg font-mono font-extrabold text-indigo-700 dark:text-indigo-300">
              {Number.isInteger(convertedValue)
                ? convertedValue
                : parseFloat(convertedValue.toFixed(6))}
            </div>

            {unitType === 'length' && (
              <select
                value={toUnitLength}
                onChange={(e) => setToUnitLength(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="mm">Milímetros (mm)</option>
                <option value="cm">Centímetros (cm)</option>
                <option value="m">Metros (m)</option>
                <option value="km">Quilômetros (km)</option>
                <option value="inch">Polegadas (in)</option>
                <option value="foot">Pés (ft)</option>
                <option value="mile">Milhas (mi)</option>
              </select>
            )}

            {unitType === 'weight' && (
              <select
                value={toUnitWeight}
                onChange={(e) => setToUnitWeight(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="mg">Miligramas (mg)</option>
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="ton">Toneladas (t)</option>
                <option value="lb">Libras (lb)</option>
                <option value="oz">Onças (oz)</option>
              </select>
            )}

            {unitType === 'temperature' && (
              <select
                value={toTemp}
                onChange={(e) => setToTemp(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
                <option value="K">Kelvin (K)</option>
              </select>
            )}

            {unitType === 'data' && (
              <select
                value={toData}
                onChange={(e) => setToData(e.target.value)}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs"
              >
                <option value="B">Bytes (B)</option>
                <option value="KB">Kilobytes (KB)</option>
                <option value="MB">Megabytes (MB)</option>
                <option value="GB">Gigabytes (GB)</option>
                <option value="TB">Terabytes (TB)</option>
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
