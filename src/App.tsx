import { useState, useEffect, lazy, Suspense, MouseEvent } from 'react';
import { TOOLS } from './data/toolsData';
import { ToolCategory, ToastMessage } from './types';
import { Navbar } from './components/Navbar';
import { BentoGrid } from './components/BentoGrid';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { LocalScratchpadModal } from './components/LocalScratchpadModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { ToastContainer } from './components/Toast';
import { ArrowLeft, Loader2, Share2, Star } from 'lucide-react';

// Lazy loading das ferramentas existentes
const CpfGeneratorValidator = lazy(() =>
  import('./components/tools/CpfGeneratorValidator').then((m) => ({ default: m.CpfGeneratorValidator }))
);
const CnpjGeneratorValidator = lazy(() =>
  import('./components/tools/CnpjGeneratorValidator').then((m) => ({ default: m.CnpjGeneratorValidator }))
);
const PasswordGenerator = lazy(() =>
  import('./components/tools/PasswordGenerator').then((m) => ({ default: m.PasswordGenerator }))
);
const ImageCompressor = lazy(() =>
  import('./components/tools/ImageCompressor').then((m) => ({ default: m.ImageCompressor }))
);
const TextTools = lazy(() =>
  import('./components/tools/TextTools').then((m) => ({ default: m.TextTools }))
);
const QrCodeGenerator = lazy(() =>
  import('./components/tools/QrCodeGenerator').then((m) => ({ default: m.QrCodeGenerator }))
);
const JsonFormatter = lazy(() =>
  import('./components/tools/JsonFormatter').then((m) => ({ default: m.JsonFormatter }))
);
const UuidGenerator = lazy(() =>
  import('./components/tools/UuidGenerator').then((m) => ({ default: m.UuidGenerator }))
);
const WhatsappLinkGenerator = lazy(() =>
  import('./components/tools/WhatsappLinkGenerator').then((m) => ({ default: m.WhatsappLinkGenerator }))
);
const Calculators = lazy(() =>
  import('./components/tools/Calculators').then((m) => ({ default: m.Calculators }))
);
const UnitConverter = lazy(() =>
  import('./components/tools/UnitConverter').then((m) => ({ default: m.UnitConverter }))
);
const Base64HashTools = lazy(() =>
  import('./components/tools/Base64HashTools').then((m) => ({ default: m.Base64HashTools }))
);
const LocalNotesVault = lazy(() =>
  import('./components/tools/LocalNotesVault').then((m) => ({ default: m.LocalNotesVault }))
);
const ExifCleaner = lazy(() =>
  import('./components/tools/ExifCleaner').then((m) => ({ default: m.ExifCleaner }))
);
const PixQrGenerator = lazy(() =>
  import('./components/tools/PixQrGenerator').then((m) => ({ default: m.PixQrGenerator }))
);
const DateCalculator = lazy(() =>
  import('./components/tools/DateCalculator').then((m) => ({ default: m.DateCalculator }))
);
const ImageConverter = lazy(() =>
  import('./components/tools/ImageConverter').then((m) => ({ default: m.ImageConverter }))
);
const CepLookup = lazy(() =>
  import('./components/tools/CepLookup').then((m) => ({ default: m.CepLookup }))
);
const TextDiff = lazy(() =>
  import('./components/tools/TextDiff').then((m) => ({ default: m.TextDiff }))
);
const ResumeBuilder = lazy(() =>
  import('./components/tools/ResumeBuilder').then((m) => ({ default: m.ResumeBuilder }))
);
const BusSchedule = lazy(() =>
  import('./components/tools/BusSchedule').then((m) => ({ default: m.BusSchedule }))
);

// Lazy loading das novas ferramentas
const SqlFormatter = lazy(() =>
  import('./components/tools/SqlFormatter').then((m) => ({ default: m.SqlFormatter }))
);
const JsonYamlCsvConverter = lazy(() =>
  import('./components/tools/JsonYamlCsvConverter').then((m) => ({ default: m.JsonYamlCsvConverter }))
);
const RegexTester = lazy(() =>
  import('./components/tools/RegexTester').then((m) => ({ default: m.RegexTester }))
);
const ColorConverter = lazy(() =>
  import('./components/tools/ColorConverter').then((m) => ({ default: m.ColorConverter }))
);
const JwtDecoder = lazy(() =>
  import('./components/tools/JwtDecoder').then((m) => ({ default: m.JwtDecoder }))
);
const MockDataGenerator = lazy(() =>
  import('./components/tools/MockDataGenerator').then((m) => ({ default: m.MockDataGenerator }))
);
const MetaTagGenerator = lazy(() =>
  import('./components/tools/MetaTagGenerator').then((m) => ({ default: m.MetaTagGenerator }))
);
const XmlFormatter = lazy(() =>
  import('./components/tools/XmlFormatter').then((m) => ({ default: m.XmlFormatter }))
);

