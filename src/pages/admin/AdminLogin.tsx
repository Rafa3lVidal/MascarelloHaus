import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, KeyRound, AlertCircle, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function translateAuthError(message?: string): string {
  if (!message) return 'Falha na autenticação. Verifique suas credenciais.';
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha inválidos. Verifique os dados informados.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail institucional antes de acessar o painel.';
  }
  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return 'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.';
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('fetch')
  ) {
    return 'Não foi possível conectar ao servidor de autenticação (Supabase). Verifique sua conexão, se o projeto Supabase está ativo/despausado ou se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão atualizadas.';
  }
  if (lower.includes('invalid totp') || lower.includes('invalid code') || lower.includes('challenge')) {
    return 'Código MFA inválido ou expirado. Confira o código no seu autenticador.';
  }
  return message;
}

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active || !session?.user) return;

      try {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');
          if (verifiedFactor && active) {
            setFactorId(verifiedFactor.id);
            setNeedsMfa(true);
            return;
          }
        }
      } catch {
        // Proceed if MFA check isn't required
      }

      if (active) navigate('/admin/dashboard');
    }
    checkExistingSession();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (needsMfa) {
        const cleanCode = mfaCode.replace(/\D/g, '');
        if (cleanCode.length !== 6) {
          throw new Error('Informe os 6 dígitos do código MFA.');
        }
        const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: cleanCode,
        });
        if (verifyError) throw verifyError;
        navigate('/admin/dashboard');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const { data: factors, error: mfaCheckError } = await supabase.auth.mfa.listFactors();
      if (!mfaCheckError && factors?.totp && factors.totp.length > 0) {
        const verifiedFactor = factors.totp.find((f) => f.status === 'verified');
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
          setNeedsMfa(true);
          setLoading(false);
          return;
        }
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(translateAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMfa = async () => {
    await supabase.auth.signOut();
    setNeedsMfa(false);
    setFactorId('');
    setMfaCode('');
    setErrorMsg(null);
  };

  return (
    <div className="admin-login-page">
      <SEO title="Painel Administrativo | Mascârello Haus Advocacia" />

      <div className="admin-login-box">
        <div className="admin-login-header">
          <img src="/assets/logo2025.png" alt="Mascârello Haus" className="admin-logo" />
          <h2>Painel de Gestão</h2>
          <p>Acesso exclusivo para administradores, editores e encarregados (DPO).</p>
        </div>

        {errorMsg && (
          <div className="form-error-banner" role="alert" style={{ margin: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
          {!needsMfa ? (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-email">
                  E-mail Institucional
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    className="form-control with-icon"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mascarellohaus.adv.br"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">
                  Senha
                </label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="form-control with-icon with-right-btn"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="admin-mfa">
                Código de Autenticação MFA (TOTP)
              </label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  id="admin-mfa"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="form-control with-icon"
                  required
                  autoFocus
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                />
              </div>
              <small style={{ color: '#64748b', display: 'block', marginTop: '6px' }}>
                Digite o código de 6 dígitos gerado no seu aplicativo autenticador.
              </small>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Validando...' : needsMfa ? 'Confirmar Código MFA' : 'Acessar Painel'}
          </button>

          {needsMfa && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '10px', color: 'var(--color-primary)', borderColor: '#cbd5e1' }}
              onClick={handleCancelMfa}
            >
              Entrar com outra conta
            </button>
          )}
        </form>

        <div className="admin-login-footer">
          <Shield size={14} />
          <span>Ambiente protegido por Row Level Security (LGPD)</span>
        </div>

        <div className="admin-login-back">
          <Link to="/">
            <ArrowLeft size={14} /> Voltar ao site oficial
          </Link>
          <span>
            Sistema por{' '}
            <a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer">
              ApexCode
            </a>
          </span>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #f5f7f8 0%, #e7decf 100%);
        }
        .admin-login-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 40px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 18px 40px rgba(7, 33, 30, 0.1);
        }
        .admin-login-header {
          text-align: center;
        }
        .admin-logo {
          height: 52px;
          margin-bottom: 18px;
        }
        .admin-login-header h2 {
          font-size: 1.6rem;
          margin-bottom: 6px;
        }
        .admin-login-header p {
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .form-control.with-icon {
          padding-left: 44px;
        }
        .form-control.with-right-btn {
          padding-right: 44px;
        }
        .password-toggle-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: inline-flex;
        }
        .admin-login-footer {
          margin-top: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #64748b;
        }
        .admin-login-back {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: #64748b;
        }
        .admin-login-back a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};
