import { supabase } from './supabase';

export interface UploadedAttachment {
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  fieldKey?: string;
  uploadedAt: string;
}

export interface SecurityState {
  honeypotWebsite: string;
  honeypotFax: string;
  mountedAt: number;
  verified: boolean;
  challengeToken: string;
  turnstileToken?: string;
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedExtensions?: string[];
}

export const DEFAULT_ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'zip',
];

const EXTENSION_TO_MIMES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  mp3: ['audio/mpeg', 'audio/mp3'],
  wav: ['audio/wav', 'audio/x-wav'],
  ogg: ['audio/ogg'],
  mp4: ['video/mp4', 'audio/mp4'],
  webm: ['video/webm'],
  zip: ['application/zip', 'application/x-zip-compressed'],
};

const DANGEROUS_EXTENSIONS = [
  'exe', 'dll', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'jsx', 'ts', 'tsx',
  'php', 'phtml', 'py', 'rb', 'pl', 'cgi', 'jar', 'msi', 'scr', 'com', 'html', 'htm', 'svg'
];

/**
 * Sanitizes text input against HTML/Script injection while keeping natural punctuation and accents.
 */
export function sanitizeText(input: string, maxLength = 10000): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\0/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(input: string): string {
  return sanitizeText(input, 254).toLowerCase().replace(/\s+/g, '');
}

/**
 * Brazilian phone mask: (49) 99999-9999 or (49) 3566-1234
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Brazilian CNPJ mask: 00.000.000/0000-00
 */
export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Brazilian CEP mask: 00000-000
 */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function isValidEmail(email: string): boolean {
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11 && !/^(\d)\1+$/.test(digits);
}

export function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(digits.slice(0, 12), w1);
  const d2 = calcDigit(digits.slice(0, 12) + d1, w2);

  return Number(digits[12]) === d1 && Number(digits[13]) === d2;
}

export function generateProtocol(prefix: 'CONT' | 'LGPD' | 'DEN' | 'CONF'): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `MH-${prefix}-${year}${month}-${randomPart}`;
}

/**
 * Generates an anonymized SHA-256 session/browser hash for anti-spam rate limiting
 * without storing raw IP addresses (LGPD privacy-by-design).
 */
