import { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  Github,
  Library,
  Loader2,
  Search,
  TriangleAlert,
} from 'lucide-react';

/** Entrada enxuta gerada por scripts/scrape-fdroid-catalog.mjs */
interface CatalogApp {
  pkg: string;
  name: string;
  summary: string;
  license: string;
  cats: string[];
  version: string;
  size: number;
  updated: number;
  file: string;
  icon: string;
  src: string;
  repo: string;
  anti: string[];
}

interface CatalogRepo {
  id: string;
  label: string;
  base: string;
}

interface CatalogMeta {
  generatedAt: string;
  total: number;
  collected: number;
  shards: number;
  shardSize: number;
  repos: CatalogRepo[];
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'internet', label: 'Internet' },
  { id: 'midia', label: 'Mídia' },
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'privacidade', label: 'Segurança' },
  { id: 'produtividade', label: 'Produtividade' },
  { id: 'leitura', label: 'Leitura' },
  { id: 'navegacao', label: 'Navegação' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'desenvolvimento', label: 'Desenvolvimento' },
  { id: 'financas', label: 'Finanças' },
  { id: 'educacao', label: 'Educação' },
  { id: 'saude', label: 'Saúde' },
  { id: 'personalizacao', label: 'Personalização' },
];

const PAGE_SIZE = 30;

function formatSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

