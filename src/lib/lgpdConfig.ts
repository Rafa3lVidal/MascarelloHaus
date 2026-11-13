export interface CookieTableItem {
  id: string;
  name: string;
  provider: string;
  category: 'Necessário' | 'Funcional' | 'Analítico' | 'Marketing' | string;
  purpose: string;
  retention: string;
}

export interface CookieBannerConfig {
  enabled: boolean;
  version: string;
  title: string;
  description: string;
  acceptAllLabel: string;
  rejectOptionalLabel: string;
  customizeLabel: string;
  showFloatingButton: boolean;
  floatingButtonLabel: string;
  consentExpiryMonths: number;
  essentialTitle: string;
  essentialDesc: string;
  functionalTitle: string;
  functionalDesc: string;
  analyticsTitle: string;
  analyticsDesc: string;
  marketingTitle: string;
  marketingDesc: string;
  cookiesTable: CookieTableItem[];
}

export interface RopaRecordItem {
  id: string;
  processName: string;
  area: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string;
  dataSubjects: string;
  thirdParties: string;
  retentionPeriod: string;
  securityMeasures: string;
  status: 'ativo' | 'em_revisao' | 'arquivado';
}

export interface SecurityIncidentItem {
  id: string;
  title: string;
  detectedAt: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'investigando' | 'contido' | 'notificado_anpd' | 'encerrado';
  affectedData: string;
  estimatedSubjects: number;
  anpdNotified: boolean;
  subjectsNotified: boolean;
  containmentActions: string;
  notes: string;
}

export interface LgpdGovernanceConfig {
  dpoName: string;
  dpoEmail: string;
  dpoPhone: string;
  dpoOab: string;
  dpoServiceHours: string;
  responseDeadlineDays: number;
  incidentNotificationHours: number;
  committeeMembers: string;
  ropaReviewCycleDays: number;
  nextReviewDate: string;
  ropaRecords: RopaRecordItem[];
  incidents: SecurityIncidentItem[];
}

export interface LegalDocConfig {
  title: string;
  subtitle: string;
  version: string;
  updatedAt: string;
  customHtml: string;
}

export interface LegalDocumentsConfig {
  privacyPolicy: LegalDocConfig;
  termsOfUse: LegalDocConfig;
}

