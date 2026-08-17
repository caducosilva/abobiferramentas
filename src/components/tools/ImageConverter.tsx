import { useRef, useState } from 'react';
import { Download, Image as ImageIcon, Loader2, RefreshCw, Upload } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

type TargetFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const FORMATS: { id: TargetFormat; label: string; extension: string; lossy: boolean }[] = [
  { id: 'image/webp', label: 'WebP', extension: 'webp', lossy: true },
  { id: 'image/jpeg', label: 'JPG', extension: 'jpg', lossy: true },
  { id: 'image/png', label: 'PNG', extension: 'png', lossy: false },
];

interface ConversionResult {
  url: string;
  size: number;
  width: number;
  height: number;
  format: TargetFormat;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function ImageConverter({ onCopyToast }: ToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/webp');
  const [quality, setQuality] = useState(0.9);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentFormat = FORMATS.find((format) => format.id === targetFormat)!;

  const resetResult = () => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  const handleSelectFile = (selected: File | null) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.');
      return;
    }
    setError(null);
    resetResult();
    setFile(selected);
  };

  const handleConvert = async () => {
    if (!file) return;

    const rateCheck = checkAndConsumeRateLimit('conversor-imagem');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('Limite de conversões atingido. Aguarde alguns segundos.');
      return;
    }
    setBlockedResult(null);
    setWorking(true);
    setError(null);

    try {
      // createImageBitmap decodifica fora da thread principal e evita o vazamento do
      // Image + objectURL que a abordagem antiga com <img> exigia gerenciar na mão.
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas indisponível neste navegador.');

      // JPG não tem transparência: sem o fundo branco, área transparente sai preta.
      if (targetFormat === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0);
      bitmap.close();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, targetFormat, currentFormat.lossy ? quality : undefined)
      );
      if (!blob) throw new Error('Não foi possível gerar a imagem convertida.');

      resetResult();
      setResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        width: canvas.width,
        height: canvas.height,
        format: targetFormat,
      });
      onCopyToast(`Imagem convertida para ${currentFormat.label}!`);
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : 'Falha ao converter a imagem.'
      );
    } finally {
      setWorking(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'imagem';
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `${baseName}.${currentFormat.extension}`;
    link.click();
  };

  const savings =
    result && file ? Math.round(((file.size - result.size) / file.size) * 100) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="conversor-imagem"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Seleção do arquivo */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleSelectFile(event.dataTransfer.files?.[0] ?? null);
        }}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 transition"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
          className="hidden"
        />
        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {file ? file.name : 'Escolha ou arraste uma imagem'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {file
            ? `${formatBytes(file.size)} · ${file.type || 'tipo desconhecido'}`
            : 'PNG, JPG, WebP, GIF, BMP ou AVIF, tudo convertido no seu navegador.'}
        </p>
      </div>

      {/* Formato de saída */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Converter para</p>
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            {FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => {
                  setTargetFormat(format.id);
                  resetResult();
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  targetFormat === format.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>

        {currentFormat.lossy && (
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">
              Qualidade: {Math.round(quality * 100)}%
            </label>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || working}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
      >
        {working ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Convertendo...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" /> Converter para {currentFormat.label}
          </>
        )}
      </button>

      {result && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={result.url}
              alt="Pré-visualização da imagem convertida"
              className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
            />
            <div className="space-y-1 text-sm">
              <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-500" /> {currentFormat.label} pronto
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {result.width} x {result.height} px · {formatBytes(result.size)}
              </p>
              {savings !== null && (
                <p
                  className={`text-xs font-bold ${
                    savings > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {savings > 0
                    ? `${savings}% menor que o original`
                    : `${Math.abs(savings)}% maior que o original`}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" /> Baixar {currentFormat.label}
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        A conversão roda inteira no seu navegador, via canvas. A imagem não sobe para servidor
        nenhum, e como o canvas redesenha os pixels, metadados EXIF do original não vão para o
        arquivo convertido.
      </p>
    </div>
  );
}
