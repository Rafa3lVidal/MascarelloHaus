import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, KeyRound, AlertCircle, Shield } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (needsMfa) {
        // Desafio MFA TOTP
        const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: mfaCode
        });
        if (verifyError) throw verifyError;
        navigate('/admin/dashboard');
        return;
      }

      // Login senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Verificar fatores MFA cadastrados
      const { data: factors, error: mfaCheckError } = await supabase.auth.mfa.listFactors();
      if (!mfaCheckError && factors.totp && factors.totp.length > 0) {
        const verifiedFactor = factors.totp.find((f) => f.status === 'verified');
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
          setNeedsMfa(true);
          setLoading(false);
          return;
        }
      }

      // Se não tiver MFA ativo ou já autenticado
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <SEO title="Painel Administrativo | Mascârello Haus Advocacia" />

      <div className="admin-login-box">
        <div className="admin-login-header">
          <img src="/assets/logo2025.png" alt="Mascârello Haus" className="admin-logo" />
          <h2>Painel de Gestão</h2>
          <p>Acesso exclusivo para administradores e encarregados (DPO).</p>
        </div>

        {errorMsg && (
          <div className="form-error-banner" style={{ margin: '20px 0' }}>
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
                <label className="form-label">E-mail Institucional</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="form-control with-icon"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mascarellohaus.adv.br"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Senha</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-control with-icon"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Código de Autenticação MFA (TOTP)</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control with-icon"
                  required
                  autoFocus
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000 000"
                />
              </div>
              <small style={{ color: '#718096', display: 'block', marginTop: '6px' }}>
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
        </form>

        <div className="admin-login-footer">
          <Shield size={14} />
          <span>Ambiente monitorado e protegido por Row Level Security</span>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background-color: var(--color-bg-light);
        }
        .admin-login-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 40px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
        }
        .admin-login-header {
          text-align: center;
        }
        .admin-logo {
          height: 52px;
          margin-bottom: 20px;
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
          color: #a0aec0;
        }
        .form-control.with-icon {
          padding-left: 44px;
        }
        .admin-login-footer {
          margin-top: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #718096;
        }
      `}</style>
    </div>
  );
};