export const DEFAULT_COOKIE_BANNER_CONFIG: CookieBannerConfig = {
  enabled: true,
  version: '2.0',
  title: 'Privacidade e Gestão de Cookies',
  description:
    'O escritório Mascârello Haus Advocacia utiliza cookies estritamente necessários para o funcionamento e segurança do site. Com o seu consentimento livre e informado, também poderemos utilizar cookies analíticos e funcionais para compreender a interação dos usuários e aprimorar nossos serviços digitais, em observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e ao Guia de Cookies da ANPD.',
  acceptAllLabel: 'Aceitar Todos',
  rejectOptionalLabel: 'Apenas Essenciais',
  customizeLabel: 'Personalizar',
  showFloatingButton: true,
  floatingButtonLabel: 'Cookies',
  consentExpiryMonths: 12,
  essentialTitle: 'Cookies Estritamente Necessários',
  essentialDesc:
    'Indispensáveis para segurança cibernética, proteção contra fraudes, roteamento de sessão e registro das suas preferências de privacidade. Não podem ser desativados.',
  functionalTitle: 'Cookies Funcionais e de Preferências',
  functionalDesc:
    'Permitem salvar rascunhos locais de formulários e recursos interativos como mapas de localização dos escritórios.',
  analyticsTitle: 'Cookies Analíticos e de Desempenho',
  analyticsDesc:
    'Ajudam a entender como os visitantes navegam pelo portal de forma agregada e com endereço IP anonimizado.',
  marketingTitle: 'Cookies de Marketing e Campanhas',
  marketingDesc:
    'Utilizados apenas mediante autorização expressa para mensurar o alcance de materiais informativos e campanhas institucionais.',
  cookiesTable: [
    {
      id: 'ck-1',
      name: 'lgpd_cookie_preferences',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Necessário',
      purpose: 'Armazena a escolha de consentimento e as preferências granulares de cookies do titular (Art. 8º LGPD).',
      retention: '12 meses',
    },
    {
      id: 'ck-2',
      name: 'lgpd_cookie_consent',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Necessário',
      purpose: 'Registro simplificado do estado de consentimento do usuário para controle de exibição do banner.',
      retention: '12 meses',
    },
    {
      id: 'ck-3',
      name: 'mh_sec_seed',
      provider: 'Mascârello Haus (sessionStorage)',
      category: 'Necessário',
      purpose: 'Semente criptográfica efêmera (SHA-256) gerada por sessão para cálculo de hash anônimo anti-abuso sem armazenar o IP real do visitante.',
      retention: 'Sessão',
    },
    {
      id: 'ck-4',
      name: 'mh_rl_contato, mh_rl_lgpd_central, mh_rl_canal_denuncias, mh_rl_questionario_conformidade',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Necessário',
      purpose: 'Controle de limite de requisições (Rate Limiting) e prevenção contra ataques automatizados ou spam nos formulários.',
      retention: '10 a 15 min',
    },
    {
      id: 'ck-5',
      name: 'sb-*-auth-token',
      provider: 'Provedor de Autenticação (localStorage / Cookie)',
      category: 'Necessário',
      purpose: 'Autenticação e manutenção de sessão criptografada exclusivamente para acesso restrito ao painel administrativo.',
      retention: 'Sessão admin',
    },
    {
      id: 'ck-6',
      name: '_vercel_jwt, __vercel_live_token',
      provider: 'Vercel Inc. (HTTP Cookie)',
      category: 'Necessário',
      purpose: 'Balanceamento de carga, roteamento seguro na borda (Edge Network) e mitigação contra ataques DDoS.',
      retention: 'Sessão',
    },
    {
      id: 'ck-7',
      name: 'mh_draft_questionario_conformidade_v2, mh_form_state_questionario_conformidade_v2',
      provider: 'Mascârello Haus (sessionStorage / localStorage)',
      category: 'Funcional',
      purpose: 'Preserva o progresso e rascunho das 6 etapas do Questionário de Conformidade para Fornecedores.',
      retention: 'Sessão / 7 dias',
    },
    {
      id: 'ck-8',
      name: 'mh_draft_central_lgpd',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Funcional',
      purpose: 'Preserva temporariamente no navegador do próprio usuário o rascunho da Requisição de Direitos do Titular (Art. 18 LGPD).',
      retention: 'Até o envio',
    },
    {
      id: 'ck-9',
      name: 'mh_draft_canal_denuncias',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Funcional',
      purpose: 'Armazena localmente o relato em andamento no Canal de Denúncias somente quando o usuário ativa a opção.',
      retention: '7 dias / envio',
    },
    {
      id: 'ck-10',
      name: 'NID, CONSENT (Google Maps Embed)',
      provider: 'Google LLC (Terceiro — Contato)',
      category: 'Funcional',
      purpose: 'Carregamento e exibição interativa dos mapas de localização dos escritórios de Videira/SC e Caçador/SC.',
      retention: '6 meses',
    },
    {
      id: 'ck-11',
      name: '_ga',
      provider: 'Google Analytics (IP anonimizado)',
      category: 'Analítico',
      purpose: 'Distinção estatística de visitantes anônimos para compilação de relatórios agregados de audiência (mediante consentimento).',
      retention: '2 anos',
    },
    {
      id: 'ck-12',
      name: '_ga_*',
      provider: 'Google Analytics (IP anonimizado)',
      category: 'Analítico',
      purpose: 'Persistência desidentificada do estado de sessão para métricas agregadas de navegação (mediante consentimento).',
      retention: '2 anos',
    },
  ],
};

