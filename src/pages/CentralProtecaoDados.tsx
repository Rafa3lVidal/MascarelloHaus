import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Mail,
  Phone,
  FileText,
  Download,
  ExternalLink,
  Lock,
  UserCheck,
  Users,
  Eye,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Scale,
  BookOpen,
  Send,
  HelpCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
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
  UploadedAttachment,
  recordFormConsent,
} from '../lib/formSecurity';

const RETURN_CHANNEL_OPTIONS = ['E-mail', 'Telefone', 'Presencialmente'] as const;

const LGPD_REQUEST_TYPES = [
  { value: 'acesso', label: 'Confirmação de tratamento e acesso aos dados (Art. 18, I e II)' },
  { value: 'correcao', label: 'Correção de dados incompletos, inexatos ou desatualizados (Art. 18, III)' },
  { value: 'eliminacao', label: 'Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos (Art. 18, IV e VI)' },
  { value: 'portabilidade', label: 'Portabilidade dos dados a outro fornecedor (Art. 18, V)' },
  { value: 'compartilhamento', label: 'Informação sobre entidades públicas ou privadas com as quais houve compartilhamento (Art. 18, VII)' },
  { value: 'nao_fornecimento', label: 'Informação sobre consequências de não fornecer consentimento (Art. 18, VIII)' },
  { value: 'revogacao', label: 'Revogação do consentimento (Art. 18, IX)' },
  { value: 'reclamacao', label: 'Reclamação, dúvida ou outra solicitação relacionada à LGPD' },
];

const LGPD_RIGHTS_DATA = [
  {
    num: 'I',
    title: 'Confirmação da Existência de Tratamento',
    desc: 'O titular tem o direito de obter da Mascârello Haus a confirmação de que seus dados pessoais são ou não objeto de tratamento.',
    icon: CheckCircle2,
  },
  {
    num: 'II',
    title: 'Acesso aos Dados Pessoais',
    desc: 'Direito de consultar e obter cópia clara, acessível e simplificada de todos os dados pessoais mantidos pelo escritório.',
    icon: Eye,
  },
  {
    num: 'III',
    title: 'Correção de Dados Incompletos ou Inexatos',
    desc: 'Direito de solicitar a imediata atualização, correção ou complementação de dados pessoais cadastrais ou processuais.',
    icon: RefreshCw,
  },
  {
    num: 'IV',
    title: 'Anonimização, Bloqueio ou Eliminação',
    desc: 'Direito de requerer que dados excessivos, desnecessários ou tratados em desconformidade com a lei sejam anonimizados ou excluídos.',
    icon: Lock,
  },
  {
    num: 'V',
    title: 'Portabilidade dos Dados',
    desc: 'Direito de receber os seus dados pessoais em formato estruturado e interoperável para transferência a outro prestador de serviços.',
    icon: ExternalLink,
  },
  {
    num: 'VI',
    title: 'Eliminação de Dados com Consentimento',
    desc: 'Direito de exigir a exclusão definitiva dos dados pessoais tratados mediante consentimento prévio, ressalvadas obrigações legais.',
    icon: Trash2,
  },
  {
    num: 'VII',
    title: 'Informação sobre Compartilhamento',
    desc: 'Direito de saber exatamente quais entidades públicas e privadas receberam ou compartilharam seus dados com a Mascârello Haus.',
    icon: Users,
  },
  {
    num: 'VIII',
    title: 'Consequências da Negativa de Consentimento',
    desc: 'Direito de ser informado de forma transparente sobre a possibilidade e impactos de recusar o fornecimento de consentimento.',
    icon: HelpCircle,
  },
  {
    num: 'IX',
    title: 'Revogação do Consentimento & Revisão',
    desc: 'Direito de revogar autorizações concedidas a qualquer momento mediante manifestação expressa e requerer revisão de decisões automatizadas.',
    icon: Scale,
  },
];

const OFFICIAL_CARTILHAS = [
  {
    title: 'Cartilha LGPD: Introdução à Proteção dos Dados Pessoais',
    subtitle: 'Conceitos fundamentais da Lei nº 13.709/2018 para clientes, colaboradores e empresas.',
    fileUrl: '/wp-content/uploads/2023/09/cartilha-introducao-a-protecao-de-dados.pdf',
    pages: '12 páginas',
    fileSize: '1.29 MB',
    badge: 'LGPD Geral',
  },
  {
    title: 'Cartilha de Incidentes de Segurança da Informação',
    subtitle: 'Orientações práticas de prevenção, contenção e comunicação tempestiva de incidentes cibernéticos.',
    fileUrl: '/wp-content/uploads/2023/09/cartilha-incidente-seguranca.pdf',
    pages: '10 páginas',
    fileSize: '1.33 MB',
    badge: 'Segurança Cibernética',
  },
  {
    title: 'Cartilha de Phishing: O Famoso e Malicioso Clique Aqui',
    subtitle: 'Como identificar fraudes por e-mail, mensagens falsas e engenharia social no dia a dia.',
    fileUrl: '/wp-content/uploads/2023/09/cartilha-phishing.pdf',
    pages: '14 páginas',
    fileSize: '2.14 MB',
    badge: 'Conscientização',
  },
];

