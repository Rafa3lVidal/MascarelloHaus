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
} from 'lucide-react';
import { validateFile, formatFileSize } from '../lib/formSecurity';

export interface FileUploaderProps {
  id?: string;
  label: string;
  description?: string;
  files: File[];
  onChange: (files: File[]) => void;
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
  files,
  onChange,
  maxFiles = 3,
  maxSizeMB = 10,
  allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  required = false,
  variant = 'light',
  compact = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const acceptAttr = allowedExtensions.map((ext) => `.${ext.replace(/^\./, '')}`).join(',');

  const handleFilesAdded = async (incomingList: FileList | null) => {
    if (!incomingList || incomingList.length === 0) return;
    setErrorMsg(null);

    const incoming = Array.from(incomingList);

    if (files.length + incoming.length > maxFiles) {
      setErrorMsg(
        maxFiles === 1
          ? 'É permitido anexar apenas 1 arquivo neste campo.'
          : `Limite máximo de ${maxFiles} arquivos atingido neste campo.`
      );
      return;
    }

    const validNewFiles: File[] = [];
    for (const file of incoming) {
      const isDuplicate = files.some((f) => f.name === file.name && f.size === file.size);
      if (isDuplicate) continue;

      const check = await validateFile(file, { maxSizeMB, allowedExtensions });
      if (!check.valid) {
        setErrorMsg(check.error || 'Arquivo inválido.');
        return;
      }
      validNewFiles.push(file);
    }

    if (validNewFiles.length > 0) {
      onChange(maxFiles === 1 ? [validNewFiles[0]] : [...files, ...validNewFiles]);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    setErrorMsg(null);
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return <ImageIcon size={18} />;
    if (['mp4', 'webm', 'mov'].includes(ext)) return <Film size={18} />;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return <Music size={18} />;
    if (['zip'].includes(ext)) return <Archive size={18} />;
    return <FileText size={18} />;
  };

  const isDark = variant === 'dark';

  return (
    <div className="mh-file-uploader" style={{ marginTop: compact ? '12px' : '16px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: compact ? '14px' : '15px',
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
            fontSize: '13px',
            color: isDark ? 'rgba(255,255,255,0.75)' : '#64748b',
            marginBottom: '10px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {files.length < maxFiles && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`${label}. Clique ou arraste arquivos aqui.`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
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
            handleFilesAdded(e.dataTransfer.files);
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
            padding: compact ? '16px' : '22px 18px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging
              ? isDark
                ? 'rgba(203, 171, 122, 0.14)'
                : 'rgba(13, 55, 50, 0.04)'
              : isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : '#f8fafc',
            transition: 'border-color 180ms ease-out, background-color 180ms ease-out, transform 150ms ease-out',
          }}
        >
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={acceptAttr}
            multiple={maxFiles > 1}
            onChange={(e) => handleFilesAdded(e.target.files)}
            style={{ display: 'none' }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: compact ? '36px' : '44px',
              height: compact ? '36px' : '44px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(203, 171, 122, 0.2)' : 'rgba(13, 55, 50, 0.08)',
              color: isDark ? '#cbab7a' : 'var(--color-primary)',
              marginBottom: '8px',
            }}
          >
            <Upload size={compact ? 18 : 22} />
          </div>

          <div
            style={{
              fontSize: compact ? '13.5px' : '14.5px',
              fontWeight: 500,
              color: isDark ? '#ffffff' : '#1e293b',
              marginBottom: '4px',
            }}
          >
            Clique para selecionar ou arraste {maxFiles > 1 ? 'os arquivos' : 'o arquivo'} aqui
          </div>

          <div
            style={{
              fontSize: '12px',
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
              Formatos: {allowedExtensions.map((e) => e.toUpperCase()).join(', ')} • Máx. {maxSizeMB} MB
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

      {files.length > 0 && (
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
                    <span>{formatFileSize(file.size)} • Verificado</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(idx)}
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
      )}
    </div>
  );
}
