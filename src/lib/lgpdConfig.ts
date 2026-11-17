import { LEGAL_CONFIG } from '../config/legal';
import { COOKIE_INVENTORY } from '../config/cookies';

export interface CookieTableItem {
  id: string;
  name: string;
  provider: string;
  category: 'Necessário' | 'Funcional' | 'Analítico' | string;
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
  marketingTitle?: string;
  marketingDesc?: string;
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
  version: LEGAL_CONFIG.documents.privacyNotice.version,
  title: 'Privacidade e Gestão de Cookies',
  description:
    'O escritório Mascârello Haus Advocacia utiliza cookies e armazenamentos locais estritamente necessários para o funcionamento e segurança do site. Com o seu consentimento livre, informado e inequívoco, também poderemos ativar armazenamentos funcionais para salvar rascunhos de formulários, em observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD) e ao Guia de Cookies da ANPD.',
  acceptAllLabel: 'Aceitar Todos',
  rejectOptionalLabel: 'Apenas Essenciais',
  customizeLabel: 'Personalizar',
  showFloatingButton: true,
  floatingButtonLabel: 'Cookies',
  consentExpiryMonths: 12,
  essentialTitle: 'Cookies e Armazenamentos Estritamente Necessários',
  essentialDesc:
    'Indispensáveis para segurança cibernética, proteção contra fraudes, autenticação administrativa e registro das suas preferências de privacidade. Não podem ser desativados.',
  functionalTitle: 'Armazenamento Funcional (Rascunhos de Formulários)',
  functionalDesc:
    'Permite salvar rascunhos locais de formulários longos (Central do Titular, Canal de Denúncias e Questionário de Conformidade) para evitar perda de preenchimento.',
  analyticsTitle: 'Cookies Analíticos',
  analyticsDesc:
    'Atualmente o portal não utiliza cookies analíticos de terceiros (como Google Analytics) em produção.',
  cookiesTable: COOKIE_INVENTORY.map((item) => ({
    id: item.id,
    name: item.name,
    provider: item.provider,
    category: item.category,
    purpose: item.purpose,
    retention: item.retention,
  })),
};

export const DEFAULT_LGPD_GOVERNANCE_CONFIG: LgpdGovernanceConfig = {
  dpoName: LEGAL_CONFIG.dpo.titular.name,
  dpoEmail: LEGAL_CONFIG.dpo.titular.email,
  dpoPhone: LEGAL_CONFIG.dpo.titular.phone,
  dpoOab: `${LEGAL_CONFIG.dpo.titular.oab} — Encarregada Titular`,
  dpoServiceHours: 'Segunda a Sexta, 08h30 às 12h00 e 13h30 às 18h00',
  substituteDpoName: LEGAL_CONFIG.dpo.substitute.name,
  substituteDpoEmail: LEGAL_CONFIG.dpo.substitute.email,
  substituteDpoPhone: LEGAL_CONFIG.dpo.substitute.phone,
  substituteDpoOab: LEGAL_CONFIG.dpo.substitute.role,
  responseDeadlineDays: LEGAL_CONFIG.deadlines.responseDeadlineDays,
  incidentNotificationHours: 72,
  incidentBusinessDaysAnpd: LEGAL_CONFIG.deadlines.incidentNotificationDays,
  committeeMembers: `${LEGAL_CONFIG.dpo.titular.name} (DPO Titular — ${LEGAL_CONFIG.dpo.titular.oab}), Encarregado Substituto, Sócios Administradores e Segurança da Informação (${LEGAL_CONFIG.developer.name})`,
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
      country: 'Brasil (Videira — SC)',
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
<p>A <strong>${LEGAL_CONFIG.company.legalName}</strong> (${LEGAL_CONFIG.company.tradeName}), inscrita no CNPJ sob o nº <strong>${LEGAL_CONFIG.company.cnpj}</strong>, com sede na ${LEGAL_CONFIG.company.address}, atua como <strong>Controladora de Dados Pessoais</strong>. Valorizamos a confiança de nossos clientes, parceiros, colaboradores e visitantes, estruturando nossas rotinas em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 — LGPD)</strong> e com as resoluções da <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>.</p>
<p><strong>Canais de contato do Controlador:</strong> E-mail geral <a href="mailto:${LEGAL_CONFIG.contacts.generalEmail}">${LEGAL_CONFIG.contacts.generalEmail}</a> | Privacidade <a href="mailto:${LEGAL_CONFIG.contacts.privacyEmail}">${LEGAL_CONFIG.contacts.privacyEmail}</a> | WhatsApp ${LEGAL_CONFIG.contacts.whatsappDisplay}.</p>

