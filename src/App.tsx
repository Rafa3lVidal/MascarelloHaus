import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CookieManager } from './components/CookieManager';
import { ScrollToTop } from './components/ScrollToTop';
import { SiteSecurityGuard } from './components/SiteSecurityGuard';
import { AppRoutes } from './router';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-wrapper">
      {!isAdmin && (
        <a href="#main-content" className="skip-to-content">
          Pular para o conteúdo principal
        </a>
      )}
      <ScrollToTop />
      <SiteSecurityGuard />
      {!isAdmin && <Header />}
      <main id="main-content" className="main-viewport" tabIndex={-1}>
        <AppRoutes />
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      {!isAdmin && <CookieManager />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
