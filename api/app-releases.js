// Monta o catálogo "Apps Android Open Source" com link de download DIRETO do .apk.
//
// Duas fontes, ambas públicas, oficiais e com redistribuição permitida:
//   1. GitHub Releases  -> asset .apk publicado pelo próprio desenvolvedor do app.
//   2. F-Droid          -> API pública (/api/v1/packages/<id>) + URL previsível do repositório
//                          (https://f-droid.org/repo/<pacote>_<versionCode>.apk).
//
// Por que passa por aqui e não direto do navegador: são ~30 chamadas externas para montar a
// página. Feitas pelo cliente, estourariam o limite da API do GitHub (60 req/h por IP) em poucas
// visitas. Aqui a resposta inteira é cacheada na borda da Vercel por 1h, então as origens recebem
// um punhado de chamadas por hora independente do tráfego.
//
// Nenhum APK é hospedado ou proxiado por nós: a resposta carrega só metadados e a URL de origem.
// As allowlists abaixo precisam espelhar os campos `repo`/`fdroidId` de src/data/androidApps.ts.

// `prefer` desempata quando o projeto publica várias variantes do APK no mesmo release
// (por arquitetura, por assinatura, beta x estável). Sem isso o catálogo entregaria, por
// exemplo, a build Huawei do GmsCore ou o preview do FlorisBoard em vez da versão comum.
const ALLOWED_REPOS = [
  { repo: 'ReVanced/revanced-manager' },
  { repo: 'ReVanced/GmsCore', prefer: /gms-\d+-signed\.apk$/i },
  { repo: 'ReVanced/revanced-cli' },
  { repo: 'TeamNewPipe/NewPipe' },
  { repo: 'libre-tube/LibreTube' },
  { repo: 'ImranR98/Obtainium', prefer: /^app-release\.apk$/i },
  { repo: 'beemdevelopment/Aegis' },
  { repo: 'Kunzisoft/KeePassDX', prefer: /libre\.apk$/i },
  { repo: 'bitwarden/android', prefer: /^com\.x8bit\.bitwarden\.apk$/i },
  { repo: 'signalapp/Signal-Android' },
  { repo: 'termux/termux-app', prefer: /arm64-v8a\.apk$/i },
  { repo: 'organicmaps/organicmaps' },
  { repo: 'AntennaPod/AntennaPod' },
  { repo: 'uazo/cromite', prefer: /^arm64_ChromePublic\.apk$/i },
  { repo: 'FossifyOrg/Gallery' },
  { repo: 'FossifyOrg/File-Manager' },
  { repo: 'RikkaApps/Shizuku' },
  { repo: 'florisboard/florisboard', prefer: /stable\.apk$/i },
];

const ALLOWED_FDROID_PACKAGES = [
  'org.fdroid.fdroid',
  'org.schabi.newpipe',
  'com.github.libretube',
  'com.beemdevelopment.aegis',
  'com.kunzisoft.keepass.libre',
  'org.videolan.vlc',
  'app.organicmaps',
  'de.danoeh.antennapod',
  'com.termux',
  'org.fossify.gallery',
  'org.fossify.filemanager',
  'org.fossify.calendar',
  'dev.patrickgold.florisboard',
  'org.mozilla.fennec_fdroid',
  'net.gsantner.markor',
  'com.machiav3lli.fdroid',
  'me.zhanghai.android.files',
  'com.aurora.store',
];

const GITHUB_API = 'https://api.github.com';
const FDROID_API = 'https://f-droid.org/api/v1/packages';
const FDROID_REPO = 'https://f-droid.org/repo';
const USER_AGENT = 'abobiferramentas-catalogo-apps';
const FETCH_TIMEOUT_MS = 8000;

async function fetchJson(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': USER_AGENT,
  };
  // Opcional: defina GITHUB_TOKEN nas env vars da Vercel para subir o limite de 60 para 5000 req/h.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// Projetos como ReVanced Manager e GmsCore publicam pré-releases com frequência e nem sempre têm
// um "latest" marcado. Se /releases/latest não responder, cai para o release mais recente da lista.
async function fetchLatestRelease(repo) {
  const headers = githubHeaders();

  const latest = await fetchJson(`${GITHUB_API}/repos/${repo}/releases/latest`, headers);
  if (latest) return latest;

  const list = await fetchJson(`${GITHUB_API}/repos/${repo}/releases?per_page=1`, headers);
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[0];
}

// Ordem de escolha: a preferência declarada para o projeto, depois a build universal, depois
// arm64 (arquitetura da esmagadora maioria dos celulares em uso) e por fim o primeiro APK.
function pickApkAsset(release, prefer) {
  const assets = (Array.isArray(release.assets) ? release.assets : []).filter(
    (asset) => typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk')
  );
  if (assets.length === 0) return null;

  const preferred = prefer ? assets.find((asset) => prefer.test(asset.name)) : null;
  const universal = assets.find((asset) => /universal/i.test(asset.name));
  const arm64 = assets.find((asset) => /arm64|aarch64/i.test(asset.name));
  return preferred || universal || arm64 || assets[0];
}

async function describeGithubRepo({ repo, prefer }) {
  const release = await fetchLatestRelease(repo);
  if (!release) return null;

  const apk = pickApkAsset(release, prefer);
  return {
    source: 'github',
    version: release.tag_name || release.name || null,
    publishedAt: release.published_at || null,
    pageUrl: release.html_url || `https://github.com/${repo}/releases`,
    apkUrl: apk ? apk.browser_download_url : null,
    apkName: apk ? apk.name : null,
    apkSize: apk ? apk.size : null,
    prerelease: Boolean(release.prerelease),
  };
}

async function describeFdroidPackage(packageName) {
  const data = await fetchJson(`${FDROID_API}/${packageName}`, { 'User-Agent': USER_AGENT });
  if (!data || !Array.isArray(data.packages) || data.packages.length === 0) return null;

  // A build "sugerida" é a que o cliente do F-Droid instalaria; se ela não estiver na lista
  // (acontece quando é específica de outra arquitetura), usa a primeira, que é a mais recente.
  const suggested =
    data.packages.find((pkg) => pkg.versionCode === data.suggestedVersionCode) || data.packages[0];

  return {
    source: 'fdroid',
    version: suggested.versionName || null,
    versionCode: suggested.versionCode || null,
    publishedAt: null,
    pageUrl: `https://f-droid.org/packages/${packageName}/`,
    apkUrl: `${FDROID_REPO}/${packageName}_${suggested.versionCode}.apk`,
    apkName: `${packageName}_${suggested.versionCode}.apk`,
    apkSize: null,
    prerelease: false,
  };
}

async function settle(key, promise) {
  try {
    const value = await promise;
    return value ? [key, value] : null;
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const results = await Promise.all([
    ...ALLOWED_REPOS.map((entry) => settle(entry.repo, describeGithubRepo(entry))),
    ...ALLOWED_FDROID_PACKAGES.map((pkg) => settle(pkg, describeFdroidPackage(pkg))),
  ]);

  const releases = {};
  for (const entry of results) {
    if (entry) releases[entry[0]] = entry[1];
  }

  // Cache na borda: 1h fresco, mais 24h servindo o valor antigo enquanto revalida em background.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json({
    releases,
    total: Object.keys(releases).length,
    checked: ALLOWED_REPOS.length + ALLOWED_FDROID_PACKAGES.length,
  });
};
