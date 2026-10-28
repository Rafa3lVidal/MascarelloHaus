import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

const ALLOWED_HOST_PATTERNS = [
  /^mascarellohaus\.adv\.br$/i,
  /^www\.mascarellohaus\.adv\.br$/i,
  /\.vercel\.app$/i,
  /^localhost$/i,
  /^127\.0\.0\.1$/i,
  /^\[::1\]$/i,
];

function isAuthorizedHost(hostname: string): boolean {
  if (!hostname) return true;
  return ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export const SiteSecurityGuard: React.FC = () => {
  const [unauthorizedClone, setUnauthorizedClone] = useState(false);
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Domain Authenticity & Anti-Clone Verification
    const currentHost = window.location.hostname;
    if (!isAuthorizedHost(currentHost)) {
      setUnauthorizedClone(true);
      try {
        window.location.replace('https://mascarellohaus.adv.br/');
      } catch {
        // Fallback to blocking overlay
      }
      return;
    }

    // 2. Anti-Clickjacking / Framebusting
    try {
      if (window.self !== window.top && window.top) {
        const parentHost = document.referrer ? new URL(document.referrer).hostname : '';
        if (parentHost && !isAuthorizedHost(parentHost)) {
          window.top.location.href = window.self.location.href;
        }
      }
    } catch {
      // Cross-origin parent frame detected: break out
      try {
        if (window.top) {
          window.top.location.href = window.self.location.href;
        }
      } catch {
        // Handled by CSP frame-ancestors 'self'
      }
    }

    // 3. Console Self-XSS & Anti-Phishing Warning
    try {
      // eslint-disable-next-line no-console
      console.log(
        '%c⚠️ ALERTA DE SEGURANÇA — MASCÂRELLO HAUS ADVOCACIA',
        'color: #ef4444; font-size: 18px; font-weight: bold; background: #0d3732; padding: 8px 14px; border-radius: 6px; border: 2px solid #cbab7a;'
      );
      // eslint-disable-next-line no-console
      console.log(
        '%cEste recurso do navegador é destinado exclusivamente a desenvolvedores. Nunca cole códigos ou comandos aqui a pedido de terceiros — isso caracteriza ataque de Self-XSS / Phishing. Canal oficial: https://mascarellohaus.adv.br',
        'color: #0d3732; font-size: 13px; font-weight: 600;'
      );
    } catch {
      // Ignore
    }

    let toastTimer: number | undefined;
    const triggerToast = (msg: string) => {
      setSecurityToast(msg);
      if (toastTimer) window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        setSecurityToast(null);
      }, 3200);
    };

    // 4. Protect Images, Logos & Brand Assets from Right-Click / Dragging
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isImageOrProtected =
        target.tagName === 'IMG' ||
        target.tagName === 'SVG' ||
        target.tagName === 'VIDEO' ||
        target.closest('.brand-logo') ||
        target.closest('.protected-asset');

      if (isImageOrProtected) {
        e.preventDefault();
        triggerToast('Imagem e identidade visual protegidas por direitos autorais — Mascârello Haus.');
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'SVG' ||
        target.tagName === 'A' ||
        target.closest('.brand-logo')
      ) {
        e.preventDefault();
      }
    };

    // 5. Smart Clipboard Protection & Copyright Attribution against Scraping/AI Copying
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Allow normal copying inside form inputs, textareas, or protocol code elements
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'CODE' ||
          target.closest('.protocol-box'))
      ) {
        return;
      }

      const selection = window.getSelection();
      if (!selection) return;
      const selectedText = selection.toString();

      // If copying substantial article/page content (> 90 chars), append legal copyright attribution
      if (selectedText.trim().length > 90 && e.clipboardData) {
        e.preventDefault();
        const attribution = `\n\n— Fonte Oficial: Mascârello Haus Advocacia (${window.location.href})\n© Todos os direitos reservados (Lei nº 9.610/98). Proibida a reprodução comercial, clonagem ou uso para treinamento de Inteligência Artificial sem autorização expressa.`;
        e.clipboardData.setData('text/plain', selectedText + attribution);
        triggerToast('Cópia registrada com atribuição de direitos autorais — Mascârello Haus.');
      }
    };

    // 6. Block Bulk Cloning Shortcuts (Ctrl+S, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === 's' || key === 'u')) {
        e.preventDefault();
        triggerToast('Download de código-fonte bloqueado pela política de segurança.');
      }
    };

    // 7. Anti-Phishing & Anti-Tabnabbing Link Guard
    const handleLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;

      const rawHref = anchor.getAttribute('href') || '';
      if (/^\s*(?:javascript|vbscript|data)\s*:/i.test(rawHref)) {
        e.preventDefault();
        triggerToast('Link potencialmente inseguro bloqueado.');
        return;
      }

      try {
        const url = new URL(anchor.href, window.location.origin);
        // Enforce rel="noopener noreferrer" on external links
        if (url.origin !== window.location.origin) {
          anchor.setAttribute('rel', 'noopener noreferrer');
          // Block suspicious Punycode homograph domains pretending to be mascarello
          if (url.hostname.includes('xn--') && /mascarello/i.test(url.hostname)) {
            e.preventDefault();
            triggerToast('Alerta Anti-Phishing: Domínio externo suspeito bloqueado.');
          }
        }
      } catch {
        // Ignore relative or mailto/tel links
      }
    };

    // 8. MutationObserver to harden all dynamically rendered external links & images
    const hardenDomNodes = () => {
      const links = document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
      links.forEach((a) => {
        const currentRel = a.getAttribute('rel') || '';
        if (!currentRel.includes('noopener') || !currentRel.includes('noreferrer')) {
          a.setAttribute('rel', 'noopener noreferrer');
        }
      });

      const images = document.querySelectorAll<HTMLImageElement>('img');
      images.forEach((img) => {
        if (!img.hasAttribute('draggable')) {
          img.setAttribute('draggable', 'false');
        }
      });
    };

    hardenDomNodes();
    const observer = new MutationObserver(() => {
      hardenDomNodes();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      if (toastTimer) window.clearTimeout(toastTimer);
      observer.disconnect();
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  if (unauthorizedClone) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,
          backgroundColor: '#071f1c',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
        <h1 style={{ fontFamily: 'serif', fontSize: '2rem', color: '#cbab7a', marginBottom: '12px' }}>
          Alerta de Segurança Anti-Phishing
        </h1>
        <p style={{ maxWidth: '580px', lineHeight: 1.7, color: '#e2e8f0', marginBottom: '24px' }}>
          Este domínio não é autorizado pela <strong>Mascârello Haus Advocacia</strong>. Para sua proteção contra fraudes e phishing, acesse exclusivamente o nosso endereço oficial:
        </p>
        <a
          href="https://mascarellohaus.adv.br/"
          style={{
            backgroundColor: '#cbab7a',
            color: '#0d3732',
            padding: '14px 28px',
            borderRadius: '8px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Ir para https://mascarellohaus.adv.br
        </a>
      </div>
    );
  }

  return (
    <>
      {securityToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            backgroundColor: 'rgba(13, 55, 50, 0.96)',
            color: '#ffffff',
            border: '1px solid #cbab7a',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            maxWidth: '420px',
            pointerEvents: 'none',
          }}
        >
          <Lock size={16} style={{ color: '#cbab7a', flexShrink: 0 }} />
          <span>{securityToast}</span>
        </div>
      )}
      <style>{`
        img, svg, .brand-logo {
          -webkit-user-drag: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
      `}</style>
    </>
  );
};

export default SiteSecurityGuard;
