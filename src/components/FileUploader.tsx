import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  validateFile,
  formatFileSize,
  UploadedAttachment,
  uploadFormFiles,
} from '../lib/formSecurity';

export interface FileUploaderProps {
  id?: string;
  label: string;
  description?: string;
  // Local files mode
  files?: File[];
  onChange?: (files: File[]) => void;
  // Immediate upload mode (preserves attachments in state & drafts)
  attachments?: UploadedAttachment[];
  onAttachmentsChange?: (attachments: UploadedAttachment[]) => void;
  autoUpload?: boolean;
  folder?: 'contato' | 'lgpd' | 'denuncias' | 'conformidade';
  fieldKey?: string;

  maxFiles?: number;
  maxSizeMB?: number;
  allowedExtensions?: string[];
  required?: boolean;
  variant?: 'dark' | 'light';
  compact?: boolean;
}

export default function FileUploader({
  id,
  label,
  description,
  files = [],
  onChange,
  attachments = [],
  onAttachmentsChange,
  autoUpload = false,
  folder = 'conformidade',
  fieldKey,
  maxFiles = 3,
  maxSizeMB = 10,
  allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  required = false,
  variant = 'light',
  compact = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAttachmentMode = autoUpload || Boolean(onAttachmentsChange);
  const totalCount = isAttachmentMode ? attachments.length : files.length;

  const acceptAttr = allowedExtensions.map((ext) => `.${ext.replace(/^\./, '')}`).join(',');

  const handleFilesAdded = async (incomingList: FileList | null) => {
    if (!incomingList || incomingList.length === 0) return;
    setErrorMsg(null);

    const incoming = Array.from(incomingList);

    if (totalCount + incoming.length > maxFiles) {
      setErrorMsg(
        maxFiles === 1
          ? 'É permitido anexar apenas 1 arquivo neste campo.'
          : `Limite máximo de ${maxFiles} arquivos atingido neste campo.`
      );
      return;
    }

    const validNewFiles: File[] = [];
    for (const file of incoming) {
      const isDuplicate = isAttachmentMode
        ? attachments.some((a) => a.name === file.name && a.size === file.size)
        : files.some((f) => f.name === file.name && f.size === file.size);

      if (isDuplicate) continue;

      const check = await validateFile(file, { maxSizeMB, allowedExtensions });
      if (!check.valid) {
        setErrorMsg(check.error || 'Arquivo inválido.');
        return;
      }
      validNewFiles.push(file);
    }

    if (validNewFiles.length === 0) return;

    if (isAttachmentMode && onAttachmentsChange) {
      setIsUploading(true);
      setUploadStatusText(`Enviando ${validNewFiles.length > 1 ? `${validNewFiles.length} arquivos` : validNewFiles[0].name} com segurança...`);

      try {
        const uploaded = await uploadFormFiles(validNewFiles, folder, fieldKey);
        const updated = maxFiles === 1 ? uploaded : [...attachments, ...uploaded];
        onAttachmentsChange(updated);
        setUploadStatusText(null);
      } catch (err: any) {
        console.error('Erro no upload imediato:', err);
        setErrorMsg(err?.message || 'Falha ao enviar arquivo para o servidor.');
      } finally {
        setIsUploading(false);
      }
    } else if (onChange) {
      onChange(maxFiles === 1 ? [validNewFiles[0]] : [...files, ...validNewFiles]);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemoveItem = (index: number) => {
    setErrorMsg(null);
    if (isAttachmentMode && onAttachmentsChange) {
      const updated = attachments.filter((_, i) => i !== index);
      onAttachmentsChange(updated);
    } else if (onChange) {
      const updated = files.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) return <ImageIcon size={18} />;
    if (['mp4', 'webm', 'mov'].includes(ext)) return <Film size={18} />;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return <Music size={18} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <Archive size={18} />;
    return <FileText size={18} />;
  };

  const isDark = variant === 'dark';

  return (
    <div className="mh-file-uploader" style={{ marginTop: compact ? '10px' : '14px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: compact ? '13.5px' : '14.5px',
          fontWeight: 600,
          color: isDark ? '#ffffff' : 'var(--color-primary)',
          marginBottom: '6px',
        }}
      >
        {label} {required && <span style={{ color: isDark ? '#cbab7a' : '#ef4444' }}>*</span>}
      </label>

      {description && (
        <p
          style={{
            fontSize: '12.5px',
            color: isDark ? 'rgba(255,255,255,0.75)' : '#64748b',
            marginBottom: '8px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {totalCount < maxFiles && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`${label}. Clique ou arraste arquivos aqui.`}
          onClick={() => {
            if (!isUploading) inputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isUploading) setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (!isUploading) handleFilesAdded(e.dataTransfer.files);
          }}
          style={{
            border: `2px dashed ${
              isDragging
                ? '#cbab7a'
                : isDark
                ? 'rgba(203, 171, 122, 0.45)'
                : '#cbd5e1'
            }`,
            borderRadius: '10px',
            padding: compact ? '14px 16px' : '20px 18px',
            textAlign: 'center',
            cursor: isUploading ? 'wait' : 'pointer',
            backgroundColor: isDragging
              ? isDark
                ? 'rgba(203, 171, 122, 0.14)'
                : 'rgba(13, 55, 50, 0.04)'
              : isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : '#f8fafc',
            transition: 'border-color 180ms ease-out, background-color 180ms ease-out, transform 150ms ease-out',
            opacity: isUploading ? 0.8 : 1,
          }}
        >
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={acceptAttr}
            multiple={maxFiles > 1}
            disabled={isUploading}
            onChange={(e) => handleFilesAdded(e.target.files)}
            style={{ display: 'none' }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: compact ? '36px' : '42px',
              height: compact ? '36px' : '42px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(203, 171, 122, 0.2)' : 'rgba(13, 55, 50, 0.08)',
              color: isDark ? '#cbab7a' : 'var(--color-primary)',
              marginBottom: '6px',
            }}
          >
            {isUploading ? (
              <Loader2 size={compact ? 18 : 22} className="mh-spin" style={{ color: '#cbab7a' }} />
            ) : (
              <Upload size={compact ? 18 : 22} />
            )}
          </div>

          <div
            style={{
              fontSize: compact ? '13px' : '14px',
              fontWeight: 600,
              color: isDark ? '#ffffff' : '#1e293b',
              marginBottom: '3px',
            }}
          >
            {isUploading
              ? (uploadStatusText || 'Enviando arquivo...')
              : `Clique para selecionar ou arraste ${maxFiles > 1 ? 'os arquivos' : 'o arquivo'} aqui`}
          </div>

          <div
            style={{
              fontSize: '11.5px',
              color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <ShieldCheck size={13} style={{ color: '#cbab7a' }} />
            <span>
              Formatos aceitos: {allowedExtensions.map((e) => e.toUpperCase()).join(', ')} • Máx. {maxSizeMB} MB
              {maxFiles > 1 ? ` (até ${maxFiles} arquivos)` : ''}
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          style={{
            marginTop: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.5)' : '#fecaca'}`,
            color: isDark ? '#fca5a5' : '#b91c1c',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Render Attached / Uploaded Files */}
      {isAttachmentMode ? (
        attachments.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attachments.map((att, idx) => (
              <div
                key={`${att.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(203, 171, 122, 0.4)' : '#cbd5e1'}`,
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ color: isDark ? '#cbab7a' : 'var(--color-primary)', flexShrink: 0 }}>
                    {getFileIcon(att.name)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: isDark ? '#ffffff' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={att.name}
                    >
                      {att.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                        <CheckCircle2 size={12} /> Anexado e Verificado
                      </span>
                      <span>• {formatFileSize(att.size)}</span>
                      {att.url && (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: isDark ? '#cbab7a' : 'var(--color-primary)',
                            textDecoration: 'underline',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          Visualizar <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  title="Remover anexo"
                  aria-label={`Remover anexo ${att.name}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        files.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                  border: `1px solid ${isDark ? 'rgba(203, 171, 122, 0.4)' : '#e2e8f0'}`,
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ color: isDark ? '#cbab7a' : 'var(--color-primary)', flexShrink: 0 }}>
                    {getFileIcon(file.name)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: isDark ? '#ffffff' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={12} style={{ color: '#22c55e' }} />
                      <span>{formatFileSize(file.size)} • Pronto para envio</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  title="Remover arquivo"
                  aria-label={`Remover arquivo ${file.name}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
