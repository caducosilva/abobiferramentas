import { useState } from 'react';
import { FileCode, Copy, Check, Trash2 } from 'lucide-react';

interface XmlFormatterProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function XmlFormatter({ onCopyToast }: XmlFormatterProps) {
  const [inputXml, setInputXml] = useState(
    '<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00"><NFe><infNFe Id="NFe35260812345678000195550010000000011234567890"><emit><CNPJ>12345678000195</CNPJ><xNome>EMPRESA EXEMPLO LTDA</xNome><enderEmit><xLgr>AV PAULISTA</xLgr><nro>1000</nro><xBairro>BELA VISTA</xBairro><cMun>3550308</cMun><xMun>SAO PAULO</xMun><UF>SP</UF><CEP>01310100</CEP></enderEmit></emit></infNFe></NFe></nfeProc>'
  );
  const [copied, setCopied] = useState(false);

  const formatXml = (xml: string): string => {
    if (!xml.trim()) return '';

    let formatted = '';
    let indent = 0;
    const tab = '  ';

    xml = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
    const lines = xml.split('\r\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.match(/^<\/\w/)) {
        // Tag de fechamento
        if (indent > 0) indent--;
      }

      formatted += tab.repeat(indent) + line + '\n';

      if (line.match(/^<\w[^>]*[^\/]>.*$/) && !line.match(/^<\w[^>]*>.*<\/\w[^>]*>$/)) {
        // Tag de abertura não autocontida
        indent++;
      }
    }

    return formatted.trim();
  };

  const formattedOutput = formatXml(inputXml);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopyToast('XML copiado!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Formatador & Validador XML / HTML</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>XML / HTML de Entrada</span>
            <button
              onClick={() => setInputXml('')}
              className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>
          <textarea
            value={inputXml}
            onChange={(e) => setInputXml(e.target.value)}
            placeholder="Cole seu XML ou HTML aqui..."
            rows={14}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>XML Formatado</span>
            <button
              onClick={() => handleCopy(formattedOutput)}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto min-h-[300px] h-[340px] select-all leading-relaxed">
            {formattedOutput || '<!-- O XML formatado aparecerá aqui -->'}
          </pre>
        </div>
      </div>
    </div>
  );
}
