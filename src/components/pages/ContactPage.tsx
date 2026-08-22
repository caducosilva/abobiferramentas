import { Mail, Github, Linkedin, MessageSquare, Shield } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8 text-slate-700 dark:text-slate-200">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contato & Comunidade
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Canais oficiais para sugestões, contribuições, reporte de bugs ou parcerias profissionais.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4">
        {/* GitHub Card */}
        <a
          href="https://github.com/caducosilva"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-3 hover:border-indigo-500 transition group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">GitHub</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              github.com/caducosilva
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline">
            Ver repositórios e projetos &rarr;
          </span>
        </a>

        {/* LinkedIn Card */}
        <a
          href="https://linkedin.com/in/caducosilva"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-3 hover:border-blue-500 transition group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
            <Linkedin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">LinkedIn</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              linkedin.com/in/caducosilva
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
            Conectar profissionalmente &rarr;
          </span>
        </a>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Privacidade em Primeiro Lugar</span>
        </div>
        <p>
          Não disponibilizamos formulários com armazenamento de mensagens em banco de dados para garantir que seus dados de contato nunca fiquem expostos a vazamentos. Use nossos canais diretos acima.
        </p>
      </div>
    </div>
  );
}
