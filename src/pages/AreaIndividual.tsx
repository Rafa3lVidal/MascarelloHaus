import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const AreaIndividual: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
    privacyConsent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPageData(data);
      } catch (err) {
        console.error('Erro ao carregar página de área de atuação:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadPage();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formData.nome || !formData.email || !formData.telefone) {
      setStatusMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    if (!formData.privacyConsent) {
      setStatusMessage({ type: 'error', text: 'É necessário concordar com o aviso de privacidade.' });
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
        page_source: slug || 'area-de-atuacao'
      });

      if (error) throw error;

      setStatusMessage({
        type: 'success',
        text: 'Obrigado pelo contato! Retornaremos com orientações sobre esta área em breve.'
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
        text: 'Falha no envio da mensagem. Por favor, tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <p>Carregando informações...</p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Página não encontrada</h2>
        <Link to="/areas-de-atuacao/" className="btn btn-primary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Ver Todas as Áreas
        </Link>
      </div>
    );
  }

  return (
    <div className="practice-detail-page">
      <SEO
        title={`${pageData.title} | Mascârello Haus Advocacia`}
        description={pageData.seo_description || `Atuação jurídica especializada em ${pageData.title}.`}
        canonical={`https://mascarellohaus.adv.br/${slug}/`}
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Área de Atuação</span>
          <h1 className="banner-title">{pageData.title}</h1>
          <p className="banner-desc">Assessoria consultiva e contenciosa especializada.</p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container detail-grid">
          {/* Conteúdo HTML Dinâmico da Área */}
          <div className="content-col">
            <div
              className="entry-content"
              dangerouslySetInnerHTML={{ __html: pageData.content_html }}
            />
          </div>

          {/* Formulário Lateral de Contato */}
          <div className="sidebar-col">
            <div className="wpforms-container sticky-card">
              <h3>Fale com um Especialista</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
                Solicite uma avaliação jurídica para o seu caso ou empresa nesta área.
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
                    <span>Concordo com o aviso de privacidade em conformidade com a LGPD. *</span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Solicitar Atendimento <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 50px;
          align-items: flex-start;
        }
        .entry-content {
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--color-text-main);
        }
        .entry-content p {
          margin-bottom: 20px;
        }
        .entry-content h2, .entry-content h3 {
          margin-top: 35px;
          margin-bottom: 16px;
        }
        .entry-content ul, .entry-content ol {
          margin-bottom: 20px;
          padding-left: 25px;
        }
        .entry-content li {
          margin-bottom: 8px;
        }
        .sticky-card {
          position: sticky;
          top: 100px;
        }
        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
