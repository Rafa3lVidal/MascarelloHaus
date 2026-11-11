import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  ExternalLink,
  Trash2,
  X,
  Save,
  Upload,
  FileUp,
  FileText,
  Download,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { CATEGORIES_DATA } from '../../../data/categoriesData';
import {
  CategoryRecord,
  PostRecord,
  escapeHtml,
  exportToCsv,
  formatDateBR,
  generateSlugFromTitle,
} from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PostsTabProps {
  posts: PostRecord[];
  categories: CategoryRecord[];
  openNewTrigger: number;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const PostsTab: React.FC<PostsTabProps> = ({
  posts,
  categories,
  openNewTrigger,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const effectiveCategories = categories.length > 0 ? categories : CATEGORIES_DATA;
  const catMap = Object.fromEntries(effectiveCategories.map((c) => [c.id, c]));

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [editingPost, setEditingPost] = useState<PostRecord | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<PostRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const defaultCategoryId = effectiveCategories[0]?.id ?? 1;

  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    category_id: defaultCategoryId,
    status: 'published',
    excerpt: '',
    extra_text: '',
    featured_image_url: '',
    pdf_url: '',
    seo_title: '',
    seo_description: '',
    published_at: '',
  });

  const handleOpenNewPost = () => {
    setIsNewPost(true);
    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      category_id: defaultCategoryId,
      status: 'published',
      excerpt: '',
      extra_text: '',
      featured_image_url: '/wp-content/uploads/2023/09/incidentes.png',
      pdf_url: '',
      seo_title: '',
      seo_description: '',
      published_at: new Date().toISOString().slice(0, 16),
    });
  };

  useEffect(() => {
    if (openNewTrigger > 0) {
      handleOpenNewPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNewTrigger]);

  useEffect(() => {
    if (!editingPost && !isNewPost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        setEditingPost(null);
        setIsNewPost(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingPost, isNewPost, saving]);

  const handleOpenEditPost = (post: PostRecord) => {
    setIsNewPost(false);
    setEditingPost(post);
    const pubDate = post.published_at ? new Date(post.published_at) : new Date();
    const localIso = !Number.isNaN(pubDate.getTime())
      ? new Date(pubDate.getTime() - pubDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    setPostForm({
      title: post.title || '',
      slug: post.slug || '',
      category_id: post.category_id || defaultCategoryId,
      status: post.status || 'published',
      excerpt: post.excerpt || '',
      extra_text: post.extra_text || '',
      featured_image_url: post.featured_image_url || '',
      pdf_url: post.pdf_url || '',
      seo_title: post.seo_title || post.title || '',
      seo_description: post.seo_description || post.excerpt || '',
      published_at: localIso,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('error', 'Selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onShowToast('error', 'A imagem deve ter no máximo 10 MB.');
      return;
    }
    setIsUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const cleanName = generateSlugFromTitle(file.name.replace(/\.[^/.]+$/, '')) || 'imagem';
      const filePath = `posts/${Date.now()}-${cleanName}.${ext}`;
      const { data, error } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(data.path);
      setPostForm((prev) => ({ ...prev, featured_image_url: publicUrlData.publicUrl }));
      onShowToast('success', 'Imagem enviada com sucesso!');
    } catch (err: any) {
      console.error('Erro no upload da imagem:', err);
      onShowToast('error', err.message || 'Falha ao enviar imagem para o bucket media.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      onShowToast('error', 'Por favor, selecione um arquivo PDF válido.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      onShowToast('error', 'O arquivo PDF deve ter no máximo 20 MB.');
      return;
    }
    setIsUploadingPdf(true);
    try {
      const cleanName = generateSlugFromTitle(file.name.replace(/\.[^/.]+$/, '')) || 'documento';
      const filePath = `docs/${Date.now()}-${cleanName}.pdf`;
      const { data, error } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(data.path);
      setPostForm((prev) => ({ ...prev, pdf_url: publicUrlData.publicUrl }));
      onShowToast('success', 'Arquivo PDF enviado com sucesso!');
    } catch (err: any) {
      console.error('Erro no upload do PDF:', err);
      onShowToast('error', err.message || 'Falha ao enviar PDF.');
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = postForm.title.trim();
    const cleanSlug = generateSlugFromTitle(postForm.slug || trimmedTitle);

    if (!trimmedTitle || !cleanSlug) {
      onShowToast('error', 'Título e Slug válidos são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const safeParagraphs = postForm.extra_text
        ? escapeHtml(postForm.extra_text.trim())
            .split(/\n{2,}/)
            .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
            .join('')
        : '';

      const generatedHtml = safeParagraphs
        ? `<div class="post-content-entry">${safeParagraphs}</div>`
        : editingPost?.content_html || '<p></p>';

      const isoPublishedAt = postForm.published_at
        ? new Date(postForm.published_at).toISOString()
        : new Date().toISOString();

      const payload = {
        title: trimmedTitle,
        slug: cleanSlug,
        category_id: Number(postForm.category_id),
        status: postForm.status,
        excerpt: postForm.excerpt.trim(),
        extra_text: postForm.extra_text.trim(),
        content_html: generatedHtml,
        featured_image_url: postForm.featured_image_url.trim(),
        pdf_url: postForm.pdf_url.trim(),
        seo_title: (postForm.seo_title || trimmedTitle).trim(),
        seo_description: (postForm.seo_description || postForm.excerpt).trim(),
        published_at: isoPublishedAt,
        updated_at: new Date().toISOString(),
      };

      if (isNewPost) {
        const { data, error } = await supabase.from('posts').insert(payload).select();
        if (error) throw error;
        await onAudit('INSERT', 'posts', String(data?.[0]?.id ?? cleanSlug), null, payload);
        onShowToast('success', 'Nova publicação criada com sucesso!');
      } else if (editingPost) {
        const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.id).select();
        if (error) throw error;
        await onAudit('UPDATE', 'posts', String(editingPost.id), editingPost, payload);
        onShowToast('success', 'Publicação atualizada com sucesso!');
      }

      setEditingPost(null);
      setIsNewPost(false);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao salvar publicação:', err);
      onShowToast('error', err.message || 'Erro ao gravar publicação.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post: PostRecord) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', post.id);
      if (error) throw error;
      await onAudit('UPDATE', 'posts', String(post.id), { status: post.status }, { status: nextStatus });
      onShowToast(
        'success',
        nextStatus === 'published' ? 'Publicação ativada no site!' : 'Publicação movida para rascunho.'
      );
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message || 'Não foi possível alterar o status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', confirmDelete.id);
      if (error) throw error;
      await onAudit('DELETE', 'posts', String(confirmDelete.id), confirmDelete, null);
      onShowToast('success', 'Publicação removida com sucesso!');
      setConfirmDelete(null);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao excluir publicação:', err);
      onShowToast('error', err.message || 'Erro ao excluir publicação.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || String(p.category_id) === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleExport = () => {
    exportToCsv(
      `publicacoes-mascarellohaus-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Título', 'Slug', 'Categoria', 'Status', 'PDF', 'Data Publicação'],
      filteredPosts.map((p) => [
        p.id,
        p.title,
        `/${p.slug}/`,
        catMap[p.category_id || 0]?.name || 'Geral',
        p.status,
        p.pdf_url || '-',
        formatDateBR(p.published_at || p.created_at),
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
              placeholder="Pesquisar por título, slug ou resumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as Categorias</option>
            {effectiveCategories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por status"
          >
            <option value="all">Todos os Status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="scheduled">Agendados</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-outline-admin" onClick={handleExport}>
            <Download size={15} /> Exportar CSV
          </button>
          <button type="button" className="btn-create-post" onClick={handleOpenNewPost}>
            <Plus size={16} /> Nova Publicação
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Capa</th>
              <th>Título & Resumo</th>
              <th>Categoria</th>
              <th>Slug / Rota</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty-cell">
                  Nenhuma publicação encontrada para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => {
                const cat = post.category_id ? catMap[post.category_id] : undefined;
                return (
                  <tr key={post.id}>
                    <td style={{ width: '64px' }}>
                      <img
                        src={post.featured_image_url || '/wp-content/uploads/2023/09/incidentes.png'}
                        alt=""
                        className="table-post-thumb"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = '/wp-content/uploads/2023/09/incidentes.png';
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong>{post.title}</strong>
                        {post.pdf_url && (
                          <span className="mini-badge-pdf" title="Possui PDF anexo">
                            <FileText size={11} /> PDF
                          </span>
                        )}
                      </div>
                      {post.excerpt && (
                        <p className="table-subtext">
                          {post.excerpt.length > 90 ? `${post.excerpt.slice(0, 90)}...` : post.excerpt}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className="badge-tone neutral">{cat?.name || 'Geral'}</span>
                    </td>
                    <td>
                      <code className="slug-code">/{post.slug}/</code>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`status-pill-btn ${post.status === 'published' ? 'published' : 'draft'}`}
                        onClick={() => handleToggleStatus(post)}
                        title="Clique para alternar entre Publicado e Rascunho"
                      >
                        {post.status === 'published'
                          ? 'Publicado'
                          : post.status === 'scheduled'
                          ? 'Agendado'
                          : 'Rascunho'}
                      </button>
                    </td>
                    <td className="tabular-nums">{formatDateBR(post.published_at || post.created_at)}</td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
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
                          type="button"
                          className="table-action-btn delete"
                          onClick={() => setConfirmDelete(post)}
                          title="Excluir Publicação"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: EDITAR / CRIAR POST */}
      {(editingPost || isNewPost) && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!saving) {
              setEditingPost(null);
              setIsNewPost(false);
            }
          }}
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewPost ? 'Criar Nova Publicação / Artigo' : 'Editar Publicação'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                disabled={saving}
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
                      slug: isNewPost ? generateSlugFromTitle(newTitle) : postForm.slug,
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
                      onClick={() =>
                        setPostForm({ ...postForm, slug: generateSlugFromTitle(postForm.title) })
                      }
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
                    {effectiveCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
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
                    <option value="scheduled">Agendado</option>
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
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = 'none';
                        }}
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
                    >
                      <FileUp size={14} />
                      {isUploadingPdf ? 'Enviando...' : 'Upload PDF'}
                    </button>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label>Data e Hora da Publicação</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={postForm.published_at}
                      onChange={(e) => setPostForm({ ...postForm, published_at: e.target.value })}
                    />
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
                  <label>
                    Título SEO (Meta Title){' '}
                    <span className="char-counter">{(postForm.seo_title || postForm.title).length}/60</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={postForm.seo_title}
                    onChange={(e) => setPostForm({ ...postForm, seo_title: e.target.value })}
                    placeholder="Título para o Google"
                  />
                </div>
                <div className="form-group col-6">
                  <label>
                    Descrição SEO (Meta Description){' '}
                    <span className="char-counter">
                      {(postForm.seo_description || postForm.excerpt).length}/160
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={postForm.seo_description}
                    onChange={(e) => setPostForm({ ...postForm, seo_description: e.target.value })}
                    placeholder="Descrição para buscadores"
                  />
                </div>
              </div>

              {/* Google Search Snippet Preview */}
              <div className="seo-preview-box">
                <span className="seo-preview-label">Prévia no Google</span>
                <div className="seo-preview-url">
                  https://mascarellohaus.adv.br/{postForm.slug || 'nova-publicacao'}/
                </div>
                <div className="seo-preview-title">
                  {postForm.seo_title || postForm.title || 'Título da publicação'} | Mascârello Haus Advocacia
                </div>
                <div className="seo-preview-desc">
                  {postForm.seo_description || postForm.excerpt || 'A descrição resumida da publicação aparecerá aqui nos resultados de busca.'}
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={saving}
                  onClick={() => {
                    setEditingPost(null);
                    setIsNewPost(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Publicação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Excluir Publicação"
        message={`Tem certeza que deseja excluir permanentemente "${confirmDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir Publicação"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
