import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  KeyRound,
  Search,
  Download,
  Eye,
  X,
  Lock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Mail,
  MessageCircle,
  Info,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  AuditLogRecord,
  ConsentRecord,
  ROLE_LABELS,
  UserProfile,
  exportToCsv,
  formatDateTimeBR,
  formatFriendlyError,
} from '../types';
import { ConfirmModal } from './ConfirmModal';

interface AuditAndSecurityTabProps {
  auditLogs: AuditLogRecord[];
  consentRecords: ConsentRecord[];
  profile: UserProfile | null;
  userEmail: string;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
}

export const AuditAndSecurityTab: React.FC<AuditAndSecurityTabProps> = ({
  auditLogs,
  consentRecords,
  profile,
  userEmail,
  onShowToast,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'audit' | 'consents' | 'security'>('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  // MFA state
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [loadingFactors, setLoadingFactors] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollData, setEnrollData] = useState<{
    id: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState<any | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const loadMfaFactors = async () => {
    setLoadingFactors(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data?.totp) {
        setMfaFactors(data.totp);
      }
    } catch {
      // Ignore if MFA not enabled on project
    } finally {
      setLoadingFactors(false);
    }
  };

  useEffect(() => {
    loadMfaFactors();
  }, []);

  useEffect(() => {
    if (!selectedLog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLog(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedLog]);

  const handleStartEnrollMfa = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Mascarello Haus (${userEmail})`,
      });
      if (error) throw error;
      if (data?.id && data?.totp) {
        setEnrollData({
          id: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
        setVerifyCode('');
      }
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível iniciar a configuração da verificação em duas etapas.'));
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyEnrollMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData || verifyCode.trim().length < 6) {
      onShowToast('error', 'Informe o código de 6 dígitos do aplicativo autenticador.');
      return;
    }

    setVerifyingMfa(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollData.id,
        code: verifyCode.trim(),
      });
      if (error) throw error;

      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ mfa_enabled: true, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
      }

      setEnrollData(null);
      setVerifyCode('');
      await loadMfaFactors();
      await onRefresh();
      onShowToast('success', 'Verificação em Duas Etapas (2FA) ativada com sucesso!');
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Código inválido. Verifique a hora do dispositivo e tente novamente.'));
    } finally {
      setVerifyingMfa(false);
    }
  };

  const handleUnenrollMfa = async () => {
    if (!unenrollTarget) return;
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: unenrollTarget.id });
      if (error) throw error;

      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ mfa_enabled: false, updated_at: new Date().toISOString() })
          .eq('id', profile.id);
      }

      setUnenrollTarget(null);
      await loadMfaFactors();
      await onRefresh();
      onShowToast('success', 'Verificação em duas etapas desativada na conta.');
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível desativar a verificação em duas etapas.'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      onShowToast('error', 'A nova senha deve conter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('error', 'A confirmação da senha não confere.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('success', 'Senha alterada com sucesso!');
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível alterar a senha.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.table_name.toLowerCase().includes(q) ||
      log.record_id.toLowerCase().includes(q) ||
      (log.user_email || '').toLowerCase().includes(q)
    );
  });

  const filteredConsents = consentRecords.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.consent_type.toLowerCase().includes(q) ||
      c.policy_version.toLowerCase().includes(q) ||
      (c.user_identifier || '').toLowerCase().includes(q)
    );
  });

  const verifiedFactors = mfaFactors.filter((f) => f.status === 'verified');

  return (
    <div>
      <div className="toolbar-bar">
        <div className="toolbar-filters">
          <div className="subtab-pills">
            <button
              type="button"
              className={`subtab-pill ${subTab === 'audit' ? 'active' : ''}`}
              onClick={() => setSubTab('audit')}
            >
              <Clock size={14} /> Trilha de Auditoria ({auditLogs.length})
            </button>
            <button
              type="button"
              className={`subtab-pill ${subTab === 'consents' ? 'active' : ''}`}
              onClick={() => setSubTab('consents')}
            >
              <ShieldCheck size={14} /> Consentimentos LGPD ({consentRecords.length})
            </button>
            <button
              type="button"
              className={`subtab-pill ${subTab === 'security' ? 'active' : ''}`}
              onClick={() => setSubTab('security')}
            >
              <KeyRound size={14} /> Segurança & Suporte
            </button>
          </div>

          {subTab !== 'security' && (
            <div className="search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder={
                  subTab === 'audit'
                    ? 'Filtrar por ação, tabela, usuário...'
                    : 'Filtrar por tipo de consentimento ou versão...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {subTab !== 'security' && (
          <div className="toolbar-actions">
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() => {
                if (subTab === 'audit') {
                  exportToCsv(
                    `auditoria-${new Date().toISOString().slice(0, 10)}.csv`,
                    ['ID', 'Ação', 'Tabela', 'Registro', 'Usuário', 'Data/Hora'],
                    filteredLogs.map((l) => [
                      l.id,
                      l.action,
                      l.table_name,
                      l.record_id,
                      l.user_email || '-',
                      formatDateTimeBR(l.created_at),
                    ])
                  );
                } else {
                  exportToCsv(
                    `consentimentos-lgpd-${new Date().toISOString().slice(0, 10)}.csv`,
                    ['Tipo', 'Concedido', 'Identificador', 'Versão Política', 'Data/Hora'],
                    filteredConsents.map((c) => [
                      c.consent_type,
                      c.granted ? 'Sim' : 'Não',
                      c.user_identifier || '-',
                      c.policy_version,
                      formatDateTimeBR(c.created_at),
                    ])
                  );
                }
              }}
            >
              <Download size={15} /> Exportar CSV
            </button>
          </div>
        )}
      </div>

      {subTab === 'audit' && (
        <div className="table-responsive">
          {filteredLogs.length === 0 ? (
            <div className="table-empty-cell">
              Nenhum evento de auditoria registrado ou visível para o seu nível de acesso.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Tabela / Módulo</th>
                  <th>Registro</th>
                  <th>Usuário</th>
                  <th>Data / Hora</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span
                        className={`badge-tone ${
                          log.action === 'DELETE'
                            ? 'danger'
                            : log.action === 'INSERT'
                            ? 'success'
                            : 'info'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <code className="slug-code">{log.table_name}</code>
                    </td>
                    <td>{log.record_id}</td>
                    <td>{log.user_email || 'Sistema'}</td>
                    <td className="tabular-nums">{formatDateTimeBR(log.created_at)}</td>
                    <td>
                      {(log.old_data || log.new_data) && (
                        <button
                          type="button"
                          className="table-action-btn view"
                          onClick={() => setSelectedLog(log)}
                          title="Visualizar detalhes"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {subTab === 'consents' && (
        <div className="table-responsive">
          {filteredConsents.length === 0 ? (
            <div className="table-empty-cell">Nenhum registro de consentimento localizado.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Finalidade / Tipo</th>
                  <th>Consentimento</th>
                  <th>Versão da Política</th>
                  <th>Identificador</th>
                  <th>Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsents.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.consent_type}</strong>
                    </td>
                    <td>
                      <span className={`badge-tone ${c.granted ? 'success' : 'danger'}`}>
                        {c.granted ? 'Concedido' : 'Recusado / Revogado'}
                      </span>
                    </td>
                    <td>
                      <code className="slug-code">v{c.policy_version}</code>
                    </td>
                    <td>{c.user_identifier || 'Anônimo'}</td>
                    <td className="tabular-nums">{formatDateTimeBR(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {subTab === 'security' && (
        <div className="settings-form-container">
          <div className="security-cards-grid">
            {/* Card 1: Conta & Perfil */}
            <div className="security-card">
              <div className="security-card-header">
                <Lock size={18} />
                <h3>Perfil de Acesso & Permissões</h3>
              </div>
              <div className="detail-info-grid" style={{ marginTop: '12px' }}>
                <div>
                  <small>Nome Completo</small>
                  <strong>{profile?.full_name || userEmail}</strong>
                </div>
                <div>
                  <small>E-mail</small>
                  <strong>{profile?.email || userEmail}</strong>
                </div>
                <div>
                  <small>Perfil de Acesso</small>
                  <span className="badge-tone info">
                    {profile?.role ? ROLE_LABELS[profile.role] || profile.role : 'Staff'}
                  </span>
                </div>
                <div>
                  <small>Verificação em Duas Etapas (2FA)</small>
                  <span className={`badge-tone ${verifiedFactors.length > 0 ? 'success' : 'warning'}`}>
                    {verifiedFactors.length > 0 ? 'Ativo' : 'Desativado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Verificação em Duas Etapas */}
            <div className="security-card">
              <div className="security-card-header">
                <KeyRound size={18} />
                <h3>Verificação em Duas Etapas (2FA)</h3>
              </div>
              <p className="settings-section-desc" style={{ marginTop: '8px' }}>
                Use um aplicativo autenticador (Google Authenticator, Microsoft Authenticator ou 1Password) para proteger o acesso ao painel.
              </p>

              {loadingFactors ? (
                <p className="table-subtext">Verificando configurações de segurança...</p>
              ) : verifiedFactors.length > 0 ? (
                <div className="mfa-active-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46' }}>
                    <CheckCircle2 size={18} />
                    <strong>Verificação em duas etapas ativa nesta conta</strong>
                  </div>
                  {verifiedFactors.map((factor) => (
                    <div key={factor.id} className="mfa-factor-row">
                      <span>{factor.friendly_name || 'Aplicativo Autenticador'}</span>
                      <button
                        type="button"
                        className="btn-outline-danger"
                        onClick={() => setUnenrollTarget(factor)}
                      >
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : enrollData ? (
                <form onSubmit={handleVerifyEnrollMfa} className="mfa-enroll-box">
                  <p style={{ fontSize: '0.85rem', margin: '0 0 12px', color: '#334155' }}>
                    1. Escaneie o QR Code abaixo no seu aplicativo autenticador ou insira a chave secreta manualmente:
                  </p>
                  <div className="mfa-qr-wrap">
                    <img src={enrollData.qrCode} alt="QR Code de verificação em duas etapas" className="mfa-qr-img" />
                    <div>
                      <small style={{ color: '#64748b', display: 'block' }}>Chave Secreta:</small>
                      <code className="slug-code" style={{ wordBreak: 'break-all' }}>
                        {enrollData.secret}
                      </code>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <label>2. Digite o código de 6 dígitos gerado pelo app</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        className="form-control"
                        placeholder="000000"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <button type="submit" className="btn-save-main" disabled={verifyingMfa}>
                        {verifyingMfa ? 'Validando...' : 'Ativar 2FA'}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setEnrollData(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="btn-save-main"
                  disabled={enrolling}
                  onClick={handleStartEnrollMfa}
                >
                  <KeyRound size={15} /> {enrolling ? 'Gerando QR Code...' : 'Ativar Verificação em Duas Etapas'}
                </button>
              )}
            </div>

            {/* Card 3: Alterar Senha */}
            <div className="security-card">
              <div className="security-card-header">
                <ShieldCheck size={18} />
                <h3>Atualizar Senha de Acesso</h3>
              </div>
              <form onSubmit={handleChangePassword} style={{ marginTop: '14px' }}>
                <div className="form-row">
                  <div className="form-group col-6">
                    <label>Nova Senha (mín. 8 caracteres)</label>
                    <input
                      type="password"
                      className="form-control"
                      minLength={8}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group col-6">
                    <label>Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      minLength={8}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-outline-admin" disabled={updatingPassword}>
                  {updatingPassword ? 'Atualizando...' : 'Alterar Senha'}
                </button>
              </form>
            </div>

            {/* Card 4: Sobre, Suporte Técnico & LGPD (ApexCode) */}
            <div className="security-card">
              <div className="security-card-header">
                <Info size={18} />
                <h3>Sobre o Sistema, Suporte & Privacidade (LGPD)</h3>
              </div>
              <p className="settings-section-desc" style={{ marginTop: '8px', marginBottom: '12px' }}>
                Plataforma administrativa desenvolvida, hospedada e mantida pela <strong>ApexCode</strong> em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
              </p>
              <div className="apexcode-support-links">
                <a
                  href="https://www.apexcode.dev.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-admin"
                >
                  <ExternalLink size={14} /> Site Oficial ApexCode
                </a>
                <a
                  href="https://wa.me/5549999281878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-admin"
                >
                  <MessageCircle size={14} /> Suporte WhatsApp: (49) 99928-1878
                </a>
                <a
                  href="mailto:contato@apexcode.dev.br"
                  className="btn-outline-admin"
                >
                  <Mail size={14} /> E-mail / LGPD: contato@apexcode.dev.br
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO LOG DE AUDITORIA */}
      {selectedLog && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Detalhes do Registro de Auditoria #{selectedLog.id}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-form">
              <div className="detail-info-grid">
                <div>
                  <small>Ação</small>
                  <strong>{selectedLog.action}</strong>
                </div>
                <div>
                  <small>Tabela / Módulo</small>
                  <code className="slug-code">{selectedLog.table_name}</code>
                </div>
                <div>
                  <small>Registro</small>
                  <strong>{selectedLog.record_id}</strong>
                </div>
                <div>
                  <small>Usuário</small>
                  <strong>{selectedLog.user_email || 'Sistema'}</strong>
                </div>
              </div>

              {selectedLog.old_data && (
                <div style={{ marginTop: '16px' }}>
                  <small style={{ color: '#64748b', fontWeight: 600 }}>Dados Anteriores</small>
                  <pre className="audit-json-pre">{JSON.stringify(selectedLog.old_data, null, 2)}</pre>
                </div>
              )}

              {selectedLog.new_data && (
                <div style={{ marginTop: '16px' }}>
                  <small style={{ color: '#64748b', fontWeight: 600 }}>Novos Dados</small>
                  <pre className="audit-json-pre">{JSON.stringify(selectedLog.new_data, null, 2)}</pre>
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setSelectedLog(null)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(unenrollTarget)}
        title="Desativar Verificação em Duas Etapas"
        message="Tem certeza que deseja desativar a verificação em duas etapas da sua conta? No próximo acesso será solicitada apenas sua senha."
        confirmLabel="Desativar 2FA"
        onConfirm={handleUnenrollMfa}
        onCancel={() => setUnenrollTarget(null)}
      />
    </div>
  );
};
