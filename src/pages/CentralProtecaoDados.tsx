import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { Shield, FileText, Send, CheckCircle2, AlertCircle, Download, Clock, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CentralProtecaoDados: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'aviso' | 'termos' | 'requisicao'>('info');
  
  // Form states
  const [formData, setFormData] = useState({
    nomeSolicitante: '',
    canalRetorno: 'E-mail',
    nomeTitular: '',
    dadoContato: '',
    descricao: '',
    contatoPrevio: '',
    tipoRequisicao: 'Confirmacao da existencia de tratamento e acesso aos dados (Art. 18, I e II)'
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
    } catch {
      setErrorMessage('Erro ao registrar a requisição. Por favor, tente novamente ou entre em contato pelo e-mail privacidade@mascarellohaus.adv.br.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lgpd-central-page">
      <SEO
        title="Central de Proteção de Dados | Mascârello Haus Advocacia"
        description="Esta é nossa página de proteção de dados e privacidade. Nela você vai encontrar todas as políticas, termos e orientações."
        canonical="https://mascarellohaus.adv.br/central-de-protecao-de-dados/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Central de Proteção de Dados</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '800px' }}>
            Esta é nossa página de proteção de dados e privacidade. Nela você vai encontrar todas as políticas, termos e orientações.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Navegação por Abas (Tabs) */}
          <div className="tabs-nav-bar">
            <button
              className={`tab-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Informações
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'aviso' ? 'active' : ''}`}
              onClick={() => setActiveTab('aviso')}
            >
              Aviso de Privacidade
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'termos' ? 'active' : ''}`}
              onClick={() => setActiveTab('termos')}
            >
              Termos de Uso
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'requisicao' ? 'active' : ''}`}
              onClick={() => setActiveTab('requisicao')}
            >
              Requisição do titular de dados
            </button>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className="tab-content-container">
            {/* ABA 1: INFORMAÇÕES */}
            {activeTab === 'info' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">Informações</h3>
                <p style={{ marginBottom: '18px', lineHeight: '1.7' }}>
                  Caso haja alguma dúvida ou queira exercer seus direitos enquanto titular de dados, previstos no art. 18 e demais da LGPD, você pode entrar em contato conosco por meio da nossa Encarregada de Dados (DPO). Vejamos:
                </p>
                <ul className="lgpd-rights-list">
                  <li>• Confirmação da existência de tratamento;</li>
                  <li>• Acesso aos dados;</li>
                  <li>• Correção de dados incompletos, inexatos ou desatualizados;</li>
                  <li>• Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto na LGPD;</li>
                  <li>• Portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa, de acordo com a regulamentação da Autoridade Nacional, observados os segredos comercial e industrial;</li>
                  <li>• Eliminação dos dados pessoais tratados com o consentimento do(a) titular, exceto nas hipóteses previstas no art. 16 da Lei;</li>
                  <li>• Informação das entidades públicas e privadas com as quais o Controlador realizou uso compartilhado de dados;</li>
                  <li>• Informação sobre a possibilidade de não fornecer consentimento e sobre consequências da negativa;</li>
                  <li>• Revogação do consentimento, nos termos do § 5.º do art. 8.º da Lei.</li>
                </ul>

                <div className="dpo-contact-card">
                  <UserCheck size={28} className="dpo-icon" />
                  <div>
                    <h4>Encarregada de Dados (DPO)</h4>
                    <p><strong>Responsável:</strong> Mirataira Haus</p>
                    <p><strong>E-mail:</strong> <a href="mailto:privacidade@mascarellohaus.adv.br">privacidade@mascarellohaus.adv.br</a></p>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: AVISO DE PRIVACIDADE */}
            {activeTab === 'aviso' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">Aviso de Privacidade</h3>
                <p style={{ marginBottom: '15px', lineHeight: '1.7' }}>
                  O escritório Mascârello Haus Advocacia e Consultoria Jurídica valoriza e respeita a privacidade de todos os titulares que se relacionam com nossas atividades.
                </p>
                <div className="aviso-box">
                  <p>
                    Nosso Aviso de Privacidade detalha de forma clara e transparente a forma como coletamos, tratamos, armazenamos e compartilhamos os seus dados pessoais em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    Para consultar o documento na íntegra ou solicitar esclarecimentos adicionais, entre em contato com nosso Encarregado pelo e-mail <strong>privacidade@mascarellohaus.adv.br</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* ABA 3: TERMOS DE USO */}
            {activeTab === 'termos' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">TERMOS DE USO</h3>
                <div className="termos-content-scroll">
                  <h4>MASCARELLO HAUS ADVOCACIA E CONSULTORIA (Versão 1)</h4>
                  <p>
                    O presente termo regula o acesso e condições de uso do site https://mascarellohaus.adv.br/, bem como os serviços oferecidos por meio da aplicação, estabelecendo os direitos e as obrigações dos usuários.
                  </p>
                  <h5>1. QUEM SOMOS</h5>
                  <p>
                    Atualmente, somos um escritório dedicado a atender às necessidades e riscos, em fomento da conformidade e boas práticas relacionadas a regulação do mercado, direcionado ao Compliance nas mais diversas áreas, em especial à proteção de Dados. Por meio de equipe multidisciplinar, orienta e desenvolve estratégias que atendam aspectos regulamentares, de governança corporativa e de segurança da informação em respeito à metodologia aplicável a cada segmento.
                  </p>
                  <p>
                    De maneira proativa também atua nas organizações da sociedade civil em projetos sociais e Advocacia Pro Bono.
                  </p>
                  <p>
                    O foco da Mascarello Haus está na expectativa de resultado do cliente. E, na busca contínua pela excelência na prestação dos serviços, promovendo a facilitação dos processos de adequação às normas vigentes e boas práticas de mercado em prol da integridade e proteção, pois são fatores que contribuem na melhoria e crescimento dos negócios.
                  </p>
                  <h5>2. TERMOS E DEFINIÇÕES</h5>
                  <p>
                    Para a leitura e compreensão deste texto, os termos listados terão o significado conforme expresso a seguir:
                  </p>
                  <p>
                    <strong>Cookies:</strong> Arquivos gerados automaticamente e guardados nos dispositivos dos Usuários ao acessarem os sítios na internet, os quais retêm informações identificadoras do dispositivo e da atividade de navegação.
                  </p>
                  <p>
                    <strong>Informações de Usuário:</strong> Dados identificativos de um usuário específico, subdivididos em informações pessoais (nome, endereço de e-mail, contato telefônico) e informações de navegação.
                  </p>
                </div>
              </div>
            )}

            {/* ABA 4: REQUISIÇÃO DO TITULAR DE DADOS */}
            {activeTab === 'requisicao' && (
              <div className="tab-pane">
                <h3 className="tab-pane-title">Diga-nos quem você é</h3>
                <p style={{ color: 'var(--color-text-main)', fontSize: '0.92rem', marginBottom: '25px' }}>
                  Preencha o formulário abaixo para formalizar sua requisição nos termos do artigo 18 da LGPD:
                </p>

                {protocolGenerated ? (
                  <div className="protocol-success-box">
                    <CheckCircle2 size={40} style={{ color: '#0d3732', marginBottom: '12px' }} />
                    <h4>Solicitação Registrada com Sucesso!</h4>
                    <p>Guarde o seu número de protocolo para acompanhamento:</p>
                    <div className="protocol-badge">{protocolGenerated}</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                      Nossa equipe responderá sua solicitação conclusivamente pelo canal informado dentro do prazo legal.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setProtocolGenerated(null)}
                      style={{ marginTop: '18px' }}
                    >
                      Fazer Nova Solicitação
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {errorMessage && (
                      <div className="form-error-banner">
                        <AlertCircle size={18} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Nome do Solicitante *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.nomeSolicitante}
                        onChange={(e) => setFormData({ ...formData, nomeSolicitante: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Como devemos retornar seu contato? *</label>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                        {['Presencialmente', 'E-mail', 'Telefone'].map((opt) => (
                          <label key={opt} className="form-checkbox-label">
                            <input
                              type="radio"
                              name="retorno"
                              checked={formData.canalRetorno === opt}
                              onChange={() => setFormData({ ...formData, canalRetorno: opt })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dado para Contato (E-mail ou Telefone com DDD) *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="exemplo@email.com ou (49) 98822-0982"
                        value={formData.dadoContato}
                        onChange={(e) => setFormData({ ...formData, dadoContato: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nome do titular dos dados (caso seja terceira pessoa):</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Deixe em branco se for em nome próprio"
                        value={formData.nomeTitular}
                        onChange={(e) => setFormData({ ...formData, nomeTitular: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tipo de Direito que deseja exercer (Art. 18 LGPD) *</label>
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
                      <label className="form-label">Descrição detalhada da solicitação *</label>
                      <textarea
                        className="form-control"
                        required
                        rows={4}
                        placeholder="Descreva detalhadamente sua requisição."
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                      {isSubmitting ? 'Enviando...' : (
                        <>
                          Enviar Requisição <Send size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
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
        .tabs-nav-bar {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 30px;
          overflow-x: auto;
        }
        .tab-nav-btn {
          background: transparent;
          border: none;
          padding: 14px 22px;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-text-main);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .tab-nav-btn:hover {
          color: var(--color-accent);
        }
        .tab-nav-btn.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-accent);
          font-weight: 600;
        }
        .tab-content-container {
          background: #ffffff;
          padding: 40px 35px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        }
        .tab-pane-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: var(--color-primary);
          margin-bottom: 18px;
        }
        .lgpd-rights-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          color: var(--color-text-main);
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .dpo-contact-card {
          display: flex;
          align-items: center;
          gap: 18px;
          background-color: var(--color-bg-light);
          padding: 22px;
          border-radius: 8px;
          border-left: 4px solid var(--color-accent);
        }
        .dpo-icon {
          color: var(--color-accent);
          flex-shrink: 0;
        }
        .dpo-contact-card h4 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--color-primary);
          margin-bottom: 4px;
        }
        .dpo-contact-card a {
          color: var(--color-accent);
        }
        .aviso-box {
          background-color: var(--color-bg-light);
          padding: 25px;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text-main);
        }
        .termos-content-scroll {
          max-height: 500px;
          overflow-y: auto;
          padding-right: 15px;
          font-family: var(--font-sans);
          font-size: 0.92rem;
          line-height: 1.7;
          color: var(--color-text-main);
        }
        .termos-content-scroll h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--color-primary);
          margin-bottom: 14px;
        }
        .termos-content-scroll h5 {
          font-family: var(--font-serif);
          font-size: 1.1rem;
          color: var(--color-primary);
          margin: 18px 0 8px 0;
        }
        .protocol-success-box {
          text-align: center;
          padding: 30px 15px;
        }
        .protocol-badge {
          display: inline-block;
          background: var(--color-bg-light);
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 700;
          color: var(--color-primary);
          font-size: 1.15rem;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};
