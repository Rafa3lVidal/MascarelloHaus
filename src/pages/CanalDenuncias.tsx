import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { AlertTriangle, Send, CheckCircle2, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CanalDenuncias: React.FC = () => {
  const [formData, setFormData] = useState({
    fatos: [] as string[],
    trabalhaEscritorio: 'Não',
    denuncianteNome: '',
    pessoaEnvolvida: '',
    dataIncidente: '',
    descricao: '',
    anonimo: true,
    termosAceitos: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);

  const fatosOpcoes = [
    'Corrupção ou suborno',
    'Não seguimento de boas práticas',
    'Descumprimento de procedimentos de trabalho estabelecidos',
    'Racismo, assédio moral/sexual, violência ou discriminação',
    'Vazamento ou mau uso de dados pessoais',
    'Outros'
  ];

  const handleCheckboxChange = (fato: string) => {
    if (formData.fatos.includes(fato)) {
      setFormData({ ...formData, fatos: formData.fatos.filter((f) => f !== fato) });
    } else {
      setFormData({ ...formData, fatos: [...formData.fatos, fato] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pessoaEnvolvida || !formData.descricao) {
      alert('Por favor, preencha a pessoa envolvida e a descrição do incidente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const prot = `DENUNCIA-${datePart}-${randomPart}`;

      await supabase.from('audit_log').insert({
        action: 'DENUNCIA_SUBMETIDA',
        table_name: 'denuncias_compliance',
        record_id: prot,
        new_data: {
          protocol: prot,
          fatos: formData.fatos,
          anonimo: formData.anonimo,
          denunciante: formData.anonimo ? 'ANÔNIMO' : formData.denuncianteNome,
          pessoaEnvolvida: formData.pessoaEnvolvida,
          descricao: formData.descricao
        }
      });

      setProtocol(prot);
      setSubmitted(true);
    } catch {
      alert('Erro ao enviar o relato. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="denuncias-page">
      <SEO
        title="Canal de Denúncias | Mascârello Haus Advocacia"
        description="Canal de denúncias independente e sigiloso do Mascârello Haus Advocacia. Garantia absoluta de anonimato e proteção contra retaliação."
        canonical="https://mascarellohaus.adv.br/canal-de-denuncias/"
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Compliance & Governança</span>
          <h1 className="banner-title">Canal de Denúncias</h1>
          <p className="banner-desc">Canal independente, confidencial e seguro para manifestações éticas.</p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="security-banner">
            <Lock size={22} className="cookie-icon" />
            <div>
              <strong>Garantia de Anonimato e Confidencialidade:</strong> Este canal é protegido por criptografia de ponta a ponta. Você não é obrigado a se identificar caso deseje manter sigilo integral.
            </div>
          </div>

          <div className="wpforms-container" style={{ marginTop: '30px' }}>
            {submitted ? (
              <div className="protocol-success-card">
                <CheckCircle2 size={45} style={{ color: '#38a169', marginBottom: '15px' }} />
                <h2>Relato Registrado com Sucesso</h2>
                <p>Seu número de protocolo confidencial:</p>
                <div className="protocol-number">{protocol}</div>
                <p className="protocol-note">
                  O relato foi recebido diretamente pelo comitê de integridade e será investigado com o máximo rigor técnico e discrição.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    A sua preocupação é sobre quais fatos? <span className="required">*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {fatosOpcoes.map((fato) => (
                      <label key={fato} className="form-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.fatos.includes(fato)}
                          onChange={() => handleCheckboxChange(fato)}
                        />
                        <span>{fato}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label className="form-label">Você trabalha ou presta serviços ao escritório?</label>
                  <select
                    className="form-control"
                    value={formData.trabalhaEscritorio}
                    onChange={(e) => setFormData({ ...formData, trabalhaEscritorio: e.target.value })}
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pessoa(s) envolvida(s) no incidente <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Nome ou setor envolvido"
                    value={formData.pessoaEnvolvida}
                    onChange={(e) => setFormData({ ...formData, pessoaEnvolvida: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descreva o evento em detalhes <span className="required">*</span></label>
                  <textarea
                    className="form-control"
                    required
                    rows={5}
                    placeholder="Relate com clareza o que aconteceu, datas aproximadas, locais e eventuais testemunhas."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.anonimo}
                      onChange={(e) => setFormData({ ...formData, anonimo: e.target.checked })}
                    />
                    <span>Desejo manter este relato totalmente <strong>ANÔNIMO</strong>.</span>
                  </label>
                </div>

                {!formData.anonimo && (
                  <div className="form-group">
                    <label className="form-label">Seu Nome e Contato (Opcional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nome e telefone/e-mail para contato"
                      value={formData.denuncianteNome}
                      onChange={(e) => setFormData({ ...formData, denuncianteNome: e.target.value })}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '20px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registrando...' : (
                    <>
                      Enviar Relato Confidencial <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .security-banner {
          background: #ebf8ff;
          border: 1px solid #bee3f8;
          color: #2b6cb0;
          padding: 18px 22px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 0.95rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
