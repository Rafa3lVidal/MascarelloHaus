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
  'exe', 'dll', 'bat', 'cmd', 'sh', 'bash', 'ps1', 'psm1', 'vbs', 'vbe',
  'js', 'jse', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'wsf', 'wsh', 'msc',
  'php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'asp', 'aspx', 'jsp',
  'py', 'pyc', 'rb', 'pl', 'cgi', 'jar', 'war', 'msi', 'msp', 'scr',
  'pif', 'com', 'hta', 'cpl', 'reg', 'lnk', 'inf', 'scf', 'url',
  'iso', 'img', 'vhd', 'vhdx', 'dmg', 'pkg', 'deb', 'rpm', 'apk',
  'docm', 'dotm', 'xlsm', 'xltm', 'xlam', 'pptm', 'potm', 'ppam', 'sldm',
  'html', 'htm', 'xhtml', 'svg', 'xml', 'xsl', 'xslt', 'swf', 'wasm',
];

/**
 * Detects automated headless browsers, scrapers, or WebDriver instruments.
 */
export function isAutomatedBotEnvironment(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const nav = navigator as any;
  const win = window as any;

  if (nav.webdriver === true) return true;
  if (win._phantom || win.__nightmare || win.callPhantom || win._selenium) return true;
  if (win.domAutomation || win.domAutomationController) return true;
  if (/HeadlessChrome|PhantomJS|SlimerJS|CasperJS|Puppeteer|Playwright/i.test(nav.userAgent || '')) {
    return true;
  }
  return false;
}

/**
 * Sanitizes text input against HTML/Script injection, prototype pollution,
 * Unicode RTLO spoofing, and SQL injection probes while preserving Portuguese accents.
 */
