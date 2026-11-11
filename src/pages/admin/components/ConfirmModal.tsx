import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={() => !busy && onCancel()}>
      <div className="admin-modal-card admin-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`confirm-icon-wrap ${variant}`}>
              <AlertTriangle size={18} />
            </div>
            <h3 id="confirm-modal-title">{title}</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onCancel} disabled={busy} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-form" style={{ paddingBottom: '12px' }}>
          <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.93rem' }}>{message}</p>

          <div className="admin-modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={busy}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={variant === 'danger' ? 'btn-danger-main' : 'btn-save-main'}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? 'Processando...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
