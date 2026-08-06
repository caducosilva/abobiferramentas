import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { Tool } from '../types';
import { TOOLS } from '../data/toolsData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  favorites: string[];
}

export function SearchModal({ isOpen, onClose, onSelectTool, favorites }: SearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = TOOLS.filter((tool) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="cursor-default w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Input header */}
          <div className="relative flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 ml-2 mr-3" />
            <input
              type="text"
              autoFocus
              placeholder="Digite o nome da ferramenta (ex: CPF, QR Code, Senha)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-base bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-2 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              ESC
            </button>
          </div>

          {/* Results list */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredTools.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="font-medium text-slate-600 dark:text-slate-300">Nenhuma ferramenta encontrada</p>
                <p className="text-sm mt-1">Tente pesquisar por palavras como "gerador", "validar" ou "texto".</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTools.map((tool) => {
                  const isFav = favorites.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onSelectTool(tool.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tool.color.bgLight} ${tool.color.textLight} dark:bg-slate-800`}>
                          <Search className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {tool.name}
                            </span>
                            {isFav && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{tool.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex justify-between items-center px-4">
            <span>Dica: Use palavras-chave como <strong>"compressor"</strong> ou <strong>"senha"</strong></span>
            <span>{filteredTools.length} ferramentas</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
