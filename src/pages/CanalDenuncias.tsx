import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { AlertTriangle, Send, CheckCircle2, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CanalDenuncias: React.FC = () => {
  const [formData, setFormData] = useState({
    fatos: [] as string[],
    trabalhaEscritorio: 'Não',
    queixaCompliance: 'Não',
    denuncianteNome: '',
    pessoaEnvolvida: '',
    dataIncidente: '',
    horaIncidente: '',
    localizacao: '',
    descricao: '',
    concordaTermos: false,
    naoQuerDivulgarDados: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);

  const fatosOpcoes = [
    'Corrupção por parte de colaboradores da Mascarello Haus',
    'Não seguimento de boas práticas',
    'Descumprimento de procedimentos de trabalho estabelecidos',
    'Racismo, assédio, violência, discriminação, xenofobia, preconceito de classes e afins',
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
      alert('Por favor, preencha a(s) pessoa(s) envolvida(s) e a descrição do evento.');
      return;
    }
    if (!formData.concordaTermos) {
      alert('É necessário concordar com os Termos de Uso.');
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
          trabalhaEscritorio: formData.trabalhaEscritorio,
          queixaCompliance: formData.queixaCompliance,
          denunciante: formData.naoQuerDivulgarDados ? 'ANÔNIMO' : formData.denuncianteNome,
          pessoaEnvolvida: formData.pessoaEnvolvida,
          dataIncidente: formData.dataIncidente,
          horaIncidente: formData.horaIncidente,
          localizacao: formData.localizacao,
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
        description="Ocasionalmente nos deparamos com situações de desvio de conduta, mas nos sentimos impotentes ou intimidados e acabamos por não fazer nada. Por isso o escritório Mascarello Haus conta com uma ferramenta para colaboradores, clientes e parceiros de negócios relatarem suspeitas de fraudes, desvios, má conduta ou qualquer fato que seja contrário ao nosso código de conduta."
        canonical="https://mascarellohaus.adv.br/canal-de-denuncias/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Canal de Denúncias</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '850px' }}>
            Ocasionalmente nos deparamos com situações de desvio de conduta, mas nos sentimos impotentes ou intimidados e acabamos por não fazer nada. Por isso o escritório Mascarello Haus conta com uma ferramenta para colaboradores, clientes e parceiros de negócios relatarem suspeitas de fraudes, desvios, má conduta ou qualquer fato que seja contrário ao nosso código de conduta.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '850px' }}>
          {/* Caixa de Informações */}
          <div className="info-orientacoes-box">
            <h3>Informações</h3>
            <p>Para nós, é muito importante que sua denúncia seja realizada com a maior riqueza de detalhes possíveis, como:</p>
            <ul>
              <li>• Data da ocorrência.</li>
              <li>• Onde e como aconteceu ou está acontecendo.</li>
              <li>• Quem são as pessoas envolvidas.</li>
            </ul>
            <p style={{ marginTop: '14px' }}>
              Se for possível nos encaminhar evidências como fotos, documentos e/ou outras informações relevantes, poderá contribuir ainda mais com a investigação.
            </p>
            <p>
              <strong>Mas fique tranquilo(a)!!</strong><br />
              Caso não tenha todas essas informações, sua denúncia pode ser registrada da mesma maneira.
            </p>
          </div>

          <div className="wpforms-container" style={{ marginTop: '35px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={45} style={{ color: '#0d3732', marginBottom: '15px' }} />
                <h3 style={{ marginBottom: '10px' }}>Denúncia Registrada com Sucesso</h3>
                <p style={{ color: 'var(--color-text-main)', marginBottom: '18px' }}>
                  Seu relato foi recebido em nosso ambiente de compliance sigiloso e independente.
                </p>
                <div style={{ background: '#f5f7f8', padding: '15px', borderRadius: '6px', display: 'inline-block' }}>
                  <strong>Protocolo:</strong> <code style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{protocol}</code>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ marginBottom: '10px' }}>Formulário de Denúncia</h3>
                <p style={{ color: 'var(--color-text-main)', fontSize: '0.92rem', marginBottom: '25px', lineHeight: '1.6' }}>
                  Prezado(a) Denunciante, este canal de comunicação entre você e a Mascarello Haus, foi criado como um canal legítimo para o recebimento de sua denúncia. Abaixo segue formulário para ser preenchido, garantimos o total sigilo de suas informações caso se sinta a vontade para se identificar.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">A sua preocupação é sobre quais fatos? *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {fatosOpcoes.map((op, idx) => (
                        <label key={idx} className="form-checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.fatos.includes(op)}
                            onChange={() => handleCheckboxChange(op)}
                          />
                          <span>{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">Você trabalha na Mascarello Haus ou presta serviços ao escritório?</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                      <label className="form-checkbox-label">
                        <input
                          type="radio"
                          name="trabalha"
                          checked={formData.trabalhaEscritorio === 'Sim'}
                          onChange={() => setFormData({ ...formData, trabalhaEscritorio: 'Sim' })}
                        />
                        <span>Sim</span>
                      </label>
                      <label className="form-checkbox-label">
                        <input
                          type="radio"
                          name="trabalha"
                          checked={formData.trabalhaEscritorio === 'Não'}
                          onChange={() => setFormData({ ...formData, trabalhaEscritorio: 'Não' })}
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">Você atualmente tem alguma queixa a nível de Compliance do Mascarello Haus?</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                      <label className="form-checkbox-label">
                        <input
                          type="radio"
                          name="queixa"
                          checked={formData.queixaCompliance === 'Sim'}
                          onChange={() => setFormData({ ...formData, queixaCompliance: 'Sim' })}
                        />
                        <span>Sim</span>
                      </label>
                      <label className="form-checkbox-label">
                        <input
                          type="radio"
                          name="queixa"
                          checked={formData.queixaCompliance === 'Não'}
                          onChange={() => setFormData({ ...formData, queixaCompliance: 'Não' })}
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">Denunciante – Pessoa que relatou o incidente</label>
                    <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      Testemunha que está relatando o fato – Não obrigatório, você não precisa se identificar
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Deixe em branco para relato 100% anônimo"
                      value={formData.denuncianteNome}
                      onChange={(e) => setFormData({ ...formData, denuncianteNome: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pessoa(s) envolvida no incidente *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.pessoaEnvolvida}
                      onChange={(e) => setFormData({ ...formData, pessoaEnvolvida: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                      <label className="form-label">Data do incidente</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dataIncidente}
                        onChange={(e) => setFormData({ ...formData, dataIncidente: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hora do incidente</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.horaIncidente}
                        onChange={(e) => setFormData({ ...formData, horaIncidente: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Localização do incidente</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descreva o evento em detalhes. *</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      required
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        required
                        checked={formData.concordaTermos}
                        onChange={(e) => setFormData({ ...formData, concordaTermos: e.target.checked })}
                      />
                      <span>Li e concordo com os Termos de Uso *</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        required
                        checked={formData.naoQuerDivulgarDados}
                        onChange={(e) => setFormData({ ...formData, naoQuerDivulgarDados: e.target.checked })}
                      />
                      <span>Não quero divulgar meus dados e concordo em não receber mais informações sobre o fato ocorrido. *</span>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : (
                      <>
                        Enviar Denúncia <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
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
        .info-orientacoes-box {
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          border-left: 4px solid var(--color-accent);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-text-main);
          line-height: 1.65;
        }
        .info-orientacoes-box h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: var(--color-primary);
          margin-bottom: 12px;
        }
        .info-orientacoes-box ul {
          list-style: none;
          padding-left: 10px;
          margin: 10px 0;
        }
        .info-orientacoes-box li {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
};
