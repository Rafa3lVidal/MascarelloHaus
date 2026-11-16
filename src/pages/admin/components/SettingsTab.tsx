import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Share2,
  ShieldCheck,
  KeyRound,
  Save,
  Download,
  ExternalLink,
  Mail,
  MessageCircle,
  Sliders,
  Cookie,
  Database,
  Scale,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  DashboardTab,
  ROLE_LABELS,
  SiteSettingsState,
  UserProfile,
  formatFriendlyError,
} from '../types';

export type SettingsSectionKey = 'general' | 'home' | 'social' | 'account' | 'system';

interface SettingsTabProps {
  initialSection?: SettingsSectionKey;
  siteSettings: SiteSettingsState;
  profile: UserProfile | null;
  userEmail: string;
  mfaEnabled: boolean;
  currentUserId?: string;
  onChange: (next: SiteSettingsState) => void;
  onNavigateTab: (tab: DashboardTab) => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  initialSection = 'general',
  siteSettings,
  profile,
  userEmail,
  mfaEnabled,
  currentUserId,
  onChange,
  onNavigateTab,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [section, setSection] = useState<SettingsSectionKey>(initialSection);
  const [savingSettings, setSavingSettings] = useState(false);

  // Profile name state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleUpdateProfileName = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    if (cleanName.length < 2) {
      onShowToast('error', 'Informe um nome de usuário válido.');
      return;
    }

    setUpdatingProfile(true);
    try {
      if (currentUserId) {
        const { error: profErr } = await supabase
          .from('profiles')
          .update({ full_name: cleanName, updated_at: new Date().toISOString() })
          .eq('id', currentUserId);
        if (profErr) throw profErr;
      }

      await supabase.auth.updateUser({ data: { full_name: cleanName } });
      await onAudit('UPDATE', 'profiles', currentUserId || userEmail, { full_name: profile?.full_name }, { full_name: cleanName });
      onShowToast('success', 'Nome do usuário atualizado com sucesso!');
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível atualizar o nome do usuário.'));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const generalData = {
        site_name: siteSettings.site_name.trim(),
        tagline: siteSettings.tagline.trim(),
        whatsapp: siteSettings.whatsapp.trim(),
        contact_email: siteSettings.contact_email.trim(),
        dpo_email: siteSettings.dpo_email.trim(),
        address: siteSettings.address.trim(),
        instagram_url: siteSettings.instagram_url.trim(),
        linkedin_url: siteSettings.linkedin_url.trim(),
        youtube_url: siteSettings.youtube_url.trim(),
        facebook_url: siteSettings.facebook_url.trim(),
      };

      const homeData = {
        banner_title: siteSettings.banner_title.trim(),
        banner_subtitle: siteSettings.banner_subtitle.trim(),
        assessoria_title: siteSettings.assessoria_title.trim(),
        assessoria_subtitle: siteSettings.assessoria_subtitle.trim(),
      };

      const nowIso = new Date().toISOString();
      const [resGen, resHome] = await Promise.all([
        supabase.from('site_settings').upsert({
          key: 'general',
          value_json: generalData,
          updated_by: currentUserId || null,
          updated_at: nowIso,
        }),
        supabase.from('site_settings').upsert({
          key: 'home_content',
          value_json: homeData,
          updated_by: currentUserId || null,
          updated_at: nowIso,
        }),
      ]);

      if (resGen.error) throw resGen.error;
      if (resHome.error) throw resHome.error;

      await onAudit('UPDATE', 'site_settings', 'general+home_content', null, {
        general: generalData,
        home_content: homeData,
      });
      onShowToast('success', 'Configurações salvas e publicadas no site com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      onShowToast('error', formatFriendlyError(err, 'Não foi possível salvar as configurações.'));
    } finally {
      setSavingSettings(false);
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
      await onAudit('UPDATE', 'auth.users', currentUserId || userEmail, null, { action: 'password_changed' });
      onShowToast('success', 'Senha de acesso atualizada com sucesso!');
      await onRefresh();
    } catch (err: any) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível alterar a senha.'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleExportSettingsBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      exportedBy: userEmail,
      siteSettings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-configuracoes-mascarello-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('success', 'Backup das configurações exportado em JSON!');
  };

  const MENU_ITEMS: { key: SettingsSectionKey; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'Geral & Contato', desc: 'Identidade, endereço e canais', icon: Building2 },
    { key: 'home', label: 'Textos da Home', desc: 'Banner e chamadas principais', icon: Globe },
    { key: 'social', label: 'Redes Sociais', desc: 'Instagram, LinkedIn, YouTube', icon: Share2 },
    { key: 'account', label: 'Conta & Segurança', desc: 'Perfil, senha e 2FA', icon: KeyRound },
    { key: 'system', label: 'Sistema & Suporte', desc: 'Atalhos LGPD, backup e ApexCode', icon: Sliders },
  ];

  return (
    <div className="settings-hub-layout">
      {/* Left Vertical Settings Menu */}
      <aside className="settings-hub-nav" aria-label="Menu de configurações">
        <div className="settings-hub-nav-header">
          <span>Preferências</span>
          <small>Gerencie site, conta e sistema</small>
        </div>
        <div className="settings-hub-nav-list">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={`settings-hub-nav-btn ${active ? 'active' : ''}`}
                onClick={() => setSection(item.key)}
              >
                <span className="settings-hub-nav-icon">
                  <Icon size={17} />
                </span>
                <span className="settings-hub-nav-text">
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right Settings Content Panel */}
      <div className="settings-hub-content">
        {(section === 'general' || section === 'home' || section === 'social') && (
          <form onSubmit={handleSaveSiteSettings} className="settings-form-container">
            {section === 'general' && (
              <div className="settings-section">
                <h3 className="settings-section-title">
                  <Building2 size={18} /> Identidade Institucional & Canais de Contato
                </h3>
                <p className="settings-section-desc">
                  Informações gerais exibidas em metadados, rodapé, página de contato e comunicações oficiais.
                </p>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Nome do Escritório</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.site_name}
                      onChange={(e) => onChange({ ...siteSettings, site_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tagline / Slogan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.tagline}
                      onChange={(e) => onChange({ ...siteSettings, tagline: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Oficial de Atendimento</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.whatsapp}
                      onChange={(e) => onChange({ ...siteSettings, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail de Contato Geral</label>
                    <input
                      type="email"
                      className="form-control"
                      value={siteSettings.contact_email}
                      onChange={(e) => onChange({ ...siteSettings, contact_email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>E-mail do DPO / Privacidade (LGPD)</label>
                    <input
                      type="email"
                      className="form-control"
                      value={siteSettings.dpo_email}
                      onChange={(e) => onChange({ ...siteSettings, dpo_email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Endereço Físico</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.address}
                      onChange={(e) => onChange({ ...siteSettings, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {section === 'home' && (
              <div className="settings-section">
                <h3 className="settings-section-title">
                  <Globe size={18} /> Textos em Destaque da Página Inicial (Home)
                </h3>
                <p className="settings-section-desc">
                  Personalize as manchetes e chamadas principais exibidas para visitantes e clientes na Home.
                </p>

                <div className="form-group">
                  <label>Frase de Destaque / Título Principal do Banner</label>
                  <input
                    type="text"
                    className="form-control"
                    value={siteSettings.banner_title}
                    onChange={(e) => onChange({ ...siteSettings, banner_title: e.target.value })}
                    placeholder="Ex: Direito Empresarial, Civil, Trabalho e Previdenciário"
                  />
                </div>

                <div className="form-group">
                  <label>Subtítulo / Descrição do Banner</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={siteSettings.banner_subtitle}
                    onChange={(e) => onChange({ ...siteSettings, banner_subtitle: e.target.value })}
                    placeholder="Descrição explicativa abaixo do título do banner"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Título da Seção de Assessoria Empresarial</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.assessoria_title}
                      onChange={(e) => onChange({ ...siteSettings, assessoria_title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtítulo da Seção de Assessoria</label>
                    <input
                      type="text"
                      className="form-control"
                      value={siteSettings.assessoria_subtitle}
                      onChange={(e) => onChange({ ...siteSettings, assessoria_subtitle: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {section === 'social' && (
              <div className="settings-section">
                <h3 className="settings-section-title">
                  <Share2 size={18} /> Links Oficiais de Redes Sociais
                </h3>
                <p className="settings-section-desc">
                  Endereços exibidos no cabeçalho, rodapé e cartões institucionais do portal.
                </p>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Instagram Oficial (URL Completa)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={siteSettings.instagram_url}
                      onChange={(e) => onChange({ ...siteSettings, instagram_url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Oficial (URL Completa)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={siteSettings.linkedin_url}
                      onChange={(e) => onChange({ ...siteSettings, linkedin_url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>YouTube Oficial (URL Completa)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={siteSettings.youtube_url}
                      onChange={(e) => onChange({ ...siteSettings, youtube_url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Facebook Oficial (URL Completa)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={siteSettings.facebook_url}
                      onChange={(e) => onChange({ ...siteSettings, facebook_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="settings-actions-footer">
              <button type="submit" className="btn-save-main" disabled={savingSettings}>
                <Save size={16} /> {savingSettings ? 'Salvando...' : 'Salvar e Publicar Alterações'}
              </button>
            </div>
          </form>
        )}

        {section === 'account' && (
          <div className="settings-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="settings-section">
              <h3 className="settings-section-title">
                <ShieldCheck size={18} /> Perfil de Acesso & Autenticação Multifator (2FA)
              </h3>
              <div className="detail-info-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <small>Nome do Usuário</small>
                  <strong>{profile?.full_name || userEmail}</strong>
                </div>
                <div>
                  <small>E-mail de Acesso</small>
                  <strong>{profile?.email || userEmail}</strong>
                </div>
                <div>
                  <small>Nível de Permissão</small>
                  <span className="badge-tone info">
                    {profile?.role ? ROLE_LABELS[profile.role] || profile.role : 'Administrador'}
                  </span>
                </div>
                <div>
                  <small>Verificação em Duas Etapas (2FA)</small>
                  <span className={`badge-tone ${mfaEnabled ? 'success' : 'warning'}`}>
                    {mfaEnabled ? (
                      <>
                        <CheckCircle2 size={12} /> Ativa
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} /> Pendente
                      </>
                    )}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfileName} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                  <label>Editar Nome do Usuário</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Mirataira"
                  />
                </div>
                <button type="submit" className="btn-save-main" disabled={updatingProfile}>
                  <Save size={15} /> {updatingProfile ? 'Salvando...' : 'Salvar Nome'}
                </button>
              </form>

              <button
                type="button"
                className="btn-outline-admin"
                onClick={() => onNavigateTab('audit')}
              >
                <KeyRound size={15} /> Gerenciar Aplicativo Autenticador (2FA) & Trilha de Auditoria
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <KeyRound size={18} /> Alterar Senha de Acesso
              </h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-grid-2">
                  <div className="form-group">
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
                  <div className="form-group">
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
                <div className="settings-actions-footer" style={{ marginTop: '12px' }}>
                  <button type="submit" className="btn-save-main" disabled={updatingPassword}>
                    <Save size={15} /> {updatingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {section === 'system' && (
          <div className="settings-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="settings-section">
              <h3 className="settings-section-title">
                <Sliders size={18} /> Central de Atalhos de Governança & Backup
              </h3>
              <p className="settings-section-desc">
                Acesse rapidamente os módulos regulatórios da LGPD ou exporte uma cópia de segurança das configurações gerais do portal.
              </p>

              <div className="settings-shortcuts-grid">
                <button type="button" className="settings-shortcut-card" onClick={() => onNavigateTab('cookies')}>
                  <Cookie size={20} />
                  <div>
                    <strong>Banner de Cookies & Consentimentos</strong>
                    <small>Categorias, tabela de transparência e logs</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
                <button type="button" className="settings-shortcut-card" onClick={() => onNavigateTab('governance')}>
                  <Database size={20} />
                  <div>
                    <strong>ROPA, RIPD, Operadores & DPO</strong>
                    <small>Inventário Art. 37, incidentes e retenção</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
                <button type="button" className="settings-shortcut-card" onClick={() => onNavigateTab('legal_docs')}>
                  <Scale size={20} />
                  <div>
                    <strong>Política de Privacidade & Termos</strong>
                    <small>Editor versionado com histórico imutável</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
                <button type="button" className="settings-shortcut-card" onClick={handleExportSettingsBackup}>
                  <Download size={20} />
                  <div>
                    <strong>Exportar Backup (JSON)</strong>
                    <small>Baixar configurações institucionais atuais</small>
                  </div>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <ShieldCheck size={18} /> Suporte Técnico, Desenvolvimento & LGPD — ApexCode
              </h3>
              <p className="settings-section-desc">
                Plataforma administrativa desenvolvida, mantida e suportada pela <strong>ApexCode</strong> em conformidade com a Lei nº 13.709/2018 (LGPD).
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
                <a href="mailto:contato@apexcode.dev.br" className="btn-outline-admin">
                  <Mail size={14} /> E-mail / LGPD: contato@apexcode.dev.br
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
