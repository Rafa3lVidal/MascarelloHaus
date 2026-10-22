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
        text: 'Obrigado por entrar em contato! Sua mensagem foi enviada com sucesso e retornaremos em breve.'
      });
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: '',
        privacyConsent: false
      });
    } catch (err: any) {
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
        title="Contato | Mascârello Haus Advocacia"
        description="Entre em contato com a equipe da Mascârello Haus Advocacia. Atendimento em Videira, Caçador e consultoria em todo o Brasil."
        canonical="https://mascarellohaus.adv.br/contato/"
      />

      {/* Banner da Página */}
      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Fale Conosco</span>
          <h1 className="banner-title">Contato</h1>
          <p className="banner-desc">Estamos à disposição para atender suas demandas jurídicas e esclarecer dúvidas.</p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container contact-grid">
          {/* Informações de Contato */}
          <div className="contact-info-col">
            <h2 className="info-title">Canais de Atendimento</h2>
            <p className="info-desc">
              Entre em contato diretamente através de nossos canais institucionais ou preencha o formulário ao lado.
            </p>

            <div className="contact-card-list">
              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <Phone size={22} />
                </div>
                <div>
                  <h4>Telefone & WhatsApp</h4>
                  <p>+55 (49) 99928-1878</p>
                  <a href="https://wa.me/5549999281878" target="_blank" rel="noopener noreferrer" className="link-action">
                    Conversar via WhatsApp →
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <Mail size={22} />
                </div>
                <div>
                  <h4>E-mail Geral</h4>
                  <p>contato@mascarellohaus.adv.br</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <Mail size={22} />
                </div>
                <div>
                  <h4>Encarregado de Dados (DPO)</h4>
                  <p>privacidade@mascarellohaus.adv.br</p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="icon-wrapper">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4>Localização</h4>
                  <p>Videira / Caçador — Santa Catarina</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="contact-form-col">
            <div className="wpforms-container">
              <h3 style={{ marginBottom: '20px' }}>Envie uma mensagem</h3>

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
                  <label className="form-label">
                    Nome <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    E-mail <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Telefone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(49) 99999-9999"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    className="form-control"
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Como podemos lhe ajudar?"
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
                      O escritório Mascarello Haus coleta somente os dados necessários ao atendimento da sua solicitação e respeita a sua privacidade, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018). Ao continuar, você confirma que leu e aceitou os termos de privacidade. <span className="required">*</span>
                    </span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Mensagem <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .page-header-banner {
          background-color: var(--color-primary-dark);
          color: #ffffff;
          padding: 60px 0;
          border-bottom: 2px solid var(--color-accent);
        }
        .banner-badge {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        .banner-title {
          color: #ffffff;
          font-size: 2.8rem;
          margin-bottom: 10px;
        }
        .banner-desc {
          color: #cbd5e0;
          font-size: 1.1rem;
          max-width: 600px;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
        }
        .info-title {
          font-size: 1.8rem;
          margin-bottom: 12px;
        }
        .info-desc {
          color: var(--color-text-muted);
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .contact-card-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .contact-info-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(197, 155, 39, 0.12);
          color: var(--color-accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .contact-info-item h4 {
          font-size: 1.05rem;
          margin-bottom: 4px;
        }
        .contact-info-item p {
          color: var(--color-text-muted);
          font-size: 0.95rem;
        }
        .link-action {
          color: var(--color-accent);
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-block;
          margin-top: 4px;
        }
        @media (max-width: 850px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
