import { ShieldCheck, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { getToolConfig, getUsageInfo, RateLimitCheckResult } from '../utils/rateLimiter';
import { useEffect, useState } from 'react';

interface RateLimitGuardProps {
  toolId: string;
  blockedResult: RateLimitCheckResult | null;
  onClearBlock?: () => void;
}

export function RateLimitGuard({ toolId, blockedResult, onClearBlock }: RateLimitGuardProps) {
  const config = getToolConfig(toolId);
  const [usage, setUsage] = useState(() => getUsageInfo(toolId));
  const [countdown, setCountdown] = useState<number>(0);

  // Sync usage stats
  useEffect(() => {
    const interval = setInterval(() => {
      setUsage(getUsageInfo(toolId));
    }, 1000);
    return () => clearInterval(interval);
  }, [toolId]);

  // Handle countdown when blocked
  useEffect(() => {
    if (blockedResult && !blockedResult.allowed) {
      setCountdown(blockedResult.resetInSeconds);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onClearBlock) onClearBlock();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(0);
    }
  }, [blockedResult, onClearBlock]);

  return (
    <div className="space-y-4">
      {/* SECURITY SHIELD STATUS PILL */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Proteção Anti-Spam & Rate Limit</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <span>
            {usage.limit - usage.used}/{usage.limit} req restantes
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">•</span>
          <span className="hidden sm:inline-block">Janela: {usage.windowSeconds}s</span>
        </div>
      </div>

      {/* BLOCKED COOLDOWN OVERLAY / BANNER */}
      {blockedResult && !blockedResult.allowed && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-700 rounded-2xl text-amber-900 dark:text-amber-100 shadow-lg animate-fade-in space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="font-extrabold text-sm sm:text-base">
                {blockedResult.isBurstBlocked ? '⚠️ Anti-Spam / Anti-Bot Ativado' : '⚠️ Limite de Requisições Atingido'}
              </h4>
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                {blockedResult.reason || 'Sua frequência de requisições foi temporariamente pausada por segurança.'}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-amber-200 dark:border-amber-800/60 text-xs font-bold">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Aguarde {countdown}s para liberar novas requisições...</span>
            </div>

            {countdown === 0 && (
              <button
                onClick={onClearBlock}
                className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Tentar Novamente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
