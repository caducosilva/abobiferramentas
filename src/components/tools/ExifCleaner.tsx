import { useState } from 'react';
import { FileUp, X, ShieldCheck, MapPin, Camera, Calendar, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { parseExif, stripMetadata, ExifData } from '../../utils/exifUtils';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function ExifCleaner({ onCopyToast }: ToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const handleFileSelect = async (selected: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setExif(null);
    if (!selected) {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(selected));
    setAnalyzing(true);
    try {
      const buffer = await selected.arrayBuffer();
      setExif(parseExif(buffer));
    } catch {
      setExif(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadClean = async () => {
    if (!file) return;
    setCleaning(true);
    try {
      const cleaned = await stripMetadata(file);
      const url = URL.createObjectURL(cleaned);
      const a = document.createElement('a');
      const baseName = file.name.replace(/\.[^.]+$/, '');
      a.href = url;
      a.download = `${baseName}-sem-metadados.${cleaned.type === 'image/png' ? 'png' : 'jpg'}`;
      a.click();
      URL.revokeObjectURL(url);
      onCopyToast('Imagem limpa baixada! Os metadados foram removidos.');
    } catch (err) {
      onCopyToast(err instanceof Error ? err.message : 'Não foi possível limpar esta imagem.');
    } finally {
      setCleaning(false);
    }
  };

  const hasGps = exif?.gpsLatitude !== undefined && exif?.gpsLongitude !== undefined;
  const hasAnyExif = exif && Object.values(exif).some((v) => v !== undefined);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Limpador de Metadados de Fotos</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Veja e remova dados EXIF escondidos em fotos (localização GPS, modelo da câmera, data) antes de compartilhar.
        </p>
      </div>

      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          A foto é lida e processada inteiramente no seu navegador — ela nunca é enviada para nosso servidor.
        </p>
      </div>

      {!file ? (
        <label className="flex flex-col items-center justify-center gap-2 p-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition">
          <FileUp className="w-8 h-8 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Clique ou arraste uma foto aqui (JPG recomendado)
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Pré-visualização"
                className="w-24 h-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
                <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => handleFileSelect(null)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {analyzing && <p className="text-xs text-slate-400 text-center">Analisando metadados...</p>}

          {!analyzing && (
            <>
              {hasGps && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" /> Esta foto contém a localização exata onde foi tirada!
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {exif!.gpsLatitude!.toFixed(6)}, {exif!.gpsLongitude!.toFixed(6)}
                  </p>
                </div>
              )}

              {!hasAnyExif && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Nenhum metadado EXIF encontrado nesta imagem.
                </div>
              )}

              {hasAnyExif && (exif?.make || exif?.model || exif?.dateTaken || exif?.software) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(exif?.make || exif?.model) && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {[exif?.make, exif?.model].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  )}
                  {exif?.dateTaken && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{exif.dateTaken}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleDownloadClean}
                disabled={cleaning}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {cleaning ? 'Limpando...' : 'Baixar versão sem metadados'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