export async function getAnonymousIpHash(): Promise<string> {
  try {
    let seed = sessionStorage.getItem('mh_sec_seed');
    if (!seed) {
      seed = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().toISOString().slice(0, 10)}`;
      sessionStorage.setItem('mh_sec_seed', seed);
    }
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(seed);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    }
    // Fallback deterministic hash
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return `anon_${Math.abs(hash).toString(16).padStart(12, '0')}`;
  } catch {
    return 'anon_fallback_hash';
  }
}

/**
 * Client-side rate limiter to prevent rapid form spamming.
 */
export function checkClientRateLimit(
  formId: string,
  maxSubmits = 4,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number } {
  try {
    const key = `mh_rl_${formId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = timestamps.filter((ts) => now - ts < windowMs);

    if (recent.length >= maxSubmits) {
      const oldest = recent[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      return { allowed: false, retryAfterSeconds };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

export function recordClientSubmission(formId: string, windowMs = 10 * 60 * 1000): void {
  try {
    const key = `mh_rl_${formId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = timestamps.filter((ts) => now - ts < windowMs);
    recent.push(now);
    localStorage.setItem(key, JSON.stringify(recent));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Validates anti-spam security state (honeypots, time trap, and interactive challenge).
 */
export function validateSecurityState(security: SecurityState): { valid: boolean; error?: string } {
  if (security.honeypotWebsite.trim() !== '' || security.honeypotFax.trim() !== '') {
    return { valid: false, error: 'Submissão bloqueada pelo filtro automático anti-spam.' };
  }

  const elapsedMs = Date.now() - security.mountedAt;
  if (elapsedMs < 1800) {
    return {
      valid: false,
      error: 'Envio muito rápido detectado. Por favor, aguarde um instante e confirme os dados antes de enviar.',
    };
  }

  if (!security.verified || !security.challengeToken) {
    return {
      valid: false,
      error: 'Por favor, marque a verificação de segurança anti-spam antes de enviar o formulário.',
    };
  }

  return { valid: true };
}

/**
 * Inspects file magic bytes, extension, and size to prevent malicious uploads.
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<{ valid: boolean; error?: string }> {
  const maxSizeMB = options.maxSizeMB ?? 15;
  const allowedExts = (options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS).map((e) =>
    e.toLowerCase().replace(/^\./, '')
  );

  const parts = file.name.split('.');
  if (parts.length < 2) {
    return { valid: false, error: `O arquivo "${file.name}" não possui uma extensão válida.` };
  }

  const ext = parts[parts.length - 1].toLowerCase();

  // Check for double extensions with dangerous types (e.g. documento.pdf.exe)
  for (const part of parts.slice(1)) {
    if (DANGEROUS_EXTENSIONS.includes(part.toLowerCase())) {
      return {
        valid: false,
        error: `O arquivo "${file.name}" contém uma extensão executável ou não permitida por motivos de segurança.`,
      };
    }
  }

  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Formato ".${ext}" não permitido em "${file.name}". Formatos aceitos: ${allowedExts
        .map((e) => e.toUpperCase())
        .join(', ')}.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: `O arquivo "${file.name}" está vazio (0 bytes).` };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `O arquivo "${file.name}" (${formatFileSize(file.size)}) excede o limite máximo de ${maxSizeMB} MB.`,
    };
  }

  // Inspect first 8 bytes for executable headers (MZ / ELF / Script shebang)
  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length >= 2) {
      // Windows PE executable 'MZ' (0x4D 0x5A)
      if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
        return { valid: false, error: `O arquivo "${file.name}" foi bloqueado por conter assinatura de executável.` };
      }
      // Linux ELF binary (0x7F 'E' 'L' 'F')
      if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
        return { valid: false, error: `O arquivo "${file.name}" foi bloqueado por conter assinatura binária não permitida.` };
      }
      // Shell script '#!' (0x23 0x21)
      if (bytes[0] === 0x23 && bytes[1] === 0x21) {
        return { valid: false, error: `O arquivo "${file.name}" foi bloqueado por conter script executável.` };
      }
    }
  } catch {
    // Proceed if ArrayBuffer slice is unsupported
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Uploads validated files to Supabase Storage (`form-attachments` bucket)
 */
export async function uploadFormFiles(
  files: File[],
  folder: 'contato' | 'lgpd' | 'denuncias' | 'conformidade',
  fieldKey?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadedAttachment[]> {
  if (!files || files.length === 0) return [];

  const uploaded: UploadedAttachment[] = [];
  let completed = 0;

  for (const file of files) {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const baseName = file.name
      .replace(/\.[^/.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 48);

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const storagePath = `${folder}/${uniqueId}-${baseName}.${ext}`;

    const contentType = file.type || EXTENSION_TO_MIMES[ext]?.[0] || 'application/octet-stream';

    const { error } = await supabase.storage
      .from('form-attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (error) {
      throw new Error(`Falha ao enviar o arquivo "${file.name}": ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('form-attachments')
      .getPublicUrl(storagePath);

    uploaded.push({
      name: file.name,
      url: publicUrlData.publicUrl,
      path: storagePath,
      size: file.size,
      type: contentType,
      fieldKey,
      uploadedAt: new Date().toISOString(),
    });

    completed += 1;
    onProgress?.(completed, files.length);
  }

  return uploaded;
}

/**
 * Records proof of LGPD consent in `public.consent_records`
 */
export async function recordFormConsent(consentType: string, userIdentifier?: string): Promise<void> {
  try {
    const ipHash = await getAnonymousIpHash();
    await supabase.from('consent_records').insert([
      {
        consent_type: consentType,
        granted: true,
        user_identifier: userIdentifier ? sanitizeText(userIdentifier, 120) : 'anonymous',
        policy_version: '2026.1',
        ip_hash: ipHash,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 250) : 'web',
      },
    ]);
  } catch {
    // Non-blocking audit log
  }
}

/**
 * Form Draft Persistence (saves to sessionStorage or localStorage when mh_cookie_consent allows functional)
 */
export function saveFormDraft<T>(formKey: string, data: T): void {
  try {
    const payload = JSON.stringify({ updatedAt: Date.now(), data });
    sessionStorage.setItem(`mh_draft_${formKey}`, payload);
    const consentRaw = localStorage.getItem('mh_cookie_consent');
    if (consentRaw) {
      const consent = JSON.parse(consentRaw);
      if (consent?.functional) {
        localStorage.setItem(`mh_form_state_${formKey}`, payload);
      }
    }
  } catch {
    // Ignore quota errors
  }
}

export function loadFormDraft<T>(formKey: string): T | null {
  try {
    const sessionRaw = sessionStorage.getItem(`mh_draft_${formKey}`);
    const localRaw = localStorage.getItem(`mh_form_state_${formKey}`);
    const raw = sessionRaw || localRaw;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire drafts older than 7 days
    if (parsed?.updatedAt && Date.now() - parsed.updatedAt < 7 * 24 * 60 * 60 * 1000) {
      return parsed.data as T;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearFormDraft(formKey: string): void {
  try {
    sessionStorage.removeItem(`mh_draft_${formKey}`);
    localStorage.removeItem(`mh_form_state_${formKey}`);
  } catch {
    // Ignore
  }
}
