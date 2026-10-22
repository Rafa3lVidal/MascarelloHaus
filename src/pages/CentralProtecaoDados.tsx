import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Shield, FileText, Send, CheckCircle2, AlertCircle, Download, Clock, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CentralProtecaoDados: React.FC = () => {
  const [formData, setFormData] = useState({
    nomeSolicitante: '',
    canalRetorno: 'E-mail',
    nomeTitular: '',
    dadoContato: '',
    descricao: '',
    contatoPrevio: '',
    tipoRequisicao: 'Confirmacao e Acesso aos Dados (Art. 18, I e II)'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocolGenerated, setProtocolGenerated] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestTypes = [
    'Confirmacao da existencia de tratamento e acesso aos dados (Art. 18, I e II)',
    'Correcao de dados incompletos, inexatos ou desatualizados (Art. 18, III)',
    'Anonimizacao, bloqueio ou eliminacao de dados desnecessarios (Art. 18, IV)',
    'Portabilidade dos dados a outro fornecedor de servico (Art. 18, V)',
    'Eliminacao dos dados pessoais tratados com consentimento (Art. 18, VI)',
    'Informacao sobre compartilhamento com entidades publicas e privadas (Art. 18, VII)',
    'Revogacao do consentimento (Art. 18, IX)',
    'Outra solicitacao'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.nomeSolicitante || !formData.dadoContato || !formData.descricao) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios indicados com *.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Gerar protocolo formato MH-LGPD-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const protocol = `MH-LGPD-${datePart}-${randomPart}`;

      const { error } = await supabase.from('data_subject_requests').insert({
        protocol,
        requester_name: formData.nomeSolicitante,
        contact_channel: formData.canalRetorno,
        contact_info: formData.dadoContato,
        is_third_party: !!formData.nomeTitular,
        data_subject_name: formData.nomeTitular || formData.nomeSolicitante,
        request_type: formData.tipoRequisicao,
        description: formData.descricao,
        has_prior_contact: !!formData.contatoPrevio,
        prior_contact_details: formData.contatoPrevio,
        status: 'recebido'
      });

      if (error) throw error;

      setProtocolGenerated(protocol);
    } catch (err: any) {
      setErrorMessage('Erro ao registrar a requisição. Por favor, tente novamente ou entre em contato pelo e-mail privacidade@mascarellohaus.adv.br.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lgpd-page">
      <SEO
        title="Central de Proteção de Dados (LGPD) | Mascârello Haus Advocacia"
        description="Canal oficial do Encarregado pelo Tratamento de Dados Pessoais (DPO). Exerça seus direitos previstos no Art. 18 da Lei 13.709/2018 com transparência e segurança."
        canonical="https://mascarellohaus.adv.br/central-de-protecao-de-dados/"
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Privacidade & Conformidade</span>
          <h1 className="banner-title">Central de Proteção de Dados</h1>
          <p className="banner-desc">
            Compromisso inegociável com a sua privacidade, segurança das informações e atendimento integral à LGPD.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
          <div className="lgpd-overview-grid">
            <div className="overview-card">
              <UserCheck className="overview-icon" size={32} />
              <h3>Canal do Encarregado (DPO)</h3>
              <p>
                Nosso canal oficial para atender titulares de dados e interagir com a Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
              <span className="email-badge">privacidade@mascarellohaus.adv.br</span>
            </div>

            <div className="overview-card">
              <Clock className="overview-icon" size={32} />
              <h3>Prazo Legal de Resposta</h3>
              <p>
                Suas solicitações geram um protocolo imediato e são respondidas conclusivamente dentro do prazo legal de até 15 dias.
              </p>
              <span className="email-badge">Art. 19, II — Lei 13.709/2018</span>
            </div>

            <div className="overview-card">
              <Shield className="overview-icon" size={32} />
              <h3>Segurança da Informação</h3>
              <p>
                Adotamos controles técnicos e administrativos robustos para mitigar riscos de acessos não autorizados e incidentes de segurança.
              </p>
              <span className="email-badge">Padrão OWASP / Criptografia</span>
            </div>
          </div>

          {/* Formulário do Titular */}
          <div className="lgpd-form-section">
            <div className="wpforms-container">
              <h2>Formulário de Requisição do Titular de Dados</h2>
              <p className="form-subtitle">
                Utilize o formulário abaixo para formalizar o exercício dos seus direitos conforme o artigo 18 da LGPD.
              </p>

              {protocolGenerated ? (
                <div className="protocol-success-card">
                  <CheckCircle2 size={42} className="success-icon" />
                  <h3>Solicitação Registrada com Sucesso!</h3>
                  <p>Guarde o seu número de protocolo para acompanhamento do pedido:</p>
                  <div className="protocol-number">{protocolGenerated}</div>
                  <p className="protocol-note">
                    Um comprovante foi registrado em nossos sistemas. Nossa equipe de privacidade analisará a solicitação e responderá pelo canal de contato indicado dentro do prazo de até 15 dias úteis.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setProtocolGenerated(null);
                      setFormData({
                        nomeSolicitante: '',
                        canalRetorno: 'E-mail',
                        nomeTitular: '',
                        dadoContato: '',
                        descricao: '',
                        contatoPrevio: '',
                        tipoRequisicao: requestTypes[0]
                      });
                    }}
                    style={{ marginTop: '20px' }}
                  >
                    Fazer Nova Solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ marginTop: '25px' }}>
                  {errorMessage && (
                    <div className="form-error-banner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={18} />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      Nome Completo do Solicitante <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.nomeSolicitante}
                      onChange={(e) => setFormData({ ...formData, nomeSolicitante: e.target.value })}
                      placeholder="Nome de quem está preenchendo"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Como devemos retornar seu contato? <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.canalRetorno}
                      onChange={(e) => setFormData({ ...formData, canalRetorno: e.target.value })}
                    >
                      <option value="E-mail">E-mail</option>
                      <option value="Telefone/WhatsApp">Telefone / WhatsApp</option>
                      <option value="Presencialmente">Presencialmente no escritório</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Dado para Contato (E-mail ou Telefone com DDD) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.dadoContato}
                      onChange={(e) => setFormData({ ...formData, dadoContato: e.target.value })}
                      placeholder="exemplo@email.com ou (49) 99999-9999"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Nome do Titular dos Dados (caso esteja solicitando em nome de terceiro)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nomeTitular}
                      onChange={(e) => setFormData({ ...formData, nomeTitular: e.target.value })}
                      placeholder="Deixe em branco se for em nome próprio"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Tipo de Direito que deseja exercer (Art. 18 LGPD) <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.tipoRequisicao}
                      onChange={(e) => setFormData({ ...formData, tipoRequisicao: e.target.value })}
                    >
                      {requestTypes.map((req, i) => (
                        <option key={i} value={req}>{req}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Descrição detalhada da solicitação <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      required
                      rows={5}
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva detalhadamente sua requisição. Quanto mais detalhes você nos fornecer, mais rapidamente poderemos atender."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Você já teve contato prévio com o escritório sobre este tema? (Opcional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.contatoPrevio}
                      onChange={(e) => setFormData({ ...formData, contatoPrevio: e.target.value })}
                      placeholder="Se sim, informe com quem conversou ou o contexto."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '15px' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registrando Protocolo...' : (
                      <>
                        Enviar Solicitação e Gerar Protocolo <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Cartilhas e Documentos para Download */}
          <div className="downloads-section" style={{ marginTop: '70px' }}>
            <div className="section-title-center">
              <span className="sub-heading">Materiais Educativos Gratuitos</span>
              <h2>Cartilhas e Publicações de Segurança</h2>
            </div>

            <div className="triad-grid">
              <div className="triad-box">
                <FileText className="cookie-icon" size={28} style={{ marginBottom: '12px' }} />
                <h3>Cartilha LGPD</h3>
                <p>Introdução prática e acessível aos conceitos da Proteção de Dados Pessoais e obrigações da Lei 13.709/2018.</p>
                <Link to="/cartilha-lgpd-introducao-a-protecao-dos-dados-pessoais-e-a-lgpd/" className="founder-cta" style={{ marginTop: '15px' }}>
                  Acessar Cartilha <Download size={14} />
                </Link>
              </div>

              <div className="triad-box">
                <FileText className="cookie-icon" size={28} style={{ marginBottom: '12px' }} />
                <h3>Incidentes de Segurança</h3>
                <p>Orientações estratégicas sobre prevenção, mitigação e resposta técnica a vazamento de informações corporativas.</p>
                <Link to="/cartilha-orientacoes-sobre-incidentes-de-seguranca/" className="founder-cta" style={{ marginTop: '15px' }}>
                  Acessar Cartilha <Download size={14} />
                </Link>
              </div>

              <div className="triad-box">
                <FileText className="cookie-icon" size={28} style={{ marginBottom: '12px' }} />
                <h3>Cartilha PHISHING</h3>
                <p>Guia ilustrado de conscientização contra o famoso e malicioso ataque cibernético “clique aqui”.</p>
                <Link to="/cartilha-phishing-o-famoso-e-malicioso-clique-aqui/" className="founder-cta" style={{ marginTop: '15px' }}>
                  Acessar Cartilha <Download size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .lgpd-overview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 50px;
        }
        .overview-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 30px 25px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
        }
        .overview-icon {
          color: var(--color-accent);
          margin-bottom: 15px;
        }
        .overview-card h3 {
          font-size: 1.25rem;
          margin-bottom: 10px;
        }
        .overview-card p {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .email-badge {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary);
          background: #edf2f7;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .lgpd-form-section {
          max-width: 820px;
          margin: 0 auto;
        }
        .form-subtitle {
          color: var(--color-text-muted);
          margin-bottom: 20px;
        }
        .protocol-success-card {
          text-align: center;
          padding: 40px 20px;
        }
        .success-icon {
          color: #38a169;
          margin-bottom: 15px;
        }
        .protocol-number {
          font-family: var(--font-sans);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-primary);
          background: #edf2f7;
          border: 2px dashed var(--color-accent);
          padding: 15px;
          margin: 20px auto;
          display: inline-block;
          border-radius: 6px;
          letter-spacing: 2px;
        }
        .protocol-note {
          color: #4a5568;
          max-width: 550px;
          margin: 0 auto;
          font-size: 0.95rem;
        }
        @media (max-width: 900px) {
          .lgpd-overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
