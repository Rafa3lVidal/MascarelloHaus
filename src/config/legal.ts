/**
 * Fonte única e centralizada de dados institucionais, de contato,
 * Encarregado (DPO), prazos legais e retenção da Mascârello Haus Advocacia.
 *
 * ATENÇÃO: Campos marcados com TODO e "[PREENCHER]" devem ser revisados
 * e preenchidos com os dados oficiais antes da publicação definitiva.
 */

export const LEGAL_CONFIG = {
  company: {
    legalName: 'MASCARELLO HAUS SOCIEDADE INDIVIDUAL DE ADVOCACIA',
    tradeName: 'Mascârello Haus Advocacia',
    fullTitle: 'Mascârello Haus Advocacia e Consultoria Jurídica',
    cnpj: '38.282.320/0001-54',
    oabSocietyRegistry: 'OAB/SC', // TODO: confirmar número de registro da sociedade na OAB/SC, se aplicável
    address:
      'Esquina com a Rua Coronel Alberto Schmidt, n.º 10, Edifício Laura, 1.º Andar, Sala 5, Rua Brasil - Centro, Videira - SC, CEP 89560-198',
    cityState: 'Videira/SC',
    forumCity: 'Comarca de Videira/SC',
    websiteUrl: 'https://www.mascarellohaus.adv.br',
    domain: 'mascarellohaus.adv.br',
  },

  contacts: {
    generalEmail: 'contato@mascarellohaus.adv.br',
    privacyEmail: 'privacidade@mascarellohaus.adv.br',
    dpoEmail: 'dpo@mascarellohaus.adv.br',
    // TODO: confirmar telefone fixo oficial caso haja alteração
    phoneDisplay: '+55 (49) 3566-0066',
    phoneHref: 'tel:+554935660066',
    whatsappNumber: '554988220982',
    whatsappDisplay: '+55 (49) 98822-0982',
    whatsappShortDisplay: '49 98822-0982',
    whatsappUrl: 'https://wa.me/554988220982',
    whatsappDefaultMessageUrl:
      'https://wa.me/554988220982?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20atendimento%20jur%C3%ADdico.',
  },

  dpo: {
    titular: {
      name: 'Mirataira Helena Mascarello Haus',
      oab: 'OAB/SC 46.446',
      role: 'Encarregada pelo Tratamento de Dados Pessoais (DPO Titular)',
      email: 'dpo@mascarellohaus.adv.br',
      phone: '+55 (49) 98822-0982',
    },
    substitute: {
      // TODO: preencher nome completo e telefone do Encarregado Substituto (pessoa natural ou jurídica)
      name: '[PREENCHER — Nome do Encarregado Substituto]',
      oab: '', // TODO: informar OAB se advogado(a)
      role: 'Encarregado Substituto (Ausências e Impedimentos — Res. CD/ANPD nº 18/2024)',
      email: 'dpo@mascarellohaus.adv.br',
      phone: '[PREENCHER — Telefone do Encarregado Substituto]',
    },
  },

  deadlines: {
    responseDeadlineDays: 15,
    completeResponseText: 'Até 15 dias, contados do requerimento (Art. 19, II)',
    simplifiedResponseText: 'Imediatamente, em formato simplificado (Art. 19, I)',
    incidentNotificationDays: 3, // Dias úteis conforme Res. CD/ANPD nº 15/2024
  },

  retention: {
    // TODO: validar todos os prazos de retenção abaixo com a Encarregada (DPO)
    contactForm: '2 anos (caso não evolua para contratação de serviços)',
    dataSubjectRequests: '5 anos (para comprovação de atendimento legal — Art. 18 e Art. 37 da LGPD)',
    whistleblowerReports: '[PREENCHER — Prazo de retenção do Canal de Denúncias após conclusão da apuração]',
    complianceQuiz: '2 anos (ou durante a vigência de eventual relação contratual)',
    whatsappAndEmail: '2 anos (caso não evolua para relação contratual)',
    cookiesEssential: 'Sessão até 12 meses',
    cookiesFunctional: '12 meses (ou até revogação pelo titular)',
  },

  documents: {
    privacyNotice: {
      version: '2.3',
      effectiveDate: '2026-11-17',
      effectiveDateBr: '17/11/2026',
    },
    termsOfUse: {
      version: '1.1',
      effectiveDate: '2026-11-17',
      effectiveDateBr: '17/11/2026',
    },
  },

  security: {
    encryptionNotice: 'Conexão protegida por encriptação.',
    ageNotice: 'Este canal é destinado a maiores de 18 anos.',
  },

  authority: {
    name: 'Autoridade Nacional de Proteção de Dados (ANPD)',
    url: 'https://www.gov.br/anpd',
  },

  developer: {
    name: 'ApexCode',
    url: 'https://www.apexcode.dev.br/',
    email: 'contato@apexcode.dev.br',
    whatsappUrl: 'https://wa.me/5549999281878',
  },
} as const;
