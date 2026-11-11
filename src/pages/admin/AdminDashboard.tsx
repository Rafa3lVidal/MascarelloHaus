import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Edit,
  Sliders,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  ClipboardCheck,
  Clock,
  LogOut,
  ExternalLink,
  RefreshCw,
  Check,
  AlertCircle,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import {
  AuditLogRecord,
  CategoryRecord,
  ConsentRecord,
  ContactMessageRecord,
  DashboardTab,
  LgpdRequestRecord,
  PageRecord,
  PostRecord,
  PracticeAreaRecord,
  QuizSubmissionRecord,
  ROLE_LABELS,
  SiteSettingsState,
  UserProfile,
  WhistleblowerRecord,
} from './types';
import { OverviewTab } from './components/OverviewTab';
import { PostsTab } from './components/PostsTab';
import { PagesAndAreasTab } from './components/PagesAndAreasTab';
import { LgpdRequestsTab } from './components/LgpdRequestsTab';
import { WhistleblowerTab } from './components/WhistleblowerTab';
import { MessagesTab } from './components/MessagesTab';
import { QuizzesTab } from './components/QuizzesTab';
import { SiteContentTab } from './components/SiteContentTab';
import { AuditAndSecurityTab } from './components/AuditAndSecurityTab';
import './admin-dashboard.css';

const DEFAULT_SITE_SETTINGS: SiteSettingsState = {
  site_name: 'Mascârello Haus Advocacia',
  tagline: 'Soluções Jurídicas Estratégicas',
  whatsapp: '+5549988220982',
  contact_email: 'contato@mascarellohaus.adv.br',
  dpo_email: 'privacidade@mascarellohaus.adv.br',
  address:
    'Esquina com a - Rua Coronel Alberto Schmidt, n.º 10, Edifício Laura, 1.º Andar, Sala 5, R. Brasil - Centro, Videira - SC, 89560-198',
  instagram_url: 'https://www.instagram.com/mascarellohausadvocacia',
  linkedin_url: 'https://www.linkedin.com/company/mascarello-haus-advocacia/',
  youtube_url: 'https://www.youtube.com/@mascarellohausadvocacia',
  facebook_url: 'https://www.facebook.com/mascarellohausadvocacia/',
  banner_title: 'Direito Empresarial, Civil, Trabalho e Previdenciário',
  banner_subtitle:
    'Assessoria jurídica especializada para empresas e pessoas físicas com foco em conformidade, segurança da informação e governança corporativa.',
  assessoria_title: 'Como funciona a assessoria empresarial?',
  assessoria_subtitle:
    'Apoiamos sua empresa em cada etapa com segurança jurídica preventiva, estratégica e contenciosa.',
};

