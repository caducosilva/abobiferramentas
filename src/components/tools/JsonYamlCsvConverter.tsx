import { useState } from 'react';
import { ArrowLeftRight, Copy, Check, Trash2, FileSpreadsheet } from 'lucide-react';

interface JsonYamlCsvConverterProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export function JsonYamlCsvConverter({ onCopyToast }: JsonYamlCsvConverterProps) {
  const [inputMode, setInputMode] = useState<'json' | 'csv'>('json');
  const [outputMode, setOutputMode] = useState<'csv' | 'yaml' | 'json'>('csv');
  const [inputText, setInputText] = useState(
    JSON.stringify(
      [
        { id: 1, nome: 'Caduco Silva', cidade: 'São Paulo', cargo: 'Tech Lead' },
        { id: 2, nome: 'Maria Santos', cidade: 'Fortaleza', cargo: 'Engenheira de Dados' },
        { id: 3, nome: 'Pedro Lima', cidade: 'Mogi das Cruzes', cargo: 'Dev Frontend' }
      ],
      null,
      2
    )
  );
  const [copied, setCopied] = useState(false);

  const convertJsonToCsv = (jsonArr: any[]): string => {
    if (!Array.isArray(jsonArr) || jsonArr.length === 0) return '';
    const headers = Object.keys(jsonArr[0]);
    const csvRows = [headers.join(',')];

    for (const row of jsonArr) {
      const values = headers.map((header) => {
        const val = row[header] ?? '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const convertCsvToJson = (csv: string): any[] => {
    const lines = csv.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const result: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] ?? '';
      }
      result.push(obj);
    }
    return result;
  };

  const convertJsonToYaml = (obj: any, indent = 0): string => {
    const spaces = ' '.repeat(indent);
    if (Array.isArray(obj)) {
      return obj
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            const inner = convertJsonToYaml(item, indent + 2).trimStart();
            return `${spaces}- ${inner}`;
          }
          return `${spaces}- ${item}`;
        })
        .join('\n');
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            return `${spaces}${key}:\n${convertJsonToYaml(val, indent + 2)}`;
          }
          return `${spaces}${key}: ${val}`;
        })
        .join('\n');
    }
    return `${spaces}${obj}`;
  };

  const getConvertedOutput = (): { output: string; error: string | null } => {
    try {
      if (!inputText.trim()) return { output: '', error: null };

      let parsedData: any;
      if (inputMode === 'json') {
        parsedData = JSON.parse(inputText);
      } else {
        parsedData = convertCsvToJson(inputText);
      }

      if (outputMode === 'csv') {
        return { output: convertJsonToCsv(Array.isArray(parsedData) ? parsedData : [parsedData]), error: null };
      } else if (outputMode === 'yaml') {
        return { output: convertJsonToYaml(parsedData), error: null };
      } else {
        return { output: JSON.stringify(parsedData, null, 2), error: null };
      }
    } catch (err: any) {
      return { output: '', error: `Erro na conversão: ${err.message}` };
    }
  };

  const { output, error } = getConvertedOutput();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onCopyToast('Conteúdo convertido copiado!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conversor JSON ↔ YAML ↔ CSV</h2>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">De:</span>
            <select
              value={inputMode}
              onChange={(e) => setInputMode(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <ArrowLeftRight className="w-4 h-4 text-slate-400" />

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Para:</span>
            <select
              value={outputMode}
              onChange={(e) => setOutputMode(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="csv">CSV</option>
              <option value="yaml">YAML</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="uppercase font-bold">Entrada ({inputMode})</span>
            <button
              onClick={() => setInputText('')}
              className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Cole seus dados em ${inputMode.toUpperCase()}...`}
            rows={14}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400">Saída ({outputMode})</span>
            <button
              onClick={() => handleCopy(output)}
              disabled={!output}
              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition cursor-pointer flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          {error ? (
            <div className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 font-mono">
              {error}
            </div>
          ) : (
            <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto min-h-[300px] h-[340px] select-all leading-relaxed">
              {output || '// O resultado convertido aparecerá aqui'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