export const DEFAULT_LGPD_GOVERNANCE_CONFIG: LgpdGovernanceConfig = {
  dpoName: 'Mirataira Haus',
  dpoEmail: 'privacidade@mascarellohaus.adv.br',
  dpoPhone: '+55 (49) 98822-0982',
  dpoOab: 'OAB/SC',
  dpoServiceHours: 'Segunda a Sexta, 08h30 às 18h00',
  responseDeadlineDays: 15,
  incidentNotificationHours: 72,
  committeeMembers: 'Mirataira Haus (DPO), Sócios Administradores e Tecnologia da Informação',
  ropaReviewCycleDays: 180,
  nextReviewDate: '2027-05-01',
  ropaRecords: [
    {
      id: 'ropa-1',
      processName: 'Atendimento Jurídico e Contratos',
      area: 'Advocacia & Consultoria',
      purpose: 'Elaboração de contratos, pareceres, defesa judicial e atendimento ao cliente.',
      legalBasis: 'Execução de contrato e exercício regular de direitos (Art. 7º, V e VI)',
      dataCategories: 'Nome, CPF/CNPJ, endereço, e-mail, telefone e documentos processuais',
      dataSubjects: 'Clientes, representantes legais e partes envolvidas',
      thirdParties: 'Poder Judiciário, órgãos públicos e peritos vinculados',
      retentionPeriod: '5 anos após encerramento + prazos prescricionais legais',
      securityMeasures: 'Controle de acesso restrito, criptografia em trânsito e backup seguro',
      status: 'ativo',
    },
    {
      id: 'ropa-2',
      processName: 'Central de Proteção de Dados (Art. 18)',
      area: 'Encarregado (DPO)',
      purpose: 'Receber, validar identidade e responder requisições de titulares de dados.',
      legalBasis: 'Cumprimento de obrigação legal ou regulatória (Art. 7º, II)',
      dataCategories: 'Nome, canal de contato, descrição da solicitação e documentos comprobatórios',
      dataSubjects: 'Titulares de dados e representantes legais',
      thirdParties: 'Sem compartilhamento externo (uso exclusivo do DPO)',
      retentionPeriod: '5 anos para comprovação de atendimento perante a ANPD',
      securityMeasures: 'Acesso exclusivo do DPO/Admin, protocolo único e trilha de auditoria',
      status: 'ativo',
    },
    {
      id: 'ropa-3',
      processName: 'Canal de Denúncias e Compliance',
      area: 'Compliance & Integridade',
      purpose: 'Apuração sigilosa de relatos éticos, condutas irregulares e conformidade.',
      legalBasis: 'Cumprimento de obrigação legal e legítimo interesse (Art. 7º, II e IX)',
      dataCategories: 'Relato descritivo, evidências anexadas e contato opcional (quando identificado)',
      dataSubjects: 'Colaboradores, fornecedores, clientes e denunciantes',
      thirdParties: 'Comitê de Ética / Auditoria independente sob sigilo',
      retentionPeriod: '5 anos após conclusão da apuração',
      securityMeasures: 'Anonimização opcional, acesso restrito e armazenamento criptografado',
      status: 'ativo',
    },
    {
      id: 'ropa-4',
      processName: 'Avaliação de Conformidade de Fornecedores',
      area: 'Governança LGPD',
      purpose: 'Diagnóstico de maturidade LGPD de terceiros e operadores de dados.',
      legalBasis: 'Execução de contrato / diligência prévia e legítimo interesse (Art. 7º, V e IX)',
      dataCategories: 'Razão social, CNPJ, responsável técnico, evidências políticas e pontuação',
      dataSubjects: 'Representantes de empresas parceiras e fornecedores',
      thirdParties: 'Sem compartilhamento com terceiros',
      retentionPeriod: 'Vigência da relação contratual + 5 anos',
      securityMeasures: 'Controle de acesso autenticado com 2FA e registro de auditoria',
      status: 'ativo',
    },
  ],
  incidents: [],
};

