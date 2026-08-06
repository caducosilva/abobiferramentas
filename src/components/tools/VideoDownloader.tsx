import { useState } from 'react';
import {
  ClipboardPaste,
  Search,
  Loader2,
  Film,
  Music,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import { AdSlot } from '../AdSlot';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

interface VideoResult {
  ok: true;
  kind: 'video';
  platform: string;
  title: string;
  thumbnail: string | null;
  duration: number | null;
  qualityLabel: string | null;
  hasVideo?: boolean;
  hasAudio?: boolean;
  sourceUrl: string;
}

interface PlaylistItem {
  title: string;
  thumbnail: string | null;
  duration: string | number | null;
  sourceUrl: string;
}

interface PlaylistResult {
  ok: true;
  kind: 'playlist';
  platform: string;
  title: string;
  items: PlaylistItem[];
}

type ResolveResponse = VideoResult | PlaylistResult | { ok: false; error: string };

// Explicit type predicate: this tsconfig doesn't enable `strict`, and control-flow
// narrowing on `!data.ok` is unreliable across a union with more than one `ok: true` member.
function isResolveError(data: ResolveResponse): data is { ok: false; error: string } {
  return data.ok === false;
}

export function VideoDownloader({ onCopyToast }: ToolProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const process = async (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) {
      onCopyToast('Cole um link de vídeo ou playlist primeiro!');
      return;
    }

    setStatus('searching');
    setError(null);
    setResult(null);
    setPlaylist(null);

    try {
      const resp = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data: ResolveResponse = await resp.json();

      if (isResolveError(data)) {
        setError(data.error || 'Não foi possível processar este link.');
        return;
      }

      if (data.kind === 'playlist') {
        setPlaylist(data);
        setSelectedItems(new Set(data.items.map((_, idx) => idx)));
      } else {
        setResult(data);
      }
    } catch {
      setError('Erro de conexão ao processar este link. Tente novamente.');
    } finally {
      setStatus('idle');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        process(text);
      }
    } catch {
      onCopyToast('Cole o link manualmente no campo');
    }
  };

  const triggerDownload = async (sourceUrl: string, kind: 'video' | 'audio', titleHint: string) => {
    const key = `${sourceUrl}:${kind}`;
    setDownloadingKey(key);
    setProgress(0);

    try {
      const resp = await fetch(`/api/download?url=${encodeURIComponent(sourceUrl)}&kind=${kind}`);

      if (!resp.ok || !resp.body) {
        let msg = 'Falha ao baixar este arquivo.';
        try {
          const j = await resp.json();
          if (j.error) msg = j.error;
        } catch {
          // response wasn't JSON, keep default message
        }
        throw new Error(msg);
      }

      const total = Number(resp.headers.get('content-length')) || 0;
      const disposition = resp.headers.get('content-disposition') || '';
      const fnMatch = disposition.match(/filename="([^"]+)"/);
      const fileName = fnMatch ? fnMatch[1] : `${titleHint || 'abobi-video'}.${kind === 'audio' ? 'mp3' : 'mp4'}`;

      const reader = resp.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) {
          setProgress(Math.min(100, Math.round((received / total) * 100)));
        }
      }

      setProgress(100);

      const blob = new Blob(chunks as BlobPart[]);
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);

      onCopyToast(`Download concluído: ${fileName}`);
    } catch (err) {
      onCopyToast(err instanceof Error ? err.message : 'Erro ao baixar este arquivo.');
    } finally {
      setTimeout(() => {
        setDownloadingKey(null);
        setProgress(null);
      }, 1200);
    }
  };

  const toggleItem = (idx: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (!playlist) return;
    setSelectedItems((prev) =>
      prev.size === playlist.items.length ? new Set() : new Set(playlist.items.map((_, idx) => idx))
    );
  };

  const downloadSelectedPlaylist = async () => {
    if (!playlist) return;
    for (const idx of selectedItems) {
      const item = playlist.items[idx];
      await triggerDownload(item.sourceUrl, 'video', item.title);
    }
  };

  const isYouTube = result?.platform === 'YOUTUBE' || result?.platform === 'YOUTUBE_MUSIC';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Baixar Vídeos Direto no Seu Dispositivo
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          YouTube, YouTube Music, TikTok sem marca d'água, Instagram, Facebook e Twitter/X — sempre na maior
          qualidade disponível.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Funciona apenas com conteúdo público. Quando a plataforma de origem bloqueia o acesso (comum em qualquer
          site hospedado na nuvem), mostramos o erro real em vez de fingir que funcionou.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-3">
        <div className="relative">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && process(inputUrl)}
            placeholder="Cole o link do vídeo ou playlist aqui..."
            className="w-full p-3.5 pr-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handlePaste}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" /> Colar
          </button>
        </div>

        <button
          onClick={() => process(inputUrl)}
          disabled={status === 'searching'}
          className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {status === 'searching' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{status === 'searching' ? 'Buscando vídeo...' : 'Buscar Vídeo'}</span>
        </button>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-3.5 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {downloadingKey && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-indigo-600 dark:text-indigo-400">Baixando arquivo real...</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{progress ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-200"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="relative w-32 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200 dark:border-slate-700">
                {result.thumbnail && (
                  <img src={result.thumbnail} alt="Miniatura do vídeo" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {result.platform.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {result.qualityLabel ? `Qualidade: ${result.qualityLabel}` : 'Maior qualidade disponível'}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{result.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {result.hasVideo !== false && (
                <button
                  onClick={() => triggerDownload(result.sourceUrl, 'video', result.title)}
                  disabled={downloadingKey === `${result.sourceUrl}:video`}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Film className="w-4 h-4" />
                  <span>Baixar Vídeo</span>
                </button>
              )}
              {isYouTube && result.hasAudio && (
                <button
                  onClick={() => triggerDownload(result.sourceUrl, 'audio', result.title)}
                  disabled={downloadingKey === `${result.sourceUrl}:audio`}
                  className="py-3 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Music className="w-4 h-4" />
                  <span>Baixar Áudio (MP3)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {playlist && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Playlist do YouTube
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{playlist.title}</p>
              </div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.size === playlist.items.length}
                  onChange={toggleAll}
                  className="accent-indigo-600 w-4 h-4 cursor-pointer"
                />
                Selecionar todos
              </label>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {playlist.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(idx)}
                    onChange={() => toggleItem(idx)}
                    className="accent-indigo-600 w-4 h-4 shrink-0 cursor-pointer"
                  />
                  {item.thumbnail && (
                    <img src={item.thumbnail} className="w-16 h-10 object-cover rounded-md bg-slate-100 dark:bg-slate-800 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.title}</p>
                    {item.duration && <p className="text-[10px] text-slate-400">{item.duration}</p>}
                  </div>
                  <button
                    onClick={() => triggerDownload(item.sourceUrl, 'video', item.title)}
                    disabled={downloadingKey === `${item.sourceUrl}:video`}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer shrink-0"
                    title="Baixar este vídeo"
                  >
                    <DownloadCloud className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={downloadSelectedPlaylist}
              disabled={selectedItems.size === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ListChecks className="w-4 h-4" />
              <span>Baixar {selectedItems.size} item(s) selecionado(s)</span>
            </button>
          </div>
        )}

        {/* Passive ad slot — never blocks a download */}
        <AdSlot format="rectangle" />

        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
          Respeite os direitos autorais do conteúdo baixado.
        </p>
      </div>
    </div>
  );
}
