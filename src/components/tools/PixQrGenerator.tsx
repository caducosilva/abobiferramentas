import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, QrCode as QrIcon, TriangleAlert } from 'lucide-react';
import {
  PixKeyType,
  buildPixPayload,
  normalizeAmount,
  validatePixKey,
} from '../../utils/pixUtils';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

const KEY_TYPES: { id: PixKeyType; label: string; placeholder: string }[] = [
  { id: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
  { id: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { id: 'email', label: 'E-mail', placeholder: 'seu@email.com' },
  { id: 'telefone', label: 'Telefone', placeholder: '(11) 90000-0000' },
  { id: 'aleatoria', label: 'Aleatória', placeholder: '0000-0000-0000-0000...' },
];

export function PixQrGenerator({ onCopyToast }: ToolProps) {
  const [keyType, setKeyType] = useState<PixKeyType>('cpf');
  const [pixKey, setPixKey] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCity, setMerchantCity] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [txid, setTxid] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);

  const keyError = pixKey.trim() ? validatePixKey(pixKey, keyType) : null;
  const isReady = Boolean(pixKey.trim()) && !keyError && Boolean(merchantName.trim());

  const payload = useMemo(() => {
    if (!isReady) return '';
    return buildPixPayload({
      key: pixKey,
      keyType,
      merchantName,
      merchantCity,
      amount,
      description,
      txid,
    });
  }, [isReady, pixKey, keyType, merchantName, merchantCity, amount, description, txid]);

  useEffect(() => {
    if (!payload) {
      setQrDataUrl('');
      return;
    }

    let active = true;
    QRCode.toDataURL(payload, { width: 320, margin: 2 })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [payload]);

  const handleCopy = () => {
    if (!payload) return;
    const rateCheck = checkAndConsumeRateLimit('gerador-pix');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('Limite de geração atingido. Aguarde alguns segundos.');
      return;
    }
    setBlockedResult(null);

    navigator.clipboard.writeText(payload);
    onCopyToast('Código Pix Copia e Cola copiado!');
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qrcode-pix.png';
    link.click();
    onCopyToast('Download do QR Code Pix iniciado!');
  };

  const currentType = KEY_TYPES.find((type) => type.id === keyType)!;
  const normalizedAmount = amount ? normalizeAmount(amount) : '';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="gerador-pix"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Tipo de chave */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
        {KEY_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setKeyType(type.id)}
            className={`py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              keyType === type.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              Chave Pix ({currentType.label})
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(event) => setPixKey(event.target.value)}
              placeholder={currentType.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {keyError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-semibold">
                {keyError}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              Nome do recebedor
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(event) => setMerchantName(event.target.value)}
              placeholder="Maria Silva"
              maxLength={25}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Máximo de 25 caracteres, sem acento.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Cidade
              </label>
              <input
                type="text"
                value={merchantCity}
                onChange={(event) => setMerchantCity(event.target.value)}
                placeholder="Mogi das Cruzes"
                maxLength={15}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Valor (opcional)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="49,90"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Bolo de pote"
                maxLength={40}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                Identificador (opcional)
              </label>
              <input
                type="text"
                value={txid}
                onChange={(event) => setTxid(event.target.value)}
                placeholder="PEDIDO123"
                maxLength={25}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sem valor preenchido, o pagador digita quanto quer enviar. Com valor, o campo já vai
            travado no app do banco
            {normalizedAmount ? `: R$ ${normalizedAmount.replace('.', ',')}` : ''}.
          </p>
        </div>

        {/* Resultado */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px]">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code Pix gerado" className="w-56 h-56 rounded-xl bg-white p-2" />
            ) : (
              <div className="text-center space-y-2 text-slate-400 dark:text-slate-500">
                <QrIcon className="w-10 h-10 mx-auto" />
                <p className="text-xs font-semibold">
                  Preencha a chave Pix e o nome do recebedor para gerar o código.
                </p>
              </div>
            )}
          </div>

          {payload && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                  Pix Copia e Cola
                </label>
                <textarea
                  readOnly
                  value={payload}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-[11px] leading-relaxed outline-none resize-none select-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer text-sm"
                >
                  <Copy className="w-4 h-4" /> Copiar código
                </button>
                <button
                  onClick={handleDownload}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl flex items-center gap-2 transition cursor-pointer text-sm"
                >
                  <Download className="w-4 h-4" /> PNG
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
        <TriangleAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          O código é montado no seu navegador e a chave Pix não é enviada para servidor nenhum.
          Antes de divulgar a cobrança, faça um teste de R$ 0,01 e confira se o app do banco mostra
          o recebedor certo.
        </p>
      </div>
    </div>
  );
}
