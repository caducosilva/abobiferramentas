import { useState } from 'react';
import { ShieldCheck, Smartphone, Github, Linkedin, Scale, Info, MessageSquare } from 'lucide-react';
import { PrivacyTermsModal } from './PrivacyTermsModal';

interface FooterProps {
  onOpenPwaModal?: () => void;
  onOpenTool?: (toolId: string) => void;
}

export function Footer({ onOpenPwaModal, onOpenTool }: FooterProps) {
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="py-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-6 px-4 sm:px-10 text-xs text-slate-500 dark:text-slate-400 max-w-7xl mx-auto w-full transition-colors">
      {/* Top Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-4 flex-wrap">
          {onOpenTool && (
            <>
              <button
                onClick={() => onOpenTool('sobre')}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-semibold transition"
              >
                <Info className="w-3.5 h-3.5" /> Sobre
              </button>
              <span>•</span>
              <button
                onClick={() => onOpenTool('conformidade-legal')}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-semibold transition"
              >
                <Scale className="w-3.5 h-3.5" /> Bases Legais
              </button>
              <span>•</span>
              <button
                onClick={() => onOpenTool('contato')}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-semibold transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Contato
              </button>
              <span>•</span>
            </>
          )}
          <button
            onClick={() => setLegalTab('privacy')}
            className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer font-semibold"
          >
            Privacidade
          </button>
          <span>•</span>
          <button
            onClick={() => setLegalTab('terms')}
            className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer font-semibold"
          >
            Termos de Uso
          </button>
        </div>

        {/* Social Links (GitHub & LinkedIn only) */}
        <div className="flex items-center gap-4 font-semibold">
          <a
            href="https://github.com/caducosilva"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            title="GitHub de Caduco Silva"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/caducosilva"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
            title="LinkedIn de Caduco Silva"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span>&copy; {new Date().getFullYear()} abobiferramentas • Ferramentas online 100% gratuitas</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Processamento local no navegador sob a LGPD (Lei 13.709/2018) e Marco Civil da Internet (Lei 12.965/2014).
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Zero Coleta • Sem Anúncios • 100% Client-side</span>
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
