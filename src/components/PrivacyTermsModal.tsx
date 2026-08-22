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
              O <strong>abobiferramentas</strong> respeita integralmente a sua privacidade. Operações como formatação
              de JSON, comparação de código (Diff), geração de senhas, validação e geração de documentos (CPF/CNPJ),
              compressão de imagem e cálculo de hashes ocorrem <strong>exclusivamente no seu navegador</strong>,
              sem envio de dados para servidores externos.
            </p>
            <p>
              Utilizamos apenas o <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">localStorage</code> do
              seu navegador para guardar preferências de tema (claro/escuro), ferramentas favoritas e anotações do
              bloco rápido local criptografadas na sua máquina.
            </p>
            <p>
              Apenas a <strong>Consulta de CEP</strong> faz uma chamada de rede para a API pública do ViaCEP, enviando
              exclusivamente os dígitos do CEP pesquisado.
            </p>
            <p>
              Este site é 100% livre de rastreadores invasivos e livre de anúncios publicitários.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Termos de Uso</h3>
            <p>Ao utilizar o <strong>abobiferramentas</strong>, você concorda com os seguintes termos:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>As ferramentas de geração de CPF e CNPJ destinam-se exclusivamente a testes de sistemas e desenvolvimento de software.</li>
              <li>Não nos responsabilizamos pelo uso indevido de dados gerados por terceiros em sistemas de produção.</li>
              <li>Os horários de ônibus (Mogi das Cruzes, São Paulo, Fortaleza e Ceará) são informativos e podem sofrer alterações pelas operadoras sem aviso prévio.</li>
              <li>Todas as ferramentas são fornecidas gratuitamente, "como estão", para fins educacionais e produtividade de desenvolvedores.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
