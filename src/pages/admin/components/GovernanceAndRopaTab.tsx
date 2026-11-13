import React, { useState } from 'react';
import {
  Database,
  ShieldAlert,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  LgpdGovernanceConfig,
  RopaRecordItem,
  SecurityIncidentItem,
} from '../../../lib/lgpdConfig';
import { exportToCsv, formatDateBR, formatFriendlyError } from '../types';

interface GovernanceAndRopaTabProps {
  config: LgpdGovernanceConfig;
  currentUserId?: string;
  onChange: (next: LgpdGovernanceConfig) => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

const SEVERITY_META: Record<SecurityIncidentItem['severity'], { label: string; tone: string }> = {
  baixa: { label: 'Baixa', tone: 'info' },
  media: { label: 'Média', tone: 'warning' },
  alta: { label: 'Alta', tone: 'danger' },
  critica: { label: 'Crítica', tone: 'danger' },
};

const INCIDENT_STATUS_META: Record<SecurityIncidentItem['status'], { label: string; tone: string }> = {
  investigando: { label: 'Em Investigação', tone: 'warning' },
  contido: { label: 'Contido', tone: 'info' },
  notificado_anpd: { label: 'ANPD Notificada', tone: 'purple' },
  encerrado: { label: 'Encerrado', tone: 'success' },
};

export const GovernanceAndRopaTab: React.FC<GovernanceAndRopaTabProps> = ({
  config,
  currentUserId,
  onChange,
  onShowToast,
  onAudit,
}) => {
  const [subTab, setSubTab] = useState<'ropa' | 'incidents' | 'dpo'>('ropa');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingRopa, setEditingRopa] = useState<RopaRecordItem | null>(null);
  const [isNewRopa, setIsNewRopa] = useState(false);

  const [editingIncident, setEditingIncident] = useState<SecurityIncidentItem | null>(null);
  const [isNewIncident, setIsNewIncident] = useState(false);

