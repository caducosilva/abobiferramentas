import { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, CheckCircle2, Monitor, X, Sparkles } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function PwaInstallModal({ isOpen, onClose, onToast }: PwaInstallModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Detect if already installed / standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      onToast('Aplicativo instalado com sucesso na sua tela inicial!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onToast]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onToast('Instalando o abobiferramentas...');
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cursor-default w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Instalar no Celular / PC (PWA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesso rápido como App nativo sem precisar de loja
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

        {/* Status state */}
        {isStandalone || installed ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">App já está instalado!</span>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Você já está rodando o abobiferramentas como aplicativo nativo no seu dispositivo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct 1-Click Install Button if supported */}
            {deferredPrompt && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Instalação Direta com 1-Clique Disponível!</span>
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-300">
                  Seu navegador (Android / Chrome / Edge) permite instalar este site como um aplicativo independente.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar abobiferramentas Agora</span>
                </button>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {isIOS && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Share className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Como instalar no iPhone / iPad (iOS):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                  <li>
                    Toque no ícone de <span className="font-bold text-indigo-600 dark:text-indigo-400">Compartilhar</span> (<Share className="w-3.5 h-3.5 inline mx-0.5" />) no menu inferior do Safari.
                  </li>
                  <li>
                    Role para baixo no menu e selecione <span className="font-bold text-indigo-600 dark:text-indigo-400 font-semibold">"Adicionar à Tela de Início"</span> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).
                  </li>
                  <li>
                    Confirme o nome e toque em <span className="font-bold">Adicionar</span> no canto superior direito.
                  </li>
                </ol>
              </div>
            )}

            {/* Android / PC general Instructions */}
            {!deferredPrompt && !isIOS && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Instalação Manual no Navegador:</span>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
                    <span><strong>Android (Chrome/Edge):</strong> Abra o menu de 3 pontos no canto superior do navegador e toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">•</span>
                    <span><strong>Computador (Chrome/Edge):</strong> Clique no ícone de tela de computador/instalação na barra de endereço ao lado da URL para instalar no Windows ou Mac.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Benefits section */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">🚀 Carregamento Instantâneo</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Funciona offline e abre em 1 segundo</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">📱 Tela Cheia Sem Barras</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Interface limpa igual app da App Store / Play Store</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
