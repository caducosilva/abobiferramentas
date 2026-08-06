import { Sun, Moon, Search, Star, ShieldCheck, Notebook, Smartphone } from 'lucide-react';
import { ToolCategory } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onOpenScratchpad: () => void;
  onOpenPwaModal: () => void;
  activeCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  favoriteCount: number;
  recentToolsCount: number;
  onShowFavoritesOnly: () => void;
  showingFavoritesOnly: boolean;
  onHomeClick: () => void;
}

export function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenSearch,
  onOpenScratchpad,
  onOpenPwaModal,
  onSelectCategory,
  favoriteCount,
  onShowFavoritesOnly,
  showingFavoritesOnly,
  onHomeClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 group cursor-pointer focus:outline-none"
        >
          <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            abobi<span className="text-indigo-600 dark:text-indigo-400">ferramentas</span>
          </span>
        </button>

        {/* Category Quick Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          <button
            onClick={() => onSelectCategory('midia')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Vídeos
          </button>
          <button
            onClick={() => onSelectCategory('transportes')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Ônibus Mogi
          </button>
          <button
            onClick={() => onSelectCategory('geradores')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Geradores
          </button>
          <button
            onClick={() => onSelectCategory('validadores')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Validadores
          </button>
          <button
            onClick={() => onSelectCategory('desenvolvimento')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Desenvolvimento
          </button>
          <button
            onClick={() => onSelectCategory('matematica')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Matemática
          </button>
        </div>

        {/* Action Controls & Dashboard Badge */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Favorites Badge Button */}
          <button
            onClick={onShowFavoritesOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
              showingFavoritesOnly
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Favoritos"
          >
            <Star className={`w-3.5 h-3.5 ${favoriteCount > 0 ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Favoritos</span>
            {favoriteCount > 0 && (
              <span className="bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950 text-[10px] font-extrabold px-1.5 rounded-full">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Local Scratchpad / Quick Notes Button */}
          <button
            onClick={onOpenScratchpad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition cursor-pointer"
            title="Bloco Rápido e Privacidade Local"
          >
            <Notebook className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Bloco Rápido</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={onOpenPwaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:opacity-90 transition cursor-pointer"
            title="Instalar App no Celular ou PC (PWA)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar App</span>
          </button>

          {/* Security Shield Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80"
            title="Proteção Anti-Spam e Rate Limit Ativos na Aplicação"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Rate Limit Ativo</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
