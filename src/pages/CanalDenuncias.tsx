import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { AlertTriangle, Send, CheckCircle2, Shield, Lock, Copy, Check, FileCheck, Info } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import SecurityShield, { createInitialSecurityState } from '../components/SecurityShield';
import { supabase } from '../lib/supabase';
import {
  sanitizeText,
  generateProtocol,
  getAnonymousIpHash,
  checkClientRateLimit,
  recordClientSubmission,
  validateSecurityState,
  uploadFormFiles,
  recordFormConsent,
} from '../lib/formSecurity';

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
    naoQuerDivulgarDados: true,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopyProtocol = () => {
    if (!protocol) return;
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPessoa = sanitizeText(formData.pessoaEnvolvida, 200);
    const cleanDesc = sanitizeText(formData.descricao, 15000);
    const cleanDenunciante = sanitizeText(formData.denuncianteNome, 150);
    const cleanLoc = sanitizeText(formData.localizacao, 250);

    if (formData.fatos.length === 0) {
      setErrorMessage('Por favor, selecione ao menos uma opção sobre quais fatos se referem a sua preocupação.');
      return;
    }

    if (!cleanPessoa) {
      setErrorMessage('Por favor, informe a(s) pessoa(s) envolvida(s) no incidente.');
      return;
    }

    if (cleanDesc.length < 15) {
      setErrorMessage('Por favor, descreva o evento com mais detalhes (mínimo de 15 caracteres).');
      return;
    }

    if (!formData.concordaTermos) {
      setErrorMessage('É necessário declarar concordância com os Termos e a veracidade das informações.');
      return;
    }

    const secCheck = validateSecurityState(security);
    if (!secCheck.valid) {
      setErrorMessage(secCheck.error || 'Falha na verificação de segurança anti-spam.');
      return;
    }

    const rateCheck = checkClientRateLimit('denuncias', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setErrorMessage(`Limite de envios temporário atingido. Aguarde ${rateCheck.retryAfterSeconds} segundos.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedAttachments = await uploadFormFiles(
        files,
        'denuncias',
        'evidencias_denuncia'
      );
      const generatedProtocol = generateProtocol('DEN');
      const ipHash = await getAnonymousIpHash();

      const { error } = await supabase.from('whistleblower_reports').insert({
        protocol: generatedProtocol,
        concern_types: formData.fatos,
        works_at_firm: formData.trabalhaEscritorio,
        has_compliance_complaint: formData.queixaCompliance,
        reporter_name: formData.naoQuerDivulgarDados ? 'ANÔNIMO' : (cleanDenunciante || 'NÃO INFORMADO'),
        involved_persons: cleanPessoa,
        incident_date: formData.dataIncidente || null,
        incident_time: formData.horaIncidente || null,
        incident_location: cleanLoc || null,
        description: cleanDesc,
        is_anonymous: formData.naoQuerDivulgarDados,
        attachments_json: uploadedAttachments,
        status: 'new',
        ip_hash: ipHash,
        security_meta: {
          honeypot: security.honeypotWebsite || security.honeypotFax || '',
          challengeToken: security.challengeToken,
          elapsedMs: Date.now() - security.mountedAt,
        }
      });

      if (error) throw error;

      await recordFormConsent('whistleblower_report', formData.naoQuerDivulgarDados ? 'anon' : cleanDenunciante);
      recordClientSubmission('denuncias');

      setProtocol(generatedProtocol);
      setFiles([]);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      console.error('Erro ao enviar denúncia:', err);
      setErrorMessage(err?.message || 'Erro ao registrar denúncia. Por favor, tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="denuncias-page">
      <SEO
        title="Canal de Denúncias | Mascârello Haus Advocacia"
        description="Canal confidencial e seguro para colaboradores, clientes e parceiros relatarem suspeitas de desvios, violações éticas ou condutas contrárias aos padrões de conformidade."
        canonical="https://mascarellohaus.adv.br/canal-de-denuncias/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Canal de Denúncias</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '850px' }}>
            Ocasionalmente nos deparamos com situações de desvio de conduta, mas nos sentimos intimidados e acabamos por não fazer nada. Por isso, a Mascârello Haus disponibiliza este canal independente, seguro e confidencial para relatar fraudes, desvios ou violações éticas.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '820px' }}>
          {protocol ? (
            <div className="denuncia-success-card">
              <CheckCircle2 size={54} className="success-icon" />
              <h2>Relato Registrado com Sucesso</h2>
              <p>
                Agradecemos sua colaboração na manutenção dos mais altos padrões éticos e de conformidade. Seu relato foi recebido de forma segura e confidencial pelo Comitê de Ética.
              </p>

              <div className="protocol-box">
                <span className="protocol-label">Número de Protocolo Confidencial</span>
                <span className="protocol-value">{protocol}</span>
                <button type="button" onClick={handleCopyProtocol} className="copy-btn">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar Protocolo'}
                </button>
              </div>

              <div className="info-banner" style={{ marginTop: '20px' }}>
                <Lock size={18} />
                <span>
                  Guarde este número com cuidado. Ele é seu comprovante único para acompanhar qualquer desdobramento sem violar seu anonimato.
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '24px' }}
                onClick={() => {
                  setProtocol(null);
                  setFormData({
                    fatos: [],
                    trabalhaEscritorio: 'Não',
                    queixaCompliance: 'Não',
                    denuncianteNome: '',
                    pessoaEnvolvida: '',
                    dataIncidente: '',
                    horaIncidente: '',
                    localizacao: '',
                    descricao: '',
                    concordaTermos: false,
                    naoQuerDivulgarDados: true,
                  });
                }}
              >
                Fazer outro relato
              </button>
            </div>
          ) : (
            <div className="wpforms-container">
              <div className="denuncia-intro-box">
                <Shield size={24} className="intro-icon" />
                <div>
                  <h4>Garantia de Confidencialidade e Não Retaliação</h4>
                  <p>
                    Este canal garante o anonimato total caso você opte por não se identificar. Nenhuma informação de IP ou rastreamento pessoal identificável é vinculada a relatos anônimos.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="form-error-banner" style={{ marginBottom: '20px' }}>
                  <AlertTriangle size={20} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* 1. Fatos */}
                <div className="form-group">
                  <label className="form-label">
                    A sua preocupação é sobre quais fatos? <span className="required">*</span>
                  </label>
                  <div className="checkbox-list">
                    {fatosOpcoes.map((fato, idx) => (
                      <label key={idx} className="checkbox-item">
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

                {/* 2. Trabalha no escritório? */}
                <div className="form-group">
                  <label className="form-label">
                    Você trabalha na Mascarello Haus ou presta serviços ao escritório?
                  </label>
                  <div className="radio-group">
                    {['Sim', 'Não'].map((opt) => (
                      <label key={opt} className="radio-item">
                        <input
                          type="radio"
                          name="trabalhaEscritorio"
                          value={opt}
                          checked={formData.trabalhaEscritorio === opt}
                          onChange={(e) => setFormData({ ...formData, trabalhaEscritorio: e.target.value })}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Queixa Compliance? */}
                <div className="form-group">
                  <label className="form-label">
                    Você atualmente tem alguma queixa a nível de Compliance do Mascarello Haus?
                  </label>
                  <div className="radio-group">
                    {['Sim', 'Não'].map((opt) => (
                      <label key={opt} className="radio-item">
                        <input
                          type="radio"
                          name="queixaCompliance"
                          value={opt}
                          checked={formData.queixaCompliance === opt}
                          onChange={(e) => setFormData({ ...formData, queixaCompliance: e.target.value })}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 4. Opção de Anonimato e Identificação */}
                <div className="form-group anon-toggle-box">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.naoQuerDivulgarDados}
                      onChange={(e) => setFormData({ ...formData, naoQuerDivulgarDados: e.target.checked })}
                    />
                    <span>
                      <strong>Desejo realizar esta denúncia de forma 100% anônima</strong> (não divulgar meu nome nem dados de contato).
                    </span>
                  </label>

                  {!formData.naoQuerDivulgarDados && (
                    <div style={{ marginTop: '14px' }}>
                      <label className="form-label">Seu Nome / Identificação (Opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Informe seu nome ou cargo para contato confidencial"
                        value={formData.denuncianteNome}
                        onChange={(e) => setFormData({ ...formData, denuncianteNome: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* 5. Pessoa Envolvida */}
                <div className="form-group">
                  <label className="form-label">
                    Pessoa(s) envolvida(s) no incidente <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome(s), área ou cargo das pessoas envolvidas"
                    required
                    value={formData.pessoaEnvolvida}
                    onChange={(e) => setFormData({ ...formData, pessoaEnvolvida: e.target.value })}
                  />
                </div>

                {/* 6. Data e Hora */}
                <div className="grid-2">
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
                    <label className="form-label">Hora aproximada</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.horaIncidente}
                      onChange={(e) => setFormData({ ...formData, horaIncidente: e.target.value })}
                    />
                  </div>
                </div>

                {/* 7. Localização */}
                <div className="form-group">
                  <label className="form-label">Localização do incidente</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Videira, Caçador, Reunião virtual, Sistema..."
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  />
                </div>

                {/* 8. Descrição */}
                <div className="form-group">
                  <label className="form-label">
                    Descreva o evento em detalhes <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={6}
                    required
                    placeholder="Descreva o que ocorreu, quando, quem estava presente e quais os impactos observados..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                {/* 9. Upload de Evidências (Conforme original WPForms wpforms_2805_15) */}
                <div className="form-group">
                  <FileUploader
                    id="wpforms_2805_15"
                    label="Anexar documentos, fotos, vídeos, áudios ou evidências"
                    description="Se você possui documentos, fotos, áudios ou relatórios que queira anexar, selecione-os abaixo (formatos: PDF, DOCX, JPG, PNG, MP3, WAV, MP4, ZIP — até 15MB cada)."
                    files={files}
                    onChange={setFiles}
                    maxFiles={5}
                    maxSizeMB={15}
                    allowedExtensions={['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'mp3', 'wav', 'mp4', 'zip']}
                    variant="light"
                  />
                </div>

                {/* 10. Termos de Uso */}
                <div className="form-group">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={formData.concordaTermos}
                      onChange={(e) => setFormData({ ...formData, concordaTermos: e.target.checked })}
                    />
                    <span>
                      Declaro que as informações aqui relatadas são de boa-fé e verdadeiras segundo o meu conhecimento, e concordo com os Termos de Uso e Sigilo do Canal de Denúncias. <span className="required">*</span>
                    </span>
                  </label>
                </div>

                <SecurityShield security={security} onChange={setSecurity} variant="light" />

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando relato com segurança...' : (
                    <>
                      Enviar Denúncia Segura <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .denuncia-intro-box {
          display: flex;
          gap: 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .intro-icon {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .denuncia-intro-box h4 {
          color: #166534;
          font-size: 1.05rem;
          margin-bottom: 6px;
        }
        .denuncia-intro-box p {
          color: #15803d;
          font-size: 0.92rem;
          line-height: 1.6;
          margin: 0;
        }
        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        .checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.95rem;
          color: var(--color-text-main);
          cursor: pointer;
        }
        .radio-group {
          display: flex;
          gap: 30px;
          margin-top: 8px;
        }
        .radio-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .anon-toggle-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px;
          border-radius: 8px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .denuncia-success-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 50px 40px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .success-icon {
          color: #22c55e;
          margin-bottom: 20px;
        }
        .protocol-box {
          background: #f8fafc;
          border: 2px dashed var(--color-accent);
          border-radius: 8px;
          padding: 24px;
          margin: 30px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .protocol-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted);
          font-weight: 600;
        }
        .protocol-value {
          font-family: monospace;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-primary);
        }
        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--color-primary);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .copy-btn:hover {
          background: var(--color-accent);
        }
        .info-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        @media (max-width: 600px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .denuncia-success-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};
