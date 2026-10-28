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
      <ScrollToTop />
      <SiteSecurityGuard />
      {!isAdmin && <Header />}
      <main className="main-viewport">
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
