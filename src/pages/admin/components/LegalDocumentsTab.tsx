import React, { useState } from 'react';
import { FileText, Scale, Save, ExternalLink, RotateCcw, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  DEFAULT_PRIVACY_TEMPLATE_HTML,
  DEFAULT_TERMS_TEMPLATE_HTML,
  LegalDocConfig,
  LegalDocumentsConfig,
} from '../../../lib/lgpdConfig';
import { formatFriendlyError } from '../types';

interface LegalDocumentsTabProps {
  config: LegalDocumentsConfig;
  currentUserId?: string;
  onChange: (next: LegalDocumentsConfig) => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const LegalDocumentsTab: React.FC<LegalDocumentsTabProps> = ({
  config,
  currentUserId,
  onChange,
  onShowToast,
  onAudit,
}) => {
  const [docKey, setDocKey] = useState<'privacyPolicy' | 'termsOfUse'>('privacyPolicy');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const activeDoc = config[docKey];
  const fallbackTemplate =
    docKey === 'privacyPolicy' ? DEFAULT_PRIVACY_TEMPLATE_HTML : DEFAULT_TERMS_TEMPLATE_HTML;
  const effectiveHtml = activeDoc.customHtml.trim() ? activeDoc.customHtml : fallbackTemplate;

  const updateActiveDoc = (patch: Partial<LegalDocConfig>) => {
    onChange({
      ...config,
      [docKey]: {
        ...activeDoc,
        ...patch,
      },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'legal_documents_config',
        value_json: config,
        updated_by: currentUserId || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await onAudit('UPDATE', 'site_settings', 'legal_documents_config', null, {
        privacyVersion: config.privacyPolicy.version,
        termsVersion: config.termsOfUse.version,
      });
      onShowToast('success', 'Documentos legais publicados no site com sucesso!');
    } catch (err) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível publicar o documento legal.'));
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = () => {
    const template =
      docKey === 'privacyPolicy' ? DEFAULT_PRIVACY_TEMPLATE_HTML : DEFAULT_TERMS_TEMPLATE_HTML;
    updateActiveDoc({ customHtml: template });
    onShowToast('success', 'Modelo estruturado carregado no editor. Revise e clique em Publicar.');
  };

  const publicUrl =
    docKey === 'privacyPolicy'
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
        </div>

        <div className="toolbar-actions-group">
          <button
            type="button"
            className="btn-outline-admin"
            onClick={() => setShowPreview((prev) => !prev)}
          >
            <Eye size={15} /> {showPreview ? 'Voltar ao Editor' : 'Pré-visualizar'}
          </button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-admin">
            Abrir no Site <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="settings-form-container">
        <form onSubmit={handleSave}>
          <div className="settings-section">
            <div className="legal-doc-header-row">
              <div>
                <h3 className="settings-section-title" style={{ marginBottom: '4px' }}>
                  {docKey === 'privacyPolicy'
                    ? 'Configuração da Política de Privacidade'
                    : 'Configuração dos Termos de Uso'}
                </h3>
                <p className="settings-section-desc" style={{ marginBottom: 0 }}>
                  Alterações de título, versão e conteúdo são refletidas automaticamente na Central de Proteção de Dados do site.
                </p>
              </div>
              <button type="button" className="btn-outline-admin" onClick={handleLoadTemplate}>
                <RotateCcw size={14} /> Restaurar Texto Padrão
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
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>
                Conteúdo Completo do Documento (HTML estruturado exibido no portal público)
              </label>

              {showPreview ? (
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
              ) : (
                <textarea
                  rows={20}
                  className="form-control code-textarea"
                  value={effectiveHtml}
                  onChange={(e) => updateActiveDoc({ customHtml: e.target.value })}
                  placeholder="Insira o texto completo em HTML estruturado (<h3>, <p>, <ul><li>...)..."
                />
              )}
            </div>
          </div>

          <div className="settings-actions-footer">
            <button type="submit" className="btn-save-main" disabled={saving}>
              <Save size={16} /> {saving ? 'Publicando...' : 'Publicar Documento Legal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
