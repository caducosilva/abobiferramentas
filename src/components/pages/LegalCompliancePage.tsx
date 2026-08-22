import { Scale, ShieldCheck, BookOpen, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export function LegalCompliancePage() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-8 text-slate-700 dark:text-slate-200 leading-relaxed">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
          <Scale className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bases Legais & Conformidade Jurídica
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fundamentação técnica e jurídica sobre a legalidade das ferramentas, proteção de dados e legislação brasileira aplicável.
        </p>
      </div>

      {/* Legislation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Marco Civil da Internet (Lei nº 12.965/2014)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            O site rege-se pelos princípios de garantia da liberdade de expressão, comunicação, inovação tecnológica e não guarda desnecessária de dados de conexão ou dados pessoais (Art. 3º e 7º).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>LGPD (Lei nº 13.709/2018)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Adotamos a arquitetura <em>Privacy by Design</em>: todo o processamento de textos, senhas, documentos e hashes roda exclusivamente na memória volátil do navegador (client-side), sem coleta, banco de dados ou compartilhamento com terceiros.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>Constituição Federal de 1988</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Amparo no Art. 5º, incisos IV (livre manifestação do pensamento) e IX (liberdade da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Lei de Acesso à Informação (Lei nº 12.527/2011)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Os dados de linhas e horários de transporte público municipal são dados governamentais abertos, de interesse público e de livre consulta e disseminação comunitária.
          </p>
        </div>
      </div>

      {/* Por que as ferramentas NÃO são ilegais */}
      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Por que as ferramentas do abobiferramentas são 100% lícitas e legais?
        </h2>

        <div className="space-y-4 text-sm">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              1. Gerador & Validador de CPF e CNPJ (Fins estritos de Desenvolvimento e Testes)
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              O CPF e o CNPJ utilizam o algoritmo matemático público de <strong>Módulo 11</strong> (cálculo de dígitos verificadores) publicado e padronizado formalmente pela Receita Federal do Brasil.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              A ferramenta gera apenas sequências numéricas aleatórias que respeitam a regra aritmética, <strong>sem consultar, invadir ou expor bancos de dados reais de cidadãos ou empresas</strong>. O uso dessas ferramentas é padrão essencial na indústria de tecnologia para testes de software, controle de qualidade (QA) e homologação de formulários antes da entrada em produção. Não há crime tipificado (art. 299 ou 171 do Código Penal), uma vez que não há falsificação de documento público nem intuito doloso.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              2. Hashes (SHA-256, SHA-512), Base64, UUID e Gerador de Senhas
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Utilizam padrões abertos internacionais do W3C (Web Cryptography API) e IETF (RFC 4122). São instrumentos fundamentais de segurança da informação, integridade de arquivos e proteção de credenciais.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              3. Consulta de CEP e Dados de Endereçamento
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Consome dados públicos fornecidos pelo serviço aberto ViaCEP, espelhando dados públicos do Diretório Nacional de Endereços (DNE), sem armazenar os dados de localização dos usuários.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
