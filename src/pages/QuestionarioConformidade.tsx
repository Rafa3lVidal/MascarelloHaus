import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { CheckCircle2, AlertCircle, Send, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const QuestionarioConformidade: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    cnpj: '',
    nomeEmpresa: '',
    endereco: '',
    responsavel: '',
    contatoEmail: '',
    respostas: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const questions = [
    {
      id: 1,
      text: '1 – Sua empresa possui contrato formal com este controlador (contratante) e qual o período de vigência?'
    },
    {
      id: 2,
      text: '2 – Sua empresa possui política de privacidade e retenção de dados documentada?'
    },
    {
      id: 3,
      text: '3 – Sua empresa realiza treinamentos regulares sobre proteção de dados com seus funcionários ou terceiros prestadores?'
    },
    {
      id: 4,
      text: '4 – A empresa possui Encarregado de Dados (DPO) formalmente nomeado?'
    },
    {
      id: 5,
      text: '5 – Sua empresa realiza mapeamento de dados (Data Mapping) ou registro das operações de tratamento (ROPA)?'
    },
    {
      id: 6,
      text: '6 – A empresa utiliza medidas técnicas como criptografia, pseudoanonimização e backups seguros nas bases de dados?'
    },
    {
      id: 7,
      text: '7 – Sua empresa possui política e procedimentos formais de gestão e resposta a incidentes de segurança da informação?'
    }
  ];

  const handleOptionChange = (questionId: number, val: 'Sim' | 'Não') => {
    setFormData({
      ...formData,
      respostas: {
        ...formData.respostas,
        [questionId]: val
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.cnpj || !formData.nomeEmpresa || !formData.responsavel || !formData.contatoEmail) {
      setErrorMsg('Por favor, preencha os dados cadastrais da empresa.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('quiz_submissions').insert({
        quiz_id: 1,
        company_name: formData.nomeEmpresa,
        respondent_name: formData.responsavel,
        respondent_email: formData.contatoEmail,
        answers: {
          cnpj: formData.cnpj,
          endereco: formData.endereco,
          respostas: formData.respostas
        },
        score: 100
      });

      if (error) throw error;
      setSubmitted(true);
    } catch {
      setErrorMsg('Erro ao enviar o questionário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="quiz-page">
      <SEO
        title="Questionário de conformidade e proteção de dados para fornecedores | Mascârello Haus Advocacia"
        description="Questionário de conformidade e proteção de dados para fornecedores. Avaliação de conformidade com a LGPD e governança corporativa."
        canonical="https://mascarellohaus.adv.br/questionario-de-conformidade/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">
            Questionário de conformidade e proteção <br />de dados para fornecedores
          </h1>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="wpforms-container">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={45} style={{ color: '#0d3732', marginBottom: '15px' }} />
                <h3 style={{ marginBottom: '10px' }}>Questionário Enviado com Sucesso!</h3>
                <p style={{ color: 'var(--color-text-main)', lineHeight: '1.6' }}>
                  Agradecemos o preenchimento. Nossos especialistas em Compliance e LGPD analisarão as informações encaminhadas e entrarão em contato pelo e-mail <strong>{formData.contatoEmail}</strong> com o diagnóstico.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setSubmitted(false)}
                  style={{ marginTop: '20px' }}
                >
                  Preencher Novamente
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: '8px' }}>Dados da Empresa Fornecedora</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '25px' }}>
                  Preencha as informações para registro da conformidade com as diretrizes da LGPD.
                </p>

                {errorMsg && (
                  <div className="form-error-banner">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">CNPJ *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nome da Empresa *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Endereço *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Responsável ou Encarregado de Dados *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">E-mail de Contato *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.contatoEmail}
                      onChange={(e) => setFormData({ ...formData, contatoEmail: e.target.value })}
                    />
                  </div>
                </div>

                <hr style={{ margin: '30px 0', borderColor: '#e2e8f0' }} />

                <h3 style={{ marginBottom: '20px' }}>Perguntas de Conformidade</h3>

                <div className="quiz-questions-list">
                  {questions.map((q) => (
                    <div key={q.id} className="quiz-q-item">
                      <p className="q-text">{q.text} *</p>
                      <div className="q-options">
                        <label className="form-checkbox-label">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            required
                            checked={formData.respostas[q.id] === 'Sim'}
                            onChange={() => handleOptionChange(q.id, 'Sim')}
                          />
                          <span>Sim</span>
                        </label>
                        <label className="form-checkbox-label">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            required
                            checked={formData.respostas[q.id] === 'Não'}
                            onChange={() => handleOptionChange(q.id, 'Não')}
                          />
                          <span>Não</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '30px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Questionário <Send size={16} />
                    </>
                  )}
                </button>
              </form>
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
        .quiz-questions-list {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .quiz-q-item {
          background: var(--color-bg-light);
          padding: 18px 20px;
          border-radius: 6px;
          border-left: 3px solid var(--color-primary);
        }
        .q-text {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-primary);
          margin-bottom: 12px;
        }
        .q-options {
          display: flex;
          gap: 30px;
        }
      `}</style>
    </div>
  );
};
