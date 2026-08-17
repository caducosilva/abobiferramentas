import { Sun, Moon, Star, Notebook, Smartphone } from 'lucide-react';
import { ToolCategory } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-3 group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            abobi<span className="text-indigo-600 dark:text-indigo-400">ferramentas</span>
          </span>
        </button>

        {/* Category Quick Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-500 dark:text-slate-400">
          <button
            onClick={() => onSelectCategory('android')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Apps Android
          </button>
          <button
            onClick={() => onSelectCategory('financas')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
          >
            Pix
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
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition cursor-pointer"
            title="Bloco Rápido e Privacidade Local"
          >
            <Notebook className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Bloco Rápido</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={onOpenPwaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:opacity-90 transition cursor-pointer"
            title="Instalar App no Celular ou PC (PWA)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Instalar App</span>
          </button>

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
