import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  X,
  Save,
  AlertTriangle,
  Lock,
  Paperclip,
  Calendar,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  WHISTLEBLOWER_STATUS_META,
  WhistleblowerRecord,
  WhistleblowerStatus,
  exportToCsv,
  formatDateBR,
  formatDateTimeBR,
} from '../types';

interface WhistleblowerTabProps {
  reports: WhistleblowerRecord[];
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const WhistleblowerTab: React.FC<WhistleblowerTabProps> = ({
  reports,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anonymityFilter, setAnonymityFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<WhistleblowerRecord | null>(null);
  const [editStatus, setEditStatus] = useState<WhistleblowerStatus>('new');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedReport) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) setSelectedReport(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedReport, saving]);

  const handleOpenDetails = (report: WhistleblowerRecord) => {
    setSelectedReport(report);
    setEditStatus(report.status || 'new');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('whistleblower_reports')
        .update({ status: editStatus })
        .eq('id', selectedReport.id);

      if (error) throw error;
      await onAudit(
        'UPDATE',
        'whistleblower_reports',
        selectedReport.protocol,
        { status: selectedReport.status },
        { status: editStatus }
      );
      onShowToast('success', `Status do relato ${selectedReport.protocol} atualizado!`);
      setSelectedReport(null);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao atualizar denúncia:', err);
      onShowToast('error', err.message || 'Não foi possível atualizar o relato.');
    } finally {
      setSaving(false);
    }
  };

  const filteredReports = reports.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      d.protocol.toLowerCase().includes(q) ||
      d.involved_persons.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      (d.reporter_name || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesAnon =
      anonymityFilter === 'all' ||
      (anonymityFilter === 'anon' && d.is_anonymous) ||
      (anonymityFilter === 'identified' && !d.is_anonymous);
    return matchesSearch && matchesStatus && matchesAnon;
  });

  const handleExport = () => {
    exportToCsv(
      `canal-denuncias-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Protocolo', 'Tipo', 'Denunciante', 'Envolvidos', 'Fatos', 'Local', 'Data Incidente', 'Status', 'Registrado Em'],
      filteredReports.map((d) => [
        d.protocol,
        d.is_anonymous ? 'Anônimo' : 'Identificado',
        d.is_anonymous ? 'ANÔNIMO' : d.reporter_name || '-',
        d.involved_persons,
        Array.isArray(d.concern_types) ? d.concern_types.join('; ') : '-',
        d.incident_location || '-',
        d.incident_date || '-',
        WHISTLEBLOWER_STATUS_META[d.status]?.label || d.status,
        formatDateTimeBR(d.created_at),
      ])
    );
  };

  return (
    <div>
      <div className="toolbar-bar">
        <div className="toolbar-filters">
          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por protocolo, envolvidos ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar denúncias por status"
          >
            <option value="all">Todos os Status ({reports.length})</option>
            <option value="new">Novos Relatos</option>
            <option value="investigating">Em Apuração</option>
            <option value="resolved">Concluídos</option>
            <option value="archived">Arquivados</option>
          </select>

          <select
            className="filter-select"
            value={anonymityFilter}
            onChange={(e) => setAnonymityFilter(e.target.value)}
            aria-label="Filtrar por anonimato"
          >
            <option value="all">Anônimos e Identificados</option>
            <option value="anon">Somente Anônimos</option>
            <option value="identified">Somente Identificados</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-outline-admin" onClick={handleExport}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {filteredReports.length === 0 ? (
          <div className="table-empty-cell">
            Nenhum relato no Canal de Denúncias encontrado para os filtros aplicados.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Denunciante</th>
                <th>Pessoas Envolvidas</th>
                <th>Fatos Relatados</th>
                <th>Evidências</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((d) => {
                const statusInfo = WHISTLEBLOWER_STATUS_META[d.status] || {
                  label: d.status,
                  tone: 'neutral',
                };
                const attCount = Array.isArray(d.attachments_json) ? d.attachments_json.length : 0;

                return (
                  <tr key={d.id}>
                    <td>
                      <code className="slug-code">{d.protocol}</code>
                    </td>
                    <td>
                      {d.is_anonymous ? (
                        <span className="badge-tone warning">
                          <Lock size={11} /> ANÔNIMO
                        </span>
                      ) : (
                        <strong>{d.reporter_name || 'Identificado'}</strong>
                      )}
                    </td>
                    <td>
                      <strong>{d.involved_persons}</strong>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className="table-subtext" style={{ marginTop: 0 }}>
                        {Array.isArray(d.concern_types) ? d.concern_types.join('; ') : '-'}
                      </div>
                    </td>
                    <td>
                      {attCount > 0 ? (
                        <span className="badge-tone info">
                          <Paperclip size={11} /> {attCount} arquivo(s)
                        </span>
                      ) : (
                        <span className="table-subtext">Sem anexos</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-tone ${statusInfo.tone}`}>{statusInfo.label}</span>
                    </td>
                    <td className="tabular-nums">{formatDateBR(d.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-table-primary"
                        onClick={() => handleOpenDetails(d)}
                      >
                        <Eye size={14} /> Apurar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: DETALHES E APURAÇÃO DE DENÚNCIA */}
      {selectedReport && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => !saving && setSelectedReport(null)}
        >
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="modal-protocol-badge">
                  <AlertTriangle size={13} /> Protocolo {selectedReport.protocol}
                </span>
                <h3>Apuração de Relato — Canal de Denúncias</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                disabled={saving}
                onClick={() => setSelectedReport(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="admin-modal-form">
              <div className="detail-info-grid">
                <div>
                  <small>Identificação do Relator</small>
                  <strong>
                    {selectedReport.is_anonymous ? (
                      <span className="badge-tone warning">100% ANÔNIMO</span>
                    ) : (
                      selectedReport.reporter_name || 'Identificado'
                    )}
                  </strong>
                </div>
                <div>
                  <small>Pessoas Envolvidas</small>
                  <strong>{selectedReport.involved_persons}</strong>
                </div>
                <div>
                  <small>Colaborador do Escritório?</small>
                  <strong>{selectedReport.works_at_firm || 'Não informado'}</strong>
                </div>
                <div>
                  <small>Queixa Prévia de Compliance?</small>
                  <strong>{selectedReport.has_compliance_complaint || 'Não informado'}</strong>
                </div>
                <div>
                  <small>
                    <Calendar size={12} style={{ verticalAlign: 'middle' }} /> Data / Hora do Ocorrido
                  </small>
                  <strong>
                    {selectedReport.incident_date || '-'} {selectedReport.incident_time ? `às ${selectedReport.incident_time}` : ''}
                  </strong>
                </div>
                <div>
                  <small>
                    <MapPin size={12} style={{ verticalAlign: 'middle' }} /> Local
                  </small>
                  <strong>{selectedReport.incident_location || 'Não informado'}</strong>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <small>Categorias / Fatos Relatados</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {Array.isArray(selectedReport.concern_types) &&
                      selectedReport.concern_types.map((c, idx) => (
                        <span key={idx} className="badge-tone neutral">
                          {c}
                        </span>
                      ))}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <small>Descrição Detalhada dos Fatos</small>
                  <p className="detail-text-block">{selectedReport.description}</p>
                </div>
              </div>

              {Array.isArray(selectedReport.attachments_json) && selectedReport.attachments_json.length > 0 && (
                <div className="detail-attachments-box">
                  <h4>
                    <Paperclip size={15} /> Evidências Anexadas ({selectedReport.attachments_json.length})
                  </h4>
                  <div className="detail-attachments-list">
                    {selectedReport.attachments_json.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-chip"
                      >
                        📎 {att.name || `Evidência ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="treatment-section">
                <h4>Andamento da Apuração pelo Comitê</h4>
                <div className="form-group">
                  <label>Status da Denúncia</label>
                  <select
                    className="form-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as WhistleblowerStatus)}
                  >
                    <option value="new">Novo Relato (Aguardando Triagem)</option>
                    <option value="investigating">Em Apuração / Investigação</option>
                    <option value="resolved">Concluído / Medidas Adotadas</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={saving}
                  onClick={() => setSelectedReport(null)}
                >
                  Fechar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={16} /> {saving ? 'Atualizando...' : 'Atualizar Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