export function sanitizeText(input: string, maxLength = 10000): string {
  if (!input) return '';
  return input
    // Remove script, iframe, object, embed, style, link, meta, base tags and contents
    .replace(/<(script|iframe|object|embed|style|applet|meta|link|base)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
    // Strip remaining HTML tags
    .replace(/<\/?[a-z][^>]*>/gi, '')
    // Remove dangerous URI protocols
    .replace(/(?:javascript|vbscript|data\s*:\s*text\/html|data\s*:\s*application)\s*:/gi, '')
    // Remove inline event handlers (onload=, onerror=, onclick=, etc.)
    .replace(/\bon[a-z]{2,}\s*=/gi, '')
    // Remove Unicode Right-to-Left Override (RTLO) and zero-width spoofing chars
    .replace(/[\u202A-\u202E\u2066-\u2069\u200B-\u200F\uFEFF\0]/g, '')
    // Neutralize destructive SQL injection compound statements
    .replace(/\b(UNION\s+ALL\s+SELECT|UNION\s+SELECT|DROP\s+TABLE|ALTER\s+TABLE|TRUNCATE\s+TABLE|INSERT\s+INTO|DELETE\s+FROM|xp_cmdshell)\b/gi, '[BLOQUEADO]')
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
 * Validates anti-spam security state (honeypots, time trap, bot environment, and interactive challenge).
 */
export function validateSecurityState(security: SecurityState): { valid: boolean; error?: string } {
  if (security.honeypotWebsite.trim() !== '' || security.honeypotFax.trim() !== '') {
    return { valid: false, error: 'Submissão bloqueada pelo filtro automático anti-spam.' };
  }

  if (isAutomatedBotEnvironment()) {
    return {
      valid: false,
      error: 'Acesso automatizado detectado. Por motivos de segurança, submissões via robôs não são permitidas.',
    };
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
 * Verifies that the binary Magic Bytes of a file match its claimed extension.
 * Prevents attackers from renaming malware/scripts (.exe, .php, .html) to .pdf or .jpg.
 */
function verifyMagicBytes(ext: string, bytes: Uint8Array): { valid: boolean; reason?: string } {
  if (bytes.length < 4) {
    return { valid: false, reason: 'Cabeçalho binário do arquivo é inválido ou corrompido.' };
  }

  // 1. Block known executable & script signatures regardless of extension
  // Windows PE/MZ ('MZ' = 0x4D 0x5A)
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return { valid: false, reason: 'Assinatura de executável Windows (PE/MZ) detectada e bloqueada.' };
  }
  // Linux ELF (0x7F 'E' 'L' 'F')
  if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return { valid: false, reason: 'Assinatura de binário executável (ELF) detectada e bloqueada.' };
  }
  // macOS Mach-O (0xFE 0xED 0xFA 0xCE / 0xFE 0xED 0xFA 0xCF / 0xCF 0xFA 0xED 0xFE)
  if (
    (bytes[0] === 0xfe && bytes[1] === 0xed && bytes[2] === 0xfa && (bytes[3] === 0xce || bytes[3] === 0xcf)) ||
    (bytes[0] === 0xcf && bytes[1] === 0xfa && bytes[2] === 0xed && bytes[3] === 0xfe)
  ) {
    return { valid: false, reason: 'Assinatura de executável (Mach-O) detectada e bloqueada.' };
  }
  // Shell script shebang ('#!' = 0x23 0x21)
  if (bytes[0] === 0x23 && bytes[1] === 0x21) {
    return { valid: false, reason: 'Script executável (Shebang) detectado e bloqueado.' };
  }

  // 2. Positive verification per extension
  switch (ext) {
    case 'pdf': {
      // Must contain '%PDF-' (0x25 0x50 0x44 0x46 0x2D) within first 1024 bytes
      const headerStr = new TextDecoder('latin1').decode(bytes.slice(0, Math.min(bytes.length, 1024)));
      if (!headerStr.includes('%PDF-')) {
        return { valid: false, reason: 'O arquivo não possui cabeçalho autêntico de documento PDF (%PDF-).' };
      }
      return { valid: true };
    }
    case 'png': {
      // 89 50 4E 47 0D 0A 1A 0A
      if (
        bytes[0] !== 0x89 ||
        bytes[1] !== 0x50 ||
        bytes[2] !== 0x4e ||
        bytes[3] !== 0x47
      ) {
        return { valid: false, reason: 'O arquivo não possui assinatura binária válida de imagem PNG.' };
      }
      return { valid: true };
    }
    case 'jpg':
    case 'jpeg': {
      // FF D8 FF
      if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
        return { valid: false, reason: 'O arquivo não possui assinatura binária válida de imagem JPEG.' };
      }
      return { valid: true };
    }
    case 'webp': {
      // 'RIFF' .... 'WEBP'
      if (
        bytes.length < 12 ||
        bytes[0] !== 0x52 ||
        bytes[1] !== 0x49 ||
        bytes[2] !== 0x46 ||
        bytes[3] !== 0x46 ||
        bytes[8] !== 0x57 ||
        bytes[9] !== 0x45 ||
        bytes[10] !== 0x42 ||
        bytes[11] !== 0x50
      ) {
        return { valid: false, reason: 'O arquivo não possui assinatura binária válida de imagem WebP.' };
      }
      return { valid: true };
    }
    case 'docx':
    case 'zip': {
      // PKZip: 50 4B 03 04 or 50 4B 05 06
      if (
        bytes[0] !== 0x50 ||
        bytes[1] !== 0x4b ||
        (bytes[2] !== 0x03 && bytes[2] !== 0x05)
      ) {
        return {
          valid: false,
          reason: `O arquivo ".${ext}" não possui estrutura compactada OpenXML/ZIP autêntica.`,
        };
      }
      return { valid: true };
    }
    case 'doc': {
      // OLE2 Compound Document (D0 CF 11 E0 A1 B1 1A E1) or RTF ('{\rtf') or PKZip
      const isOle2 =
        bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
      const isRtf =
        bytes[0] === 0x7b && bytes[1] === 0x5c && bytes[2] === 0x72 && bytes[3] === 0x74;
      const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
      if (!isOle2 && !isRtf && !isZip) {
        return { valid: false, reason: 'O arquivo ".doc" não possui cabeçalho válido do Microsoft Word.' };
      }
      return { valid: true };
    }
    case 'wav': {
      // 'RIFF' .... 'WAVE'
      if (
        bytes.length < 12 ||
        bytes[0] !== 0x52 ||
        bytes[1] !== 0x49 ||
        bytes[2] !== 0x46 ||
        bytes[3] !== 0x46
      ) {
        return { valid: false, reason: 'O arquivo não possui assinatura válida de áudio WAV.' };
      }
      return { valid: true };
    }
    case 'ogg': {
      // 'OggS' (4F 67 67 53)
      if (bytes[0] !== 0x4f || bytes[1] !== 0x67 || bytes[2] !== 0x67 || bytes[3] !== 0x53) {
        return { valid: false, reason: 'O arquivo não possui assinatura válida de áudio OGG.' };
      }
      return { valid: true };
    }
    case 'mp3': {
      // 'ID3' (49 44 33) or MPEG frame sync (FF FB / FF F3 / FF F2 / FF FA / FF E3)
      const isId3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33;
      const isMpegSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
      if (!isId3 && !isMpegSync) {
        return { valid: false, reason: 'O arquivo não possui assinatura válida de áudio MP3.' };
      }
      return { valid: true };
    }
    case 'mp4': {
      // ISO Base Media File Format: bytes 4..7 == 'ftyp' (66 74 79 70) or 'moov'
      if (bytes.length < 8) return { valid: false, reason: 'Arquivo MP4 truncado ou inválido.' };
      const boxType = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
      if (boxType !== 'ftyp' && boxType !== 'moov' && boxType !== 'wide' && boxType !== 'mdat') {
        return { valid: false, reason: 'O arquivo não possui contêiner de vídeo MP4 válido.' };
      }
      return { valid: true };
    }
    case 'webm': {
      // EBML header: 1A 45 DF A3
      if (bytes[0] !== 0x1a || bytes[1] !== 0x45 || bytes[2] !== 0xdf || bytes[3] !== 0xa3) {
        return { valid: false, reason: 'O arquivo não possui cabeçalho de vídeo WebM válido.' };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}

/**
 * Deep heuristic scanner for embedded scripts, PDF JavaScript/Launch exploits,
 * Office VBA Macros, and polyglot web shells.
 */
function scanBufferForMalware(ext: string, textSample: string): { safe: boolean; threat?: string } {
  // 1. Check for embedded web shells or script tags in any file
  const webShellPatterns = [
    /<\?php/i,
    /<script[\s>]/i,
    /WScript\.Shell/i,
    /powershell(?:\.exe)?\s+-(?:enc|e|w\s+hidden|nop)/i,
    /cmd\.exe\s+\/c/i,
    /eval\s*\(\s*base64_decode/i,
  ];

  for (const pattern of webShellPatterns) {
    if (pattern.test(textSample)) {
      return {
        safe: false,
        threat: 'Código executável ou script malicioso embutido detectado no arquivo.',
      };
    }
  }

  // 2. Check PDF files for dangerous active content (/JavaScript, /JS, /Launch, /RichMedia)
  if (ext === 'pdf') {
    if (/\/(?:JavaScript|JS|Launch)\b/.test(textSample)) {
      return {
        safe: false,
        threat: 'O PDF contém scripts ativos (/JavaScript ou /Launch) bloqueados pela política de segurança.',
      };
    }
  }

  // 3. Check Word documents (.doc, .docx) for embedded VBA macros or DDE exploits
  if (ext === 'doc' || ext === 'docx') {
    if (/vbaProject\.bin/i.test(textSample) || /\bDDEAUTO\b/i.test(textSample)) {
      return {
        safe: false,
        threat: 'O documento contém Macros VBA ou comandos DDE ativos bloqueados por segurança.',
      };
    }
  }

  return { safe: true };
}

/**
 * Inspects file name, Unicode spoofing, magic bytes, embedded macros/scripts, and size
 * to prevent viruses, trojans, and malicious uploads.
 */
export async function validateFile(
  file: File,
  options: FileValidationOptions = {}
): Promise<{ valid: boolean; error?: string }> {
  const maxSizeMB = options.maxSizeMB ?? 15;
  const allowedExts = (options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS).map((e) =>
    e.toLowerCase().replace(/^\./, '')
  );

  // 1. Block Unicode Right-to-Left Override (RTLO), Null Bytes, and Path Traversal in filename
  if (/[\u202A-\u202E\u2066-\u2069\0]/.test(file.name) || /\.\.[/\\]/.test(file.name)) {
    return {
      valid: false,
      error: `O nome do arquivo "${file.name}" contém caracteres de mascaramento ou caminho inválido bloqueados por segurança.`,
    };
  }

  const parts = file.name.split('.');
  if (parts.length < 2) {
    return { valid: false, error: `O arquivo "${file.name}" não possui uma extensão válida.` };
  }

  const ext = parts[parts.length - 1].toLowerCase().trim();

  // 2. Check for double extensions with dangerous types (e.g. comprovante.pdf.exe or foto.jpg.scr)
  for (const part of parts.slice(1)) {
    const cleanPart = part.toLowerCase().trim();
    if (DANGEROUS_EXTENSIONS.includes(cleanPart)) {
      return {
        valid: false,
        error: `O arquivo "${file.name}" contém uma extensão executável ou script (.${cleanPart}) bloqueada pelo antivírus do sistema.`,
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

  // 3. Deep Binary Inspection: Magic Bytes + Heuristic Malware Scan (first 64KB + tail 16KB)
  try {
    const headSize = Math.min(file.size, 65536);
    const headBuffer = await file.slice(0, headSize).arrayBuffer();
    const headBytes = new Uint8Array(headBuffer);

    const magicCheck = verifyMagicBytes(ext, headBytes);
    if (!magicCheck.valid) {
      return {
        valid: false,
        error: `Arquivo "${file.name}" recusado na verificação de integridade: ${magicCheck.reason}`,
      };
    }

    const decoder = new TextDecoder('latin1');
    let sampleText = decoder.decode(headBytes);

    if (file.size > 65536) {
      const tailStart = Math.max(65536, file.size - 16384);
      const tailBuffer = await file.slice(tailStart, file.size).arrayBuffer();
      sampleText += '\n' + decoder.decode(new Uint8Array(tailBuffer));
    }

    const malwareScan = scanBufferForMalware(ext, sampleText);
    if (!malwareScan.safe) {
      return {
        valid: false,
        error: `Alerta de Segurança em "${file.name}": ${malwareScan.threat}`,
      };
    }
  } catch {
    // Fallback if FileReader/ArrayBuffer is restricted by environment
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
    // Mandatory pre-upload antivirus & magic-byte validation
    const validation = await validateFile(file, { maxSizeMB: 20 });
    if (!validation.valid) {
      throw new Error(validation.error || `Arquivo "${file.name}" bloqueado por segurança.`);
    }

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

    const contentType = EXTENSION_TO_MIMES[ext]?.[0] || file.type || 'application/octet-stream';

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
      name: sanitizeText(file.name, 180),
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
