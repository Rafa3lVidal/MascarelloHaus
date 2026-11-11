import React, { useState, useEffect } from 'react';
import { Edit, ExternalLink, Search, X, Save, Layers, FileText, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PageRecord, PracticeAreaRecord, generateSlugFromTitle } from '../types';

interface PagesAndAreasTabProps {
  pages: PageRecord[];
  practiceAreas: PracticeAreaRecord[];
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const PagesAndAreasTab: React.FC<PagesAndAreasTabProps> = ({
  pages,
  practiceAreas,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [subTab, setSubTab] = useState<'pages' | 'areas'>('pages');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingPage, setEditingPage] = useState<PageRecord | null>(null);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    seo_title: '',
    seo_description: '',
    content_html: '',
    is_published: true,
  });

  const [editingArea, setEditingArea] = useState<PracticeAreaRecord | null>(null);
  const [isNewArea, setIsNewArea] = useState(false);
  const [areaForm, setAreaForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    full_content_html: '',
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    if (!editingPage && !editingArea && !isNewArea) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        setEditingPage(null);
        setEditingArea(null);
        setIsNewArea(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingPage, editingArea, isNewArea, saving]);

  const handleOpenEditPage = (page: PageRecord) => {
    setEditingPage(page);
    setPageForm({
      title: page.title || '',
      slug: page.slug || '',
      seo_title: page.seo_title || page.title || '',
      seo_description: page.seo_description || '',
      content_html: page.content_html || '',
      is_published: page.is_published ?? true,
    });
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !pageForm.title.trim()) {
      onShowToast('error', 'O título da página é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        title: pageForm.title.trim(),
        seo_title: pageForm.seo_title.trim(),
        seo_description: pageForm.seo_description.trim(),
        content_html: pageForm.content_html,
        is_published: pageForm.is_published,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('pages').update(updates).eq('id', editingPage.id);
      if (error) throw error;
      await onAudit('UPDATE', 'pages', String(editingPage.id), editingPage, updates);
      onShowToast('success', 'Conteúdo da página atualizado com sucesso!');
      setEditingPage(null);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao atualizar página:', err);
      onShowToast('error', err.message || 'Erro ao gravar alterações da página.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePagePublish = async (page: PageRecord) => {
    try {
      const next = !page.is_published;
      const { error } = await supabase
        .from('pages')
        .update({ is_published: next, updated_at: new Date().toISOString() })
        .eq('id', page.id);
      if (error) throw error;
      await onAudit('UPDATE', 'pages', String(page.id), { is_published: page.is_published }, { is_published: next });
      onShowToast('success', next ? 'Página publicada no site.' : 'Página ocultada.');
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message || 'Falha ao atualizar status da página.');
    }
  };

  const handleOpenNewArea = () => {
    setIsNewArea(true);
    setEditingArea(null);
    setAreaForm({
      title: '',
      slug: '',
      short_description: '',
      full_content_html: '',
      order_index: practiceAreas.length + 1,
      is_active: true,
    });
  };

  const handleOpenEditArea = (area: PracticeAreaRecord) => {
    setIsNewArea(false);
    setEditingArea(area);
    setAreaForm({
      title: area.title || '',
      slug: area.slug || '',
      short_description: area.short_description || '',
      full_content_html: area.full_content_html || '',
      order_index: area.order_index ?? 0,
      is_active: area.is_active ?? true,
    });
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = areaForm.title.trim();
    const slug = generateSlugFromTitle(areaForm.slug || title);
    if (!title || !slug || !areaForm.short_description.trim()) {
      onShowToast('error', 'Título, slug e descrição resumida são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        short_description: areaForm.short_description.trim(),
        full_content_html: areaForm.full_content_html.trim() || `<p>${areaForm.short_description.trim()}</p>`,
        order_index: Number(areaForm.order_index) || 0,
        is_active: areaForm.is_active,
        updated_at: new Date().toISOString(),
      };

      if (isNewArea) {
        const { data, error } = await supabase.from('practice_areas').insert(payload).select();
        if (error) throw error;
        await onAudit('INSERT', 'practice_areas', String(data?.[0]?.id ?? slug), null, payload);
        onShowToast('success', 'Área de atuação criada com sucesso!');
      } else if (editingArea) {
        const { error } = await supabase.from('practice_areas').update(payload).eq('id', editingArea.id);
        if (error) throw error;
        await onAudit('UPDATE', 'practice_areas', String(editingArea.id), editingArea, payload);
        onShowToast('success', 'Área de atuação atualizada!');
      }

      setEditingArea(null);
      setIsNewArea(false);
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', err.message || 'Erro ao salvar área de atuação.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAreas = practiceAreas.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="toolbar-bar">
        <div className="toolbar-filters">
          <div className="subtab-pills">
            <button
              type="button"
              className={`subtab-pill ${subTab === 'pages' ? 'active' : ''}`}
              onClick={() => setSubTab('pages')}
            >
              <FileText size={14} /> Páginas Institucionais ({pages.length})
            </button>
            <button
              type="button"
              className={`subtab-pill ${subTab === 'areas' ? 'active' : ''}`}
              onClick={() => setSubTab('areas')}
            >
              <Layers size={14} /> Áreas de Atuação ({practiceAreas.length})
            </button>
          </div>

          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Pesquisar por título ou rota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {subTab === 'areas' && (
          <div className="toolbar-actions">
            <button type="button" className="btn-create-post" onClick={handleOpenNewArea}>
              <Plus size={16} /> Nova Área
            </button>
          </div>
        )}
      </div>

      {subTab === 'pages' ? (
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
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty-cell">
                    Nenhuma página encontrada no banco de dados.
                  </td>
                </tr>
              ) : (
                filteredPages.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                    </td>
                    <td>
                      <code className="slug-code">/{p.slug === 'mascarello-haus' ? '' : `${p.slug}/`}</code>
                    </td>
                    <td>{p.seo_title || p.title}</td>
                    <td>
                      <button
                        type="button"
                        className={`status-pill-btn ${p.is_published ? 'published' : 'draft'}`}
                        onClick={() => handleTogglePagePublish(p)}
                        title="Clique para alternar visibilidade"
                      >
                        {p.is_published ? 'Ativa' : 'Rascunho'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Área de Atuação</th>
                <th>Slug</th>
                <th>Resumo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty-cell">
                    Nenhuma área de atuação cadastrada no banco.
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr key={area.id}>
                    <td className="tabular-nums">#{area.order_index}</td>
                    <td>
                      <strong>{area.title}</strong>
                    </td>
                    <td>
                      <code className="slug-code">/{area.slug}/</code>
                    </td>
                    <td>
                      <span className="table-subtext">
                        {area.short_description.length > 90
                          ? `${area.short_description.slice(0, 90)}...`
                          : area.short_description}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-tone ${area.is_active ? 'success' : 'neutral'}`}>
                        {area.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn edit"
                          onClick={() => handleOpenEditArea(area)}
                          title="Editar Área"
                        >
                          <Edit size={15} />
                        </button>
                        <a
                          href={`/${area.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="table-action-btn view"
                          title="Ver Área"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: EDITAR PÁGINA */}
      {editingPage && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => !saving && setEditingPage(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Editar Conteúdo da Página: {editingPage.title}</h3>
              <button type="button" className="modal-close-btn" disabled={saving} onClick={() => setEditingPage(null)}>
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
                <button type="button" className="btn-cancel" disabled={saving} onClick={() => setEditingPage(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações da Página'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / CRIAR ÁREA DE ATUAÇÃO */}
      {(editingArea || isNewArea) && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!saving) {
              setEditingArea(null);
              setIsNewArea(false);
            }
          }}
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewArea ? 'Nova Área de Atuação' : `Editar Área: ${editingArea?.title}`}</h3>
              <button
                type="button"
                className="modal-close-btn"
                disabled={saving}
                onClick={() => {
                  setEditingArea(null);
                  setIsNewArea(false);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="admin-modal-form">
              <div className="form-row">
                <div className="form-group col-6">
                  <label>Título da Área *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={areaForm.title}
                    onChange={(e) =>
                      setAreaForm({
                        ...areaForm,
                        title: e.target.value,
                        slug: isNewArea ? generateSlugFromTitle(e.target.value) : areaForm.slug,
                      })
                    }
                  />
                </div>
                <div className="form-group col-3">
                  <label>Ordem</label>
                  <input
                    type="number"
                    className="form-control"
                    value={areaForm.order_index}
                    onChange={(e) => setAreaForm({ ...areaForm, order_index: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group col-3">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={areaForm.is_active ? 'true' : 'false'}
                    onChange={(e) => setAreaForm({ ...areaForm, is_active: e.target.value === 'true' })}
                  >
                    <option value="true">Ativa</option>
                    <option value="false">Inativa</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Slug da Rota *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={areaForm.slug}
                  onChange={(e) => setAreaForm({ ...areaForm, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Descrição Resumida *</label>
                <textarea
                  required
                  rows={3}
                  className="form-control"
                  value={areaForm.short_description}
                  onChange={(e) => setAreaForm({ ...areaForm, short_description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Conteúdo Detalhado (HTML)</label>
                <textarea
                  rows={6}
                  className="form-control"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={areaForm.full_content_html}
                  onChange={(e) => setAreaForm({ ...areaForm, full_content_html: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={saving}
                  onClick={() => {
                    setEditingArea(null);
                    setIsNewArea(false);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
