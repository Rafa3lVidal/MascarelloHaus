import React, { useRef, useState } from 'react';
import {
  FileText,
  Scale,
  Save,
  ExternalLink,
  RotateCcw,
  Eye,
  Columns2,
  Bold,
  Heading3,
  List,
  Pilcrow,
  History,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  DEFAULT_LEGAL_DOCUMENTS_CONFIG,
  DEFAULT_PRIVACY_TEMPLATE_HTML,
  DEFAULT_TERMS_TEMPLATE_HTML,
  LegalDocConfig,
  LegalDocVersionItem,
  LegalDocumentsConfig,
} from '../../../lib/lgpdConfig';
import { formatFriendlyError } from '../types';

interface LegalDocumentsTabProps {
  config: LegalDocumentsConfig;
  currentUserId?: string;
  userEmail?: string;
  onChange: (next: LegalDocumentsConfig) => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const LegalDocumentsTab: React.FC<LegalDocumentsTabProps> = ({
  config,
  currentUserId,
  userEmail,
  onChange,
  onShowToast,
  onAudit,
}) => {
  const [docKey, setDocKey] = useState<'privacyPolicy' | 'termsOfUse' | 'history'>('privacyPolicy');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const [changelogNote, setChangelogNote] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeDocKey = docKey === 'history' ? 'privacyPolicy' : docKey;
  const activeDoc = config[activeDocKey];
  const fallbackTemplate =
    activeDocKey === 'privacyPolicy' ? DEFAULT_PRIVACY_TEMPLATE_HTML : DEFAULT_TERMS_TEMPLATE_HTML;
  const effectiveHtml = activeDoc.customHtml.trim() ? activeDoc.customHtml : fallbackTemplate;

  const historyList: LegalDocVersionItem[] =
    config.versionHistory || DEFAULT_LEGAL_DOCUMENTS_CONFIG.versionHistory || [];

  const updateActiveDoc = (patch: Partial<LegalDocConfig>) => {
    onChange({
      ...config,
      [activeDocKey]: {
        ...activeDoc,
        ...patch,
      },
    });
  };

  const insertTag = (before: string, after: string, placeholder: string) => {
    const el = textareaRef.current;
    if (!el) {
      updateActiveDoc({ customHtml: `${effectiveHtml}\n${before}${placeholder}${after}` });
      return;
    }
    const start = el.selectionStart ?? effectiveHtml.length;
    const end = el.selectionEnd ?? effectiveHtml.length;
    const selected = effectiveHtml.slice(start, end) || placeholder;
    const next = `${effectiveHtml.slice(0, start)}${before}${selected}${after}${effectiveHtml.slice(end)}`;
    updateActiveDoc({ customHtml: next });
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newVersionRecord: LegalDocVersionItem = {
        id: `ver-${activeDocKey}-${activeDoc.version}-${Date.now()}`,
        docType: activeDocKey,
        version: activeDoc.version,
        updatedAt: activeDoc.updatedAt || new Date().toISOString().slice(0, 10),
        publishedBy: userEmail || 'Encarregada (DPO)',
        changelog:
          changelogNote.trim() ||
          `Publicação/atualização da versão ${activeDoc.version} (${
            activeDocKey === 'privacyPolicy' ? 'Aviso de Privacidade' : 'Termos de Uso'
          }).`,
        customHtml: effectiveHtml,
      };

      const filteredHistory = historyList.filter(
        (h) => !(h.docType === activeDocKey && h.version === activeDoc.version)
      );
      const nextConfig: LegalDocumentsConfig = {
        ...config,
        versionHistory: [newVersionRecord, ...filteredHistory].slice(0, 50),
      };

      const { error } = await supabase.from('site_settings').upsert({
        key: 'legal_documents_config',
        value_json: nextConfig,
        updated_by: currentUserId || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      // Best-effort sync to relational `legal_document_versions` table if present
      try {
        const slug = activeDocKey === 'privacyPolicy' ? 'politica-de-privacidade' : 'termos-de-uso';
        const { data: docRow } = await supabase
          .from('legal_documents')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (docRow?.id) {
          await supabase
            .from('legal_document_versions')
            .update({ is_current: false })
            .eq('document_id', docRow.id);

          await supabase.from('legal_document_versions').insert({
            document_id: docRow.id,
            version_label: activeDoc.version,
            content_html: effectiveHtml,
            effective_date: activeDoc.updatedAt || new Date().toISOString().slice(0, 10),
            is_current: true,
            created_by: currentUserId || null,
          });
        }
      } catch {
        // Non-blocking relational sync
      }

      onChange(nextConfig);
      setChangelogNote('');

      await onAudit('UPDATE', 'site_settings', 'legal_documents_config', null, {
        docType: activeDocKey,
        privacyVersion: nextConfig.privacyPolicy.version,
        termsVersion: nextConfig.termsOfUse.version,
        changelog: newVersionRecord.changelog,
      });
      onShowToast('success', 'Documento legal publicado e versão gravada no histórico imutável (Art. 8º, § 2º)!');
    } catch (err) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível publicar o documento legal.'));
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = () => {
    const template =
      activeDocKey === 'privacyPolicy' ? DEFAULT_PRIVACY_TEMPLATE_HTML : DEFAULT_TERMS_TEMPLATE_HTML;
    updateActiveDoc({ customHtml: template });
    onShowToast('success', 'Modelo estruturado 100% LGPD carregado no editor. Revise e clique em Publicar.');
  };

  const handleRestoreVersion = (ver: LegalDocVersionItem) => {
    onChange({
      ...config,
      [ver.docType]: {
        ...config[ver.docType],
        version: ver.version,
        updatedAt: ver.updatedAt,
        customHtml: ver.customHtml,
      },
    });
    setDocKey(ver.docType);
    onShowToast('success', `Versão v${ver.version} carregada no editor. Clique em Publicar para ativá-la.`);
  };

  const publicUrl =
    activeDocKey === 'privacyPolicy'
      ? '/central-de-protecao-de-dados/?aba=privacidade'
      : '/central-de-protecao-de-dados/?aba=termos';

  return (
    <div className="tab-module-container">
      <div className="module-toolbar">
        <div className="subtab-pills">
          <button
            type="button"
            className={`subtab-pill ${docKey === 'privacyPolicy' ? 'active' : ''}`}
            onClick={() => setDocKey('privacyPolicy')}
          >
            <FileText size={14} /> Política de Privacidade (v{config.privacyPolicy.version})
          </button>
          <button
            type="button"
            className={`subtab-pill ${docKey === 'termsOfUse' ? 'active' : ''}`}
            onClick={() => setDocKey('termsOfUse')}
          >
            <Scale size={14} /> Termos de Uso (v{config.termsOfUse.version})
          </button>
          <button
            type="button"
            className={`subtab-pill ${docKey === 'history' ? 'active' : ''}`}
            onClick={() => setDocKey('history')}
          >
            <History size={14} /> Histórico de Versões Art. 8º ({historyList.length})
          </button>
        </div>

        {docKey !== 'history' && (
          <div className="toolbar-actions-group">
            <div className="subtab-pills">
              <button
                type="button"
                className={`subtab-pill ${viewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setViewMode('edit')}
              >
                Editor
              </button>
              <button
                type="button"
                className={`subtab-pill ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
              >
                <Columns2 size={14} /> Lado a Lado
              </button>
              <button
                type="button"
                className={`subtab-pill ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
              >
                <Eye size={14} /> Pré-visualizar
              </button>
            </div>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-admin">
              Abrir no Site <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      {docKey === 'history' ? (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Versão</th>
                <th>Data de Vigência</th>
                <th>Responsável</th>
                <th>Resumo das Alterações (Art. 8º, § 6º)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty-cell">
                    Nenhuma versão histórica registrada.
                  </td>
                </tr>
              ) : (
                historyList.map((ver) => (
                  <tr key={ver.id}>
                    <td>
                      <strong>
                        {ver.docType === 'privacyPolicy' ? 'Aviso de Privacidade' : 'Termos de Uso'}
                      </strong>
                    </td>
                    <td>
                      <code className="slug-code">v{ver.version}</code>
                    </td>
                    <td className="tabular-nums">{ver.updatedAt}</td>
                    <td>{ver.publishedBy || 'DPO'}</td>
                    <td style={{ maxWidth: '360px' }}>
                      <div className="table-subtext">{ver.changelog}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline-admin"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleRestoreVersion(ver)}
                      >
                        <RotateCcw size={13} /> Carregar no Editor
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="settings-form-container">
          <form onSubmit={handleSave}>
            <div className="settings-section">
              <div className="legal-doc-header-row">
                <div>
                  <h3 className="settings-section-title" style={{ marginBottom: '4px' }}>
                    {activeDocKey === 'privacyPolicy'
                      ? 'Configuração da Política de Privacidade (Art. 9º LGPD)'
                      : 'Configuração dos Termos de Uso'}
                  </h3>
                  <p className="settings-section-desc" style={{ marginBottom: 0 }}>
                    Alterações de título, versão e conteúdo são refletidas automaticamente na Central de Proteção de Dados e gravadas no histórico de versões (Art. 8º, § 2º).
                  </p>
                </div>
                <button type="button" className="btn-outline-admin" onClick={handleLoadTemplate}>
                  <RotateCcw size={14} /> Carregar Modelo 100% Adequado LGPD
                </button>
              </div>

              <div className="form-grid-2" style={{ marginTop: '18px' }}>
                <div className="form-group">
                  <label>Título do Documento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={activeDoc.title}
                    onChange={(e) => updateActiveDoc({ title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Subtítulo / Cabeçalho</label>
                  <input
                    type="text"
                    className="form-control"
                    value={activeDoc.subtitle}
                    onChange={(e) => updateActiveDoc({ subtitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Versão Vigente</label>
                  <input
                    type="text"
                    className="form-control"
                    value={activeDoc.version}
                    onChange={(e) => updateActiveDoc({ version: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Data da Última Atualização</label>
                  <input
                    type="date"
                    className="form-control"
                    value={activeDoc.updatedAt}
                    onChange={(e) => updateActiveDoc({ updatedAt: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Resumo das Alterações desta Versão (Registro de Transparência — Art. 8º, § 6º LGPD)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Atualização da cláusula de transferência internacional (Res. ANPD nº 19/2024) e DPO Substituto..."
                    value={changelogNote}
                    onChange={(e) => setChangelogNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <div className="legal-editor-bar">
                  <label style={{ margin: 0 }}>Conteúdo Completo do Documento</label>
                  {viewMode !== 'preview' && (
                    <div className="legal-format-toolbar">
                      <button
                        type="button"
                        onClick={() => insertTag('<h3>', '</h3>', 'Nova Seção')}
                        title="Inserir Título H3"
                      >
                        <Heading3 size={14} /> Título
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<p>', '</p>', 'Texto do parágrafo...')}
                        title="Inserir Parágrafo"
                      >
                        <Pilcrow size={14} /> Parágrafo
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<strong>', '</strong>', 'destaque')}
                        title="Negrito"
                      >
                        <Bold size={14} /> Negrito
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>', 'Item da lista')}
                        title="Lista com marcadores"
                      >
                        <List size={14} /> Lista
                      </button>
                    </div>
                  )}
                </div>

                <div className={viewMode === 'split' ? 'legal-split-grid' : ''}>
                  {viewMode !== 'preview' && (
                    <textarea
                      ref={textareaRef}
                      rows={22}
                      className="form-control code-textarea"
                      value={effectiveHtml}
                      onChange={(e) => updateActiveDoc({ customHtml: e.target.value })}
                      placeholder="Insira o texto completo em HTML estruturado (<h3>, <p>, <ul><li>...)..."
                    />
                  )}

                  {viewMode !== 'edit' && (
                    <div className="legal-doc-preview-card">
                      <small className="legal-preview-kicker">{activeDoc.subtitle}</small>
                      <h2>{activeDoc.title}</h2>
                      <p className="legal-preview-meta">
                        Versão {activeDoc.version} · Atualizado em {activeDoc.updatedAt}
                      </p>
                      <div
                        className="legal-preview-body"
                        dangerouslySetInnerHTML={{ __html: effectiveHtml }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="settings-actions-footer">
              <button type="submit" className="btn-save-main" disabled={saving}>
                <Save size={16} /> {saving ? 'Publicando...' : 'Publicar Documento e Registrar Versão'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
