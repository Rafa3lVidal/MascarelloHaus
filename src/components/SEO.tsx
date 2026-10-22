import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Mascârello Haus Advocacia',
  description = 'Sociedade de Advogados — Soluções Jurídicas Estratégicas em Direito Civil, Empresarial, LGPD, Compliance e Direito do Trabalho.',
  canonical,
  ogImage = '/assets/logo2025.png',
}) => {
  useEffect(() => {
    // Atualiza title
    document.title = title.includes('Mascârello') || title.includes('Mascarello') 
      ? title 
      : `${title} | Mascârello Haus Advocacia`;

    // Helper para meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? `property="${name}"` : `name="${name}"`;
      let el = document.querySelector(`meta[${attr}]`);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    // Canonical link
    if (canonical) {
      let linkEl = document.querySelector('link[rel="canonical"]');
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.setAttribute('rel', 'canonical');
        document.head.appendChild(linkEl);
      }
      linkEl.setAttribute('href', canonical);
    }
  }, [title, description, canonical, ogImage]);

  return null;
};
