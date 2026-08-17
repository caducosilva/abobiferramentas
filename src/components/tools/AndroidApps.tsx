import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Github,
  Loader2,
  PackageSearch,
  Search,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import {
  ANDROID_APPS,
  APP_CATEGORIES,
  AndroidApp,
  AndroidAppCategory,
} from '../../data/androidApps';
import { FdroidCatalog } from './FdroidCatalog';

interface ToolProps {
  onCopyToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface ReleaseInfo {
  source: 'github' | 'fdroid';
  version: string | null;
  publishedAt: string | null;
  pageUrl: string;
  apkUrl: string | null;
  apkName: string | null;
  apkSize: number | null;
  prerelease: boolean;
}

type ReleaseMap = Record<string, ReleaseInfo>;

const SOURCE_LABEL: Record<ReleaseInfo['source'], string> = {
  github: 'GitHub Releases',
  fdroid: 'F-Droid',
};

function formatSize(bytes: number | null): string | null {
  if (!bytes) return null;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AndroidApps({ onCopyToast }: ToolProps) {
  const [releases, setReleases] = useState<ReleaseMap>({});
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AndroidAppCategory | 'todos'>('todos');

  useEffect(() => {
    let active = true;

    fetch('/api/app-releases')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setReleases(data.releases ?? {});
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        // Sem as versões a página continua útil: os cards caem para o link da fonte oficial.
        setLoadFailed(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredApps = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ANDROID_APPS.filter((app) => {
      if (category !== 'todos' && app.category !== category) return false;
      if (!term) return true;
      return (
        app.name.toLowerCase().includes(term) ||
        app.developer.toLowerCase().includes(term) ||
        app.description.toLowerCase().includes(term) ||
        app.keywords.some((keyword) => keyword.includes(term))
      );
    });
  }, [query, category]);

  const releasesForApp = (app: AndroidApp): ReleaseInfo[] => {
    const found: ReleaseInfo[] = [];
    if (app.repo && releases[app.repo]) found.push(releases[app.repo]);
    if (app.fdroidId && releases[app.fdroidId]) found.push(releases[app.fdroidId]);
    return found;
  };

  return (
    <div className="space-y-6">
      {/* Como este catálogo funciona */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 dark:text-white">
              APK direto da fonte oficial, sem intermediário
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Cada botão de download aponta para o arquivo publicado pelo próprio desenvolvedor no
              GitHub Releases ou pelo repositório do F-Droid. Nenhum APK fica hospedado aqui e
              nenhum passa por redirecionador: o link é o do servidor de origem, então a assinatura
              do pacote é a mesma que o projeto publicou. Todos os apps da lista são de código
              aberto, com licença que permite essa redistribuição.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
          <TriangleAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            Você não vai achar aqui app pago "desbloqueado" nem mod de aplicativo proprietário.
            Além de ser distribuição ilegal, esses arquivos circulam recompactados por terceiros,
            que é exatamente o vetor mais comum de APK com malware no Android.
          </p>
        </div>
      </div>

      {/* Busca e filtro dos destaques */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-1">
          <h2 className="font-bold text-slate-900 dark:text-white">Destaques</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Seleção comentada, com a versão conferida na hora no GitHub e no F-Droid. O catálogo
            completo, com mil apps, fica logo abaixo desta lista.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar app, categoria ou desenvolvedor..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ id: 'todos' as const, label: 'Todos' }, ...APP_CATEGORIES].map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                category === item.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Consultando a última versão de cada
              projeto...
            </span>
          ) : loadFailed ? (
            'Não deu para consultar as versões agora. Os links abaixo continuam levando à página oficial de download de cada app.'
          ) : (
            `${filteredApps.length} de ${ANDROID_APPS.length} apps. Versões conferidas direto no GitHub e no F-Droid.`
          )}
        </p>
      </div>

      {/* Lista de apps */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
          <PackageSearch className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="font-bold text-slate-700 dark:text-slate-200">Nenhum app encontrado</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tente outro termo ou volte para a categoria "Todos".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const appReleases = releasesForApp(app);

            return (
              <article
                key={app.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                      {app.name}
                    </h3>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {app.license}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {app.developer}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {app.description}
                  </p>
                </div>

                {app.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 leading-relaxed">
                    {app.note}
                  </p>
                )}

                <div className="mt-auto space-y-2">
                  {appReleases.map((release) => {
                    const size = formatSize(release.apkSize);
                    const date = formatDate(release.publishedAt);

                    return (
                      <div
                        key={`${app.id}-${release.source}`}
                        className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            {release.source === 'github' ? (
                              <Github className="w-3.5 h-3.5" />
                            ) : (
                              <PackageSearch className="w-3.5 h-3.5" />
                            )}
                            {SOURCE_LABEL[release.source]}
                            {release.prerelease && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                pré-lançamento
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {[release.version, size, date].filter(Boolean).join(' · ') ||
                              'versão não informada'}
                          </p>
                        </div>

                        {release.apkUrl ? (
                          <a
                            href={release.apkUrl}
                            rel="noopener noreferrer nofollow"
                            onClick={() =>
                              onCopyToast(`Baixando ${app.name} direto do ${SOURCE_LABEL[release.source]}`, 'info')
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                          >
                            <Download className="w-3.5 h-3.5" /> Baixar APK
                          </a>
                        ) : (
                          <a
                            href={release.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Ver release
                          </a>
                        )}
                      </div>
                    );
                  })}

                  {appReleases.length === 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Versão indisponível no momento. Use o site oficial abaixo.
                    </p>
                  )}

                  <a
                    href={app.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Site oficial do projeto
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Catálogo grande, carregado sob demanda */}
      <FdroidCatalog onCopyToast={onCopyToast} />

      {/* Guia do ReVanced */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">
          Como conseguir YouTube ReVanced e YouTube Music ReVanced
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          O projeto ReVanced não distribui o YouTube modificado pronto, e isso não é limitação
          técnica: o APK do YouTube é da Google e republicá-lo alterado seria violação de direito
          autoral. O que o ReVanced entrega é o <strong>patcher</strong>. Quem monta o app é você,
          no seu aparelho, a partir do APK oficial. O passo a passo:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <li>Instale o <strong>ReVanced Manager</strong> e o <strong>GmsCore</strong> da lista acima.</li>
          <li>
            Baixe o APK oficial e sem modificação do YouTube ou do YouTube Music. O APKMirror é a
            fonte mais usada para isso porque republica o pacote original da Google sem alterar:
            {' '}
            <a
              href="https://www.apkmirror.com/apk/google-inc/youtube/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              YouTube
            </a>
            {' · '}
            <a
              href="https://www.apkmirror.com/apk/google-inc/youtube-music/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              YouTube Music
            </a>
            .
          </li>
          <li>
            Confira no ReVanced Manager qual versão do app é suportada pelos patches atuais e baixe
            exatamente essa. Versão diferente costuma travar o processo.
          </li>
          <li>Abra o Manager, selecione o APK baixado, escolha os patches e gere o app.</li>
          <li>Instale o resultado e abra o GmsCore uma vez para autorizar o login na conta Google.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Sites que oferecem "YouTube ReVanced APK" já pronto não têm relação com o projeto. Como o
          pacote foi assinado por um desconhecido, não há como verificar o que entrou junto, e é
          por isso que eles não aparecem nesta página.
        </p>
      </div>
    </div>
  );
}
