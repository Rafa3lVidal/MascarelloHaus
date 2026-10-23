import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Copy, Check, Shield, FileCheck2 } from 'lucide-react';
import SEO from '../components/SEO';
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

const RETURN_CHANNEL_OPTIONS = ['E-mail', 'Telefone', 'Presencialmente'] as const;

const LGPD_REQUEST_TYPES = [
  { value: 'acesso', label: 'Confirmação de tratamento e acesso aos dados (Art. 18, I e II)' },
  { value: 'correcao', label: 'Correção de dados incompletos, inexatos ou desatualizados (Art. 18, III)' },
  { value: 'eliminacao', label: 'Anonimização, bloqueio ou eliminação de dados (Art. 18, IV e VI)' },
  { value: 'portabilidade', label: 'Portabilidade dos dados a outro fornecedor (Art. 18, V)' },
  { value: 'compartilhamento', label: 'Informação sobre compartilhamento de dados com terceiros (Art. 18, VII)' },
  { value: 'revogacao', label: 'Revogação do consentimento (Art. 18, IX)' },
  { value: 'reclamacao', label: 'Reclamação, dúvida ou outra solicitação relacionada à LGPD' },
];

export const CentralProtecaoDados: React.FC = () => {
  const [formData, setFormData] = useState({
    requesterName: '',
    returnChannels: ['E-mail'] as string[],
    isThirdParty: false,
    thirdPartyName: '',
    contactInfo: '',
    requestType: 'acesso',
    description: '',
    priorContactDetails: '',
    privacyAccepted: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [protocol, setProtocol] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleReturnChannel = (channel: string) => {
    setFormData((prev) => {
      const exists = prev.returnChannels.includes(channel);
      const next = exists
        ? prev.returnChannels.filter((c) => c !== channel)
        : [...prev.returnChannels, channel];
      return { ...prev, returnChannels: next };
    });
  };

  const handleCopyProtocol = () => {
    if (!protocol) return;
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanRequester = sanitizeText(formData.requesterName, 150);
    const cleanThirdParty = sanitizeText(formData.thirdPartyName, 150);
    const cleanContact = sanitizeText(formData.contactInfo, 180);
    const cleanDescription = sanitizeText(formData.description, 8000);
    const cleanPrior = sanitizeText(formData.priorContactDetails, 3000);

    if (cleanRequester.length < 3) {
      setErrorMessage('Por favor, informe o Nome do Solicitante.');
      setStatus('error');
      return;
    }

    if (formData.returnChannels.length === 0) {
      setErrorMessage('Selecione pelo menos uma forma de retorno para nosso contato.');
      setStatus('error');
      return;
    }

    if (formData.isThirdParty && cleanThirdParty.length < 3) {
      setErrorMessage('Informe o nome do titular dos dados (terceira pessoa representada).');
      setStatus('error');
      return;
    }

    if (cleanContact.length < 5) {
      setErrorMessage('Informe seu dado para contato (e-mail ou telefone com DDD).');
      setStatus('error');
      return;
    }

    if (cleanDescription.length < 10) {
      setErrorMessage('Descreva com mais detalhes a sua solicitação ou reclamação.');
      setStatus('error');
      return;
    }

    if (!formData.privacyAccepted) {
      setErrorMessage('É necessário confirmar ciência sobre o tratamento de dados para processar sua requisição.');
      setStatus('error');
      return;
    }

    const secCheck = validateSecurityState(security);
    if (!secCheck.valid) {
      setErrorMessage(secCheck.error || 'Falha na verificação de segurança.');
      setStatus('error');
      return;
    }

    const rateCheck = checkClientRateLimit('lgpd_central', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setErrorMessage(
        `Muitas requisições recentes. Por segurança, aguarde ${rateCheck.retryAfterSeconds} segundos.`
      );
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      const uploadedAttachments = await uploadFormFiles(files, 'lgpd', 'documentos_comprobatorios');
      const generatedProtocol = generateProtocol('LGPD');
      const ipHash = await getAnonymousIpHash();

      // Calculate 15-day statutory deadline (Art. 19, II LGPD)
      const deadlineDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const { error } = await supabase.from('data_subject_requests').insert([
        {
          protocol: generatedProtocol,
          requester_name: cleanRequester,
          contact_channel: formData.returnChannels.join(', '),
          return_channels: formData.returnChannels,
          contact_info: cleanContact,
          is_third_party: formData.isThirdParty,
          data_subject_name: formData.isThirdParty ? cleanThirdParty : cleanRequester,
          third_party_name: formData.isThirdParty ? cleanThirdParty : null,
          request_type: formData.requestType,
          description: cleanDescription,
          has_prior_contact: cleanPrior.length > 0,
          prior_contact_details: cleanPrior || null,
          attachment_storage_path:
            uploadedAttachments.length > 0 ? uploadedAttachments[0].url : null,
          attachments_json: uploadedAttachments,
          legal_deadline: deadlineDate,
          ip_hash: ipHash,
          security_meta: {
            honeypot: security.honeypotWebsite || security.honeypotFax || '',
            challengeToken: security.challengeToken,
            elapsedMs: Date.now() - security.mountedAt,
          },
        },
      ]);

      if (error) throw error;

      await recordFormConsent('lgpd_data_subject_request', cleanContact);
      recordClientSubmission('lgpd_central');

      setProtocol(generatedProtocol);
      setStatus('success');
      setFormData({
        requesterName: '',
        returnChannels: ['E-mail'],
        isThirdParty: false,
        thirdPartyName: '',
        contactInfo: '',
        requestType: 'acesso',
        description: '',
        priorContactDetails: '',
        privacyAccepted: false,
      });
      setFiles([]);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      console.error('Erro ao registrar requisição LGPD:', err);
      setStatus('error');
      setErrorMessage(
        err?.message ||
          'Não foi possível registrar sua solicitação no momento. Você também pode contatar nosso DPO pelo e-mail dpo@mascarellohaus.com.br.'
      );
    }
  };

  return (
    <>
      <SEO
        title="Central de Proteção de Dados (LGPD) - Mascârello Haus"
        description="Canal oficial do Titular de Dados da Mascârello Haus Advocacia. Exerça seus direitos previstos no Art. 18 da LGPD (Lei nº 13.709/2018) com segurança."
        canonical="/central-de-protecao-de-dados"
      />

      {/* Hero Section */}
      <section
        className="mh-hero"
        style={{
          backgroundImage:
            'url(/wp-content/uploads/2023/08/central-de-protecao-de-dados-banner.jpg)',
          minHeight: '300px',
          paddingTop: '120px',
          paddingBottom: '60px',
        }}
      >
        <div className="mh-hero-overlay" />
        <div className="mh-container mh-hero-content">
          <div style={{ maxWidth: '720px' }}>
            <h1 className="mh-hero-title">Central de Proteção de Dados</h1>
            <p className="mh-hero-subtitle">
              Exerça seus direitos como titular de dados pessoais nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="mh-section"
        style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}
      >
        <div className="mh-container" style={{ maxWidth: '880px' }}>
          <div style={{ marginBottom: '48px' }}>
            <p
              style={{
                color: 'rgba(255,255,255,0.9)',
                marginBottom: '16px',
                lineHeight: 1.8,
              }}
            >
              Aqui no escritório <strong>Mascarello Haus</strong>, levamos a sua privacidade a sério. Por esse motivo, disponibilizamos este canal direto com nosso Encarregado pelo Tratamento de Dados Pessoais (DPO) para que você possa exercer, de forma gratuita e facilitada, todos os direitos garantidos pelos artigos 18 e 20 da LGPD:
            </p>
            <ol
              style={{
                color: 'rgba(255,255,255,0.85)',
                paddingLeft: '24px',
                marginBottom: '24px',
                lineHeight: 1.9,
              }}
            >
              <li>Direito de confirmação da existência de tratamento e acesso aos dados;</li>
              <li>Direito de retificação de dados incompletos, inexatos ou desatualizados;</li>
              <li>Direito à anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
              <li>Direito à portabilidade dos dados a outro fornecedor de serviço ou produto;</li>
              <li>Direito à informação sobre entidades públicas e privadas com as quais houve uso compartilhado;</li>
              <li>Direito à revogação do consentimento e revisão de decisões automatizadas.</li>
            </ol>

            {/* DPO Contact Card */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(203, 171, 122, 0.35)',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <Shield size={32} style={{ color: '#cbab7a', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '13px', color: '#cbab7a', fontWeight: 600, textTransform: 'uppercase' }}>
                  Encarregado de Proteção de Dados (DPO)
                </div>
                <div style={{ fontSize: '15px', color: '#ffffff', marginTop: '2px' }}>
                  Atendimento direto também pelo e-mail:{' '}
                  <a
                    href="mailto:dpo@mascarellohaus.com.br"
                    style={{ color: '#cbab7a', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    dpo@mascarellohaus.com.br
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '40px',
              borderRadius: '14px',
              border: '1px solid rgba(203, 171, 122, 0.3)',
            }}
          >
            <h2
              style={{
                color: 'var(--color-accent)',
                fontSize: '26px',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Formulário de Requisição do Titular (LGPD)
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.75)',
                textAlign: 'center',
                fontSize: '14px',
                marginBottom: '32px',
              }}
            >
              Preencha os campos abaixo. Você receberá um protocolo único para acompanhamento da sua solicitação.
            </p>

            {status === 'success' ? (
              <div
                role="status"
                aria-live="polite"
                style={{
                  textAlign: 'center',
                  padding: '32px 24px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid #22c55e',
                  borderRadius: '12px',
                }}
              >
                <CheckCircle2
                  size={48}
                  style={{ color: '#22c55e', margin: '0 auto 14px', display: 'block' }}
                />
                <h3 style={{ color: '#ffffff', fontSize: '24px', marginBottom: '12px' }}>
                  Solicitação Registrada com Sucesso!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>
                  Guarde o número de protocolo abaixo para acompanhar o andamento junto ao nosso DPO:
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '14px',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    padding: '14px 24px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-accent)',
                    marginBottom: '20px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--color-accent)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {protocol}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyProtocol}
                    className="mh-btn mh-btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', maxWidth: '540px', margin: '0 auto 24px' }}>
                  Nosso Encarregado de Proteção de Dados analisará sua solicitação e responderá dentro do prazo legal estabelecido pela Lei nº 13.709/2018 (até 15 dias).
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mh-btn mh-btn-gold"
                >
                  Nova Solicitação
                </button>
              </div>
            ) : (
              <form className="mh-form" onSubmit={handleSubmit} noValidate>
                <div className="mh-form-group">
                  <label
                    htmlFor="lgpd-solicitante"
                    style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}
                  >
                    Nome do Solicitante <span style={{ color: '#cbab7a' }}>*</span>
                  </label>
                  <input
                    id="lgpd-solicitante"
                    type="text"
                    className="mh-input"
                    required
                    maxLength={150}
                    placeholder="Informe seu nome completo"
                    value={formData.requesterName}
                    onChange={(e) =>
                      setFormData({ ...formData, requesterName: e.target.value })
                    }
                  />
                </div>

                {/* Como devemos retornar seu contato? (Original WPForms 1764 field 16) */}
                <div className="mh-form-group">
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                    Como devemos retornar seu contato? <span style={{ color: '#cbab7a' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {RETURN_CHANNEL_OPTIONS.map((channel) => {
                      const checked = formData.returnChannels.includes(channel);
                      return (
                        <label
                          key={channel}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${
                              checked ? '#cbab7a' : 'rgba(255,255,255,0.2)'
                            }`,
                            backgroundColor: checked
                              ? 'rgba(203, 171, 122, 0.18)'
                              : 'rgba(255,255,255,0.04)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleReturnChannel(channel)}
                          />
                          <span>{channel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Nome do titular dos dados (terceira pessoa) (Original WPForms 1764 field 9) */}
                <div className="mh-form-group">
                  <label className="mh-checkbox-label" style={{ marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isThirdParty}
                      onChange={(e) =>
                        setFormData({ ...formData, isThirdParty: e.target.checked })
                      }
                    />
                    <span>
                      Estou fazendo esta solicitação como representante legal de outra pessoa (terceiro titular dos dados)
                    </span>
                  </label>

                  {formData.isThirdParty && (
                    <div style={{ marginTop: '10px' }}>
                      <label
                        htmlFor="lgpd-terceiro"
                        style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}
                      >
                        Nome do titular dos dados (terceira pessoa):{' '}
                        <span style={{ color: '#cbab7a' }}>*</span>
                      </label>
                      <input
                        id="lgpd-terceiro"
                        type="text"
                        className="mh-input"
                        required={formData.isThirdParty}
                        placeholder="Se sua solicitação se referir a dados pessoais de terceiros, forneça o nome desta pessoa"
                        value={formData.thirdPartyName}
                        onChange={(e) =>
                          setFormData({ ...formData, thirdPartyName: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Informe aqui seu dado para contato (Original WPForms 1764 field 11) */}
                <div className="mh-grid-2" style={{ gap: '16px' }}>
                  <div className="mh-form-group">
                    <label
                      htmlFor="lgpd-contato"
                      style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}
                    >
                      Informe aqui seu dado para contato <span style={{ color: '#cbab7a' }}>*</span>
                    </label>
                    <input
                      id="lgpd-contato"
                      type="text"
                      className="mh-input"
                      required
                      placeholder="Seu e-mail ou telefone (com DDD)"
                      value={formData.contactInfo}
                      onChange={(e) =>
                        setFormData({ ...formData, contactInfo: e.target.value })
                      }
                    />
                  </div>

                  <div className="mh-form-group">
                    <label
                      htmlFor="lgpd-tipo"
                      style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}
                    >
                      Tipo de Solicitação (Art. 18 LGPD) <span style={{ color: '#cbab7a' }}>*</span>
                    </label>
                    <select
                      id="lgpd-tipo"
                      className="mh-input"
                      value={formData.requestType}
                      onChange={(e) =>
                        setFormData({ ...formData, requestType: e.target.value })
                      }
                      style={{ backgroundColor: '#0a2925', color: '#ffffff' }}
                    >
                      {LGPD_REQUEST_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* A que se refere a sua reclamação/solicitação? (Original WPForms 1764 field 6) */}
                <div className="mh-form-group">
                  <label
                    htmlFor="lgpd-descricao"
                    style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}
                  >
                    A que se refere a sua reclamação/solicitação? Quanto mais informações você nos fornecer, mais rapidamente poderemos processar sua solicitação.{' '}
                    <span style={{ color: '#cbab7a' }}>*</span>
                  </label>
                  <textarea
                    id="lgpd-descricao"
                    className="mh-textarea"
                    rows={5}
                    required
                    maxLength={8000}
                    placeholder="Detalhe sua solicitação ou reclamação..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Você já teve contato com terceiros em relação à sua reclamação? (Original WPForms 1764 field 13) */}
                <div className="mh-form-group">
                  <label
                    htmlFor="lgpd-contato-previo"
                    style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}
                  >
                    Você já teve contato com terceiros em relação à sua reclamação? Em caso afirmativo, forneça detalhes:
                  </label>
                  <textarea
                    id="lgpd-contato-previo"
                    className="mh-textarea"
                    rows={3}
                    maxLength={3000}
                    placeholder="Opcional — informe se já tratou desta questão anteriormente..."
                    value={formData.priorContactDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, priorContactDetails: e.target.value })
                    }
                  />
                </div>

                {/* Original WPForms 1764 field 14: File Upload */}
                <FileUploader
                  id="wpforms-1764-field_14"
                  label="Você gostaria de nos enviar algum documento para embasar sua solicitação/reclamação?"
                  description="Anexe comprovantes, procuração (em caso de representante legal) ou documentos pertinentes."
                  files={files}
                  onChange={setFiles}
                  maxFiles={3}
                  maxSizeMB={15}
                  allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip']}
                  variant="dark"
                />

                <div className="mh-form-group" style={{ marginTop: '18px' }}>
                  <label className="mh-checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={formData.privacyAccepted}
                      onChange={(e) =>
                        setFormData({ ...formData, privacyAccepted: e.target.checked })
                      }
                    />
                    <span>
                      Declaro que as informações prestadas são verdadeiras e estou ciente do tratamento dos dados para atendimento desta requisição, conforme a{' '}
                      <Link
                        to="/politica-de-privacidade"
                        style={{ color: '#cbab7a', textDecoration: 'underline' }}
                      >
                        Política de Privacidade
                      </Link>
                      . *
                    </span>
                  </label>
                </div>

                <SecurityShield security={security} onChange={setSecurity} variant="dark" />

                {status === 'error' && (
                  <div
                    role="alert"
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="mh-btn mh-btn-gold"
                  disabled={status === 'submitting'}
                  style={{ width: '100%' }}
                >
                  {status === 'submitting' ? (
                    'Enviando requisição com segurança...'
                  ) : (
                    <>
                      <FileCheck2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Enviar Solicitação ao DPO
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CentralProtecaoDados;
