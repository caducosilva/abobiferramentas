import { useState, useEffect, MouseEvent } from 'react';
import { Navbar } from './components/Navbar';
import { BentoGrid } from './components/BentoGrid';
import { SearchModal } from './components/SearchModal';
import { LocalScratchpadModal } from './components/LocalScratchpadModal';
import { PwaInstallModal } from './components/PwaInstallModal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { ToolInfoSection } from './components/ToolInfoSection';
import seoContent from './data/seoContent.json';

// Tool Views
import { AndroidApps } from './components/tools/AndroidApps';
import { MogiBusSchedule } from './components/tools/MogiBusSchedule';
import { CpfGeneratorValidator } from './components/tools/CpfGeneratorValidator';
import { CnpjGeneratorValidator } from './components/tools/CnpjGeneratorValidator';
import { PasswordGenerator } from './components/tools/PasswordGenerator';
import { ImageCompressor } from './components/tools/ImageCompressor';
import { TextTools } from './components/tools/TextTools';
import { ResumeBuilder } from './components/tools/ResumeBuilder';
import { QrCodeGenerator } from './components/tools/QrCodeGenerator';
import { JsonFormatter } from './components/tools/JsonFormatter';
import { UuidGenerator } from './components/tools/UuidGenerator';
import { WhatsappLinkGenerator } from './components/tools/WhatsappLinkGenerator';
import { Calculators } from './components/tools/Calculators';
import { UnitConverter } from './components/tools/UnitConverter';
import { Base64HashTools } from './components/tools/Base64HashTools';
import { LocalNotesVault } from './components/tools/LocalNotesVault';
import { ExifCleaner } from './components/tools/ExifCleaner';
import { PixQrGenerator } from './components/tools/PixQrGenerator';
import { DateCalculator } from './components/tools/DateCalculator';
import { ImageConverter } from './components/tools/ImageConverter';
import { CepLookup } from './components/tools/CepLookup';
import { TextDiff } from './components/tools/TextDiff';

import { ToolCategory, ToastMessage } from './types';
import { TOOLS } from './data/toolsData';
import { ArrowLeft, Star, Share2 } from 'lucide-react';

const SITE_TITLE = 'abobiferramentas | APK Open Source, Pix, Ônibus Mogi, CPF & Senhas';

function resolveToolIdFromPath(pathname: string): string | null {
  if (pathname === '/' || pathname === '') return null;
  const tool = TOOLS.find((t) => `/${t.slug}` === pathname || t.aliases?.includes(pathname));
  return tool?.id ?? null;
}

