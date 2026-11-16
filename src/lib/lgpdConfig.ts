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
  hasSensitiveData?: boolean;
  involvesMinors?: boolean;
  dataSubjects: string;
  thirdParties: string;
  internationalTransfer?: string;
  retentionPeriod: string;
  retentionDays?: number;
  securityMeasures: string;
  status: 'ativo' | 'em_revisao' | 'arquivado';
}

export interface RipdRecordItem {
  id: string;
  title: string;
  ropaProcessName: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  processingDescription: string;
  necessityAndProportionality: string;
  identifiedRisks: string;
  probability: 'baixa' | 'media' | 'alta';
  impact: 'baixo' | 'medio' | 'alto' | 'critico';
  mitigationMeasures: string;
  dpoOpinion: string;
  status: 'vigente' | 'em_elaboracao' | 'revisao';
}

export interface LiaRecordItem {
  id: string;
  processName: string;
  createdAt: string;
  legitimatePurpose: string;
  necessityTest: string;
  balancingTest: string;
  safeguardsAndOptOut: string;
  conclusion: 'aprovado' | 'aprovado_com_ressalvas' | 'reprovado';
}

export interface DataProcessorItem {
  id: string;
  name: string;
  cnpjOrId: string;
  role: 'operador' | 'suboperador' | 'controlador_conjunto';
  serviceProvided: string;
  dataCategoriesShared: string;
  country: string;
  isInternationalTransfer: boolean;
  transferMechanism:
    | 'nacional'
    | 'clausulas_padrao_anpd'
    | 'pais_adequado'
    | 'consentimento_especifico'
    | 'execucao_contrato';
  securityCertifications: string;
  dpaSigned: boolean;
  lastAuditDate: string;
  status: 'ativo' | 'homologacao' | 'suspenso';
}

export interface SecurityIncidentItem {
  id: string;
  title: string;
  detectedAt: string;
  knowledgeAt?: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'investigando' | 'contido' | 'notificado_anpd' | 'encerrado';
  cidDimensions?: string[];
  affectedData: string;
  estimatedSubjects: number;
  anpdNotified: boolean;
  anpdProtocol?: string;
  subjectsNotified: boolean;
  delayJustification?: string;
  containmentActions: string;
  notes: string;
}

export interface LgpdGovernanceConfig {
  dpoName: string;
  dpoEmail: string;
  dpoPhone: string;
  dpoOab: string;
  dpoServiceHours: string;
  substituteDpoName: string;
  substituteDpoEmail: string;
  substituteDpoPhone: string;
  substituteDpoOab: string;
  responseDeadlineDays: number;
  incidentNotificationHours: number;
  incidentBusinessDaysAnpd: number;
  committeeMembers: string;
  ropaReviewCycleDays: number;
  nextReviewDate: string;
  childrenDataPolicy: string;
  internationalTransferPolicy: string;
  retentionContactMonths: number;
  retentionLogsMonths: number;
  ropaRecords: RopaRecordItem[];
  ripdRecords: RipdRecordItem[];
  liaRecords: LiaRecordItem[];
  processors: DataProcessorItem[];
  incidents: SecurityIncidentItem[];
}

export interface LegalDocVersionItem {
  id: string;
  docType: 'privacyPolicy' | 'termsOfUse';
  version: string;
  updatedAt: string;
  publishedBy?: string;
  changelog: string;
  customHtml: string;
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
  versionHistory?: LegalDocVersionItem[];
}

