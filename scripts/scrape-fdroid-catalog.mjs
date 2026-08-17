// Gera src/data/fdroidCatalog.json: o catálogo grande de apps Android open source.
//
// Fontes (as duas são repositórios F-Droid públicos, de software livre, com redistribuição
// permitida e URL de APK estável):
//   - F-Droid oficial      https://f-droid.org/repo         (~54 MB de índice, ~4 mil apps)
//   - IzzyOnDroid          https://apt.izzysoft.de/fdroid/repo (~13 MB, apps que não estão no oficial)
//
// Por que é script de build e não chamada em runtime: os índices somam quase 70 MB. Baixar isso
// numa função serverless a cada visita seria absurdo, então o resultado enxuto é commitado, do
// mesmo jeito que src/data/mogiBusData.ts. Rode `npm run scrape:apps` quando quiser atualizar.
//
// Ordenação: repositório F-Droid não publica número de downloads, então não há "mais baixado"
// honesto para extrair daqui. O melhor sinal de notoriedade disponível no índice é a quantidade de
// idiomas para os quais o app foi traduzido: app conhecido acumula tradução da comunidade, app
// obscuro fica só no idioma do autor. Na prática funciona bem (NewPipe 98 idiomas, Organic Maps 95,
// F-Droid 71, VLC 53, contra mediana de 2 no repositório inteiro). Empate cai para atualização
// mais recente, para privilegiar projeto vivo. A interface explica esse critério, sem fingir que
// é ranking de download.

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Os shards ficam em public/ e não em src/: assim são arquivos estáticos servidos pela CDN e
// buscados sob demanda, em vez de entrarem no bundle do Vite e pesarem no carregamento da página.
const shardsDir = path.resolve(__dirname, '../public/apps');
const iconsOutputPath = path.resolve(__dirname, '../src/data/curatedIcons.json');

// Apps por arquivo. Cada shard fica na casa dos 200 KB, tamanho que a CDN entrega rápido e que
// permite ir renderizando a lista conforme os pedaços chegam.
const SHARD_SIZE = 800;

// Ícones dos apps da seção "Destaques". Existem à parte porque a URL do ícone no F-Droid carrega
// um hash do arquivo, ou seja, não dá para montar por convenção: tem que sair do índice. E porque
// alguns desses apps não caem na fatia dos mil do catálogo, que além disso é carregado só sob
// demanda, enquanto os destaques precisam do ícone na hora que a página abre.
// Manter em sincronia com os campos `fdroidId` de src/data/androidApps.ts.
const CURATED_PACKAGES = [
  'org.fdroid.fdroid',
  'com.machiav3lli.fdroid',
  'com.aurora.store',
  'org.schabi.newpipe',
  'com.github.libretube',
  'org.videolan.vlc',
  'de.danoeh.antennapod',
  'com.beemdevelopment.aegis',
  'com.kunzisoft.keepass.libre',
  'com.termux',
  'app.organicmaps',
  'org.fossify.gallery',
  'org.fossify.filemanager',
  'org.fossify.calendar',
  'me.zhanghai.android.files',
  'net.gsantner.markor',
  'dev.patrickgold.florisboard',
  'org.mozilla.fennec_fdroid',
];

const REPOS = [
  { id: 'fdroid', label: 'F-Droid', base: 'https://f-droid.org/repo' },
  { id: 'izzy', label: 'IzzyOnDroid', base: 'https://apt.izzysoft.de/fdroid/repo' },
  { id: 'guardian', label: 'Guardian Project', base: 'https://guardianproject.info/fdroid/repo' },
  { id: 'microg', label: 'microG', base: 'https://microg.org/fdroid/repo' },
];

// Sem corte: entra tudo o que os repositórios publicam. O peso é resolvido fatiando a saída em
// shards, não jogando apps fora.
const MAX_APPS = Infinity;
// Resumo curto de propósito: o JSON inteiro vai para o navegador de quem abre o catálogo, então
// cada caractere a mais são ~1 KB no arquivo final. 140 dá uma frase útil sem virar peso morto.
const SUMMARY_MAX_LENGTH = 140;

// Anti-features que valem aviso no card. O F-Droid marca muito mais que isso, mas a maioria é
// detalhe de licença que não muda a decisão de quem está só procurando um app.
const ANTI_FEATURE_LABELS = {
  Ads: 'exibe anúncios',
  Tracking: 'tem rastreamento',
  NonFreeNet: 'depende de serviço fechado',
  NonFreeDep: 'depende de biblioteca fechada',
  NonFreeAdd: 'sugere download não livre',
  NonFreeAssets: 'inclui conteúdo não livre',
  UpstreamNonFree: 'código-fonte não é totalmente livre',
  KnownVuln: 'tem vulnerabilidade conhecida',
  NoSourceSince: 'código-fonte não é mais publicado',
  ApplicationDebuggable: 'compilado em modo debug',
};