// Lazy loading das páginas institucionais
const AboutPage = lazy(() =>
  import('./components/pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./components/pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const LegalCompliancePage = lazy(() =>
  import('./components/pages/LegalCompliancePage').then((m) => ({ default: m.LegalCompliancePage }))
);

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [showingFavoritesOnly, setShowingFavoritesOnly] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('abobi_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('abobi_theme');
      if (saved === 'dark' || saved === 'light') return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('abobi_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('abobi_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const getToolFromPath = (pathname: string): string | null => {
    const path = pathname.replace(/\/$/, '') || '/';
    if (path === '/') return null;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    const toolBySlug = TOOLS.find((t) => t.slug === cleanPath || t.id === cleanPath);
    if (toolBySlug) return toolBySlug.id;

    const toolByAlias = TOOLS.find((t) => t.aliases && t.aliases.includes(path));
    if (toolByAlias) return toolByAlias.id;

    return null;
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const toolId = getToolFromPath(window.location.pathname);
      setActiveToolId(toolId);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const openTool = (toolId: string | null) => {
    setActiveToolId(toolId);
    setIsSearchOpen(false);
    if (toolId) {
      const tool = TOOLS.find((t) => t.id === toolId);
      if (tool) {
        window.history.pushState({}, '', `/${tool.slug}`);
        document.title = `${tool.name} | abobiferramentas`;
      }
    } else {
      window.history.pushState({}, '', '/');
      document.title = 'abobiferramentas | Ferramentas Dev, Horários de Ônibus & Utilitários';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (toolId: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      localStorage.setItem('abobi_favorites', JSON.stringify(next));
      return next;
    });
  };

  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeTool = TOOLS.find((t) => t.id === activeToolId);

  const renderToolComponent = () => {
    switch (activeToolId) {
      case 'onibus-mogi':
        return <BusSchedule initialCity="mogi" onCopyToast={addToast} />;
      case 'onibus-sp':
        return <BusSchedule initialCity="sp" onCopyToast={addToast} />;
      case 'onibus-fortaleza':
        return <BusSchedule initialCity="fortaleza" onCopyToast={addToast} />;
      case 'onibus-ceara':
        return <BusSchedule initialCity="ceara" onCopyToast={addToast} />;
      case 'formatador-json':
        return <JsonFormatter onCopyToast={addToast} />;
      case 'formatador-sql':
        return <SqlFormatter onCopyToast={addToast} />;
      case 'conversor-json-yaml-csv':
        return <JsonYamlCsvConverter onCopyToast={addToast} />;
      case 'testador-regex':
        return <RegexTester onCopyToast={addToast} />;
      case 'decodificador-jwt':
        return <JwtDecoder onCopyToast={addToast} />;
      case 'conversor-cores':
        return <ColorConverter onCopyToast={addToast} />;
      case 'gerador-mock-data':
        return <MockDataGenerator onCopyToast={addToast} />;
      case 'gerador-meta-tags':
        return <MetaTagGenerator onCopyToast={addToast} />;
      case 'formatador-xml':
        return <XmlFormatter onCopyToast={addToast} />;
      case 'comparador-texto':
        return <TextDiff onCopyToast={addToast} />;
      case 'gerador-uuid':
        return <UuidGenerator onCopyToast={addToast} />;
      case 'base64-hash':
        return <Base64HashTools onCopyToast={addToast} />;
      case 'gerador-senhas':
        return <PasswordGenerator onCopyToast={addToast} />;
      case 'gerador-cpf':
        return <CpfGeneratorValidator initialMode="generator" onCopyToast={addToast} />;
      case 'validador-cpf':
        return <CpfGeneratorValidator initialMode="validator" onCopyToast={addToast} />;
      case 'gerador-cnpj':
        return <CnpjGeneratorValidator onCopyToast={addToast} />;
      case 'gerador-qrcode':
        return <QrCodeGenerator onCopyToast={addToast} />;
      case 'gerador-pix':
        return <PixQrGenerator onCopyToast={addToast} />;
      case 'contador-texto':
        return <TextTools onCopyToast={addToast} />;
      case 'limpador-exif':
        return <ExifCleaner onCopyToast={addToast} />;
      case 'conversor-imagem':
        return <ImageConverter onCopyToast={addToast} />;
      case 'compressor-imagem':
        return <ImageCompressor onCopyToast={addToast} />;
      case 'consulta-cep':
        return <CepLookup onCopyToast={addToast} />;
      case 'cofre-notas-local':
        return <LocalNotesVault onCopyToast={addToast} />;
      case 'calculadora-datas':
        return <DateCalculator onCopyToast={addToast} />;
      case 'calculadoras':
        return <Calculators onCopyToast={addToast} />;
      case 'conversor-unidades':
        return <UnitConverter onCopyToast={addToast} />;
      case 'link-whatsapp':
        return <WhatsappLinkGenerator onCopyToast={addToast} />;
      case 'gerador-curriculo':
        return <ResumeBuilder onCopyToast={addToast} />;
      case 'sobre':
        return <AboutPage />;
      case 'contato':
        return <ContactPage />;
      case 'conformidade-legal':
        return <LegalCompliancePage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setShowingFavoritesOnly(false);
          if (activeToolId) openTool(null);
        }}
        favoriteCount={favorites.length}
        recentToolsCount={0}
        onShowFavoritesOnly={() => {
          setShowingFavoritesOnly(!showingFavoritesOnly);
          if (activeToolId) openTool(null);
        }}
        showingFavoritesOnly={showingFavoritesOnly}
        onHomeClick={() => openTool(null)}
      />

      <main className="flex-1">
        {activeTool ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* TOOL HEADER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => openTool(null)}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Voltar para a lista de ferramentas"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeTool.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {activeTool.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleFavorite(activeTool.id, e)}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title={favorites.includes(activeTool.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites.includes(activeTool.id)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-400'
                    }`}
                  />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    addToast('Link da ferramenta copiado!', 'success');
                  }}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Compartilhar link"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TOOL VIEW CONTAINER */}
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center p-16 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm font-semibold text-slate-500">Carregando ferramenta...</p>
                </div>
              }
            >
              {renderToolComponent()}
            </Suspense>
          </div>
        ) : (
          <BentoGrid
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenTool={openTool}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            showingFavoritesOnly={showingFavoritesOnly}
          />
        )}
      </main>

      <Footer onOpenPwaModal={() => setIsPwaModalOpen(true)} onOpenTool={openTool} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={openTool}
        favorites={favorites}
      />

      <LocalScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        onToast={addToast}
      />

      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        onToast={addToast}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