<h3>2. Quadro de Transparência por Canal de Coleta (Art. 9º da LGPD)</h3>
<p>A tabela abaixo detalha os dados coletados em cada canal do portal, suas finalidades, bases legais, prazos de retenção e eventual compartilhamento:</p>
<table>
  <thead>
    <tr>
      <th>Canal</th>
      <th>Dados coletados</th>
      <th>Finalidade</th>
      <th>Base legal</th>
      <th>Retenção</th>
      <th>Compartilhamento</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Formulário de Contato</strong></td>
      <td>Nome, e-mail ou telefone, assunto e mensagem (além de eventuais anexos voluntários).</td>
      <td>Responder à solicitação de atendimento e conduzir procedimentos preliminares relacionados a eventual contratação de serviços jurídicos.</td>
      <td><strong>Art. 7º, V</strong> (procedimentos preliminares relacionados a contrato).</td>
      <td>${LEGAL_CONFIG.retention.contactForm}</td>
      <td>Infraestrutura tecnológica (Supabase e Vercel) e equipe interna de atendimento.</td>
    </tr>
    <tr>
      <td><strong>Central do Titular (LGPD)</strong></td>
      <td>Nome completo, e-mail ou telefone, tipo de requisição, descrição e documento comprobatório de identidade/representação.</td>
      <td>Receber, validar identidade, processar e responder às requisições de direitos dos titulares e emitir protocolo de acompanhamento.</td>
      <td><strong>Art. 7º, II</strong> (cumprimento de obrigação legal — Art. 18 da LGPD).</td>
      <td>${LEGAL_CONFIG.retention.dataSubjectRequests}</td>
      <td>Acesso restrito à Encarregada (DPO), equipe de governança e infraestrutura de banco de dados (Supabase).</td>
    </tr>
    <tr>
      <td><strong>Canal de Denúncias</strong></td>
      <td>Descrição do relato, local/canal da ocorrência, data aproximada, envolvidos e evidências anexadas (identificação opcional; admite relato anônimo).</td>
      <td>Apurar irregularidades, violações éticas ou ilícitos em programa de integridade e cumprir deveres legais/regulatórios.</td>
      <td><strong>Art. 7º, II e VI</strong>; e, quando houver dados pessoais sensíveis no relato, <strong>Art. 11, II, "a" e "d"</strong>.</td>
      <td>${LEGAL_CONFIG.retention.whistleblowerReports}</td>
      <td>Comitê de Ética/Compliance, Encarregada (DPO) e, quando estritamente necessário, autoridades competentes ou assessoria jurídica externa.</td>
    </tr>
    <tr>
      <td><strong>Questionário de Conformidade de Fornecedores</strong></td>
      <td>Razão social, CNPJ, endereço, responsável pelo preenchimento, e-mail, telefone e respostas/evidências de governança LGPD.</td>
      <td>Avaliar o nível de maturidade em proteção de dados de fornecedores e parceiros para diligência pré-contratual e gestão de risco.</td>
      <td><strong>Art. 7º, V e IX</strong> (procedimentos preliminares a contrato e legítimo interesse).</td>
      <td>${LEGAL_CONFIG.retention.complianceQuiz}</td>
      <td>Equipe jurídica/compliance interna e infraestrutura (Supabase).</td>
    </tr>
    <tr>
      <td><strong>WhatsApp e E-mail Institucional</strong></td>
      <td>Nome, número de telefone, endereço de e-mail e conteúdo das mensagens/documentos enviados.</td>
      <td>Atendimento direto, agendamento de reuniões e tratativas preliminares para prestação de serviços advocatícios.</td>
      <td><strong>Art. 7º, V</strong> (procedimentos preliminares a contrato).</td>
      <td>${LEGAL_CONFIG.retention.whatsappAndEmail}</td>
      <td>Provedor de mensageria/e-mail e equipe de atendimento do escritório.</td>
    </tr>
    <tr>
      <td><strong>Cookies e Armazenamento Local</strong></td>
      <td>Preferências de consentimento, semente anti-bot (<code>mh_sec_seed</code>), controle de envio (<code>mh_rl_*</code>) e, se autorizado, rascunhos locais (<code>mh_form_state_*</code>).</td>
      <td>Segurança contra abuso/spam, manutenção de sessão administrativa e salvamento opcional de rascunhos de formulários.</td>
      <td>Necessários: <strong>Art. 7º, IX</strong> (legítimo interesse). Opcionais (funcionais): <strong>Art. 7º, I</strong> (consentimento).</td>
      <td>${LEGAL_CONFIG.retention.cookiesEssential} (funcionais até revogação).</td>
      <td>Processamento local no navegador do titular (sem compartilhamento publicitário).</td>
    </tr>
  </tbody>
