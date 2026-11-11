import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  X,
  Mail,
  Phone,
  Paperclip,
  MessageSquare,
  Check,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  ContactMessageRecord,
  MESSAGE_STATUS_META,
  MessageStatus,
  exportToCsv,
  formatDateBR,
  formatDateTimeBR,
  formatFriendlyError,
} from '../types';

interface MessagesTabProps {
  messages: ContactMessageRecord[];
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  messages,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessageRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedMsg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) setSelectedMsg(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedMsg, saving]);

  const handleUpdateStatus = async (msg: ContactMessageRecord, nextStatus: MessageStatus) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: nextStatus })
        .eq('id', msg.id);

      if (error) throw error;
      await onAudit('UPDATE', 'contact_messages', msg.protocol || msg.id, { status: msg.status }, { status: nextStatus });
      onShowToast('success', `Mensagem marcada como "${MESSAGE_STATUS_META[nextStatus].label}".`);
      if (selectedMsg?.id === msg.id) {
        setSelectedMsg({ ...msg, status: nextStatus });
      }
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível atualizar o status da mensagem.'));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMessage = async (msg: ContactMessageRecord) => {
    setSelectedMsg(msg);
    if ((msg.status || 'pendente') === 'pendente') {
      // Auto-mark as 'lido' when opened
      await handleUpdateStatus(msg, 'lido');
    }
  };

  const filteredMessages = messages.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.subject || '').toLowerCase().includes(q) ||
      (m.message || '').toLowerCase().includes(q) ||
      (m.protocol || '').toLowerCase().includes(q);
    const currentStatus = (m.status || 'pendente').toLowerCase();
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCsv(
      `mensagens-contato-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Protocolo', 'Nome', 'E-mail', 'Telefone', 'Assunto', 'Origem', 'Mensagem', 'Status', 'Data'],
      filteredMessages.map((m) => [
        m.protocol || '-',
        m.name,
        m.email,
        m.phone,
        m.subject || 'Contato Institucional',
        m.page_source || '-',
        m.message || '-',
        m.status || 'pendente',
        formatDateTimeBR(m.created_at),
      ])
    );
  };

  const cleanWhatsappDigits = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`;
  };

  return (
    <div>
      <div className="toolbar-bar">
        <div className="toolbar-filters">
          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, assunto ou protocolo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar mensagens por status"
          >
            <option value="all">Todas ({messages.length})</option>
            <option value="pendente">Pendentes</option>
            <option value="lido">Lidas</option>
            <option value="respondido">Respondidas</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-outline-admin" onClick={handleExport}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {filteredMessages.length === 0 ? (
          <div className="table-empty-cell">
            Nenhuma mensagem encontrada para os filtros aplicados.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo / Origem</th>
                <th>Remetente</th>
                <th>Assunto & Mensagem</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((m) => {
                const st = ((m.status || 'pendente').toLowerCase() as MessageStatus);
                const statusInfo = MESSAGE_STATUS_META[st] || { label: m.status || 'Pendente', tone: 'info' };
                const attCount = Array.isArray(m.attachments_json) ? m.attachments_json.length : 0;

                return (
                  <tr key={m.id}>
                    <td>
                      <code className="slug-code">{m.protocol || 'CONTATO'}</code>
                      <div className="table-subtext">{m.page_source || '/contato'}</div>
                    </td>
                    <td>
                      <strong>{m.name}</strong>
                      <div className="table-subtext">{m.email}</div>
                      <div className="table-subtext">{m.phone}</div>
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      <strong>{m.subject || 'Contato Institucional'}</strong>
                      <p className="table-subtext">
                        {m.message && m.message.length > 95
                          ? `${m.message.slice(0, 95)}...`
                          : m.message || '-'}
                      </p>
                      {attCount > 0 && (
                        <span className="badge-tone info" style={{ marginTop: '4px' }}>
                          <Paperclip size={11} /> {attCount} anexo(s)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-tone ${statusInfo.tone}`}>{statusInfo.label}</span>
                    </td>
                    <td className="tabular-nums">{formatDateBR(m.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-table-primary"
                        onClick={() => handleOpenMessage(m)}
                      >
                        <Eye size={14} /> Abrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: DETALHES DA MENSAGEM */}
      {selectedMsg && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => !saving && setSelectedMsg(null)}
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="modal-protocol-badge">
                  <MessageSquare size={13} /> {selectedMsg.protocol || 'Mensagem de Contato'}
                </span>
                <h3>{selectedMsg.subject || 'Contato Institucional'}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={saving}
                onClick={() => setSelectedMsg(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-form">
              <div className="detail-info-grid">
                <div>
                  <small>Nome Completo</small>
                  <strong>{selectedMsg.name}</strong>
                </div>
                <div>
                  <small>E-mail</small>
                  <a href={`mailto:${selectedMsg.email}`} className="detail-link">
                    <Mail size={13} /> {selectedMsg.email}
                  </a>
                </div>
                <div>
                  <small>Telefone / WhatsApp</small>
                  <a
                    href={`https://wa.me/${cleanWhatsappDigits(selectedMsg.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    <Phone size={13} /> {selectedMsg.phone}
                  </a>
                </div>
                <div>
                  <small>Recebida em</small>
                  <strong>{formatDateTimeBR(selectedMsg.created_at)}</strong>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <small>Mensagem</small>
                  <p className="detail-text-block">{selectedMsg.message || 'Sem mensagem adicional.'}</p>
                </div>
              </div>

              {Array.isArray(selectedMsg.attachments_json) && selectedMsg.attachments_json.length > 0 && (
                <div className="detail-attachments-box" style={{ marginTop: '16px' }}>
                  <h4>
                    <Paperclip size={15} /> Arquivos Anexados ({selectedMsg.attachments_json.length})
                  </h4>
                  <div className="detail-attachments-list">
                    {selectedMsg.attachments_json.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-chip"
                      >
                        📎 {att.name || `Anexo ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-modal-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-outline-admin"
                    disabled={saving || selectedMsg.status === 'respondido'}
                    onClick={() => handleUpdateStatus(selectedMsg, 'respondido')}
                  >
                    <Check size={15} /> Marcar como Respondida
                  </button>
                  <a
                    href={`mailto:${selectedMsg.email}?subject=${encodeURIComponent(
                      `Re: ${selectedMsg.subject || 'Contato Mascârello Haus'}`
                    )}`}
                    className="btn-outline-admin"
                  >
                    <Mail size={15} /> Responder por E-mail
                  </a>
                </div>

                <button type="button" className="btn-cancel" onClick={() => setSelectedMsg(null)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
