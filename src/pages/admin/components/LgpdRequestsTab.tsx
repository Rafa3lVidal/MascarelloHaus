import React, { useState, useEffect, useMemo } from 'react';
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
  Database,
  FileJson,
  Trash2,
  Wand2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  openSecureAttachment,
  syncPublicProtocolIndex,
} from '../../../lib/formSecurity';
import {
  ConsentRecord,
  ContactMessageRecord,
  LGPD_REQUEST_TYPE_LABELS,
  LGPD_STATUS_META,
  LgpdRequestRecord,
  LgpdStatus,
  QuizSubmissionRecord,
  WhistleblowerRecord,
  daysUntilDeadline,
  exportToCsv,
  formatDateBR,
  formatDateTimeBR,
  formatFriendlyError,
} from '../types';

interface LgpdRequestsTabProps {
  requests: LgpdRequestRecord[];
  messages?: ContactMessageRecord[];
  quizSubmissions?: QuizSubmissionRecord[];
  whistleblowers?: WhistleblowerRecord[];
  consentRecords?: ConsentRecord[];
  currentUserId?: string;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const LgpdRequestsTab: React.FC<LgpdRequestsTabProps> = ({
  requests,
  messages = [],
  quizSubmissions = [],
  whistleblowers = [],
  consentRecords = [],
  currentUserId,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReq, setSelectedReq] = useState<LgpdRequestRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);

