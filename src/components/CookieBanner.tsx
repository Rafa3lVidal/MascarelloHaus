import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = async (type: 'all' | 'essential') => {
    localStorage.setItem('lgpd_cookie_consent', type);
    setIsVisible(false);

    try {
      await supabase.from('consent_records').insert({
        consent_type: type === 'all' ? 'cookies_analytics' : 'cookies_essenciais',
        granted: true,
        policy_version: '1.0',
        user_agent: navigator.userAgent,
      });
    } catch {
      // Silencioso se falhar offline
    }
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay" role="region" aria-label="Aviso de Privacidade e Cookies">
      <div className="container cookie-banner-box">
        <div className="cookie-banner-text">
          <div className="cookie-title">
            <Shield size={18} className="cookie-icon" />
            <strong>Privacidade e Cookies</strong>
          </div>
          <p>
            O escritório <strong>Mascârello Haus Advocacia</strong> utiliza cookies estritamente necessários para o funcionamento seguro deste site e, com o seu consentimento, cookies analíticos para melhorar a sua experiência. Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), você pode personalizar suas preferências. Conheça nossa{' '}
            <Link to="/central-de-protecao-de-dados/">Central de Proteção de Dados</Link>.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button className="btn btn-cookie-secondary" onClick={() => handleConsent('essential')}>
            Apenas Essenciais
          </button>
          <button className="btn btn-cookie-primary" onClick={() => handleConsent('all')}>
            Aceitar Todos
          </button>
        </div>
      </div>

      <style>{`
        .cookie-banner-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12);
          z-index: 9999;
          border-top: 2px solid var(--color-accent);
          padding: 18px 0;
        }
        .cookie-banner-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }
        .cookie-banner-text {
          font-size: 0.88rem;
          color: #4a5568;
          line-height: 1.5;
        }
        .cookie-title {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
          color: var(--color-primary);
        }
        .cookie-icon {
          color: var(--color-accent);
        }
        .cookie-banner-text a {
          color: var(--color-accent);
          font-weight: 600;
          text-decoration: underline;
        }
        .cookie-banner-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        .btn-cookie-primary {
          background-color: var(--color-accent);
          color: #ffffff;
          padding: 10px 18px;
          font-size: 0.85rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-cookie-primary:hover {
          background-color: var(--color-accent-hover);
        }
        .btn-cookie-secondary {
          background-color: transparent;
          color: var(--color-primary);
          border: 1px solid #cbd5e0;
          padding: 10px 18px;
          font-size: 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-cookie-secondary:hover {
          background-color: #f7fafc;
        }
        @media (max-width: 768px) {
          .cookie-banner-box {
            flex-direction: column;
            align-items: flex-start;
          }
          .cookie-banner-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};
