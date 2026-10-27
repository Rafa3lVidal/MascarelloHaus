import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  Building,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Save,
  Trash2,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import FileUploader from '../components/FileUploader';
import SecurityShield, { createInitialSecurityState } from '../components/SecurityShield';
import { supabase } from '../lib/supabase';
import {
  formatCNPJ,
  formatCEP,
  formatPhone,
  isValidEmail,
  sanitizeText,
  sanitizeEmail,
  generateProtocol,
  getAnonymousIpHash,
  checkClientRateLimit,
  recordClientSubmission,
  validateSecurityState,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
  UploadedAttachment,
} from '../lib/formSecurity';

interface FormDataState {
  // Dados da Empresa
  cnpj: string;
  nomeEmpresa: string;
  enderecoRua: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoEstado: string;
  enderecoCep: string;
  responsavelNome: string;
  contatoEmail: string;
  contatoTelefone: string;

  // 23 Perguntas
  q1_contrato: string;
  q1_comentario: string;
  q2_politica: string;
  q2_comentario: string;
  q3_treinamentos: string;
  q3_comentario: string;
  q4_dpo_contato: string;
  q5_mapping_ropa: string;
  q6_coleta_dados: string;
  q6_quais_especies: string;
  q7_finalidades: string;
  q8_log_armazenamento: string;
  q8_gestao_consentimento: string;
  q8_sistemas_plataformas: string;
  q9_seguranca_cripto: string;
  q10_nuvem_servico: string;
  q10_nuvem_transferencia_internacional: string;
  q11_gestao_incidentes: string;
  q12_plano_continuidade: string;
  q12_contingencia: string;
  q13_orientacoes_incidentes: string;
  q14_dados_sensiveis: string;
  q15_procedimento_sensivel: string;
  q15_qual_procedimento: string;
  q16_compartilhamento_terceiros: string;
  q16_para_qual_empresa: string;
  q17_quarteirizacao: string;
  q18_gestao_terceiros: string;
  q19_inventario_ripd: string;
  q20_testes_pentest: string;
  q21_seguro_cyber: string;
  q22_apps_mobile: string;
  q22_fluxo_mobile: string;
  q23_site_web: string;
  q23_fluxo_web: string;
  comunicado_assinado_confirm: string;

  // Mapa de Anexos Enviados (auto-upload imediato com persistência total)
  attachmentsMap: Record<string, UploadedAttachment[]>;
}

const initialFormState: FormDataState = {
  cnpj: '',
  nomeEmpresa: '',
  enderecoRua: '',
  enderecoBairro: '',
  enderecoCidade: '',
  enderecoEstado: 'SC',
  enderecoCep: '',
  responsavelNome: '',
  contatoEmail: '',
  contatoTelefone: '',

  q1_contrato: 'Sim',
  q1_comentario: '',
  q2_politica: 'Sim',
  q2_comentario: '',
  q3_treinamentos: 'Sim',
  q3_comentario: '',
  q4_dpo_contato: '',
  q5_mapping_ropa: 'Sim',
  q6_coleta_dados: 'Não',
  q6_quais_especies: '',
  q7_finalidades: '',
  q8_log_armazenamento: '',
  q8_gestao_consentimento: '',
  q8_sistemas_plataformas: '',
  q9_seguranca_cripto: 'Sim',
  q10_nuvem_servico: '',
  q10_nuvem_transferencia_internacional: '',
  q11_gestao_incidentes: 'Sim',
  q12_plano_continuidade: 'Sim',
  q12_contingencia: '',
  q13_orientacoes_incidentes: '',
  q14_dados_sensiveis: 'Não',
  q15_procedimento_sensivel: 'Não',
  q15_qual_procedimento: '',
  q16_compartilhamento_terceiros: 'Não',
  q16_para_qual_empresa: '',
  q17_quarteirizacao: 'Não',
  q18_gestao_terceiros: '',
  q19_inventario_ripd: 'Sim',
  q20_testes_pentest: 'Sim',
  q21_seguro_cyber: 'Não',
  q22_apps_mobile: 'Não',
  q22_fluxo_mobile: '',
  q23_site_web: 'Sim',
  q23_fluxo_web: '',
  comunicado_assinado_confirm: 'Sim',

  attachmentsMap: {
    comunicado_assinado: [],
    q1_contrato: [],
    q2_politica: [],
    q5_mapping_ropa: [],
    q9_seguranca_cripto: [],
    q11_incidentes: [],
    q18_terceiros: [],
    q19_inventario_ripd: [],
    q20_pentest: [],
    comunicado_final_assinado: [],
  },
};

const SECTIONS = [
  { id: 1, title: 'Identificação da Empresa Fornecedora', desc: 'Dados cadastrais e contato do responsável/DPO' },
  { id: 2, title: 'Governança & Políticas de Privacidade', desc: 'Perguntas 1 a 5: Contratos, Políticas, Treinamentos e ROPA' },
  { id: 3, title: 'Tratamento de Dados & Finalidades', desc: 'Perguntas 6 a 8: Coleta de dados, finalidades e logs' },
  { id: 4, title: 'Segurança da Informação & Nuvem', desc: 'Perguntas 9 a 13: Criptografia, Cloud e Gestão de Incidentes' },
  { id: 5, title: 'Dados Sensíveis & Compartilhamentos', desc: 'Perguntas 14 a 18: Riscos especiais e quarteirização' },
  { id: 6, title: 'Auditorias, Riscos & Termo Assinado', desc: 'Perguntas 19 a 23 e Envio do Comunicado LGPD' },
];

