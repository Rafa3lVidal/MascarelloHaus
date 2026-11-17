import { LEGAL_CONFIG } from './legal';

export type CookieCategoryKey = 'necessary' | 'functional' | 'analytics';

export type CookieCategoryLabel = 'Necessário' | 'Funcional' | 'Analítico';

export interface CookieInventoryItem {
  id: string;
  name: string;
  provider: string;
  category: CookieCategoryLabel;
  categoryKey: CookieCategoryKey;
  purpose: string;
  retention: string;
  storageType: 'localStorage' | 'sessionStorage' | 'cookie';
}

export interface CookieCategoryMeta {
  key: CookieCategoryKey;
  label: CookieCategoryLabel;
  title: string;
  description: string;
  required: boolean;
  legalBasis: string;
}

export const COOKIE_CATEGORIES_META: CookieCategoryMeta[] = [
  {
    key: 'necessary',
    label: 'Necessário',
    title: 'Cookies e Armazenamentos Estritamente Necessários',
    description:
      'Indispensáveis para segurança contra envio automatizado (anti-bot), autenticação administrativa e registro da sua escolha de consentimento.',
    required: true,
    legalBasis: 'Art. 7º, IX da LGPD (Legítimo Interesse / Segurança e Funcionamento Essencial)',
  },
  {
    key: 'functional',
    label: 'Funcional',
    title: 'Cookies e Armazenamentos Funcionais',
    description:
      'Permitem salvar rascunhos locais de formulários longos (Central do Titular, Canal de Denúncias e Questionário de Conformidade) para evitar perda de dados durante o preenchimento.',
    required: false,
    legalBasis: 'Art. 7º, I da LGPD (Consentimento do Titular)',
  },
  {
    key: 'analytics',
    label: 'Analítico',
    title: 'Cookies Analíticos',
    description:
      'Métricas de acesso e desempenho do portal. Atualmente não há cookies analíticos de terceiros ativos em produção.',
    required: false,
    legalBasis: 'Art. 7º, I da LGPD (Consentimento do Titular)',
  },
];

/**
 * Fonte única da verdade para todos os cookies e chaves de armazenamento local
 * efetivamente utilizados em produção pelo portal Mascârello Haus.
 *
 * Consumido pelo Banner de Cookies, Modal de Preferências, Aviso de Privacidade e Painel Admin.
 */
export const COOKIE_INVENTORY: CookieInventoryItem[] = [
  {
    id: 'ck-consent',
    name: 'lgpd_cookie_consent / lgpd_cookie_preferences',
    provider: 'Mascârello Haus (Próprio)',
    category: 'Necessário',
    categoryKey: 'necessary',
    purpose: 'Registra a decisão e as preferências de privacidade e cookies do titular no navegador.',
    retention: LEGAL_CONFIG.retention.cookiesEssential,
    storageType: 'localStorage',
  },
  {
    id: 'ck-sec-seed',
    name: 'mh_sec_seed',
    provider: 'Mascârello Haus (Próprio)',
    category: 'Necessário',
    categoryKey: 'necessary',
    purpose: 'Semente de integridade e proteção anti-spam/anti-bot para envio seguro dos formulários.',
    retention: 'Sessão (sessionStorage)',
    storageType: 'sessionStorage',
  },
  {
    id: 'ck-rate-limit',
    name: 'mh_rl_*',
    provider: 'Mascârello Haus (Próprio)',
    category: 'Necessário',
    categoryKey: 'necessary',
    purpose: 'Controle local de frequência de envios (rate limit) para prevenir abuso e sobrecarga nos formulários.',
    retention: 'Sessão / Temporário',
    storageType: 'localStorage',
  },
  {
    id: 'ck-supabase-auth',
    name: 'sb-iwzimemdxchmcrvlyhxg-auth-token',
    provider: 'Supabase Auth (Restrito à área administrativa)',
    category: 'Necessário',
    categoryKey: 'necessary',
    purpose: 'Token de sessão exclusiva para autenticação de usuários administradores no painel interno (/admin).',
    retention: 'Sessão autenticada',
    storageType: 'localStorage',
  },
  {
    id: 'ck-drafts',
    name: 'mh_draft_* / mh_form_state_*',
    provider: 'Mascârello Haus (Próprio)',
    category: 'Funcional',
    categoryKey: 'functional',
    purpose:
      'Salvamento automático de rascunhos locais nos formulários (Central do Titular, Canal de Denúncias e Questionário de Conformidade). Gravado apenas mediante consentimento funcional.',
    retention: 'Até envio do formulário, limpeza manual ou revogação do consentimento funcional',
    storageType: 'localStorage',
  },
];

export function getActiveCookieCategories(): CookieCategoryMeta[] {
  return COOKIE_CATEGORIES_META.filter((cat) =>
    COOKIE_INVENTORY.some((item) => item.categoryKey === cat.key)
  );
}
