import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE_NAME = 'Mascârello Haus Advocacia';
const BASE_URL = 'https://mascarellohaus.adv.br';
const DEFAULT_IMAGE = `${BASE_URL}/assets/hero-slide-1.png`;

export const SEO: React.FC<SEOProps> = ({
  title = 'Mascârello Haus Advocacia | Videira e Caçador (SC)',
  description = 'Sociedade de Advogados atuante em Videira e Caçador (SC). Soluções jurídicas estratégicas em Direito Empresarial, Civil, LGPD, Compliance, Tributário e Trabalhista.',
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author = 'Mascârello Haus Advocacia',
  breadcrumbs,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Title format
    const fullTitle = title.includes('Mascârello') || title.includes('Mascarello')
      ? title
      : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // 2. Canonical absolute URL
    let absoluteCanonical = canonical || window.location.pathname;
    if (!absoluteCanonical.startsWith('http')) {
      absoluteCanonical = `${BASE_URL}${absoluteCanonical.startsWith('/') ? '' : '/'}${absoluteCanonical}`;
    }
    if (!absoluteCanonical.endsWith('/') && !absoluteCanonical.includes('.')) {
      absoluteCanonical += '/';
    }

    let absoluteImage = ogImage;
    if (absoluteImage && !absoluteImage.startsWith('http')) {
      absoluteImage = `${BASE_URL}${absoluteImage.startsWith('/') ? '' : '/'}${absoluteImage}`;
    }

    // Helper to set meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Primary Meta & Anti-AI Training / Copyright Reservation Directives
    setMeta('description', description);
    setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, noai, noimageai');
    setMeta('googlebot', 'index, follow, max-image-preview:large');
    setMeta('bingbot', 'index, follow');
    setMeta('gptbot', 'noindex, nofollow, noai');
    setMeta('ccbot', 'noindex, nofollow, noarchive');
    setMeta('tdm-reservation', '1');
    setMeta('author', author);
    setMeta('copyright', 'Mascârello Haus Advocacia — Todos os direitos reservados (Lei nº 9.610/98)');

    // OpenGraph Meta
    setMeta('og:locale', 'pt_BR', true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:type', ogType, true);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', absoluteCanonical, true);
    setMeta('og:image', absoluteImage, true);
    setMeta('og:image:alt', fullTitle, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);

    if (ogType === 'article') {
      if (publishedTime) setMeta('article:published_time', publishedTime, true);
      if (modifiedTime) setMeta('article:modified_time', modifiedTime, true);
      if (author) setMeta('article:author', author, true);
    }

    // Twitter Cards
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', absoluteImage);

    // Geo Meta (Videira & Caçador, SC)
    setMeta('geo.region', 'BR-SC');
    setMeta('geo.placename', 'Videira; Caçador');
    setMeta('geo.position', '-27.0083;-51.1517');
    setMeta('ICBM', '-27.0083, -51.1517');

    // Canonical link
    let linkEl = document.querySelector('link[rel="canonical"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', absoluteCanonical);

    // Schema.org Structured Data (LegalService + WebSite + Breadcrumbs + Custom)
    const baseLegalServiceSchema = {
      '@context': 'https://schema.org',
      '@type': ['LegalService', 'Attorney', 'Organization'],
      '@id': `${BASE_URL}/#organization`,
      name: 'Mascârello Haus Sociedade de Advogados',
      alternateName: 'Mascârello Haus Advocacia',
      url: BASE_URL,
      logo: `${BASE_URL}/assets/logo2025.png`,
      image: `${BASE_URL}/assets/hero-slide-1.png`,
      description: 'Sociedade de Advogados em Videira e Caçador (SC). Atuação de excelência em Direito Empresarial, Civil, LGPD, Compliance, Tributário e Trabalhista.',
      telephone: '+55-49-3566-0066',
      email: 'contato@mascarellohaus.adv.br',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Esquina com a - Rua Coronel Alberto Schmidt, n.º 10, Edifício Laura, 1.º Andar, Sala 5, R. Brasil - Centro',
        addressLocality: 'Videira',
        addressRegion: 'SC',
        postalCode: '89560-198',
        addressCountry: 'BR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+55-49-3566-0066',
        contactType: 'customer support',
        areaServed: 'BR',
        availableLanguage: ['Portuguese'],
      },
      sameAs: [
        'https://www.instagram.com/mascarellohausadvocacia/',
        'https://www.youtube.com/@mascarellohausadvocacia',
        'https://www.facebook.com/mascarellohausadvocacia/',
      ],
    };

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: SITE_NAME,
      inLanguage: 'pt-BR',
      publisher: {
        '@id': `${BASE_URL}/#organization`,
      },
    };

    const breadcrumbsSchema =
      breadcrumbs && breadcrumbs.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((b, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: b.name,
              item: b.url.startsWith('http') ? b.url : `${BASE_URL}${b.url}`,
            })),
          }
        : null;

    const allSchemas = [
      baseLegalServiceSchema,
      websiteSchema,
      ...(breadcrumbsSchema ? [breadcrumbsSchema] : []),
      ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
    ];

    let scriptEl = document.querySelector('script#mh-schema-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'mh-schema-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(allSchemas);
  }, [title, description, canonical, ogImage, ogType, publishedTime, modifiedTime, author, breadcrumbs, jsonLd]);

  return null;
};

export default SEO;