  const persistGovernance = async (nextConfig: LgpdGovernanceConfig, successMessage: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'lgpd_governance',
        value_json: nextConfig,
        updated_by: currentUserId || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await onAudit('UPDATE', 'site_settings', 'lgpd_governance', null, {
        dpoEmail: nextConfig.dpoEmail,
        ropaCount: nextConfig.ropaRecords.length,
        incidentsCount: nextConfig.incidents.length,
      });
      onChange(nextConfig);
      onShowToast('success', successMessage);
    } catch (err) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível salvar os dados de governança LGPD.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRopa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRopa) return;
    if (!editingRopa.processName.trim() || !editingRopa.purpose.trim()) {
      onShowToast('error', 'Informe o nome do processo e a finalidade.');
      return;
    }
    const nextRecords = isNewRopa
      ? [{ ...editingRopa, id: `ropa-${Date.now()}` }, ...config.ropaRecords]
      : config.ropaRecords.map((r) => (r.id === editingRopa.id ? editingRopa : r));

    setEditingRopa(null);
    setIsNewRopa(false);
    await persistGovernance({ ...config, ropaRecords: nextRecords }, 'Mapeamento ROPA atualizado com sucesso!');
  };

  const handleDeleteRopa = async (id: string) => {
    const nextRecords = config.ropaRecords.filter((r) => r.id !== id);
    await persistGovernance({ ...config, ropaRecords: nextRecords }, 'Atividade removida do mapeamento ROPA.');
  };

  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;
    if (!editingIncident.title.trim()) {
      onShowToast('error', 'Informe o título/descrição resumida do incidente.');
      return;
    }
    const nextIncidents = isNewIncident
      ? [{ ...editingIncident, id: `inc-${Date.now()}` }, ...config.incidents]
      : config.incidents.map((i) => (i.id === editingIncident.id ? editingIncident : i));

    setEditingIncident(null);
    setIsNewIncident(false);
    await persistGovernance({ ...config, incidents: nextIncidents }, 'Registro de incidente salvo com sucesso!');
  };

  const handleDeleteIncident = async (id: string) => {
    const nextIncidents = config.incidents.filter((i) => i.id !== id);
    await persistGovernance({ ...config, incidents: nextIncidents }, 'Registro de incidente removido.');
  };

  const handleSaveDpoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistGovernance(config, 'Configurações de Governança e DPO atualizadas com sucesso!');
  };

  const filteredRopa = config.ropaRecords.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.processName.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.legalBasis.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q)
    );
  });

  const openIncidentsCount = config.incidents.filter((i) => i.status !== 'encerrado').length;

  return (
    <div className="tab-module-container">
      <div className="module-toolbar">
        <div className="subtab-pills">
          <button
            type="button"
            className={`subtab-pill ${subTab === 'ropa' ? 'active' : ''}`}
            onClick={() => setSubTab('ropa')}
          >
            <Database size={14} /> Mapeamento ROPA ({config.ropaRecords.length})
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setSubTab('incidents')}
          >
            <ShieldAlert size={14} /> Incidentes Art. 48 ({openIncidentsCount} aberto(s))
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'dpo' ? 'active' : ''}`}
            onClick={() => setSubTab('dpo')}
          >
            <UserCheck size={14} /> Governança & DPO
          </button>
        </div>

        {subTab === 'ropa' && (
          <div className="toolbar-actions-group">
            <div className="search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar processo ou base legal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `ropa-mapeamento-lgpd-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    'Processo',
                    'Área',
                    'Finalidade',
                    'Base Legal',
                    'Categorias de Dados',
                    'Titulares',
                    'Compartilhamento',
                    'Retenção',
                    'Medidas de Segurança',
                    'Status',
                  ],
                  filteredRopa.map((r) => [
                    r.processName,
                    r.area,
                    r.purpose,
                    r.legalBasis,
                    r.dataCategories,
                    r.dataSubjects,
                    r.thirdParties,
                    r.retentionPeriod,
                    r.securityMeasures,
                    r.status,
                  ])
                )
              }
            >
              <Download size={15} /> Exportar ROPA
            </button>
            <button
              type="button"
              className="btn-save-main"
              onClick={() => {
                setIsNewRopa(true);
                setEditingRopa({
                  id: '',
                  processName: '',
                  area: '',
                  purpose: '',
                  legalBasis: 'Cumprimento de obrigação legal (Art. 7º, II)',
                  dataCategories: '',
                  dataSubjects: '',
                  thirdParties: 'Sem compartilhamento externo',
                  retentionPeriod: '5 anos',
                  securityMeasures: 'Criptografia e controle de acesso restrito',
                  status: 'ativo',
                });
              }}
            >
              <Plus size={15} /> Nova Atividade
            </button>
          </div>
        )}

        {subTab === 'incidents' && (
          <div className="toolbar-actions-group">
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `incidentes-lgpd-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Título', 'Data Detecção', 'Severidade', 'Status', 'Dados Afetados', 'ANPD Notificada', 'Titulares Notificados'],
                  config.incidents.map((i) => [
                    i.title,
                    formatDateBR(i.detectedAt),
                    i.severity,
                    i.status,
                    i.affectedData,
                    i.anpdNotified ? 'Sim' : 'Não',
                    i.subjectsNotified ? 'Sim' : 'Não',
                  ])
                )
              }
            >
              <Download size={15} /> Exportar CSV
            </button>
            <button
              type="button"
              className="btn-save-main"
              onClick={() => {
                setIsNewIncident(true);
                setEditingIncident({
                  id: '',
                  title: '',
                  detectedAt: new Date().toISOString().slice(0, 10),
                  severity: 'media',
                  status: 'investigando',
                  affectedData: '',
                  estimatedSubjects: 0,
                  anpdNotified: false,
                  subjectsNotified: false,
                  containmentActions: '',
                  notes: '',
                });
              }}
            >
              <Plus size={15} /> Registrar Incidente
            </button>
          </div>
        )}
      </div>

      {/* SUBTAB 1: ROPA */}
      {subTab === 'ropa' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Processo / Fluxo</th>
                <th>Área</th>
                <th>Base Legal (LGPD)</th>
                <th>Titulares & Dados</th>
                <th>Retenção</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRopa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty-cell">
                    Nenhuma operação de tratamento registrada no mapeamento ROPA.
                  </td>
                </tr>
              ) : (
                filteredRopa.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.processName}</strong>
                      <div className="table-subtext">{r.purpose}</div>
                    </td>
                    <td>{r.area}</td>
                    <td>{r.legalBasis}</td>
                    <td>
                      <div>{r.dataSubjects}</div>
                      <div className="table-subtext">{r.dataCategories}</div>
                    </td>
                    <td>{r.retentionPeriod}</td>
                    <td>
                      <span
                        className={`badge-tone ${
                          r.status === 'ativo' ? 'success' : r.status === 'em_revisao' ? 'warning' : 'neutral'
                        }`}
                      >
                        {r.status === 'ativo' ? 'Ativo' : r.status === 'em_revisao' ? 'Em Revisão' : 'Arquivado'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn edit"
                          title="Editar operação"
                          onClick={() => {
                            setIsNewRopa(false);
                            setEditingRopa({ ...r });
                          }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete"
                          title="Remover operação"
                          onClick={() => handleDeleteRopa(r.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: INCIDENTES */}
      {subTab === 'incidents' && (
        <div className="table-responsive">
          {config.incidents.length === 0 ? (
            <div className="empty-state-panel">
              <CheckCircle2 size={36} color="#059669" />
              <h4>Nenhum incidente de segurança registrado</h4>
              <p>
                Caso ocorra qualquer evento que possa acarretar risco ou dano relevante aos titulares (Art. 48 LGPD / Resolução CD/ANPD nº 15), registre aqui para controle do prazo de comunicação ({config.incidentNotificationHours}h).
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Incidente</th>
                  <th>Detecção</th>
                  <th>Severidade</th>
                  <th>Comunicações</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {config.incidents.map((inc) => {
                  const sev = SEVERITY_META[inc.severity];
                  const st = INCIDENT_STATUS_META[inc.status];
                  return (
                    <tr key={inc.id}>
                      <td>
                        <strong>{inc.title}</strong>
                        <div className="table-subtext">
                          {inc.affectedData || 'Dados em análise'} · ~{inc.estimatedSubjects} titular(es)
                        </div>
                      </td>
                      <td className="tabular-nums">{formatDateBR(inc.detectedAt)}</td>
                      <td>
                        <span className={`badge-tone ${sev.tone}`}>{sev.label}</span>
                      </td>
                      <td>
                        <div className="table-subtext">
                          ANPD: <strong>{inc.anpdNotified ? 'Sim' : 'Não'}</strong> · Titulares:{' '}
                          <strong>{inc.subjectsNotified ? 'Sim' : 'Não'}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-tone ${st.tone}`}>{st.label}</span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            title="Gerenciar incidente"
                            onClick={() => {
                              setIsNewIncident(false);
                              setEditingIncident({ ...inc });
                            }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            title="Excluir registro"
                            onClick={() => handleDeleteIncident(inc.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SUBTAB 3: GOVERNANÇA & DPO */}
      {subTab === 'dpo' && (
        <div className="settings-form-container">
          <form onSubmit={handleSaveDpoForm}>
            <div className="settings-section">
              <h3 className="settings-section-title">
                <UserCheck size={18} /> Encarregado pelo Tratamento de Dados Pessoais (DPO — Art. 41)
              </h3>
              <p className="settings-section-desc">
                As informações abaixo são exibidas publicamente na Central de Proteção de Dados e orientam os prazos internos do painel.
              </p>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nome do(a) Encarregado(a) / DPO</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoName}
                    onChange={(e) => onChange({ ...config, dpoName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>E-mail Oficial do Canal DPO</label>
                  <input
                    type="email"
                    className="form-control"
                    value={config.dpoEmail}
                    onChange={(e) => onChange({ ...config, dpoEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Telefone / WhatsApp de Privacidade</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoPhone}
                    onChange={(e) => onChange({ ...config, dpoPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Registro / Cargo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoOab}
                    onChange={(e) => onChange({ ...config, dpoOab: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Horário de Atendimento aos Titulares</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoServiceHours}
                    onChange={(e) => onChange({ ...config, dpoServiceHours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <AlertTriangle size={18} /> Prazos Regulatórios e Comitê de Privacidade
              </h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Prazo de Resposta a Titulares (dias)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className="form-control"
                    value={config.responseDeadlineDays}
                    onChange={(e) =>
                      onChange({ ...config, responseDeadlineDays: Math.max(1, Number(e.target.value) || 15) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Prazo de Comunicação de Incidentes (horas)</label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    className="form-control"
                    value={config.incidentNotificationHours}
                    onChange={(e) =>
                      onChange({ ...config, incidentNotificationHours: Math.max(1, Number(e.target.value) || 72) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Ciclo de Revisão do ROPA / RIPD (dias)</label>
                  <input
                    type="number"
                    min={30}
                    max={730}
                    className="form-control"
                    value={config.ropaReviewCycleDays}
                    onChange={(e) =>
                      onChange({ ...config, ropaReviewCycleDays: Math.max(30, Number(e.target.value) || 180) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Próxima Auditoria / Revisão Programada</label>
                  <input
                    type="date"
                    className="form-control"
                    value={config.nextReviewDate}
                    onChange={(e) => onChange({ ...config, nextReviewDate: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Integrantes do Comitê de Privacidade e Governança</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={config.committeeMembers}
                    onChange={(e) => onChange({ ...config, committeeMembers: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="settings-actions-footer">
              <button type="submit" className="btn-save-main" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Governança LGPD'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ROPA */}
      {editingRopa && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingRopa(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewRopa ? 'Nova Operação de Tratamento (ROPA)' : 'Editar Operação (ROPA)'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingRopa(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveRopa} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nome do Processo *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingRopa.processName}
                    onChange={(e) => setEditingRopa({ ...editingRopa, processName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Área / Departamento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.area}
                    onChange={(e) => setEditingRopa({ ...editingRopa, area: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Finalidade do Tratamento *</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    required
                    value={editingRopa.purpose}
                    onChange={(e) => setEditingRopa({ ...editingRopa, purpose: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Base Legal (Art. 7º / Art. 11 LGPD)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.legalBasis}
                    onChange={(e) => setEditingRopa({ ...editingRopa, legalBasis: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={editingRopa.status}
                    onChange={(e) => setEditingRopa({ ...editingRopa, status: e.target.value as RopaRecordItem['status'] })}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="em_revisao">Em Revisão</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Categorias de Dados Pessoais</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.dataCategories}
                    onChange={(e) => setEditingRopa({ ...editingRopa, dataCategories: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Titulares Envolvidos</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.dataSubjects}
                    onChange={(e) => setEditingRopa({ ...editingRopa, dataSubjects: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Compartilhamento com Terceiros</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.thirdParties}
                    onChange={(e) => setEditingRopa({ ...editingRopa, thirdParties: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Prazo de Retenção / Descarte</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.retentionPeriod}
                    onChange={(e) => setEditingRopa({ ...editingRopa, retentionPeriod: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Medidas Técnicas e Administrativas de Segurança</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.securityMeasures}
                    onChange={(e) => setEditingRopa({ ...editingRopa, securityMeasures: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingRopa(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Operação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INCIDENTE */}
      {editingIncident && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingIncident(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewIncident ? 'Registrar Incidente de Segurança (Art. 48)' : 'Gerenciar Incidente'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingIncident(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveIncident} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group form-group-full">
                  <label>Título / Descrição Curta *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingIncident.title}
                    onChange={(e) => setEditingIncident({ ...editingIncident, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Data da Detecção</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editingIncident.detectedAt}
                    onChange={(e) => setEditingIncident({ ...editingIncident, detectedAt: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Severidade</label>
                  <select
                    className="form-control"
                    value={editingIncident.severity}
                    onChange={(e) =>
                      setEditingIncident({ ...editingIncident, severity: e.target.value as SecurityIncidentItem['severity'] })
                    }
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status do Tratamento</label>
                  <select
                    className="form-control"
                    value={editingIncident.status}
                    onChange={(e) =>
                      setEditingIncident({ ...editingIncident, status: e.target.value as SecurityIncidentItem['status'] })
                    }
                  >
                    <option value="investigando">Em Investigação</option>
                    <option value="contido">Contido</option>
                    <option value="notificado_anpd">ANPD Notificada</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Qtd. Estimada de Titulares</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={editingIncident.estimatedSubjects}
                    onChange={(e) =>
                      setEditingIncident({ ...editingIncident, estimatedSubjects: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Dados Pessoais Afetados</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingIncident.affectedData}
                    onChange={(e) => setEditingIncident({ ...editingIncident, affectedData: e.target.value })}
                    placeholder="Ex: Nome, e-mail, documentos cadastrais..."
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={editingIncident.anpdNotified}
                      onChange={(e) => setEditingIncident({ ...editingIncident, anpdNotified: e.target.checked })}
                    />
                    <span>ANPD comunicada formalmente</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={editingIncident.subjectsNotified}
                      onChange={(e) => setEditingIncident({ ...editingIncident, subjectsNotified: e.target.checked })}
                    />
                    <span>Titulares afetados comunicados</span>
                  </label>
                </div>
                <div className="form-group form-group-full">
                  <label>Medidas de Contenção e Mitigação</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={editingIncident.containmentActions}
                    onChange={(e) => setEditingIncident({ ...editingIncident, containmentActions: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Parecer do DPO / Observações</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingIncident.notes}
                    onChange={(e) => setEditingIncident({ ...editingIncident, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingIncident(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Incidente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
