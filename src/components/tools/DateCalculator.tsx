import { useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus, Cake } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

type Mode = 'diferenca' | 'somar' | 'idade';

const MS_PER_DAY = 86400000;

/** Lê "AAAA-MM-DD" como data local. new Date(string) trataria como UTC e erraria o dia por fuso. */
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1) return null;
  return date;
}

function toInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatLong(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Conta apenas os dias de segunda a sexta no intervalo, incluindo as duas pontas. */
function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/** Diferença em anos, meses e dias cheios, do jeito que uma pessoa conta idade. */
function calendarDiff(start: Date, end: Date) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    // Dia 0 do mês do fim é o último dia do mês anterior, que é de onde os dias "emprestados" vêm.
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

export function DateCalculator({ onCopyToast }: ToolProps) {
  const today = useMemo(() => new Date(), []);
  const [mode, setMode] = useState<Mode>('diferenca');
  const [startDate, setStartDate] = useState(toInputValue(today));
  const [endDate, setEndDate] = useState(toInputValue(today));
  const [birthDate, setBirthDate] = useState('');
  const [offsetDays, setOffsetDays] = useState('30');
  const [offsetDirection, setOffsetDirection] = useState<'somar' | 'subtrair'>('somar');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const guard = (): boolean => {
    const rateCheck = checkAndConsumeRateLimit('calculadora-datas');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('Limite de cálculos atingido. Aguarde alguns segundos.');
      return false;
    }
    setBlockedResult(null);
    return true;
  };

  const difference = useMemo(() => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    if (!start || !end) return null;

    const [from, to] = start <= end ? [start, end] : [end, start];
    const totalDays = Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);

    return {
      totalDays,
      businessDays: countBusinessDays(from, to),
      weeks: Math.floor(totalDays / 7),
      calendar: calendarDiff(from, to),
      inverted: start > end,
    };
  }, [startDate, endDate]);

  const shifted = useMemo(() => {
    const start = parseLocalDate(startDate);
    const days = Number(offsetDays);
    if (!start || !Number.isFinite(days)) return null;

    const result = new Date(start);
    result.setDate(result.getDate() + (offsetDirection === 'somar' ? days : -days));
    return result;
  }, [startDate, offsetDays, offsetDirection]);

  const age = useMemo(() => {
    const birth = parseLocalDate(birthDate);
    if (!birth) return null;

    const now = new Date();
    if (birth > now) return null;

    const parts = calendarDiff(birth, now);
    const totalDays = Math.floor((now.getTime() - birth.getTime()) / MS_PER_DAY);

    // Próximo aniversário: tenta no ano corrente e, se já passou, joga para o ano seguinte.
    let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysToBirthday = Math.round(
      (nextBirthday.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
        MS_PER_DAY
    );

    return { ...parts, totalDays, daysToBirthday, nextBirthday };
  }, [birthDate]);

  const copyResult = (text: string) => {
    if (!guard()) return;
    navigator.clipboard.writeText(text);
    onCopyToast('Resultado copiado!');
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="calculadora-datas"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        {[
          { id: 'diferenca' as Mode, label: 'Diferença', icon: CalendarDays },
          { id: 'somar' as Mode, label: 'Somar dias', icon: CalendarPlus },
          { id: 'idade' as Mode, label: 'Idade', icon: Cake },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === tab.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {mode === 'diferenca' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data final</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {difference && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Dias corridos', value: difference.totalDays },
                  { label: 'Dias úteis', value: difference.businessDays },
                  { label: 'Semanas cheias', value: difference.weeks },
                  {
                    label: 'Anos / meses / dias',
                    value: `${difference.calendar.years}a ${difference.calendar.months}m ${difference.calendar.days}d`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center"
                  >
                    <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {item.value}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dias úteis contam só de segunda a sexta, sem descontar feriado.
                {difference.inverted && ' A data final é anterior à inicial, então o intervalo foi invertido.'}
              </p>

              <button
                onClick={() =>
                  copyResult(
                    `${difference.totalDays} dias corridos, ${difference.businessDays} dias úteis`
                  )
                }
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Copiar resultado
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'somar' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Data base</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Operação</label>
              <select
                value={offsetDirection}
                onChange={(event) => setOffsetDirection(event.target.value as 'somar' | 'subtrair')}
                className={inputClass}
              >
                <option value="somar">Somar dias</option>
                <option value="subtrair">Subtrair dias</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantidade de dias</label>
              <input
                type="number"
                value={offsetDays}
                onChange={(event) => setOffsetDays(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {shifted && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Data resultante</p>
              <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 capitalize">
                {formatLong(shifted)}
              </p>
              <button
                onClick={() => copyResult(shifted.toLocaleDateString('pt-BR'))}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Copiar {shifted.toLocaleDateString('pt-BR')}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'idade' && (
        <div className="space-y-5">
          <div className="max-w-xs">
            <label className={labelClass}>Data de nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className={inputClass}
            />
          </div>

          {age ? (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {age.years} anos, {age.months} meses e {age.days} dias
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  São {age.totalDays.toLocaleString('pt-BR')} dias vividos.
                  {age.daysToBirthday === 0
                    ? ' O aniversário é hoje.'
                    : ` Faltam ${age.daysToBirthday} dias para o próximo aniversário.`}
                </p>
              </div>
              <button
                onClick={() => copyResult(`${age.years} anos, ${age.months} meses e ${age.days} dias`)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Copiar idade
              </button>
            </div>
          ) : (
            birthDate && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                Informe uma data de nascimento válida e no passado.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