interface CatalogProps {
  onCopyToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export function FdroidCatalog({ onCopyToast }: CatalogProps) {
  const [meta, setMeta] = useState<CatalogMeta | null>(null);
  // Guardado por índice, não concatenado: as respostas não voltam na ordem em que foram pedidas, e
  // a posição do shard é justamente o que carrega a ordem de notoriedade da lista.
  const [shardData, setShardData] = useState<(CatalogApp[] | undefined)[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // O catálogo tem mais de 5 mil apps e uns 2 MB de metadados, então vive fatiado em arquivos
  // estáticos em /apps/. Buscamos a lista sob demanda e vamos preenchendo a tela conforme cada
  // pedaço chega, em vez de travar tudo esperando o conjunto inteiro. O shard 0 já traz os apps
  // mais notórios, por isso a lista fica útil desde o primeiro pedaço.
  const loadCatalog = async () => {
    if (meta || loading) return;
    setLoading(true);
    setFailed(false);

    try {
      const metaResponse = await fetch('/apps/meta.json');
      if (!metaResponse.ok) throw new Error(`meta HTTP ${metaResponse.status}`);
      const metaData: CatalogMeta = await metaResponse.json();
      setMeta(metaData);
      setShardData(new Array(metaData.shards).fill(undefined));

      await Promise.all(
        Array.from({ length: metaData.shards }, async (_unused, index) => {
          const response = await fetch(`/apps/shard-${index}.json`);
          if (!response.ok) return;
          const slice: CatalogApp[] = await response.json();

          // Cada shard aparece na tela assim que chega, na sua posição correta.
          setShardData((current) => {
            const next = [...current];
            next[index] = slice;
            return next;
          });
        })
      );
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const repoById = useMemo(() => {
    const map: Record<string, CatalogRepo> = {};
    for (const repo of meta?.repos ?? []) map[repo.id] = repo;
    return map;
  }, [meta]);

  const baseFor = (app: CatalogApp) => repoById[app.repo]?.base ?? '';
  const labelFor = (app: CatalogApp) => repoById[app.repo]?.label ?? app.repo;

  const pageUrlFor = (app: CatalogApp): string => {
    if (app.repo === 'fdroid') return `https://f-droid.org/packages/${app.pkg}/`;
    if (app.repo === 'izzy') return `https://apt.izzysoft.de/fdroid/index/apk/${app.pkg}`;
    // Guardian Project e microG não têm página por app: cai para o código-fonte ou o repositório.
    return app.src || baseFor(app);
  };

  const apps = useMemo(() => shardData.flatMap((slice) => slice ?? []), [shardData]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return apps.filter((app) => {
      if (category !== 'todos' && !app.cats.includes(category)) return false;
      if (!term) return true;
      return (
        app.name.toLowerCase().includes(term) ||
        app.pkg.toLowerCase().includes(term) ||
        app.summary.toLowerCase().includes(term)
      );
    });
  }, [apps, query, category]);

  const visible = filtered.slice(0, visibleCount);
  const resetPaging = () => setVisibleCount(PAGE_SIZE);
  const shardsLoaded = shardData.filter(Boolean).length;
  const stillLoading = Boolean(meta) && shardsLoaded < (meta?.shards ?? 0);

  if (!meta) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Catálogo completo: mais de 5 mil apps open source
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tudo o que os repositórios F-Droid, IzzyOnDroid, Guardian Project e microG publicam,
              com ícone, nome real, versão, tamanho e link direto do APK. São uns 2 MB de dados, por
              isso a lista só carrega quando você pedir.
            </p>
          </div>
        </div>

        <button
          onClick={loadCatalog}
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Carregando catálogo...
            </>
          ) : (
            <>
              <Library className="w-5 h-5" /> Abrir catálogo completo
            </>
          )}
        </button>

        {failed && (
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
            Não deu para carregar o catálogo. Recarregue a página e tente de novo.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <div className="space-y-1">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-indigo-500" />
          Catálogo completo
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {meta.total.toLocaleString('pt-BR')} apps de {meta.repos.length} repositórios (
          {meta.repos.map((repo) => repo.label).join(', ')}). Nenhum deles divulga número de
          downloads, então em vez de inventar um ranking de "mais baixado" a ordem usa o quanto cada
          app foi traduzido pela comunidade, que é o melhor sinal de app conhecido que existe no
          índice, com empate decidido pela atualização mais recente. Snapshot de {meta.generatedAt}.
        </p>
      </div>

      {/* Busca e categorias */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPaging();
            }}
            placeholder={`Buscar entre ${meta.total.toLocaleString('pt-BR')} apps por nome, pacote ou descrição...`}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCategory(item.id);
                resetPaging();
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                category === item.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {stillLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {filtered.length === 0
            ? stillLoading
              ? 'Carregando a lista...'
              : 'Nenhum app encontrado com esse filtro.'
            : `Mostrando ${visible.length} de ${filtered.length} apps` +
              (stillLoading ? ` (${shardsLoaded} de ${meta.shards} partes carregadas)` : '')}
        </p>
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visible.map((app) => (
          <article
            key={`${app.repo}:${app.pkg}`}
            className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex gap-3"
          >
            {app.icon ? (
              <img
                src={`${baseFor(app)}${app.icon}`}
                alt=""
                loading="lazy"
                width={44}
                height={44}
                className="w-11 h-11 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-slate-400">
                {app.name.charAt(0)}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {app.name}
                </h3>
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {labelFor(app)}
                </span>
              </div>

              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                {app.pkg}
              </p>

              {app.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {app.summary}
                </p>
              )}

              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {[app.version, formatSize(app.size), app.license, formatDate(app.updated)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>

              {app.anti.length > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1">
                  <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{app.anti.join(', ')}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`${baseFor(app)}${app.file}`}
                  rel="noopener noreferrer nofollow"
                  onClick={() => onCopyToast(`Baixando ${app.name} do ${labelFor(app)}`, 'info')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition"
                >
                  <Download className="w-3 h-3" /> APK
                </a>
                <a
                  href={pageUrlFor(app)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition"
                >
                  <ExternalLink className="w-3 h-3" /> Detalhes
                </a>
                {app.src && (
                  <a
                    href={app.src}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition"
                  >
                    <Github className="w-3 h-3" /> Código
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <button
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition cursor-pointer text-sm"
        >
          Carregar mais {Math.min(PAGE_SIZE, filtered.length - visibleCount)} apps
        </button>
      )}
    </div>
  );
}
