import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Contato: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
    privacyConsent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formData.nome || !formData.email || !formData.telefone) {
      setStatusMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    if (!formData.privacyConsent) {
      setStatusMessage({ type: 'error', text: 'É necessário concordar com o aviso de privacidade para enviar a mensagem.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        message: formData.mensagem,
        privacy_consent: formData.privacyConsent,
        page_source: 'contato'
      });

      if (error) throw error;

      setStatusMessage({
        type: 'success',
        text: 'Obrigado por entrar em contato! Sua mensagem foi enviada com sucesso e retornaremos o mais breve possível.'
      });
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: '',
        privacyConsent: false
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou nos chame no WhatsApp.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <SEO
        title="Gostaríamos de ouvir você | Mascârello Haus Advocacia"
        description="Para informações ou contato com nossos profissionais, utilize nosso formulário. Nossa equipe de atendimento retornará a sua mensagem o mais breve possível."
        canonical="https://mascarellohaus.adv.br/contato/"
      />

      {/* Banner da Página */}
      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Gostaríamos de ouvir você</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto' }}>
            Para informações ou contato com nossos profissionais, utilize nosso formulário. Nossa equipe de atendimento retornará a sua mensagem o mais breve possível.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container contact-grid">
          {/* Informações de Contato Originais */}
          <div className="contact-info-col">
            <h2 className="info-title">Escritório</h2>
            <div className="contact-card-list">
              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4>Endereço</h4>
                  <p>Rua C. Alberto Schmidt, nº 10 Ed. Laura, 1º andar, SL 5 - Centro - Videira-SC</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <Phone size={22} />
                </div>
                <div>
                  <h4>Ligue / WhatsApp</h4>
                  <p>(49) 98822-0982</p>
                  <a
                    href="https://api.whatsapp.com/send?phone=554988220982"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-action"
                  >
                    Conversar via WhatsApp &rarr;
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <Mail size={22} />
                </div>
                <div>
                  <h4>E-mail</h4>
                  <p>contato@mascarellohaus.adv.br</p>
                </div>
              </div>
            </div>

            <div className="social-links-box">
              <h4>Mídias sociais</h4>
              <div className="social-icons">
                <a href="https://www.facebook.com/mascarellohausadvocacia/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fa-brands fa-facebook"></i> Facebook
                </a>
                <a href="https://www.instagram.com/mascarellohausadvocacia" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fa-brands fa-instagram"></i> Instagram
                </a>
                <a href="https://www.linkedin.com/company/mascarello-haus-advocacia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fa-brands fa-linkedin"></i> Linkedin
                </a>
              </div>
            </div>
          </div>

          {/* Formulário: Converse com um advogado */}
          <div className="contact-form-col">
            <div className="wpforms-container">
              <h3>Converse com um advogado</h3>

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
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
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
                      O escritório Mascarello Haus coleta somente os dados necessários ao atendimento da sua solicitação e respeita a sua privacidade, em conformidade com a Lei Geral de Proteção de Dados Pessoais 13.709/2018. Ao continuar, você confirma que leu e aceitou os termos de uso e a aviso de privacidade. *
                    </span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar mensagem <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .gold-divider {
          width: 80px;
          height: 6px;
          background-color: var(--color-accent);
          margin-bottom: 22px;
          border-radius: 2px;
        }
        .gold-divider.center {
          margin-left: auto;
          margin-right: auto;
        }
        .text-center {
          text-align: center;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 50px;
          align-items: flex-start;
        }
        .info-title {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          color: var(--color-primary);
          margin-bottom: 25px;
        }
        .contact-card-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 35px;
        }
        .contact-info-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid var(--color-accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .icon-wrapper {
          color: var(--color-accent);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .contact-info-item h4 {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          margin-bottom: 4px;
          color: var(--color-primary);
        }
        .contact-info-item p {
          color: var(--color-text-main);
          font-size: 0.92rem;
          line-height: 1.5;
        }
        .link-action {
          display: inline-block;
          font-size: 0.85rem;
          color: var(--color-accent);
          font-weight: 600;
          margin-top: 4px;
        }
        .link-action:hover {
          color: var(--color-primary);
        }
        .social-links-box h4 {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          margin-bottom: 12px;
          color: var(--color-primary);
        }
        .social-icons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .social-icons a {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: var(--color-primary);
          transition: color 0.2s ease;
        }
        .social-icons a:hover {
          color: var(--color-accent);
        }
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
