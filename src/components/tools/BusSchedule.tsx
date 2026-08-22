import { useMemo, useState } from 'react';
import { Search, MapPin, Clock, ChevronDown, ChevronUp, Bus } from 'lucide-react';
import { MOGI_BUS_LINES } from '../../data/mogiBusData';
import { SP_BUS_LINES } from '../../data/spBusData';
import { FORTALEZA_BUS_LINES } from '../../data/fortalezaBusData';
import { CEARA_BUS_LINES } from '../../data/cearaBusData';
import { BusLine } from '../../types';

export type BusCityKey = 'mogi' | 'sp' | 'fortaleza' | 'ceara';

const CITY_CONFIG: Record<
  BusCityKey,
  {
    title: string;
    subtitle: string;
    badge: string;
    data: BusLine[];
    searchPlaceholder: string;
  }
> = {
  mogi: {
    title: 'Horários de Ônibus de Mogi das Cruzes (SP)',
    subtitle: 'Linhas municipais SIM Mogi, com dados do portal oficial da prefeitura.',
    badge: 'SIM Mogi',
    data: MOGI_BUS_LINES,
    searchPlaceholder: 'Buscar por código ou bairro (ex: C001, Jundiapeba, Brás Cubas, Sabaúna)...',
  },
  sp: {
    title: 'Horários de Ônibus de São Paulo Capital (SPTrans)',
    subtitle: 'Principais linhas troncais, estruturais e interterminais da capital paulista.',
    badge: 'SPTrans',
    data: SP_BUS_LINES,
    searchPlaceholder: 'Buscar por linha ou terminal (ex: 8000, Lapa, Paulista, Itaquera, Santana)...',
  },
  fortaleza: {
    title: 'Horários de Ônibus de Fortaleza (Etufor / CE)',
    subtitle: 'Linhas expressas, troncais e interterminais de Fortaleza (Papicu, Messejana, Bezerra, Parangaba).',
    badge: 'Etufor / Sindiônibus',
    data: FORTALEZA_BUS_LINES,
    searchPlaceholder: 'Buscar por código ou terminal (ex: 026, Papicu, Messejana, Beira Mar, Unifor)...',
  },
  ceara: {
    title: 'Horários de Ônibus do Ceará (Caucaia, Juazeiro, Sobral, Maracanaú)',
    subtitle: 'Linhas urbanas e metropolitanas das principais cidades do Ceará.',
    badge: 'Ceará Regional',
    data: CEARA_BUS_LINES,
    searchPlaceholder: 'Buscar por linha, bairro ou cidade (ex: Cumbuco, Aeroporto Juazeiro, Sobral, Jereissati)...',
  },
};

const DAY_TABS = [
  { key: 'weekdays', label: 'Seg a Sex' },
  { key: 'saturdays', label: 'Sábado' },
  { key: 'sundays', label: 'Domingo' },
] as const;

type DayKey = (typeof DAY_TABS)[number]['key'];

interface BusScheduleProps {
  initialCity?: BusCityKey;
  showCitySwitcher?: boolean;
}

export function BusSchedule({ initialCity = 'mogi', showCitySwitcher = true }: BusScheduleProps) {
  const [activeCity, setActiveCity] = useState<BusCityKey>(initialCity);
  const [query, setQuery] = useState('');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [dayByCode, setDayByCode] = useState<Record<string, DayKey>>({});
  const [cearaCityFilter, setCearaCityFilter] = useState<string>('todos');

  const config = CITY_CONFIG[activeCity];

  const filtered = useMemo(() => {
    let list = config.data;

    if (activeCity === 'ceara' && cearaCityFilter !== 'todos') {
      list = list.filter((line) => line.cidade?.toLowerCase().includes(cearaCityFilter.toLowerCase()));
    }

    const q = query.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (line) =>
        line.code.toLowerCase().includes(q) ||
        line.name.toLowerCase().includes(q) ||
        line.pontoA.toLowerCase().includes(q) ||
        line.pontoB.toLowerCase().includes(q) ||
        (line.cidade && line.cidade.toLowerCase().includes(q)) ||
        (line.empresa && line.empresa.toLowerCase().includes(q))
    );
  }, [config.data, query, activeCity, cearaCityFilter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* City Switcher Tabs */}
      {showCitySwitcher && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-5">
          <button
            onClick={() => {
              setActiveCity('mogi');
              setExpandedCode(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeCity === 'mogi'
                ? 'bg-lime-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" /> Mogi das Cruzes (SP)
          </button>
          <button
            onClick={() => {
              setActiveCity('sp');
              setExpandedCode(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeCity === 'sp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" /> São Paulo Capital (SPTrans)
          </button>
          <button
            onClick={() => {
              setActiveCity('fortaleza');
              setExpandedCode(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeCity === 'fortaleza'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" /> Fortaleza (CE)
          </button>
          <button
            onClick={() => {
              setActiveCity('ceara');
              setExpandedCode(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeCity === 'ceara'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" /> Cidades do Ceará
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <span>{config.badge}</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{config.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{config.subtitle}</p>
      </div>

      {/* Ceará Sub-cities filter */}
      {activeCity === 'ceara' && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[
            { id: 'todos', label: 'Todas as Cidades' },
            { id: 'caucaia', label: 'Caucaia' },
            { id: 'juazeiro', label: 'Juazeiro do Norte' },
            { id: 'sobral', label: 'Sobral' },
            { id: 'maracanau', label: 'Maracanaú' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCearaCityFilter(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                cearaCityFilter === item.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="max-w-xl mx-auto relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={config.searchPlaceholder}
          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">Nenhuma linha encontrada para essa busca.</p>
        ) : (
          filtered.map((line) => {
            const isExpanded = expandedCode === line.code;
            const activeDay = dayByCode[line.code] ?? 'weekdays';
            const schedule = line[activeDay] || { ida: [], volta: [] };

            return (
              <div
                key={line.code}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 transition"
              >
                <button
                  onClick={() => setExpandedCode(isExpanded ? null : line.code)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition cursor-pointer"
                >
                  <span className="shrink-0 min-w-16 px-2.5 h-9 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
                    {line.code}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{line.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {line.pontoA} ↔ {line.pontoB}
                      </span>
                      {line.empresa && <span>{line.empresa}</span>}
                      {line.cidade && <span className="font-semibold text-slate-500">• {line.cidade}</span>}
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
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {(!schedule.ida || schedule.ida.length === 0) &&
                    (!schedule.volta || schedule.volta.length === 0) ? (
                      <p className="text-xs text-slate-400 py-2">Sem horários cadastrados para este dia.</p>
                    ) : (
                      <>
                        {schedule.ida && schedule.ida.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {line.pontoA} → {line.pontoB} (Ida)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {schedule.ida.map((time, idx) => (
                                <span
                                  key={idx}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300"
                                >
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {time.slice(0, 5)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {schedule.volta && schedule.volta.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {line.pontoB} → {line.pontoA} (Volta)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {schedule.volta.map((time, idx) => (
                                <span
                                  key={idx}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300"
                                >
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {time.slice(0, 5)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
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

export function MogiBusSchedule() {
  return <BusSchedule initialCity="mogi" />;
}

export function SpBusSchedule() {
  return <BusSchedule initialCity="sp" />;
}

export function FortalezaBusSchedule() {
  return <BusSchedule initialCity="fortaleza" />;
}

export function CearaBusSchedule() {
  return <BusSchedule initialCity="ceara" />;
}