export interface PublicProtocolIndexItem {
  protocol: string;
  channel: 'lgpd' | 'denuncia';
  verifyHash?: string;
  requestType?: string;
  status: string;
  legalDeadline?: string;
  resolutionDetails?: string;
  identityVerified?: boolean;
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export const DEFAULT_COOKIE_BANNER_CONFIG: CookieBannerConfig = {
  enabled: true,
  version: '2.1',
  title: 'Privacidade e Gestão de Cookies',
  description:
    'O escritório Mascârello Haus Advocacia utiliza cookies estritamente necessários para o funcionamento e segurança do site. Com o seu consentimento livre, informado e inequívoco, também poderemos utilizar cookies analíticos e funcionais para compreender a interação dos usuários e aprimorar nossos serviços digitais, em observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e ao Guia de Cookies da ANPD.',
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
    'Permitem salvar rascunhos locais de formulários e carregar recursos interativos externos como mapas de localização dos escritórios.',
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
      purpose: 'Armazena a escolha de consentimento, versão da política e preferências granulares do titular (Art. 8º LGPD).',
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
      purpose: 'Preserva o progresso e rascunho das 6 etapas do Questionário de Conformidade para Fornecedores (somente se cookies funcionais ativos).',
      retention: 'Sessão / 7 dias',
    },
    {
      id: 'ck-8',
      name: 'mh_draft_central_lgpd',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Funcional',
      purpose: 'Preserva temporariamente no navegador do próprio usuário o rascunho da Requisição de Direitos do Titular (somente se cookies funcionais ativos).',
      retention: 'Até o envio',
    },
    {
      id: 'ck-9',
      name: 'mh_draft_canal_denuncias',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Funcional',
      purpose: 'Armazena localmente o relato em andamento no Canal de Denúncias somente quando os cookies funcionais estão habilitados.',
      retention: '7 dias / envio',
    },
    {
      id: 'ck-10',
      name: 'NID, CONSENT (Google Maps Embed)',
      provider: 'Google LLC (Terceiro — Contato)',
      category: 'Funcional',
      purpose: 'Carregamento e exibição interativa dos mapas de localização do escritório de Videira/SC (bloqueado preventivamente até aceite funcional ou clique expresso).',
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
  dpoOab: 'OAB/SC — Encarregada Titular',
  dpoServiceHours: 'Segunda a Sexta, 08h30 às 12h00 e 13h30 às 18h00',
  substituteDpoName: 'Comitê de Privacidade e Compliance Mascârello Haus',
  substituteDpoEmail: 'dpo@mascarellohaus.com.br',
  substituteDpoPhone: '+55 (49) 3566-0066',
  substituteDpoOab: 'Encarregado Substituto (Res. CD/ANPD nº 18/2024)',
  responseDeadlineDays: 15,
  incidentNotificationHours: 72,
  incidentBusinessDaysAnpd: 3,
  committeeMembers: 'Mirataira Haus (DPO Titular), Encarregado Substituto, Sócios Administradores e Segurança da Informação (ApexCode)',
  ropaReviewCycleDays: 180,
  nextReviewDate: '2027-05-01',
  childrenDataPolicy:
    'Este portal institucional é destinado a maiores de 18 anos. Na hipótese excepcional de tratamento de dados pessoais de crianças ou adolescentes no âmbito de processos judiciais, previdenciários ou cíveis (Art. 14 da LGPD), o tratamento é realizado estritamente no melhor interesse do menor e mediante consentimento específico e em destaque dado por pelo menos um dos pais ou pelo representante legal.',
  internationalTransferPolicy:
    'Para viabilizar a hospedagem em nuvem de alta disponibilidade, banco de dados criptografado e proteção contra ataques cibernéticos (Art. 46), determinados dados podem ser processados em servidores de operadores subcontratados localizados no exterior (Estados Unidos / União Europeia), em estrita observância aos Arts. 33 a 36 da LGPD e à Resolução CD/ANPD nº 19/2024, mediante Cláusulas-Padrão Contratuais e certificações internacionais ISO/IEC 27001 e SOC 2 Type II.',
  retentionContactMonths: 24,
  retentionLogsMonths: 60,
  ropaRecords: [
    {
      id: 'ropa-1',
      processName: 'Atendimento Jurídico, Consultivo e Contencioso',
      area: 'Advocacia & Consultoria',
      purpose: 'Elaboração de contratos, pareceres, defesa judicial/administrativa e atendimento ao cliente.',
      legalBasis: 'Execução de contrato e exercício regular de direitos (Art. 7º, V e VI; Art. 11, II, d)',
      dataCategories: 'Nome, CPF/CNPJ, endereço, e-mail, telefone e documentos processuais',
      hasSensitiveData: true,
      involvesMinors: false,
      dataSubjects: 'Clientes, representantes legais e partes envolvidas',
      thirdParties: 'Poder Judiciário, órgãos públicos e peritos vinculados',
      internationalTransfer: 'Armazenamento criptografado em nuvem (Cláusulas-Padrão ANPD)',
      retentionPeriod: '5 anos após encerramento + prazos prescricionais legais (Art. 16, I)',
      retentionDays: 1825,
      securityMeasures: 'Controle de acesso restrito (RBAC), 2FA, criptografia TLS 1.3/AES-256 e backup seguro',
      status: 'ativo',
    },
    {
      id: 'ropa-2',
      processName: 'Central de Proteção de Dados (Art. 18 e Art. 20)',
      area: 'Encarregado (DPO)',
      purpose: 'Receber, validar identidade e atender requisições de direitos dos titulares e revisão de decisões automatizadas.',
      legalBasis: 'Cumprimento de obrigação legal ou regulatória (Art. 7º, II)',
      dataCategories: 'Nome, canal de contato, descrição da solicitação e documentos comprobatórios',
      hasSensitiveData: false,
      involvesMinors: false,
      dataSubjects: 'Titulares de dados e representantes legais',
      thirdParties: 'Sem compartilhamento externo (acesso restrito ao DPO)',
      internationalTransfer: 'Infraestrutura de banco de dados criptografado (Supabase Inc.)',
      retentionPeriod: '5 anos para comprovação de atendimento perante a ANPD',
      retentionDays: 1825,
      securityMeasures: 'Acesso exclusivo do DPO/Admin, URLs assinadas temporárias, protocolo único e trilha de auditoria',
      status: 'ativo',
    },
    {
      id: 'ropa-3',
      processName: 'Canal de Denúncias, Ouvidoria e Compliance',
      area: 'Compliance & Integridade',
      purpose: 'Apuração sigilosa de relatos éticos, condutas irregulares e conformidade corporativa.',
      legalBasis: 'Cumprimento de obrigação legal e legítimo interesse (Art. 7º, II e IX)',
      dataCategories: 'Relato descritivo, evidências anexadas e contato opcional (quando identificado)',
      hasSensitiveData: true,
      involvesMinors: false,
      dataSubjects: 'Colaboradores, fornecedores, clientes e denunciantes',
      thirdParties: 'Comitê de Ética / Auditoria independente sob sigilo',
      internationalTransfer: 'Infraestrutura de nuvem com criptografia em repouso (AES-256)',
      retentionPeriod: '5 anos após conclusão da apuração',
      retentionDays: 1825,
      securityMeasures: 'Anonimização nativa, hash SHA-256 sem coleta de IP real, bucket privado com URL assinada',
      status: 'ativo',
    },
    {
      id: 'ropa-4',
      processName: 'Avaliação de Conformidade LGPD de Fornecedores',
      area: 'Governança LGPD',
      purpose: 'Diagnóstico de maturidade LGPD de terceiros e operadores de dados com cálculo automatizado de índice.',
      legalBasis: 'Execução de procedimentos preliminares a contrato e legítimo interesse (Art. 7º, V e IX)',
      dataCategories: 'Razão social, CNPJ, responsável técnico, e-mail, evidências documentais e pontuação',
      hasSensitiveData: false,
      involvesMinors: false,
      dataSubjects: 'Representantes legais e DPOs de empresas fornecedoras',
      thirdParties: 'Sem compartilhamento com terceiros',
      internationalTransfer: 'Infraestrutura de nuvem com criptografia em repouso',
      retentionPeriod: 'Vigência da relação comercial + 5 anos',
      retentionDays: 1825,
      securityMeasures: 'Controle de acesso autenticado com 2FA, direito à revisão humana (Art. 20) e auditoria',
      status: 'ativo',
    },
    {
      id: 'ropa-5',
      processName: 'Atendimento via Formulário de Contato Institucional',
      area: 'Relacionamento & Atendimento',
      purpose: 'Responder dúvidas jurídicas, agendar consultas e prestar atendimento inicial solicitado pelo visitante.',
      legalBasis: 'Consentimento e procedimentos preliminares relacionados a contrato (Art. 7º, I e V)',
      dataCategories: 'Nome completo, e-mail, telefone/WhatsApp, assunto, mensagem e anexos opcionais',
      hasSensitiveData: false,
      involvesMinors: false,
      dataSubjects: 'Visitantes do site, potenciais clientes e parceiros',
      thirdParties: 'Sem compartilhamento externo',
      internationalTransfer: 'Infraestrutura de nuvem segura (Supabase / Vercel)',
      retentionPeriod: '24 meses após o encerramento do contato inicial (salvo contratação)',
      retentionDays: 730,
      securityMeasures: 'Sanitização anti-XSS, verificação binária de anexos, protocolo e expurgo programado',
      status: 'ativo',
    },
  ],
  ripdRecords: [
    {
      id: 'ripd-1',
      title: 'RIPD 001/2026 — Canal de Denúncias e Apuração de Integridade',
      ropaProcessName: 'Canal de Denúncias, Ouvidoria e Compliance',
      version: '1.0',
      createdAt: '2026-10-22',
      updatedAt: '2026-11-16',
      processingDescription:
        'Operação de recebimento e apuração de relatos de violação ética, assédio, fraude ou descumprimento normativo através do portal web, com opção de relato 100% anônimo ou identificado sob sigilo.',
      necessityAndProportionality:
        'Os dados coletados limitam-se ao estritamente necessário para viabilizar a investigação interna de compliance (Art. 6º, III). O denunciante possui opção padrão de anonimato e o endereço IP real nunca é armazenado.',
      identifiedRisks:
        'Risco de acesso não autorizado a relatos sensíveis ou retaliação contra manifestantes caso ocorresse quebra de confidencialidade.',
      probability: 'baixa',
      impact: 'alto',
      mitigationMeasures:
        '1) Anonimização por padrão na interface; 2) Substituição de IP por hash efêmero SHA-256; 3) Armazenamento de anexos em bucket privado restrito por RLS e URLs assinadas temporárias; 4) Acesso restrito com MFA/2FA e trilha de auditoria imutável.',
      dpoOpinion:
        'Parecer Favorável: As salvaguardas técnicas e administrativas implementadas mitigam os riscos a nível residual aceitável, atendendo aos Arts. 6º, 38 e 46 da LGPD.',
      status: 'vigente',
    },
    {
      id: 'ripd-2',
      title: 'RIPD 002/2026 — Central do Titular e Homologação de Fornecedores',
      ropaProcessName: 'Central de Proteção de Dados (Art. 18 e Art. 20)',
      version: '1.0',
      createdAt: '2026-10-22',
      updatedAt: '2026-11-16',
      processingDescription:
        'Recebimento de requisições de titulares (Art. 18) com documentos comprobatórios de identidade/representação e avaliação automatizada de maturidade LGPD de fornecedores.',
      necessityAndProportionality:
        'A verificação de identidade é indispensável para impedir que terceiros não autorizados obtenham acesso ou eliminem dados pessoais de outrem (Art. 46 LGPD).',
      identifiedRisks:
        'Tentativa de engenharia social por terceiros solicitando dados em nome do titular ou exposição de documentos comprobatórios anexados.',
      probability: 'baixa',
      impact: 'medio',
      mitigationMeasures:
        '1) Validação formal de identidade pelo DPO antes da entrega de dados; 2) Consulta pública protegida por dupla verificação (protocolo + contato); 3) Bucket de anexos privado com URL assinada; 4) Garantia de revisão humana de score automatizado (Art. 20).',
      dpoOpinion:
        'Parecer Favorável: Processo em plena conformidade com os Arts. 18, 19, 20, 38 e 46 da Lei nº 13.709/2018.',
      status: 'vigente',
    },
  ],
  liaRecords: [
    {
      id: 'lia-1',
      processName: 'Prevenção à Fraude, Rate Limiting e Segurança Cibernética dos Formulários',
      createdAt: '2026-10-22',
      legitimatePurpose:
        'Proteger a disponibilidade e integridade do portal jurídico contra ataques automatizados (bots, DDoS, injeção de scripts e spam) e resguardar os dados de clientes e titulares.',
      necessityTest:
        'A verificação é executada mediante semente criptográfica efêmera (SHA-256) e desafio interativo local, sem coletar biometria nem armazenar o endereço IP real do visitante (minimização máxima — Art. 6º, III).',
      balancingTest:
        'O titular tem legítima expectativa de que um escritório especializado em Direito Digital e LGPD mantenha controles rigorosos de segurança cibernética. Não há impacto negativo nem rastreamento comportamental.',
      safeguardsAndOptOut:
        'Descarte automático da semente ao encerrar a sessão, transparência total na tabela de cookies e direito de oposição/esclarecimento via Central do Titular (Art. 18, § 2º).',
      conclusion: 'aprovado',
    },
    {
      id: 'lia-2',
      processName: 'Diligência Prévia e Avaliação de Maturidade LGPD de Fornecedores',
      createdAt: '2026-10-25',
      legitimatePurpose:
        'Aferir o grau de conformidade e segurança da informação de potenciais operadores e parceiros comerciais antes do compartilhamento de dados (dever de diligência — Arts. 39 e 46).',
      necessityTest:
        'Restrito a dados corporativos (CNPJ, razão social) e contato profissional do ponto focal responsável pela governança da empresa avaliada.',
      balancingTest:
        'Trata-se de relação estritamente B2B (empresarial), alinhada às boas práticas exigidas pela ANPD, sem compressão de direitos fundamentais do representante.',
      safeguardsAndOptOut:
        'Transparência prévia no formulário, revisão humana garantida pelo DPO (Art. 20) e possibilidade de retificação ou exclusão mediante requisição.',
      conclusion: 'aprovado',
    },
  ],
  processors: [
    {
      id: 'proc-1',
      name: 'Supabase Inc.',
      cnpjOrId: 'Provedor Internacional de Banco de Dados & Autenticação',
      role: 'operador',
      serviceProvided: 'Banco de dados PostgreSQL gerenciado com Row Level Security (RLS), autenticação MFA e armazenamento criptografado (AES-256 / TLS 1.3).',
      dataCategoriesShared: 'Registros de formulários, requisições LGPD, logs de consentimento e auditoria.',
      country: 'Estados Unidos (AWS us-east)',
      isInternationalTransfer: true,
      transferMechanism: 'clausulas_padrao_anpd',
      securityCertifications: 'SOC 2 Type II, ISO/IEC 27001, HIPAA/GDPR Standard Clauses',
      dpaSigned: true,
      lastAuditDate: '2026-10-22',
      status: 'ativo',
    },
    {
      id: 'proc-2',
      name: 'Vercel Inc.',
      cnpjOrId: 'Provedor de Hospedagem Edge & CDN Segura',
      role: 'operador',
      serviceProvided: 'Hospedagem da aplicação web, certificado SSL/TLS automático, mitigação de ataques DDoS e firewall de borda.',
      dataCategoriesShared: 'Metadados técnicos de requisição HTTPS e roteamento de sessão.',
      country: 'Brasil (GRU1 - São Paulo) / Estados Unidos',
      isInternationalTransfer: true,
      transferMechanism: 'clausulas_padrao_anpd',
      securityCertifications: 'ISO/IEC 27001:2022, SOC 2 Type II, PCI-DSS',
      dpaSigned: true,
      lastAuditDate: '2026-10-22',
      status: 'ativo',
    },
    {
      id: 'proc-3',
      name: 'ApexCode Desenvolvimento de Sistemas (Rafael Vidal)',
      cnpjOrId: 'contato@apexcode.dev.br | www.apexcode.dev.br',
      role: 'operador',
      serviceProvided: 'Desenvolvimento, manutenção evolutiva, segurança da aplicação e suporte técnico especializado em conformidade com a LGPD.',
      dataCategoriesShared: 'Acesso técnico restrito para manutenção e suporte sob compromisso de confidencialidade.',
      country: 'Brasil (Videira / Caçador — SC)',
      isInternationalTransfer: false,
      transferMechanism: 'nacional',
      securityCertifications: 'Privacy by Design, Segurança de Aplicação (OWASP Top 10) e Controle de Acesso 2FA',
      dpaSigned: true,
      lastAuditDate: '2026-11-16',
      status: 'ativo',
    },
  ],
  incidents: [],
};

export const DEFAULT_PRIVACY_TEMPLATE_HTML = `<h3>1. Compromisso com a sua Privacidade e Identificação do Controlador</h3>
<p>A <strong>Mascârello Haus Advocacia e Consultoria</strong> (Controladora de Dados Pessoais), com sede em Videira/SC na Rua Coronel Alberto Schmidt, nº 10, Edifício Laura, 1º Andar, Sala 5, Centro, CEP 89560-198, valoriza a confiança de seus clientes, parceiros, colaboradores e visitantes. Estruturamos nossas rotinas operacionais e técnicas sob os mais rigorosos padrões de segurança da informação e governança em conformidade integral com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 — LGPD)</strong> e com as regulamentações da <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>.</p>

<h3>2. Princípios Orientadores (Art. 6º da LGPD)</h3>
<p>Todo tratamento de dados realizado por nosso escritório observa estritamente os dez princípios legais da boa-fé:</p>
<ul>
  <li><strong>Finalidade, Adequação e Necessidade (Minimização):</strong> Coleta compatível exclusivamente com propósitos legítimos e específicos informados ao titular, limitada ao mínimo estritamente indispensável.</li>
  <li><strong>Livre Acesso, Qualidade dos Dados e Transparência:</strong> Garantia de consulta gratuita, facilitada e exatidão contínua dos dados, com informações claras sobre agentes de tratamento e operadores.</li>
  <li><strong>Segurança, Prevenção, Não Discriminação e Responsabilização (Accountability):</strong> Adoção de medidas técnicas e administrativas aptas a proteger os dados pessoais e comprovar a eficácia da conformidade.</li>
</ul>

<h3>3. Bases Legais e Finalidades de Tratamento (Arts. 7º, 10 e 11 da LGPD)</h3>
<p>Os dados pessoais tratados por meio deste portal institucional apoiam-se estritamente nas seguintes hipóteses legais:</p>
<ul>
  <li><strong>Consentimento do Titular (Art. 7º, I):</strong> Para ativação de cookies opcionais (funcionais, analíticos ou de marketing) e envio voluntário de mensagens iniciais.</li>
  <li><strong>Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II):</strong> Para recebimento, validação e guarda comprobatória de requisições de direitos na Central LGPD (Art. 18) e apurações éticas no Canal de Denúncias.</li>
  <li><strong>Execução de Contrato ou Procedimentos Preliminares (Art. 7º, V):</strong> Para atendimento de clientes, elaboração de propostas jurídicas e diligência prévia de conformidade de fornecedores.</li>
  <li><strong>Exercício Regular de Direitos em Processo Judicial, Administrativo ou Arbitral (Art. 7º, VI e Art. 11, II, d):</strong> Na atuação contenciosa e consultiva própria da advocacia.</li>
  <li><strong>Legítimo Interesse do Controlador (Art. 7º, IX e Art. 10):</strong> Para segurança cibernética do portal, prevenção a fraudes/spam e gestão de integridade corporativa, devidamente documentado em Avaliação de Legítimo Interesse (LIA).</li>
</ul>

<h3>4. Direitos do Titular, Oposição e Revisão de Decisões Automatizadas (Arts. 18, 19 e 20 da LGPD)</h3>
<p>Você pode exercer gratuitamente, a qualquer momento, através da nossa <strong>Central de Proteção de Dados</strong>:</p>
<ul>
  <li><strong>Confirmação e Acesso (Art. 18, I e II; Art. 19):</strong> Obter declaração clara sobre a existência de tratamento e cópia integral dos dados (em formato simplificado imediato ou declaração completa em até 15 dias).</li>
  <li><strong>Correção (Art. 18, III):</strong> Retificação de dados incompletos, inexatos ou desatualizados.</li>
  <li><strong>Anonimização, Bloqueio ou Eliminação (Art. 18, IV e VI):</strong> Exclusão de dados desnecessários, excessivos ou tratados com base no consentimento.</li>
  <li><strong>Portabilidade (Art. 18, V):</strong> Exportação dos seus dados em formato estruturado e interoperável (JSON/CSV).</li>
  <li><strong>Informação sobre Compartilhamento e Revogação (Art. 18, VII, VIII e IX):</strong> Ciência das entidades com as quais houve uso compartilhado e revogação de consentimento a qualquer momento.</li>
  <li><strong>Direito de Oposição (Art. 18, § 2º):</strong> Oposição a tratamento realizado com fundamento em uma das hipóteses de dispensa de consentimento, em caso de descumprimento ao disposto na LGPD.</li>
  <li><strong>Revisão de Decisões Automatizadas (Art. 20):</strong> Direito de solicitar a revisão humana e explicação dos critérios utilizados em qualquer avaliação automatizada (como o cálculo do Índice de Conformidade de Fornecedores).</li>
</ul>

<h3>5. Proteção de Dados de Crianças e Adolescentes (Art. 14 da LGPD)</h3>
<p>Este website e seus formulários digitais são direcionados exclusivamente a pessoas maiores de 18 (dezoito) anos. O escritório não coleta intencionalmente dados de menores de idade por meio do site. Na hipótese estrita de representação jurídica, cível, trabalhista ou previdenciária que envolva crianças ou adolescentes, o tratamento ocorre exclusivamente em seu melhor interesse e mediante termo de consentimento específico e em destaque assinado por pelo menos um dos pais ou representante legal (Art. 14, § 1º).</p>

<h3>6. Compartilhamento com Operadores e Transferência Internacional de Dados (Arts. 33 a 36 e Resolução CD/ANPD nº 19/2024)</h3>
<p>A Mascârello Haus não comercializa dados pessoais sob nenhuma hipótese. Para operação segura deste portal, utilizamos operadores de infraestrutura tecnológica homologados (<strong>Supabase Inc.</strong> para banco de dados criptografado, <strong>Vercel Inc.</strong> para hospedagem e mitigação DDoS e <strong>ApexCode</strong> para suporte técnico e engenharia de segurança). Quando o armazenamento em nuvem envolver processamento em data centers localizados no exterior (Estados Unidos ou União Europeia), a transferência internacional ampara-se nos <strong>Arts. 33 a 36 da LGPD</strong> e na <strong>Resolução CD/ANPD nº 19/2024</strong>, mediante adoção de Cláusulas-Padrão Contratuais, criptografia ponta a ponta (TLS 1.3 e AES-256) e certificações internacionais ISO/IEC 27001 e SOC 2 Type II.</p>

<h3>7. Término do Tratamento, Prazos de Retenção e Descarte Seguro (Arts. 15 e 16 da LGPD)</h3>
<p>Os dados pessoais são mantidos apenas pelo período necessário ao cumprimento de suas finalidades:</p>
<ul>
  <li><strong>Mensagens de Contato Institucional:</strong> 24 meses após a conclusão do atendimento inicial (caso não haja contratação de serviços jurídicos).</li>
  <li><strong>Requisições da Central LGPD, Canal de Denúncias e Logs de Consentimento:</strong> 5 (cinco) anos para comprovação de cumprimento de obrigação legal e regulatória perante a ANPD (Art. 16, I).</li>
  <li><strong>Contratos e Processos Jurídicos:</strong> Durante a vigência contratual acrescida dos prazos prescricionais legais aplicáveis (Art. 7º, VI e Art. 16, I).</li>
</ul>
<p>Encerrado o prazo de retenção, os dados são eliminados com segurança ou submetidos à anonimização irreversível.</p>

<h3>8. Segurança da Informação e Comunicação de Incidentes (Arts. 46 a 49 e Resolução CD/ANPD nº 15/2024)</h3>
<p>Adotamos controles técnicos de <em>Privacy by Design</em>: autenticação multifator (2FA), controle de acesso baseado em função (RBAC), anonimização de IP por hash SHA-256, inspeção binária de anexos contra malwares, armazenamento privado com URLs assinadas temporárias e trilha de auditoria imutável. Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a comunicação à ANPD e aos afetados será realizada no prazo regulamentar de <strong>3 (três) dias úteis</strong> (Resolução CD/ANPD nº 15/2024).</p>

<h3>9. Encarregado pelo Tratamento de Dados Pessoais — DPO Titular e Substituto (Art. 41 e Resolução CD/ANPD nº 18/2024)</h3>
<p>Para esclarecer dúvidas, consultar protocolos ou exercer seus direitos, contate nosso canal oficial de DPO:</p>
<ul>
  <li><strong>Encarregada Titular (DPO):</strong> Mirataira Haus — <a href="mailto:privacidade@mascarellohaus.adv.br">privacidade@mascarellohaus.adv.br</a> | WhatsApp: +55 (49) 98822-0982</li>
  <li><strong>Encarregado Substituto (Ausências/Impedimentos — Res. ANPD nº 18/2024):</strong> Comitê de Privacidade e Compliance Mascârello Haus — <a href="mailto:dpo@mascarellohaus.com.br">dpo@mascarellohaus.com.br</a> | Tel: +55 (49) 3566-0066</li>
</ul>`;

export const DEFAULT_TERMS_TEMPLATE_HTML = `<p><em>O presente termo regula o acesso e condições de uso do site https://mascarellohaus.adv.br/, bem como os serviços informativos e canais de conformidade oferecidos por meio da aplicação, estabelecendo os direitos e as obrigações dos usuários.</em></p>

<h3>1. QUEM SOMOS</h3>
<p>Somos um escritório dedicado a atender às necessidades e riscos, em fomento da conformidade e boas práticas relacionadas à regulação do mercado, direcionado ao Compliance nas mais diversas áreas, em especial à Proteção de Dados Pessoais (LGPD). Por meio de equipe multidisciplinar, orienta e desenvolve estratégias que atendam aspectos regulamentares, de governança corporativa e de segurança da informação em respeito à metodologia aplicável a cada segmento. De maneira proativa também atua nas organizações da sociedade civil em projetos sociais e Advocacia Pro Bono.</p>

<h3>2. TERMOS E DEFINIÇÕES</h3>
<p><strong>Cookies e Armazenamento Local:</strong> Arquivos e chaves gerados no navegador ao acessar o site, classificados entre estritamente necessários (segurança e sessão) e opcionais (funcionais, analíticos e marketing), sempre sujeitos à escolha granular do titular.</p>
<p><strong>Dados Pessoais:</strong> Qualquer informação relacionada a pessoa natural identificada ou identificável tratada nos termos da Lei nº 13.709/2018.</p>
<p><strong>Usuário:</strong> Todas as pessoas físicas que utilizam ou visitam o site, maiores de 18 (dezoito) anos ou legalmente representadas nos termos do Art. 14 da LGPD.</p>

<h3>3. UTILIZAÇÃO DE NOSSO SITE E REQUISITO ETÁRIO</h3>
<p>O uso do site é regido por estes Termos Gerais e pelo Aviso de Privacidade. Ao submeter formulários na plataforma, o usuário declara possuir 18 (dezoito) anos completos ou atuar mediante representação legal comprovada. O escritório mantém histórico público de versões destes Termos e do Aviso de Privacidade para plena transparência (Art. 8º, § 2º da LGPD).</p>

<h3>4. RESPONSABILIDADES DO USUÁRIO E SEGURANÇA CIBERNÉTICA</h3>
<p>O usuário compromete-se a fornecer dados verdadeiros, completos e atualizados em todos os formulários, bem como a anexar documentos legítimos quando atuar como procurador ou representante legal de terceiro (Art. 18, § 3º da LGPD). É expressamente vedado utilizar o site para fins ilícitos, tentar burlar mecanismos de controle de acesso, enviar arquivos maliciosos ou realizar relatos sabidamente falsos de má-fé.</p>

<h3>5. PRIVACIDADE, DIREITOS DO TITULAR E CONSULTA DE PROTOCOLOS</h3>
<p>O tratamento de dados pessoais segue rigorosamente a Lei Federal nº 13.709/2018 (LGPD), assegurando o exercício gratuito e facilitado de todos os direitos previstos nos Arts. 18, 19 e 20 através da Central de Proteção de Dados, incluindo o acompanhamento eletrônico por número de protocolo único.</p>

<h3>6. PROPRIEDADE INTELECTUAL &amp; DIREITOS AUTORAIS</h3>
<p>Todo o conteúdo deste website, marcas, logotipos, textos, artigos jurídicos e cartilhas educativas pertencem com exclusividade à Mascârello Haus Advocacia e Consultoria, sendo permitido o download gratuito das cartilhas para fins educativos e de conscientização interna, vedada a comercialização ou reprodução desautorizada.</p>

<h3>7. DESENVOLVIMENTO TÉCNICO, SUPORTE E LGPD</h3>
<p>A infraestrutura de software deste portal e seu painel de governança LGPD são desenvolvidos e mantidos pela <strong>ApexCode</strong> (<a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer">www.apexcode.dev.br</a> | <a href="mailto:contato@apexcode.dev.br">contato@apexcode.dev.br</a> | WhatsApp: <a href="https://wa.me/5549999281878" target="_blank" rel="noopener noreferrer">+55 49 99928-1878</a>), atuando como operadora tecnológica sob rígidos padrões de segurança da informação.</p>

<h3>8. LEI APLICÁVEL E FORO</h3>
<p>Em eventuais controvérsias decorrentes destes Termos, buscar-se-á a resolução amigável e extrajudicial, inclusive perante o canal da Encarregada de Dados (DPO). Não sendo viável, fica eleito o Foro da Comarca de Videira/SC para dirimir qualquer litígio, ressalvadas as disposições legais aplicáveis.</p>
<p><strong>Videira — Santa Catarina | Mascârello Haus Advocacia</strong></p>`;

export const DEFAULT_LEGAL_DOCUMENTS_CONFIG: LegalDocumentsConfig = {
  privacyPolicy: {
    title: 'Aviso de Privacidade & Tratamento de Dados',
    subtitle: 'Transparência & Conformidade Regulatória (Arts. 6º a 49 da LGPD)',
    version: '2.2',
    updatedAt: '2026-11-16',
    customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
  },
  termsOfUse: {
    title: 'Termos de Uso do Site Mascârello Haus',
    subtitle: 'Termos Gerais, Segurança e Condições de Uso',
    version: '1.1',
    updatedAt: '2026-11-16',
    customHtml: DEFAULT_TERMS_TEMPLATE_HTML,
  },
  versionHistory: [
    {
      id: 'ver-priv-2.2',
      docType: 'privacyPolicy',
      version: '2.2',
      updatedAt: '2026-11-16',
      publishedBy: 'Mirataira Haus (DPO)',
      changelog:
        'Adequação integral às Resoluções CD/ANPD nº 15/2024 (Incidentes em 3 dias úteis), nº 18/2024 (Encarregado Substituto) e nº 19/2024 (Transferência Internacional), inclusão expressa dos Arts. 14, 15, 16, 18 § 2º e 20 da LGPD.',
      customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
    },
    {
      id: 'ver-priv-2.1',
      docType: 'privacyPolicy',
      version: '2.1',
      updatedAt: '2026-10-22',
      publishedBy: 'Mirataira Haus (DPO)',
      changelog: 'Versão inaugural do portal unificado com tabela de transparência de cookies e canal do DPO.',
      customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
    },
    {
      id: 'ver-terms-1.1',
      docType: 'termsOfUse',
      version: '1.1',
      updatedAt: '2026-11-16',
      publishedBy: 'Mirataira Haus (DPO)',
      changelog: 'Inclusão de requisito etário expresso (Art. 14 LGPD), consulta eletrônica de protocolos e identificação de suporte técnico.',
      customHtml: DEFAULT_TERMS_TEMPLATE_HTML,
    },
  ],
};
