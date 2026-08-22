import { useState } from 'react';
import { Globe, Copy, Check, Share2, Search } from 'lucide-react';

interface MetaTagGeneratorProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function MetaTagGenerator({ onCopyToast }: MetaTagGeneratorProps) {
  const [title, setTitle] = useState('Meu Projeto Incrível - Ferramentas Web');
  const [description, setDescription] = useState(
    'Plataforma completa de ferramentas online gratuitas para desenvolvedores e empresas. Rápido, seguro e sem anúncios.'
  );
  const [url, setUrl] = useState('https://meusite.com');
  const [imageUrl, setImageUrl] = useState('https://meusite.com/og-image.png');
  const [author, setAuthor] = useState('Caduco Silva');
  const [twitterUser, setTwitterUser] = useState('@caducosilva');
  const [copied, setCopied] = useState(false);

  const metaHtml = `<!-- Meta Tags Básicas e Primárias -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta name="author" content="${author}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:locale" content="pt_BR">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
${twitterUser ? `<meta name="twitter:creator" content="${twitterUser}">` : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(metaHtml);
    setCopied(true);
    onCopyToast('Meta tags copiadas com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gerador de Meta Tags SEO & Open Graph</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Título da Página (Title)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Descrição (Meta Description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Canônica</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Imagem de Compartilhamento</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Prévia no Google Search</h3>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate">{url}</span>
            </div>
            <h4 className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
              {title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
            Prévia Social (WhatsApp / Facebook / Twitter)
          </h3>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
            <div className="h-28 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-mono">
              [Preview da Imagem: 1200x630]
            </div>
            <div className="p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">{url.replace(/^https?:\/\//, '')}</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code Output */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Código HTML Pronto para o &lt;head&gt;</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Meta Tags'}</span>
          </button>
        </div>
        <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto select-all leading-relaxed">
          {metaHtml}
        </pre>
      </div>
    </div>
  );
}
