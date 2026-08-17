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
  repo: 'fdroid' | 'izzy';
  anti: string[];
}

interface CatalogFile {
  generatedAt: string;
  total: number;
  collected: number;
  apps: CatalogApp[];
}

const REPO_BASE: Record<CatalogApp['repo'], string> = {
  fdroid: 'https://f-droid.org/repo',
  izzy: 'https://apt.izzysoft.de/fdroid/repo',
};

const REPO_LABEL: Record<CatalogApp['repo'], string> = {
  fdroid: 'F-Droid',
  izzy: 'IzzyOnDroid',
};

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

function pageUrlFor(app: CatalogApp): string {
  return app.repo === 'fdroid'
    ? `https://f-droid.org/packages/${app.pkg}/`
    : `https://apt.izzysoft.de/fdroid/index/apk/${app.pkg}`;
}

interface CatalogProps {
  onCopyToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export function FdroidCatalog({ onCopyToast }: CatalogProps) {
  const [catalog, setCatalog] = useState<CatalogFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // O catálogo é um JSON de algumas centenas de KB. Import dinâmico para que só quem realmente
  // abre a lista completa pague por ele, em vez de todo mundo que visita a página.
  const loadCatalog = async () => {
    if (catalog || loading) return;
    setLoading(true);
    setFailed(false);

    try {
      const data = await import('../../data/fdroidCatalog.json');
      setCatalog((data.default ?? data) as unknown as CatalogFile);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const term = query.trim().toLowerCase();

    return catalog.apps.filter((app) => {
      if (category !== 'todos' && !app.cats.includes(category)) return false;
      if (!term) return true;
      return (
        app.name.toLowerCase().includes(term) ||
        app.pkg.toLowerCase().includes(term) ||
        app.summary.toLowerCase().includes(term)
      );
    });
  }, [catalog, query, category]);

  const visible = filtered.slice(0, visibleCount);

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  if (!catalog) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Catálogo completo: 1.000 apps open source
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Além dos destaques acima, tem a lista grande, montada a partir dos índices oficiais do
              F-Droid e do IzzyOnDroid, com link direto do APK para cada app. A lista carrega em uma
              tacada só porque é um arquivo de algumas centenas de KB, por isso fica fora do
              carregamento inicial da página.
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
          {catalog.total.toLocaleString('pt-BR')} apps, escolhidos entre os{' '}
          {catalog.collected.toLocaleString('pt-BR')} publicados no F-Droid e no IzzyOnDroid. Nenhum
          desses repositórios divulga número de downloads, então em vez de inventar um ranking de
          "mais baixado" a ordem usa o quanto cada app foi traduzido pela comunidade, que é o melhor
          sinal de app conhecido que existe no índice, com empate decidido pela atualização mais
          recente. Snapshot de {catalog.generatedAt}.
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
            placeholder="Buscar entre os 1.000 apps por nome, pacote ou descrição..."
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

        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {filtered.length === 0
            ? 'Nenhum app encontrado com esse filtro.'
            : `Mostrando ${visible.length} de ${filtered.length} apps.`}
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
                src={`${REPO_BASE[app.repo]}${app.icon}`}
                alt=""
                loading="lazy"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
            )}

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {app.name}
                </h3>
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {REPO_LABEL[app.repo]}
                </span>
              </div>

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
                  href={`${REPO_BASE[app.repo]}${app.file}`}
                  rel="noopener noreferrer nofollow"
                  onClick={() => onCopyToast(`Baixando ${app.name} do ${REPO_LABEL[app.repo]}`, 'info')}
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
