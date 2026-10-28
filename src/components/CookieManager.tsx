import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cookie, Check, X, Sliders, Info, Lock, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface CookiePreferences {
  version: string;
  timestamp: string;
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

const DEFAULT_PREFS: CookiePreferences = {
  version: '2.0',
  timestamp: '',
  essential: true,
  analytics: false,
  functional: false,
  marketing: false,
};

export const CookieManager: React.FC = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'preferences' | 'cookies_table'>('preferences');
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS);
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lgpd_cookie_preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrefs(parsed);
      } catch {
        setIsBannerVisible(true);
      }
    } else {
      setIsBannerVisible(true);
    }

    // Ouvinte para reabrir as configurações de cookies a partir do rodapé ou de outros links
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('open-cookie-preferences', handleOpenModal);
    return () => {
      window.removeEventListener('open-cookie-preferences', handleOpenModal);
    };
  }, []);

  const savePreferences = async (newPrefs: CookiePreferences) => {
    const updated = {
      ...newPrefs,
      essential: true, // Essenciais sempre ativos
      timestamp: new Date().toISOString(),
      version: '2.0'
    };

    localStorage.setItem('lgpd_cookie_preferences', JSON.stringify(updated));
    localStorage.setItem('lgpd_cookie_consent', updated.analytics ? 'all' : 'essential');

    // Se o usuário revogar os cookies funcionais, remove estados persistentes opcionais de formulários
    if (!updated.functional) {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('mh_form_state')) {
            localStorage.removeItem(key);
          }
        });
      } catch {
        // Ignora erro de acesso ao storage
      }
    }

    setPrefs(updated);
    setIsBannerVisible(false);
    setIsModalOpen(false);

    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3500);

    // Registro de Consentimento para fins de comprovação LGPD (Accountability)
    try {
      await supabase.from('consent_records').insert({
        consent_type: updated.analytics ? 'cookies_analytics_granted' : 'cookies_essenciais_only',
        granted: true,
        policy_version: '2.0',
        user_agent: navigator.userAgent
      });
    } catch {
      // Falha silenciosa em caso de offline
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      version: '2.0',
      timestamp: '',
      essential: true,
      analytics: true,
      functional: true,
      marketing: true
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      version: '2.0',
      timestamp: '',
      essential: true,
      analytics: false,
      functional: false,
      marketing: false
    });
  };

  const cookiesList = [
    {
      name: 'lgpd_cookie_preferences',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Necessário',
      purpose: 'Armazena a escolha de consentimento e as preferências granulares de cookies do titular (Art. 8º LGPD).',
      retention: '12 meses'
    },
    {
      name: 'lgpd_cookie_consent',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Necessário',
      purpose: 'Registro simplificado do estado de consentimento do usuário para controle de exibição do banner.',
      retention: '12 meses'
    },
    {
      name: 'mh_sec_seed',
      provider: 'Mascârello Haus (sessionStorage)',
      category: 'Necessário',
      purpose: 'Semente criptográfica efêmera (SHA-256) gerada por sessão para cálculo de hash anônimo anti-abuso sem armazenar o IP real do visitante.',
      retention: 'Sessão (expira ao fechar a aba)'
    },
    {
      name: 'mh_rl_contato / mh_rl_lgpd_central / mh_rl_canal_denuncias / mh_rl_questionario_conformidade',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Necessário',
      purpose: 'Controle de limite de requisições (Rate Limiting) e prevenção contra ataques automatizados de força bruta ou spam nos formulários.',
      retention: '10 a 15 minutos'
    },
    {
      name: 'sb-iwzimemdxchmcrvlyhxg-auth-token',
      provider: 'Supabase Inc. (localStorage / Cookie)',
      category: 'Necessário',
      purpose: 'Autenticação e manutenção de sessão criptografada exclusivamente para acesso restrito ao painel de administração.',
      retention: 'Sessão administrativa'
    },
    {
      name: '_vercel_jwt / __vercel_live_token',
      provider: 'Vercel Inc. (HTTP Cookie)',
      category: 'Necessário',
      purpose: 'Balanceamento de carga, roteamento seguro na borda (Edge Network) e mitigação contra ataques distribuídos de negação de serviço (DDoS).',
      retention: 'Sessão'
    },
    {
      name: 'mh_draft_questionario_conformidade_v2 / mh_form_state_questionario_conformidade_v2',
      provider: 'Mascârello Haus (sessionStorage / localStorage)',
      category: 'Funcional',
      purpose: 'Preserva o progresso e rascunho das 6 etapas do Questionário de Conformidade para Fornecedores, evitando perda acidental de preenchimento.',
      retention: 'Sessão / até 7 dias ou envio'
    },
    {
      name: 'mh_draft_central_lgpd',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Funcional',
      purpose: 'Preserva temporariamente no navegador do próprio usuário o rascunho da Requisição de Direitos do Titular (Art. 18 LGPD) até o envio.',
      retention: 'Até o envio ou limpeza pelo titular'
    },
    {
      name: 'mh_draft_canal_denuncias',
      provider: 'Mascârello Haus (localStorage)',
      category: 'Funcional',
      purpose: 'Armazena localmente o relato em andamento no Canal de Denúncias (somente quando o próprio usuário ativa a opção "Salvar rascunho neste navegador").',
      retention: '7 dias ou até o envio/exclusão'
    },
    {
      name: 'NID / CONSENT (Google Maps Embed)',
      provider: 'Google LLC (Terceiro — Página de Contato)',
      category: 'Funcional',
      purpose: 'Carregamento e exibição interativa dos mapas de localização dos escritórios de Videira/SC e Caçador/SC na página de Contato.',
      retention: '6 meses / Sessão'
    },
    {
      name: '_ga',
      provider: 'Google Analytics (com IP anonimizado)',
      category: 'Analítico',
      purpose: 'Distinção estatística de visitantes anônimos para compilação de relatórios agregados de audiência (somente mediante consentimento).',
      retention: '2 anos'
    },
    {
      name: '_ga_*',
      provider: 'Google Analytics (com IP anonimizado)',
      category: 'Analítico',
      purpose: 'Persistência desidentificada do estado de sessão para métricas agregadas de navegação (somente mediante consentimento).',
      retention: '2 anos'
    }
  ];

  return (
    <>
      {/* Toast de Confirmação de Salvamento */}
      {isSavedToast && (
        <div className="cookie-saved-toast">
          <Check size={18} />
          <span>Suas preferências de privacidade foram atualizadas com sucesso!</span>
        </div>
      )}

      {/* Botão Flutuante Permanente no Canto Inferior Esquerdo (Acesso Contínuo ANPD) */}
      <button
        className="cookie-floating-toggle"
        onClick={() => setIsModalOpen(true)}
        title="Gerenciar Preferências de Cookies e Privacidade (LGPD)"
        aria-label="Gerenciar Cookies"
      >
        <Cookie size={20} />
        <span className="cookie-floating-text">Cookies</span>
      </button>

      {/* Banner Inicial de Consentimento (ANPD Compliance) */}
      {isBannerVisible && (
        <div className="cookie-banner-wrapper" role="region" aria-label="Aviso de Cookies e Privacidade">
          <div className="container cookie-banner-content">
            <div className="cookie-banner-info">
              <div className="cookie-banner-header">
                <Shield size={20} className="cookie-shield-icon" />
                <h4 className="cookie-banner-title">Privacidade e Gestão de Cookies</h4>
              </div>
              <p className="cookie-banner-description">
                O escritório <strong>Mascârello Haus Advocacia</strong> utiliza cookies estritamente necessários para o funcionamento e segurança do site. Com o seu consentimento livre e informado, também poderemos utilizar cookies analíticos e funcionais para compreender a interação dos usuários e aprimorar nossos serviços digitais, em observância à <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong> e ao <strong>Guia de Cookies da ANPD</strong>.
              </p>
              <div className="cookie-banner-links">
                <Link to="/central-de-protecao-de-dados/">Central de Proteção de Dados</Link>
                <span>•</span>
                <button type="button" className="cookie-link-button" onClick={() => { setModalTab('cookies_table'); setIsModalOpen(true); }}>
                  Tabela Completa de Cookies
                </button>
              </div>
            </div>

            <div className="cookie-banner-buttons">
              <button
                type="button"
                className="btn-cookie-action btn-manage"
                onClick={() => { setModalTab('preferences'); setIsModalOpen(true); }}
              >
                <Sliders size={15} /> Personalizar
              </button>
              <button
                type="button"
                className="btn-cookie-action btn-reject"
                onClick={handleRejectNonEssential}
              >
                Rejeitar Opcionais
              </button>
              <button
                type="button"
                className="btn-cookie-action btn-accept-all"
                onClick={handleAcceptAll}
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão Detalhada de Cookies */}
      {isModalOpen && (
        <div className="cookie-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-heading">
          <div className="cookie-modal-box">
            <div className="cookie-modal-top">
              <div className="cookie-modal-heading-wrap">
                <Cookie size={24} className="cookie-modal-icon" />
                <div>
                  <h3 id="cookie-modal-heading">Centro de Preferências de Cookies</h3>
                  <p className="cookie-modal-sub">Mascârello Haus Advocacia & Consultoria Jurídica</p>
                </div>
              </div>
              <button
                type="button"
                className="cookie-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Abas do Modal */}
            <div className="cookie-modal-tabs">
              <button
                type="button"
                className={`cookie-tab-btn ${modalTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setModalTab('preferences')}
              >
                <Sliders size={16} /> Categorias de Consentimento
              </button>
              <button
                type="button"
                className={`cookie-tab-btn ${modalTab === 'cookies_table' ? 'active' : ''}`}
                onClick={() => setModalTab('cookies_table')}
              >
                <Info size={16} /> Lista Detalhada de Cookies Utilizados
              </button>
            </div>

            {/* Conteúdo da Aba 1: Preferências por Categoria */}
            {modalTab === 'preferences' && (
              <div className="cookie-modal-body">
                <p className="cookie-modal-intro">
                  Respeitamos o seu direito à privacidade. Você pode optar por não permitir alguns tipos de cookies. Clique nos títulos das diferentes categorias para saber mais e definir suas preferências. Lembre-se que o bloqueio de certos cookies pode impactar a sua experiência de navegação.
                </p>

                {/* Categoria 1: Necessários */}
                <div className="cookie-category-item">
                  <div className="cookie-category-header">
                    <div>
                      <div className="category-title-flex">
                        <h4>Cookies Estritamente Necessários</h4>
                        <span className="badge-required">Sempre Ativos</span>
                      </div>
                      <p className="cookie-category-text">
                        Estes cookies são fundamentais para o funcionamento do site e não podem ser desativados nos nossos sistemas. Eles são geralmente configurados em resposta a ações suas, como definir suas preferências de privacidade, iniciar sessão administrativa ou preencher formulários de envio seguro.
                      </p>
                    </div>
                    <div className="toggle-switch disabled">
                      <input type="checkbox" checked={true} disabled aria-label="Cookies Necessários (Sempre ativos)" />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                </div>

                {/* Categoria 2: Analíticos */}
                <div className="cookie-category-item">
                  <div className="cookie-category-header">
                    <div>
                      <div className="category-title-flex">
                        <h4>Cookies Analíticos e de Desempenho</h4>
                        <span className="badge-optional">Opcional</span>
                      </div>
                      <p className="cookie-category-text">
                        Permitem contabilizar visitas e fontes de tráfego de maneira anônima e agregada, para que possamos medir e melhorar o desempenho e a estrutura informativa do site. Todas as informações que estes cookies recolhem são desidentificadas e não identificam diretamente o titular.
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={prefs.analytics}
                        onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                        aria-label="Ativar Cookies Analíticos"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Categoria 3: Funcionais */}
                <div className="cookie-category-item">
                  <div className="cookie-category-header">
                    <div>
                      <div className="category-title-flex">
                        <h4>Cookies de Funcionalidade</h4>
                        <span className="badge-optional">Opcional</span>
                      </div>
                      <p className="cookie-category-text">
                        Estes cookies permitem que o site forneça funcionalidade e personalização aprimoradas, como lembrar seus rascunhos em questionários de conformidade, modo de exibição preferido e preenchimento ágil de formulários.
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={prefs.functional}
                        onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                        aria-label="Ativar Cookies de Funcionalidade"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Categoria 4: Marketing */}
                <div className="cookie-category-item">
                  <div className="cookie-category-header">
                    <div>
                      <div className="category-title-flex">
                        <h4>Cookies de Comunicação & Marketing</h4>
                        <span className="badge-optional">Opcional</span>
                      </div>
                      <p className="cookie-category-text">
                        Podem ser utilizados eventualmente para medir a eficácia de publicações, campanhas institucionais e compartilhamento de materiais educativos como cartilhas e e-books jurídicos.
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={prefs.marketing}
                        onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                        aria-label="Ativar Cookies de Marketing"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Conteúdo da Aba 2: Tabela de Cookies */}
            {modalTab === 'cookies_table' && (
              <div className="cookie-modal-body">
                <p className="cookie-modal-intro">
                  Abaixo está a relação transparente de cada identificador de rastreamento e armazenamento utilizado em nossa plataforma, em consonância com as exigências de clareza da ANPD:
                </p>

                <div className="cookie-table-wrapper">
                  <table className="cookie-table">
                    <thead>
                      <tr>
                        <th>Nome do Cookie / Storage</th>
                        <th>Categoria</th>
                        <th>Fornecedor / Domínio</th>
                        <th>Finalidade</th>
                        <th>Retenção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookiesList.map((item, idx) => (
                        <tr key={idx}>
                          <td><code>{item.name}</code></td>
                          <td>
                            <span className={`pill-category ${item.category === 'Necessário' ? 'req' : 'opt'}`}>
                              {item.category}
                            </span>
                          </td>
                          <td>{item.provider}</td>
                          <td>{item.purpose}</td>
                          <td><strong>{item.retention}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Rodapé do Modal */}
            <div className="cookie-modal-footer">
              <div className="footer-links-wrap">
                <Link to="/central-de-protecao-de-dados/" onClick={() => setIsModalOpen(false)}>
                  Aviso de Privacidade Completo
                </Link>
              </div>

              <div className="footer-actions-wrap">
                <button
                  type="button"
                  className="btn-modal-action btn-reject-all"
                  onClick={handleRejectNonEssential}
                >
                  Rejeitar Opcionais
                </button>
                <button
                  type="button"
                  className="btn-modal-action btn-save-prefs"
                  onClick={() => savePreferences(prefs)}
                >
                  Salvar Minhas Preferências
                </button>
                <button
                  type="button"
                  className="btn-modal-action btn-accept-modal"
                  onClick={handleAcceptAll}
                >
                  Aceitar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS do Sistema de Cookies */}
      <style>{`
        /* Botão Flutuante Permanente */
        .cookie-floating-toggle {
          position: fixed;
          bottom: 24px;
          left: 24px;
          background: #182c44;
          color: #c5a880;
          border: 2px solid #c5a880;
          border-radius: 50px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          z-index: 9998;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          transition: all 0.25s ease;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .cookie-floating-toggle:hover {
          background: #c5a880;
          color: #182c44;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(197, 168, 128, 0.35);
        }
        .cookie-floating-text {
          display: inline-block;
        }

        /* Toast Feedback */
        .cookie-saved-toast {
          position: fixed;
          bottom: 90px;
          left: 24px;
          background: #276749;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 500;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          animation: toastSlideUp 0.3s ease;
        }
        @keyframes toastSlideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Banner Inicial */
        .cookie-banner-wrapper {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.15);
          border-top: 3px solid var(--color-accent);
          z-index: 9999;
          padding: 22px 0;
          animation: bannerSlideUp 0.3s ease;
        }
        @keyframes bannerSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .cookie-banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 35px;
        }
        .cookie-banner-info {
          flex: 1;
        }
        .cookie-banner-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .cookie-shield-icon {
          color: var(--color-accent);
        }
        .cookie-banner-title {
          margin: 0;
          font-size: 1.15rem;
          color: var(--color-primary);
          font-family: var(--font-serif);
        }
        .cookie-banner-description {
          font-size: 0.9rem;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 10px;
        }
        .cookie-banner-links {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.84rem;
        }
        .cookie-banner-links a, .cookie-link-button {
          color: var(--color-accent);
          text-decoration: underline;
          font-weight: 600;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }
        .cookie-banner-buttons {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        .btn-cookie-action {
          padding: 11px 20px;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .btn-manage {
          background: #edf2f7;
          border: 1px solid #cbd5e0;
          color: #2d3748;
        }
        .btn-manage:hover {
          background: #e2e8f0;
        }
        .btn-reject {
          background: #ffffff;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
        }
        .btn-reject:hover {
          background: #f7fafc;
          border-color: #000;
        }
        .btn-accept-all {
          background: var(--color-primary);
          border: 1px solid var(--color-primary);
          color: #ffffff;
        }
        .btn-accept-all:hover {
          background: var(--color-primary-dark);
        }

        /* Modal de Gestão */
        .cookie-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          box-sizing: border-box;
        }
        .cookie-modal-box {
          background: #ffffff;
          width: 100%;
          max-width: 820px;
          max-height: 90vh;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalScaleUp 0.25s ease;
        }
        @keyframes modalScaleUp {
          from {
            transform: scale(0.96);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .cookie-modal-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 28px;
          border-bottom: 1px solid #e2e8f0;
          background: #fafbfc;
        }
        .cookie-modal-heading-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .cookie-modal-icon {
          color: var(--color-accent);
        }
        .cookie-modal-top h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--color-primary);
          font-family: var(--font-serif);
        }
        .cookie-modal-sub {
          margin: 2px 0 0 0;
          font-size: 0.8rem;
          color: #718096;
        }
        .cookie-modal-close {
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          display: flex;
          padding: 6px;
          border-radius: 4px;
        }
        .cookie-modal-close:hover {
          color: #e53e3e;
          background: #edf2f7;
        }
        .cookie-modal-tabs {
          display: flex;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 20px;
        }
        .cookie-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 20px;
          border: none;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }
        .cookie-tab-btn:hover {
          color: var(--color-primary);
        }
        .cookie-tab-btn.active {
          color: var(--color-primary);
          font-weight: 600;
          border-bottom-color: var(--color-accent);
          background: #ffffff;
        }
        .cookie-modal-body {
          padding: 24px 28px;
          overflow-y: auto;
          flex-grow: 1;
        }
        .cookie-modal-intro {
          font-size: 0.9rem;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 22px;
        }
        .cookie-category-item {
          background: #fafbfc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 18px 20px;
          margin-bottom: 16px;
        }
        .cookie-category-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }
        .category-title-flex {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .category-title-flex h4 {
          margin: 0;
          font-size: 1.05rem;
          color: var(--color-primary);
        }
        .badge-required {
          background: #e2e8f0;
          color: #2d3748;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }
        .badge-optional {
          background: #feebc8;
          color: #744210;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }
        .cookie-category-text {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Toggle Switches */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
          flex-shrink: 0;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.3s;
          border-radius: 34px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
        input:checked + .toggle-slider {
          background-color: var(--color-primary);
        }
        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }
        .toggle-switch.disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }
        .toggle-switch.disabled .toggle-slider {
          background-color: var(--color-accent);
          cursor: not-allowed;
        }

        /* Tabela de Cookies */
        .cookie-table-wrapper {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }
        .cookie-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
          text-align: left;
        }
        .cookie-table th {
          background: #f8fafc;
          padding: 12px 14px;
          color: var(--color-primary);
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
        }
        .cookie-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #edf2f7;
          color: #334155;
          vertical-align: middle;
        }
        .pill-category {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .pill-category.req {
          background: #e2e8f0;
          color: #1e293b;
        }
        .pill-category.opt {
          background: #e0f2fe;
          color: #0369a1;
        }

        /* Modal Footer */
        .cookie-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 28px;
          border-top: 1px solid #e2e8f0;
          background: #fafbfc;
          gap: 15px;
        }
        .footer-links-wrap a {
          color: var(--color-accent);
          font-size: 0.84rem;
          font-weight: 600;
          text-decoration: underline;
        }
        .footer-actions-wrap {
          display: flex;
          gap: 10px;
        }
        .btn-modal-action {
          padding: 10px 18px;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reject-all {
          background: #ffffff;
          border: 1px solid #cbd5e0;
          color: #475569;
        }
        .btn-reject-all:hover {
          background: #f1f5f9;
        }
        .btn-save-prefs {
          background: #edf2f7;
          border: 1px solid var(--color-accent);
          color: var(--color-primary);
        }
        .btn-save-prefs:hover {
          background: var(--color-accent);
          color: #ffffff;
        }
        .btn-accept-modal {
          background: var(--color-primary);
          border: 1px solid var(--color-primary);
          color: #ffffff;
        }
        .btn-accept-modal:hover {
          background: var(--color-primary-dark);
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .cookie-banner-content {
            flex-direction: column;
            gap: 18px;
          }
          .cookie-banner-buttons {
            width: 100%;
            flex-direction: column;
          }
          .btn-cookie-action {
            width: 100%;
            justify-content: center;
          }
          .cookie-floating-toggle {
            bottom: 16px;
            left: 16px;
            padding: 8px 14px;
          }
          .cookie-floating-text {
            display: none;
          }
          .cookie-modal-footer {
            flex-direction: column;
            align-items: stretch;
          }
          .footer-actions-wrap {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};
