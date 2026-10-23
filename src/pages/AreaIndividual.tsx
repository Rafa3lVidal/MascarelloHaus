import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
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
import { PRACTICE_AREAS_DATA, PracticeArea } from '../data/practiceAreasData';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  FileCheck,
  Scale,
  Leaf,
  Lock,
  Laptop,
  FileText,
  AlertTriangle,
  Store,
  Award,
  Users,
  Building2,
  FolderKanban,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

// Dynamic Icon mapper
const renderAreaIcon = (iconName: string) => {
  const iconProps = { size: 28, className: 'area-item-icon' };
  switch (iconName) {
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'FileCheck':
      return <FileCheck {...iconProps} />;
    case 'Scale':
      return <Scale {...iconProps} />;
    case 'Leaf':
      return <Leaf {...iconProps} />;
    case 'Lock':
      return <Lock {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'AlertTriangle':
      return <AlertTriangle {...iconProps} />;
    case 'Store':
      return <Store {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    case 'Users':
      return <Users {...iconProps} />;
    case 'Building2':
      return <Building2 {...iconProps} />;
    case 'FolderKanban':
      return <FolderKanban {...iconProps} />;
    default:
      return <ShieldCheck {...iconProps} />;
  }
};

export const AreaIndividual: React.FC = () => {
  const location = useLocation();
  const { slug: paramSlug } = useParams<{ slug: string }>();

  // Extract clean slug from param or pathname
  const rawPath = paramSlug || location.pathname.replace(/^\/|\/$/g, '').split('/').pop() || '';
  const currentSlug = rawPath.toLowerCase();

  const area: PracticeArea | undefined = PRACTICE_AREAS_DATA.find((a) => a.slug === currentSlug);

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
    privacyConsent: false
  });
  const [files, setFiles] = useState<File[]>([]);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanName = sanitizeText(formData.nome, 140);
    const cleanEmail = sanitizeEmail(formData.email);
    const cleanPhone = sanitizeText(formData.telefone, 30);
    const cleanMsg = sanitizeText(formData.mensagem, 5000);

    if (cleanName.length < 3) {
      setStatusMessage({ type: 'error', text: 'Por favor, informe seu nome completo.' });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setStatusMessage({ type: 'error', text: 'Por favor, informe um e-mail válido.' });
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      setStatusMessage({ type: 'error', text: 'Por favor, informe um telefone válido com DDD.' });
      return;
    }

    if (!formData.privacyConsent) {
      setStatusMessage({ type: 'error', text: 'É necessário concordar com o aviso de privacidade.' });
      return;
    }

    const secCheck = validateSecurityState(security);
    if (!secCheck.valid) {
      setStatusMessage({ type: 'error', text: secCheck.error || 'Falha na verificação anti-spam.' });
      return;
    }

    const rateCheck = checkClientRateLimit(`area_${currentSlug}`, 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setStatusMessage({
        type: 'error',
        text: `Muitas tentativas. Aguarde ${rateCheck.retryAfterSeconds}s antes de enviar novamente.`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedAttachments = await uploadFormFiles(files, 'contato', `area_${currentSlug}`);
      const protocol = generateProtocol('CONT');
      const ipHash = await getAnonymousIpHash();

      const { error } = await supabase.from('contact_messages').insert({
        protocol,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: area ? `Área: ${area.title}` : currentSlug,
        message: cleanMsg,
        privacy_consent: formData.privacyConsent,
        page_source: `/areas-de-atuacao/${currentSlug}`,
        attachments_json: uploadedAttachments,
        ip_hash: ipHash,
        user_agent: navigator.userAgent.slice(0, 250),
        security_meta: {
          honeypot: security.honeypotWebsite || security.honeypotFax || '',
          challengeToken: security.challengeToken,
          elapsedMs: Date.now() - security.mountedAt,
        }
      });

      if (error) throw error;

      await recordFormConsent('practice_area_contact_privacy', cleanEmail);
      recordClientSubmission(`area_${currentSlug}`);

      setStatusMessage({
        type: 'success',
        text: `Obrigado pelo contato! Protocolo: ${protocol}. Retornaremos o mais breve possível.`
      });
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: '',
        privacyConsent: false
      });
      setFiles([]);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Erro ao enviar mensagem. Tente novamente em instantes.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!area) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Área de Atuação não encontrada</h2>
        <p style={{ marginTop: '12px', color: 'var(--color-text-muted)' }}>
          A área solicitada não foi localizada. Confira todas as nossas áreas de atuação disponíveis.
        </p>
        <Link to="/areas-de-atuacao/" className="btn btn-primary" style={{ marginTop: '24px' }}>
          <ArrowLeft size={16} /> Ver Todas as Áreas
        </Link>
      </div>
    );
  }

  const otherAreas = PRACTICE_AREAS_DATA.filter((a) => a.slug !== area.slug);

  return (
    <div className="practice-detail-page">
      <SEO
        title={`${area.title} | Mascârello Haus Advocacia`}
        description={area.seo_description || area.intro}
        canonical={`https://mascarellohaus.adv.br/${area.slug}/`}
      />

      {/* Header Banner com Cor Institucional */}
      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider"></div>
          <span className="banner-badge">{area.badge}</span>
          <h1 className="banner-title">{area.title}</h1>
          <p className="banner-desc" style={{ maxWidth: '850px', fontSize: '1.15rem', lineHeight: '1.75' }}>
            {area.intro}
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container detail-grid">
          {/* Conteúdo Principal */}
          <div className="content-col">
            <div className="area-main-content">
              <h2 className="area-section-title">{area.sectionTitle}</h2>
              {area.sectionSubtitle && (
                <p className="area-section-subtitle">{area.sectionSubtitle}</p>
              )}

              {/* Grid de Atividades / Soluções */}
              <div className="area-items-grid">
                {area.items.map((item, index) => (
                  <div key={index} className="area-item-card">
                    <div className="item-icon-wrapper">
                      {renderAreaIcon(item.iconName)}
                    </div>
                    <h3 className="item-title">{item.title}</h3>
                  </div>
                ))}
              </div>

              {/* Seção Extra (Ex: Personal Data Safe na área de LGPD) */}
              {area.extraSection && (
                <div className="extra-section-card">
                  {area.extraSection.badge && (
                    <span className="extra-badge">{area.extraSection.badge}</span>
                  )}
                  <h3 className="extra-title">{area.extraSection.title}</h3>
                  <p className="extra-desc">{area.extraSection.description}</p>
                  {area.extraSection.ctaLink && (
                    <a
                      href={area.extraSection.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary extra-cta"
                    >
                      {area.extraSection.ctaText || 'Acesse agora'} <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              )}

              {/* Outras Áreas de Atuação */}
              <div className="other-areas-block">
                <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-primary)' }}>
                  Conheça outras áreas de atuação
                </h4>
                <div className="other-areas-links">
                  {otherAreas.map((oa) => (
                    <Link key={oa.slug} to={`/${oa.slug}/`} className="other-area-pill">
                      {oa.title} <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Formulário Lateral de Contato */}
          <div className="sidebar-col">
            <div className="wpforms-container sticky-card">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-primary)' }}>
                Converse com um advogado
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginBottom: '22px' }}>
                Preencha o formulário ao lado e receba nosso contato personalizado.
              </p>

              {statusMessage && (
                <div className={statusMessage.type === 'success' ? 'form-success-banner' : 'form-error-banner'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{statusMessage.text}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Seu nome completo"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="seu.email@exemplo.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="(49) 99999-9999"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Como podemos lhe orientar?"
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <FileUploader
                    id={`area-files-${currentSlug}`}
                    label="Anexar documentos (opcional)"
                    files={files}
                    onChange={setFiles}
                    maxFiles={2}
                    maxSizeMB={10}
                    allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']}
                    variant="light"
                    compact
                  />
                </div>

                <div className="form-group">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={formData.privacyConsent}
                      onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    />
                    <span>
                      O escritório Mascarello Haus coleta somente os dados necessários ao atendimento da sua solicitação e respeita a sua privacidade, em conformidade com a Lei Geral de Proteção de Dados Pessoais 13.709/2018. Ao continuar, você confirma que leu e aceitou os termos de uso e o aviso de privacidade. *
                    </span>
                  </label>
                </div>

                <SecurityShield security={security} onChange={setSecurity} variant="light" />

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando com segurança...' : (
                    <>
                      Enviar mensagem <Send size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Botão Direto WhatsApp */}
              <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                <a
                  href={`https://wa.me/5549999743484?text=${encodeURIComponent(`Olá! Gostaria de orientações sobre ${area.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn-full"
                >
                  <MessageCircle size={18} /> Conversar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 50px;
          align-items: flex-start;
        }
        .area-section-title {
          font-family: var(--font-serif);
          font-size: 2.1rem;
          color: var(--color-primary);
          margin-bottom: 16px;
          position: relative;
          padding-bottom: 12px;
        }
        .area-section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: var(--color-accent);
        }
        .area-section-subtitle {
          font-size: 1.08rem;
          line-height: 1.75;
          color: #4a5568;
          margin-bottom: 30px;
        }
        .area-items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          margin-top: 24px;
          margin-bottom: 40px;
        }
        .area-item-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.25s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .area-item-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-accent);
          box-shadow: 0 8px 20px rgba(13, 55, 50, 0.08);
        }
        .item-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          background: rgba(203, 171, 122, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
          flex-shrink: 0;
        }
        .item-title {
          font-size: 1.02rem;
          font-weight: 600;
          color: var(--color-primary);
          margin: 0;
          line-height: 1.4;
        }
        .extra-section-card {
          background: linear-gradient(135deg, var(--color-primary) 0%, #154e47 100%);
          color: #ffffff;
          padding: 32px 30px;
          border-radius: 8px;
          margin-bottom: 40px;
          border-left: 5px solid var(--color-accent);
        }
        .extra-badge {
          display: inline-block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          color: var(--color-accent);
          margin-bottom: 10px;
        }
        .extra-title {
          font-size: 1.6rem;
          color: #ffffff;
          margin-bottom: 12px;
        }
        .extra-desc {
          font-size: 1rem;
          line-height: 1.7;
          color: #cbd5e0;
          margin-bottom: 22px;
        }
        .extra-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .other-areas-block {
          padding-top: 25px;
          border-top: 1px solid #e2e8f0;
        }
        .other-areas-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .other-area-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #cbd5e0;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--color-text-main);
          transition: all 0.2s ease;
        }
        .other-area-pill:hover {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }
        .sticky-card {
          position: sticky;
          top: 100px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-top: 4px solid var(--color-accent);
          border-radius: 8px;
          padding: 30px 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .whatsapp-btn-full {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #25d366;
          color: #ffffff;
          padding: 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: opacity 0.2s;
        }
        .whatsapp-btn-full:hover {
          opacity: 0.9;
        }
        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .area-items-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