const DRAFT_KEY_LGPD = 'mh_draft_central_lgpd';

export const CentralProtecaoDados: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('aba') || 'requisicao';
  const [activeTab, setActiveTab] = useState<'requisicao' | 'direitos' | 'privacidade' | 'termos' | 'cartilhas'>(
    ['requisicao', 'direitos', 'privacidade', 'termos', 'cartilhas'].includes(initialTab)
      ? (initialTab as any)
      : 'requisicao'
  );

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

  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [protocol, setProtocol] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Restore draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY_LGPD);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }));
        if (Array.isArray(parsed.attachments)) setAttachments(parsed.attachments);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (status === 'success') return;
    try {
      const payload = { formData, attachments, savedAt: new Date().toISOString() };
      localStorage.setItem(DRAFT_KEY_LGPD, JSON.stringify(payload));
      setLastSavedTime(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      // Ignore quota
    }
  }, [formData, attachments, status]);

  const switchTab = (tab: 'requisicao' | 'direitos' | 'privacidade' | 'termos' | 'cartilhas') => {
    setActiveTab(tab);
    setSearchParams({ aba: tab }, { replace: true });
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

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
      setErrorMessage('Por favor, informe o Nome Completo do Solicitante.');
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
      setErrorMessage(secCheck.error || 'Falha na verificação de segurança anti-spam.');
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
          attachment_storage_path: attachments.length > 0 ? attachments[0].url : null,
          attachments_json: attachments,
          legal_deadline: deadlineDate,
          ip_hash: ipHash,
          security_meta: {
            honeypot: security.honeypotWebsite || security.honeypotFax || '',
            challengeToken: security.challengeToken,
            elapsedMs: Date.now() - security.mountedAt,
            attachmentCount: attachments.length,
          },
        },
      ]);

      if (error) throw error;

      await recordFormConsent('lgpd_data_subject_request', cleanContact);
      recordClientSubmission('lgpd_central');

      localStorage.removeItem(DRAFT_KEY_LGPD);
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
      setAttachments([]);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      console.error('Erro ao registrar requisição LGPD:', err);
      setStatus('error');
      setErrorMessage(
        err?.message ||
          'Não foi possível registrar sua solicitação no momento. Você também pode contatar diretamente nossa Encarregada pelo e-mail privacidade@mascarellohaus.adv.br.'
      );
    }
  };

  return (
    <div className="central-lgpd-page" style={{ backgroundColor: '#f8fafc' }}>
      <SEO
        title="Central de Proteção de Dados & Privacidade (LGPD) | Mascârello Haus Advocacia"
        description="Canal oficial do Titular de Dados da Mascârello Haus Advocacia. Conheça e exerça seus direitos previstos no Art. 18 da LGPD (Lei nº 13.709/2018), baixe cartilhas de segurança e consulte o Aviso de Privacidade."
        canonical="https://mascarellohaus.adv.br/central-de-protecao-de-dados/"
      />

      {/* Hero Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0d3732 0%, #071f1c 100%)',
          color: '#ffffff',
          padding: '70px 0 60px',
          borderBottom: '3px solid #cbab7a',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '1060px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '30px',
              backgroundColor: 'rgba(203, 171, 122, 0.15)',
              border: '1px solid rgba(203, 171, 122, 0.35)',
              color: '#cbab7a',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <Shield size={14} /> Governança, Transparência & Privacidade
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.1rem, 4vw, 3rem)',
              fontWeight: 700,
              margin: '0 0 16px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Central de Proteção de Dados (LGPD)
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '820px',
              color: 'rgba(255, 255, 255, 0.88)',
              fontSize: '1.08rem',
              lineHeight: 1.7,
            }}
          >
            Neste portal oficial, você encontra todas as políticas, diretrizes, termos e ferramentas necessárias para exercer, de forma <strong>gratuita, ágil e segura</strong>, os direitos garantidos pela <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</strong>.
          </p>

          {/* DPO Highlight Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginTop: '40px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(203, 171, 122, 0.3)',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <UserCheck size={32} style={{ color: '#cbab7a', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: '#cbab7a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Encarregada de Dados (DPO)
                </span>
                <strong style={{ display: 'block', color: '#ffffff', fontSize: '1rem', marginTop: '2px' }}>
                  Mirataira Haus
                </strong>
                <a
                  href="mailto:privacidade@mascarellohaus.adv.br"
                  style={{ color: '#e2e8f0', fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  privacidade@mascarellohaus.adv.br
                </a>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(203, 171, 122, 0.3)',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <FileCheck2 size={32} style={{ color: '#cbab7a', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: '#cbab7a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Prazo Legal de Resposta
                </span>
                <strong style={{ display: 'block', color: '#ffffff', fontSize: '1rem', marginTop: '2px' }}>
                  Até 15 dias úteis
                </strong>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                  Conforme Art. 19, II da Lei 13.709/2018
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(203, 171, 122, 0.3)',
                borderRadius: '12px',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <Lock size={32} style={{ color: '#cbab7a', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: '#cbab7a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Protocolo Criptografado
                </span>
                <strong style={{ display: 'block', color: '#ffffff', fontSize: '1rem', marginTop: '2px' }}>
                  Rastreabilidade Total
                </strong>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>
                  Acompanhamento sem expor seus dados
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation Pill Bar */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '70px', zIndex: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="container" style={{ maxWidth: '1060px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              padding: '12px 0',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'requisicao', label: 'Requisição do Titular', icon: FileCheck2 },
              { id: 'direitos', label: 'Direitos & DPO', icon: Shield },
              { id: 'privacidade', label: 'Aviso de Privacidade', icon: FileText },
              { id: 'termos', label: 'Termos de Uso', icon: Scale },
              { id: 'cartilhas', label: 'Cartilhas & Downloads', icon: Download },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: active ? '1px solid #0d3732' : '1px solid transparent',
                    backgroundColor: active ? '#0d3732' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  <IconComp size={16} style={{ color: active ? '#cbab7a' : '#64748b' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Tab Panels */}
      <section style={{ padding: '50px 0 80px' }}>
        <div className="container" style={{ maxWidth: '1060px' }}>

          {/* ABA 1: REQUISIÇÃO DO TITULAR */}
          {activeTab === 'requisicao' && (
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d3732', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  <FileCheck2 size={16} /> Formulário Oficial do Titular de Dados
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '2.1rem', margin: '0 0 10px' }}>
                  Exercício dos Direitos do Titular (Art. 18 LGPD)
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                  Preencha os campos abaixo para solicitar acesso, correção, eliminação, portabilidade ou esclarecimentos. Você receberá um número de protocolo único para acompanhamento.
                </p>
              </div>

              {status === 'success' ? (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    textAlign: 'center',
                    padding: '48px 36px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#f0fdf4', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <CheckCircle2 size={40} style={{ color: '#16a34a' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.8rem', marginBottom: '10px' }}>
                    Solicitação Registrada com Sucesso!
                  </h3>
                  <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '580px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                    Sua requisição foi recebida e encaminhada diretamente à nossa Encarregada de Proteção de Dados (DPO). Guarde o número de protocolo abaixo para acompanhar o andamento.
                  </p>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '16px',
                      backgroundColor: '#f8fafc',
                      padding: '16px 28px',
                      borderRadius: '12px',
                      border: '2px dashed #cbab7a',
                      marginBottom: '24px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: '#0d3732',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {protocol}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyProtocol}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#0d3732',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copiado!' : 'Copiar Protocolo'}
                    </button>
                  </div>

                  <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '540px', margin: '0 auto 30px', lineHeight: 1.6 }}>
                    Prazo de resposta conforme Art. 19, II da Lei 13.709/2018: <strong>até 15 dias</strong> a contar da presente data. Em caso de dúvidas urgentes, faça referência a este protocolo contatando <strong>privacidade@mascarellohaus.adv.br</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setProtocol('');
                    }}
                    style={{
                      backgroundColor: '#0d3732',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Nova Solicitação
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '36px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                >
                  {lastSavedTime && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', marginBottom: '24px', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>✓ Rascunho salvo automaticamente às {lastSavedTime}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Deseja limpar todo o rascunho preenchido?')) {
                            localStorage.removeItem(DRAFT_KEY_LGPD);
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
                            setAttachments([]);
                            setLastSavedTime(null);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}
                      >
                        Limpar Rascunho
                      </button>
                    </div>
                  )}

                  {errorMessage && (
                    <div
                      role="alert"
                      style={{
                        padding: '14px 18px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #f87171',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.92rem',
                      }}
                    >
                      <AlertCircle size={20} style={{ flexShrink: 0 }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    {/* Nome do Solicitante */}
                    <div style={{ marginBottom: '22px' }}>
                      <label htmlFor="lgpd-solicitante" style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                        Nome Completo do Solicitante <span style={{ color: '#cbab7a' }}>*</span>
                      </label>
                      <input
                        id="lgpd-solicitante"
                        type="text"
                        required
                        maxLength={150}
                        placeholder="Informe seu nome completo"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                      />
                    </div>

                    {/* Forma de Retorno */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
                        Como devemos retornar seu contato? <span style={{ color: '#cbab7a' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        {RETURN_CHANNEL_OPTIONS.map((channel) => {
                          const checked = formData.returnChannels.includes(channel);
                          return (
                            <label
                              key={channel}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: `1px solid ${checked ? '#0d3732' : '#cbd5e1'}`,
                                backgroundColor: checked ? '#f0fdf4' : '#ffffff',
                                cursor: 'pointer',
                                fontSize: '0.92rem',
                                fontWeight: checked ? 600 : 400,
                                userSelect: 'none',
                                transition: 'all 0.2s',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleReturnChannel(channel)}
                                style={{ accentColor: '#0d3732' }}
                              />
                              <span>{channel}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Terceiro Representado */}
                    <div style={{ marginBottom: '22px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.isThirdParty}
                          onChange={(e) => setFormData({ ...formData, isThirdParty: e.target.checked })}
                          style={{ marginTop: '3px', accentColor: '#0d3732' }}
                        />
                        <span style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 500 }}>
                          Estou fazendo esta solicitação como representante legal ou procurador de outra pessoa (terceiro titular dos dados)
                        </span>
                      </label>

                      {formData.isThirdParty && (
                        <div style={{ marginTop: '14px', paddingLeft: '24px' }}>
                          <label htmlFor="lgpd-terceiro" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                            Nome do titular representado: <span style={{ color: '#cbab7a' }}>*</span>
                          </label>
                          <input
                            id="lgpd-terceiro"
                            type="text"
                            required={formData.isThirdParty}
                            placeholder="Nome completo da pessoa que você representa"
                            value={formData.thirdPartyName}
                            onChange={(e) => setFormData({ ...formData, thirdPartyName: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                          />
                          <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '6px' }}>
                            Nota: Favor anexar o instrumento de procuração ou documento comprobatório de representação no campo de envio de arquivos abaixo.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dados de Contato e Tipo de Solicitação */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '22px' }}>
                      <div>
                        <label htmlFor="lgpd-contato" style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                          Informe seu dado para contato <span style={{ color: '#cbab7a' }}>*</span>
                        </label>
                        <input
                          id="lgpd-contato"
                          type="text"
                          required
                          placeholder="Seu e-mail ou telefone com DDD"
                          value={formData.contactInfo}
                          onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                        />
                      </div>

                      <div>
                        <label htmlFor="lgpd-tipo" style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                          Tipo de Solicitação (Art. 18 LGPD) <span style={{ color: '#cbab7a' }}>*</span>
                        </label>
                        <select
                          id="lgpd-tipo"
                          value={formData.requestType}
                          onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#ffffff', color: '#1e293b' }}
                        >
                          {LGPD_REQUEST_TYPES.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Descrição */}
                    <div style={{ marginBottom: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label htmlFor="lgpd-descricao" style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>
                          A que se refere a sua solicitação ou reclamação? <span style={{ color: '#cbab7a' }}>*</span>
                        </label>
                        <span style={{ fontSize: '0.8rem', color: formData.description.length < 10 ? '#ef4444' : '#64748b' }}>
                          {formData.description.length} caracteres
                        </span>
                      </div>
                      <textarea
                        id="lgpd-descricao"
                        rows={5}
                        required
                        maxLength={8000}
                        placeholder="Quanto mais informações você nos fornecer (dados solicitados, contexto ou período), mais rapidamente poderemos atender o seu pedido..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}
                      />
                    </div>

                    {/* Contato Prévio */}
                    <div style={{ marginBottom: '24px' }}>
                      <label htmlFor="lgpd-contato-previo" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Você já teve contato prévio com o escritório sobre esta solicitação? (Opcional):
                      </label>
                      <input
                        id="lgpd-contato-previo"
                        type="text"
                        maxLength={3000}
                        placeholder="Ex: Já contatei o setor financeiro em maio/2026..."
                        value={formData.priorContactDetails}
                        onChange={(e) => setFormData({ ...formData, priorContactDetails: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>

                    {/* Upload de Documentos Comprobatórios */}
                    <div style={{ marginBottom: '24px' }}>
                      <FileUploader
                        id="wpforms-1764-field_14"
                        label="Gostaria de anexar documentos para embasar sua solicitação?"
                        description="Anexe comprovantes de identidade, procuração (em caso de representante legal) ou documentos pertinentes (PDF, DOCX, JPG, PNG, até 3 arquivos de 15MB cada). O upload é realizado imediatamente em nuvem criptografada."
                        attachments={attachments}
                        onAttachmentsChange={setAttachments}
                        autoUpload={true}
                        folder="lgpd"
                        fieldKey="documentos_comprobatorios"
                        maxFiles={3}
                        maxSizeMB={15}
                        allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip']}
                        variant="light"
                      />
                    </div>

                    {/* Termos de Privacidade */}
                    <div style={{ marginBottom: '26px', padding: '16px 18px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          required
                          checked={formData.privacyAccepted}
                          onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                          style={{ marginTop: '3px', accentColor: '#0d3732' }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                          Declaro que as informações prestadas são verdadeiras e estou ciente de que os dados aqui fornecidos serão utilizados exclusivamente para atendimento e comprovação desta requisição, conforme previsto no{' '}
                          <button
                            type="button"
                            onClick={() => switchTab('privacidade')}
                            style={{ background: 'none', border: 'none', color: '#0d3732', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                          >
                            Aviso de Privacidade
                          </button>
                          . <span style={{ color: '#cbab7a' }}>*</span>
                        </span>
                      </label>
                    </div>

                    <SecurityShield security={security} onChange={setSecurity} variant="light" />

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d3732',
                        color: '#ffffff',
                        border: 'none',
                        padding: '16px 24px',
                        borderRadius: '8px',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(13, 55, 50, 0.25)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {status === 'submitting' ? (
                        'Enviando requisição com segurança...'
                      ) : (
                        <>
                          <FileCheck2 size={18} /> Enviar Solicitação ao DPO
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ABA 2: DIREITOS DO TITULAR & DPO */}
          {activeTab === 'direitos' && (
            <div>
              <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d3732', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  <Shield size={16} /> Artigo 18 da Lei Federal nº 13.709/2018
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '2.1rem', margin: '0 0 12px' }}>
                  Seus Direitos como Titular de Dados
                </h2>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7 }}>
                  A Lei Geral de Proteção de Dados confere a você uma série de garantias relativas aos seus dados pessoais. O escritório <strong>Mascârello Haus</strong> disponibiliza os meios técnicos e jurídicos para que você exerça qualquer destes direitos a qualquer tempo.
                </p>
              </div>

              {/* Grid dos 9 Direitos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                {LGPD_RIGHTS_DATA.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.num}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbab7a', backgroundColor: '#fefce8', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fef08a' }}>
                            Art. 18, {item.num}
                          </span>
                          <Icon size={22} style={{ color: '#0d3732' }} />
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.15rem', margin: '0 0 8px' }}>
                          {item.title}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                          {item.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => switchTab('requisicao')}
                        style={{
                          marginTop: '18px',
                          alignSelf: 'flex-start',
                          background: 'none',
                          border: 'none',
                          color: '#0d3732',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Exercer este direito <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Governança & DPO Detailed Card */}
              <div
                style={{
                  backgroundColor: '#0d3732',
                  color: '#ffffff',
                  borderRadius: '16px',
                  padding: '40px',
                  border: '2px solid #cbab7a',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '30px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ color: '#cbab7a', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Canal Oficial de Governança
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#ffffff', margin: '8px 0 14px' }}>
                    Encarregada de Proteção de Dados (DPO)
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 20px' }}>
                    A Encarregada pelo Tratamento de Dados Pessoais atua como canal oficial de comunicação entre a Mascârello Haus Advocacia, os titulares de dados pessoais e a Autoridade Nacional de Proteção de Dados (ANPD), nos termos do Art. 41 da Lei nº 13.709/2018.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchTab('requisicao')}
                    style={{
                      backgroundColor: '#cbab7a',
                      color: '#0d3732',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Abrir Solicitação Formal ao DPO <FileCheck2 size={16} />
                  </button>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(203, 171, 122, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#cbab7a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d3732', fontWeight: 700, fontSize: '1.2rem' }}>
                      MH
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: '#ffffff' }}>Mirataira Haus</strong>
                      <span style={{ fontSize: '0.85rem', color: '#cbab7a' }}>Encarregada de Proteção de Dados (DPO)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={16} style={{ color: '#cbab7a' }} />
                      <a href="mailto:privacidade@mascarellohaus.adv.br" style={{ color: '#ffffff', textDecoration: 'underline' }}>
                        privacidade@mascarellohaus.adv.br
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={16} style={{ color: '#cbab7a' }} />
                      <a href="mailto:dpo@mascarellohaus.com.br" style={{ color: '#ffffff', textDecoration: 'underline' }}>
                        dpo@mascarellohaus.com.br
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Phone size={16} style={{ color: '#cbab7a' }} />
                      <span>WhatsApp Oficial: (49) 98822-0982</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: AVISO DE PRIVACIDADE */}
          {activeTab === 'privacidade' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '32px' }}>
                <span style={{ color: '#cbab7a', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Transparência & Conformidade Regulatória
                </span>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '2.2rem', margin: '8px 0 10px' }}>
                  Aviso de Privacidade & Tratamento de Dados
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                  Versão 2.1 — Atualizado em conformidade com as resoluções da ANPD e Lei nº 13.709/2018.
                </p>
              </div>

              <div style={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.8 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.4rem', marginTop: '24px', marginBottom: '12px' }}>
                  1. Compromisso com a sua Privacidade
                </h3>
                <p>
                  A <strong>Mascârello Haus Advocacia e Consultoria</strong> valoriza a confiança de seus clientes, parceiros, colaboradores e visitantes. Por isso, estruturou suas rotinas operacionais e técnicas sob os mais rigorosos padrões de segurança da informação e governança em proteção de dados pessoais.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.4rem', marginTop: '28px', marginBottom: '12px' }}>
                  2. Princípios Orientadores (Art. 6º da LGPD)
                </h3>
                <p>
                  Todo tratamento de dados realizado por nosso escritório observa estritamente os princípios legais de:
                </p>
                <ul style={{ paddingLeft: '24px', marginBottom: '20px' }}>
                  <li><strong>Finalidade e Adequação:</strong> Coleta compatível exclusivamente com propósitos legítimos e específicos informados ao titular.</li>
                  <li><strong>Necessidade (Minimização):</strong> Limitação do tratamento ao mínimo necessário para a realização das finalidades contratadas ou legais.</li>
                  <li><strong>Livre Acesso e Qualidade:</strong> Garantia de consulta facilitada e exatidão contínua dos dados aos respectivos titulares.</li>
                  <li><strong>Transparência:</strong> Informações claras, precisas e facilmente acessíveis sobre os critérios e agentes de tratamento.</li>
                  <li><strong>Segurança e Prevenção:</strong> Adoção de medidas técnicas (criptografia, controle de acessos restritos, registros de logs) para blindagem contra vazamentos.</li>
                  <li><strong>Não Discriminação e Responsabilização:</strong> Impossibilidade de uso para fins discriminatórios ou abusivos e prestação eficaz de contas.</li>
                </ul>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.4rem', marginTop: '28px', marginBottom: '12px' }}>
                  3. Bases Legais e Finalidades de Coleta
                </h3>
                <p>
                  Os dados tratados por meio deste website (como formulários de contato, Central do Titular e Canal de Denúncias) apoiam-se nas bases legais do <strong>cumprimento de obrigação legal e regulatória (Art. 7º, II)</strong>, <strong>execução de procedimentos preliminares a contratos (Art. 7º, V)</strong>, <strong>exercício regular de direitos em processos judiciais ou administrativos (Art. 7º, VI)</strong> e <strong>legítimo interesse do controlador (Art. 7º, IX)</strong>.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.4rem', marginTop: '28px', marginBottom: '12px' }}>
                  4. Gestão de Cookies e Tecnologias de Armazenamento Local
                </h3>
                <p>
                  Nosso portal utiliza cookies e chaves de armazenamento local (<code>localStorage</code> e <code>sessionStorage</code>) estritamente necessários para segurança cibernética, prevenção contra abusos automatizados e integridade de sessões. Recursos funcionais (como salvamento de rascunho de formulários) e cookies analíticos somente são mantidos conforme suas escolhas. A qualquer instante, você pode revisar ou revogar suas preferências:
                </p>

                <div style={{ margin: '18px 0 24px', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#0d3732' }}>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Identificador (Cookie / Storage)</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Categoria</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Origem / Provedor</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Finalidade Específica</th>
                        <th style={{ padding: '12px 14px', fontWeight: 700 }}>Retenção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'lgpd_cookie_preferences', cat: 'Necessário', prov: 'Mascârello Haus (localStorage)', desc: 'Armazena as preferências granulares de consentimento de cookies do titular.', ret: '12 meses' },
                        { name: 'lgpd_cookie_consent', cat: 'Necessário', prov: 'Mascârello Haus (localStorage)', desc: 'Registro simplificado do estado de consentimento para controle do banner.', ret: '12 meses' },
                        { name: 'mh_sec_seed', cat: 'Necessário', prov: 'Mascârello Haus (sessionStorage)', desc: 'Semente criptográfica efêmera (SHA-256) para proteção anti-abuso sem coleta de IP real.', ret: 'Sessão' },
                        { name: 'mh_rl_* (contato, lgpd_central, canal_denuncias, questionario_conformidade)', cat: 'Necessário', prov: 'Mascârello Haus (localStorage)', desc: 'Controle de limite de envios (Rate Limiting) contra spam e ataques de força bruta.', ret: '10 a 15 min' },
                        { name: 'sb-iwzimemdxchmcrvlyhxg-auth-token', cat: 'Necessário', prov: 'Supabase Inc. (localStorage)', desc: 'Autenticação criptografada restrita ao painel administrativo institucional.', ret: 'Sessão admin' },
                        { name: '_vercel_jwt / __vercel_live_token', cat: 'Necessário', prov: 'Vercel Inc. (HTTP Cookie)', desc: 'Roteamento seguro na borda (Edge Network) e proteção contra ataques DDoS.', ret: 'Sessão' },
                        { name: 'mh_draft_questionario_conformidade_v2 / mh_form_state_*', cat: 'Funcional', prov: 'Mascârello Haus (Storage Local)', desc: 'Preserva o rascunho das 6 etapas do Questionário de Conformidade para Fornecedores.', ret: 'Sessão / 7 dias' },
                        { name: 'mh_draft_central_lgpd', cat: 'Funcional', prov: 'Mascârello Haus (localStorage)', desc: 'Preserva temporariamente o rascunho da Requisição de Direitos do Titular até o envio.', ret: 'Até o envio' },
                        { name: 'mh_draft_canal_denuncias', cat: 'Funcional', prov: 'Mascârello Haus (localStorage)', desc: 'Salva localmente o rascunho do Canal de Denúncias quando ativado pelo próprio usuário.', ret: '7 dias / envio' },
                        { name: 'NID / CONSENT (Google Maps)', cat: 'Funcional', prov: 'Google LLC (Terceiro)', desc: 'Renderização dos mapas interativos das unidades de Videira/SC e Caçador/SC na página de Contato.', ret: '6 meses' },
                        { name: '_ga / _ga_*', cat: 'Analítico', prov: 'Google Analytics (IP anonimizado)', desc: 'Métricas estatísticas agregadas de audiência (ativado apenas mediante consentimento).', ret: '2 anos' },
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#0d3732', fontSize: '0.8rem' }}>{row.name}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.73rem',
                              fontWeight: 700,
                              backgroundColor: row.cat === 'Necessário' ? 'rgba(13, 55, 50, 0.1)' : 'rgba(203, 171, 122, 0.2)',
                              color: row.cat === 'Necessário' ? '#0d3732' : '#856404'
                            }}>
                              {row.cat}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#475569' }}>{row.prov}</td>
                          <td style={{ padding: '10px 14px', color: '#334155' }}>{row.desc}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0d3732', whiteSpace: 'nowrap' }}>{row.ret}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid #0d3732',
                      backgroundColor: '#0d3732',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Lock size={15} /> Configurar Preferências de Cookies
                  </button>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.4rem', marginTop: '28px', marginBottom: '12px' }}>
                  5. Contato com a Encarregada de Dados (DPO)
                </h3>
                <p>
                  Para quaisquer dúvidas sobre este aviso, entre em contato direto pelo e-mail: <strong>privacidade@mascarellohaus.adv.br</strong> ou utilize a aba de <button type="button" onClick={() => switchTab('requisicao')} style={{ background: 'none', border: 'none', color: '#0d3732', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Requisição do Titular</button>.
                </p>
              </div>
            </div>
          )}

          {/* ABA 4: TERMOS DE USO */}
          {activeTab === 'termos' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '32px' }}>
                <span style={{ color: '#cbab7a', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Termos Gerais e Condições de Uso
                </span>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '2.2rem', margin: '8px 0 10px' }}>
                  Termos de Uso do Site Mascârello Haus
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                  Versão 1 — Regula o acesso e as condições de uso do portal https://mascarellohaus.adv.br/
                </p>
              </div>

              <div style={{ color: '#334155', fontSize: '0.96rem', lineHeight: 1.8 }}>
                <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '24px' }}>
                  O presente termo regula o acesso e condições de uso do site https://mascarellohaus.adv.br/, bem como os serviços oferecidos por meio da aplicação, estabelecendo os direitos e as obrigações dos usuários.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  1. QUEM SOMOS
                </h3>
                <p>
                  Somos um escritório dedicado a atender às necessidades e riscos, em fomento da conformidade e boas práticas relacionadas à regulação do mercado, direcionado ao Compliance nas mais diversas áreas, em especial à proteção de Dados. Por meio de equipe multidisciplinar, orienta e desenvolve estratégias que atendam aspectos regulamentares, de governança corporativa e de segurança da informação em respeito à metodologia aplicável a cada segmento. De maneira proativa também atua nas organizações da sociedade civil em projetos sociais e Advocacia Pro Bono.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  2. TERMOS E DEFINIÇÕES
                </h3>
                <p>
                  <strong>Cookies:</strong> Arquivos gerados automaticamente e guardados nos dispositivos ao acessar o site, retendo informações identificadoras do dispositivo e navegação.<br />
                  <strong>Informações de Usuário:</strong> Dados identificativos subdivididos em informações pessoais (nome, e-mail, telefone) e dados de navegação técnica.<br />
                  <strong>Usuário:</strong> Todas as pessoas físicas que utilizam ou visitam o site, maiores de 18 anos ou devidamente assistidas.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  3. UTILIZAÇÃO DE NOSSO SITE
                </h3>
                <p>
                  O uso do site é regido por estes Termos Gerais. Ao utilizar a aplicação de qualquer forma, você concorda expressamente com estas condições. O escritório poderá atualizar os termos a qualquer momento, sendo de responsabilidade do usuário consultar a versão vigente.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  4. RESPONSABILIDADES DO USUÁRIO
                </h3>
                <p>
                  O usuário compromete-se a fornecer dados verdadeiros, completos e atualizados em todos os formulários. É expressamente vedado utilizar o site para fins ilícitos, transmitir vírus, códigos maliciosos ou materiais ofensivos e difamatórios.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  5. PRIVACIDADE E DIREITOS DO USUÁRIO
                </h3>
                <p>
                  O tratamento de dados pessoais segue rigorosamente a Lei Federal nº 13.709/2018 (LGPD), assegurando o exercício facilitado de todos os direitos dos titulares através do canal de DPO designado.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  6. PROPRIEDADE INTELECTUAL & DIREITOS AUTORAIS
                </h3>
                <p>
                  Todo o conteúdo deste website, marcas, logotipos, textos, artigos e cartilhas pertencem com exclusividade à Mascârello Haus Advocacia e Consultoria, sendo expressamente proibida a cópia, extração ou republicação comercial sem autorização expressa por escrito.
                </p>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', marginTop: '24px' }}>
                  7. LEI APLICÁVEL E FORO
                </h3>
                <p>
                  Em eventuais controvérsias decorrentes destes Termos, buscar-se-á a resolução amigável e extrajudicial. Não sendo viável, fica eleito o Foro da Comarca de Videira/SC para dirimir qualquer litígio, com renúncia a qualquer outro por mais privilegiado que seja.
                </p>
                <p style={{ marginTop: '24px', fontWeight: 600, color: '#0d3732' }}>
                  Videira — Santa Catarina | Mascârello Haus Advocacia
                </p>
              </div>
            </div>
          )}

          {/* ABA 5: CARTILHAS & DOWNLOADS */}
          {activeTab === 'cartilhas' && (
            <div>
              <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 40px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0d3732', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  <BookOpen size={16} /> Biblioteca de Conhecimento & Segurança
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '2.1rem', margin: '0 0 12px' }}>
                  Cartilhas Oficiais de Proteção de Dados
                </h2>
                <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7 }}>
                  Baixe gratuitamente as publicações oficiais elaboradas pela equipe de Compliance e Segurança da Informação da Mascârello Haus. Material didático, acessível e prático para capacitar equipes e proteger negócios.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '50px' }}>
                {OFFICIAL_CARTILHAS.map((cartilha, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '30px 26px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d3732', backgroundColor: '#e2f5f1', padding: '4px 12px', borderRadius: '20px' }}>
                          {cartilha.badge}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          {cartilha.fileSize}
                        </span>
                      </div>

                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#0d3732' }}>
                        <BookOpen size={24} />
                      </div>

                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.28rem', color: '#0d3732', margin: '0 0 10px', lineHeight: 1.4 }}>
                        {cartilha.title}
                      </h3>

                      <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 20px' }}>
                        {cartilha.subtitle}
                      </p>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                      <a
                        href={cartilha.fileUrl}
                        download
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          backgroundColor: '#0d3732',
                          color: '#ffffff',
                          padding: '12px 18px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'background 0.2s',
                        }}
                      >
                        <Download size={16} /> Baixar PDF
                      </a>
                      <a
                        href={cartilha.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          textDecoration: 'none',
                        }}
                        title="Visualizar no navegador"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CROSS-LINKS HUB DE GOVERNANÇA */}
          <div
            style={{
              marginTop: '60px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '36px 32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ fontSize: '0.8rem', color: '#cbab7a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                Ecossistema Integrado de Conformidade
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.7rem', margin: '6px 0 8px' }}>
                Canais Complementares de Governança
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                Conheça os outros canais oficiais de compliance e ética da Mascârello Haus Advocacia:
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <Link
                to="/canal-de-denuncias/"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#0d3732', fontSize: '1.02rem', marginBottom: '4px' }}>
                    Canal de Denúncias
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5 }}>
                    Relato confidencial e 100% anônimo de fraudes, assédio, descumprimento de boas práticas ou violações éticas.
                  </span>
                </div>
              </Link>

              <Link
                to="/questionario-de-conformidade/"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#0d3732', fontSize: '1.02rem', marginBottom: '4px' }}>
                    Questionário de Conformidade
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5 }}>
                    Avaliação técnica de segurança e conformidade para fornecedores, parceiros e prestadores de serviços.
                  </span>
                </div>
              </Link>

              <Link
                to="/codigo-de-conduta/"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fefce8', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04', flexShrink: 0 }}>
                  <Scale size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#0d3732', fontSize: '1.02rem', marginBottom: '4px' }}>
                    Código de Conduta
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5 }}>
                    Consulte os princípios de integridade, relacionamento e conduta que norteiam o escritório.
                  </span>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default CentralProtecaoDados;