export const QuestionarioConformidade: React.FC = () => {
  const [formData, setFormData] = useState<FormDataState>(() => {
    const saved = loadFormDraft<FormDataState>('questionario_conformidade_v2');
    if (saved) {
      return {
        ...initialFormState,
        ...saved,
        attachmentsMap: {
          ...initialFormState.attachmentsMap,
          ...(saved.attachmentsMap || {}),
        },
      };
    }
    return initialFormState;
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'full'>('wizard');

  const [security, setSecurity] = useState(createInitialSecurityState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [submittedAttachments, setSubmittedAttachments] = useState<UploadedAttachment[]>([]);
  const [copied, setCopied] = useState(false);
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  // Auto-save draft on changes
  useEffect(() => {
    saveFormDraft('questionario_conformidade_v2', formData);
  }, [formData]);

  const handleUpdateAttachments = (fieldKey: string, nextList: UploadedAttachment[]) => {
    setFormData((prev) => ({
      ...prev,
      attachmentsMap: {
        ...prev.attachmentsMap,
        [fieldKey]: nextList,
      },
    }));
  };

  const handleManualSaveDraft = () => {
    saveFormDraft('questionario_conformidade_v2', formData);
    setDraftSavedAlert(true);
    setTimeout(() => setDraftSavedAlert(false), 2500);
  };

  const handleClearDraft = () => {
    if (window.confirm('Tem certeza que deseja limpar o rascunho salvo deste formulário?')) {
      clearFormDraft('questionario_conformidade_v2');
      setFormData(initialFormState);
      setCurrentStep(1);
    }
  };

  const calculatePreliminaryScore = (): number => {
    let positive = 0;
    const totalScored = 13;
    if (formData.q1_contrato === 'Sim') positive++;
    if (formData.q2_politica === 'Sim') positive++;
    if (formData.q3_treinamentos === 'Sim') positive++;
    if (formData.q5_mapping_ropa === 'Sim') positive++;
    if (formData.q9_seguranca_cripto === 'Sim') positive++;
    if (formData.q11_gestao_incidentes === 'Sim') positive++;
    if (formData.q12_plano_continuidade === 'Sim') positive++;
    if (formData.q14_dados_sensiveis === 'Não' || formData.q15_procedimento_sensivel === 'Sim') positive++;
    if (formData.q16_compartilhamento_terceiros === 'Não') positive++;
    if (formData.q19_inventario_ripd === 'Sim') positive++;
    if (formData.q20_testes_pentest === 'Sim') positive++;
    if (formData.q21_seguro_cyber === 'Sim') positive++;
    if (formData.comunicado_assinado_confirm === 'Sim' || (formData.attachmentsMap.comunicado_final_assinado && formData.attachmentsMap.comunicado_final_assinado.length > 0)) positive++;

    return Math.round((positive / totalScored) * 100);
  };

  const handleCopyProtocol = () => {
    if (!protocol) return;
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    const cleanCompany = sanitizeText(formData.nomeEmpresa, 180);
    const cleanEmail = sanitizeEmail(formData.contatoEmail);
    const cleanResp = sanitizeText(formData.responsavelNome, 140);

    if (cleanCompany.length < 2) {
      setErrorMsg('Por favor, informe a Razão Social / Nome da Empresa.');
      setCurrentStep(1);
      return;
    }

    if (cleanCnpj.length !== 14) {
      setErrorMsg('Por favor, informe um CNPJ válido com 14 dígitos.');
      setCurrentStep(1);
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMsg('Por favor, informe um e-mail de contato corporativo válido.');
      setCurrentStep(1);
      return;
    }

    if (cleanResp.length < 2) {
      setErrorMsg('Por favor, informe o Responsável ou Encarregado de Dados.');
      setCurrentStep(1);
      return;
    }

    // Validação do comunicado assinado se respondeu 'Não' na pergunta final
    if (
      formData.comunicado_assinado_confirm === 'Não' &&
      (!formData.attachmentsMap.comunicado_final_assinado || formData.attachmentsMap.comunicado_final_assinado.length === 0) &&
      (!formData.attachmentsMap.comunicado_assinado || formData.attachmentsMap.comunicado_assinado.length === 0)
    ) {
      setErrorMsg('Como você indicou que ainda não enviou o Comunicado LGPD, é obrigatório baixar, assinar e anexar o arquivo na Pergunta 24 antes de transmitir.');
      setCurrentStep(6);
      return;
    }

    const secCheck = validateSecurityState(security);
    if (!secCheck.valid) {
      setErrorMsg(secCheck.error || 'Falha na verificação anti-spam.');
      return;
    }

    const rateCheck = checkClientRateLimit('questionario_conformidade', 3, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      setErrorMsg(`Muitas submissões recentes. Aguarde ${rateCheck.retryAfterSeconds} segundos.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Coleta todos os anexos já enviados para a nuvem
      const allAttachmentsList: UploadedAttachment[] = [];
      Object.entries(formData.attachmentsMap).forEach(([fieldKey, list]) => {
        if (Array.isArray(list)) {
          list.forEach((att) => {
            allAttachmentsList.push({
              ...att,
              fieldKey,
            });
          });
        }
      });

      const generatedProtocol = generateProtocol('CONF');
      const ipHash = await getAnonymousIpHash();
      const finalScore = calculatePreliminaryScore();

      // Inserção direta sem .select() para respeitar estritamente o RLS de anon
      const { error } = await supabase.from('quiz_submissions').insert({
        quiz_id: 1,
        company_name: cleanCompany,
        cnpj: formData.cnpj,
        contact_name: cleanResp,
        contact_email: cleanEmail,
        protocol: generatedProtocol,
        final_score: finalScore,
        address_json: {
          rua: formData.enderecoRua,
          bairro: formData.enderecoBairro,
          cidade: formData.enderecoCidade,
          estado: formData.enderecoEstado,
          cep: formData.enderecoCep,
          telefone: formData.contatoTelefone,
        },
        answers_json: {
          ...formData,
          evidence_uploads: formData.attachmentsMap,
        },
        attachments_json: allAttachmentsList,
        ip_hash: ipHash,
        security_meta: {
          honeypot: security.honeypotWebsite || security.honeypotFax || '',
          challengeToken: security.challengeToken,
          elapsedMs: Date.now() - security.mountedAt,
        },
      });

      if (error) throw error;

      recordClientSubmission('questionario_conformidade');
      clearFormDraft('questionario_conformidade_v2');

      setSubmittedAttachments(allAttachmentsList);
      setProtocol(generatedProtocol);
      setScore(finalScore);
      setSecurity(createInitialSecurityState());
    } catch (err: any) {
      console.error('Erro ao enviar questionário:', err);
      setErrorMsg(err?.message || 'Erro ao salvar questionário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttachmentCount = (): number => {
    return Object.values(formData.attachmentsMap).reduce(
      (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
      0
    );
  };

  return (
    <div className="conformidade-page">
      <SEO
        title="Questionário de Conformidade LGPD para Fornecedores | Mascârello Haus"
        description="Avaliação de maturidade em privacidade, proteção de dados e segurança da informação para fornecedores e parceiros da Mascârello Haus Advocacia."
        canonical="https://mascarellohaus.adv.br/questionario-de-conformidade/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <span className="banner-badge">Compliance & Fornecedores</span>
          <h1 className="banner-title text-center">Questionário de Conformidade à LGPD</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '850px' }}>
            A Mascârello Haus preza pela segurança e privacidade em toda a sua cadeia de parceiros. Este questionário avalia os padrões de governança, segurança técnica e conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '980px' }}>
          {protocol ? (
            <div className="conf-success-card">
              <CheckCircle2 size={58} className="conf-success-icon" />
              <h2>Questionário de Conformidade Enviado com Sucesso!</h2>
              <p>
                Os dados, declarações e arquivos anexados da sua empresa foram registrados e encaminhados ao nosso Encarregado pelo Tratamento de Dados Pessoais (DPO).
              </p>

              {score !== null && (
                <div className="score-summary-box">
                  <div className="score-number">{score}%</div>
                  <div className="score-label">Índice Preliminar de Conformidade LGPD</div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.92rem', color: '#4b5563' }}>
                    {score >= 80
                      ? 'Nível Alto de Conformidade: Seus controles e políticas atendem às melhores práticas.'
                      : score >= 50
                      ? 'Nível Intermediário: Controles essenciais presentes, com recomendações de aprimoramento.'
                      : 'Nível que requer adequações: Entraremos em contato com orientações de governança.'}
                  </p>
                </div>
              )}

              <div className="protocol-box">
                <span className="protocol-label">Protocolo de Registro Oficial</span>
                <span className="protocol-value">{protocol}</span>
                <button type="button" onClick={handleCopyProtocol} className="copy-btn">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar Protocolo'}
                </button>
              </div>

              {submittedAttachments.length > 0 && (
                <div style={{ marginTop: '24px', textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Paperclip size={18} /> Documentos e Evidências Transmitidos ({submittedAttachments.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {submittedAttachments.map((att, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#1e293b' }}>
                          📄 {att.name}
                        </span>
                        <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}>
                          Visualizar <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setProtocol(null);
                    setScore(null);
                    setSubmittedAttachments([]);
                    setFormData(initialFormState);
                    setCurrentStep(1);
                  }}
                >
                  Novo Preenchimento
                </button>
              </div>
            </div>
          ) : (
            <div className="conf-main-wrapper">
              {/* Comunicado Inicial Download Banner (Original WPForms Field 82) */}
              <div className="comunicado-download-banner">
                <div className="banner-left">
                  <FileCheck size={28} className="icon-gold" />
                  <div>
                    <h4>Comunicado e Informações Iniciais à Proteção de Dados</h4>
                    <p>
                      Antes de responder o questionário, baixe o arquivo oficial a seguir, leia com atenção, assine e faça o upload do arquivo assinado (pode ser feita a assinatura digital ou física digitalizada).
                    </p>
                  </div>
                </div>
                <a
                  href="/wp-content/uploads/2023/10/Comunicado-e-informacoes-iniciais-a-protecao-de-dados.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-download-pdf"
                >
                  <Download size={16} /> Baixar Comunicado Oficial (PDF)
                </a>
              </div>

              {/* Progress & Step Navigation */}
              <div className="steps-header">
                <div className="mode-toggle-row">
                  <div className="step-progress-text">
                    Etapa {currentStep} de {SECTIONS.length}: <strong>{SECTIONS[currentStep - 1].title}</strong>
                    {getAttachmentCount() > 0 && (
                      <span className="badge-attachments">
                        <Paperclip size={13} /> {getAttachmentCount()} arquivo(s) anexado(s)
                      </span>
                    )}
                  </div>
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={handleManualSaveDraft}
                      className="btn-ghost"
                      title="Salvar rascunho no navegador"
                    >
                      <Save size={14} /> Salvar Rascunho
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode(viewMode === 'wizard' ? 'full' : 'wizard')}
                      className="btn-ghost"
                    >
                      {viewMode === 'wizard' ? 'Ver Todas as Etapas' : 'Modo em Etapas'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="btn-ghost text-danger"
                      title="Limpar formulário"
                    >
                      <Trash2 size={14} /> Limpar
                    </button>
                  </div>
                </div>

                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(currentStep / SECTIONS.length) * 100}%` }}
                  />
                </div>

                {draftSavedAlert && (
                  <div className="draft-alert-banner">
                    <CheckCircle2 size={16} /> Rascunho e arquivos anexados salvos com sucesso no navegador!
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="form-error-banner" style={{ margin: '20px 0' }}>
                  <AlertCircle size={20} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* ETAPA 1: Identificação da Empresa */}
                {(viewMode === 'full' || currentStep === 1) && (
                  <div className="section-block">
                    <h3 className="section-title">
                      <Building size={20} /> Etapa 1 — Identificação da Empresa Fornecedora
                    </h3>

                    {/* Original WPForms Field 83: Upload do Comunicado Assinado */}
                    <div className="card-sub-box">
                      <FileUploader
                        id="wpforms_2854_83"
                        label="Faça aqui o upload do arquivo assinado (Comunicado LGPD)"
                        description="Anexe o comunicado assinado (pode ser assinatura digital). Formatos: PDF, DOCX (até 20 MB)."
                        autoUpload={true}
                        folder="conformidade"
                        fieldKey="comunicado_assinado"
                        attachments={formData.attachmentsMap.comunicado_assinado || []}
                        onAttachmentsChange={(list) => handleUpdateAttachments('comunicado_assinado', list)}
                        maxFiles={1}
                        maxSizeMB={20}
                        allowedExtensions={['pdf', 'docx', 'doc']}
                        variant="light"
                        compact
                      />
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">CNPJ da Empresa <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nome da Empresa / Razão Social <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Razão Social completa"
                          value={formData.nomeEmpresa}
                          onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Logradouro / Rua e Número</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rua, Av., nº, sala"
                          value={formData.enderecoRua}
                          onChange={(e) => setFormData({ ...formData, enderecoRua: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bairro</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Bairro"
                          value={formData.enderecoBairro}
                          onChange={(e) => setFormData({ ...formData, enderecoBairro: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Cidade e Estado</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Cidade"
                            value={formData.enderecoCidade}
                            onChange={(e) => setFormData({ ...formData, enderecoCidade: e.target.value })}
                          />
                          <input
                            type="text"
                            className="form-control"
                            style={{ width: '70px', textTransform: 'uppercase' }}
                            placeholder="UF"
                            maxLength={2}
                            value={formData.enderecoEstado}
                            onChange={(e) => setFormData({ ...formData, enderecoEstado: e.target.value.toUpperCase() })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">CEP</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="00000-000"
                          value={formData.enderecoCep}
                          onChange={(e) => setFormData({ ...formData, enderecoCep: formatCEP(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Responsável ou Encarregado de Dados (DPO) <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nome completo do DPO ou responsável"
                          value={formData.responsavelNome}
                          onChange={(e) => setFormData({ ...formData, responsavelNome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">E-mail Corporativo de Contato <span className="required">*</span></label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="dpo@suaempresa.com.br"
                          value={formData.contatoEmail}
                          onChange={(e) => setFormData({ ...formData, contatoEmail: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Telefone / WhatsApp de Contato</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="(00) 00000-0000"
                        value={formData.contatoTelefone}
                        onChange={(e) => setFormData({ ...formData, contatoTelefone: formatPhone(e.target.value) })}
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 2: Governança, Contratos & Políticas (Q1 a Q5) */}
                {(viewMode === 'full' || currentStep === 2) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 2 — Governança, Contratos & Políticas</h3>

                    {/* Q1: Field 15, 6, 16 */}
                    <div className="question-box">
                      <label className="question-title">
                        1 – Sua empresa possui contrato formal com este controlador (contratante) e qual o período de vigência? (Se positivo, encaminhe a cópia) <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q1_contrato"
                              value={opt}
                              checked={formData.q1_contrato === opt}
                              onChange={(e) => setFormData({ ...formData, q1_contrato: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q1_contrato === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Comente sobre o contrato</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Comente sobre o contrato e período de vigência..."
                            value={formData.q1_comentario}
                            onChange={(e) => setFormData({ ...formData, q1_comentario: e.target.value })}
                          />

                          {/* Original Field 16 */}
                          <FileUploader
                            id="wpforms_2854_16"
                            label="Encaminhe a cópia do contrato"
                            description="Anexe a via contratual ou termo de adesão (PDF, DOC, DOCX, JPG, PNG — até 10 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q1_contrato"
                            attachments={formData.attachmentsMap.q1_contrato || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q1_contrato', list)}
                            maxFiles={1}
                            maxSizeMB={10}
                            allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'png']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>

                    {/* Q2: Field 18, 19, 20 */}
                    <div className="question-box">
                      <label className="question-title">
                        2 – Sua empresa possui política de privacidade e retenção de dados? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q2_politica"
                              value={opt}
                              checked={formData.q2_politica === opt}
                              onChange={(e) => setFormData({ ...formData, q2_politica: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <label className="form-label">Comente <span className="required">*</span></label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Comente detalhes da política de privacidade e retenção de dados..."
                          value={formData.q2_comentario}
                          onChange={(e) => setFormData({ ...formData, q2_comentario: e.target.value })}
                        />
                      </div>

                      {/* Original Field 20 */}
                      <FileUploader
                        id="wpforms_2854_20"
                        label="Evidências"
                        description="Encaminhe a política de privacidade ou documento comprobatório (PDF, DOCX, JPG, PNG — até 10 MB)."
                        autoUpload={true}
                        folder="conformidade"
                        fieldKey="q2_politica"
                        attachments={formData.attachmentsMap.q2_politica || []}
                        onAttachmentsChange={(list) => handleUpdateAttachments('q2_politica', list)}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q3: Field 22, 23 */}
                    <div className="question-box">
                      <label className="question-title">
                        3 – Sua empresa realiza treinamentos regulares sobre proteção de dados com seus funcionários ou terceiros prestadores? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q3_treinamentos"
                              value={opt}
                              checked={formData.q3_treinamentos === opt}
                              onChange={(e) => setFormData({ ...formData, q3_treinamentos: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <label className="form-label">Comente <span className="required">*</span></label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Descreva a frequência, temas abordados e formato dos treinamentos..."
                          value={formData.q3_comentario}
                          onChange={(e) => setFormData({ ...formData, q3_comentario: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Q4: Field 28 */}
                    <div className="question-box">
                      <label className="question-title">
                        4 – Quem é o Encarregado de Dados da empresa (DPO) e meio de contato? <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome do DPO, e-mail institucional e canal de atendimento"
                        value={formData.q4_dpo_contato}
                        onChange={(e) => setFormData({ ...formData, q4_dpo_contato: e.target.value })}
                      />
                    </div>

                    {/* Q5: Field 30, 31 */}
                    <div className="question-box">
                      <label className="question-title">
                        5 – Sua empresa realiza mapeamento de dados (Data Mapping) ou registro das operações de tratamento (RAT/ROPA)? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q5_mapping_ropa"
                              value={opt}
                              checked={formData.q5_mapping_ropa === opt}
                              onChange={(e) => setFormData({ ...formData, q5_mapping_ropa: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q5_mapping_ropa === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          {/* Original Field 31 */}
                          <FileUploader
                            id="wpforms_2854_31"
                            label="Evidências"
                            description="Encaminhe extrato ou comprovação do mapeamento / inventário de dados (até 10 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q5_mapping_ropa"
                            attachments={formData.attachmentsMap.q5_mapping_ropa || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q5_mapping_ropa', list)}
                            maxFiles={1}
                            maxSizeMB={10}
                            allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'png']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ETAPA 3: Coleta, Finalidades e Logs (Q6 a Q8) */}
                {(viewMode === 'full' || currentStep === 3) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 3 — Coleta de Dados, Finalidades e Logs</h3>

                    {/* Q6: Field 32, 34 */}
                    <div className="question-box">
                      <label className="question-title">
                        6 – Sua empresa coleta dados pessoais de colaboradores, fornecedores ou clientes do controlador (contratante)? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q6_coleta_dados"
                              value={opt}
                              checked={formData.q6_coleta_dados === opt}
                              onChange={(e) => setFormData({ ...formData, q6_coleta_dados: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q6_coleta_dados === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Quais espécies? <span className="required">*</span></label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Quais espécies de dados pessoais são coletadas (ex: cadastrais, financeiros, profissionais...)"
                            value={formData.q6_quais_especies}
                            onChange={(e) => setFormData({ ...formData, q6_quais_especies: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Q7: Field 36 */}
                    <div className="question-box">
                      <label className="question-title">
                        7- Os tratamentos a serem realizados servem a quais finalidades específicas e detalhadas?
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Descreva as bases legais e finalidades específicas do tratamento para execução dos serviços..."
                        value={formData.q7_finalidades}
                        onChange={(e) => setFormData({ ...formData, q7_finalidades: e.target.value })}
                      />
                    </div>

                    {/* Q8: Field 42, 38, 39, 40 */}
                    <div className="question-box">
                      <label className="question-title">
                        8- No que tange às evidências:
                      </label>
                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label className="form-label">a) Como se dá o armazenamento das opções dos usuários (registro de log)? <span className="required">*</span></label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Mecanismo de log, período de guarda e rastreabilidade..."
                          value={formData.q8_log_armazenamento}
                          onChange={(e) => setFormData({ ...formData, q8_log_armazenamento: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">b) Como se dá a coleta e gestão do consentimento (se houver)?</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Mecanismo de opt-in, revogação e registro de prova do consentimento..."
                          value={formData.q8_gestao_consentimento}
                          onChange={(e) => setFormData({ ...formData, q8_gestao_consentimento: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">c) Por meio de quais sistemas ou plataformas de serviço que utiliza?</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: ERP interno, CRM, Servidor em nuvem dedicado, etc."
                          value={formData.q8_sistemas_plataformas}
                          onChange={(e) => setFormData({ ...formData, q8_sistemas_plataformas: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ETAPA 4: Segurança Técnica, Cloud & Incidentes (Q9 a Q13) */}
                {(viewMode === 'full' || currentStep === 4) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 4 — Segurança Técnica, Cloud & Incidentes</h3>

                    {/* Q9: Field 45, 46 */}
                    <div className="question-box">
                      <label className="question-title">
                        9 – A empresa utiliza pseudoanonimização, anonimização e criptografia nas bases de dados envolvendo os tratamentos realizados acima ou possui aplicação interna que possibilite a utilização como medida de segurança? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q9_seguranca_cripto"
                              value={opt}
                              checked={formData.q9_seguranca_cripto === opt}
                              onChange={(e) => setFormData({ ...formData, q9_seguranca_cripto: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q9_seguranca_cripto === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          {/* Original Field 46 */}
                          <FileUploader
                            id="wpforms_2854_46"
                            label="Encaminhe a evidência"
                            description="Anexe relatório técnico, certificado SSL/TLS, comprovação de criptografia ou política de segurança (até 5 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q9_seguranca_cripto"
                            attachments={formData.attachmentsMap.q9_seguranca_cripto || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q9_seguranca_cripto', list)}
                            maxFiles={1}
                            maxSizeMB={5}
                            allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png', 'zip']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>

                    {/* Q10: Field 48, 49, 50 */}
                    <div className="question-box">
                      <label className="question-title">
                        10 – Caso utilizado armazenamento de dados em nuvem:
                      </label>
                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label className="form-label">a) Qual serviço utiliza? <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: AWS, Microsoft Azure, Google Cloud, Servidor Dedicado..."
                          value={formData.q10_nuvem_servico}
                          onChange={(e) => setFormData({ ...formData, q10_nuvem_servico: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">b) Os dados são transmitidos de forma a respeitar a legislação e eventualmente armazenados em países estrangeiros? Se sim, quais países?</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Armazenamento em Data Center no Brasil (SP) ou país estrangeiro específico..."
                          value={formData.q10_nuvem_transferencia_internacional}
                          onChange={(e) => setFormData({ ...formData, q10_nuvem_transferencia_internacional: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Q11: Field 52, 53 */}
                    <div className="question-box">
                      <label className="question-title">
                        11 – Sua empresa possui gestão de incidentes de dados? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q11_gestao_incidentes"
                              value={opt}
                              checked={formData.q11_gestao_incidentes === opt}
                              onChange={(e) => setFormData({ ...formData, q11_gestao_incidentes: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q11_gestao_incidentes === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          {/* Original Field 53 */}
                          <FileUploader
                            id="wpforms_2854_53"
                            label="Encaminhe a evidência"
                            description="Anexe política de resposta a incidentes ou fluxo de notificação à ANPD/Controlador (até 5 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q11_incidentes"
                            attachments={formData.attachmentsMap.q11_incidentes || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q11_incidentes', list)}
                            maxFiles={1}
                            maxSizeMB={5}
                            allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png', 'zip']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>

                    {/* Q12: Field 54, 56 */}
                    <div className="question-box">
                      <label className="question-title">
                        12 – Sua empresa possui plano de resposta à incidentes e de continuidade dos serviços contratados? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q12_plano_continuidade"
                              value={opt}
                              checked={formData.q12_plano_continuidade === opt}
                              onChange={(e) => setFormData({ ...formData, q12_plano_continuidade: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q12_plano_continuidade === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Qual é a contingência para o serviço contratado?</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Descreva o plano de contingência e recuperação em desastres..."
                            value={formData.q12_contingencia}
                            onChange={(e) => setFormData({ ...formData, q12_contingencia: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Q13: Field 58 */}
                    <div className="question-box">
                      <label className="question-title">
                        13 – Quais orientações a serem seguidas em caso de incidentes relacionados à prestação do serviço contratado (vazamento de dados pessoais, sequestro de dados e ou indisponibilidade dos serviços)? E, quem é o responsável por dar suporte nestes casos ao controlador (contratante)? <span className="required">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Descreva canais de plantão, prazos de alerta e responsável pelo suporte em emergências..."
                        value={formData.q13_orientacoes_incidentes}
                        onChange={(e) => setFormData({ ...formData, q13_orientacoes_incidentes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 5: Dados Sensíveis & Quarteirização (Q14 a Q18) */}
                {(viewMode === 'full' || currentStep === 5) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 5 — Dados Sensíveis & Gestão de Terceiros</h3>

                    {/* Q14: Field 59 */}
                    <div className="question-box">
                      <label className="question-title">
                        14 – Sua empresa trata dados sensíveis? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q14_dados_sensiveis"
                              value={opt}
                              checked={formData.q14_dados_sensiveis === opt}
                              onChange={(e) => setFormData({ ...formData, q14_dados_sensiveis: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Q15: Field 60, 61 */}
                    <div className="question-box">
                      <label className="question-title">
                        15 – Há um procedimento específico para o tratamento de dados sensíveis? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q15_procedimento_sensivel"
                              value={opt}
                              checked={formData.q15_procedimento_sensivel === opt}
                              onChange={(e) => setFormData({ ...formData, q15_procedimento_sensivel: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q15_procedimento_sensivel === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Qual?</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Descreva as salvaguardas adicionais para dados sensíveis..."
                            value={formData.q15_qual_procedimento}
                            onChange={(e) => setFormData({ ...formData, q15_qual_procedimento: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Q16: Field 63, 64 */}
                    <div className="question-box">
                      <label className="question-title">
                        16 – Caso sua empresa tenha acesso a dados pessoais de clientes ou colaboradores, há o compartilhamento desses dados para outra empresa? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q16_compartilhamento_terceiros"
                              value={opt}
                              checked={formData.q16_compartilhamento_terceiros === opt}
                              onChange={(e) => setFormData({ ...formData, q16_compartilhamento_terceiros: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q16_compartilhamento_terceiros === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Para qual empresa e por qual motivo há a transferência? <span className="required">*</span></label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Nome da empresa destinatária e justificativa legal..."
                            value={formData.q16_para_qual_empresa}
                            onChange={(e) => setFormData({ ...formData, q16_para_qual_empresa: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Q17 & Q18: Field 65, 66, 67 */}
                    <div className="question-box">
                      <label className="question-title">
                        17 – Existem outras empresas que realizam o tratamento de dados pessoais do controlador (contratante) por sua ordem para cumprimento do contrato (quarteirização)? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q17_quarteirizacao"
                              value={opt}
                              checked={formData.q17_quarteirizacao === opt}
                              onChange={(e) => setFormData({ ...formData, q17_quarteirizacao: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q17_quarteirizacao === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Realiza a gestão de terceiros fornecedores com foco na proteção de dados?</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Como homologa, avalia e fiscaliza a segurança dos subcontratados?"
                            value={formData.q18_gestao_terceiros}
                            onChange={(e) => setFormData({ ...formData, q18_gestao_terceiros: e.target.value })}
                          />

                          {/* Original Field 67 */}
                          <FileUploader
                            id="wpforms_2854_67"
                            label="Encaminhe a evidência"
                            description="Anexe termo de quarteirização, cláusulas contratuais de DPA ou política de fornecedores (até 5 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q18_terceiros"
                            attachments={formData.attachmentsMap.q18_terceiros || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q18_terceiros', list)}
                            maxFiles={1}
                            maxSizeMB={5}
                            allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png', 'zip']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ETAPA 6: Auditorias & Envio Final (Q19 a Q24) */}
                {(viewMode === 'full' || currentStep === 6) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 6 — Auditorias, Riscos, Apps & Termo Assinado</h3>

                    {/* Q19: Field 69, 70 */}
                    <div className="question-box">
                      <label className="question-title">
                        19 – A empresa prestadora de serviços já conta com o Inventário de dados (art. 37 da LGPD), RIPD (art. 38 da LGPD) e outros documentos que entende necessários a fim de atestar a conformidade junto aos seus clientes? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q19_inventario_ripd"
                              value={opt}
                              checked={formData.q19_inventario_ripd === opt}
                              onChange={(e) => setFormData({ ...formData, q19_inventario_ripd: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q19_inventario_ripd === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          {/* Original Field 70 */}
                          <FileUploader
                            id="wpforms_2854_70"
                            label="Encaminhe a evidência"
                            description="Anexe comprovante do Inventário de Dados ou Relatório de Impacto (RIPD) (até 5 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q19_inventario_ripd"
                            attachments={formData.attachmentsMap.q19_inventario_ripd || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q19_inventario_ripd', list)}
                            maxFiles={1}
                            maxSizeMB={5}
                            allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png', 'zip']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>

                    {/* Q20: Field 71, 72 */}
                    <div className="question-box">
                      <label className="question-title">
                        20 – Existem controles internos que testem regularmente a efetividade das medidas de segurança adotadas (testes de vulnerabilidades e pentest)? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q20_testes_pentest"
                              value={opt}
                              checked={formData.q20_testes_pentest === opt}
                              onChange={(e) => setFormData({ ...formData, q20_testes_pentest: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q20_testes_pentest === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          {/* Original Field 72 */}
                          <FileUploader
                            id="wpforms_2854_72"
                            label="Encaminhe a evidência"
                            description="Anexe sumário executivo de pentest, varredura de vulnerabilidades ou auditoria externa (até 5 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="q20_pentest"
                            attachments={formData.attachmentsMap.q20_pentest || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('q20_pentest', list)}
                            maxFiles={1}
                            maxSizeMB={5}
                            allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png', 'zip']}
                            variant="light"
                            compact
                          />
                        </div>
                      )}
                    </div>

                    {/* Q21: Field 74 */}
                    <div className="question-box">
                      <label className="question-title">
                        21 – Sua empresa transfere risco como medida de mitigação e possui seguro cyber ou responsabilidade civil contratado? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q21_seguro_cyber"
                              value={opt}
                              checked={formData.q21_seguro_cyber === opt}
                              onChange={(e) => setFormData({ ...formData, q21_seguro_cyber: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Q22: Field 75, 76 */}
                    <div className="question-box">
                      <label className="question-title">
                        22 – A prestação de serviço ou serviço contrato envolve aplicativos mobile? É disponibilizada política de privacidade em apartado? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q22_apps_mobile"
                              value={opt}
                              checked={formData.q22_apps_mobile === opt}
                              onChange={(e) => setFormData({ ...formData, q22_apps_mobile: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q22_apps_mobile === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Como se dá o fluxo de dados (da entrada ao descarte) dentro da aplicação?</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Ciclo de vida do dado coletado pelo app..."
                            value={formData.q22_fluxo_mobile}
                            onChange={(e) => setFormData({ ...formData, q22_fluxo_mobile: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Q23: Field 77, 78 */}
                    <div className="question-box">
                      <label className="question-title">
                        23 – A prestação de serviço ou serviço contrato também é disponibilizado por meio do site da empresa contratante? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="q23_site_web"
                              value={opt}
                              checked={formData.q23_site_web === opt}
                              onChange={(e) => setFormData({ ...formData, q23_site_web: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {formData.q23_site_web === 'Sim' && (
                        <div className="conditional-fade" style={{ marginTop: '14px' }}>
                          <label className="form-label">Como se dá o fluxo de dados pessoais (da entrada ao descarte) dentro da aplicação?</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Ciclo de vida dos dados na plataforma web..."
                            value={formData.q23_fluxo_web}
                            onChange={(e) => setFormData({ ...formData, q23_fluxo_web: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {/* Q24 / Final: Field 88, 86, 87 (Exact WPForms behavior) */}
                    <div className="question-box" style={{ background: '#fefce8', borderColor: '#fef08a' }}>
                      <label className="question-title" style={{ color: '#854d0e', fontSize: '1.05rem' }}>
                        Já baixou e enviou o Comunicado e Informações decorrentes da LGPD? <span className="required">*</span>
                      </label>
                      <div className="radio-group">
                        {['Sim', 'Não'].map((opt) => (
                          <label key={opt} className="radio-item">
                            <input
                              type="radio"
                              name="comunicado_assinado_confirm"
                              value={opt}
                              checked={formData.comunicado_assinado_confirm === opt}
                              onChange={(e) => setFormData({ ...formData, comunicado_assinado_confirm: e.target.value })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {/* Original Field 86 e 87: Condicional quando responde 'Não' */}
                      {formData.comunicado_assinado_confirm === 'Não' ? (
                        <div className="conditional-fade" style={{ marginTop: '16px', background: '#ffffff', padding: '18px', borderRadius: '8px', border: '1px solid #fde047' }}>
                          <p style={{ fontSize: '0.94rem', color: '#713f12', marginBottom: '12px', lineHeight: 1.6 }}>
                            <strong>Atenção:</strong> Baixe o arquivo a seguir, leia com atenção, assine e faça o upload do arquivo assinado (pode ser feita a assinatura digital ou física digitalizada).
                          </p>
                          <a
                            href="/wp-content/uploads/2023/10/Comunicado-e-informacoes-iniciais-a-protecao-de-dados.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
                          >
                            <Download size={15} /> Baixar Comunicado Oficial (PDF)
                          </a>

                          <FileUploader
                            id="wpforms_2854_87"
                            label="Faça aqui o upload do arquivo assinado *"
                            description="Anexe o comunicado devidamente assinado (PDF, DOCX ou DOC — até 20 MB)."
                            autoUpload={true}
                            folder="conformidade"
                            fieldKey="comunicado_final_assinado"
                            attachments={formData.attachmentsMap.comunicado_final_assinado || []}
                            onAttachmentsChange={(list) => handleUpdateAttachments('comunicado_final_assinado', list)}
                            maxFiles={1}
                            maxSizeMB={20}
                            allowedExtensions={['pdf', 'docx', 'doc']}
                            required={true}
                            variant="light"
                          />
                        </div>
                      ) : (
                        <div style={{ marginTop: '10px', fontSize: '0.88rem', color: '#15803d' }}>
                          ✓ Comunicado já assinado e confirmado. Caso queira anexar uma via adicional agora, utilize o campo abaixo:
                          <div style={{ marginTop: '8px' }}>
                            <FileUploader
                              id="wpforms_2854_87_opt"
                              label="Atualizar ou anexar documento assinado adicional (opcional)"
                              autoUpload={true}
                              folder="conformidade"
                              fieldKey="comunicado_final_assinado"
                              attachments={formData.attachmentsMap.comunicado_final_assinado || []}
                              onAttachmentsChange={(list) => handleUpdateAttachments('comunicado_final_assinado', list)}
                              maxFiles={1}
                              maxSizeMB={20}
                              allowedExtensions={['pdf', 'docx', 'doc']}
                              variant="light"
                              compact
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <SecurityShield security={security} onChange={setSecurity} variant="light" />

                    <div style={{ marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Transmitindo questionário e arquivos...' : (
                          <>
                            <ShieldCheck size={20} /> Finalizar e Transmitir Avaliação de Conformidade
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Wizard Navigation Footer */}
                {viewMode === 'wizard' && (
                  <div className="wizard-nav-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={currentStep === 1}
                      onClick={() => {
                        setCurrentStep((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                    >
                      <ChevronLeft size={18} /> Etapa Anterior
                    </button>

                    <div className="step-counter">
                      Etapa {currentStep} de {SECTIONS.length}
                    </div>

                    {currentStep < SECTIONS.length ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setCurrentStep((prev) => Math.min(SECTIONS.length, prev + 1));
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                      >
                        Próxima Etapa <ChevronRight size={18} />
                      </button>
                    ) : null}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .comunicado-download-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #0d3732;
          color: #ffffff;
          padding: 24px 28px;
          border-radius: 10px;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(13, 55, 50, 0.12);
          border-left: 5px solid var(--color-accent);
        }
        .banner-left {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .icon-gold {
          color: var(--color-accent);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .banner-left h4 {
          color: #ffffff;
          font-size: 1.15rem;
          margin-bottom: 6px;
        }
        .banner-left p {
          color: rgba(255,255,255,0.82);
          font-size: 0.92rem;
          line-height: 1.6;
          margin: 0;
        }
        .btn-download-pdf {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-accent);
          color: var(--color-primary);
          font-weight: 600;
          font-size: 0.92rem;
          padding: 12px 20px;
          border-radius: 6px;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: transform 0.2s, background 0.2s;
        }
        .btn-download-pdf:hover {
          background: #dfc294;
          transform: translateY(-2px);
        }
        .steps-header {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 24px;
          margin-bottom: 24px;
        }
        .mode-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }
        .step-progress-text {
          font-size: 1rem;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .badge-attachments {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.78rem;
          font-weight: 600;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-ghost:hover {
          background: #e2e8f0;
        }
        .btn-ghost.text-danger {
          color: #b91c1c;
        }
        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
          transition: width 0.3s ease;
        }
        .draft-alert-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0fdf4;
          color: #166534;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-top: 10px;
        }
        .section-block {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: var(--color-primary);
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(203, 171, 122, 0.4);
        }
        .question-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .question-title {
          display: block;
          font-weight: 600;
          font-size: 0.98rem;
          color: #1e293b;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .conditional-fade {
          animation: mhFadeIn 220ms ease-out forwards;
        }
        @keyframes mhFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .card-sub-box {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .wizard-nav-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 24px;
          margin-top: 24px;
        }
        .step-counter {
          font-weight: 600;
          color: var(--color-primary);
        }
        .conf-success-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 50px 36px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .conf-success-icon {
          color: #22c55e;
          margin-bottom: 16px;
        }
        .score-summary-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 24px;
          margin: 24px auto;
          max-width: 500px;
        }
        .score-number {
          font-size: 3rem;
          font-weight: 800;
          color: #16a34a;
        }
        .score-label {
          font-size: 1.1rem;
          font-weight: 700;
          color: #166534;
        }
        @media (max-width: 768px) {
          .comunicado-download-banner {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-download-pdf {
            text-align: center;
            justify-content: center;
          }
          .grid-2, .grid-3 {
            grid-template-columns: 1fr;
          }
          .section-block {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default QuestionarioConformidade;