const TAB_HEADER_INFO: Record<DashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Visão Geral & Indicadores de Produção',
    subtitle: 'Resumo executivo de publicações, prazos legais da LGPD, ouvidoria e atendimentos.',
  },
  posts: {
    title: 'Gestão de Artigos, Cartilhas e E-books',
    subtitle: 'Publique materiais, envie capas ou PDFs e configure metadados de SEO.',
  },
  pages: {
    title: 'Gestão de Páginas Institucionais e Áreas de Atuação',
    subtitle: 'Edite conteúdos, status de publicação e textos das áreas jurídicas.',
  },
  content: {
    title: 'Personalização de Conteúdos e Textos do Site',
    subtitle: 'Configure informações institucionais, canais de contato e chamadas da Home.',
  },
  lgpd: {
    title: 'Central LGPD — Requisições de Titulares (Art. 18)',
    subtitle: 'Acompanhe prazos legais de 15 dias, analise anexos e registre o parecer do DPO.',
  },
  denuncias: {
    title: 'Canal de Denúncias & Ouvidoria Segura',
    subtitle: 'Triagem e apuração sigilosa de relatos recebidos com acompanhamento de status.',
  },
  quizzes: {
    title: 'Avaliações de Conformidade LGPD de Fornecedores',
    subtitle: 'Consulte índices de maturidade, evidências anexadas e exporte relatórios.',
  },
  messages: {
    title: 'Caixa de Entrada — Mensagens de Contato',
    subtitle: 'Gerencie contatos comerciais e dúvidas jurídicas recebidas pelo site.',
  },
  audit: {
    title: 'Auditoria, Consentimentos LGPD & Segurança',
    subtitle: 'Trilha de auditoria, prova de consentimento de cookies/formulários e verificação em duas etapas.',
  },
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [lgpdRequests, setLgpdRequests] = useState<LgpdRequestRecord[]>([]);
  const [whistleblowers, setWhistleblowers] = useState<WhistleblowerRecord[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmissionRecord[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsState>(DEFAULT_SITE_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [partialNotice, setPartialNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newPostTrigger, setNewPostTrigger] = useState(0);

  const navigate = useNavigate();

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4500);
  }, []);

  const logAdminAction = useCallback(
    async (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => {
      try {
        await supabase.from('audit_log').insert({
          user_id: currentUser?.id || null,
          user_email: currentUser?.email || null,
          action,
          table_name: tableName,
          record_id: String(recordId),
          old_data: oldData || null,
          new_data: newData || null,
        });
      } catch {
        // Best-effort client audit log; DB triggers or RLS may manage inserts independently
      }
    },
    [currentUser]
  );

  const loadAllData = useCallback(async (userId?: string, silent = false) => {
    if (!silent) setLoading(true);
    setSyncing(true);
    setPartialNotice(null);

    try {
      const results = await Promise.allSettled([
        supabase.from('posts').select('*').order('published_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('pages').select('*').order('title'),
        supabase.from('practice_areas').select('*').order('order_index'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('data_subject_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('whistleblower_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('quiz_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('consent_records').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(150),
        supabase.from('site_settings').select('*'),
        userId
          ? supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      const restrictedModules: string[] = [];
      const extract = (idx: number, label: string) => {
        const res = results[idx];
        if (res.status === 'fulfilled' && !res.value.error) {
          return res.value.data;
        }
        if (res.status === 'fulfilled' && res.value.error) {
          console.warn(`Aviso ao carregar ${label}:`, res.value.error.message);
          restrictedModules.push(label);
        }
        return null;
      };

      const postsData = extract(0, 'Publicações');
      if (postsData) setPosts(postsData as PostRecord[]);

      const catsData = extract(1, 'Categorias');
      if (catsData) setCategories(catsData as CategoryRecord[]);

      const pagesData = extract(2, 'Páginas');
      if (pagesData) setPages(pagesData as PageRecord[]);

      const areasData = extract(3, 'Áreas de Atuação');
      if (areasData) setPracticeAreas(areasData as PracticeAreaRecord[]);

      const msgData = extract(4, 'Mensagens');
      if (msgData) setMessages(msgData as ContactMessageRecord[]);

      const lgpdData = extract(5, 'Central LGPD');
      if (lgpdData) setLgpdRequests(lgpdData as LgpdRequestRecord[]);

      const wbData = extract(6, 'Canal de Denúncias');
      if (wbData) setWhistleblowers(wbData as WhistleblowerRecord[]);

      const quizData = extract(7, 'Conformidade');
      if (quizData) setQuizSubmissions(quizData as QuizSubmissionRecord[]);

      const consentData = extract(8, 'Consentimentos');
      if (consentData) setConsentRecords(consentData as ConsentRecord[]);

      const auditData = extract(9, 'Auditoria');
      if (auditData) setAuditLogs(auditData as AuditLogRecord[]);

      const settingsData = extract(10, 'Configurações');
      if (Array.isArray(settingsData)) {
        const general = settingsData.find((s: any) => s.key === 'general')?.value_json || {};
        const home = settingsData.find((s: any) => s.key === 'home_content')?.value_json || {};
        setSiteSettings((prev) => ({ ...prev, ...general, ...home }));
      }

      const profileRes = results[11];
      if (profileRes.status === 'fulfilled' && profileRes.value && !profileRes.value.error && profileRes.value.data) {
        setProfile(profileRes.value.data as UserProfile);
      }

      if (restrictedModules.length > 0 && restrictedModules.length <= 3) {
        setPartialNotice(
          `Alguns módulos não estão habilitados para o seu perfil de acesso: ${restrictedModules.join(', ')}.`
        );
      }

      try {
        const { data: mfaData } = await supabase.auth.mfa.listFactors();
        const hasVerified = Boolean(mfaData?.totp?.some((f) => f.status === 'verified'));
        setMfaEnabled(hasVerified);
      } catch {
        // Ignore MFA check failure
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados do painel:', err);
      showToast('error', 'Não foi possível sincronizar os dados do painel no momento.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    let mounted = true;

    async function checkAuthAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      if (!user) {
        navigate('/admin');
        return;
      }

      setCurrentUser(user);
      await loadAllData(user.id);
    }

    checkAuthAndLoad();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        navigate('/admin');
      } else {
        setCurrentUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, loadAllData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleQuickNewPost = () => {
    setActiveTab('posts');
    setNewPostTrigger((c) => c + 1);
    setMobileMenuOpen(false);
  };

  // Urgent / Pending Badges for Sidebar
  const openLgpdCount = lgpdRequests.filter(
    (r) => r.status !== 'concluido' && r.status !== 'rejeitado'
  ).length;
  const newDenunciasCount = whistleblowers.filter((w) => w.status === 'new').length;
  const pendingMsgCount = messages.filter((m) => (m.status || 'pendente') === 'pendente').length;

  const headerInfo = TAB_HEADER_INFO[activeTab];

  return (
    <div className="admin-dashboard-layout">
      <SEO title="Painel de Gestão | Mascârello Haus Advocacia" />

      {/* Toast Feedback */}
      {feedback && (
        <div className={`admin-toast ${feedback.type}`} role="status" aria-live="polite">
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="admin-mobile-bar no-print">
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu administrativo"
        >
          <Menu size={18} /> Menu
        </button>
        <img
          src="/assets/logo2025branca.png"
          alt="Mascârello Haus"
          style={{ height: '30px', width: 'auto' }}
        />
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={() => loadAllData(currentUser?.id, true)}
          aria-label="Sincronizar"
        >
          <RefreshCw size={16} className={syncing ? 'spin' : ''} />
        </button>
      </div>

      {/* Overlay Mobile */}
      <div
        className={`admin-sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar no-print ${mobileMenuOpen ? 'open' : ''}`} aria-label="Menu do painel administrativo">
        <div className="sidebar-brand">
          <div className="sidebar-brand-top">
            <img
              src="/assets/logo2025branca.png"
              alt="Logo Mascârello Haus"
              className="admin-sidebar-logo"
            />
            <button
              type="button"
              className="sidebar-close-mobile"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>
          <span className="user-email-badge">{currentUser?.email || 'Equipe Mascârello Haus'}</span>
          <span className="user-role-pill">
            <Shield size={11} />
            {profile?.role ? ROLE_LABELS[profile.role] || profile.role : 'Staff'}
            {mfaEnabled ? ' · 2FA Ativo' : ''}
          </span>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleSelectTab('overview')}
          >
            <span className="sidebar-nav-left">
              <LayoutDashboard size={17} /> Visão Geral
            </span>
          </button>

          <span className="sidebar-section-label">Conteúdo & Site</span>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => handleSelectTab('posts')}
          >
            <span className="sidebar-nav-left">
              <FileText size={17} /> Artigos & Publicações
            </span>
            <span className="sidebar-count-badge">{posts.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => handleSelectTab('pages')}
          >
            <span className="sidebar-nav-left">
              <Edit size={17} /> Páginas & Áreas
            </span>
            <span className="sidebar-count-badge">{pages.length + practiceAreas.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => handleSelectTab('content')}
          >
            <span className="sidebar-nav-left">
              <Sliders size={17} /> Conteúdos & Textos
            </span>
          </button>

          <span className="sidebar-section-label">Compliance & Atendimento</span>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'lgpd' ? 'active' : ''}`}
            onClick={() => handleSelectTab('lgpd')}
          >
            <span className="sidebar-nav-left">
              <ShieldAlert size={17} /> Central LGPD
            </span>
            <span className={`sidebar-count-badge ${openLgpdCount > 0 ? 'alert' : ''}`}>
              {openLgpdCount > 0 ? `${openLgpdCount} aberta(s)` : lgpdRequests.length}
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'denuncias' ? 'active' : ''}`}
            onClick={() => handleSelectTab('denuncias')}
          >
            <span className="sidebar-nav-left">
              <AlertTriangle size={17} /> Canal de Denúncias
            </span>
            <span className={`sidebar-count-badge ${newDenunciasCount > 0 ? 'alert' : ''}`}>
              {newDenunciasCount > 0 ? `${newDenunciasCount} nova(s)` : whistleblowers.length}
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => handleSelectTab('quizzes')}
          >
            <span className="sidebar-nav-left">
              <ClipboardCheck size={17} /> Conformidade Quiz
            </span>
            <span className="sidebar-count-badge">{quizSubmissions.length}</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleSelectTab('messages')}
          >
            <span className="sidebar-nav-left">
              <MessageSquare size={17} /> Mensagens
            </span>
            <span className={`sidebar-count-badge ${pendingMsgCount > 0 ? 'alert' : ''}`}>
              {pendingMsgCount > 0 ? `${pendingMsgCount} pendente(s)` : messages.length}
            </span>
          </button>

          <span className="sidebar-section-label">Governança & Sistema</span>

          <button
            type="button"
            className={`sidebar-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => handleSelectTab('audit')}
          >
            <span className="sidebar-nav-left">
              <Clock size={17} /> Auditoria & Segurança
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Encerrar Sessão
          </button>
          <div className="sidebar-apex-credit">
            Desenvolvido por{' '}
            <a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer">
              ApexCode
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="content-header no-print">
          <div>
            <h2>{headerInfo.title}</h2>
            <p className="content-header-sub">{headerInfo.subtitle}</p>
          </div>

          <div className="content-header-actions">
            <button
              type="button"
              onClick={() => loadAllData(currentUser?.id, true)}
              className="btn-refresh"
              disabled={syncing}
              title="Atualizar dados do painel"
            >
              <RefreshCw size={15} className={syncing ? 'spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-admin"
            >
              Visualizar Site <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {partialNotice && (
          <div className="partial-warning-banner no-print">
            <AlertCircle size={16} />
            <span>{partialNotice}</span>
          </div>
        )}

        {loading ? (
          <div className="content-body">
            <div className="admin-loading-card">
              <RefreshCw className="spin" size={26} />
              <p>Carregando dados do painel...</p>
            </div>
          </div>
        ) : (
          <div className="content-body">
            {activeTab === 'overview' && (
              <OverviewTab
                posts={posts}
                lgpdRequests={lgpdRequests}
                whistleblowers={whistleblowers}
                messages={messages}
                quizSubmissions={quizSubmissions}
                consentRecords={consentRecords}
                mfaEnabled={mfaEnabled}
                onNavigate={handleSelectTab}
                onNewPost={handleQuickNewPost}
              />
            )}

            {activeTab === 'posts' && (
              <PostsTab
                posts={posts}
                categories={categories}
                openNewTrigger={newPostTrigger}
                onShowToast={showToast}
                onRefresh={() => loadAllData(currentUser?.id, true)}
                onAudit={logAdminAction}
              />
            )}

            {activeTab === 'pages' && (
              <PagesAndAreasTab
                pages={pages}
                practiceAreas={practiceAreas}
                onShowToast={showToast}
                onRefresh={() => loadAllData(currentUser?.id, true)}
                onAudit={logAdminAction}
              />
            )}

            {activeTab === 'content' && (
              <SiteContentTab
                siteSettings={siteSettings}
                onChange={setSiteSettings}
                currentUserId={currentUser?.id}
                onShowToast={showToast}
                onAudit={logAdminAction}
              />
            )}

            {activeTab === 'lgpd' && (
              <LgpdRequestsTab
                requests={lgpdRequests}
                currentUserId={currentUser?.id}
                onShowToast={showToast}
                onRefresh={() => loadAllData(currentUser?.id, true)}
                onAudit={logAdminAction}
              />
            )}

            {activeTab === 'denuncias' && (
              <WhistleblowerTab
                reports={whistleblowers}
                onShowToast={showToast}
                onRefresh={() => loadAllData(currentUser?.id, true)}
                onAudit={logAdminAction}
              />
            )}

            {activeTab === 'quizzes' && <QuizzesTab submissions={quizSubmissions} />}

            {activeTab === 'messages' && (
              <MessagesTab
                messages={messages}
                onShowToast={showToast}
                onRefresh={() => loadAllData(currentUser?.id, true)}
                onAudit={logAdminAction}
              />
            )}

            {activeTab === 'audit' && (
              <AuditAndSecurityTab
                auditLogs={auditLogs}
                consentRecords={consentRecords}
                profile={profile}
                userEmail={currentUser?.email || ''}
                onShowToast={showToast}
                onRefresh={() => loadAllData(currentUser?.id, true)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
