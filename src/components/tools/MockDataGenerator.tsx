import { useState } from 'react';
import { Users, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { generateCPF, generateCNPJ } from '../../utils/cpfCnpj';

interface MockDataGeneratorProps {
  onCopyToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const FIRST_NAMES = [
  'Lucas', 'Gabriel', 'Mateus', 'Leonardo', 'Guilherme', 'Arthur', 'Felipe', 'Rafael',
  'Beatriz', 'Juliana', 'Mariana', 'Camila', 'Larissa', 'Carolina', 'Amanda', 'Fernanda',
  'Caduco', 'Thiago', 'Rodrigo', 'Bruna', 'Renata', 'Vanessa', 'Danilo', 'Tatiana'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
  'Barbosa', 'Nunes', 'Moraes', 'Vieira', 'Nascimento', 'Monteiro', 'Cardoso'
];

const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com.br', 'empresa.com.br', 'techmail.io'];
const ROLES = ['Desenvolvedor Frontend', 'Engenheiro de Dados', 'Tech Lead', 'Designer UI/UX', 'Analista de QA', 'DevOps', 'Gerente de Projetos'];
const CITIES = ['São Paulo', 'Mogi das Cruzes', 'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Campinas', 'Curitiba', 'Belo Horizonte'];

export function MockDataGenerator({ onCopyToast }: MockDataGeneratorProps) {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<'json' | 'csv' | 'sql'>('json');
  const [includeCpf, setIncludeCpf] = useState(true);
  const [includeCnpj, setIncludeCnpj] = useState(false);
  const [includePhone, setIncludePhone] = useState(true);
  const [includeRole, setIncludeRole] = useState(true);
  const [includeCity, setIncludeCity] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateData = () => {
    const list: any[] = [];
    for (let i = 1; i <= count; i++) {
      const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(Math.random() * 90 + 10)}@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`;
      const ddd = [11, 21, 85, 88, 31, 41][Math.floor(Math.random() * 6)];
      const phone = `(${ddd}) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`;

      const item: Record<string, any> = {
        id: i,
        nome: `${fn} ${ln}`,
        email,
      };

      if (includeCpf) item.cpf = generateCPF(true);
      if (includeCnpj) item.cnpj = generateCNPJ(true);
      if (includePhone) item.telefone = phone;
      if (includeRole) item.cargo = ROLES[Math.floor(Math.random() * ROLES.length)];
      if (includeCity) item.cidade = CITIES[Math.floor(Math.random() * CITIES.length)];

      list.push(item);
    }
    return list;
  };

  const [data, setData] = useState<any[]>(generateData);

  const handleRegenerate = () => {
    setData(generateData());
    onCopyToast('Dados fictícios gerados!', 'info');
  };

  const getFormattedOutput = (): string => {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const rows = data.map((d) => headers.map((h) => `"${d[h] ?? ''}"`).join(','));
      return [headers.join(','), ...rows].join('\n');
    } else {
      // SQL Inserts
      if (data.length === 0) return '';
      const headers = Object.keys(data[0]);
      const statements = data.map((d) => {
        const values = headers.map((h) => (typeof d[h] === 'number' ? d[h] : `'${d[h]}'`)).join(', ');
        return `INSERT INTO usuarios (${headers.join(', ')}) VALUES (${values});`;
      });
      return statements.join('\n');
    }
  };

  const outputText = getFormattedOutput();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    onCopyToast('Massa de dados copiada!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'sql';
    const mime = format === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_data_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onCopyToast('Download do arquivo iniciado!', 'success');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Gerador de Dados de Teste (Faker Mock Data)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Gerar Novos Dados
          </button>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Quantidade</label>
          <select
            value={count}
            onChange={(e) => {
              setCount(Number(e.target.value));
              setTimeout(handleRegenerate, 50);
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold outline-none"
          >
            <option value={5}>5 registros</option>
            <option value={10}>10 registros</option>
            <option value={25}>25 registros</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Formato de Saída</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-bold text-indigo-600 dark:text-indigo-400 outline-none"
          >
            <option value="json">JSON Array</option>
            <option value="csv">CSV Planilha</option>
            <option value="sql">SQL INSERTs</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex flex-wrap gap-3 items-center pt-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeCpf} onChange={(e) => setIncludeCpf(e.target.checked)} />
            <span>CPF Válido</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeCnpj} onChange={(e) => setIncludeCnpj(e.target.checked)} />
            <span>CNPJ</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includePhone} onChange={(e) => setIncludePhone(e.target.checked)} />
            <span>Telefone</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeRole} onChange={(e) => setIncludeRole(e.target.checked)} />
            <span>Cargo</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={includeCity} onChange={(e) => setIncludeCity(e.target.checked)} />
            <span>Cidade</span>
          </label>
        </div>
      </div>

      {/* Output View */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Prévia dos Dados Gerados ({data.length} itens)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Baixar
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <pre className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto max-h-[360px] select-all leading-relaxed">
          {outputText}
        </pre>
      </div>
    </div>
  );
}
