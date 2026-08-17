import { ShieldCheck, FileText, X } from 'lucide-react';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  tab: 'privacy' | 'terms';
  onChangeTab: (tab: 'privacy' | 'terms') => void;
  onClose: () => void;
}

export function PrivacyTermsModal({ isOpen, tab, onChangeTab, onClose }: PrivacyTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cursor-default w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 relative max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => onChangeTab('privacy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tab === 'privacy'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Privacidade
            </button>
            <button
              onClick={() => onChangeTab('terms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tab === 'terms'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Termos de Uso
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {tab === 'privacy' ? (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Política de Privacidade</h3>
            <p>
              O <strong>abobiferramentas</strong> respeita integralmente a sua privacidade. Operações como geração
              de senhas, validação de documentos (CPF/CNPJ), formatação de código, compressão de imagem e geração
              de hashes ocorrem <strong>exclusivamente no seu navegador</strong> — nenhum dado digitado ou gerado
              é enviado aos nossos servidores.
            </p>
            <p>
              Utilizamos apenas o <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">localStorage</code> do
              seu navegador para guardar preferências de tema (claro/escuro), ferramentas favoritas e notas do
              bloco rápido local.
            </p>
            <p>
              Duas ferramentas consultam dados de fora: a <strong>Consulta de CEP</strong>, que envia apenas o CEP
              digitado para o serviço público ViaCEP, e o catálogo de <strong>Apps Android Open Source</strong>, que
              lê no GitHub e no F-Droid qual é a versão atual de cada projeto. Nenhum arquivo APK é hospedado ou
              intermediado por nós: o download acontece direto no servidor de origem.
            </p>
            <p>
              Exibimos anúncios do Google AdSense, que pode utilizar cookies para personalizar anúncios relevantes.
              Nossos anúncios nunca bloqueiam ou condicionam o uso de nenhuma ferramenta. Você pode gerenciar suas
              preferências de anúncios em{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline"
              >
                adssettings.google.com
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Termos de Uso</h3>
            <p>Ao utilizar o <strong>abobiferramentas</strong>, você concorda com os seguintes termos:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>As ferramentas de geração de CPF e CNPJ destinam-se exclusivamente a testes de sistemas e desenvolvimento de software.</li>
              <li>Não nos responsabilizamos pelo uso indevido de dados gerados por terceiros.</li>
              <li>O catálogo de apps Android lista apenas software de código aberto, com link para a fonte oficial de cada projeto; não hospedamos, modificamos nem redistribuímos nenhum APK, e a instalação é de responsabilidade do usuário.</li>
              <li>Os horários de ônibus são informativos e podem sofrer alterações pelas operadoras sem aviso prévio.</li>
              <li>Todas as ferramentas são fornecidas gratuitamente, "como estão", sem garantias de disponibilidade contínua.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
