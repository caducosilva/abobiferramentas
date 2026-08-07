import { HelpCircle, ListChecks } from 'lucide-react';
import seoContent from '../data/seoContent.json';

interface ToolInfoSectionProps {
  toolId: string;
}

type ToolSeoEntry = {
  howItWorks: string[];
  faq: { q: string; a: string }[];
};

const CONTENT = seoContent as unknown as Record<string, ToolSeoEntry>;

export function ToolInfoSection({ toolId }: ToolInfoSectionProps) {
  const entry = CONTENT[toolId];
  if (!entry) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <ListChecks className="w-5 h-5 text-indigo-500" />
          Como funciona
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {entry.howItWorks.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>

      {entry.faq.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Perguntas frequentes
          </h2>
          <div className="space-y-3">
            {entry.faq.map((item, idx) => (
              <details
                key={idx}
                className="group border border-slate-200 dark:border-slate-800 rounded-xl p-4 open:bg-slate-50 dark:open:bg-slate-800/40"
              >
                <summary className="text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer">
                  {item.q}
                </summary>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
