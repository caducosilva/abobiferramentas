import { useState, useEffect } from 'react';
import { Notebook, Copy, Trash2, Download, ShieldCheck, Check, HardDrive, Sparkles, X } from 'lucide-react';

interface LocalScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function LocalScratchpadModal({ isOpen, onClose, onToast }: LocalScratchpadModalProps) {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('abobi_scratchpad') || '';
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('abobi_scratchpad', note);
  }, [note]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!note) return;
    navigator.clipboard.writeText(note);
    setCopied(true);
    onToast('Anotações copiadas para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar seu bloco de notas local?')) {
      setNote('');
      onToast('Bloco de notas limpo.');
    }
  };

  const handleDownload = () => {
    if (!note) return;
    const blob = new Blob([note], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abobi-anotacoes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Arquivo baixado!');
  };

  const handleClearAllStorage = () => {
    if (window.confirm('Isso irá apagar todos os favoritos, anotações e preferências salvas no seu navegador. Deseja continuar?')) {
      localStorage.clear();
      setNote('');
      onToast('Todos os dados locais foram apagados do seu navegador!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cursor-default w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <Notebook className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Bloco Rápido & Privacidade
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Salvo instantaneamente no seu navegador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Storage Privacy Banner */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Armazenamento 100% no seu Navegador (Client-Side Persistence):</span>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
              Tudo o que você digita, favorita ou gera no site fica guardado apenas na memória local do seu próprio dispositivo (LocalStorage). Nenhum dado é enviado ou armazenado em nossos servidores.
            </p>
          </div>
        </div>

        {/* Textarea Scratchpad */}
        <div className="flex-1 flex flex-col min-h-[180px] space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Rascunho Pessoal do Usuário:</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              {note.length} caracteres
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Cole aqui rascunhos, CPFs, textos ou anotações temporárias..."
            className="flex-1 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>

        {/* Scratchpad Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!note}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Tudo'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!note}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .TXT</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              disabled={!note}
              className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl text-xs font-semibold transition flex items-center gap-1 disabled:opacity-30 cursor-pointer"
              title="Limpar apenas este bloco"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Bloco</span>
            </button>

            <button
              onClick={handleClearAllStorage}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1 cursor-pointer"
              title="Apagar todos os dados salvos no navegador"
            >
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Resetar Navegador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
