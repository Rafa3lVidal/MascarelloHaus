import React, { useState, useEffect } from 'react';
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
    const cleanPath = path.replace(/\/$/, '');
    if (cleanPath && location.pathname.startsWith(cleanPath)) return true;
    return false;
  };

  // Close mobile menu on route change or Escape key (WCAG 2.1.1)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="site-header">
      {/* Barra superior de contato */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-contacts">
            <a href="mailto:contato@mascarellohaus.adv.br" className="top-link">
              <Mail size={13} aria-hidden="true" /> contato@mascarellohaus.adv.br
            </a>
            <a href="https://api.whatsapp.com/send?phone=554988220982" target="_blank" rel="noopener noreferrer" className="top-link">
              <Phone size={13} aria-hidden="true" /> WhatsApp 49 98822-0982
            </a>
          </div>
        </div>
      </div>

      {/* Barra de Navegação Principal */}
      <div className="main-nav-bar">
        <div className="container nav-container">
          <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src="/assets/logo2025.png"
              alt="Mascârello Haus Advocacia — Página inicial"
              className="logo-img"
              width={120}
              height={60}
              decoding="async"
            />
          </Link>

          {/* Navegação Desktop */}
          <nav className="desktop-nav" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://api.whatsapp.com/send?phone=554988220982"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn-wpp"
            >
              <i className="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp 49 98822-0982
            </a>
          </nav>

          {/* Botão Mobile */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {isMobileMenuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-drawer" className="mobile-nav-drawer">
          <nav className="mobile-nav-list" aria-label="Menu mobile">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-link ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://api.whatsapp.com/send?phone=554988220982"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link wpp"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp 49 98822-0982
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
          transition: color 0.2s var(--ease-out);
        }
        @media (hover: hover) {
          .top-link:hover {
            color: var(--color-accent);
          }
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
          letter-spacing: 0.015em;
          position: relative;
          padding: 6px 0;
          transition: color 0.2s var(--ease-out);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          inset-inline-start: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.25s var(--ease-out);
        }
        @media (hover: hover) {
          .nav-link:hover {
            color: var(--color-accent);
          }
          .nav-link:hover::after {
            transform: scaleX(1);
            transform-origin: left;
          }
        }
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
          transition: background-color 0.2s var(--ease-out),
                      color 0.2s var(--ease-out),
                      transform 0.16s var(--ease-out),
                      box-shadow 0.2s var(--ease-out);
        }
        @media (hover: hover) {
          .nav-btn-wpp:hover {
            background-color: var(--color-accent);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(203, 171, 122, 0.3);
          }
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
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }
        .mobile-nav-drawer {
          display: none;
          background-color: #ffffff;
          border-top: 1px solid var(--color-border);
          padding: 15px 20px;
          overscroll-behavior: contain;
          max-height: calc(100dvh - 80px);
          overflow-y: auto;
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
        .mobile-nav-link.active {
          color: var(--color-accent);
        }
        @media (hover: hover) {
          .mobile-nav-link:hover {
            color: var(--color-accent);
          }
        }
        .mobile-nav-link.wpp {
          color: var(--color-accent);
          font-weight: 600;
        }
        @media (max-width: 992px) {
          .top-bar { display: none; }
          .desktop-nav { display: none; }
          .mobile-toggle-btn { display: inline-flex; }
          .mobile-nav-drawer { display: block; }
          .logo-img { width: 100px; }
        }
      `}</style>
    </header>
  );
};