</table>

<h3>3. Princípios e Bases Legais Complementares (Arts. 6º, 7º, 10 e 11)</h3>
<p>Todo tratamento realizado pelo escritório observa os princípios da finalidade, adequação, necessidade (minimização), livre acesso, qualidade, transparência, segurança, prevenção, não discriminação e responsabilização. Quando utilizamos a base legal de <strong>Legítimo Interesse (Art. 7º, IX e Art. 10)</strong> — como em controles de segurança anti-spam e diligência de integridade —, mantemos <strong>Teste de Balanceamento (LIA — Legitimate Interest Assessment)</strong> formalmente documentado, disponível mediante solicitação ao Encarregado (DPO).</p>

<h3>4. Direitos do Titular, Prazos de Resposta e Petição à ANPD (Arts. 18, 19 e 20)</h3>
<p>Você pode exercer gratuitamente seus direitos através da <strong>Central de Proteção de Dados</strong>:</p>
<ul>
  <li><strong>Confirmação e Acesso (Art. 18, I e II; Art. 19):</strong> Confirmação da existência de tratamento e acesso aos dados em formato simplificado providenciados <strong>imediatamente</strong> (Art. 19, I), ou declaração completa clara em <strong>até 15 dias, contados do requerimento (Art. 19, II)</strong>.</li>
  <li><strong>Correção, Anonimização, Bloqueio ou Eliminação (Art. 18, III, IV e VI):</strong> Retificação de dados incompletos/inexatos e exclusão de dados desnecessários ou tratados com base no consentimento.</li>
  <li><strong>Portabilidade, Compartilhamento e Revogação (Art. 18, V, VII, VIII e IX):</strong> Exportação estruturada, informação sobre entidades públicas/privadas com quem houve compartilhamento e revogação do consentimento a qualquer momento.</li>
  <li><strong>Oposição e Revisão de Decisões Automatizadas (Art. 18, § 2º e Art. 20):</strong> Oposição a tratamentos irregulares e solicitação de revisão humana de critérios automatizados (como o índice do Questionário de Conformidade).</li>
  <li><strong>Direito de Peticionar à ANPD (Art. 18, § 1º):</strong> Caso entenda que o tratamento viola a LGPD ou não tenha ficado satisfeito com a resposta do Controlador, você tem o direito de peticionar diretamente à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> pelo portal oficial <a href="${LEGAL_CONFIG.authority.url}" target="_blank" rel="noopener noreferrer">${LEGAL_CONFIG.authority.url}</a>.</li>
