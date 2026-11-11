import React, { useState } from 'react';
import { Globe, MessageSquare, Save, Building2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SiteSettingsState } from '../types';

interface SiteContentTabProps {
  siteSettings: SiteSettingsState;
  onChange: (next: SiteSettingsState) => void;
  currentUserId?: string;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

export const SiteContentTab: React.FC<SiteContentTabProps> = ({
  siteSettings,
  onChange,
  currentUserId,
  onShowToast,
  onAudit,
}) => {
  const [savingSettings, setSavingSettings] = useState(false);

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
      onShowToast('success', 'Conteúdos e configurações do site salvos com sucesso!');
    } catch (err: any) {
      console.error('Erro ao salvar conteúdos:', err);
      onShowToast('error', err.message || 'Erro ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="settings-form-container">
      <form onSubmit={handleSaveSiteSettings}>
        <div className="settings-section">
          <h3 className="settings-section-title">
            <Building2 size={18} /> Identidade Institucional
          </h3>
          <p className="settings-section-desc">
            Informações gerais exibidas em metadados, rodapé e comunicações institucionais.
          </p>

          <div className="form-row">
            <div className="form-group col-6">
              <label>Nome do Escritório</label>
              <input
                type="text"
                className="form-control"
                value={siteSettings.site_name}
                onChange={(e) => onChange({ ...siteSettings, site_name: e.target.value })}
              />
            </div>
            <div className="form-group col-6">
              <label>Tagline / Slogan</label>
              <input
                type="text"
                className="form-control"
                value={siteSettings.tagline}
                onChange={(e) => onChange({ ...siteSettings, tagline: e.target.value })}
              />
            </div>
          </div>
        </div>

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

          <div className="form-row">
            <div className="form-group col-6">
              <label>Título da Seção de Assessoria Empresarial</label>
              <input
                type="text"
                className="form-control"
                value={siteSettings.assessoria_title}
                onChange={(e) => onChange({ ...siteSettings, assessoria_title: e.target.value })}
              />
            </div>
            <div className="form-group col-6">
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

        <div className="settings-section">
          <h3 className="settings-section-title">
            <MessageSquare size={18} /> Informações de Contato, DPO & Redes Sociais
          </h3>

          <div className="form-row">
            <div className="form-group col-6">
              <label>WhatsApp Oficial de Atendimento</label>
              <input
                type="text"
                className="form-control"
                value={siteSettings.whatsapp}
                onChange={(e) => onChange({ ...siteSettings, whatsapp: e.target.value })}
              />
            </div>
            <div className="form-group col-6">
              <label>E-mail de Contato Geral</label>
              <input
                type="email"
                className="form-control"
                value={siteSettings.contact_email}
                onChange={(e) => onChange({ ...siteSettings, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-6">
              <label>E-mail do DPO / Privacidade (LGPD)</label>
              <input
                type="email"
                className="form-control"
                value={siteSettings.dpo_email}
                onChange={(e) => onChange({ ...siteSettings, dpo_email: e.target.value })}
              />
            </div>
            <div className="form-group col-6">
              <label>Endereço Físico</label>
              <input
                type="text"
                className="form-control"
                value={siteSettings.address}
                onChange={(e) => onChange({ ...siteSettings, address: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-6">
              <label>Instagram Oficial (URL Completa)</label>
              <input
                type="url"
                className="form-control"
                value={siteSettings.instagram_url}
                onChange={(e) => onChange({ ...siteSettings, instagram_url: e.target.value })}
              />
            </div>
            <div className="form-group col-6">
              <label>LinkedIn Oficial (URL Completa)</label>
              <input
                type="url"
                className="form-control"
                value={siteSettings.linkedin_url}
                onChange={(e) => onChange({ ...siteSettings, linkedin_url: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-6">
              <label>YouTube Oficial (URL Completa)</label>
              <input
                type="url"
                className="form-control"
                value={siteSettings.youtube_url}
                onChange={(e) => onChange({ ...siteSettings, youtube_url: e.target.value })}
              />
            </div>
            <div className="form-group col-6">
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

        <div className="form-actions-bar">
          <button type="submit" className="btn-save-main" disabled={savingSettings}>
            <Save size={16} /> {savingSettings ? 'Gravando...' : 'Salvar Conteúdos do Site'}
          </button>
        </div>
      </form>
    </div>
  );
};
