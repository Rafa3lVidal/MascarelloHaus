import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main-grid">
          {/* Coluna 1: Logo Branca & Info */}
          <div className="footer-col col-brand">
            <Link to="/">
              <img
                src="/assets/logo2025branca.png"
                alt="Mascârello Haus Advocacia"
                className="footer-logo"
              />
            </Link>
            <p className="footer-tagline">
              Mascârello Haus Advocacia e Consultoria Jurídica.<br />
              Para um novo mundo, novas estratégias.
            </p>
            <div className="footer-contacts">
              <p>Caçador / Videira — Santa Catarina</p>
              <p>E-mail: <a href="mailto:contato@mascarellohaus.adv.br">contato@mascarellohaus.adv.br</a></p>
              <p>WhatsApp: <a href="https://wa.me/554988220982" target="_blank" rel="noopener noreferrer">+55 (49) 98822-0982</a></p>
            </div>
          </div>

          {/* Coluna 2: Links Úteis */}
          <div className="footer-col">
            <h5 className="footer-col-title">Links úteis</h5>
            <ul className="footer-nav-list">
              <li>
                <a href="https://personaldatasafe.com.br/" target="_blank" rel="noopener noreferrer">
                  Personal Data Safe <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer">
                  ANPD <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.tjsc.jus.br/" target="_blank" rel="noopener noreferrer">
                  TJSC <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.stj.jus.br/sites/portalp/Inicio" target="_blank" rel="noopener noreferrer">
                  STJ <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://portal.stf.jus.br/" target="_blank" rel="noopener noreferrer">
                  STF <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional & Redes Sociais */}
          <div className="footer-col">
            <h5 className="footer-col-title">Navegação & Redes</h5>
            <ul className="footer-nav-list">
              <li><Link to="/quem-somos/">O escritório</Link></li>
              <li><Link to="/areas-de-atuacao/">Áreas de Atuação</Link></li>
              <li><Link to="/artigos-e-publicacoes/">Artigos & Cartilhas</Link></li>
              <li><Link to="/central-de-protecao-de-dados/">Central de Proteção de Dados (LGPD)</Link></li>
              <li><Link to="/questionario-de-conformidade/">Quiz de Conformidade LGPD</Link></li>
              <li><Link to="/codigo-de-conduta/">Código de Conduta</Link></li>
              <li><Link to="/canal-de-denuncias/">Canal de Denúncias</Link></li>
              <li><Link to="/contato/">Contato</Link></li>
              <li><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))} className="footer-cookie-btn">Preferências de Cookies 🍪</button></li>
            </ul>

            <div className="footer-social-bar">
              <a href="https://www.instagram.com/mascarellohausadvocacia" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.youtube.com/@mascarellohausadvocacia" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="https://www.facebook.com/mascarellohausadvocacia/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="https://wa.me/554988220982" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Selo Institucional de Segurança Cibernética & Anti-Phishing */}
        <div className="footer-security-seal" role="region" aria-label="Selo de Segurança Cibernética e Anti-Phishing">
          <div className="security-seal-badges">
            <span className="security-badge-pill">
              <Lock size={14} /> SSL/TLS 256-bit Ativo
            </span>
            <span className="security-badge-pill">
              <ShieldCheck size={14} /> Proteção Anti-Phishing, Antivírus & Anti-IA
            </span>
          </div>
          <p className="security-seal-notice">
            <strong>Aviso Anti-Fraude:</strong> O único domínio oficial do escritório é{' '}
            <span className="official-domain-highlight">mascarellohaus.adv.br</span>. Nunca solicitamos senhas ou códigos de verificação por mensagem.
          </p>
        </div>
      </div>

      {/* Barra Inferior com Créditos ApexCode */}
      <div className="site-below-footer">
        <div className="container below-footer-flex">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} Mascârello Haus Advocacia — CNPJ 38.282.320/0001-54 - Todos os direitos reservados.
          </p>
          <div className="apexcode-credits">
            <span>Desenvolvido por </span>
            <a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer" className="apex-link">
              <strong>ApexCode</strong>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        
        .footer-cookie-btn {
          background: none;
          border: none;
          padding: 0;
          color: rgba(255, 255, 255, 0.7);
          font-family: inherit;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
          text-align: left;
        }
        .footer-cookie-btn:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }
        .credits-sep {
          margin: 0 8px;
          color: rgba(255, 255, 255, 0.4);
        }
        .apex-link {
          color: #ffffff !important;
        }
        .apexcode-credits a {
          color: #e7decf;
          text-decoration: none;
          transition: color 0.2s;
        }
        .apexcode-credits a:hover {
          color: #ffffff;
          text-decoration: underline;
        }

        .site-footer {
          background-color: var(--color-primary);
          color: #ffffff;
          padding-top: 70px;
          border-top: 4px solid var(--color-accent);
          font-family: var(--font-sans);
        }
        .footer-main-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr;
          gap: 50px;
          padding-bottom: 40px;
        }
        .footer-logo {
          width: 195px;
          height: auto;
          margin-bottom: 20px;
          object-fit: contain;
        }
        .footer-tagline {
          font-size: 0.95rem;
          color: #e7decf;
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .footer-contacts p {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 6px;
        }
        .footer-contacts a {
          color: var(--color-accent);
        }
        .footer-contacts a:hover {
          text-decoration: underline;
        }
        .footer-col-title {
          font-family: 'Poppins', sans-serif;
          color: var(--color-accent);
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 22px;
          position: relative;
        }
        .footer-col-title::after {
          content: '';
          display: block;
          width: 35px;
          height: 2px;
          background-color: var(--color-accent);
          margin-top: 8px;
        }
        .footer-nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-nav-list a {
          color: #ffffff;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .footer-nav-list a:hover {
          color: var(--color-accent);
          transform: translateX(4px);
        }
        .footer-social-bar {
          display: flex;
          gap: 14px;
          margin-top: 25px;
        }
        .footer-social-bar a {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        .footer-social-bar a:hover {
          background-color: var(--color-accent);
          color: var(--color-primary);
          transform: translateY(-3px);
        }
        .footer-security-seal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          padding: 16px 20px;
          margin-bottom: 26px;
          background: rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(203, 171, 122, 0.25);
          border-radius: 8px;
        }
        .security-seal-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .security-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #e7decf;
          background: rgba(203, 171, 122, 0.14);
          border: 1px solid rgba(203, 171, 122, 0.35);
          padding: 5px 11px;
          border-radius: 999px;
        }
        .security-seal-notice {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.78);
          margin: 0;
        }
        .official-domain-highlight {
          color: var(--color-accent);
          font-weight: 600;
          text-decoration: underline;
        }
        .site-below-footer {
          background-color: var(--color-primary-dark);
          padding: 22px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .below-footer-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .apexcode-credits a {
          color: var(--color-accent);
        }
        .apexcode-credits a:hover {
          text-decoration: underline;
        }
        @media (max-width: 900px) {
          .footer-main-grid {
            grid-template-columns: 1fr;
            gap: 35px;
          }
          .footer-security-seal {
            flex-direction: column;
            align-items: flex-start;
          }
          .below-footer-flex {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};
