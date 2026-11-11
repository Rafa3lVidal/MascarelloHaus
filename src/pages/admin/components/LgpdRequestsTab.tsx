import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  X,
  Save,
  Clock,
  Paperclip,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  LGPD_REQUEST_TYPE_LABELS,
  LGPD_STATUS_META,
  LgpdRequestRecord,
  LgpdStatus,
  daysUntilDeadline,
  exportToCsv,
  formatDateBR,
  formatDateTimeBR,
} from '../types';

interface LgpdRequestsTabProps {
  requests: LgpdRequestRecord[];
  currentUserId?: string;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const LgpdRequestsTab: React.FC<LgpdRequestsTabProps> = ({
  requests,
  currentUserId,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<LgpdRequestRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState<{
    status: LgpdStatus;
    internal_notes: string;
    resolution_details: string;
  }>({
    status: 'recebido',
    internal_notes: '',
    resolution_details: '',
  });

  useEffect(() => {
    if (!selectedReq) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) setSelectedReq(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedReq, saving]);

  const handleOpenDetails = (req: LgpdRequestRecord) => {
    setSelectedReq(req);
    setEditForm({
      status: req.status || 'recebido',
      internal_notes: req.internal_notes || '',
      resolution_details: req.resolution_details || '',
    });
  };

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSaving(true);
    try {
      const isFinalStatus = editForm.status === 'concluido' || editForm.status === 'rejeitado';
      const updates: Record<string, any> = {
        status: editForm.status,
        internal_notes: editForm.internal_notes.trim() || null,
        resolution_details: editForm.resolution_details.trim() || null,
        assigned_to: currentUserId || selectedReq.assigned_to || null,
        updated_at: new Date().toISOString(),
        resolved_at: isFinalStatus ? selectedReq.resolved_at || new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('data_subject_requests')
        .update(updates)
        .eq('id', selectedReq.id);

      if (error) throw error;
      await onAudit('UPDATE', 'data_subject_requests', selectedReq.protocol, selectedReq, updates);
      onShowToast('success', `Requisição ${selectedReq.protocol} atualizada com sucesso!`);
      setSelectedReq(null);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao atualizar requisição LGPD:', err);
      onShowToast('error', err.message || 'Falha ao salvar tratamento da requisição LGPD.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      req.protocol.toLowerCase().includes(q) ||
      req.requester_name.toLowerCase().includes(q) ||
      req.contact_info.toLowerCase().includes(q) ||
      (req.data_subject_name || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    exportToCsv(
      `requisicoes-lgpd-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Protocolo', 'Solicitante', 'Titular', 'Tipo', 'Canal Retorno', 'Contato', 'Prazo Legal', 'Status', 'Criado Em', 'Concluído Em'],
      filteredRequests.map((r) => [
        r.protocol,
        r.requester_name,
        r.data_subject_name || r.requester_name,
        LGPD_REQUEST_TYPE_LABELS[r.request_type] || r.request_type,
        r.contact_channel,
        r.contact_info,
        formatDateBR(r.legal_deadline),
        LGPD_STATUS_META[r.status]?.label || r.status,
        formatDateTimeBR(r.created_at),
        formatDateTimeBR(r.resolved_at),
      ])
    );
  };

  const getAttachments = (req: LgpdRequestRecord) => {
    const list = Array.isArray(req.attachments_json) ? [...req.attachments_json] : [];
    if (req.attachment_storage_path && !list.some((a) => a.url === req.attachment_storage_path)) {
      list.unshift({ name: 'Documento anexo', url: req.attachment_storage_path });
    }
    return list;
  };

  return (
    <div>
      <div className="toolbar-bar">
        <div className="toolbar-filters">
          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por protocolo, titular ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar requisições por status"
          >
            <option value="all">Todos os Status ({requests.length})</option>
            <option value="recebido">Recebido</option>
            <option value="em_analise">Em Análise</option>
            <option value="aguardando_titular">Aguardando Titular</option>
            <option value="concluido">Concluído</option>
            <option value="rejeitado">Indeferido / Rejeitado</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-outline-admin" onClick={handleExport}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {filteredRequests.length === 0 ? (
          <div className="table-empty-cell">
            Nenhuma requisição de titular encontrada para os filtros aplicados.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Solicitante / Titular</th>
                <th>Tipo de Pedido</th>
                <th>Contato / Retorno</th>
                <th>Prazo Legal (15d)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const statusInfo = LGPD_STATUS_META[req.status] || { label: req.status, tone: 'info' };
                const daysLeft = daysUntilDeadline(req.legal_deadline);
                const isClosed = req.status === 'concluido' || req.status === 'rejeitado';
                const attCount = getAttachments(req).length;

                return (
                  <tr key={req.id}>
                    <td>
                      <code className="slug-code">{req.protocol}</code>
                      <div className="table-subtext">{formatDateBR(req.created_at)}</div>
                    </td>
                    <td>
                      <strong>{req.requester_name}</strong>
                      {req.is_third_party && (
                        <div className="table-subtext">
                          <UserCheck size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Titular: {req.data_subject_name || req.third_party_name}
                        </div>
                      )}
                    </td>
                    <td>
                      <span>{LGPD_REQUEST_TYPE_LABELS[req.request_type] || req.request_type}</span>
                      {attCount > 0 && (
                        <div className="table-subtext">
                          <Paperclip size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                          {attCount} anexo(s)
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{req.contact_info}</div>
                      <div className="table-subtext">Via: {req.contact_channel}</div>
                    </td>
                    <td className="tabular-nums">
                      <div>{formatDateBR(req.legal_deadline)}</div>
                      {!isClosed && daysLeft !== null && (
                        <span
                          className={`deadline-pill ${
                            daysLeft < 0 ? 'overdue' : daysLeft <= 3 ? 'urgent' : 'ok'
                          }`}
                        >
                          <Clock size={11} />
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)}d vencido`
                            : daysLeft === 0
                            ? 'Vence hoje'
                            : `${daysLeft}d restantes`}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-tone ${statusInfo.tone}`}>{statusInfo.label}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-table-primary"
                        onClick={() => handleOpenDetails(req)}
                      >
                        <Eye size={14} /> Tratar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: DETALHES E TRATAMENTO LGPD */}
      {selectedReq && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => !saving && setSelectedReq(null)}
        >
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="modal-protocol-badge">
                  <ShieldAlert size={13} /> Protocolo {selectedReq.protocol}
                </span>
                <h3>Tratamento de Requisição do Titular (Art. 18 LGPD)</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={saving}
                onClick={() => setSelectedReq(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTreatment} className="admin-modal-form">
              <div className="detail-info-grid">
                <div>
                  <small>Solicitante</small>
                  <strong>{selectedReq.requester_name}</strong>
                </div>
                <div>
                  <small>Titular dos Dados</small>
                  <strong>
                    {selectedReq.is_third_party
                      ? `${selectedReq.data_subject_name || selectedReq.third_party_name || '-'} (Terceiro)`
                      : selectedReq.requester_name}
                  </strong>
                </div>
                <div>
                  <small>Canal de Retorno / Contato</small>
                  <strong>
                    {selectedReq.contact_info} ({selectedReq.contact_channel})
                  </strong>
                </div>
                <div>
                  <small>Prazo Legal (Art. 19, II)</small>
                  <strong>{formatDateBR(selectedReq.legal_deadline)}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <small>Direito Exercido / Tipo de Solicitação</small>
                  <strong>{LGPD_REQUEST_TYPE_LABELS[selectedReq.request_type] || selectedReq.request_type}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <small>Descrição da Solicitação</small>
                  <p className="detail-text-block">{selectedReq.description}</p>
                </div>
                {selectedReq.prior_contact_details && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <small>Detalhes de Contato Prévio</small>
                    <p className="detail-text-block">{selectedReq.prior_contact_details}</p>
                  </div>
                )}
              </div>

              {getAttachments(selectedReq).length > 0 && (
                <div className="detail-attachments-box">
                  <h4>
                    <Paperclip size={15} /> Documentos Anexados pelo Titular
                  </h4>
                  <div className="detail-attachments-list">
                    {getAttachments(selectedReq).map((att, idx) => (
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

              <div className="treatment-section">
                <h4>Parecer e Decisão do Encarregado (DPO)</h4>

                <div className="form-group">
                  <label>Status do Atendimento *</label>
                  <select
                    className="form-control"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LgpdStatus })}
                  >
                    <option value="recebido">Recebido</option>
                    <option value="em_analise">Em Análise pelo DPO</option>
                    <option value="aguardando_titular">Aguardando Confirmação do Titular</option>
                    <option value="concluido">Concluído (Atendido)</option>
                    <option value="rejeitado">Indeferido / Rejeitado (Com Justificativa)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notas Internas / Auditoria do DPO (Restrito à equipe)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editForm.internal_notes}
                    onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                    placeholder="Registre verificações de identidade, bases legais consultadas ou encaminhamentos internos..."
                  />
                </div>

                <div className="form-group">
                  <label>Resumo da Resolução / Resposta Oficial Enviada ao Titular</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editForm.resolution_details}
                    onChange={(e) => setEditForm({ ...editForm, resolution_details: e.target.value })}
                    placeholder="Descreva as providências tomadas ou a fundamentação jurídica da resposta..."
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={saving}
                  onClick={() => setSelectedReq(null)}
                >
                  Fechar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={16} /> {saving ? 'Gravando...' : 'Salvar Tratamento LGPD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
