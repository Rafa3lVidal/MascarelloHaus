import React, { useState } from 'react';
import {
  Cookie,
  Save,
  Eye,
  Plus,
  Trash2,
  Edit,
  Download,
  Search,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  X,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { CookieBannerConfig, CookieTableItem } from '../../../lib/lgpdConfig';
import {
  ConsentRecord,
  exportToCsv,
  formatDateTimeBR,
  formatFriendlyError,
} from '../types';

interface CookiesAndConsentTabProps {
  config: CookieBannerConfig;
  consentRecords: ConsentRecord[];
  currentUserId?: string;
  onChange: (next: CookieBannerConfig) => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const CookiesAndConsentTab: React.FC<CookiesAndConsentTabProps> = ({
  config,
  consentRecords,
  currentUserId,
  onChange,
  onShowToast,
  onAudit,
}) => {
  const [subTab, setSubTab] = useState<'banner' | 'inventory' | 'logs'>('banner');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cookie Inventory modal state
  const [editingCookie, setEditingCookie] = useState<CookieTableItem | null>(null);
  const [isNewCookie, setIsNewCookie] = useState(false);

  const persistCookieConfig = async (nextConfig: CookieBannerConfig, successMessage: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'lgpd_cookies',
        value_json: nextConfig,
        updated_by: currentUserId || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await onAudit('UPDATE', 'site_settings', 'lgpd_cookies', null, {
        enabled: nextConfig.enabled,
        version: nextConfig.version,
        cookiesCount: nextConfig.cookiesTable.length,
      });
      onChange(nextConfig);
      onShowToast('success', successMessage);
    } catch (err) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível salvar as configurações de cookies.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBannerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistCookieConfig(config, 'Configurações do banner de cookies publicadas com sucesso!');
  };

  const handleSaveCookieItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCookie) return;
    if (!editingCookie.name.trim() || !editingCookie.purpose.trim()) {
      onShowToast('error', 'Informe o identificador e a finalidade do cookie.');
      return;
    }

    const updatedTable = isNewCookie
      ? [...config.cookiesTable, { ...editingCookie, id: `ck-${Date.now()}` }]
      : config.cookiesTable.map((item) => (item.id === editingCookie.id ? editingCookie : item));

    const nextConfig = { ...config, cookiesTable: updatedTable };
    setEditingCookie(null);
    setIsNewCookie(false);
    await persistCookieConfig(nextConfig, 'Inventário de cookies atualizado com sucesso!');
  };

  const handleDeleteCookieItem = async (id: string) => {
    const nextConfig = {
      ...config,
      cookiesTable: config.cookiesTable.filter((item) => item.id !== id),
    };
    await persistCookieConfig(nextConfig, 'Cookie removido do inventário.');
  };

  const filteredConsents = consentRecords.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.consent_type.toLowerCase().includes(q) ||
      c.policy_version.toLowerCase().includes(q) ||
      (c.user_identifier || '').toLowerCase().includes(q)
    );
  });

  const totalGranted = consentRecords.filter((c) => c.granted).length;
  const totalEssentialOnly = consentRecords.filter((c) => !c.granted).length;

  return (
    <div className="tab-module-container">
      <div className="module-toolbar">
        <div className="subtab-pills">
          <button
            type="button"
            className={`subtab-pill ${subTab === 'banner' ? 'active' : ''}`}
            onClick={() => setSubTab('banner')}
          >
            <Sliders size={14} /> Banner & Categorias
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setSubTab('inventory')}
          >
            <Cookie size={14} /> Inventário de Cookies ({config.cookiesTable.length})
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'logs' ? 'active' : ''}`}
            onClick={() => setSubTab('logs')}
          >
            <ShieldCheck size={14} /> Prova de Consentimentos ({consentRecords.length})
          </button>
        </div>

        {subTab === 'inventory' && (
          <button
            type="button"
            className="btn-save-main"
            onClick={() => {
              setIsNewCookie(true);
              setEditingCookie({
                id: '',
                name: '',
                provider: 'Mascârello Haus',
                category: 'Necessário',
                purpose: '',
                retention: '12 meses',
              });
            }}
          >
            <Plus size={15} /> Adicionar Cookie
          </button>
        )}

        {subTab === 'logs' && (
          <div className="toolbar-actions-group">
            <div className="search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filtrar consentimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `consentimentos-cookies-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['ID', 'Tipo', 'Status', 'Versão', 'Identificador', 'Data'],
                  filteredConsents.map((c) => [
                    c.id,
                    c.consent_type,
                    c.granted ? 'Concedido' : 'Recusado/Essencial',
                    c.policy_version,
                    c.user_identifier || '-',
                    formatDateTimeBR(c.created_at),
                  ])
                )
              }
            >
              <Download size={15} /> Exportar CSV
            </button>
          </div>
        )}
      </div>

      {subTab === 'banner' && (
        <div className="settings-form-container">
          <form onSubmit={handleSaveBannerForm}>
            {/* Live Preview */}
            <div className="lgpd-preview-panel">
              <div className="lgpd-preview-header">
                <span>
                  <Eye size={14} /> Pré-visualização ao vivo do Banner no Site
                </span>
                <span className={`badge-tone ${config.enabled ? 'success' : 'neutral'}`}>
                  {config.enabled ? `Ativo · v${config.version}` : 'Desativado'}
                </span>
              </div>
              <div className="cookie-preview-box">
                <div className="cookie-preview-info">
                  <strong>{config.title || 'Privacidade e Gestão de Cookies'}</strong>
                  <p>{config.description}</p>
                </div>
                <div className="cookie-preview-actions">
                  <span className="preview-btn-outline">{config.customizeLabel || 'Personalizar'}</span>
                  <span className="preview-btn-secondary">{config.rejectOptionalLabel || 'Apenas Essenciais'}</span>
                  <span className="preview-btn-primary">{config.acceptAllLabel || 'Aceitar Todos'}</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <Cookie size={18} /> Comportamento e Textos do Banner (ANPD)
              </h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
                    />
                    <span>Exibir banner de cookies para novos visitantes</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={config.showFloatingButton}
                      onChange={(e) => onChange({ ...config, showFloatingButton: e.target.checked })}
                    />
                    <span>Exibir botão flutuante permanente de preferências</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Título do Banner</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.title}
                    onChange={(e) => onChange({ ...config, title: e.target.value })}
                  />
                </div>
                <div className="form-grid-2" style={{ gap: '12px' }}>
                  <div className="form-group">
                    <label>Versão do Termo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.version}
                      onChange={(e) => onChange({ ...config, version: e.target.value })}
                      placeholder="2.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Validade (meses)</label>
                    <input
                      type="number"
                      min={1}
                      max={36}
                      className="form-control"
                      value={config.consentExpiryMonths}
                      onChange={(e) =>
                        onChange({ ...config, consentExpiryMonths: Math.max(1, Number(e.target.value) || 12) })
                      }
                    />
                  </div>
                </div>

                <div className="form-group form-group-full">
                  <label>Texto Principal do Aviso de Cookies</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={config.description}
                    onChange={(e) => onChange({ ...config, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Botão Aceitar Todos</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.acceptAllLabel}
                    onChange={(e) => onChange({ ...config, acceptAllLabel: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Botão Rejeitar Opcionais</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.rejectOptionalLabel}
                    onChange={(e) => onChange({ ...config, rejectOptionalLabel: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Botão Personalizar</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.customizeLabel}
                    onChange={(e) => onChange({ ...config, customizeLabel: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rótulo do Botão Flutuante</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.floatingButtonLabel}
                    onChange={(e) => onChange({ ...config, floatingButtonLabel: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <Sliders size={18} /> Descrições das Categorias de Preferência
              </h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Título — Essenciais</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.essentialTitle}
                    onChange={(e) => onChange({ ...config, essentialTitle: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    className="form-control"
                    style={{ marginTop: '8px' }}
                    value={config.essentialDesc}
                    onChange={(e) => onChange({ ...config, essentialDesc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Título — Funcionais</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.functionalTitle}
                    onChange={(e) => onChange({ ...config, functionalTitle: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    className="form-control"
                    style={{ marginTop: '8px' }}
                    value={config.functionalDesc}
                    onChange={(e) => onChange({ ...config, functionalDesc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Título — Analíticos</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.analyticsTitle}
                    onChange={(e) => onChange({ ...config, analyticsTitle: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    className="form-control"
                    style={{ marginTop: '8px' }}
                    value={config.analyticsDesc}
                    onChange={(e) => onChange({ ...config, analyticsDesc: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Título — Marketing</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.marketingTitle}
                    onChange={(e) => onChange({ ...config, marketingTitle: e.target.value })}
                  />
                  <textarea
                    rows={2}
                    className="form-control"
                    style={{ marginTop: '8px' }}
                    value={config.marketingDesc}
                    onChange={(e) => onChange({ ...config, marketingDesc: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="settings-actions-footer">
              <button type="submit" className="btn-save-main" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Publicar Configurações de Cookies'}
              </button>
            </div>
          </form>
        </div>
      )}

      {subTab === 'inventory' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Categoria</th>
                <th>Provedor / Origem</th>
                <th>Finalidade</th>
                <th>Retenção</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {config.cookiesTable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty-cell">
                    Nenhum cookie cadastrado no inventário.
                  </td>
                </tr>
              ) : (
                config.cookiesTable.map((cookie) => (
                  <tr key={cookie.id}>
                    <td>
                      <code className="slug-code">{cookie.name}</code>
                    </td>
                    <td>
                      <span
                        className={`badge-tone ${
                          cookie.category === 'Necessário'
                            ? 'success'
                            : cookie.category === 'Funcional'
                              ? 'info'
                              : 'warning'
                        }`}
                      >
                        {cookie.category}
                      </span>
                    </td>
                    <td>{cookie.provider}</td>
                    <td style={{ maxWidth: '320px' }}>{cookie.purpose}</td>
                    <td>{cookie.retention}</td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn edit"
                          title="Editar cookie"
                          onClick={() => {
                            setIsNewCookie(false);
                            setEditingCookie({ ...cookie });
                          }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete"
                          title="Remover cookie"
                          onClick={() => handleDeleteCookieItem(cookie.id)}
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
      )}

      {subTab === 'logs' && (
        <>
          <div className="mini-stats-row">
            <div className="mini-stat-pill">
              <CheckCircle2 size={15} color="#059669" />
              <span>
                <strong>{totalGranted}</strong> consentimentos completos/aceitos
              </span>
            </div>
            <div className="mini-stat-pill">
              <ShieldCheck size={15} color="#0284c7" />
              <span>
                <strong>{totalEssentialOnly}</strong> apenas essenciais / revogados
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tipo de Consentimento</th>
                  <th>Status</th>
                  <th>Versão</th>
                  <th>Identificador Anônimo</th>
                  <th>Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty-cell">
                      Nenhum registro de consentimento encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredConsents.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <code className="slug-code">{c.consent_type}</code>
                      </td>
                      <td>
                        <span className={`badge-tone ${c.granted ? 'success' : 'neutral'}`}>
                          {c.granted ? 'Concedido' : 'Apenas Essenciais'}
                        </span>
                      </td>
                      <td>v{c.policy_version}</td>
                      <td>
                        <span className="table-subtext">{c.user_identifier || 'Anônimo'}</span>
                      </td>
                      <td className="tabular-nums">{formatDateTimeBR(c.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Add/Edit Cookie */}
      {editingCookie && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingCookie(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewCookie ? 'Adicionar Cookie ao Inventário' : 'Editar Cookie'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingCookie(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCookieItem} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Nome / Chave *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingCookie.name}
                    onChange={(e) => setEditingCookie({ ...editingCookie, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Categoria *</label>
                  <select
                    className="form-control"
                    value={editingCookie.category}
                    onChange={(e) => setEditingCookie({ ...editingCookie, category: e.target.value })}
                  >
                    <option value="Necessário">Necessário</option>
                    <option value="Funcional">Funcional</option>
                    <option value="Analítico">Analítico</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Provedor / Origem</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingCookie.provider}
                    onChange={(e) => setEditingCookie({ ...editingCookie, provider: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Prazo de Retenção</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingCookie.retention}
                    onChange={(e) => setEditingCookie({ ...editingCookie, retention: e.target.value })}
                    placeholder="Ex: 12 meses / Sessão"
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>Finalidade Específica *</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    required
                    value={editingCookie.purpose}
                    onChange={(e) => setEditingCookie({ ...editingCookie, purpose: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingCookie(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Cookie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
