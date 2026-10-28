import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  ShieldCheck,
  ExternalLink,
  Building2,
} from 'lucide-react';
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
  UploadedAttachment,
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
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [protocol, setProtocol] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeMap, setActiveMap] = useState<'videira' | 'cacador'>('videira');

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
          attachments_json: attachments,
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
      setAttachments([]);
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
    <div className="contato-page">
      <SEO
        title="Contato | Mascârello Haus Advocacia e Consultoria Jurídica"
        description="Entre em contato com a Mascârello Haus Advocacia em Videira e Caçador (SC). Agende uma consulta jurídica ou envie documentos com segurança."
        canonical="https://mascarellohaus.adv.br/contato/"
      />

      {/* Hero Header Banner */}
      <section className="contato-hero">
        <div className="container">
          <div className="contato-hero-inner">
            <span className="contato-badge">Atendimento Jurídico Especializado</span>
            <h1 className="contato-title">Fale Conosco</h1>
            <p className="contato-subtitle">
              Precisa de assessoria jurídica estratégica para você ou sua empresa? Preencha o formulário abaixo ou entre em contato direto com nossas unidades em <strong>Videira</strong> e <strong>Caçador (SC)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Left = Channels & Offices | Right = Contact Form */}
      <section className="contato-main-section">
        <div className="container">
          <div className="contato-layout-grid">
            {/* Coluna Esquerda: Unidades, Telefones, WhatsApp e E-mail */}
            <aside className="contato-info-sidebar">
              <div className="info-card highlight-card">
                <span className="info-tag">Canais Diretos</span>
                <h3>Atendimento Ágil & Personalizado</h3>
                <p className="info-desc">
                  Nossa equipe está à disposição para agendar reuniões presenciais ou por videoconferência.
                </p>

                <div className="contact-channel-list">
                  <a
                    href="https://wa.me/554988220982"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="channel-item whatsapp-highlight"
                  >
                    <div className="channel-icon">
                      <MessageSquare size={20} />
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">WhatsApp Oficial</span>
                      <strong>(49) 98822-0982</strong>
                    </div>
                    <ExternalLink size={15} className="channel-arrow" />
                  </a>

                  <a href="mailto:contato@mascarellohaus.adv.br" className="channel-item">
                    <div className="channel-icon">
                      <Mail size={20} />
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">E-mail Institucional</span>
                      <strong>contato@mascarellohaus.adv.br</strong>
                    </div>
                  </a>

                  <div className="channel-item">
                    <div className="channel-icon">
                      <Phone size={20} />
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">Telefones de Contato</span>
                      <div className="phone-links">
                        <a href="tel:4935660066">(49) 3566-0066</a>
                        <span>•</span>
                        <a href="tel:49999743484">(49) 99974-3484</a>
                        <span>•</span>
                        <a href="tel:49999935723">(49) 99993-5723</a>
                      </div>
                    </div>
                  </div>

                  <div className="channel-item">
                    <div className="channel-icon">
                      <Clock size={20} />
                    </div>
                    <div className="channel-text">
                      <span className="channel-label">Horário de Atendimento</span>
                      <strong>Segunda a Sexta, das 08h30 às 12h e das 13h30 às 18h</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards das Unidades */}
              <div className="offices-cards-stack">
                <div className="office-card">
                  <div className="office-card-header">
                    <div className="office-badge">
                      <Building2 size={18} /> Unidade Videira / SC
                    </div>
                    <button
                      type="button"
                      className={`btn-view-map ${activeMap === 'videira' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveMap('videira');
                        document.getElementById('mapa-escritorio')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <MapPin size={13} /> Ver no mapa
                    </button>
                  </div>
                  <p className="office-address">
                    Edifício Vênus — Rua Saul Brandalise, nº 39, Sala 204<br />
                    Centro — Videira / SC — CEP 89560-000
                  </p>
                </div>

                <div className="office-card">
                  <div className="office-card-header">
                    <div className="office-badge">
                      <Building2 size={18} /> Unidade Caçador / SC
                    </div>
                    <button
                      type="button"
                      className={`btn-view-map ${activeMap === 'cacador' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveMap('cacador');
                        document.getElementById('mapa-escritorio')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <MapPin size={13} /> Ver no mapa
                    </button>
                  </div>
                  <p className="office-address">
                    Rua Carlos Sperança, nº 360, Sala 05<br />
                    Centro — Caçador / SC — CEP 89500-068
                  </p>
                </div>
              </div>
            </aside>

            {/* Coluna Direita: Formulário de Contato Executivo */}
            <div className="contato-form-card">
              {status === 'success' ? (
                <div className="contato-success-box" role="status" aria-live="polite">
                  <div className="success-icon-ring">
                    <CheckCircle2 size={46} />
                  </div>
                  <h2>Mensagem Enviada com Sucesso!</h2>
                  <p>
                    Agradecemos o seu contato. Nossa equipe jurídica recebeu sua solicitação e retornará pelo canal informado o mais breve possível.
                  </p>

                  {protocol && (
                    <div className="protocol-card">
                      <div>
                        <span className="protocol-caption">Protocolo de Atendimento</span>
                        <strong className="protocol-code">{protocol}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyProtocol}
                        className="btn-copy-protocol"
                      >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-submit-contato"
                    style={{ maxWidth: '280px', margin: '10px auto 0' }}
                  >
                    Enviar Nova Mensagem
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-card-header">
                    <h2>Envie sua Mensagem</h2>
                    <p>
                      Preencha os dados abaixo. Todas as informações e documentos anexados são transmitidos sob sigilo profissional e criptografia SSL/TLS.
                    </p>
                  </div>

                  {status === 'error' && errorMessage && (
                    <div className="contato-error-alert" role="alert">
                      <AlertCircle size={20} style={{ flexShrink: 0 }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="contato-form">
                    <div className="form-group">
                      <label htmlFor="contato-nome" className="form-label">
                        Nome completo <span className="required">*</span>
                      </label>
                      <input
                        id="contato-nome"
                        type="text"
                        className="form-control"
                        placeholder="Informe seu nome completo ou razão social"
                        required
                        maxLength={140}
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="contato-email" className="form-label">
                          E-mail <span className="required">*</span>
                        </label>
                        <input
                          id="contato-email"
                          type="email"
                          className="form-control"
                          placeholder="seu@email.com.br"
                          required
                          maxLength={254}
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contato-telefone" className="form-label">
                          Telefone / WhatsApp <span className="required">*</span>
                        </label>
                        <input
                          id="contato-telefone"
                          type="tel"
                          className="form-control"
                          placeholder="(49) 99999-9999"
                          required
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: formatPhone(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contato-assunto" className="form-label">
                        Assunto / Área de Interesse <span className="optional-tag">(opcional)</span>
                      </label>
                      <input
                        id="contato-assunto"
                        type="text"
                        className="form-control"
                        placeholder="Ex: Direito Empresarial, Proteção de Dados (LGPD), Direito Civil..."
                        maxLength={160}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contato-mensagem" className="form-label">
                        Mensagem
                      </label>
                      <textarea
                        id="contato-mensagem"
                        className="form-control"
                        placeholder="Descreva brevemente como podemos auxiliar sua demanda..."
                        rows={5}
                        maxLength={5000}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <FileUploader
                        id="contato-arquivos"
                        label="Anexar documentos complementares (opcional)"
                        description="Caso deseje adiantar a análise, anexe documentos em PDF, Word ou imagem (até 10 MB)."
                        autoUpload={true}
                        folder="contato"
                        fieldKey="anexos_contato"
                        attachments={attachments}
                        onAttachmentsChange={setAttachments}
                        maxFiles={3}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    <div className="consent-box">
                      <label className="consent-label">
                        <input
                          type="checkbox"
                          required
                          checked={formData.privacyAccepted}
                          onChange={(e) =>
                            setFormData({ ...formData, privacyAccepted: e.target.checked })
                          }
                        />
                        <span>
                          Declaro que li e concordo com o{' '}
                          <Link to="/central-de-protecao-de-dados/?aba=privacidade">
                            Aviso de Privacidade
                          </Link>{' '}
                          e autorizo o tratamento dos meus dados para retorno do contato, nos termos da LGPD (Lei nº 13.709/2018). <strong className="required">*</strong>
                        </span>
                      </label>
                    </div>

                    <SecurityShield security={security} onChange={setSecurity} variant="light" />

                    <button
                      type="submit"
                      className="btn-submit-contato"
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? (
                        'Enviando mensagem com segurança...'
                      ) : (
                        <>
                          <Send size={18} /> Enviar Mensagem
                        </>
                      )}
                    </button>

                    <div className="form-security-footnote">
                      <ShieldCheck size={15} />
                      <span>Ambiente protegido com verificação antivírus de anexos e criptografia ponta a ponta.</span>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section id="mapa-escritorio" className="contato-map-section">
        <div className="container">
          <div className="map-header-row">
            <div>
              <span className="map-kicker">Nossas Unidades em Santa Catarina</span>
              <h2>Localização dos Escritórios</h2>
            </div>
            <div className="map-switcher">
              <button
                type="button"
                className={`map-tab-btn ${activeMap === 'videira' ? 'active' : ''}`}
                onClick={() => setActiveMap('videira')}
              >
                <MapPin size={16} /> Videira — SC
              </button>
              <button
                type="button"
                className={`map-tab-btn ${activeMap === 'cacador' ? 'active' : ''}`}
                onClick={() => setActiveMap('cacador')}
              >
                <MapPin size={16} /> Caçador — SC
              </button>
            </div>
          </div>

          <div className="map-frame-wrapper">
            {activeMap === 'videira' ? (
              <iframe
                title="Localização Mascârello Haus Videira"
                src="https://maps.google.com/maps?q=Edif%C3%ADcio%20V%C3%AAnus%20-%20R.%20Saul%20Brandalise%2C%2039%20-%20Sala%20204%20-%20Centro%2C%20Videira%20-%20SC%2C%2089560-000&t=m&z=16&output=embed&iwloc=near"
                width="100%"
                height="420"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <iframe
                title="Localização Mascârello Haus Caçador"
                src="https://maps.google.com/maps?q=R.%20Carlos%20Speran%C3%A7a%2C%20360%20-%20Centro%2C%20Ca%C3%A7ador%20-%20SC%2C%2089500-068&t=m&z=16&output=embed&iwloc=near"
                width="100%"
                height="420"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </section>

      <style>{`
        .contato-page {
          background-color: #f5f7f8;
        }
        .contato-hero {
          background: linear-gradient(135deg, #0d3732 0%, #07211e 100%);
          color: #ffffff;
          padding: 72px 0 64px;
          border-bottom: 3px solid var(--color-accent);
          text-align: center;
        }
        .contato-hero-inner {
          max-width: 780px;
          margin: 0 auto;
        }
        .contato-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--color-accent);
          background: rgba(203, 171, 122, 0.14);
          border: 1px solid rgba(203, 171, 122, 0.35);
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 16px;
        }
        .contato-title {
          font-family: var(--font-serif);
          font-size: clamp(2.2rem, 4vw, 3.1rem);
          color: #ffffff;
          margin-bottom: 14px;
        }
        .contato-subtitle {
          color: rgba(255, 255, 255, 0.86);
          font-size: 1.05rem;
          line-height: 1.7;
          margin: 0 auto;
        }
        .contato-main-section {
          padding: 64px 0;
        }
        .contato-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 36px;
          align-items: start;
        }
        .info-card.highlight-card {
          background: linear-gradient(145deg, #0d3732 0%, #092622 100%);
          color: #ffffff;
          border-radius: 16px;
          padding: 32px 28px;
          border: 1px solid rgba(203, 171, 122, 0.3);
          box-shadow: 0 12px 30px rgba(13, 55, 50, 0.14);
          margin-bottom: 22px;
        }
        .info-tag {
          display: inline-block;
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent);
          margin-bottom: 6px;
        }
        .highlight-card h3 {
          color: #ffffff;
          font-family: var(--font-serif);
          font-size: 1.6rem;
          margin-bottom: 10px;
        }
        .info-desc {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .contact-channel-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .channel-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          transition: all 0.2s ease;
        }
        a.channel-item:hover {
          background: rgba(203, 171, 122, 0.16);
          border-color: var(--color-accent);
          transform: translateY(-2px);
          color: #ffffff;
        }
        .channel-item.whatsapp-highlight {
          background: rgba(34, 197, 94, 0.14);
          border-color: rgba(74, 222, 128, 0.4);
        }
        .channel-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(203, 171, 122, 0.18);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .channel-text {
          flex: 1;
          min-width: 0;
        }
        .channel-label {
          display: block;
          font-size: 0.76rem;
          color: #e7decf;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .channel-text strong {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          word-break: break-word;
        }
        .phone-links {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .phone-links a {
          color: #ffffff;
        }
        .phone-links a:hover {
          color: var(--color-accent);
          text-decoration: underline;
        }
        .channel-arrow {
          color: var(--color-accent);
          flex-shrink: 0;
        }
        .offices-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .office-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-primary);
          border-radius: 12px;
          padding: 20px 22px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }
        .office-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .office-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-primary);
        }
        .btn-view-map {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 999px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-view-map:hover,
        .btn-view-map.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #ffffff;
        }
        .office-address {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
          margin: 0;
        }

        /* Form Card */
        .contato-form-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px 38px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
        }
        .form-card-header {
          margin-bottom: 28px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e2e8f0;
        }
        .form-card-header h2 {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          color: var(--color-primary);
          margin-bottom: 8px;
        }
        .form-card-header p {
          color: #64748b;
          font-size: 0.93rem;
          line-height: 1.6;
          margin: 0;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .optional-tag {
          font-weight: 400;
          color: #94a3b8;
          font-size: 0.84rem;
        }
        .consent-box {
          margin: 20px 0 18px;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }
        .consent-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.88rem;
          color: #334155;
          line-height: 1.55;
          cursor: pointer;
        }
        .consent-label input[type="checkbox"] {
          margin-top: 3px;
          width: 17px;
          height: 17px;
          accent-color: var(--color-primary);
          flex-shrink: 0;
          cursor: pointer;
        }
        .consent-label a {
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: underline;
        }
        .contato-error-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: #fef2f2;
          border: 1px solid #f87171;
          border-radius: 10px;
          color: #991b1b;
          font-size: 0.92rem;
          margin-bottom: 22px;
        }
        .btn-submit-contato {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 28px;
          border-radius: 10px;
          border: none;
          background: var(--color-primary);
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(13, 55, 50, 0.22);
          transition: all 0.2s ease;
          margin-top: 10px;
        }
        .btn-submit-contato:hover:not(:disabled) {
          background: var(--color-primary-light);
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(13, 55, 50, 0.28);
        }
        .btn-submit-contato:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .form-security-footnote {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 14px;
          font-size: 0.8rem;
          color: #64748b;
          text-align: center;
        }

        /* Success State */
        .contato-success-box {
          text-align: center;
          padding: 36px 20px;
        }
        .success-icon-ring {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: #f0fdf4;
          border: 2px solid #86efac;
          color: #16a34a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .contato-success-box h2 {
          font-family: var(--font-serif);
          font-size: 1.9rem;
          color: var(--color-primary);
          margin-bottom: 10px;
        }
        .contato-success-box p {
          color: #475569;
          font-size: 0.98rem;
          max-width: 520px;
          margin: 0 auto 24px;
          line-height: 1.65;
        }
        .protocol-card {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 14px 24px;
          background: #f8fafc;
          border: 2px dashed var(--color-accent);
          border-radius: 12px;
          margin-bottom: 24px;
          text-align: left;
        }
        .protocol-caption {
          display: block;
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748b;
          font-weight: 600;
        }
        .protocol-code {
          font-family: monospace;
          font-size: 1.45rem;
          color: var(--color-primary);
          letter-spacing: 0.04em;
        }
        .btn-copy-protocol {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: var(--color-primary);
          color: #ffffff;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Map Section */
        .contato-map-section {
          padding: 0 0 72px;
        }
        .map-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }
        .map-kicker {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent-hover);
          margin-bottom: 4px;
        }
        .map-header-row h2 {
          font-family: var(--font-serif);
          font-size: 1.9rem;
          color: var(--color-primary);
          margin: 0;
        }
        .map-switcher {
          display: flex;
          gap: 10px;
        }
        .map-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .map-tab-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .map-tab-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(13, 55, 50, 0.18);
        }
        .map-frame-wrapper {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
          background: #e2e8f0;
        }

        @media (max-width: 960px) {
          .contato-layout-grid {
            grid-template-columns: 1fr;
          }
          .contato-form-card {
            padding: 28px 22px;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Contato;
