import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Copy, Check, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import FileUploader from '../components/FileUploader';
import SecurityShield, { createInitialSecurityState } from '../components/SecurityShield';
import { supabase } from '../lib/supabase';
import {
  formatPhone,
  isValidEmail,
  isValidPhone,
  sanitizeText,
  sanitizeEmail,
  generateProtocol,
  getAnonymousIpHash,
  checkClientRateLimit,
  recordClientSubmission,
  validateSecurityState,
  uploadFormFiles,
  recordFormConsent,
} from '../lib/formSecurity';

export const Contato: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacyAccepted: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [protocol, setProtocol] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyProtocol = () => {
    if (!protocol) return;
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = sanitizeText(formData.name, 140);
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizeText(formData.phone, 30);
    const cleanSubject = sanitizeText(formData.subject, 160);
    const cleanMessage = sanitizeText(formData.message, 5000);

    if (cleanName.length < 3) {
      setErrorMessage('Por favor, informe seu nome completo.');
      setStatus('error');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      setStatus('error');
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setErrorMessage('Por favor, informe um telefone válido com DDD (ex: (49) 99999-9999).');
      setStatus('error');
      return;
    }

    if (!formData.privacyAccepted) {
      setErrorMessage('Você precisa concordar com a Política de Privacidade para enviar a mensagem.');
      setStatus('error');
      return;
    }

    const secCheck = validateSecurityState(security);
    if (!secCheck.valid) {
      setErrorMessage(secCheck.error || 'Falha na verificação de segurança.');
      setStatus('error');
      return;
    }

    const rateCheck = checkClientRateLimit('contato', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setErrorMessage(
        `Muitas tentativas recentes. Por segurança, aguarde ${rateCheck.retryAfterSeconds} segundos antes de enviar novamente.`
      );
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const uploadedAttachments = await uploadFormFiles(files, 'contato', 'anexos_contato');
      const generatedProtocol = generateProtocol('CONT');
      const ipHash = await getAnonymousIpHash();

      const { error } = await supabase.from('contact_messages').insert([
        {
          protocol: generatedProtocol,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          subject: cleanSubject || 'Contato Institucional',
          message: cleanMessage,
          privacy_consent: formData.privacyAccepted,
          page_source: '/contato',
          attachments_json: uploadedAttachments,
          ip_hash: ipHash,
          user_agent: navigator.userAgent.slice(0, 250),
          security_meta: {
            honeypot: security.honeypotWebsite || security.honeypotFax || '',
            challengeToken: security.challengeToken,
            elapsedMs: Date.now() - security.mountedAt,
          },
        },
      ]);

      if (error) throw error;

      await recordFormConsent('contact_form_privacy_policy', cleanEmail);
      recordClientSubmission('contato');

      setProtocol(generatedProtocol);
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        privacyAccepted: false,
      });
      setFiles([]);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      setStatus('error');
      setErrorMessage(
        err?.message ||
          'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou contate-nos por telefone.'
      );
    }
  };

  return (
    <>
      <SEO
        title="Contato - Mascârello Haus"
        description="Entre em contato com a Mascârello Haus Advocacia em Videira e Caçador (SC). Agende uma consulta jurídica ou envie documentos com segurança."
        canonical="/contato"
      />

      {/* Hero Section */}
      <section
        className="mh-hero"
        style={{
          backgroundImage: 'url(/wp-content/uploads/2023/08/contato-banner.jpg)',
          minHeight: '300px',
          paddingTop: '120px',
          paddingBottom: '60px',
        }}
      >
        <div className="mh-hero-overlay" />
        <div className="mh-container mh-hero-content">
          <div style={{ maxWidth: '600px' }}>
            <h1 className="mh-hero-title">Contato</h1>
            <p className="mh-hero-subtitle">
              Precisa de ajuda com alguma questão legal? Preencha o formulário abaixo e entraremos em contato!
            </p>
          </div>
        </div>
      </section>

      {/* Form & Offices Section */}
      <section className="mh-section" style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}>
        <div className="mh-container">
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            {status === 'success' ? (
              <div
                role="status"
                aria-live="polite"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: '14px',
                  padding: '36px 28px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2
                  size={48}
                  style={{ color: '#22c55e', margin: '0 auto 16px', display: 'block' }}
                />
                <h2 style={{ color: '#ffffff', fontSize: '26px', marginBottom: '10px' }}>
                  Mensagem enviada com sucesso!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', lineHeight: 1.6 }}>
                  Agradecemos o seu contato. Nossa equipe jurídica recebeu sua solicitação e retornará em breve.
                </p>

                {protocol && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'rgba(0,0,0,0.28)',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '1px solid rgba(203, 171, 122, 0.45)',
                      marginBottom: '24px',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#cbab7a' }}>
                        Protocolo de Atendimento
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {protocol}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyProtocol}
                      className="mh-btn mh-btn-outline"
                      style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mh-btn mh-btn-gold"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              </div>
            ) : (
              <form className="mh-form" onSubmit={handleSubmit} noValidate>
                <div className="mh-form-group">
                  <label htmlFor="contato-nome" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Nome completo <span style={{ color: '#cbab7a' }}>*</span>
                  </label>
                  <input
                    id="contato-nome"
                    type="text"
                    className="mh-input"
                    placeholder="Nome *"
                    required
                    maxLength={140}
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="mh-grid-2" style={{ gap: '16px' }}>
                  <div className="mh-form-group">
                    <label htmlFor="contato-email" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      E-mail <span style={{ color: '#cbab7a' }}>*</span>
                    </label>
                    <input
                      id="contato-email"
                      type="email"
                      className="mh-input"
                      placeholder="seu@email.com *"
                      required
                      maxLength={254}
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="mh-form-group">
                    <label htmlFor="contato-telefone" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Telefone / WhatsApp <span style={{ color: '#cbab7a' }}>*</span>
                    </label>
                    <input
                      id="contato-telefone"
                      type="tel"
                      className="mh-input"
                      placeholder="(49) 99999-9999 *"
                      required
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: formatPhone(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="mh-form-group">
                  <label htmlFor="contato-assunto" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Assunto / Área de Interesse (opcional)
                  </label>
                  <input
                    id="contato-assunto"
                    type="text"
                    className="mh-input"
                    placeholder="Ex: Direito Empresarial, Proteção de Dados (LGPD), Direito Civil..."
                    maxLength={160}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="mh-form-group">
                  <label htmlFor="contato-mensagem" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Mensagem
                  </label>
                  <textarea
                    id="contato-mensagem"
                    className="mh-textarea"
                    placeholder="Descreva brevemente como podemos auxiliar..."
                    rows={5}
                    maxLength={5000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <FileUploader
                  id="contato-arquivos"
                  label="Anexar documentos complementares (opcional)"
                  description="Caso deseje adiantar a análise, anexe documentos em PDF, Word ou imagem."
                  files={files}
                  onChange={setFiles}
                  maxFiles={3}
                  maxSizeMB={10}
                  allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']}
                  variant="dark"
                  compact
                />

                <div className="mh-form-group" style={{ marginTop: '18px' }}>
                  <label className="mh-checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={formData.privacyAccepted}
                      onChange={(e) =>
                        setFormData({ ...formData, privacyAccepted: e.target.checked })
                      }
                    />
                    <span>
                      Declaro que li e concordo com a{' '}
                      <Link
                        to="/politica-de-privacidade"
                        style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                      >
                        Política de Privacidade
                      </Link>{' '}
                      e autorizo o tratamento dos meus dados para retorno do contato, nos termos da LGPD. *
                    </span>
                  </label>
                </div>

                <SecurityShield security={security} onChange={setSecurity} variant="dark" />

                {status === 'error' && (
                  <div
                    role="alert"
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="mh-btn mh-btn-gold"
                  disabled={status === 'submitting'}
                  style={{ width: '100%' }}
                >
                  {status === 'submitting' ? 'Enviando com segurança...' : 'Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>

          <hr
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              margin: '60px 0',
            }}
          />

          {/* Office Addresses */}
          <div className="mh-grid-2" style={{ gap: '48px', marginBottom: '48px' }}>
            <div>
              <h3 style={{ color: 'var(--color-accent)', fontSize: '28px', marginBottom: '16px' }}>
                Videira
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                Edifício Vênus — R. Saul Brandalise, 39 — Sala 204
              </p>
              <p style={{ color: 'rgba(255,255,255,0.85)' }}>Centro, Videira — SC</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-accent)', fontSize: '28px', marginBottom: '16px' }}>
                Caçador
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                R. Carlos Sperança, 360 — Sala 05
              </p>
              <p style={{ color: 'rgba(255,255,255,0.85)' }}>Centro, Caçador — SC</p>
            </div>
          </div>

          {/* Direct Contact Info */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>
              <a
                href="mailto:contato@mascarellohaus.com.br"
                style={{ color: 'var(--color-accent)' }}
              >
                contato@mascarellohaus.com.br
              </a>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <a href="tel:4935660066" style={{ color: '#ffffff', fontSize: '18px', fontWeight: 500 }}>
                49 3566-0066
              </a>
              <a href="tel:49999743484" style={{ color: '#ffffff', fontSize: '18px', fontWeight: 500 }}>
                49 9.9974-3484
              </a>
              <a href="tel:49999935723" style={{ color: '#ffffff', fontSize: '18px', fontWeight: 500 }}>
                49 9.9993-5723
              </a>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              height: '400px',
              border: '1px solid rgba(203, 171, 122, 0.3)',
            }}
          >
            <iframe
              title="Localização Mascârello Haus Videira"
              src="https://maps.google.com/maps?q=Edif%C3%ADcio%20V%C3%AAnus%20-%20R.%20Saul%20Brandalise%2C%2039%20-%20Sala%20204%20-%20Centro%2C%20Videira%20-%20SC%2C%2089560-000&t=m&z=15&output=embed&iwloc=near"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contato;
