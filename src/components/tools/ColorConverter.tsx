import { useState, useMemo } from 'react';
import { Palette, Copy, Check, Eye } from 'lucide-react';

interface ColorConverterProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function ColorConverter({ onCopyToast }: ColorConverterProps) {
  const [hexColor, setHexColor] = useState('#4f46e5');
  const [copied, setCopied] = useState<string | null>(null);

  // Conversões HEX -> RGB -> HSL -> CMYK
  const conversions = useMemo(() => {
    let cleanHex = hexColor.trim().replace(/^#/, '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }

    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return null;
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // RGB
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    const rgbaStr = `rgba(${r}, ${g}, ${b}, 1.0)`;

    // HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    const hslStr = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    // CMYK
    let c = 1 - rNorm;
    let m = 1 - gNorm;
    let y = 1 - bNorm;
    let k = Math.min(c, Math.min(m, y));
    if (k === 1) {
      c = 0;
      m = 0;
      y = 0;
    } else {
      c = (c - k) / (1 - k);
      m = (m - k) / (1 - k);
      y = (y - k) / (1 - k);
    }
    const cmykStr = `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;

    // Contraste Luminância WCAG
    const sRGB = [rNorm, gNorm, bNorm].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    const lum = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    const contrastRatioWhite = (1.0 + 0.05) / (lum + 0.05);
    const contrastRatioBlack = (lum + 0.05) / (0.0 + 0.05);

    return {
      hex: `#${cleanHex.toUpperCase()}`,
      rgb: rgbStr,
      rgba: rgbaStr,
      hsl: hslStr,
      cmyk: cmykStr,
      textColor: lum > 0.4 ? '#0f172a' : '#ffffff',
      contrastWhite: contrastRatioWhite.toFixed(2),
      contrastBlack: contrastRatioBlack.toFixed(2),
    };
  }, [hexColor]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    onCopyToast(`Formato copiado: ${text}`, 'success');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conversor de Cores & Contraste WCAG</h2>
        </div>
      </div>

      {/* Color Picker & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Color Preview Block */}
        <div
          className="rounded-3xl h-36 flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 shadow-inner transition-colors duration-200"
          style={{ backgroundColor: conversions?.hex || '#ffffff' }}
        >
          <span
            className="text-lg font-mono font-extrabold tracking-wider"
            style={{ color: conversions?.textColor || '#000000' }}
          >
            {conversions?.hex || '#------'}
          </span>
          <span
            className="text-xs font-semibold opacity-80"
            style={{ color: conversions?.textColor || '#000000' }}
          >
            Pré-visualização
          </span>
        </div>

        {/* Picker and HEX Input */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={conversions?.hex || '#4f46e5'}
              onChange={(e) => setHexColor(e.target.value)}
              className="w-14 h-14 rounded-2xl cursor-pointer border-0 bg-transparent p-0 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Código HEX</label>
              <input
                type="text"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                placeholder="#4f46e5"
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Quick preset colors */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Sugestões:</span>
            {['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'].map((color) => (
              <button
                key={color}
                onClick={() => setHexColor(color)}
                className="w-6 h-6 rounded-full border border-white dark:border-slate-700 shadow-sm cursor-pointer transition hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Formats Grid */}
      {conversions && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Formatos Convertidos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'hex', label: 'HEX', val: conversions.hex },
              { id: 'rgb', label: 'RGB', val: conversions.rgb },
              { id: 'rgba', label: 'RGBA', val: conversions.rgba },
              { id: 'hsl', label: 'HSL', val: conversions.hsl },
              { id: 'cmyk', label: 'CMYK (Impressão)', val: conversions.cmyk },
            ].map((f) => (
              <div
                key={f.id}
                onClick={() => handleCopy(f.val, f.id)}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{f.label}</span>
                  <p className="font-mono text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {f.val}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {copied === f.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>

          {/* WCAG Contrast check */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Contraste de Acessibilidade (WCAG):</span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Texto Branco: <strong className="font-mono">{conversions.contrastWhite}:1</strong>
              </span>
              <span>
                Texto Preto: <strong className="font-mono">{conversions.contrastBlack}:1</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
