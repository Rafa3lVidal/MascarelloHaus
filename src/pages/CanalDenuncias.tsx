import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  Shield,
  Lock,
  Copy,
  Check,
  FileCheck,
  Info,
  UserX,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  FileText,
  ExternalLink,
} from 'lucide-react';
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

interface DenunciaFormData {
  fatos: string[];
  fatosOutrosTexto: string;
  trabalhaEscritorio: 'Sim' | 'Não';
  queixaCompliance: 'Sim' | 'Não';
  naoQuerDivulgarDados: boolean;
  denuncianteNome: string;
  denuncianteContato: string;
  pessoaEnvolvida: string;
  dataIncidente: string;
  horaIncidente: string;
  localizacao: string;
  descricao: string;
  concordaTermos: boolean;
}

const INITIAL_FORM_DATA: DenunciaFormData = {
  fatos: [],
  fatosOutrosTexto: '',
  trabalhaEscritorio: 'Não',
  queixaCompliance: 'Não',
  naoQuerDivulgarDados: true,
  denuncianteNome: '',
  denuncianteContato: '',
  pessoaEnvolvida: '',
  dataIncidente: '',
  horaIncidente: '',
  localizacao: '',
  descricao: '',
  concordaTermos: false,
};

const FATOS_OPCOES = [
  'Corrupção por parte de colaboradores da Mascarello Haus',
  'Não seguimento de boas práticas',
  'Descumprimento de procedimentos de trabalho estabelecidos',
  'Racismo, assédio, violência, discriminação, xenofobia, preconceito de classes e afins',
  'Outros',
];

const DRAFT_STORAGE_KEY = 'mh_draft_canal_denuncias';

