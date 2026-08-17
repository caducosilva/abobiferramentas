export type ToolCategory =
  | 'todos'
  | 'populares'
  | 'geradores'
  | 'validadores'
  | 'texto'
  | 'desenvolvimento'
  | 'imagem'
  | 'matematica'
  | 'android'
  | 'transportes'
  | 'financas'
  | 'privacidade';

export interface Tool {
  id: string;
  /** URL-friendly slug used for deep-linking (pushState) and SEO, e.g. 'gerador-de-cpf' */
  slug: string;
  /** Old URL paths that should still resolve to this tool on load */
  aliases?: string[];
  name: string;
  description: string;
  category: ToolCategory;
  secondaryCategory?: ToolCategory;
  icon?: string; // Lucide icon name
  badge?: string;
  color: {
    bgLight: string;
    textLight: string;
    borderLight?: string;
    darkBg?: string;
    accent: string;
  };
  isPopular?: boolean;
  isNew?: boolean;
  keywords: string[];
}

export interface MogiBusDaySchedule {
  ida: string[];
  volta: string[];
}

export interface MogiBusLine {
  code: string;
  name: string;
  pontoA: string;
  pontoB: string;
  sentido: string;
  diasAtendidos: string;
  empresa: string;
  weekdays: MogiBusDaySchedule;
  saturdays: MogiBusDaySchedule;
  sundays: MogiBusDaySchedule;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    period: string;
  }>;
  skills: string;
  languages: string;
}
