import React from 'react';
import {
  FileText,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ShieldCheck,
  TrendingUp,
  Cookie,
  Database,
  Scale,
} from 'lucide-react';
import {
  CookieBannerConfig,
  LegalDocumentsConfig,
  LgpdGovernanceConfig,
} from '../../../lib/lgpdConfig';
import {
  ContactMessageRecord,
  ConsentRecord,
  DashboardTab,
  LgpdRequestRecord,
  PostRecord,
  QuizSubmissionRecord,
  WhistleblowerRecord,
  daysUntilDeadline,
  formatDateBR,
  LGPD_STATUS_META,
  WHISTLEBLOWER_STATUS_META,
  MESSAGE_STATUS_META,
} from '../types';

interface OverviewTabProps {
  posts: PostRecord[];
  lgpdRequests: LgpdRequestRecord[];
  whistleblowers: WhistleblowerRecord[];
  messages: ContactMessageRecord[];
  quizSubmissions: QuizSubmissionRecord[];
  consentRecords: ConsentRecord[];
  mfaEnabled: boolean;
  cookieConfig: CookieBannerConfig;
  governanceConfig: LgpdGovernanceConfig;
  legalDocsConfig: LegalDocumentsConfig;
  onNavigate: (tab: DashboardTab) => void;
  onNewPost: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  posts,
  lgpdRequests,
  whistleblowers,
  messages,
  quizSubmissions,
  consentRecords,
  mfaEnabled,
  cookieConfig,
  governanceConfig,
  legalDocsConfig,
  onNavigate,
  onNewPost,
}) => {
  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const draftPosts = posts.filter((p) => p.status !== 'published').length;

  const openLgpd = lgpdRequests.filter((r) => r.status !== 'concluido' && r.status !== 'rejeitado');
  const urgentLgpd = openLgpd.filter((r) => {
    const days = daysUntilDeadline(r.legal_deadline);
    return days !== null && days <= 3;
  });

  const newDenuncias = whistleblowers.filter((w) => w.status === 'new');
  const investigatingDenuncias = whistleblowers.filter((w) => w.status === 'investigating');

  const pendingMessages = messages.filter((m) => (m.status || 'pendente') === 'pendente');

  const avgQuizScore =
    quizSubmissions.length > 0
      ? Math.round(
          quizSubmissions.reduce((acc, q) => acc + (Number(q.final_score) || 0), 0) /
            quizSubmissions.length
        )
      : null;

  const lowComplianceQuizzes = quizSubmissions.filter(
    (q) => q.final_score !== null && Number(q.final_score) < 50
  ).length;

  const grantedConsents = consentRecords.filter((c) => c.granted).length;

  const openIncidents = governanceConfig.incidents.filter((i) => i.status !== 'encerrado').length;
  const lgpdChecks = [
    { label: 'Banner de Cookies', ok: cookieConfig.enabled && cookieConfig.cookiesTable.length > 0, tab: 'cookies' as DashboardTab },
    { label: 'DPO Configurado', ok: Boolean(governanceConfig.dpoName.trim() && governanceConfig.dpoEmail.trim()), tab: 'governance' as DashboardTab },
    { label: 'Mapeamento ROPA', ok: governanceConfig.ropaRecords.length > 0, tab: 'governance' as DashboardTab },
    { label: 'Privacidade & Termos', ok: Boolean(legalDocsConfig.privacyPolicy.version && legalDocsConfig.termsOfUse.version), tab: 'legal_docs' as DashboardTab },
    { label: 'Incidentes Controlados', ok: openIncidents === 0, tab: 'governance' as DashboardTab },
    { label: 'Verificação 2FA', ok: mfaEnabled, tab: 'audit' as DashboardTab },
  ];
  const maturityScore = Math.round((lgpdChecks.filter((c) => c.ok).length / lgpdChecks.length) * 100);

  return (
    <div className="overview-wrapper">
      {/* Urgent Deadlines / Triage Banner */}
      {(urgentLgpd.length > 0 || newDenuncias.length > 0) && (
        <div className="overview-alert-banner danger">
          <div className="overview-alert-content">
            <Clock size={20} />
            <div>
              <strong>Atenção Prioritária Requerida</strong>
              <p>
                {urgentLgpd.length > 0 &&
                  `${urgentLgpd.length} requisição(ões) LGPD com prazo legal vencendo em ≤ 3 dias ou vencida(s). `}
                {newDenuncias.length > 0 &&
                  `${newDenuncias.length} novo(s) relato(s) no Canal de Denúncias aguardando triagem.`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {urgentLgpd.length > 0 && (
              <button type="button" className="btn-banner-action" onClick={() => onNavigate('lgpd')}>
                Ver LGPD <ArrowRight size={14} />
              </button>
            )}
            {newDenuncias.length > 0 && (
              <button type="button" className="btn-banner-action" onClick={() => onNavigate('denuncias')}>
                Ver Denúncias <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* LGPD Executive Governance Strip */}
      <div className="lgpd-executive-card">
        <div className="lgpd-exec-top">
          <div>
            <span className="lgpd-exec-kicker">Governança & Privacidade · Lei nº 13.709/2018</span>
            <h3>Índice de Prontidão LGPD do Portal</h3>
            <p>
              Encarregado (DPO): <strong>{governanceConfig.dpoName}</strong> ({governanceConfig.dpoEmail}) ·{' '}
              {governanceConfig.ropaRecords.length} processo(s) mapeado(s) · {openIncidents} incidente(s) aberto(s)
            </p>
          </div>
          <div className="lgpd-exec-score-box">
            <span className="lgpd-exec-score-value tabular-nums">{maturityScore}%</span>
            <small>Conformidade Operacional</small>
          </div>
        </div>

        <div className="lgpd-progress-track" aria-hidden="true">
          <div className="lgpd-progress-fill" style={{ width: `${maturityScore}%` }} />
        </div>

        <div className="lgpd-exec-pills">
          {lgpdChecks.map((chk) => (
            <button
              key={chk.label}
              type="button"
              className={`lgpd-check-pill ${chk.ok ? 'ok' : 'pending'}`}
              onClick={() => onNavigate(chk.tab)}
            >
              <CheckCircle2 size={13} />
              <span>{chk.label}</span>
            </button>
          ))}
        </div>

        <div className="lgpd-exec-shortcuts">
          <button type="button" className="exec-shortcut-btn" onClick={() => onNavigate('cookies')}>
            <Cookie size={14} /> Configurar Banner de Cookies
          </button>
          <button type="button" className="exec-shortcut-btn" onClick={() => onNavigate('governance')}>
            <Database size={14} /> ROPA, Incidentes & DPO
          </button>
          <button type="button" className="exec-shortcut-btn" onClick={() => onNavigate('legal_docs')}>
            <Scale size={14} /> Privacidade & Termos de Uso
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <button type="button" className="kpi-card" onClick={() => onNavigate('lgpd')}>
          <div className="kpi-header">
            <span className="kpi-label">Requisições LGPD (Art. 18)</span>
            <span className="kpi-icon teal">
              <ShieldAlert size={18} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{lgpdRequests.length}</div>
          <div className="kpi-meta">
            <span className={openLgpd.length > 0 ? 'kpi-tag warning' : 'kpi-tag success'}>
              {openLgpd.length} em aberto
            </span>
            {urgentLgpd.length > 0 && (
              <span className="kpi-tag danger">{urgentLgpd.length} urgente(s)</span>
            )}
          </div>
        </button>

        <button type="button" className="kpi-card" onClick={() => onNavigate('denuncias')}>
          <div className="kpi-header">
            <span className="kpi-label">Canal de Denúncias</span>
            <span className="kpi-icon amber">
              <AlertTriangle size={18} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{whistleblowers.length}</div>
          <div className="kpi-meta">
            <span className={newDenuncias.length > 0 ? 'kpi-tag danger' : 'kpi-tag neutral'}>
              {newDenuncias.length} novo(s)
            </span>
            <span className="kpi-tag warning">{investigatingDenuncias.length} em apuração</span>
          </div>
        </button>

        <button type="button" className="kpi-card" onClick={() => onNavigate('messages')}>
          <div className="kpi-header">
            <span className="kpi-label">Mensagens de Contato</span>
            <span className="kpi-icon blue">
              <MessageSquare size={18} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{messages.length}</div>
          <div className="kpi-meta">
            <span className={pendingMessages.length > 0 ? 'kpi-tag warning' : 'kpi-tag success'}>
              {pendingMessages.length} pendente(s)
            </span>
          </div>
        </button>

        <button type="button" className="kpi-card" onClick={() => onNavigate('quizzes')}>
          <div className="kpi-header">
            <span className="kpi-label">Conformidade Fornecedores</span>
            <span className="kpi-icon emerald">
              <ClipboardCheck size={18} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{quizSubmissions.length}</div>
          <div className="kpi-meta">
            <span className="kpi-tag info">
              Média: {avgQuizScore !== null ? `${avgQuizScore}%` : '—'}
            </span>
            {lowComplianceQuizzes > 0 && (
              <span className="kpi-tag danger">{lowComplianceQuizzes} crítico(s)</span>
            )}
          </div>
        </button>

        <button type="button" className="kpi-card" onClick={() => onNavigate('posts')}>
          <div className="kpi-header">
            <span className="kpi-label">Artigos & Cartilhas</span>
            <span className="kpi-icon gold">
              <FileText size={18} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{posts.length}</div>
          <div className="kpi-meta">
            <span className="kpi-tag success">{publishedPosts} publicado(s)</span>
            {draftPosts > 0 && <span className="kpi-tag neutral">{draftPosts} rascunho(s)</span>}
          </div>
        </button>

        <button type="button" className="kpi-card" onClick={() => onNavigate('audit')}>
          <div className="kpi-header">
            <span className="kpi-label">Consentimentos LGPD</span>
            <span className="kpi-icon slate">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="kpi-value tabular-nums">{consentRecords.length}</div>
          <div className="kpi-meta">
            <span className="kpi-tag success">{grantedConsents} aceitos</span>
          </div>
        </button>
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions-strip">
        <div className="quick-actions-title">
          <TrendingUp size={16} /> Ações Rápidas de Produção
        </div>
        <div className="quick-actions-buttons">
          <button type="button" className="btn-create-post" onClick={onNewPost}>
            <Plus size={15} /> Nova Publicação
          </button>
          <button type="button" className="btn-outline-admin" onClick={() => onNavigate('lgpd')}>
            <ShieldAlert size={15} /> Tratar Requisições LGPD
          </button>
          <button type="button" className="btn-outline-admin" onClick={() => onNavigate('denuncias')}>
            <AlertTriangle size={15} /> Ouvidoria & Denúncias
          </button>
          <button type="button" className="btn-outline-admin" onClick={() => onNavigate('content')}>
            <CheckCircle2 size={15} /> Editar Textos da Home
          </button>
        </div>
      </div>

      {/* Two-Column Triage Panels */}
      <div className="overview-panels-grid">
        {/* Recent LGPD Requests */}
        <div className="overview-panel">
          <div className="overview-panel-header">
            <h3>Últimas Requisições LGPD</h3>
            <button type="button" className="panel-link-btn" onClick={() => onNavigate('lgpd')}>
              Ver todas <ArrowRight size={13} />
            </button>
          </div>
          {lgpdRequests.length === 0 ? (
            <p className="panel-empty">Nenhuma requisição registrada até o momento.</p>
          ) : (
            <div className="panel-list">
              {lgpdRequests.slice(0, 5).map((req) => {
                const statusInfo = LGPD_STATUS_META[req.status] || { label: req.status, tone: 'info' };
                const days = daysUntilDeadline(req.legal_deadline);
                return (
                  <div key={req.id} className="panel-list-item" onClick={() => onNavigate('lgpd')}>
                    <div>
                      <div className="panel-item-title">
                        <code>{req.protocol}</code> — <strong>{req.requester_name}</strong>
                      </div>
                      <div className="panel-item-sub">
                        Prazo: {formatDateBR(req.legal_deadline)}
                        {req.status !== 'concluido' && req.status !== 'rejeitado' && days !== null && (
                          <span className={days < 0 ? 'deadline-text overdue' : days <= 3 ? 'deadline-text urgent' : 'deadline-text'}>
                            {' '}({days < 0 ? `${Math.abs(days)}d em atraso` : `${days}d restantes`})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`badge-tone ${statusInfo.tone}`}>{statusInfo.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Whistleblower & Messages */}
        <div className="overview-panel">
          <div className="overview-panel-header">
            <h3>Últimas Denúncias & Mensagens</h3>
            <button type="button" className="panel-link-btn" onClick={() => onNavigate('denuncias')}>
              Canal de Denúncias <ArrowRight size={13} />
            </button>
          </div>
          {whistleblowers.length === 0 && messages.length === 0 ? (
            <p className="panel-empty">Nenhum relato ou contato recente registrado.</p>
          ) : (
            <div className="panel-list">
              {whistleblowers.slice(0, 3).map((d) => {
                const statusInfo = WHISTLEBLOWER_STATUS_META[d.status] || { label: d.status, tone: 'neutral' };
                return (
                  <div key={`den-${d.id}`} className="panel-list-item" onClick={() => onNavigate('denuncias')}>
                    <div>
                      <div className="panel-item-title">
                        <code>{d.protocol}</code> — {d.is_anonymous ? 'Relato Anônimo' : d.reporter_name || 'Identificado'}
                      </div>
                      <div className="panel-item-sub">
                        Envolvidos: {d.involved_persons} · {formatDateBR(d.created_at)}
                      </div>
                    </div>
                    <span className={`badge-tone ${statusInfo.tone}`}>{statusInfo.label}</span>
                  </div>
                );
              })}
              {messages.slice(0, 3).map((m) => {
                const msgStatus = (m.status || 'pendente') as keyof typeof MESSAGE_STATUS_META;
                const statusInfo = MESSAGE_STATUS_META[msgStatus] || { label: m.status, tone: 'info' };
                return (
                  <div key={`msg-${m.id}`} className="panel-list-item" onClick={() => onNavigate('messages')}>
                    <div>
                      <div className="panel-item-title">
                        <strong>{m.name}</strong> — {m.subject || 'Contato Institucional'}
                      </div>
                      <div className="panel-item-sub">
                        {m.email} · {formatDateBR(m.created_at)}
                      </div>
                    </div>
                    <span className={`badge-tone ${statusInfo.tone}`}>{statusInfo.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