export const CanalDenuncias: React.FC = () => {
  const [formData, setFormData] = useState<DenunciaFormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_FORM_DATA, ...parsed.formData };
      }
    } catch {
      // Fallback
    }
    return INITIAL_FORM_DATA;
  });

  const [attachments, setAttachments] = useState<UploadedAttachment[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed.attachments) ? parsed.attachments : [];
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [security, setSecurity] = useState(createInitialSecurityState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-save draft on changes
  useEffect(() => {
    if (protocol) return;
    try {
      const payload = {
        formData,
        attachments,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      const now = new Date();
      setLastSavedAt(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      // Ignore quota errors
    }
  }, [formData, attachments, protocol]);

  const handleClearDraft = () => {
    if (window.confirm('Deseja limpar todo o rascunho deste relato?')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setFormData(INITIAL_FORM_DATA);
      setAttachments([]);
      setLastSavedAt(null);
    }
  };

  const handleCheckboxChange = (fato: string) => {
    setFormData((prev) => {
      const exists = prev.fatos.includes(fato);
      const nextFatos = exists
        ? prev.fatos.filter((f) => f !== fato)
        : [...prev.fatos, fato];
      return { ...prev, fatos: nextFatos };
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
    setErrorMessage(null);

    const cleanPessoa = sanitizeText(formData.pessoaEnvolvida, 200);
    const cleanDesc = sanitizeText(formData.descricao, 15000);
    const cleanDenunciante = sanitizeText(formData.denuncianteNome, 150);
    const cleanContato = sanitizeText(formData.denuncianteContato, 150);
    const cleanLoc = sanitizeText(formData.localizacao, 250);
    const cleanOutros = sanitizeText(formData.fatosOutrosTexto, 300);

    if (formData.fatos.length === 0) {
      setErrorMessage(
        'Por favor, selecione ao menos uma opção sobre quais fatos se referem a sua preocupação.'
      );
      return;
    }

    if (!cleanPessoa) {
      setErrorMessage('Por favor, informe a(s) pessoa(s) envolvida(s) no incidente.');
      return;
    }

    if (cleanDesc.length < 15) {
      setErrorMessage(
        'Por favor, descreva o evento com mais detalhes (mínimo de 15 caracteres para permitir apuração adequada).'
      );
      return;
    }

    if (!formData.concordaTermos) {
      setErrorMessage(
        'É necessário declarar concordância com os Termos e a boa-fé das informações.'
      );
      return;
    }

    const secCheck = validateSecurityState(security);
    if (!secCheck.valid) {
      setErrorMessage(secCheck.error || 'Falha na verificação de segurança anti-spam.');
      return;
    }

    const rateCheck = checkClientRateLimit('denuncias', 4, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      setErrorMessage(
        `Limite temporário de envios atingido. Por segurança, aguarde ${rateCheck.retryAfterSeconds} segundos.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedProtocol = generateProtocol('DEN');
      const ipHash = await getAnonymousIpHash();

      // Consolidate concern types with custom text if provided
      const consolidatedConcerns = formData.fatos.map((f) => {
        if (f === 'Outros' && cleanOutros) {
          return `Outros: ${cleanOutros}`;
        }
        return f;
      });

      const reporterIdentification = formData.naoQuerDivulgarDados
        ? 'ANÔNIMO'
        : [cleanDenunciante || 'IDENTIFICADO', cleanContato ? `(Contato: ${cleanContato})` : '']
            .filter(Boolean)
            .join(' ');

      const { error } = await supabase.from('whistleblower_reports').insert({
        protocol: generatedProtocol,
        concern_types: consolidatedConcerns,
        works_at_firm: formData.trabalhaEscritorio,
        has_compliance_complaint: formData.queixaCompliance,
        reporter_name: reporterIdentification,
        involved_persons: cleanPessoa,
        incident_date: formData.dataIncidente || null,
        incident_time: formData.horaIncidente || null,
        incident_location: cleanLoc || null,
        description: cleanDesc,
        is_anonymous: formData.naoQuerDivulgarDados,
        attachments_json: attachments,
        status: 'new',
        ip_hash: ipHash,
        security_meta: {
          honeypot: security.honeypotWebsite || security.honeypotFax || '',
          challengeToken: security.challengeToken,
          elapsedMs: Date.now() - security.mountedAt,
          attachmentCount: attachments.length,
        },
      });

      if (error) throw error;

      await recordFormConsent(
        'whistleblower_report',
        formData.naoQuerDivulgarDados ? 'anon' : cleanDenunciante
      );
      recordClientSubmission('denuncias');

      // Clear draft after successful insertion
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setProtocol(generatedProtocol);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      console.error('Erro ao enviar denúncia:', err);
      setErrorMessage(
        err?.message ||
          'Erro ao registrar denúncia. Por favor, tente novamente ou contate diretamente a ouvidoria.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="denuncias-page">
      <SEO
        title="Canal de Denúncias & Ouvidoria Segura | Mascârello Haus Advocacia"
        description="Canal oficial, independente e confidencial para colaboradores, clientes e parceiros relatarem suspeitas de desvios, violações éticas e descumprimento de boas práticas. 100% anônimo ou confidencial."
        canonical="https://mascarellohaus.adv.br/canal-de-denuncias/"
      />

      {/* Hero Header */}
      <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #0d3732 0%, #071f1c 100%)', color: '#ffffff', padding: '60px 0 50px' }}>
        <div className="container" style={{ maxWidth: '960px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', backgroundColor: 'rgba(203, 171, 122, 0.15)', border: '1px solid rgba(203, 171, 122, 0.4)', color: '#cbab7a', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '18px' }}>
            <Shield size={14} /> Integridade, Ética & Governança Corporativa
          </div>
          <h1 className="banner-title" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 700, margin: '0 0 16px', color: '#ffffff' }}>
            Canal de Denúncias
          </h1>
          <p className="banner-desc" style={{ margin: '0 auto', maxWidth: '780px', color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A <strong>Mascârello Haus Advocacia</strong> valoriza a ética, transparência e integridade irrestritas. Este canal é a ferramenta oficial e segura para que colaboradores, clientes, fornecedores e terceiros relatem de forma confidencial ou 100% anônima qualquer violação às normas, boas práticas ou condutas inadequadas.
          </p>

          {/* Quick trust metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '36px', textAlign: 'left' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(203, 171, 122, 0.25)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Lock size={22} style={{ color: '#cbab7a', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>Sigilo & Anonimato</strong>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Garantia legal de não retaliação e opção de relato sem identificação.</span>
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(203, 171, 122, 0.25)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <FileCheck size={22} style={{ color: '#cbab7a', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>Protocolo Único</strong>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Acompanhamento sigiloso através de código gerado na finalização.</span>
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(203, 171, 122, 0.25)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Shield size={22} style={{ color: '#cbab7a', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '0.95rem' }}>Comitê Independente</strong>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Apuração técnica e imparcial de todos os fatos relatados.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section-padding bg-light" style={{ padding: '60px 0', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          {protocol ? (
            <div className="denuncia-success-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '50px 40px', textAlign: 'center', boxShadow: '0 10px 35px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#f0fdf4', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={42} style={{ color: '#16a34a' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.9rem', marginBottom: '12px' }}>
                Relato Registrado com Sucesso
              </h2>
              <p style={{ color: '#475569', fontSize: '1.02rem', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.7 }}>
                Agradecemos sua colaboração em favor da integridade. Seu relato foi recebido de forma criptografada pelo nosso Comitê de Ética e Conformidade para apuração célere e imparcial.
              </p>

              <div className="protocol-box" style={{ background: '#f8fafc', border: '2px dashed #cbab7a', borderRadius: '12px', padding: '24px 30px', margin: '20px auto 28px', maxWidth: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span className="protocol-label" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 600 }}>
                  Número de Protocolo Sigiloso
                </span>
                <span className="protocol-value" style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: '#0d3732', letterSpacing: '0.04em' }}>
                  {protocol}
                </span>
                <button type="button" onClick={handleCopyProtocol} className="copy-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0d3732', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado para a área de transferência!' : 'Copiar Número do Protocolo'}
                </button>
              </div>

              {attachments.length > 0 && (
                <div style={{ maxWidth: '520px', margin: '0 auto 24px', textAlign: 'left', backgroundColor: '#f1f5f9', padding: '14px 18px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Evidências e Arquivos vinculados ({attachments.length}):
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#475569' }}>
                    {attachments.map((att, i) => (
                      <li key={i}>{att.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="info-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#64748b', fontSize: '0.92rem', maxWidth: '560px', margin: '0 auto' }}>
                <Lock size={18} style={{ color: '#cbab7a', flexShrink: 0 }} />
                <span>
                  Guarde este número. Ele é o seu identificador exclusivo para acompanhar desdobramentos, sem comprometer a sua privacidade.
                </span>
              </div>

              <div style={{ marginTop: '36px', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#0d3732', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => {
                    setProtocol(null);
                    setFormData(INITIAL_FORM_DATA);
                    setAttachments([]);
                  }}
                >
                  Fazer outro relato
                </button>
                <a
                  href="/codigo-de-conduta/"
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '8px', border: '1px solid #0d3732', color: '#0d3732', textDecoration: 'none', fontWeight: 600 }}
                >
                  Consultar Código de Conduta
                </a>
              </div>
            </div>
          ) : (
            <div className="wpforms-container" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              
              {/* Draft auto-save alert */}
              {lastSavedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', marginBottom: '24px', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>✓ Rascunho salvo automaticamente às {lastSavedAt}</span>
                  <button type="button" onClick={handleClearDraft} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline' }}>
                    Limpar Rascunho
                  </button>
                </div>
              )}

              {/* Guarantees Box */}
              <div className="denuncia-intro-box" style={{ display: 'flex', gap: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px 24px', borderRadius: '12px', marginBottom: '32px' }}>
                <Shield size={26} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#166534', fontSize: '1.05rem', margin: '0 0 4px', fontWeight: 700 }}>
                    Garantia de Confidencialidade e Política de Não Retaliação
                  </h4>
                  <p style={{ color: '#15803d', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                    A Mascârello Haus assegura o sigilo total de todos os relatos. Caso opte pelo anonimato, nenhuma informação que permita a sua identificação pessoal será recolhida. A empresa repudia veementemente qualquer tentativa de retaliação a denunciantes de boa-fé.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="form-error-banner" style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', marginBottom: '24px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem' }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* ETAPA 1: O que aconteceu */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d3732', color: '#cbab7a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>1</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', margin: 0 }}>
                      Qual é o motivo ou natureza do seu relato? <span style={{ color: '#cbab7a' }}>*</span>
                    </h3>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Selecione uma ou mais opções que melhor caracterizam a sua preocupação:
                  </p>

                  <div className="checkbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {FATOS_OPCOES.map((fato, idx) => {
                      const checked = formData.fatos.includes(fato);
                      return (
                        <label
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: `1px solid ${checked ? '#0d3732' : '#e2e8f0'}`,
                            backgroundColor: checked ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxChange(fato)}
                            style={{ marginTop: '3px', accentColor: '#0d3732' }}
                          />
                          <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: checked ? 600 : 400 }}>
                            {fato}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {formData.fatos.includes('Outros') && (
                    <div style={{ marginTop: '12px', paddingLeft: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Por favor, especifique resumidamente o fato:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Conflito de interesses, uso indevido de recursos, etc."
                        value={formData.fatosOutrosTexto}
                        onChange={(e) => setFormData({ ...formData, fatosOutrosTexto: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>

                {/* ETAPA 2: Relação com o Escritório & Compliance */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d3732', color: '#cbab7a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>2</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', margin: 0 }}>
                      Vínculo e Histórico
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
                        Você trabalha na Mascarello Haus ou presta serviços ao escritório?
                      </label>
                      <div className="radio-group">
                        {(['Sim', 'Não'] as const).map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="trabalhaEscritorio"
                              value={opt}
                              checked={formData.trabalhaEscritorio === opt}
                              onChange={(e) => setFormData({ ...formData, trabalhaEscritorio: e.target.value as 'Sim' | 'Não' })}
                              style={{ accentColor: '#0d3732' }}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
                        Você atualmente tem alguma queixa a nível de Compliance da Mascarello Haus?
                      </label>
                      <div className="radio-group">
                        {(['Sim', 'Não'] as const).map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="queixaCompliance"
                              value={opt}
                              checked={formData.queixaCompliance === opt}
                              onChange={(e) => setFormData({ ...formData, queixaCompliance: e.target.value as 'Sim' | 'Não' })}
                              style={{ accentColor: '#0d3732' }}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ETAPA 3: Nível de Sigilo & Anonimato */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d3732', color: '#cbab7a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>3</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', margin: 0 }}>
                      Identificação do Relatante
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div
                      onClick={() => setFormData({ ...formData, naoQuerDivulgarDados: true })}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '10px',
                        border: `2px solid ${formData.naoQuerDivulgarDados ? '#0d3732' : '#e2e8f0'}`,
                        backgroundColor: formData.naoQuerDivulgarDados ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <UserX size={26} style={{ color: formData.naoQuerDivulgarDados ? '#16a34a' : '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#0d3732', fontSize: '0.98rem', marginBottom: '4px' }}>
                          Relato 100% Anônimo
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                          Nenhum dado pessoal, nome ou contato será armazenado ou compartilhado com ninguém.
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, naoQuerDivulgarDados: false })}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '10px',
                        border: `2px solid ${!formData.naoQuerDivulgarDados ? '#0d3732' : '#e2e8f0'}`,
                        backgroundColor: !formData.naoQuerDivulgarDados ? '#f8fafc' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <UserCheck size={26} style={{ color: !formData.naoQuerDivulgarDados ? '#0d3732' : '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#0d3732', fontSize: '0.98rem', marginBottom: '4px' }}>
                          Relato Identificado & Confidencial
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                          Seus dados serão mantidos sob sigilo restrito pelo Comitê de Ética para eventuais esclarecimentos.
                        </span>
                      </div>
                    </div>
                  </div>

                  {!formData.naoQuerDivulgarDados && (
                    <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Seu Nome ou Cargo (Opcional):
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: João da Silva / Assistente Jurídico"
                          value={formData.denuncianteNome}
                          onChange={(e) => setFormData({ ...formData, denuncianteNome: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                          Contato sigiloso para retorno (E-mail ou WhatsApp):
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: joao@email.com ou (49) 99999-9999"
                          value={formData.denuncianteContato}
                          onChange={(e) => setFormData({ ...formData, denuncianteContato: e.target.value })}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ETAPA 4: Detalhes do Incidente */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d3732', color: '#cbab7a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>4</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', margin: 0 }}>
                      Detalhes do Ocorrido
                    </h3>
                  </div>

                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                      Pessoa(s) envolvida(s) no incidente <span style={{ color: '#cbab7a' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nome(s), setor, cargo ou empresa das pessoas envolvidas"
                      required
                      value={formData.pessoaEnvolvida}
                      onChange={(e) => setFormData({ ...formData, pessoaEnvolvida: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Data do incidente:
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dataIncidente}
                        onChange={(e) => setFormData({ ...formData, dataIncidente: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Hora aproximada:
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.horaIncidente}
                        onChange={(e) => setFormData({ ...formData, horaIncidente: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Localização do incidente:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Videira, Caçador, WhatsApp, Reunião..."
                        value={formData.localizacao}
                        onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>
                        Descreva o evento em detalhes <span style={{ color: '#cbab7a' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.8rem', color: formData.descricao.length < 15 ? '#ef4444' : '#64748b' }}>
                        {formData.descricao.length} caracteres (mínimo 15)
                      </span>
                    </div>
                    <textarea
                      className="form-control"
                      rows={6}
                      required
                      placeholder="Descreva de forma clara e objetiva o que aconteceu, quando, onde, se houve testemunhas e quais evidências existem..."
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}
                    />
                  </div>
                </div>

                {/* ETAPA 5: Upload de Evidências com Auto-Upload */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0d3732', color: '#cbab7a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>5</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: '#0d3732', fontSize: '1.25rem', margin: 0 }}>
                      Anexo de Arquivos e Evidências
                    </h3>
                  </div>

                  <FileUploader
                    id="wpforms_2805_15"
                    label="Se você possui algum documento, foto, vídeo, áudio ou depoimentos que queira anexar, é só utilizar o envio abaixo."
                    description="Formatos aceitos: PDF, DOC, DOCX, PNG, JPG, JPEG, MP3, WAV, MP4, ZIP (até 5 arquivos de 15MB cada). O upload é processado imediatamente com armazenamento em nuvem criptografada."
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                    autoUpload={true}
                    folder="denuncias"
                    fieldKey="evidencias_denuncia"
                    maxFiles={5}
                    maxSizeMB={15}
                    allowedExtensions={['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'mp3', 'wav', 'mp4', 'zip']}
                    variant="light"
                  />
                </div>

                {/* ETAPA 6: Termos de Uso e Sigilo */}
                <div style={{ marginBottom: '28px', padding: '18px 20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      required
                      checked={formData.concordaTermos}
                      onChange={(e) => setFormData({ ...formData, concordaTermos: e.target.checked })}
                      style={{ marginTop: '3px', accentColor: '#0d3732' }}
                    />
                    <span style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
                      Declaro que as informações aqui relatadas são de boa-fé e verdadeiras segundo o meu conhecimento, e concordo com os Termos de Uso e Sigilo do Canal de Denúncias da Mascârello Haus Advocacia. <span style={{ color: '#cbab7a' }}>*</span>
                    </span>
                  </label>
                </div>

                <SecurityShield security={security} onChange={setSecurity} variant="light" />

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    backgroundColor: '#0d3732',
                    color: '#ffffff',
                    border: 'none',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(13, 55, 50, 0.25)',
                    transition: 'all 0.2s',
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando relato com criptografia...'
                  ) : (
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
    </div>
  );
};

export default CanalDenuncias;
