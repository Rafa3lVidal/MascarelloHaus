import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'O escritório', path: '/quem-somos/' },
    { label: 'Áreas de atuação', path: '/areas-de-atuacao/' },
    { label: 'Artigos', path: '/artigos-e-publicacoes/' },
    { label: 'Quiz de Conformidade', path: '/questionario-de-conformidade/' },
    { label: 'Fale conosco', path: '/contato/' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="site-header">
      {/* Barra superior de contato */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-contacts">
            <a href="mailto:contato@mascarellohaus.adv.br" className="top-link">
              <Mail size={13} /> contato@mascarellohaus.adv.br
            </a>
            <a href="https://api.whatsapp.com/send?phone=554988220982" target="_blank" rel="noopener noreferrer" className="top-link">
              <Phone size={13} /> WhatsApp 49 98822-0982
            </a>
          </div>
          <div className="top-lgpd-badge">
            <Link to="/central-de-protecao-de-dados/" className="top-link">
              Central de Proteção de Dados
            </Link>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Principal */}
      <div className="main-nav-bar">
        <div className="container nav-container">
          <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/assets/logo2025.png" alt="Mascârello Haus Advocacia" className="logo-img" />
          </Link>

          {/* Navegação Desktop */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://api.whatsapp.com/send?phone=554988220982"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn-wpp"
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp 49 98822-0982
            </a>
          </nav>

          {/* Botão Mobile */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Alternar Menu"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-list">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/central-de-protecao-de-dados/"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Central de Proteção de Dados
            </Link>
            <Link
              to="/codigo-de-conduta/"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Código de Conduta
            </Link>
            <Link
              to="/canal-de-denuncias/"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Canal de Denúncias
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=554988220982"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link wpp"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp 49 98822-0982
            </a>
          </nav>
        </div>
      )}

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(13, 55, 50, 0.06);
        }
        .top-bar {
          background-color: var(--color-primary);
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.78rem;
          padding: 7px 0;
          font-family: var(--font-sans);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .top-bar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .top-contacts {
          display: flex;
          gap: 22px;
        }
        .top-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.9);
          transition: color 0.2s ease;
        }
        .top-link:hover {
          color: var(--color-accent);
        }
        .main-nav-bar {
          padding: 12px 0;
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-logo {
          display: flex;
          align-items: center;
        }
        .logo-img {
          width: 120px;
          height: auto;
          max-height: 65px;
          object-fit: contain;
        }
        .desktop-nav {
          display: flex;
          gap: 22px;
          align-items: center;
        }
        .nav-link {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--color-primary);
          letter-spacing: 0.2px;
          position: relative;
          padding: 6px 0;
          transition: color 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover {
          color: var(--color-accent);
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
          transform-origin: left;
        }
        .nav-link.active {
          color: var(--color-accent);
        }
        .nav-btn-wpp {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border: 1px solid var(--color-accent);
          border-radius: 50px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-btn-wpp:hover {
          background-color: var(--color-accent);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(203, 171, 122, 0.3);
        }
        .nav-btn-wpp:active {
          transform: translateY(0) scale(0.96);
        }
        .mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
        }
        .mobile-nav-drawer {
          display: none;
          background-color: #ffffff;
          border-top: 1px solid var(--color-border);
          padding: 15px 20px;
        }
        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-nav-link {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-primary);
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .mobile-nav-link.active, .mobile-nav-link:hover {
          color: var(--color-accent);
        }
        .mobile-nav-link.wpp {
          color: var(--color-accent);
          font-weight: 600;
        }
        @media (max-width: 992px) {
          .top-bar { display: none; }
          .desktop-nav { display: none; }
          .mobile-toggle-btn { display: block; }
          .mobile-nav-drawer { display: block; }
          .logo-img { width: 100px; }
        }
      `}</style>
    </header>
  );
};