export const DEFAULT_LEGAL_DOCUMENTS_CONFIG: LegalDocumentsConfig = {
  privacyPolicy: {
    title: 'Aviso de Privacidade & Tratamento de Dados',
    subtitle: 'Transparência & Conformidade Regulatória',
    version: '2.1',
    updatedAt: '2026-10-22',
    customHtml: '',
  },
  termsOfUse: {
    title: 'Termos de Uso do Site Mascârello Haus',
    subtitle: 'Termos Gerais e Condições de Uso',
    version: '1.0',
    updatedAt: '2026-10-22',
    customHtml: '',
  },
};

export const DEFAULT_PRIVACY_TEMPLATE_HTML = `<h3>1. Compromisso com a sua Privacidade</h3>
<p>A <strong>Mascârello Haus Advocacia e Consultoria</strong> valoriza a confiança de seus clientes, parceiros, colaboradores e visitantes. Por isso, estruturou suas rotinas operacionais e técnicas sob os mais rigorosos padrões de segurança da informação e governança em proteção de dados pessoais.</p>

<h3>2. Princípios Orientadores (Art. 6º da LGPD)</h3>
<ul>
  <li><strong>Finalidade e Adequação:</strong> Coleta compatível exclusivamente com propósitos legítimos e específicos informados ao titular.</li>
  <li><strong>Necessidade (Minimização):</strong> Limitação do tratamento ao mínimo necessário para a realização das finalidades contratadas ou legais.</li>
  <li><strong>Transparência e Livre Acesso:</strong> Informações claras e acessíveis sobre os critérios e agentes de tratamento.</li>
  <li><strong>Segurança e Prevenção:</strong> Adoção de medidas técnicas e administrativas para proteção contra acessos não autorizados e incidentes.</li>
</ul>

<h3>3. Bases Legais e Finalidades de Coleta</h3>
<p>Os dados tratados por meio deste website apoiam-se nas bases legais do <strong>cumprimento de obrigação legal e regulatória (Art. 7º, II)</strong>, <strong>execução de contratos ou procedimentos preliminares (Art. 7º, V)</strong>, <strong>exercício regular de direitos (Art. 7º, VI)</strong> e <strong>legítimo interesse (Art. 7º, IX)</strong>.</p>

<h3>4. Direitos dos Titulares e Canal com o DPO</h3>
<p>Você pode exercer a qualquer momento os direitos previstos no Art. 18 da LGPD (confirmação, acesso, correção, eliminação, portabilidade e revogação de consentimento) diretamente na nossa Central de Proteção de Dados ou pelo e-mail institucional do Encarregado (DPO): <strong>privacidade@mascarellohaus.adv.br</strong>.</p>`;

export const DEFAULT_TERMS_TEMPLATE_HTML = `<p>O presente termo regula o acesso e as condições de uso do portal institucional <strong>Mascârello Haus Advocacia</strong>, estabelecendo os direitos e obrigações dos usuários.</p>

<h3>1. Quem Somos</h3>
<p>Somos um escritório dedicado à advocacia estratégica, compliance, governança corporativa e proteção de dados pessoais, atuando com ética, sigilo profissional e observância estrita ao Estatuto da Advocacia e à LGPD.</p>

<h3>2. Utilização do Site e Propriedade Intelectual</h3>
<p>Todo o conteúdo informativo, artigos, cartilhas e identidade visual publicados neste portal têm caráter exclusivamente institucional e educativo, não configurando consultoria jurídica individualizada nem relação advogado-cliente automática.</p>

<h3>3. Responsabilidades do Usuário</h3>
<p>O usuário compromete-se a fornecer informações verdadeiras nos formulários de contato, Central LGPD e Canal de Denúncias, sendo vedado o uso do portal para fins ilícitos ou envio de códigos maliciosos.</p>

<h3>4. Atualizações e Foro</h3>
<p>Estes Termos poderão ser atualizados periodicamente para adequação regulatória, permanecendo eleito o foro da Comarca de Videira/SC para dirimir eventuais controvérsias.</p>`;