</ul>

<h3>5. Faixa Etária e Proteção de Crianças e Adolescentes (Art. 14 da LGPD)</h3>
<p>${LEGAL_CONFIG.security.ageNotice} O escritório não coleta intencionalmente dados de menores de idade por meio dos formulários do site. Na hipótese estrita de representação jurídica que envolva crianças ou adolescentes, o tratamento ocorre exclusivamente em seu melhor interesse e mediante consentimento específico e em destaque dado por pelo menos um dos pais ou pelo representante legal (Art. 14, § 1º).</p>

<h3>6. Operadores e Transferência Internacional de Dados (Arts. 33 a 36 e Res. CD/ANPD nº 19/2024)</h3>
<p>Não comercializamos dados pessoais. Para operação do portal, contamos com os operadores tecnológicos <strong>Supabase Inc.</strong> (banco de dados e armazenamento privado de anexos), <strong>Vercel Inc.</strong> (hospedagem e mitigação DDoS) e <strong>${LEGAL_CONFIG.developer.name}</strong> (desenvolvimento e suporte técnico). A relação completa de operadores, papéis e mecanismos de transferência internacional pode ser consultada na aba <a href="/central-de-protecao-de-dados/?aba=direitos">Direitos, DPO &amp; Operadores</a>. Quando houver processamento em data centers no exterior, aplicam-se os Arts. 33 a 36 da LGPD e a Resolução CD/ANPD nº 19/2024, com Cláusulas-Padrão Contratuais e conexão protegida por encriptação (TLS 1.3 e AES-256).</p>

<h3>7. Segurança da Informação e Comunicação de Incidentes (Arts. 46 a 49 e Res. CD/ANPD nº 15/2024)</h3>
<p>Adotamos controles técnicos de segurança desde a concepção (<em>Privacy by Design</em>): autenticação multifator (2FA), controle de acesso por função (RBAC), anonimização de IP por hash SHA-256, verificação de integridade de anexos, bucket privado com URLs assinadas de curta duração (5 minutos) e trilha de auditoria. Na ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a comunicação à ANPD e aos titulares afetados será efetuada no prazo regulamentar de <strong>3 (três) dias úteis</strong>, nos termos da Resolução CD/ANPD nº 15/2024.</p>

<h3>8. Encarregado pelo Tratamento de Dados Pessoais — DPO Titular e Substituto (Art. 41 e Res. CD/ANPD nº 18/2024)</h3>
<p>Para dúvidas, exercício de direitos ou solicitação de informações sobre testes de balanceamento (LIA), contate nossos Encarregados:</p>
<ul>
  <li><strong>Encarregada Titular (DPO):</strong> ${LEGAL_CONFIG.dpo.titular.name} (${LEGAL_CONFIG.dpo.titular.oab}) — <a href="mailto:${LEGAL_CONFIG.dpo.titular.email}">${LEGAL_CONFIG.dpo.titular.email}</a> | WhatsApp: ${LEGAL_CONFIG.dpo.titular.phone}</li>
  <li><strong>Encarregado Substituto (Ausências/Impedimentos — Res. CD/ANPD nº 18/2024):</strong> ${LEGAL_CONFIG.dpo.substitute.name} — <a href="mailto:${LEGAL_CONFIG.dpo.substitute.email}">${LEGAL_CONFIG.dpo.substitute.email}</a> | Tel: ${LEGAL_CONFIG.dpo.substitute.phone}</li>
</ul>`;

export const DEFAULT_TERMS_TEMPLATE_HTML = `<p><em>O presente termo regula o acesso e condições de uso do site ${LEGAL_CONFIG.company.websiteUrl}/, bem como os serviços informativos e canais de conformidade oferecidos por meio da aplicação, estabelecendo os direitos e as obrigações dos usuários. O uso do site implica ciência destes Termos.</em></p>

