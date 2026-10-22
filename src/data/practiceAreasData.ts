export interface PracticeAreaItem {
  title: string;
  iconName: 'ShieldCheck' | 'Briefcase' | 'FileCheck' | 'Scale' | 'Leaf' | 'Lock' | 'Laptop' | 'FileText' | 'AlertTriangle' | 'Store' | 'Award' | 'Users' | 'Building2' | 'FolderKanban';
}

export interface PracticeArea {
  slug: string;
  title: string;
  badge: string;
  intro: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: PracticeAreaItem[];
  extraSection?: {
    badge?: string;
    title: string;
    description: string;
    ctaText?: string;
    ctaLink?: string;
  };
  seo_description: string;
}

export const PRACTICE_AREAS_DATA: PracticeArea[] = [
  {
    slug: 'compliance',
    title: 'Compliance',
    badge: 'Área de Atuação',
    intro: 'Compliance refere-se à conformidade e aderência de uma organização às leis, regulamentos e normas aplicáveis ao seu setor, buscando a integridade operacional, ética nos negócios e prevenção de riscos legais e reputacionais.',
    sectionTitle: 'O que é, e como atuamos',
    sectionSubtitle: 'Compliance significa estar em conformidade com as normas aplicáveis ao negócio. Mascarello Haus promove a avaliação e o diagnóstico do ambiente de negócios. Bem como, o sistema regulatório que envolve a atividade da empresa e, especialmente, relações com a Administração Pública e terceiros, a fim de estruturar um programa de compliance efetivo.',
    items: [
      { title: 'Compliance & Ética Corporativa', iconName: 'FileCheck' },
      { title: 'Integridade & Anticorrupção', iconName: 'ShieldCheck' },
      { title: 'Direito Concorrencial', iconName: 'Scale' },
      { title: 'Ambiental, Social e Governança (ESG)', iconName: 'Leaf' },
      { title: 'Proteção de dados', iconName: 'Lock' }
    ],
    seo_description: 'Compliance e integridade corporativa: assessoria jurídica para implementação de programas de conformidade, ética nos negócios e gestão de riscos.'
  },
  {
    slug: 'direito-digital-e-tecnologia',
    title: 'Direito Digital e tecnologia',
    badge: 'Área de Atuação',
    intro: 'Mascarello Haus contempla tanto a atuação contenciosa quanto consultiva, desta área cada vez mais demandada na era da informação, por meio de conjunto de normas, aplicações, conhecimentos e regulação das relações jurídicas realizadas no meio digital.',
    sectionTitle: 'Atividades associadas',
    items: [
      { title: 'Análise, revisão e elaboração de contratos', iconName: 'FileText' },
      { title: 'Políticas e termos de uso', iconName: 'FileCheck' },
      { title: 'Crimes digitais', iconName: 'AlertTriangle' },
      { title: 'Acordos estratégicos entre empresas de tecnologia', iconName: 'Laptop' },
      { title: 'Revisão de procedimentos em sites de comércio eletrônico', iconName: 'Store' },
      { title: 'Pesquisas e pareceres a respeito de questões envolvendo responsabilidade civil', iconName: 'Scale' }
    ],
    seo_description: 'Direito Digital e Tecnologia: assessoria contenciosa e consultiva para empresas na era da informação, contratos digitais, e-commerce e crimes virtuais.'
  },
  {
    slug: 'protecao-de-dados-lgpd',
    title: 'Proteção de Dados (LGPD)',
    badge: 'Área de Atuação',
    intro: 'Nossa atuação se dá por meio dos modelos de mentoria, consultoria e assessoria na área de interesse do cliente, os quais facilitam a adequação personalizada, auxiliando empresas na proteção e conformidade com as normas legais relacionadas à proteção de dados e privacidade.',
    sectionTitle: 'Conheça as nossas soluções',
    items: [
      { title: 'Capacitações in company', iconName: 'Users' },
      { title: 'Diagnósticos e Auditoria', iconName: 'FileCheck' },
      { title: 'Atuação regulamentar', iconName: 'Scale' },
      { title: 'DPO as a service (Encarregado de dados terceirizado)', iconName: 'ShieldCheck' },
      { title: 'Projeto de Adequação em módulos ou completa à LGPD', iconName: 'FolderKanban' }
    ],
    extraSection: {
      badge: 'Plataforma Especializada',
      title: 'Personal Data Safe',
      description: 'Conheça a nossa plataforma completa e feita para te manter atualizado de forma descomplicada sobre Proteção de Dados e LGPD. Dados pessoais seus, da sua empresa e de seus colaboradores ficam muito mais seguros quando você se mantém informado.',
      ctaText: 'Acesse agora',
      ctaLink: 'https://personaldatasafe.com.br'
    },
    seo_description: 'Adequação completa e modular à LGPD, consultoria em privacidade de dados, DPO as a Service e diagnósticos de conformidade.'
  },
  {
    slug: 'direito-do-trabalho',
    title: 'Direito do Trabalho',
    badge: 'Área de Atuação',
    intro: 'Atuamos na gestão preventiva para gerenciamento de riscos e passivos trabalhistas, pois possuimos expertise em contratos trabalhistas e liquidações de sentença e cálculos de liquidação trabalhista. Também atuamos em questões que afetam o cotidiano das empresas, tanto no âmbito individual como coletivo.',
    sectionTitle: 'Atividades associadas',
    items: [
      { title: 'Compliance Trabalhista', iconName: 'ShieldCheck' },
      { title: 'Consultoria jurídica', iconName: 'Briefcase' },
      { title: 'Auditoria Trabalhista', iconName: 'FileCheck' },
      { title: 'Plano de Cargos e Salários', iconName: 'Award' },
      { title: 'Banco de Horas', iconName: 'FileText' },
      { title: 'Código de Conduta', iconName: 'FileCheck' },
      { title: 'Regulamento Interno', iconName: 'Building2' },
      { title: 'Treinamentos Corporativos', iconName: 'Users' }
    ],
    seo_description: 'Direito do Trabalho Empresarial: gestão preventiva de passivos trabalhistas, auditoria, compliance e assessoria em negociações coletivas.'
  },
  {
    slug: 'direito-previdenciario',
    title: 'Direito Previdenciário',
    badge: 'Área de Atuação',
    intro: 'Contamos com equipe e parceiros especializados no Planejamento e Assessoria de aposentadoria e benefícios junto ao INSS, com foco em informações cruciais para os segurados do INSS que almejam o melhor desfecho para os seus benefícios.',
    sectionTitle: 'Atividades associadas',
    sectionSubtitle: 'Com equipe profissional e especializada, estamos a disposição para atender todas as suas necessidades. Cuidamos de cada cliente de forma única!',
    items: [
      { title: 'Plano de aposentadoria', iconName: 'Award' },
      { title: 'Benefícios junto ao INSS', iconName: 'ShieldCheck' }
    ],
    seo_description: 'Direito Previdenciário: planejamento de aposentadoria, cálculos e assessoria especializada para obtenção do melhor benefício junto ao INSS.'
  },
  {
    slug: 'direito-civil-e-empresarial',
    title: 'Direito Civil e Empresarial',
    badge: 'Área de Atuação',
    intro: 'Prestamos serviços na proteção e defesa dos interesses das pessoas e organizações, em caráter preventivo e contencioso, nos ramos do Direito Civil e Empresarial. Nosso foco é apoiar as empresas em todas as rotinas relacionadas ao direito empresarial, e ao longo de todo o seu ciclo de vida, para reduzir sua exposição a riscos, garantir sua conformidade e impulsionar negócios.',
    sectionTitle: 'Atividades associadas',
    sectionSubtitle: 'A advocacia cível e empresarial são áreas do direito que oferecem uma ampla gama de serviços para empresas de todos os tamanhos.',
    items: [
      { title: 'Consultoria jurídica', iconName: 'Briefcase' },
      { title: 'Negociações e demandas judiciais', iconName: 'Scale' },
      { title: 'Contratos sociais', iconName: 'Building2' },
      { title: 'Contratos de compra e venda', iconName: 'FileText' },
      { title: 'Memorandos de entendimento', iconName: 'FileCheck' }
    ],
    seo_description: 'Direito Civil e Empresarial: assessoria preventiva e contenciosa, elaboração contratual, estruturação societária e negociações estratégicas.'
  }
];