export default function App() {
  // Static SEO content is baked into the pre-rendered HTML (outside #root) so crawlers with
  // weak JS support see real content immediately. Once React mounts, its own interactive
  // version (ToolInfoSection / BentoGrid teaser) takes over, so the static copy is removed
  // to avoid showing the same content twice to real users.
  useEffect(() => {
    document.getElementById('prerendered-seo-content')?.remove();
  }, []);

  // Dark mode setup
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('abobi_dark');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('abobi_dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('multitool_favs');
    return saved ? JSON.parse(saved) : ['gerador-cpf', 'compressor-imagem', 'gerador-senhas'];
  });

  useEffect(() => {
    localStorage.setItem('multitool_favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (toolId: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const isFav = prev.includes(toolId);
      if (isFav) {
        addToast('Removido dos favoritos', 'info');
        return prev.filter((id) => id !== toolId);
      } else {
        addToast('Adicionado aos favoritos!', 'success');
        return [...prev, toolId];
      }
    });
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Search & Navigation
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cmd/Ctrl+K opens the search modal from anywhere (no dedicated navbar button anymore)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(() =>
    resolveToolIdFromPath(window.location.pathname)
  );
  const [showingFavoritesOnly, setShowingFavoritesOnly] = useState(false);

  // Keep the URL, tab title and browser back/forward button in sync with the open tool (SEO deep-linking)
  useEffect(() => {
    const handlePopState = () => {
      setActiveToolId(resolveToolIdFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const tool = TOOLS.find((t) => t.id === activeToolId);
    document.title = tool ? `${tool.name} | abobiferramentas` : SITE_TITLE;

    const description =
      (tool ? tool.description : (seoContent as any).home?.description) ?? (seoContent as any).home?.description;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [activeToolId]);

  const closeTool = () => {
    setActiveToolId(null);
    if (window.location.pathname !== '/') {
      window.history.pushState(null, SITE_TITLE, '/');
    }
  };

  // Recent tools persisted locally in browser
  const [recentTools, setRecentTools] = useState<string[]>(() => {
    const saved = localStorage.getItem('abobi_recent_tools');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('abobi_recent_tools', JSON.stringify(recentTools));
  }, [recentTools]);

  const handleOpenTool = (toolId: string) => {
    setActiveToolId(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRecentTools((prev) => [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 6));

    const tool = TOOLS.find((t) => t.id === toolId);
    if (tool) window.history.pushState({ toolId }, tool.name, `/${tool.slug}`);
  };

  const currentTool = TOOLS.find((t) => t.id === activeToolId);

  // Render proper tool component
  const renderActiveToolComponent = () => {
    switch (activeToolId) {
      case 'apps-android':
        return <AndroidApps onCopyToast={addToast} />;
      case 'onibus-mogi':
        return <MogiBusSchedule />;
      case 'gerador-cpf':
      case 'validador-cpf':
        return <CpfGeneratorValidator onCopyToast={addToast} />;
      case 'gerador-cnpj':
        return <CnpjGeneratorValidator onCopyToast={addToast} />;
      case 'gerador-senhas':
        return <PasswordGenerator onCopyToast={addToast} />;
      case 'compressor-imagem':
        return <ImageCompressor onCopyToast={addToast} />;
      case 'contador-texto':
        return <TextTools onCopyToast={addToast} />;
      case 'gerador-curriculo':
        return <ResumeBuilder onCopyToast={addToast} />;
      case 'gerador-qrcode':
        return <QrCodeGenerator onCopyToast={addToast} />;
      case 'formatador-json':
        return <JsonFormatter onCopyToast={addToast} />;
      case 'gerador-uuid':
        return <UuidGenerator onCopyToast={addToast} />;
      case 'link-whatsapp':
        return <WhatsappLinkGenerator onCopyToast={addToast} />;
      case 'calculadoras':
        return <Calculators onCopyToast={addToast} />;
      case 'conversor-unidades':
        return <UnitConverter onCopyToast={addToast} />;
      case 'base64-hash':
        return <Base64HashTools onCopyToast={addToast} />;
      case 'cofre-notas-local':
        return <LocalNotesVault onCopyToast={addToast} />;
      case 'limpador-exif':
        return <ExifCleaner onCopyToast={addToast} />;
      case 'gerador-pix':
        return <PixQrGenerator onCopyToast={addToast} />;
      case 'calculadora-datas':
        return <DateCalculator onCopyToast={addToast} />;
      case 'conversor-imagem':
        return <ImageConverter onCopyToast={addToast} />;
      case 'consulta-cep':
        return <CepLookup onCopyToast={addToast} />;
      case 'comparador-texto':
        return <TextDiff onCopyToast={addToast} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col">
      {/* Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenScratchpad={() => setIsScratchpadOpen(true)}
        onOpenPwaModal={() => setIsPwaModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setShowingFavoritesOnly(false);
          if (activeToolId) closeTool();
        }}
        favoriteCount={favorites.length}
        recentToolsCount={recentTools.length}
        onShowFavoritesOnly={() => {
          setShowingFavoritesOnly(!showingFavoritesOnly);
          if (activeToolId) closeTool();
        }}
        showingFavoritesOnly={showingFavoritesOnly}
        onHomeClick={() => {
          closeTool();
          setShowingFavoritesOnly(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeToolId && currentTool ? (
          /* TOOL EXECUTION VIEW WITH BREADCRUMB */
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={closeTool}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para o Início
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(currentTool.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    favorites.includes(currentTool.id)
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                  title="Favoritar ferramenta"
                >
                  <Star
                    className={`w-4 h-4 ${
                      favorites.includes(currentTool.id) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tool Title Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${currentTool.color.bgLight} ${currentTool.color.textLight} dark:bg-slate-800 shrink-0`}>
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {currentTool.name}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {currentTool.description}
                </p>
              </div>
            </div>

            {/* Render Tool View */}
            {renderActiveToolComponent()}

            {/* Real, unique text content per tool — helps search & ad-review crawlers see this isn't a blank screen */}
            <ToolInfoSection toolId={currentTool.id} />
          </div>
        ) : (
          /* HOMEPAGE BENTO GRID DASHBOARD */
          <>
            <BentoGrid
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenTool={handleOpenTool}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              showingFavoritesOnly={showingFavoritesOnly}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
              <ToolInfoSection toolId="home" />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenPwaModal={() => setIsPwaModalOpen(true)} />

      {/* Global Command+K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleOpenTool}
        favorites={favorites}
      />

      {/* Local Scratchpad & Privacy Manager */}
      <LocalScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        onToast={addToast}
      />

      {/* PWA App Install Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        onToast={addToast}
      />

      {/* Toast Notification Popups */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
