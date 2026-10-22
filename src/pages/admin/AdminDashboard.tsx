import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  MessageSquare,
  ShieldAlert,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'pages' | 'messages' | 'lgpd' | 'audit'>('posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [lgpdRequests, setLgpdRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuthAndLoad() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redireciona para o login se não autenticado
        navigate('/admin');
        return;
      }
      setCurrentUser(user);

      // Carregar dados gerais
      try {
        const [postsRes, pagesRes, msgRes, lgpdRes, auditRes] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }),
          supabase.from('pages').select('*').order('title'),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
          supabase.from('data_subject_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50)
        ]);

        if (postsRes.data) setPosts(postsRes.data);
        if (pagesRes.data) setPages(pagesRes.data);
        if (msgRes.data) setMessages(msgRes.data);
        if (lgpdRes.data) setLgpdRequests(lgpdRes.data);
        if (auditRes.data) setAuditLogs(auditRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados do painel:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoad();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  return (
    <div className="admin-dashboard-layout">
      <SEO title="Painel de Controle | Mascârello Haus Advocacia" />

      {/* Sidebar do Painel */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logo2025branca.png" alt="Logo" className="admin-sidebar-logo" />
          <span className="user-email-badge">{currentUser?.email || 'admin@mascarellohaus.adv.br'}</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <FileText size={18} /> Artigos & Publicações ({posts.length})
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            <Edit size={18} /> Páginas do Site ({pages.length})
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'lgpd' ? 'active' : ''}`}
            onClick={() => setActiveTab('lgpd')}
          >
            <ShieldAlert size={18} /> Central LGPD Titulares ({lgpdRequests.length})
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} /> Mensagens de Contato ({messages.length})
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <Clock size={18} /> Trilha de Auditoria
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="admin-main-content">
        <header className="content-header">
          <h2>
            {activeTab === 'posts' && 'Gestão de Artigos e Publicações'}
            {activeTab === 'pages' && 'Gestão de Conteúdo das Páginas'}
            {activeTab === 'lgpd' && 'Fila de Requisições do Titular (Art. 18 LGPD)'}
            {activeTab === 'messages' && 'Caixa de Entrada de Mensagens'}
            {activeTab === 'audit' && 'Logs de Auditoria Imutáveis'}
          </h2>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)', fontSize: '0.85rem', padding: '8px 14px' }}>
            Visualizar Site <ExternalLink size={14} />
          </a>
        </header>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>Carregando registros...</div>
        ) : (
          <div className="content-body">
            {/* TAB: POSTS */}
            {activeTab === 'posts' && (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Slug</th>
                      <th>Status</th>
                      <th>Data de Publicação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td><strong>{post.title}</strong></td>
                        <td><code>/{post.slug}/</code></td>
                        <td>
                          <span className={`status-pill ${post.status === 'published' ? 'published' : 'draft'}`}>
                            {post.status}
                          </span>
                        </td>
                        <td>{new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={`/${post.slug}/`} target="_blank" rel="noreferrer" className="table-action-btn">
                              <ExternalLink size={15} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: PÁGINAS */}
            {activeTab === 'pages' && (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Título da Página</th>
                      <th>Slug</th>
                      <th>Título SEO</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.title}</strong></td>
                        <td><code>/{p.slug}/</code></td>
                        <td>{p.seo_title || p.title}</td>
                        <td>
                          <span className="status-pill published">Ativa</span>
                        </td>
                        <td>
                          <a href={p.slug === 'mascarello-haus' ? '/' : `/${p.slug}/`} target="_blank" rel="noreferrer" className="table-action-btn">
                            <ExternalLink size={15} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: LGPD */}
            {activeTab === 'lgpd' && (
              <div className="table-responsive">
                {lgpdRequests.length === 0 ? (
                  <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                    Nenhuma requisição de titular registrada até o momento.
                  </p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Protocolo</th>
                        <th>Solicitante</th>
                        <th>Tipo de Pedido</th>
                        <th>Contato</th>
                        <th>Prazo Legal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lgpdRequests.map((req) => (
                        <tr key={req.id}>
                          <td><code>{req.protocol}</code></td>
                          <td><strong>{req.requester_name}</strong></td>
                          <td>{req.request_type}</td>
                          <td>{req.contact_info} ({req.contact_channel})</td>
                          <td>{new Date(req.legal_deadline).toLocaleDateString('pt-BR')}</td>
                          <td>
                            <span className="status-pill draft">{req.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
              <div className="table-responsive">
                {messages.length === 0 ? (
                  <p style={{ padding: '30px', textAlign: 'center', color: '#718096' }}>
                    Nenhuma mensagem recebida ainda.
                  </p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Telefone</th>
                        <th>Mensagem</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m) => (
                        <tr key={m.id}>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.email}</td>
                          <td>{m.phone}</td>
                          <td style={{ maxWidth: '350px' }}>{m.message || '-'}</td>
                          <td>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB: AUDIT */}
            {activeTab === 'audit' && (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ação</th>
                      <th>Tabela / Módulo</th>
                      <th>Registro</th>
                      <th>Data / Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td><strong>{log.action}</strong></td>
                        <td><code>{log.table_name}</code></td>
                        <td>{log.record_id}</td>
                        <td>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .admin-dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f1f5f9;
        }
        .admin-sidebar {
          width: 280px;
          background: var(--color-primary-dark);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .sidebar-brand {
          padding: 25px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .admin-sidebar-logo {
          height: 38px;
          margin-bottom: 10px;
        }
        .user-email-badge {
          display: block;
          font-size: 0.75rem;
          color: #a0aec0;
          word-break: break-all;
        }
        .sidebar-nav {
          padding: 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-grow: 1;
        }
        .sidebar-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #cbd5e0;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }
        .sidebar-nav-btn:hover, .sidebar-nav-btn.active {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .sidebar-nav-btn.active {
          background: var(--color-accent);
          color: #ffffff;
        }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #e53e3e;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          cursor: pointer;
        }
        .admin-main-content {
          flex-grow: 1;
          padding: 30px 40px;
          overflow-y: auto;
        }
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .content-body {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          text-align: left;
        }
        .admin-table th {
          background: #f8fafc;
          padding: 14px 18px;
          font-weight: 600;
          color: var(--color-primary);
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-table td {
          padding: 14px 18px;
          border-bottom: 1px solid #edf2f7;
          color: #2d3748;
        }
        .status-pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.published {
          background: #c6f6d5;
          color: #22543d;
        }
        .status-pill.draft {
          background: #feebc8;
          color: #744210;
        }
        .table-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: #edf2f7;
          color: var(--color-primary);
        }
        .table-action-btn:hover {
          background: var(--color-accent);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};
