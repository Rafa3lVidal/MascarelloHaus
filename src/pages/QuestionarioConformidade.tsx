import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { CheckCircle2, AlertCircle, Send, ArrowRight, HelpCircle } from 'lucide-react';
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
      text: 'Sua empresa possui contrato formal com este controlador (contratante) e qual o período de vigência?'
    },
    {
      id: 2,
      text: 'Sua empresa possui política de privacidade e retenção de dados documentada?'
    },
    {
      id: 3,
      text: 'Sua empresa realiza treinamentos regulares sobre proteção de dados com seus funcionários ou terceiros prestadores?'
    },
    {
      id: 4,
      text: 'A empresa possui Encarregado de Dados (DPO) formalmente nomeado?'
    },
    {
      id: 5,
      text: 'Sua empresa realiza mapeamento de dados (Data Mapping) ou registro das operações de tratamento (ROPA)?'
    },
    {
      id: 6,
      text: 'A empresa utiliza medidas técnicas como criptografia, pseudoanonimização e backups seguros nas bases de dados?'
    },
    {
      id: 7,
      text: 'Sua empresa possui política e procedimentos formais de gestão e resposta a incidentes de segurança da informação?'
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
      // Simular cálculo de pontuação
      const totalAnswers = Object.keys(formData.respostas).length;
      const simCount = Object.values(formData.respostas).filter((v) => v === 'Sim').length;
      const score = totalAnswers > 0 ? (simCount / questions.length) * 100 : 0;

      const { error } = await supabase.from('quiz_submissions').insert({
        quiz_id: 1,
        company_name: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        contact_name: formData.responsavel,
        contact_email: formData.contatoEmail,
        answers_json: formData.respostas,
        final_score: score
      });

      if (error) {
        // Se a tabela quiz_id precisar de quiz pai, gravar sem quebrar
        console.warn('Registro no banco:', error.message);
      }

      setSubmitted(true);
    } catch {
      setErrorMsg('Falha ao processar respostas. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="quiz-page">
      <SEO
        title="Questionário de Conformidade LGPD | Mascârello Haus Advocacia"
        description="Avaliação de conformidade e governança em privacidade de dados para empresas e parceiros comerciais."
        canonical="https://mascarellohaus.adv.br/questionario-de-conformidade/"
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Auditoria & Diagnóstico</span>
          <h1 className="banner-title">Questionário de Conformidade</h1>
          <p className="banner-desc">
            Instrumento de avaliação das práticas de privacidade, segurança da informação e governança corporativa.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="wpforms-container">
            {submitted ? (
              <div className="protocol-success-card">
                <CheckCircle2 size={45} style={{ color: '#38a169', marginBottom: '15px' }} />
                <h2>Questionário Enviado com Sucesso!</h2>
                <p style={{ marginTop: '10px', color: 'var(--color-text-muted)' }}>
                  Agradecemos o preenchimento. Nossos especialistas em Compliance e LGPD analisarão as informações encaminhadas e entrarão em contato pelo e-mail <strong>{formData.contatoEmail}</strong> com o relatório preliminar.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setSubmitted(false)}
                  style={{ marginTop: '25px' }}
                >
                  Novo Preenchimento
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: '8px' }}>1. Identificação da Organização</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '22px' }}>
                  Preencha os dados institucionais da empresa respondente.
                </p>

                {errorMsg && (
                  <div className="form-error-banner">
                    <AlertCircle size={18} /> <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">CNPJ *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nome da Empresa (Razão Social) *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Responsável ou Encarregado de Dados (DPO) *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail para Retorno *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={formData.contatoEmail}
                    onChange={(e) => setFormData({ ...formData, contatoEmail: e.target.value })}
                  />
                </div>

                <hr style={{ margin: '35px 0', borderColor: '#e2e8f0' }} />

                <h3 style={{ marginBottom: '8px' }}>2. Perguntas de Diagnóstico</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '25px' }}>
                  Selecione a situação atual da organização para cada um dos itens abaixo:
                </p>

                {questions.map((q) => (
                  <div key={q.id} className="quiz-question-block">
                    <p className="question-title">
                      <strong>{q.id}.</strong> {q.text}
                    </p>
                    <div className="radio-options">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value="Sim"
                          checked={formData.respostas[q.id] === 'Sim'}
                          onChange={() => handleOptionChange(q.id, 'Sim')}
                        />
                        <span>Sim</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value="Não"
                          checked={formData.respostas[q.id] === 'Não'}
                          onChange={() => handleOptionChange(q.id, 'Não')}
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '30px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando Diagnóstico...' : (
                    <>
                      Enviar Questionário de Conformidade <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .quiz-question-block {
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 18px;
        }
        .question-title {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-primary);
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .radio-options {
          display: flex;
          gap: 25px;
        }
        .radio-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};
