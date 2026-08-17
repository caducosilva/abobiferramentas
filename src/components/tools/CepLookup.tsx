import { useState } from 'react';
import { Copy, Loader2, MapPin, Search } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado?: string;
  regiao?: string;
  ddd?: string;
  ibge?: string;
  erro?: boolean | string;
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function CepLookup({ onCopyToast }: ToolProps) {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<ViaCepAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const digits = cep.replace(/\D/g, '');

  const handleSearch = async () => {
    if (digits.length !== 8) {
      setError('O CEP precisa ter 8 dígitos.');
      return;
    }

    const rateCheck = checkAndConsumeRateLimit('consulta-cep');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('Limite de consultas atingido. Aguarde alguns segundos.');
      return;
    }
    setBlockedResult(null);
    setLoading(true);
    setError(null);
    setAddress(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) throw new Error('Serviço de CEP indisponível.');

      const data: ViaCepAddress = await response.json();
      // O ViaCEP responde 200 com {"erro": true} quando o CEP não existe.
      if (data.erro) {
        setError('CEP não encontrado na base dos Correios.');
        return;
      }
      setAddress(data);
    } catch {
      setError('Não deu para consultar agora. Verifique a conexão e tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const fullAddress = address
    ? [
        address.logradouro,
        address.bairro,
        `${address.localidade} - ${address.uf}`,
        address.cep,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const fields = address
    ? [
        { label: 'CEP', value: address.cep },
        { label: 'Logradouro', value: address.logradouro || 'não informado' },
        { label: 'Complemento', value: address.complemento || '-' },
        { label: 'Bairro', value: address.bairro || 'não informado' },
        { label: 'Cidade', value: address.localidade },
        { label: 'Estado', value: address.estado ? `${address.estado} (${address.uf})` : address.uf },
        { label: 'DDD', value: address.ddd || '-' },
        { label: 'Código IBGE', value: address.ibge || '-' },
      ]
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="consulta-cep"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={cep}
            onChange={(event) => setCep(formatCep(event.target.value))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch();
            }}
            placeholder="08710-000"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || digits.length !== 8}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Consultar
        </button>
      </div>

      {error && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}

      {address && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div
                key={field.label}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3"
              >
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 break-words">
                  {field.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullAddress);
                onCopyToast('Endereço completo copiado!');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar endereço
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5" /> Abrir no mapa
            </a>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Os dados vêm do ViaCEP, serviço público e gratuito que espelha a base dos Correios. Só o
        CEP digitado sai do navegador, e nada da consulta é guardado aqui.
      </p>
    </div>
  );
}