<h3>1. QUEM SOMOS</h3>
<p>A <strong>${LEGAL_CONFIG.company.legalName}</strong> (CNPJ ${LEGAL_CONFIG.company.cnpj}) é dedicada a atender às necessidades e riscos jurídicos, com atuação estratégica em Compliance, Proteção de Dados Pessoais (LGPD), Direito Empresarial, Civil, Tributário, Trabalhista e Previdenciário.</p>

<h3>2. TERMOS E DEFINIÇÕES</h3>
<p><strong>Cookies e Armazenamento Local:</strong> Arquivos e chaves gerados no navegador ao acessar o site, classificados entre estritamente necessários (segurança e sessão) e opcionais (armazenamento funcional de rascunhos), sujeitos à escolha granular do titular.</p>
<p><strong>Dados Pessoais:</strong> Qualquer informação relacionada a pessoa natural identificada ou identificável tratada nos termos da Lei nº 13.709/2018.</p>
<p><strong>Usuário:</strong> Todas as pessoas físicas que utilizam ou visitam o site, maiores de 18 (dezoito) anos ou legalmente representadas nos termos do Art. 14 da LGPD.</p>

<h3>3. UTILIZAÇÃO DO SITE E REQUISITO ETÁRIO</h3>
<p>O uso do site implica ciência destes Termos Gerais e do <a href="/central-de-protecao-de-dados/?aba=aviso">Aviso de Privacidade</a>. Este site e seus canais digitais são destinados a maiores de 18 (dezoito) anos. Ao submeter formulários na plataforma, o usuário declara possuir 18 anos completos ou atuar mediante representação legal comprovada. Mantemos histórico público de versões destes Termos e do Aviso de Privacidade para plena transparência (Art. 8º, § 2º da LGPD).</p>

<h3>4. RESPONSABILIDADES DO USUÁRIO E SEGURANÇA CIBERNÉTICA</h3>
<p>O usuário compromete-se a fornecer dados verdadeiros, completos e atualizados em todos os formulários, bem como a anexar documentos legítimos quando atuar como procurador ou representante legal de terceiro (Art. 18, § 3º da LGPD). É vedado utilizar o site para fins ilícitos, tentar burlar controles de acesso, enviar arquivos maliciosos ou realizar relatos sabidamente falsos de má-fé.</p>

<h3>5. PRIVACIDADE, DIREITOS DO TITULAR E CONSULTA DE PROTOCOLOS</h3>
<p>O tratamento de dados pessoais segue rigorosamente a Lei Federal nº 13.709/2018 (LGPD), assegurando o exercício gratuito e facilitado de todos os direitos previstos nos Arts. 18, 19 e 20 através da Central de Proteção de Dados, incluindo o acompanhamento eletrônico por número de protocolo único.</p>

<h3>6. PROPRIEDADE INTELECTUAL &amp; DIREITOS AUTORAIS</h3>
<p>Todo o conteúdo deste website, marcas, logotipos, textos, artigos jurídicos e cartilhas educativas pertencem com exclusividade à ${LEGAL_CONFIG.company.tradeName}, sendo permitido o download gratuito das cartilhas para fins educativos e de conscientização interna, vedada a comercialização ou reprodução desautorizada.</p>

<h3>7. DESENVOLVIMENTO TÉCNICO, SUPORTE E LGPD</h3>
<p>A infraestrutura de software deste portal e seu painel de governança LGPD são desenvolvidos e mantidos pela <strong>${LEGAL_CONFIG.developer.name}</strong> (<a href="${LEGAL_CONFIG.developer.url}" target="_blank" rel="noopener noreferrer">www.apexcode.dev.br</a> | <a href="mailto:${LEGAL_CONFIG.developer.email}">${LEGAL_CONFIG.developer.email}</a> | <a href="${LEGAL_CONFIG.developer.whatsappUrl}" target="_blank" rel="noopener noreferrer">WhatsApp de Suporte Técnico</a>), atuando como operadora tecnológica sob rígidos padrões de segurança da informação.</p>