  const [editForm, setEditForm] = useState<{
    status: LgpdStatus;
    identity_verified: boolean;
    internal_notes: string;
    resolution_details: string;
  }>({
    status: 'recebido',
    identity_verified: false,
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
      identity_verified: Boolean(req.identity_verified),
      internal_notes: req.internal_notes || '',
      resolution_details: req.resolution_details || '',
    });
  };

  // Data Discovery: locate all records linked to the data subject across tables (Arts. 18, I, II, V & 19)
  const subjectDiscovery = useMemo(() => {
    if (!selectedReq) {
      return { messages: [], quizzes: [], requests: [], consents: [], whistleblowers: [] };
    }
    const targetName = (selectedReq.data_subject_name || selectedReq.requester_name || '').trim().toLowerCase();
    const targetContact = (selectedReq.contact_info || '').trim().toLowerCase();
    const contactDigits = targetContact.replace(/\D/g, '');

    const matchesQuery = (text?: string | null) => {
      if (!text) return false;
      const clean = text.trim().toLowerCase();
      if (!clean) return false;
      if (targetName.length >= 4 && clean.includes(targetName)) return true;
      if (targetContact.length >= 5 && clean.includes(targetContact)) return true;
      if (contactDigits.length >= 8 && clean.replace(/\D/g, '').includes(contactDigits)) return true;
      return false;
    };

    return {
      messages: messages.filter((m) => matchesQuery(m.name) || matchesQuery(m.email) || matchesQuery(m.phone)),
      quizzes: quizSubmissions.filter(
        (q) => matchesQuery(q.contact_name) || matchesQuery(q.contact_email) || matchesQuery(q.company_name)
      ),
      requests: requests.filter(
        (r) => matchesQuery(r.requester_name) || matchesQuery(r.data_subject_name) || matchesQuery(r.contact_info)
      ),
      consents: consentRecords.filter((c) => matchesQuery(c.user_identifier)),
      whistleblowers: whistleblowers.filter((w) => !w.is_anonymous && matchesQuery(w.reporter_name)),
    };
  }, [selectedReq, messages, quizSubmissions, requests, consentRecords, whistleblowers]);

  const totalDiscoveredRecords =
    subjectDiscovery.messages.length +
    subjectDiscovery.quizzes.length +
    subjectDiscovery.requests.length +
    subjectDiscovery.consents.length +
    subjectDiscovery.whistleblowers.length;

  // Generate formal DPO response template based on request_type
  const handleGenerateResponseTemplate = () => {
    if (!selectedReq) return;
    const titular = selectedReq.data_subject_name || selectedReq.requester_name;
    const proto = selectedReq.protocol;
    const today = new Date().toLocaleDateString('pt-BR');

    const templates: Record<string, string> = {
      acesso: `Prezado(a) ${titular},\n\nEm atenção à sua requisição de protocolo ${proto}, e após a devida validação de legitimidade (Art. 46 da Lei nº 13.709/2018), confirmamos a existência de ${totalDiscoveredRecords} registro(s) vinculado(s) aos seus dados em nossos sistemas institucionais.\n\nFinalidades e Bases Legais: Atendimento de solicitações institucionais e cumprimento de obrigação legal/regulatória (Art. 7º, I, II e V da LGPD), sem compartilhamento comercial com terceiros.\n\nO pacote completo de acesso encontra-se à sua disposição pelo canal de retorno selecionado.\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO) | Mascârello Haus Advocacia`,
      portabilidade: `Prezado(a) ${titular},\n\nEm cumprimento ao Art. 18, V e Art. 19, § 3º da Lei nº 13.709/2018 (LGPD), disponibilizamos o arquivo estruturado e interoperável (formato JSON/CSV) contendo a integralidade dos dados pessoais fornecidos por V.Sa., referente ao protocolo ${proto}.\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`,
      eliminacao: `Prezado(a) ${titular},\n\nInformamos que, em atendimento ao protocolo ${proto} (Art. 18, IV e VI da LGPD), procedemos à eliminação/anonimização dos seus dados pessoais nas bases de atendimento e comunicação deste portal, mantendo-se exclusivamente o registro criptografado desta requisição para fins de comprovação de cumprimento de obrigação legal perante a ANPD (Art. 16, I da LGPD).\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`,
      correcao: `Prezado(a) ${titular},\n\nEm resposta ao protocolo ${proto} (Art. 18, III da LGPD), confirmamos que os seus dados cadastrais foram devidamente retificados e atualizados em nossos registros.\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`,
      revogacao: `Prezado(a) ${titular},\n\nEm atenção ao protocolo ${proto} (Art. 8º, § 5º e Art. 18, IX da LGPD), registramos a revogação expressa do seu consentimento a partir desta data (${today}), cessando imediatamente os tratamentos baseados exclusivamente nesta hipótese legal.\n\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`,
      oposicao: `Prezado(a) ${titular},\n\nRecebemos sua manifestação de oposição (Art. 18, § 2º da LGPD — protocolo ${proto}). Após análise técnica e jurídica da base legal aplicável, adotamos as providências cabíveis para cessação de comunicações não essenciais e registro da sua preferência.\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`,
      revisao_automatizada: `Prezado(a) ${titular},\n\nEm cumprimento ao Art. 20 da Lei nº 13.709/2018 (protocolo ${proto}), realizamos a revisão humana integral dos critérios de pontuação/avaliação automatizada. Esclarecemos que os pesos atribuídos baseiam-se exclusivamente em parâmetros objetivos de governança e segurança da informação, sem qualquer viés discriminatório (Art. 6º, IX).\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`,
    };

    const draft =
      templates[selectedReq.request_type] ||
      `Prezado(a) ${titular},\n\nEm atenção à requisição de protocolo ${proto}, informamos que sua solicitação foi analisada e integralmente atendida pela Encarregada de Proteção de Dados (DPO), nos termos dos Arts. 18 e 19 da Lei nº 13.709/2018.\n\nVideira/SC, ${today}.\nMirataira Haus — Encarregada de Proteção de Dados (DPO)`;

    setEditForm((prev) => ({
      ...prev,
      status: 'concluido',
      identity_verified: true,
      resolution_details: draft,
    }));
    onShowToast('success', 'Minuta jurídica preenchida! Revise o texto e clique em Salvar Tratamento.');
  };

  // Export Structured Portability & Access Package (JSON — Art. 18, V & Art. 19, § 3º)
  const handleExportPortabilityPackage = async () => {
    if (!selectedReq) return;
    const pkg = {
      schema: 'LGPD-DataPortability-v1.0',
      controller: {
        name: 'Mascârello Haus Advocacia e Consultoria',
        dpo: 'Mirataira Haus (privacidade@mascarellohaus.adv.br)',
        legalBasisReference: 'Lei Federal nº 13.709/2018 — Art. 18, II e V; Art. 19, § 3º',
      },
      generatedAt: new Date().toISOString(),
      requestProtocol: selectedReq.protocol,
      dataSubject: {
        name: selectedReq.data_subject_name || selectedReq.requester_name,
        contact: selectedReq.contact_info,
        identityVerified: editForm.identity_verified,
      },
      recordsFound: {
        lgpdRequests: subjectDiscovery.requests.map((r) => ({
          protocol: r.protocol,
          type: LGPD_REQUEST_TYPE_LABELS[r.request_type] || r.request_type,
          status: r.status,
          description: r.description,
          resolution: r.resolution_details,
          createdAt: r.created_at,
        })),
        contactMessages: subjectDiscovery.messages.map((m) => ({
          protocol: m.protocol,
          name: m.name,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          createdAt: m.created_at,
        })),
        supplierComplianceAssessments: subjectDiscovery.quizzes.map((q) => ({
          protocol: q.protocol,
          companyName: q.company_name,
          cnpj: q.cnpj,
          contactName: q.contact_name,
          contactEmail: q.contact_email,
          finalScore: q.final_score,
          createdAt: q.created_at,
        })),
        consentRecords: subjectDiscovery.consents.map((c) => ({
          consentType: c.consent_type,
          granted: c.granted,
          policyVersion: c.policy_version,
          createdAt: c.created_at,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portabilidade-lgpd-${selectedReq.protocol.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    await onAudit('EXPORT_PORTABILITY', 'data_subject_requests', selectedReq.protocol, null, {
      recordsExported: totalDiscoveredRecords,
    });
    onShowToast('success', 'Pacote estruturado de Portabilidade e Acesso (JSON) exportado com sucesso!');
  };

  // Anonymize / Eliminate Subject Data across tables (Art. 16 & Art. 18, IV and VI)
  const handleAnonymizeSubjectData = async () => {
    if (!selectedReq) return;
    const subjectLabel = selectedReq.data_subject_name || selectedReq.requester_name;
    const confirmed = window.confirm(
      `ATENÇÃO (Art. 18, IV e VI LGPD): Deseja anonimizar irreversivelmente os dados pessoais de "${subjectLabel}" encontrados em Mensagens de Contato (${subjectDiscovery.messages.length}) e Registros de Consentimento (${subjectDiscovery.consents.length})?\n\nO protocolo oficial da Central LGPD será preservado apenas para comprovação regulatória perante a ANPD (Art. 16, I).`
    );
    if (!confirmed) return;

    setAnonymizing(true);
    try {
      for (const msg of subjectDiscovery.messages) {
        await supabase
          .from('contact_messages')
          .update({
            name: '[ANONIMIZADO ART. 18 LGPD]',
            email: 'anonimizado@lgpd.local',
            phone: '0000000000',
            message: `[Dados pessoais eliminados/anonimizados em cumprimento ao protocolo ${selectedReq.protocol}]`,
            attachments_json: [],
          })
          .eq('id', msg.id);
      }

      for (const consent of subjectDiscovery.consents) {
        await supabase
          .from('consent_records')
          .update({
            user_identifier: 'anonimizado_art18',
            granted: false,
          })
          .eq('id', consent.id);
      }

      await onAudit('ANONYMIZE_SUBJECT', 'data_subject_requests', selectedReq.protocol, null, {
        messagesAnonymized: subjectDiscovery.messages.length,
        consentsAnonymized: subjectDiscovery.consents.length,
      });

      onShowToast(
        'success',
        `Anonimização concluída (${subjectDiscovery.messages.length} mensagem(ns) e ${subjectDiscovery.consents.length} consentimento(s) anonimizados).`
      );
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Erro ao executar anonimização dos registros vinculados.'));
    } finally {
      setAnonymizing(false);
    }
  };

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSaving(true);
    try {
      const isFinalStatus = editForm.status === 'concluido' || editForm.status === 'rejeitado';
      const nowIso = new Date().toISOString();
      const resolvedAtVal = isFinalStatus ? selectedReq.resolved_at || nowIso : null;

      const updates: Record<string, any> = {
        status: editForm.status,
        internal_notes: editForm.internal_notes.trim() || null,
        resolution_details: editForm.resolution_details.trim() || null,
        assigned_to: currentUserId || selectedReq.assigned_to || null,
        updated_at: nowIso,
        resolved_at: resolvedAtVal,
      };

      const { error } = await supabase
        .from('data_subject_requests')
        .update(updates)
        .eq('id', selectedReq.id);

      if (error) throw error;

      // Sync zero-PII public protocol status so the data subject can check on the public site
      await syncPublicProtocolIndex({
        protocol: selectedReq.protocol,
        channel: 'lgpd',
        contactInfo: selectedReq.contact_info,
        request_type: selectedReq.request_type,
        status: editForm.status,
        legal_deadline: selectedReq.legal_deadline,
        resolution_details: editForm.resolution_details.trim() || null,
        identity_verified: editForm.identity_verified,
        created_at: selectedReq.created_at,
        updated_at: nowIso,
        resolved_at: resolvedAtVal,
      });

      await onAudit('UPDATE', 'data_subject_requests', selectedReq.protocol, selectedReq, {
        ...updates,
        identity_verified: editForm.identity_verified,
      });
      onShowToast('success', `Requisição ${selectedReq.protocol} atualizada e sincronizada para consulta do titular!`);
      setSelectedReq(null);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao atualizar requisição LGPD:', err);
      onShowToast('error', formatFriendlyError(err, 'Não foi possível salvar o atendimento da requisição.'));
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
                <th>Tipo de Pedido (Arts. 18 e 20)</th>
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
                          {attCount} anexo(s) criptografado(s)
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

      {/* MODAL: DETALHES E TRATAMENTO LGPD + EXECUÇÃO AUTOMATIZADA */}
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
                <h3>Tratamento de Requisição do Titular (Arts. 18, 19 e 20 LGPD)</h3>
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
                      ? `${selectedReq.data_subject_name || selectedReq.third_party_name || '-'} (Representado — Art. 18, § 3º)`
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
                    <Lock size={14} /> Documentos Comprobatórios Anexados (Acesso Seguro via Signed URL — Art. 46)
                  </h4>
                  <div className="detail-attachments-list">
                    {getAttachments(selectedReq).map((att, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openSecureAttachment(att)}
                        className="attachment-chip"
                        style={{ cursor: 'pointer', border: '1px solid #cbd5e1', background: '#ffffff' }}
                      >
                        🔒 {att.name || `Documento Comprobatório ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CENTRAL DE DESCOBERTA DE DADOS & PORTABILIDADE / ANONIMIZAÇÃO (ARTS. 16, 18 E 19) */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0d3732' }}>
                    <Database size={17} />
                    <strong style={{ fontSize: '0.95rem' }}>
                      Descoberta Automática de Dados do Titular (Data Discovery)
                    </strong>
                  </div>
                  <span className="badge-tone info">
                    {totalDiscoveredRecords} registro(s) localizado(s) no banco
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#475569', marginBottom: '14px' }}>
                  <span>• Requisições LGPD: <strong>{subjectDiscovery.requests.length}</strong></span>
                  <span>• Mensagens de Contato: <strong>{subjectDiscovery.messages.length}</strong></span>
                  <span>• Avaliações de Conformidade: <strong>{subjectDiscovery.quizzes.length}</strong></span>
                  <span>• Logs de Consentimento: <strong>{subjectDiscovery.consents.length}</strong></span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-outline-admin"
                    onClick={handleExportPortabilityPackage}
                    title="Gera arquivo estruturado e interoperável JSON com todos os dados do titular (Art. 18, V e Art. 19, § 3º)"
                  >
                    <FileJson size={15} /> Exportar Portabilidade & Acesso (JSON)
                  </button>
                  <button
                    type="button"
                    className="btn-outline-admin"
                    onClick={handleGenerateResponseTemplate}
                    title="Preenche automaticamente a resposta jurídica formal de acordo com o inciso do Art. 18/20"
                  >
                    <Wand2 size={15} /> Gerar Minuta Oficial de Resposta DPO
                  </button>
                  <button
                    type="button"
                    className="btn-outline-danger"
                    disabled={anonymizing || (subjectDiscovery.messages.length === 0 && subjectDiscovery.consents.length === 0)}
                    onClick={handleAnonymizeSubjectData}
                    title="Anonimiza os dados pessoais do titular nas tabelas de contato e consentimento (Art. 18, IV e VI)"
                  >
                    <Trash2 size={14} /> {anonymizing ? 'Anonimizando...' : 'Anonimizar Dados Vinculados (Art. 18, IV/VI)'}
                  </button>
                </div>
              </div>

              <div className="treatment-section">
                <h4>Parecer e Decisão da Encarregada (DPO)</h4>

                <div className="form-grid-2" style={{ marginBottom: '12px' }}>
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

                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                    <label className="checkbox-inline-label">
                      <input
                        type="checkbox"
                        checked={editForm.identity_verified}
                        onChange={(e) => setEditForm({ ...editForm, identity_verified: e.target.checked })}
                      />
                      <span>
                        <CheckCircle2 size={14} style={{ verticalAlign: 'middle', color: '#059669', marginRight: '4px' }} />
                        Identidade / Procuração Validada (Art. 18, § 3º e Art. 46)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notas Internas / Auditoria do DPO (Sigiloso — Restrito à equipe interna)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editForm.internal_notes}
                    onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                    placeholder="Registre verificações de identidade, bases legais consultadas ou encaminhamentos internos..."
                  />
                </div>

                <div className="form-group">
                  <label>
                    Resposta Oficial ao Titular (Exibida na Consulta Pública de Protocolo após verificação)
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={editForm.resolution_details}
                    onChange={(e) => setEditForm({ ...editForm, resolution_details: e.target.value })}
                    placeholder="Descreva as providências tomadas ou a fundamentação jurídica da resposta (visível ao titular mediante protocolo + confirmação de contato)..."
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
                  <Save size={16} /> {saving ? 'Gravando...' : 'Salvar e Publicar Status no Protocolo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
