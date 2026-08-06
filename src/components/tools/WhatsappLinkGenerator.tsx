import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, ExternalLink, MessageSquare, QrCode as QrIcon, Check } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function WhatsappLinkGenerator({ onCopyToast }: ToolProps) {
  const [phone, setPhone] = useState('11999998888');
  const [ddi, setDdi] = useState('55');
  const [message, setMessage] = useState('Olá! Gostaria de tirar algumas dúvidas.');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = `${ddi}${cleanPhone}`;
  const generatedUrl = `https://wa.me/${fullPhone}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;

  useEffect(() => {
    if (fullPhone) {
      QRCode.toDataURL(generatedUrl, { width: 200, margin: 2 }, (err, url) => {
        if (!err && url) setQrCodeUrl(url);
      });
    }
  }, [fullPhone, message]);

  const handleCopy = () => {
    const rateCheck = checkAndConsumeRateLimit('link-whatsapp');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de requisições atingido.');
      return;
    }
    setBlockedResult(null);

    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopyToast('Link do WhatsApp copiado!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="link-whatsapp"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                DDI
              </label>
              <select
                value={ddi}
                onChange={(e) => setDdi(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
              >
                <option value="55">+55 (Brasil)</option>
                <option value="1">+1 (EUA/Canadá)</option>
                <option value="351">+351 (Portugal)</option>
                <option value="34">+34 (Espanha)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                Número do Celular (com DDD)
              </label>
              <input
                type="text"
                placeholder="Ex: 11987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
              Mensagem Automática Preenchida
            </label>
            <textarea
              rows={3}
              placeholder="Digite a mensagem que seu cliente enviará ao clicar no link..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
            />
          </div>

          {/* Generated Link Display */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 font-semibold block">Link Gerado:</span>
            <span className="text-sm font-mono text-emerald-400 break-all block">{generatedUrl}</span>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Link Copiado!' : 'Copiar Link'}
              </button>

              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" /> Abrir Conversa
              </a>
            </div>
          </div>
        </div>

        {/* QR Code side panel */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            QR Code Direto
          </span>
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code WhatsApp" className="w-40 h-40 object-contain" />}
          </div>
          <p className="text-[11px] text-slate-400">
            Escaneie com a câmera do celular para abrir a conversa no WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
