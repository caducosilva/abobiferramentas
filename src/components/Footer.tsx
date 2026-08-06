import { useState } from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { PrivacyTermsModal } from './PrivacyTermsModal';

interface FooterProps {
  onOpenPwaModal?: () => void;
}

export function Footer({ onOpenPwaModal }: FooterProps) {
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-10 text-xs text-slate-400 dark:text-slate-500 max-w-7xl mx-auto w-full transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        <span>&copy; {new Date().getFullYear()} abobiferramentas • Ferramentas online 100% gratuitas</span>
        <button
          onClick={() => setLegalTab('privacy')}
          className="hover:underline hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          Política de Privacidade
        </button>
        <span>•</span>
        <button
          onClick={() => setLegalTab('terms')}
          className="hover:underline hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          Termos de Uso
        </button>
      </div>

      <div className="flex items-center gap-4 font-medium">
        {onOpenPwaModal && (
          <button
            onClick={onOpenPwaModal}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar App (iOS / Android)</span>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Rápido • Seguro • Protegido com Rate Limit</span>
          <span className="sm:hidden">Rate Limit</span>
        </div>
      </div>

      <PrivacyTermsModal
        isOpen={legalTab !== null}
        tab={legalTab ?? 'privacy'}
        onChangeTab={setLegalTab}
        onClose={() => setLegalTab(null)}
      />
    </footer>
  );
}
