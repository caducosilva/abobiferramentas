import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, RefreshCw, QrCode as QrIcon, Wifi, Link, Mail, MessageSquare } from 'lucide-react';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

export function QrCodeGenerator({ onCopyToast }: ToolProps) {
  const [qrType, setQrType] = useState<'url' | 'wifi' | 'email' | 'whatsapp'>('url');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);
  
  // Custom inputs
  const [text, setText] = useState('https://abobiferramentas.com');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  const [emailAddr, setEmailAddr] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  const [waNumber, setWaNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');

  // QR Options
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final QR payload
  const getPayload = () => {
    if (qrType === 'wifi') {
      return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
    }
    if (qrType === 'email') {
      return `mailto:${emailAddr}?subject=${encodeURIComponent(emailSubject)}`;
    }
    if (qrType === 'whatsapp') {
      const cleanNum = waNumber.replace(/\D/g, '');
      return `https://wa.me/${cleanNum}?text=${encodeURIComponent(waMessage)}`;
    }
    return text || 'https://multitool.app';
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload) return;

    QRCode.toDataURL(
      payload,
      {
        width: 320,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [qrType, text, wifiSsid, wifiPassword, wifiEncryption, emailAddr, emailSubject, waNumber, waMessage, fgColor, bgColor]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const rateCheck = checkAndConsumeRateLimit('gerador-qrcode');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de download de QR Code atingido.');
      return;
    }
    setBlockedResult(null);

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
    onCopyToast('Download do QR Code iniciado!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="gerador-qrcode"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setQrType('url')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            qrType === 'url'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Link className="w-3.5 h-3.5" /> URL / Texto
        </button>

        <button
          onClick={() => setQrType('wifi')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            qrType === 'wifi'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" /> Rede Wi-Fi
        </button>

        <button
          onClick={() => setQrType('whatsapp')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            qrType === 'whatsapp'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
        </button>

        <button
          onClick={() => setQrType('email')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            qrType === 'email'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> E-mail
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Inputs */}
        <div className="space-y-4">
          {qrType === 'url' && (
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 block">
                Link ou Texto do QR Code:
              </label>
              <input
                type="text"
                placeholder="https://seu-site.com.br"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Nome da Rede Wi-Fi (SSID):
                </label>
                <input
                  type="text"
                  placeholder="MinhaRede_5G"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Senha da Wi-Fi:
                </label>
                <input
                  type="password"
                  placeholder="SuaSenhaSegura"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>
            </div>
          )}

          {qrType === 'whatsapp' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Número do WhatsApp (com DDD):
                </label>
                <input
                  type="text"
                  placeholder="51999998888"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                  Mensagem Inicial Opcional:
                </label>
                <textarea
                  rows={2}
                  placeholder="Olá! Gostaria de mais informações..."
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                />
              </div>
            </div>
          )}

          {/* Color Customization */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Cores do QR Code
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Cor do Código (Frente)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Cor do Fundo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code Gerado" className="w-52 h-52 object-contain" />
            )}
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" /> Baixar QR Code PNG
          </button>
        </div>
      </div>
    </div>
  );
}
