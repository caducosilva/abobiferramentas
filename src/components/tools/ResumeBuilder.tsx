import { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Copy, RefreshCw, FileText, Check, GraduationCap, Briefcase, User, Award, Eye, Edit3 } from 'lucide-react';
import { ResumeData } from '../../types';
import { checkAndConsumeRateLimit, RateLimitCheckResult } from '../../utils/rateLimiter';
import { RateLimitGuard } from '../RateLimitGuard';

interface ToolProps {
  onCopyToast: (msg: string) => void;
}

const INITIAL_RESUME: ResumeData = {
  personalInfo: {
    fullName: 'João da Silva',
    title: 'Cargo ou Título Profissional Desejado',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 98765-4321',
    location: 'São Paulo, SP',
    linkedin: 'linkedin.com/in/joaodasilva',
    website: '',
  },
  summary:
    'Breve resumo profissional com suas principais qualificações, anos de experiência e áreas de atuação. Edite este texto com suas informações reais.',
  experience: [
    {
      id: '1',
      company: 'Nome da Empresa',
      position: 'Cargo Ocupado',
      period: 'Jan/2022 – Atual',
      description: '• Descreva suas principais responsabilidades e conquistas neste cargo.',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Nome da Instituição de Ensino',
      degree: 'Curso / Grau',
      period: '2018 – 2022',
    },
  ],
  skills: 'Ex: Excel, Comunicação, Gestão de Projetos',
  languages: 'Ex: Português (Nativo), Inglês (Intermediário)',
};

