import { useMemo, useState } from 'react';
import { Search, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { MOGI_BUS_LINES } from '../../data/mogiBusData';

const DAY_TABS = [
  { key: 'weekdays', label: 'Seg a Sex' },
  { key: 'saturdays', label: 'Sábado' },
  { key: 'sundays', label: 'Domingo' },
] as const;

type DayKey = (typeof DAY_TABS)[number]['key'];

export function MogiBusSchedule() {
  const [query, setQuery] = useState('');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [dayByCode, setDayByCode] = useState<Record<string, DayKey>>({});

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return MOGI_BUS_LINES;
    return MOGI_BUS_LINES.filter(
      (line) =>
        line.code.toLowerCase().includes(q) ||
        line.name.toLowerCase().includes(q) ||
        line.terminal.toLowerCase().includes(q) ||
        line.type.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Horários de Ônibus de Mogi das Cruzes
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Linhas municipais (SIM Mogi) e intermunicipais (EMTU). Horários informativos — podem mudar sem aviso das
          operadoras.
        </p>
      </div>

      <div className="max-w-xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por código ou bairro (ex: C001, Jundiapeba, Brás Cubas, Sabaúna)..."
          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-lime-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">Nenhuma linha encontrada para essa busca.</p>
        ) : (
          filtered.map((line) => {
            const isExpanded = expandedCode === line.code;
            const activeDay = dayByCode[line.code] ?? 'weekdays';
            const times = line[activeDay];

            return (
              <div
                key={line.code}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCode(isExpanded ? null : line.code)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                >
                  <span className="shrink-0 w-14 h-9 flex items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 font-mono font-bold text-xs">
                    {line.code}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{line.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {line.terminal}
                      </span>
                      <span>{line.type}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex gap-2">
                      {DAY_TABS.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setDayByCode((prev) => ({ ...prev, [line.code]: tab.key }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            activeDay === tab.key
                              ? 'bg-lime-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {times.map((time, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
