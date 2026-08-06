import { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Sparkles, RefreshCw, FileCheck } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function ImageCompressor({ onCopyToast }: ToolProps) {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file: File) => {
    const rateCheck = checkAndConsumeRateLimit('compressor-imagem');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de compressão de imagens excedido.');
      return;
    }
    setBlockedResult(null);

    if (!file.type.startsWith('image/')) {
      onCopyToast('Selecione um arquivo de imagem válido (JPG, PNG, WebP)');
      return;
    }
    setOriginalFile(file);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalPreview(src);
      compressImage(src, quality, format, maxWidth);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (
    imgSrc: string,
    qualityPercent: number,
    mimeType: string,
    maxW: number
  ) => {
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxW) {
        height = Math.round((height * maxW) / width);
        width = maxW;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
      }

      const compressedDataUrl = canvas.toDataURL(mimeType, qualityPercent / 100);
      setCompressedPreview(compressedDataUrl);

      // Estimate compressed size in bytes
      const head = `data:${mimeType};base64,`;
      const sizeInBytes = Math.round(((compressedDataUrl.length - head.length) * 3) / 4);
      setCompressedSize(sizeInBytes);
      setIsProcessing(false);
    };
    img.src = imgSrc;
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (originalPreview) {
      compressImage(originalPreview, newQuality, format, maxWidth);
    }
  };

  const handleFormatChange = (newFormat: 'image/jpeg' | 'image/png' | 'image/webp') => {
    setFormat(newFormat);
    if (originalPreview) {
      compressImage(originalPreview, quality, newFormat, maxWidth);
    }
  };

  const handleMaxWidthChange = (newWidth: number) => {
    setMaxWidth(newWidth);
    if (originalPreview) {
      compressImage(originalPreview, quality, format, newWidth);
    }
  };

  const handleDownload = () => {
    if (!compressedPreview) return;
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const link = document.createElement('a');
    link.href = compressedPreview;
    link.download = `imagem-comprimida-${Date.now()}.${ext}`;
    link.click();
    onCopyToast('Download iniciado!');
  };

  const reductionPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="compressor-imagem"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Drag and Drop Dropzone */}
      {!originalPreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-200 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 p-10 rounded-3xl text-center cursor-pointer transition space-y-4 group"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Arraste e solte sua imagem aqui
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Suporta PNG, JPG, WebP (até 25 MB)
            </p>
          </div>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition">
            Selecionar do Computador
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Quality Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Qualidade:
                </label>
                <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Format Picker */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                Formato de Saída
              </label>
              <select
                value={format}
                onChange={(e) =>
                  handleFormatChange(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')
                }
                className="w-full py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl outline-none"
              >
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/webp">WebP (.webp)</option>
                <option value="image/png">PNG (.png)</option>
              </select>
            </div>

            {/* Max Width */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                Largura Máxima
              </label>
              <select
                value={maxWidth}
                onChange={(e) => handleMaxWidthChange(Number(e.target.value))}
                className="w-full py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl outline-none"
              >
                <option value={3840}>4K (3840px)</option>
                <option value={1920}>Full HD (1920px)</option>
                <option value={1280}>HD (1280px)</option>
                <option value={800}>Web Small (800px)</option>
              </select>
            </div>
          </div>

          {/* Metrics comparison badge */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Economia de Espaço
                </span>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {reductionPercent > 0 ? `-${reductionPercent}% de redução!` : 'Tamanho mantido'}
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 dark:text-slate-300 font-mono">
              <div>Original: <strong>{formatBytes(originalSize)}</strong></div>
              <div>Comprimido: <strong className="text-emerald-600 dark:text-emerald-400">{formatBytes(compressedSize)}</strong></div>
            </div>
          </div>

          {/* Previews side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Original ({formatBytes(originalSize)})
              </span>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                <img src={originalPreview} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Comprimida ({formatBytes(compressedSize)})
              </span>
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                {compressedPreview && (
                  <img src={compressedPreview} alt="Compressed" className="max-h-full max-w-full object-contain rounded-lg" />
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-5 h-5" /> Baixar Imagem Comprimida
            </button>
            <button
              onClick={() => {
                setOriginalPreview(null);
                setCompressedPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl transition cursor-pointer text-sm"
            >
              Trocar Imagem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