export function ResumeBuilder({ onCopyToast }: ToolProps) {
  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('abobi_resume_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved resume', e);
      }
    }
    return INITIAL_RESUME;
  });

  const [activeTab, setActiveTab] = useState<'editar' | 'previsualizar'>('previsualizar');
  const [accentColor, setAccentColor] = useState<'amber' | 'indigo' | 'emerald' | 'purple' | 'classic'>(() => {
    return (localStorage.getItem('abobi_resume_color') as any) || 'amber';
  });
  const [blockedResult, setBlockedResult] = useState<RateLimitCheckResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const getThemeStyles = () => {
    switch (accentColor) {
      case 'amber':
        return {
          titleHighlight: 'bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md font-extrabold border border-amber-300/80 inline-block shadow-xs',
          sectionHeader: 'text-amber-950 border-b-2 border-amber-400 pb-1 mb-2.5 font-extrabold',
          headerBorder: 'border-b-2 border-amber-500',
          companyText: 'text-amber-900 font-bold',
          eduDegree: 'font-bold text-amber-950 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200',
        };
      case 'indigo':
        return {
          titleHighlight: 'bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded-md font-extrabold border border-indigo-300/80 inline-block shadow-xs',
          sectionHeader: 'text-indigo-950 border-b-2 border-indigo-400 pb-1 mb-2.5 font-extrabold',
          headerBorder: 'border-b-2 border-indigo-500',
          companyText: 'text-indigo-900 font-bold',
          eduDegree: 'font-bold text-indigo-950 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200',
        };
      case 'emerald':
        return {
          titleHighlight: 'bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-extrabold border border-emerald-300/80 inline-block shadow-xs',
          sectionHeader: 'text-emerald-950 border-b-2 border-emerald-400 pb-1 mb-2.5 font-extrabold',
          headerBorder: 'border-b-2 border-emerald-500',
          companyText: 'text-emerald-900 font-bold',
          eduDegree: 'font-bold text-emerald-950 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200',
        };
      case 'purple':
        return {
          titleHighlight: 'bg-purple-100 text-purple-950 px-2 py-0.5 rounded-md font-extrabold border border-purple-300/80 inline-block shadow-xs',
          sectionHeader: 'text-purple-950 border-b-2 border-purple-400 pb-1 mb-2.5 font-extrabold',
          headerBorder: 'border-b-2 border-purple-500',
          companyText: 'text-purple-900 font-bold',
          eduDegree: 'font-bold text-purple-950 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200',
        };
      case 'classic':
      default:
        return {
          titleHighlight: 'font-extrabold text-slate-900 border-b-2 border-slate-900 pb-0.5 inline-block',
          sectionHeader: 'text-slate-900 border-b border-slate-300 pb-1 mb-2 font-bold',
          headerBorder: 'border-b-2 border-slate-900',
          companyText: 'text-slate-700 font-semibold',
          eduDegree: 'font-bold text-slate-900',
        };
    }
  };

  const theme = getThemeStyles();

  useEffect(() => {
    localStorage.setItem('abobi_resume_data', JSON.stringify(resume));
  }, [resume]);

  useEffect(() => {
    localStorage.setItem('abobi_resume_color', accentColor);
  }, [accentColor]);

  const handlePrint = () => {
    const rateCheck = checkAndConsumeRateLimit('gerador-curriculo');
    if (!rateCheck.allowed) {
      setBlockedResult(rateCheck);
      onCopyToast('⚠️ Limite de exportações de currículo atingido.');
      return;
    }
    setBlockedResult(null);

    // Switch to preview tab first to ensure the DOM is rendered
    setActiveTab('previsualizar');
    
    // Give browser time to render before triggering native print dialog
    setTimeout(() => {
      window.print();
      onCopyToast('Janela de impressão / Salvar em PDF iniciada!');
    }, 150);
  };

  const handleCopyPlainText = () => {
    let text = `${resume.personalInfo.fullName.toUpperCase()}\n`;
    text += `${resume.personalInfo.title}\n`;
    text += `Contato: ${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}\n`;
    if (resume.personalInfo.linkedin) text += `LinkedIn: ${resume.personalInfo.linkedin}\n`;
    text += `\n----------------------------------------\n`;
    text += `RESUMO PROFISSIONAL\n`;
    text += `${resume.summary}\n\n`;
    text += `----------------------------------------\n`;
    text += `EXPERIÊNCIA PROFISSIONAL\n`;
    resume.experience.forEach((exp) => {
      text += `\n• ${exp.position} - ${exp.company} (${exp.period})\n  ${exp.description}\n`;
    });
    text += `\n----------------------------------------\n`;
    text += `FORMAÇÃO ACADÊMICA\n`;
    resume.education.forEach((edu) => {
      text += `\n• ${edu.degree} - ${edu.institution} (${edu.period})\n`;
    });
    text += `\n----------------------------------------\n`;
    text += `COMPETÊNCIAS & HABILIDADES\n${resume.skills}\n\n`;
    text += `IDIOMAS\n${resume.languages}\n`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    onCopyToast('Currículo copiado em formato texto puro ATS!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleResetSample = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo do currículo?')) {
      setResume(INITIAL_RESUME);
      onCopyToast('Currículo restaurado para os dados de exemplo.');
    }
  };

  const handleAddExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          id: String(Date.now()),
          company: '',
          position: '',
          period: '',
          description: '',
        },
      ],
    });
  };

  const handleRemoveExperience = (id: string) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((e) => e.id !== id),
    });
  };

  const handleAddEducation = () => {
    setResume({
      ...resume,
      education: [
        ...resume.education,
        {
          id: String(Date.now()),
          institution: '',
          degree: '',
          period: '',
        },
      ],
    });
  };

  const handleRemoveEducation = (id: string) => {
    setResume({
      ...resume,
      education: resume.education.filter((e) => e.id !== id),
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <RateLimitGuard
        toolId="gerador-curriculo"
        blockedResult={blockedResult}
        onClearBlock={() => setBlockedResult(null)}
      />

      {/* Navigation Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('editar')}
              className={`px-4 sm:px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'editar'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Formulário de Edição</span>
            </button>
            <button
              onClick={() => setActiveTab('previsualizar')}
              className={`px-4 sm:px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'previsualizar'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Visualizar Folha A4 / PDF</span>
            </button>
          </div>

          {/* Color Highlight Theme Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 px-2">
              Destaque:
            </span>
            <button
              onClick={() => setAccentColor('amber')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${
                accentColor === 'amber'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Destaque Amarelo Dourado"
            >
              <span>🟡 Amarelo</span>
            </button>

            <button
              onClick={() => setAccentColor('indigo')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${
                accentColor === 'indigo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Destaque Azul Índigo"
            >
              <span>🔵 Índigo</span>
            </button>

            <button
              onClick={() => setAccentColor('emerald')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${
                accentColor === 'emerald'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Destaque Verde Esmeralda"
            >
              <span>🟢 Verde</span>
            </button>

            <button
              onClick={() => setAccentColor('purple')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${
                accentColor === 'purple'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Destaque Violeta"
            >
              <span>🟣 Púrpura</span>
            </button>

            <button
              onClick={() => setAccentColor('classic')}
              className={`px-2 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                accentColor === 'classic'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Preto e Branco Tradicional"
            >
              <span>P&B</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyPlainText}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Copiar em formato texto limpo ATS"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Copiado!' : 'Copiar Texto ATS'}</span>
          </button>

          <button
            onClick={handleResetSample}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
            title="Restaurar dados de exemplo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-indigo-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Baixar em PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {activeTab === 'editar' ? (
        /* FORM EDIT TAB */
        <div className="space-y-6 no-print">
          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <User className="w-4 h-4" /> 1. Dados Pessoais & Contato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={resume.personalInfo.fullName}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  Cargo / Título Desejado
                </label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor Frontend Senior"
                  value={resume.personalInfo.title}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, title: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  placeholder="Ex: carlos@exemplo.com"
                  value={resume.personalInfo.email}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, email: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98765-4321"
                  value={resume.personalInfo.phone}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, phone: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  Cidade, Estado
                </label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo, SP"
                  value={resume.personalInfo.location}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, location: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                  LinkedIn
                </label>
                <input
                  type="text"
                  placeholder="Ex: linkedin.com/in/carlossilva"
                  value={resume.personalInfo.linkedin}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, linkedin: e.target.value },
                    })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 2. Resumo Profissional
            </h3>
            <textarea
              rows={3}
              placeholder="Apresentação sucinta com principais conquistas e tecnologias..."
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> 3. Experiência Profissional
              </h3>
              <button
                onClick={handleAddExperience}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Experiência
              </button>
            </div>

            {resume.experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500">Empresa #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 text-xs p-1 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remover</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Empresa (ex: Tech Ltda)"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...resume.experience];
                      updated[idx].company = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Cargo (ex: Desenvolvedor Senior)"
                    value={exp.position}
                    onChange={(e) => {
                      const updated = [...resume.experience];
                      updated[idx].position = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Período (ex: 2022 - Presente)"
                    value={exp.period}
                    onChange={(e) => {
                      const updated = [...resume.experience];
                      updated[idx].period = e.target.value;
                      setResume({ ...resume, experience: updated });
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Resumo das realizações, projetos e tecnologias utilizadas..."
                  value={exp.description}
                  onChange={(e) => {
                    const updated = [...resume.experience];
                    updated[idx].description = e.target.value;
                    setResume({ ...resume, experience: updated });
                  }}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white resize-none"
                />
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> 4. Formação Acadêmica
              </h3>
              <button
                onClick={handleAddEducation}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Curso / Faculdade
              </button>
            </div>

            {resume.education.map((edu, idx) => (
              <div
                key={edu.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-500">Formação #{idx + 1}</span>
                  <button
                    onClick={() => handleRemoveEducation(edu.id)}
                    className="text-red-500 hover:text-red-700 text-xs p-1 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remover</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Instituição (ex: USP)"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].institution = e.target.value;
                      setResume({ ...resume, education: updated });
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Curso / Grau (ex: Ciência da Computação)"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].degree = e.target.value;
                      setResume({ ...resume, education: updated });
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ano / Período (ex: 2018 - 2022)"
                    value={edu.period}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].period = e.target.value;
                      setResume({ ...resume, education: updated });
                    }}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> 5. Competências & Tecnologias
              </h3>
              <textarea
                rows={3}
                placeholder="Ex: React, TypeScript, Node.js, SQL, Gestão de Equipes..."
                value={resume.skills}
                onChange={(e) => setResume({ ...resume, skills: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> 6. Idiomas
              </h3>
              <textarea
                rows={3}
                placeholder="Ex: Português (Nativo), Inglês (Fluente)..."
                value={resume.languages}
                onChange={(e) => setResume({ ...resume, languages: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ATS PRINT PREVIEW SHEET (Real A4 Paper Simulation) */
        <div id="printable-resume-container" className="bg-slate-200 dark:bg-slate-950 p-4 sm:p-10 rounded-2xl overflow-x-auto">
          <div
            id="printable-resume"
            className="w-full max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-14 shadow-2xl rounded-sm space-y-6 font-sans leading-relaxed border border-slate-300"
          >
            {/* Header */}
            <div className={`pb-5 text-center ${theme.headerBorder}`}>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                {resume.personalInfo.fullName || 'SEU NOME COMPLETO'}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest mt-1">
                {resume.personalInfo.title || 'CARGO OU TÍTULO PROFISSIONAL'}
              </p>
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs text-slate-600 mt-3 font-semibold">
                {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
                {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
                {resume.personalInfo.linkedin && <span>• {resume.personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {resume.summary && (
              <div>
                <h2 className={`text-xs uppercase tracking-wider ${theme.sectionHeader}`}>
                  RESUMO PROFISSIONAL
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed font-normal">{resume.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resume.experience.length > 0 && (
              <div>
                <h2 className={`text-xs uppercase tracking-wider ${theme.sectionHeader}`}>
                  EXPERIÊNCIA PROFISSIONAL
                </h2>
                <div className="space-y-4">
                  {resume.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline flex-wrap gap-2 mb-1">
                        <span className={theme.titleHighlight}>{exp.position || 'Cargo'}</span>
                        <span className="text-[11px] font-bold text-slate-600">{exp.period}</span>
                      </div>
                      <span className={`text-xs ${theme.companyText} block mb-1.5`}>
                        {exp.company}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div>
                <h2 className={`text-xs uppercase tracking-wider ${theme.sectionHeader}`}>
                  FORMAÇÃO ACADÊMICA
                </h2>
                <div className="space-y-2.5">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-xs flex-wrap gap-1">
                      <div>
                        <strong className={theme.eduDegree}>{edu.degree}</strong>
                        {edu.institution && <span className="font-medium text-slate-700"> – {edu.institution}</span>}
                      </div>
                      <span className="text-slate-600 text-[11px] font-semibold">{edu.period}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {resume.skills && (
                <div>
                  <h2 className={`text-xs uppercase tracking-wider ${theme.sectionHeader}`}>
                    COMPETÊNCIAS
                  </h2>
                  <p className="text-xs text-slate-800 font-normal">{resume.skills}</p>
                </div>
              )}
              {resume.languages && (
                <div>
                  <h2 className={`text-xs uppercase tracking-wider ${theme.sectionHeader}`}>
                    IDIOMAS
                  </h2>
                  <p className="text-xs text-slate-800 font-normal">{resume.languages}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
