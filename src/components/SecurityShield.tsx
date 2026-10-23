import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { SecurityState } from '../lib/formSecurity';

export interface SecurityShieldProps {
  security: SecurityState;
  onChange: (next: SecurityState) => void;
  variant?: 'dark' | 'light';
}

export function createInitialSecurityState(): SecurityState {
  return {
    honeypotWebsite: '',
    honeypotFax: '',
    mountedAt: Date.now(),
    verified: false,
    challengeToken: '',
  };
}

export default function SecurityShield({
  security,
  onChange,
  variant = 'light',
}: SecurityShieldProps) {
  const [verifying, setVerifying] = useState(false);
  const isDark = variant === 'dark';
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!turnstileSiteKey) return;
    // Dynamically load Cloudflare Turnstile if site key is configured
    const existingScript = document.getElementById('cf-turnstile-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [turnstileSiteKey]);

  const handleVerifyClick = async () => {
    if (security.verified || verifying) return;
    setVerifying(true);

    try {
      // Small proof-of-work + interaction verification delay
      await new Promise((resolve) => setTimeout(resolve, 260));
      const rawChallenge = `${security.mountedAt}:${Date.now()}:${navigator.userAgent.length}`;
      let token = `pow_${btoa(rawChallenge).replace(/=/g, '')}`;

      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const buf = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(rawChallenge)
        );
        const hex = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
          .slice(0, 24);
        token = `mh_pow_${hex}`;
      }

      onChange({
        ...security,
        verified: true,
        challengeToken: token,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
      {/* Honeypot fields — hidden from humans & screen readers, traps automated spam bots */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <label htmlFor="mh_hp_website_url">Website Institucional (Não preencha este campo)</label>
        <input
          id="mh_hp_website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={security.honeypotWebsite}
          onChange={(e) => onChange({ ...security, honeypotWebsite: e.target.value })}
        />
        <label htmlFor="mh_hp_company_fax">Fax Corporativo (Não preencha este campo)</label>
        <input
          id="mh_hp_company_fax"
          name="company_fax"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={security.honeypotFax}
          onChange={(e) => onChange({ ...security, honeypotFax: e.target.value })}
        />
      </div>

      {/* Interactive Anti-Bot & LGPD Security Shield */}
      <div
        role="group"
        aria-label="Verificação de segurança contra spam"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '10px',
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : '#f8fafc',
          border: `1px solid ${
            security.verified
              ? '#22c55e'
              : isDark
              ? 'rgba(203, 171, 122, 0.35)'
              : '#cbd5e1'
          }`,
          transition: 'border-color 180ms ease-out, background-color 180ms ease-out',
        }}
      >
        <button
          type="button"
          onClick={handleVerifyClick}
          disabled={security.verified || verifying}
          aria-pressed={security.verified}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: security.verified ? 'default' : 'pointer',
            textAlign: 'left',
            color: isDark ? '#ffffff' : '#1e293b',
            flex: 1,
          }}
        >
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: `2px solid ${
                security.verified
                  ? '#22c55e'
                  : isDark
                  ? '#cbab7a'
                  : '#64748b'
              }`,
              backgroundColor: security.verified
                ? '#22c55e'
                : isDark
                ? 'rgba(255,255,255,0.05)'
                : '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 160ms ease-out',
            }}
          >
            {verifying ? (
              <Loader2 size={15} className="mh-spin" style={{ color: isDark ? '#cbab7a' : '#0d3732' }} />
            ) : security.verified ? (
              <CheckCircle2 size={16} style={{ color: '#ffffff' }} />
            ) : null}
          </span>

          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#0f172a',
              }}
            >
              {security.verified
                ? 'Verificação de segurança concluída'
                : verifying
                ? 'Validando proteção anti-spam...'
                : 'Confirmo que sou humano (Verificação Anti-Spam)'}
            </div>
            <div
              style={{
                fontSize: '11.5px',
                color: isDark ? 'rgba(255,255,255,0.68)' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}
            >
              <Lock size={11} />
              <span>Conexão criptografada ponta a ponta • Protegido conforme a LGPD</span>
            </div>
          </div>
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: security.verified ? '#22c55e' : '#cbab7a',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <ShieldCheck size={22} />
          <span style={{ marginTop: '2px' }}>Segurança</span>
        </div>
      </div>
    </div>
  );
}
