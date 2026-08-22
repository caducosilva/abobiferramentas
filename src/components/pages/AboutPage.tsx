import { ShieldCheck, Cpu, Lock, Sparkles, Heart } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8 text-slate-700 dark:text-slate-200 leading-relaxed">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sobre o abobiferramentas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Utilidades web e ferramentas para desenvolvedores, 100% gratuitas, privadas e sem anúncios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Zero Rastreamento</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Nenhum dado digitado ou gerado é transmitido ou salvo em nossos servidores. Tudo ocorre no seu próprio navegador.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Client-side First</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Processamento ultrarrápido usando JavaScript nativo e Web APIs (Web Crypto, Canvas, LocalStorage e Service Workers).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Sem Anúncios e Sem Cadastro</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sem poluição visual, banners irritantes ou formulários de login. Você acessa a ferramenta e resolve seu problema na hora.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nossa Missão</h2>
        <p>
          O <strong>abobiferramentas</strong> nasceu da necessidade de ferramentas de engenharia de software, manipulação de texto, dados de transporte e conversões que não exigissem login, não coletassem dados confidenciais e não fossem poluídas por dezenas de banners de publicidade.
        </p>
        <p>
          Projetado pelo desenvolvedor <strong>Caduco Silva</strong>, o portal é mantido como software de utilidade pública e focado em alta performance e estrito respeito à privacidade do usuário.
        </p>
      </div>
    </div>
  );
}
