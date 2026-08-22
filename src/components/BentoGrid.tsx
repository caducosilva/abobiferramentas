import { MouseEvent } from 'react';
import { Tool, ToolCategory } from '../types';
import { TOOLS } from '../data/toolsData';
import {
  IdCard,
  CheckCircle2,
  Building2,
  KeyRound,
  ImageIcon,
  FileText,
  QrCode,
  FileCode2,
  Fingerprint,
  MessageSquare,
  Calculator,
  ArrowLeftRight,
  Binary,
  Star,
  ArrowRight,
  Search,
  Sparkles,
  Bus,
  Lock,
  ImageOff,
  CalendarDays,
  RefreshCw,
  MapPin,
  GitCompare,
  Database,
  FileSpreadsheet,
  Regex,
  Key,
  Palette,
  Users,
  Globe,
  FileCode,
  Scale,
} from 'lucide-react';

interface BentoGridProps {
  activeCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTool: (toolId: string) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string, e: MouseEvent) => void;
  showingFavoritesOnly: boolean;
}

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'populares', label: 'Populares' },
  { id: 'desenvolvimento', label: 'Desenvolvimento & Dev' },
  { id: 'transportes', label: 'Ônibus & Horários' },
  { id: 'geradores', label: 'Geradores' },
  { id: 'validadores', label: 'Validadores' },
  { id: 'financas', label: 'Pix & Finanças' },
  { id: 'texto', label: 'Texto & Diff' },
  { id: 'imagem', label: 'Imagem' },
  { id: 'matematica', label: 'Matemática' },
  { id: 'privacidade', label: 'Privacidade & Legal' },
];

export function BentoGrid({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenTool,
  favorites,
  onToggleFavorite,
  showingFavoritesOnly,
}: BentoGridProps) {
  const renderIcon = (id: string) => {
    switch (id) {
      case 'onibus-mogi':
      case 'onibus-sp':
      case 'onibus-fortaleza':
      case 'onibus-ceara':
        return <Bus className="w-6 h-6" />;
      case 'gerador-cpf':
        return <IdCard className="w-6 h-6" />;
      case 'validador-cpf':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'gerador-cnpj':
        return <Building2 className="w-6 h-6" />;
      case 'gerador-senhas':
        return <KeyRound className="w-6 h-6" />;
      case 'compressor-imagem':
        return <ImageIcon className="w-6 h-6" />;
      case 'contador-texto':
      case 'gerador-curriculo':
        return <FileText className="w-6 h-6" />;
      case 'gerador-qrcode':
      case 'gerador-pix':
        return <QrCode className="w-6 h-6" />;
      case 'formatador-json':
        return <FileCode2 className="w-6 h-6" />;
      case 'formatador-sql':
        return <Database className="w-6 h-6" />;
      case 'conversor-json-yaml-csv':
        return <FileSpreadsheet className="w-6 h-6" />;
      case 'testador-regex':
        return <Regex className="w-6 h-6" />;
      case 'decodificador-jwt':
        return <Key className="w-6 h-6" />;
      case 'conversor-cores':
        return <Palette className="w-6 h-6" />;
      case 'gerador-mock-data':
        return <Users className="w-6 h-6" />;
      case 'gerador-meta-tags':
        return <Globe className="w-6 h-6" />;
      case 'formatador-xml':
        return <FileCode className="w-6 h-6" />;
      case 'gerador-uuid':
        return <Fingerprint className="w-6 h-6" />;
      case 'link-whatsapp':
      case 'contato':
        return <MessageSquare className="w-6 h-6" />;
      case 'calculadoras':
        return <Calculator className="w-6 h-6" />;
      case 'conversor-unidades':
        return <ArrowLeftRight className="w-6 h-6" />;
      case 'base64-hash':
        return <Binary className="w-6 h-6" />;
      case 'cofre-notas-local':
        return <Lock className="w-6 h-6" />;
      case 'limpador-exif':
        return <ImageOff className="w-6 h-6" />;
      case 'calculadora-datas':
        return <CalendarDays className="w-6 h-6" />;
      case 'conversor-imagem':
        return <RefreshCw className="w-6 h-6" />;
      case 'consulta-cep':
        return <MapPin className="w-6 h-6" />;
      case 'comparador-texto':
        return <GitCompare className="w-6 h-6" />;
      case 'conformidade-legal':
        return <Scale className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const filteredTools = TOOLS.filter((tool) => {
    if (showingFavoritesOnly) {
      if (!favorites.includes(tool.id)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (activeCategory === 'todos') return true;
    if (activeCategory === 'populares') return tool.isPopular;
    return tool.category === activeCategory || tool.secondaryCategory === activeCategory;
  });

  return (
    <section className="space-y-8 pb-12">
      {/* HERO HEADER SECTION WITH SEARCH */}
      <header className="pt-8 sm:pt-12 pb-6 text-center max-w-3xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-[36px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          O que você deseja <span className="text-indigo-600 dark:text-indigo-400">resolver</span> hoje?
        </h1>

        {/* Hero Search Box */}
        <div className="relative max-w-[600px] mx-auto">
          <input
            type="text"
            placeholder="Pesquise ex: SQL, Regex, JWT, JSON, Diff, Cores, Ônibus SP, CPF..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[16px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-none text-base outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 text-slate-800 dark:text-slate-200 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 sm:px-10 pb-6 max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id && !showingFavoritesOnly;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* BENTO GRID OF TOOLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
              Nenhuma ferramenta encontrada
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {showingFavoritesOnly
                ? 'Você ainda não adicionou nenhuma ferramenta aos favoritos. Clique na estrela dos cards!'
                : 'Tente utilizar outros termos na busca.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTools.map((tool) => {
              const isFav = favorites.includes(tool.id);
              const isHeroCard = tool.id === 'formatador-json';

              if (isHeroCard && activeCategory === 'todos' && !showingFavoritesOnly && !searchQuery) {
                /* HERO FEATURED CARD */
                return (
                  <div
                    key={tool.id}
                    onClick={() => onOpenTool(tool.id)}
                    className="group relative bg-[#1e1b4b] rounded-[24px] p-8 text-white flex flex-col justify-between shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer sm:col-span-2"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300">
                          {renderIcon(tool.id)}
                        </div>
                        <button
                          onClick={(e) => onToggleFavorite(tool.id, e)}
                          className="p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                            }`}
                          />
                        </button>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-200 transition">
                        {tool.name}
                      </h3>
                      <p className="text-[#a5b4fc] text-sm leading-relaxed max-w-xs">{tool.description}</p>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#818cf8] group-hover:text-white transition">
                      <span>USAR AGORA</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                );
              }

              /* STANDARD GEOMETRIC CARD */
              const isGreenAccent = tool.id === 'validador-cpf';

              return (
                <div
                  key={tool.id}
                  onClick={() => onOpenTool(tool.id)}
                  className={`group relative bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                    isGreenAccent ? 'border-t-4 border-t-emerald-500' : ''
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${tool.color.bgLight} ${tool.color.textLight} dark:bg-slate-800`}>
                        {renderIcon(tool.id)}
                      </div>

                      <button
                        onClick={(e) => onToggleFavorite(tool.id, e)}
                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {tool.name}
                    </h3>
                    <p className="text-[#64748b] dark:text-slate-400 text-xs leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>ABRIR</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