// Categorias do F-Droid, em inglês, agrupadas nas seções que a página mostra.
const CATEGORY_MAP = {
  'Internet': 'internet',
  'Connectivity': 'internet',
  'Multimedia': 'midia',
  'Graphics': 'midia',
  'Games': 'jogos',
  'Security': 'privacidade',
  'Money': 'financas',
  'Navigation': 'navegacao',
  'Reading': 'leitura',
  'Writing': 'produtividade',
  'Time': 'produtividade',
  'Phone & SMS': 'comunicacao',
  'Science & Education': 'educacao',
  'Sports & Health': 'saude',
  'System': 'sistema',
  'Development': 'desenvolvimento',
  'Theming': 'personalizacao',
};

// O catálogo é gerado automaticamente a partir de repositório de terceiro, e o IzzyOnDroid publica
// alguns clientes de conteúdo adulto (visualizadores de booru e afins). Como o site exibe AdSense,
// linkar isso é risco direto de violação de política, além de não combinar com o resto do site.
// O F-Droid não tem marcação de NSFW, então a filtragem é por termo no nome, pacote e resumo.
const BLOCKED_TERMS = [
  'nsfw',
  'porn',
  'hentai',
  'doujin',
  'booru',
  'rule34',
  'loli',
  'erotic',
  'erótic',
  'sex toy',
  'adult content',
  'xxx',
  'camgirl',
  'onlyfans',
];

function isBlocked(app) {
  const haystack = `${app.name} ${app.pkg} ${app.summary}`.toLowerCase();
  return BLOCKED_TERMS.some((term) => haystack.includes(term));
}

/** Textos do índice vêm por idioma. Prefere português, cai para inglês, depois qualquer um. */
function pickLocalized(field) {
  if (!field || typeof field !== 'object') return '';
  return (
    field['pt-BR'] ||
    field['pt'] ||
    field['en-US'] ||
    field['en'] ||
    Object.values(field)[0] ||
    ''
  );
}