<h3>8. LEI APLICÁVEL E FORO</h3>
<p>Em eventuais controvérsias decorrentes destes Termos, buscar-se-á a resolução amigável e extrajudicial, inclusive perante o canal da Encarregada de Dados (DPO). Não sendo viável, fica eleito o Foro da ${LEGAL_CONFIG.company.forumCity} para dirimir qualquer litígio, ressalvado o foro do domicílio do consumidor, quando aplicável (CDC).</p>
<p><strong>Videira — Santa Catarina | ${LEGAL_CONFIG.company.tradeName}</strong></p>`;

export const DEFAULT_LEGAL_DOCUMENTS_CONFIG: LegalDocumentsConfig = {
  privacyPolicy: {
    title: 'Aviso de Privacidade & Tratamento de Dados',
    subtitle: 'Transparência & Conformidade Regulatória (Arts. 6º a 49 da LGPD)',
    version: LEGAL_CONFIG.documents.privacyNotice.version,
    updatedAt: LEGAL_CONFIG.documents.privacyNotice.effectiveDate,
    customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
  },
  termsOfUse: {
    title: 'Termos de Uso do Site Mascârello Haus',
    subtitle: 'Termos Gerais, Segurança e Condições de Uso',
    version: LEGAL_CONFIG.documents.termsOfUse.version,
    updatedAt: LEGAL_CONFIG.documents.termsOfUse.effectiveDate,
    customHtml: DEFAULT_TERMS_TEMPLATE_HTML,
  },
  versionHistory: [
    {
      id: 'ver-priv-2.3',
      docType: 'privacyPolicy',
      version: '2.3',
      updatedAt: '2026-11-17',
      publishedBy: `${LEGAL_CONFIG.dpo.titular.name} (DPO — ${LEGAL_CONFIG.dpo.titular.oab})`,
      changelog:
        'Publicação integral do Aviso v2.3: identificação completa do controlador (CNPJ), tabela por canal de coleta com bases legais e retenção (Art. 9º), inclusão expressa do direito de petição à ANPD (Art. 18, § 1º), LIA documentado, prazos do Art. 19 (imediato e até 15 dias) e atualização da DPO Titular (OAB/SC 46.446) e Substituto.',
      customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
    },
    {
      id: 'ver-priv-2.2',
      docType: 'privacyPolicy',
      version: '2.2',
      updatedAt: '2026-11-16',
      publishedBy: `${LEGAL_CONFIG.dpo.titular.name} (DPO)`,
      changelog:
        'Adequação às Resoluções CD/ANPD nº 15/2024, nº 18/2024 e nº 19/2024 e inclusão expressa dos Arts. 14, 15, 16, 18 § 2º e 20 da LGPD.',
      customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
    },
    {
      id: 'ver-priv-2.1',
      docType: 'privacyPolicy',
      version: '2.1',
      updatedAt: '2026-10-22',
      publishedBy: `${LEGAL_CONFIG.dpo.titular.name} (DPO)`,
      changelog: 'Versão inaugural do portal unificado com tabela de transparência de cookies e canal do DPO.',
      customHtml: DEFAULT_PRIVACY_TEMPLATE_HTML,
    },
    {
      id: 'ver-terms-1.1',
      docType: 'termsOfUse',
      version: '1.1',
      updatedAt: '2026-11-17',
      publishedBy: `${LEGAL_CONFIG.dpo.titular.name} (DPO — ${LEGAL_CONFIG.dpo.titular.oab})`,
      changelog:
        'Atualização para "ciência destes Termos", unificação da faixa etária para maiores de 18 anos e inclusão expressa da ressalva do foro do domicílio do consumidor (CDC).',
      customHtml: DEFAULT_TERMS_TEMPLATE_HTML,
    },
  ],
};
