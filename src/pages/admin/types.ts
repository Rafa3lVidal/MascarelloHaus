export type DashboardTab =
  | 'overview'
  | 'posts'
  | 'pages'
  | 'content'
  | 'lgpd'
  | 'messages'
  | 'denuncias'
  | 'quizzes'
  | 'audit';

export type UserRole = 'admin' | 'editor' | 'dpo';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  mfa_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRecord {
  id: number;
  wp_id?: number | null;
  name: string;
  slug: string;
  description?: string;
}

export interface PostRecord {
  id: number;
  wp_id?: number | null;
  title: string;
  slug: string;
  content_html?: string;
  excerpt?: string;
  extra_text?: string;
  status: 'draft' | 'published' | 'scheduled' | string;
  category_id?: number | null;
  featured_image_url?: string | null;
  pdf_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  content_html?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PracticeAreaRecord {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  full_content_html: string;
  icon_svg?: string | null;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttachmentItem {
  name?: string;
  url: string;
  path?: string;
  size?: number;
  type?: string;
  fieldKey?: string;
  uploadedAt?: string;
}

export type LgpdStatus = 'recebido' | 'em_analise' | 'aguardando_titular' | 'concluido' | 'rejeitado';

export interface LgpdRequestRecord {
  id: string;
  protocol: string;
  requester_name: string;
  contact_channel: string;
  return_channels?: string[];
  contact_info: string;
  is_third_party: boolean;
  data_subject_name?: string | null;
  third_party_name?: string | null;
  request_type: string;
  description: string;
  has_prior_contact: boolean;
  prior_contact_details?: string | null;
  attachment_storage_path?: string | null;
  attachments_json?: AttachmentItem[];
  status: LgpdStatus;
  legal_deadline: string;
  internal_notes?: string | null;
  resolution_details?: string | null;
  resolved_at?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at?: string;
}

export type MessageStatus = 'pendente' | 'lido' | 'respondido';

export interface ContactMessageRecord {
  id: string;
  protocol?: string | null;
  name: string;
  email: string;
  phone: string;
  subject?: string | null;
  message?: string | null;
  privacy_consent: boolean;
  page_source?: string | null;
  attachments_json?: AttachmentItem[];
  status: MessageStatus | string;
  created_at: string;
}

export type WhistleblowerStatus = 'new' | 'investigating' | 'resolved' | 'archived';

export interface WhistleblowerRecord {
  id: number;
  protocol: string;
  concern_types: string[];
  works_at_firm?: string | null;
  has_compliance_complaint?: string | null;
  reporter_name?: string | null;
  involved_persons: string;
  incident_date?: string | null;
  incident_time?: string | null;
  incident_location?: string | null;
  description: string;
  is_anonymous: boolean;
  attachments_json?: AttachmentItem[];
  status: WhistleblowerStatus;
  created_at: string;
}

export interface QuizSubmissionRecord {
  id: string;
  quiz_id: number;
  protocol?: string | null;
  company_name: string;
  cnpj: string;
  contact_name: string;
  contact_email: string;
  address_json?: {
    rua?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    telefone?: string;
  } | null;
  answers_json?: Record<string, any> | null;
  attachments_json?: AttachmentItem[];
  final_score: number | null;
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  consent_type: string;
  granted: boolean;
  user_identifier?: string | null;
  policy_version: string;
  user_agent?: string | null;
  created_at: string;
}

export interface AuditLogRecord {
  id: number;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  table_name: string;
  record_id: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface SiteSettingsState {
  site_name: string;
  tagline: string;
  whatsapp: string;
  contact_email: string;
  dpo_email: string;
  address: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  facebook_url: string;
  banner_title: string;
  banner_subtitle: string;
  assessoria_title: string;
  assessoria_subtitle: string;
}

export const ATTACHMENT_FIELD_LABELS: Record<string, string> = {
  comunicado_assinado: 'Comunicado Assinado (Início)',
  comunicado_final_assinado: 'Comunicado Assinado (Conclusão)',
  q1_contrato: 'Q1 Cópia do Contrato',
  q2_politica: 'Q2 Política de Privacidade',
  q5_mapping_ropa: 'Q5 RAT / ROPA',
  q9_seguranca_cripto: 'Q9 Criptografia / Medidas de Segurança',
  q11_incidentes: 'Q11 Gestão de Incidentes',
  q18_terceiros: 'Q18 Gestão de Fornecedores / Terceiros',
  q19_inventario_ripd: 'Q19 Inventário de Dados / RIPD',
  q20_pentest: 'Q20 Testes de Vulnerabilidade / Pentest',
};

export const LGPD_STATUS_META: Record<LgpdStatus, { label: string; tone: 'info' | 'warning' | 'purple' | 'success' | 'danger' }> = {
  recebido: { label: 'Recebido', tone: 'info' },
  em_analise: { label: 'Em Análise', tone: 'warning' },
  aguardando_titular: { label: 'Aguardando Titular', tone: 'purple' },
  concluido: { label: 'Concluído', tone: 'success' },
  rejeitado: { label: 'Indeferido / Rejeitado', tone: 'danger' },
};

export const LGPD_REQUEST_TYPE_LABELS: Record<string, string> = {
  acesso: 'Confirmação e Acesso aos Dados',
  correcao: 'Correção de Dados Incompletos/Inexatos',
  eliminacao: 'Eliminação / Anonimização / Bloqueio',
  portabilidade: 'Portabilidade dos Dados',
  revogacao: 'Revogação de Consentimento',
  informacao_compartilhamento: 'Informação sobre Compartilhamento',
  revisao_automatizada: 'Revisão de Decisões Automatizadas',
  outros: 'Outras Requisições / Reclamação',
};

export const WHISTLEBLOWER_STATUS_META: Record<WhistleblowerStatus, { label: string; tone: 'danger' | 'warning' | 'success' | 'neutral' }> = {
  new: { label: 'Novo Relato', tone: 'danger' },
  investigating: { label: 'Em Apuração', tone: 'warning' },
  resolved: { label: 'Concluído', tone: 'success' },
  archived: { label: 'Arquivado', tone: 'neutral' },
};

export const MESSAGE_STATUS_META: Record<MessageStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  pendente: { label: 'Pendente', tone: 'warning' },
  lido: { label: 'Lido', tone: 'info' },
  respondido: { label: 'Respondido', tone: 'success' },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  dpo: 'Encarregado (DPO)',
  editor: 'Editor de Conteúdo',
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatDateBR(value?: string | null): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('pt-BR');
}

export function formatDateTimeBR(value?: string | null): string {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntilDeadline(deadlineDate?: string | null): number | null {
  if (!deadlineDate) return null;
  const target = new Date(deadlineDate.includes('T') ? deadlineDate : `${deadlineDate}T23:59:59`);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): void {
  const escapeCell = (val: string | number | boolean | null | undefined) => {
    const str = val === null || val === undefined ? '' : String(val);
    const sanitized = str.replace(/\r?\n/g, ' ');
    // Prevent CSV formula injection in Excel
    const formulaSafe = /^[=+\-@]/.test(sanitized) ? `'${sanitized}` : sanitized;
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  };

  const csvLines = [
    headers.map(escapeCell).join(';'),
    ...rows.map((row) => row.map(escapeCell).join(';')),
  ];

  const bom = '\uFEFF';
  const blob = new Blob([bom + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
