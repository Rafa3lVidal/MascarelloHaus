import React, { useEffect, useState, useRef } from 'react';
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
  ExternalLink,
  X,
  Save,
  AlertCircle,
  Eye,
  Globe,
  Sliders,
  Check,
  RefreshCw,
  Upload,
  FileUp,
  Image as ImageIcon
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'pages' | 'content' | 'lgpd' | 'messages' | 'denuncias' | 'quizzes' | 'audit'>('posts');
  const [whistleblowers, setWhistleblowers] = useState<any[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [lgpdRequests, setLgpdRequests] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados de Edição de Post
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    category_id: 1,
    status: 'published',
    excerpt: '',
    extra_text: '',
    featured_image_url: '',
    pdf_url: '',
    seo_title: '',
    seo_description: '',
    published_at: ''
  });

  // Estados de Edição de Página
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    seo_title: '',
    seo_description: '',
    content_html: '',
    is_published: true
  });

  // Estados de Conteúdos do Site (site_settings)
  const [siteSettings, setSiteSettings] = useState<any>({
    site_name: 'Mascârello Haus Advocacia',
    tagline: 'Soluções Jurídicas Estratégicas',
    whatsapp: '+5549999281878',
    contact_email: 'contato@mascarellohaus.adv.br',
    dpo_email: 'privacidade@mascarellohaus.adv.br',
    address: 'Videira / Caçador — Santa Catarina',
    instagram_url: 'https://www.instagram.com/mascarellohaus.adv/',
    linkedin_url: 'https://www.linkedin.com/company/mascarello-haus-advocacia/',
    banner_title: 'Direito Empresarial, Civil, Trabalho e Previdenciário',
    banner_subtitle: 'Assessoria jurídica especializada para empresas e pessoas físicas com foco em conformidade, segurança da informação e governança corporativa.',
    assessoria_title: 'Como funciona a assessoria empresarial?',
    assessoria_subtitle: 'Apoiamos sua empresa em cada etapa com segurança jurídica preventiva, estratégica e contenciosa.'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const navigate = useNavigate();

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [postsRes, pagesRes, msgRes, lgpdRes, auditRes, settingsRes] = await Promise.all([
        supabase.from('posts').select('*').order('published_at', { ascending: false }),
        supabase.from('pages').select('*').order('title'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('data_subject_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('site_settings').select('*')
      ]);

      if (postsRes.data) setPosts(postsRes.data);
      if (pagesRes.data) setPages(pagesRes.data);
      if (msgRes.data) setMessages(msgRes.data);
      if (lgpdRes.data) setLgpdRequests(lgpdRes.data);
      if (auditRes.data) setAuditLogs(auditRes.data);

      if (settingsRes.data) {
        const general = settingsRes.data.find((s) => s.key === 'general')?.value_json || {};
        const home = settingsRes.data.find((s) => s.key === 'home_content')?.value_json || {};
        setSiteSettings((prev: any) => ({ ...prev, ...general, ...home }));
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados do painel:', err);
      showToast('error', 'Erro ao sincronizar registros com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin');
        return;
      }
      setCurrentUser(user);
      await loadAllData();
    }

    checkAuthAndLoad();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  // Funções de Gerenciamento de Post
  const handleOpenNewPost = () => {
    setIsNewPost(true);
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      category_id: 1,
      status: 'published',
      excerpt: '',
      extra_text: '',
      featured_image_url: '/wp-content/uploads/2023/09/incidentes.png',
      pdf_url: '',
      seo_title: '',
      seo_description: '',
      published_at: new Date().toISOString()
    });
  };

  const handleOpenEditPost = (post: any) => {
    setIsNewPost(false);
    setEditingPost(post);
    setPostForm({
      title: post.title || '',
      slug: post.slug || '',
      category_id: post.category_id || 1,
      status: post.status || 'published',
      excerpt: post.excerpt || '',
      extra_text: post.extra_text || '',
      featured_image_url: post.featured_image_url || '',
      pdf_url: post.pdf_url || '',
      seo_title: post.seo_title || post.title || '',
      seo_description: post.seo_description || post.excerpt || '',
      published_at: post.published_at || new Date().toISOString()
    });
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'A imagem deve ter no máximo 10MB.');
      return;
    }
    setIsUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w-]/g, '-');
      const filePath = `posts/${Date.now()}-${cleanName}.${ext}`;
      const { data, error } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(data.path);
      setPostForm((prev) => ({ ...prev, featured_image_url: publicUrlData.publicUrl }));
      showToast('success', 'Imagem enviada com sucesso!');
    } catch (err: any) {
      console.error('Erro no upload da imagem:', err);
      showToast('error', err.message || 'Falha ao enviar imagem.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('error', 'Por favor, selecione um arquivo PDF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('error', 'O arquivo PDF deve ter no máximo 20MB.');
      return;
    }
    setIsUploadingPdf(true);
    try {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w-]/g, '-');
      const filePath = `docs/${Date.now()}-${cleanName}.pdf`;
      const { data, error } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(data.path);
      setPostForm((prev) => ({ ...prev, pdf_url: publicUrlData.publicUrl }));
      showToast('success', 'Arquivo PDF enviado com sucesso!');
    } catch (err: any) {
      console.error('Erro no upload do PDF:', err);
      showToast('error', err.message || 'Falha ao enviar PDF.');
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.slug) {
      showToast('error', 'Título e Slug são obrigatórios.');
      return;
    }

    try {
      const generatedHtml = postForm.extra_text
        ? `<div class="post-content-entry"><p>${postForm.extra_text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p></div>`
        : (editingPost?.content_html || '<p></p>');

      const payload: any = {
        title: postForm.title,
        slug: postForm.slug,
        category_id: Number(postForm.category_id),
        status: postForm.status,
        excerpt: postForm.excerpt || '',
        extra_text: postForm.extra_text || '',
        content_html: generatedHtml,
        featured_image_url: postForm.featured_image_url || '',
        pdf_url: postForm.pdf_url || '',
        seo_title: postForm.seo_title || postForm.title,
        seo_description: postForm.seo_description || postForm.excerpt,
        published_at: postForm.published_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isNewPost) {
        const { data, error } = await supabase.from('posts').insert(payload).select();
        if (error) throw error;
        showToast('success', 'Nova publicação criada com sucesso!');
      } else {
        const { data, error } = await supabase.from('posts').update(payload).eq('id', editingPost.id).select();
        if (error) throw error;
        showToast('success', 'Publicação atualizada com sucesso!');
      }

      setEditingPost(null);
      setIsNewPost(false);
      await loadAllData();
    } catch (err: any) {
      console.error('Erro ao salvar publicação:', err);
      showToast('error', err.message || 'Erro ao gravar publicação.');
    }
  };

  const handleDeletePost = async (id: number, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a publicação "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Publicação removida com sucesso!');
      await loadAllData();
    } catch (err: any) {
      console.error('Erro ao excluir publicação:', err);
      showToast('error', err.message || 'Erro ao excluir.');
    }
  };

  // Funções de Gerenciamento de Página
  const handleOpenEditPage = (page: any) => {
    setEditingPage(page);
    setPageForm({
      title: page.title || '',
      slug: page.slug || '',
      seo_title: page.seo_title || page.title || '',
      seo_description: page.seo_description || '',
      content_html: page.content_html || '',
      is_published: page.is_published ?? true
    });
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title) {
      showToast('error', 'O título da página é obrigatório.');
      return;
    }

    try {
      const { error } = await supabase.from('pages').update({
        title: pageForm.title,
        seo_title: pageForm.seo_title,
        seo_description: pageForm.seo_description,
        content_html: pageForm.content_html,
        is_published: pageForm.is_published,
        updated_at: new Date().toISOString()
      }).eq('id', editingPage.id);

      if (error) throw error;
      showToast('success', 'Conteúdo da página atualizado com sucesso!');
      setEditingPage(null);
      await loadAllData();
    } catch (err: any) {
      console.error('Erro ao atualizar página:', err);
      showToast('error', err.message || 'Erro ao gravar alterações da página.');
    }
  };

  // Funções de Conteúdos do Site
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const generalData = {
        site_name: siteSettings.site_name,
        tagline: siteSettings.tagline,
        whatsapp: siteSettings.whatsapp,
        contact_email: siteSettings.contact_email,
        dpo_email: siteSettings.dpo_email,
        address: siteSettings.address,
        instagram_url: siteSettings.instagram_url,
        linkedin_url: siteSettings.linkedin_url
      };

      const homeData = {
        banner_title: siteSettings.banner_title,
        banner_subtitle: siteSettings.banner_subtitle,
        assessoria_title: siteSettings.assessoria_title,
        assessoria_subtitle: siteSettings.assessoria_subtitle
      };

      const [resGen, resHome] = await Promise.all([
        supabase.from('site_settings').upsert({
          key: 'general',
          value_json: generalData,
          updated_at: new Date().toISOString()
        }),
        supabase.from('site_settings').upsert({
          key: 'home_content',
          value_json: homeData,
          updated_at: new Date().toISOString()
        })
      ]);

      if (resGen.error) throw resGen.error;
      if (resHome.error) throw resHome.error;

      showToast('success', 'Conteúdos do site salvos com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar conteúdos:', err);
      showToast('error', err.message || 'Erro ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtro de Posts
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-layout">
      <SEO title="Painel de Controle | Mascârello Haus Advocacia" />

      {/* Toast Feedback */}
      {feedback && (
        <div className={`admin-toast ${feedback.type}`}>
          {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Sidebar do Painel */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logo2025branca.png" alt="Logo Mascarello Haus" className="admin-sidebar-logo" />
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
            className={`sidebar-nav-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Sliders size={18} /> Conteúdos & Textos
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
          <div>
            <h2>
              {activeTab === 'posts' && 'Gestão de Artigos, Cartilhas e E-books'}
              {activeTab === 'pages' && 'Gestão de Páginas Institucionais e Áreas'}
              {activeTab === 'content' && 'Personalização de Conteúdos e Textos do Site'}
              {activeTab === 'lgpd' && 'Fila de Requisições do Titular (Art. 18 LGPD)'}
              {activeTab === 'messages' && 'Caixa de Entrada de Mensagens'}
              {activeTab === 'denuncias' && 'Relatos do Canal de Denúncias'}
              {activeTab === 'quizzes' && 'Avaliações de Conformidade de Fornecedores'}
              {activeTab === 'audit' && 'Logs de Auditoria Imutáveis'}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '0.9rem' }}>
              Alterações salvas têm reflexo imediato no site oficial da Mascârello Haus.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={loadAllData} className="btn-refresh" title="Atualizar dados">
              <RefreshCw size={15} /> Sincronizar
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                color: 'var(--color-primary)',
                borderColor: '#cbd5e0',
                fontSize: '0.85rem',
                padding: '8px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Visualizar Site <ExternalLink size={14} />
            </a>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading-card">
            <RefreshCw className="spin" size={24} />
            <p>Carregando registros do banco de dados...</p>
          </div>
        ) : (
          <div className="content-body">
            {/* TAB: POSTS */}
            {activeTab === 'posts' && (
              <div>
                <div className="toolbar-bar">
                  <div className="search-box">
                    <Search size={16} color="#a0aec0" />
                    <input
                      type="text"
                      placeholder="Pesquisar por título ou slug..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <button className="btn-create-post" onClick={handleOpenNewPost}>
                    <Plus size={16} /> Nova Publicação
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Capa</th>
                        <th>Título</th>
                        <th>Slug</th>
                        <th>Status</th>
                        <th>Data</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                            Nenhuma publicação encontrada para o filtro.
                          </td>
                        </tr>
                      ) : (
                        filteredPosts.map((post) => (
                          <tr key={post.id}>
                            <td style={{ width: '60px' }}>
                              <img
                                src={post.featured_image_url || '/wp-content/uploads/2023/09/incidentes.png'}
                                alt="Capa"
                                className="table-post-thumb"
                                onError={(e: any) => {
                                  e.target.src = '/wp-content/uploads/2023/09/incidentes.png';
                                }}
                              />
                            </td>
                            <td>
                              <strong>{post.title}</strong>
                              {post.excerpt && (
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#718096', maxWidth: '380px' }}>
                                  {post.excerpt.length > 80 ? post.excerpt.slice(0, 80) + '...' : post.excerpt}
                                </p>
                              )}
                            </td>
                            <td>
                              <code>/{post.slug}/</code>
                            </td>
                            <td>
                              <span className={`status-pill ${post.status === 'published' ? 'published' : 'draft'}`}>
                                {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                              </span>
                            </td>
                            <td>{new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR')}</td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="table-action-btn edit"
                                  onClick={() => handleOpenEditPost(post)}
                                  title="Editar Publicação"
                                >
                                  <Edit size={15} />
                                </button>
                                <a
                                  href={`/${post.slug}/`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="table-action-btn view"
                                  title="Ver no Site"
                                >
                                  <ExternalLink size={15} />
                                </a>
                                <button
                                  className="table-action-btn delete"
                                  onClick={() => handleDeletePost(post.id, post.title)}
                                  title="Excluir Publicação"
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
              </div>
            )}

            {/* TAB: PÁGINAS */}
            {activeTab === 'pages' && (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Título da Página</th>
                      <th>Slug da Rota</th>
                      <th>Título SEO</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                        </td>
                        <td>
                          <code>/{p.slug === 'mascarello-haus' ? '' : p.slug}/</code>
                        </td>
                        <td>{p.seo_title || p.title}</td>
                        <td>
                          <span className={`status-pill ${p.is_published ? 'published' : 'draft'}`}>
                            {p.is_published ? 'Ativa' : 'Rascunho'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button
                              className="table-action-btn edit"
                              onClick={() => handleOpenEditPage(p)}
                              title="Editar Conteúdo da Página"
                            >
                              <Edit size={15} />
                            </button>
                            <a
                              href={p.slug === 'mascarello-haus' ? '/' : `/${p.slug}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="table-action-btn view"
                              title="Ver Página"
                            >
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

            {/* TAB: CONTEÚDOS & TEXTOS DO SITE */}
            {activeTab === 'content' && (
              <div className="settings-form-container">
                <form onSubmit={handleSaveSiteSettings}>
                  <div className="settings-section">
                    <h3 className="settings-section-title">
                      <Globe size={18} /> Textos em Destaque da Página Inicial (Home)
                    </h3>
                    <p className="settings-section-desc">
                      Altere as mensagens principais exibidas para visitantes e clientes na Home do escritório.
                    </p>

                    <div className="form-group">
                      <label>Frase de Destaque / Título Principal do Banner</label>
                      <input
                        type="text"
                        className="form-control"
                        value={siteSettings.banner_title || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, banner_title: e.target.value })}
                        placeholder="Ex: Direito Empresarial, Civil, Trabalho e Previdenciário"
                      />
                    </div>

                    <div className="form-group">
                      <label>Subtítulo / Descrição do Banner</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={siteSettings.banner_subtitle || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, banner_subtitle: e.target.value })}
                        placeholder="Descrição explicativa abaixo do título do banner"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group col-6">
                        <label>Título da Seção de Assessoria Empresarial</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.assessoria_title || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, assessoria_title: e.target.value })}
                        />
                      </div>
                      <div className="form-group col-6">
                        <label>Subtítulo da Seção de Assessoria</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.assessoria_subtitle || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, assessoria_subtitle: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3 className="settings-section-title">
                      <MessageSquare size={18} /> Informações de Contato & Rodapé
                    </h3>

                    <div className="form-row">
                      <div className="form-group col-6">
                        <label>WhatsApp Oficial de Atendimento</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.whatsapp || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="form-group col-6">
                        <label>E-mail de Contato Geral</label>
                        <input
                          type="email"
                          className="form-control"
                          value={siteSettings.contact_email || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-6">
                        <label>E-mail do DPO / Privacidade (LGPD)</label>
                        <input
                          type="email"
                          className="form-control"
                          value={siteSettings.dpo_email || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, dpo_email: e.target.value })}
                        />
                      </div>
                      <div className="form-group col-6">
                        <label>Endereço Físico / Comarcas de Atuação</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.address || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-6">
                        <label>Instagram Oficial (URL Completa)</label>
                        <input
                          type="url"
                          className="form-control"
                          value={siteSettings.instagram_url || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram_url: e.target.value })}
                        />
                      </div>
                      <div className="form-group col-6">
                        <label>LinkedIn Oficial (URL Completa)</label>
                        <input
                          type="url"
                          className="form-control"
                          value={siteSettings.linkedin_url || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, linkedin_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-bar">
                    <button type="submit" className="btn-save-main" disabled={savingSettings}>
                      <Save size={16} /> {savingSettings ? 'Gravando...' : 'Salvar Conteúdos do Site'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: LGPD */}
            {activeTab === 'lgpd' && (
              <div className="table-responsive">
                {lgpdRequests.length === 0 ? (
                  <p style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
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
                          <td>
                            <code>{req.protocol}</code>
                          </td>
                          <td>
                            <strong>{req.requester_name}</strong>
                          </td>
                          <td>{req.request_type}</td>
                          <td>
                            {req.contact_info} ({req.contact_channel})
                          </td>
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
                  <p style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                    Nenhuma mensagem recebida ainda pelo formulário de contato.
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
                          <td>
                            <strong>{m.name}</strong>
                          </td>
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

            {/* TAB: DENUNCIAS */}
            {activeTab === 'denuncias' && (
              <div className="table-responsive">
                {whistleblowers.length === 0 ? (
                  <p style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                    Nenhum relato no Canal de Denúncias registrado até o momento.
                  </p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Protocolo</th>
                        <th>Denunciante</th>
                        <th>Pessoas Envolvidas</th>
                        <th>Fatos Relatados</th>
                        <th>Descrição</th>
                        <th>Anexos</th>
                        <th>Data / Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whistleblowers.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <code>{d.protocol}</code>
                          </td>
                          <td>
                            {d.is_anonymous ? (
                              <span className="status-pill draft" style={{ color: '#b45309', background: '#fef3c7' }}>ANÔNIMO</span>
                            ) : (
                              <strong>{d.reporter_name}</strong>
                            )}
                          </td>
                          <td><strong>{d.involved_persons}</strong></td>
                          <td style={{ maxWidth: '240px' }}>
                            {Array.isArray(d.concern_types) ? d.concern_types.join('; ') : '-'}
                          </td>
                          <td style={{ maxWidth: '300px', fontSize: '13px' }}>{d.description}</td>
                          <td>
                            {d.attachments_json && d.attachments_json.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {d.attachments_json.map((att: any, aIdx: number) => (
                                  <a
                                    key={aIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'underline' }}
                                  >
                                    📎 {att.name || 'Evidência'}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                            )}
                          </td>
                          <td>{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB: QUIZZES */}
            {activeTab === 'quizzes' && (
              <div className="table-responsive">
                {quizSubmissions.length === 0 ? (
                  <p style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                    Nenhum questionário de conformidade enviado por fornecedores ainda.
                  </p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Protocolo</th>
                        <th>Empresa / CNPJ</th>
                        <th>Responsável / E-mail</th>
                        <th>Índice LGPD</th>
                        <th>Evidências / Documentos</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizSubmissions.map((q) => (
                        <tr key={q.id}>
                          <td>
                            <code>{q.protocol || '-'}</code>
                          </td>
                          <td>
                            <strong>{q.company_name}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{q.cnpj}</div>
                          </td>
                          <td>
                            <div>{q.contact_name}</div>
                            <small style={{ color: '#64748b' }}>{q.contact_email}</small>
                          </td>
                          <td>
                            <span
                              className="status-pill published"
                              style={{
                                background: q.final_score >= 80 ? '#dcfce7' : q.final_score >= 50 ? '#fef9c3' : '#fee2e2',
                                color: q.final_score >= 80 ? '#15803d' : q.final_score >= 50 ? '#854d0e' : '#b91c1c',
                                fontWeight: 700
                              }}
                            >
                              {q.final_score !== null ? `${q.final_score}%` : '-'}
                            </span>
                          </td>
                          <td>
                            {q.attachments_json && q.attachments_json.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {q.attachments_json.map((att: any, aIdx: number) => (
                                  <a
                                    key={aIdx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'underline' }}
                                  >
                                    📎 {att.name || 'Evidência'}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                            )}
                          </td>
                          <td>{new Date(q.created_at).toLocaleDateString('pt-BR')}</td>
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
                        <td>
                          <strong>{log.action}</strong>
                        </td>
                        <td>
                          <code>{log.table_name}</code>
                        </td>
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

      {/* MODAL: EDITAR / CRIAR POST */}
      {(editingPost || isNewPost) && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{isNewPost ? 'Criar Nova Publicação / Artigo' : 'Editar Publicação'}</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setEditingPost(null);
                  setIsNewPost(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="admin-modal-form">
              <div className="form-group">
                <label>Título da Publicação *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={postForm.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setPostForm({
                      ...postForm,
                      title: newTitle,
                      slug: isNewPost ? generateSlugFromTitle(newTitle) : postForm.slug
                    });
                  }}
                  placeholder="Ex: Cartilha sobre Aspectos da LGPD"
                />
              </div>

              <div className="form-row">
                <div className="form-group col-6">
                  <label>Slug / Rota URL *</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      placeholder="cartilha-aspectos-lgpd"
                    />
                    <button
                      type="button"
                      className="btn-slug-gen"
                      onClick={() => setPostForm({ ...postForm, slug: generateSlugFromTitle(postForm.title) })}
                      title="Gerar slug a partir do título"
                    >
                      Gerar
                    </button>
                  </div>
                </div>

                <div className="form-group col-3">
                  <label>Categoria</label>
                  <select
                    className="form-control"
                    value={postForm.category_id}
                    onChange={(e) => setPostForm({ ...postForm, category_id: Number(e.target.value) })}
                  >
                    <option value={1}>Cartilhas</option>
                    <option value={2}>Artigos</option>
                    <option value={3}>E-books</option>
                    <option value={4}>Publicações</option>
                  </select>
                </div>

                <div className="form-group col-3">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={postForm.status}
                    onChange={(e) => setPostForm({ ...postForm, status: e.target.value })}
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-6">
                  <label>Imagem de Capa (Upload ou URL)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={postForm.featured_image_url}
                      onChange={(e) => setPostForm({ ...postForm, featured_image_url: e.target.value })}
                      placeholder="/wp-content/... ou clique em Upload"
                    />
                    <input
                      type="file"
                      ref={imageInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="btn-upload-action"
                      disabled={isUploadingImage}
                      onClick={() => imageInputRef.current?.click()}
                      title="Fazer upload de imagem do seu computador"
                    >
                      <Upload size={14} />
                      {isUploadingImage ? 'Enviando...' : 'Upload'}
                    </button>
                  </div>
                  {postForm.featured_image_url && (
                    <div className="image-preview-box">
                      <img
                        src={postForm.featured_image_url}
                        alt="Prévia"
                        onError={(e: any) => (e.target.style.display = 'none')}
                      />
                      <span>Prévia da imagem selecionada</span>
                    </div>
                  )}
                </div>

                <div className="form-group col-6">
                  <label>Link do PDF para Download (Opcional)</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={postForm.pdf_url}
                      onChange={(e) => setPostForm({ ...postForm, pdf_url: e.target.value })}
                      placeholder="/wp-content/... ou faça upload de PDF"
                    />
                    <input
                      type="file"
                      ref={pdfInputRef}
                      style={{ display: 'none' }}
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                    />
                    <button
                      type="button"
                      className="btn-upload-action"
                      disabled={isUploadingPdf}
                      onClick={() => pdfInputRef.current?.click()}
                      title="Fazer upload de arquivo PDF"
                    >
                      <FileUp size={14} />
                      {isUploadingPdf ? 'Enviando...' : 'Upload PDF'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Resumo / Descrição Curta (Exibido nos cards e redes sociais)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                  placeholder="Breve descrição informativa do material..."
                />
              </div>

              <div className="form-group">
                <label>Conteúdo Completo ou Informações Adicionais</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={postForm.extra_text}
                  onChange={(e) => setPostForm({ ...postForm, extra_text: e.target.value })}
                  placeholder="Escreva aqui o artigo completo, tópicos ou orientações adicionais..."
                />
              </div>

              <div className="form-row">
                <div className="form-group col-6">
                  <label>Título SEO (Meta Title)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={postForm.seo_title}
                    onChange={(e) => setPostForm({ ...postForm, seo_title: e.target.value })}
                    placeholder="Título para o Google"
                  />
                </div>
                <div className="form-group col-6">
                  <label>Descrição SEO (Meta Description)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={postForm.seo_description}
                    onChange={(e) => setPostForm({ ...postForm, seo_description: e.target.value })}
                    placeholder="Descrição para buscadores"
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setEditingPost(null);
                    setIsNewPost(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main">
                  <Save size={16} /> Salvar Publicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PÁGINA */}
      {editingPage && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Editar Conteúdo da Página: {editingPage.title}</h3>
              <button className="modal-close-btn" onClick={() => setEditingPage(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="admin-modal-form">
              <div className="form-group">
                <label>Título da Página *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group col-6">
                  <label>Título SEO (Google / Buscadores)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pageForm.seo_title}
                    onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
                  />
                </div>
                <div className="form-group col-6">
                  <label>Status de Publicação</label>
                  <select
                    className="form-control"
                    value={pageForm.is_published ? 'true' : 'false'}
                    onChange={(e) => setPageForm({ ...pageForm, is_published: e.target.value === 'true' })}
                  >
                    <option value="true">Ativa e Visível no Site</option>
                    <option value="false">Oculta / Rascunho</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Meta Descrição SEO</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={pageForm.seo_description}
                  onChange={(e) => setPageForm({ ...pageForm, seo_description: e.target.value })}
                  placeholder="Descrição que aparece nos resultados de busca do Google..."
                />
              </div>

              <div className="form-group">
                <label>Conteúdo HTML / Textos da Página</label>
                <textarea
                  className="form-control"
                  rows={8}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={pageForm.content_html}
                  onChange={(e) => setPageForm({ ...pageForm, content_html: e.target.value })}
                  placeholder="Conteúdo estruturado ou HTML da página..."
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingPage(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main">
                  <Save size={16} /> Salvar Alterações da Página
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos CSS do Painel */}
      <style>{`
        .admin-dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }
        .admin-sidebar {
          width: 290px;
          background: var(--color-primary-dark);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
        }
        .sidebar-brand {
          padding: 25px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .admin-sidebar-logo {
          height: 38px;
          margin-bottom: 8px;
        }
        .user-email-badge {
          display: block;
          font-size: 0.75rem;
          color: #a0aec0;
          word-break: break-all;
        }
        .sidebar-nav {
          padding: 20px 12px;
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
          font-size: 0.88rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }
        .sidebar-nav-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .sidebar-nav-btn.active {
          background: var(--color-accent);
          color: #ffffff;
          font-weight: 600;
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
          color: #fc8181;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          cursor: pointer;
          padding: 8px;
        }
        .logout-btn:hover {
          color: #feb2b2;
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
          margin-bottom: 25px;
        }
        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-refresh:hover {
          background: #edf2f7;
          color: #2d3748;
        }
        .content-body {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #edf2f7;
        }
        .toolbar-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #edf2f7;
          background: #fafbfc;
          gap: 15px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 8px 14px;
          border-radius: 6px;
          width: 340px;
        }
        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.88rem;
          color: #2d3748;
        }
        .btn-create-post {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-accent);
          color: #ffffff;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-create-post:hover {
          background: #b5956a;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        .admin-table th {
          background: #f8fafc;
          padding: 14px 20px;
          font-weight: 600;
          color: var(--color-primary);
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-table td {
          padding: 14px 20px;
          border-bottom: 1px solid #edf2f7;
          color: #2d3748;
          vertical-align: middle;
        }
        .table-post-thumb {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          background: #edf2f7;
          border: 1px solid #e2e8f0;
        }
        .status-pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-pill.published {
          background: #def7ec;
          color: #03543f;
        }
        .status-pill.draft {
          background: #feecdc;
          color: #9f580a;
        }
        .action-buttons-cell {
          display: flex;
          gap: 8px;
        }
        .table-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          background: #edf2f7;
          color: var(--color-primary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .table-action-btn.edit:hover {
          background: #3182ce;
          color: #ffffff;
        }
        .table-action-btn.view:hover {
          background: var(--color-accent);
          color: #ffffff;
        }
        .table-action-btn.delete:hover {
          background: #e53e3e;
          color: #ffffff;
        }
        .admin-toast {
          position: fixed;
          top: 25px;
          right: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 500;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          animation: slideIn 0.3s ease;
        }
        .admin-toast.success {
          background: #2f855a;
        }
        .admin-toast.error {
          background: #c53030;
        }
        @keyframes slideIn {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .admin-loading-card {
          padding: 80px;
          text-align: center;
          color: #718096;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Configurações do Site Form */
        .settings-form-container {
          padding: 30px;
        }
        .settings-section {
          margin-bottom: 35px;
          padding-bottom: 30px;
          border-bottom: 1px solid #edf2f7;
        }
        .settings-section:last-of-type {
          border-bottom: none;
          margin-bottom: 20px;
        }
        .settings-section-title {
          font-size: 1.15rem;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .settings-section-desc {
          font-size: 0.85rem;
          color: #718096;
          margin-bottom: 20px;
        }

        /* Formulários */
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 6px;
        }
        .form-control {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #2d3748;
          font-family: inherit;
          background: #ffffff;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.15);
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .col-6 { flex: 0 0 calc(50% - 8px); }
        .col-3 { flex: 0 0 calc(25% - 12px); }
        .btn-slug-gen {
          padding: 0 12px;
          background: #edf2f7;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #4a5568;
        }
        .btn-slug-gen:hover {
          background: #e2e8f0;
        }
        .form-actions-bar {
          display: flex;
          justify-content: flex-end;
          padding-top: 15px;
        }
        .btn-save-main {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-primary);
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-save-main:hover {
          background: var(--color-primary-dark);
        }

        .btn-upload-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px;
          background: #edf2f7;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .btn-upload-action:hover:not(:disabled) {
          background: var(--color-accent);
          color: #ffffff;
          border-color: var(--color-accent);
        }
        .btn-upload-action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .image-preview-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 6px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .image-preview-box img {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          object-fit: cover;
          border: 1px solid #cbd5e0;
        }
        .image-preview-box span {
          font-size: 0.78rem;
          color: #718096;
        }

        /* Modais */
        .admin-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          box-sizing: border-box;
        }
        .admin-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: scaleUp 0.25s ease;
        }
        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .admin-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px;
          border-bottom: 1px solid #edf2f7;
          background: #fafbfc;
        }
        .admin-modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--color-primary);
        }
        .modal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #a0aec0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .modal-close-btn:hover {
          color: #e53e3e;
        }
        .admin-modal-form {
          padding: 25px 28px;
          overflow-y: auto;
          flex-grow: 1;
        }
        .admin-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #edf2f7;
        }
        .btn-cancel {
          padding: 10px 20px;
          background: #edf2f7;
          color: #4a5568;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-cancel:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
};