function cleanSummary(text) {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  if (flat.length <= SUMMARY_MAX_LENGTH) return flat;
  // Corta na última palavra inteira em vez de picar no meio de uma palavra.
  const cut = flat.slice(0, SUMMARY_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > 80 ? cut.slice(0, lastSpace) : cut}...`;
}

/** Escolhe a build de maior versionCode, que é a que o cliente do F-Droid instalaria. */
function pickNewestVersion(versions) {
  const entries = Object.values(versions || {});
  if (entries.length === 0) return null;

  return entries.reduce((best, current) => {
    const bestCode = best?.manifest?.versionCode ?? -1;
    const currentCode = current?.manifest?.versionCode ?? -1;
    return currentCode > bestCode ? current : best;
  }, null);
}

function collectAntiFeatures(version, metadata) {
  const keys = new Set([
    ...Object.keys(version?.antiFeatures || {}),
    ...Object.keys(metadata?.antiFeatures || {}),
  ]);

  return [...keys].map((key) => ANTI_FEATURE_LABELS[key] || key).filter(Boolean);
}

/**
 * Nota de notoriedade: soma dos idiomas em que o resumo e a descrição foram traduzidos, com um
 * bônus para o repositório oficial, que tem critério de entrada mais rígido que o IzzyOnDroid.
 */
function notabilityScore(metadata, repo) {
  const summaryLocales = Object.keys(metadata?.summary || {}).length;
  const descriptionLocales = Object.keys(metadata?.description || {}).length;
  return summaryLocales + descriptionLocales + (repo.id === 'fdroid' ? 5 : 0);
}

function mapCategories(categories) {
  const mapped = new Set();
  for (const category of categories || []) {
    const group = CATEGORY_MAP[category];
    if (group) mapped.add(group);
  }
  return [...mapped];
}

async function fetchIndex(repo) {
  process.stdout.write(`[fdroid] baixando índice de ${repo.label}... `);
  const response = await fetch(`${repo.base}/index-v2.json`, {
    headers: { 'User-Agent': 'abobiferramentas-catalog-builder' },
  });
  if (!response.ok) throw new Error(`${repo.label} respondeu HTTP ${response.status}`);

  const json = await response.json();
  const count = Object.keys(json.packages || {}).length;
  console.log(`${count} pacotes`);
  return json;
}

function extractApps(index, repo) {
  const apps = [];
  let blocked = 0;

  for (const [packageName, entry] of Object.entries(index.packages || {})) {
    const metadata = entry.metadata || {};
    const version = pickNewestVersion(entry.versions);

    // Sem arquivo publicado não há o que baixar, então o app não entra no catálogo.
    if (!version?.file?.name) continue;

    const name = pickLocalized(metadata.name) || packageName;
    const summary = pickLocalized(metadata.summary) || pickLocalized(metadata.description);
    const iconName = pickLocalized(metadata.icon)?.name;

    // Campos deriváveis (URL da página, do APK e do ícone) ficam de fora e são montados no
    // componente a partir de `repo` + `pkg` + `file`/`icon`, para não repetir o mesmo prefixo
    // de domínio mil vezes dentro do JSON.
    const candidate = {
      pkg: packageName,
      name: String(name).replace(/\s+/g, ' ').trim(),
      summary: summary ? cleanSummary(summary) : '',
      license: metadata.license || '',
      cats: mapCategories(metadata.categories),
      version: version.manifest?.versionName || '',
      size: version.file.size || 0,
      updated: metadata.lastUpdated || version.added || 0,
      score: notabilityScore(metadata, repo),
      file: version.file.name,
      icon: iconName || '',
      src: metadata.sourceCode || '',
      repo: repo.id,
      anti: collectAntiFeatures(version, metadata),
    };

    if (isBlocked(candidate)) {
      blocked++;
      continue;
    }
    apps.push(candidate);
  }

  if (blocked > 0) {
    console.log(`[fdroid] ${repo.label}: ${blocked} apps de conteúdo adulto descartados`);
  }
  return apps;
}

/** Ícones dos destaques, resolvidos no índice inteiro e não só na fatia dos mil. */
function extractCuratedIcons(index, repo, into) {
  for (const packageName of CURATED_PACKAGES) {
    // O repositório oficial tem prioridade: se já achou lá, não sobrescreve com o do IzzyOnDroid.
    if (into[packageName]) continue;

    const iconName = pickLocalized(index.packages?.[packageName]?.metadata?.icon)?.name;
    if (iconName) into[packageName] = `${repo.base}${iconName}`;
  }
}

async function main() {
  const collected = [];
  const curatedIcons = {};

  for (const repo of REPOS) {
    try {
      const index = await fetchIndex(repo);
      const apps = extractApps(index, repo);
      console.log(`[fdroid] ${repo.label}: ${apps.length} apps com APK publicado`);
      collected.push(...apps);
      extractCuratedIcons(index, repo, curatedIcons);
    } catch (error) {
      // Um repositório fora do ar não deve derrubar a geração do catálogo inteiro.
      console.error(`[fdroid] falha em ${repo.label}: ${error.message}`);
    }
  }

  if (collected.length === 0) {
    throw new Error('nenhum app coletado, abortando para não sobrescrever o catálogo com vazio');
  }

  // O mesmo app pode existir nos dois repositórios. O oficial ganha, porque é o que a maioria
  // das pessoas já tem instalado e o que permite atualizar pelo cliente do F-Droid.
  const byPackage = new Map();
  for (const app of collected) {
    const existing = byPackage.get(app.pkg);
    if (!existing || (existing.repo !== 'fdroid' && app.repo === 'fdroid')) {
      byPackage.set(app.pkg, app);
    }
  }

  const ranked = [...byPackage.values()]
    .sort((a, b) => b.score - a.score || b.updated - a.updated)
    .slice(0, MAX_APPS)
    // `score` só serve para escolher e ordenar os mil: não precisa viajar até o navegador.
    .map(({ score, ...app }) => app);

  // Limpa shards de uma geração anterior, senão uma execução que produza menos arquivos deixaria
  // sobras que o cliente ainda tentaria buscar.
  await mkdir(shardsDir, { recursive: true });
  for (const file of await readdir(shardsDir)) {
    if (/^(shard-\d+|meta)\.json$/.test(file)) await rm(path.join(shardsDir, file));
  }

  const shardCount = Math.ceil(ranked.length / SHARD_SIZE);
  let totalBytes = 0;

  for (let i = 0; i < shardCount; i++) {
    const slice = ranked.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE);
    const body = `${JSON.stringify(slice)}\n`;
    totalBytes += Buffer.byteLength(body);
    await writeFile(path.join(shardsDir, `shard-${i}.json`), body, 'utf-8');
  }

  const meta = {
    generatedAt: new Date().toISOString().slice(0, 10),
    total: ranked.length,
    collected: byPackage.size,
    shards: shardCount,
    shardSize: SHARD_SIZE,
    repos: REPOS.map((repo) => ({ id: repo.id, label: repo.label, base: repo.base })),
  };

  await writeFile(path.join(shardsDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf-8');
  await writeFile(iconsOutputPath, `${JSON.stringify(curatedIcons, null, 2)}\n`, 'utf-8');

  const missingIcons = CURATED_PACKAGES.filter((pkg) => !curatedIcons[pkg]);
  console.log(
    `[fdroid] ícones dos destaques: ${Object.keys(curatedIcons).length}/${CURATED_PACKAGES.length}` +
      (missingIcons.length ? ` (sem ícone: ${missingIcons.join(', ')})` : '')
  );

  console.log(
    `[fdroid] ${ranked.length} apps em ${shardCount} shards em public/apps/ ` +
      `(${Math.round(totalBytes / 1024)} KB no total, ~${Math.round(totalBytes / 1024 / shardCount)} KB por shard)`
  );
}

main().catch((error) => {
  console.error('[fdroid] falhou:', error);
  process.exit(1);
});
