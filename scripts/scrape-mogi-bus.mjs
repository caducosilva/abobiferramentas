// One-off maintenance script: pulls real bus line data from the Mogi das Cruzes
// city hall transit portal and regenerates src/data/mogiBusData.ts.
// Run with: node scripts/scrape-mogi-bus.mjs
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://mobilidadeservicos.mogidascruzes.sp.gov.br';
const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'mogiBusData.ts');
const DELAY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractInfoValue(html, label) {
  const re = new RegExp(
    `<div class="k-info-label">${label}<\\/div>\\s*<div class="k-info-value">([^<]*)<\\/div>`
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1]) : '';
}

const DAY_KEY_BY_LABEL = {
  'Dia útil': 'weekdays',
  Sábado: 'saturdays',
  'Domingo/Feriado': 'sundays',
};

function extractSchedule(html) {
  const schedule = {
    weekdays: { ida: [], volta: [] },
    saturdays: { ida: [], volta: [] },
    sundays: { ida: [], volta: [] },
  };

  const accordionRe = /<details class="k-accordion"[^>]*>([\s\S]*?)<\/details>/g;
  let accMatch;
  while ((accMatch = accordionRe.exec(html))) {
    const block = accMatch[1];
    const labelMatch = block.match(/<summary>\s*<span>([^<]+)<\/span>/);
    const dayLabel = labelMatch ? decodeEntities(labelMatch[1]) : null;
    const dayKey = dayLabel && DAY_KEY_BY_LABEL[dayLabel];
    if (!dayKey) continue;

    const blockRe = /<div class="k-block">([\s\S]*?)<\/div>\s*<\/div>/g;
    let blockMatch;
    while ((blockMatch = blockRe.exec(block))) {
      const sub = blockMatch[1];
      const sentidoMatch = sub.match(/Sentido:\s*([^<]+)<\/span>/);
      const sentido = sentidoMatch ? decodeEntities(sentidoMatch[1]) : '';
      const times = [...sub.matchAll(/<span class="k-time">\s*([0-9:]+)/g)].map((m) => m[1]);
      if (/ida/i.test(sentido)) schedule[dayKey].ida.push(...times);
      else if (/volta/i.test(sentido)) schedule[dayKey].volta.push(...times);
    }
  }
  return schedule;
}

async function fetchLineList() {
  const res = await fetch(`${BASE}/buscar-linha?query=`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`buscar-linha failed: ${res.status}`);
  const data = await res.json();
  return data.linhas.map((l) => ({ code: l.linha, name: decodeEntities(l.nome || '') }));
}

async function fetchLineDetail(code) {
  const res = await fetch(`${BASE}/site/transportes/linha/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error(`linha/${code} failed: ${res.status}`);
  const html = await res.text();

  const pontoA = extractInfoValue(html, 'Ponto A');
  const pontoB = extractInfoValue(html, 'Ponto B');
  const sentido = extractInfoValue(html, 'Sentido');
  const diasAtendidos = extractInfoValue(html, 'Dias atendidos');
  const empresa = extractInfoValue(html, 'Empresa');
  const schedule = extractSchedule(html);

  return { pontoA, pontoB, sentido, diasAtendidos, empresa, schedule };
}

function tsStringArray(arr) {
  return `[${arr.map((t) => JSON.stringify(t)).join(', ')}]`;
}

function tsEscape(str) {
  return JSON.stringify(str ?? '');
}

async function main() {
  console.log('Fetching line list...');
  const lines = await fetchLineList();
  console.log(`Found ${lines.length} lines.`);

  const results = [];
  const failures = [];

  for (let i = 0; i < lines.length; i++) {
    const { code, name } = lines[i];
    process.stdout.write(`[${i + 1}/${lines.length}] ${code}... `);
    try {
      const detail = await fetchLineDetail(code);
      results.push({ code, name, ...detail });
      console.log('ok');
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failures.push(code);
    }
    await sleep(DELAY_MS);
  }

  results.sort((a, b) => a.code.localeCompare(b.code));

  const entries = results
    .map((r) => {
      return `  {
    code: ${tsEscape(r.code)},
    name: ${tsEscape(r.name)},
    pontoA: ${tsEscape(r.pontoA)},
    pontoB: ${tsEscape(r.pontoB)},
    sentido: ${tsEscape(r.sentido)},
    diasAtendidos: ${tsEscape(r.diasAtendidos)},
    empresa: ${tsEscape(r.empresa)},
    weekdays: { ida: ${tsStringArray(r.schedule.weekdays.ida)}, volta: ${tsStringArray(r.schedule.weekdays.volta)} },
    saturdays: { ida: ${tsStringArray(r.schedule.saturdays.ida)}, volta: ${tsStringArray(r.schedule.saturdays.volta)} },
    sundays: { ida: ${tsStringArray(r.schedule.sundays.ida)}, volta: ${tsStringArray(r.schedule.sundays.volta)} },
  }`;
    })
    .join(',\n');

  const header = `// Gerado automaticamente por scripts/scrape-mogi-bus.mjs a partir do portal oficial
// https://mobilidadeservicos.mogidascruzes.sp.gov.br/site/transportes/linhas
// Cobre as linhas municipais SIM Mogi publicadas no portal. Linhas intermunicipais
// (EMTU) não são listadas nesse portal e não estão incluídas aqui.
import { MogiBusLine } from '../types';

export const MOGI_BUS_LINES: MogiBusLine[] = [
${entries}
];
`;

  await writeFile(OUT_FILE, header, 'utf8');
  console.log(`\nWrote ${results.length} lines to ${OUT_FILE}`);
  if (failures.length) {
    console.log(`Failed codes (${failures.length}): ${failures.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
