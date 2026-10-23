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
  Sparkles,
  HelpCircle,
  Save,
  Trash2,
} from 'lucide-react';
import FileUploader from '../components/FileUploader';
import SecurityShield, { createInitialSecurityState } from '../components/SecurityShield';
import { supabase } from '../lib/supabase';
import {
  formatCNPJ,
  formatCEP,
  formatPhone,
  isValidEmail,
  isValidCNPJ,
  sanitizeText,
  sanitizeEmail,
  generateProtocol,
  getAnonymousIpHash,
  checkClientRateLimit,
  recordClientSubmission,
  validateSecurityState,
  uploadFormFiles,
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
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
    const saved = loadFormDraft<FormDataState>('questionario_conformidade');
    return saved || initialFormState;
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'full'>('wizard');

  // File attachments state per question
  const [fileSignedDoc, setFileSignedDoc] = useState<File[]>([]);
  const [fileContract, setFileContract] = useState<File[]>([]);
  const [filePrivacyPolicy, setFilePrivacyPolicy] = useState<File[]>([]);
  const [fileDataMapping, setFileDataMapping] = useState<File[]>([]);
  const [fileCryptoSecurity, setFileCryptoSecurity] = useState<File[]>([]);
  const [fileIncidentManagement, setFileIncidentManagement] = useState<File[]>([]);
  const [fileThirdPartyManagement, setFileThirdPartyManagement] = useState<File[]>([]);
  const [fileInventoryRipd, setFileInventoryRipd] = useState<File[]>([]);
  const [filePentestSec, setFilePentestSec] = useState<File[]>([]);

  const [security, setSecurity] = useState(createInitialSecurityState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  // Auto-save draft on changes
  useEffect(() => {
    saveFormDraft('questionario_conformidade', formData);
  }, [formData]);

  const handleManualSaveDraft = () => {
    saveFormDraft('questionario_conformidade', formData);
    setDraftSavedAlert(true);
    setTimeout(() => setDraftSavedAlert(false), 2500);
  };

  const handleClearDraft = () => {
    if (window.confirm('Tem certeza que deseja limpar o rascunho salvo deste formulário?')) {
      clearFormDraft('questionario_conformidade');
      setFormData(initialFormState);
      setCurrentStep(1);
    }
  };

  const calculatePreliminaryScore = (): number => {
    let positive = 0;
    let totalScored = 13;
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
    if (formData.comunicado_assinado_confirm === 'Sim') positive++;

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
      // Upload all collected evidence files
      const uploadTasks: Promise<any>[] = [];
      const uploadedMap: Record<string, any[]> = {};

      if (fileSignedDoc.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileSignedDoc, 'conformidade', 'comunicado_assinado').then((res) => {
            uploadedMap.comunicado_assinado = res;
          })
        );
      }
      if (fileContract.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileContract, 'conformidade', 'q1_contrato').then((res) => {
            uploadedMap.q1_contrato = res;
          })
        );
      }
      if (filePrivacyPolicy.length > 0) {
        uploadTasks.push(
          uploadFormFiles(filePrivacyPolicy, 'conformidade', 'q2_politica').then((res) => {
            uploadedMap.q2_politica = res;
          })
        );
      }
      if (fileDataMapping.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileDataMapping, 'conformidade', 'q5_mapping_ropa').then((res) => {
            uploadedMap.q5_mapping_ropa = res;
          })
        );
      }
      if (fileCryptoSecurity.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileCryptoSecurity, 'conformidade', 'q9_seguranca_cripto').then((res) => {
            uploadedMap.q9_seguranca_cripto = res;
          })
        );
      }
      if (fileIncidentManagement.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileIncidentManagement, 'conformidade', 'q11_incidentes').then((res) => {
            uploadedMap.q11_incidentes = res;
          })
        );
      }
      if (fileThirdPartyManagement.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileThirdPartyManagement, 'conformidade', 'q18_terceiros').then((res) => {
            uploadedMap.q18_terceiros = res;
          })
        );
      }
      if (fileInventoryRipd.length > 0) {
        uploadTasks.push(
          uploadFormFiles(fileInventoryRipd, 'conformidade', 'q19_inventario_ripd').then((res) => {
            uploadedMap.q19_inventario_ripd = res;
          })
        );
      }
      if (filePentestSec.length > 0) {
        uploadTasks.push(
          uploadFormFiles(filePentestSec, 'conformidade', 'q20_pentest').then((res) => {
            uploadedMap.q20_pentest = res;
          })
        );
      }

      await Promise.all(uploadTasks);

      const allUploadedList = Object.values(uploadedMap).flat();
      const generatedProtocol = generateProtocol('CONF');
      const ipHash = await getAnonymousIpHash();
      const finalScore = calculatePreliminaryScore();

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
          evidence_uploads: uploadedMap,
        },
        attachments_json: allUploadedList,
        ip_hash: ipHash,
        security_meta: {
          honeypot: security.honeypotWebsite || security.honeypotFax || '',
          challengeToken: security.challengeToken,
          elapsedMs: Date.now() - security.mountedAt,
        },
      });

      if (error) throw error;

      recordClientSubmission('questionario_conformidade');
      clearFormDraft('questionario_conformidade');

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
                Os dados e evidências da sua empresa foram registrados e encaminhados ao nosso Encarregado pelo Tratamento de Dados Pessoais (DPO).
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

              <div style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setProtocol(null);
                    setScore(null);
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
              {/* Comunicado Inicial Download Banner */}
              <div className="comunicado-download-banner">
                <div className="banner-left">
                  <FileCheck size={28} className="icon-gold" />
                  <div>
                    <h4>1. Comunicado e Informações Iniciais à Proteção de Dados</h4>
                    <p>
                      Antes de responder ao questionário, baixe o comunicado oficial, leia atentamente, assine digitalmente ou fisicamente e anexe o comprovante.
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
                      <Trash2 size={14} />
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
                    <CheckCircle2 size={16} /> Rascunho salvo com sucesso no navegador!
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
                {/* ETAPA 1: Identificação */}
                {(viewMode === 'full' || currentStep === 1) && (
                  <div className="section-block">
                    <h3 className="section-title">
                      <Building size={20} /> Etapa 1 — Identificação da Empresa Fornecedora
                    </h3>

                    {/* Upload do Comunicado Assinado Inicial */}
                    <div className="card-sub-box">
                      <FileUploader
                        id="comunicado-assinado-upload"
                        label="Faça aqui o upload do arquivo assinado (Comunicado LGPD)"
                        description="Anexe o comunicado baixado acima devidamente assinado (aceita PDF ou DOCX de até 20MB)."
                        files={fileSignedDoc}
                        onChange={setFileSignedDoc}
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
                  </div>
                )}

                {/* ETAPA 2: Governança & Contratos (Q1 a Q5) */}
                {(viewMode === 'full' || currentStep === 2) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 2 — Governança, Contratos & Políticas</h3>

                    {/* Q1 */}
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Comente sobre o contrato e vigência..."
                        value={formData.q1_comentario}
                        onChange={(e) => setFormData({ ...formData, q1_comentario: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                      <FileUploader
                        id="q1-contrato-upload"
                        label="Encaminhe a cópia do contrato"
                        files={fileContract}
                        onChange={setFileContract}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q2 */}
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Comente detalhes da política de privacidade..."
                        value={formData.q2_comentario}
                        onChange={(e) => setFormData({ ...formData, q2_comentario: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                      <FileUploader
                        id="q2-politica-upload"
                        label="Evidências da política de privacidade"
                        files={filePrivacyPolicy}
                        onChange={setFilePrivacyPolicy}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q3 */}
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Descreva a frequência e formato dos treinamentos..."
                        value={formData.q3_comentario}
                        onChange={(e) => setFormData({ ...formData, q3_comentario: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                    </div>

                    {/* Q4 */}
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

                    {/* Q5 */}
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
                      <FileUploader
                        id="q5-mapping-upload"
                        label="Evidências do mapeamento / inventário"
                        files={fileDataMapping}
                        onChange={setFileDataMapping}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'doc', 'docx', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 3: Tratamento de Dados (Q6 a Q8) */}
                {(viewMode === 'full' || currentStep === 3) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 3 — Coleta, Finalidades e Registro de Logs</h3>

                    {/* Q6 */}
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Quais espécies de dados pessoais são coletadas?"
                        value={formData.q6_quais_especies}
                        onChange={(e) => setFormData({ ...formData, q6_quais_especies: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                    </div>

                    {/* Q7 */}
                    <div className="question-box">
                      <label className="question-title">
                        7 – Os tratamentos a serem realizados servem a quais finalidades específicas e detalhadas?
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Descreva as bases legais e finalidades específicas do tratamento..."
                        value={formData.q7_finalidades}
                        onChange={(e) => setFormData({ ...formData, q7_finalidades: e.target.value })}
                      />
                    </div>

                    {/* Q8 */}
                    <div className="question-box">
                      <label className="question-title">
                        8 – No que tange às evidências técnicas de registro:
                      </label>
                      <div className="form-group" style={{ marginTop: '8px' }}>
                        <label className="form-label">a) Como se dá o armazenamento das opções dos usuários (registro de log)? <span className="required">*</span></label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.q8_log_armazenamento}
                          onChange={(e) => setFormData({ ...formData, q8_log_armazenamento: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">b) Como se dá a coleta e gestão do consentimento (se houver)?</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={formData.q8_gestao_consentimento}
                          onChange={(e) => setFormData({ ...formData, q8_gestao_consentimento: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">c) Por meio de quais sistemas ou plataformas de serviço que utiliza?</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: ERP interno, CRM, Servidor dedicado, etc."
                          value={formData.q8_sistemas_plataformas}
                          onChange={(e) => setFormData({ ...formData, q8_sistemas_plataformas: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ETAPA 4: Segurança & Incidentes (Q9 a Q13) */}
                {(viewMode === 'full' || currentStep === 4) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 4 — Segurança Técnica, Cloud & Incidentes</h3>

                    {/* Q9 */}
                    <div className="question-box">
                      <label className="question-title">
                        9 – A empresa utiliza pseudoanonimização, anonimização e criptografia nas bases de dados ou possui aplicação com essa medida de segurança? <span className="required">*</span>
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
                      <FileUploader
                        id="q9-cripto-upload"
                        label="Encaminhe a evidência de segurança"
                        files={fileCryptoSecurity}
                        onChange={setFileCryptoSecurity}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q10 */}
                    <div className="question-box">
                      <label className="question-title">
                        10 – Caso utilize armazenamento de dados em nuvem:
                      </label>
                      <div className="form-group" style={{ marginTop: '8px' }}>
                        <label className="form-label">a) Qual serviço ou provedor de nuvem utiliza? <span className="required">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: AWS, Microsoft Azure, Google Cloud, Servidor Local..."
                          value={formData.q10_nuvem_servico}
                          onChange={(e) => setFormData({ ...formData, q10_nuvem_servico: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">b) Os dados são eventualmente armazenados em países estrangeiros? Se sim, quais?</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Brasil (São Paulo), EUA, União Europeia..."
                          value={formData.q10_nuvem_transferencia_internacional}
                          onChange={(e) => setFormData({ ...formData, q10_nuvem_transferencia_internacional: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Q11 */}
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
                      <FileUploader
                        id="q11-incidentes-upload"
                        label="Encaminhe a evidência (Política de Incidentes)"
                        files={fileIncidentManagement}
                        onChange={setFileIncidentManagement}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q12 */}
                    <div className="question-box">
                      <label className="question-title">
                        12 – Sua empresa possui plano de resposta a incidentes e continuidade dos serviços contratados? <span className="required">*</span>
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Qual é a contingência prevista para o serviço contratado?"
                        value={formData.q12_contingencia}
                        onChange={(e) => setFormData({ ...formData, q12_contingencia: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                    </div>

                    {/* Q13 */}
                    <div className="question-box">
                      <label className="question-title">
                        13 – Quais orientações a serem seguidas em caso de incidentes (vazamento, sequestro ou indisponibilidade)? Quem é o responsável pelo suporte? <span className="required">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Descreva o canal de contato de emergência e prazos de notificação em caso de incidentes..."
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

                    {/* Q14 & Q15 */}
                    <div className="grid-2">
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

                      <div className="question-box">
                        <label className="question-title">
                          15 – Há procedimento específico para o tratamento de dados sensíveis? <span className="required">*</span>
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
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Qual procedimento?"
                          value={formData.q15_qual_procedimento}
                          onChange={(e) => setFormData({ ...formData, q15_qual_procedimento: e.target.value })}
                          style={{ marginTop: '10px' }}
                        />
                      </div>
                    </div>

                    {/* Q16 */}
                    <div className="question-box">
                      <label className="question-title">
                        16 – Há compartilhamento de dados pessoais para outra empresa? <span className="required">*</span>
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Para qual empresa e por qual motivo há a transferência?"
                        value={formData.q16_para_qual_empresa}
                        onChange={(e) => setFormData({ ...formData, q16_para_qual_empresa: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                    </div>

                    {/* Q17 & Q18 */}
                    <div className="question-box">
                      <label className="question-title">
                        17 e 18 – Quarteirização e Gestão de Terceiros Fornecedores <span className="required">*</span>
                      </label>
                      <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0 10px' }}>
                        Existem outras empresas que realizam o tratamento por sua ordem (quarteirização)? Realiza gestão de terceiros com foco em LGPD?
                      </p>
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
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Como realiza a homologação e gestão de segurança dos seus fornecedores?"
                        value={formData.q18_gestao_terceiros}
                        onChange={(e) => setFormData({ ...formData, q18_gestao_terceiros: e.target.value })}
                        style={{ marginTop: '10px' }}
                      />
                      <FileUploader
                        id="q18-terceiros-upload"
                        label="Encaminhe a evidência de gestão de terceiros"
                        files={fileThirdPartyManagement}
                        onChange={setFileThirdPartyManagement}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 6: Auditorias & Envio Final (Q19 a Q23) */}
                {(viewMode === 'full' || currentStep === 6) && (
                  <div className="section-block">
                    <h3 className="section-title">Etapa 6 — Auditorias, Seguro Cyber, Apps & Conclusão</h3>

                    {/* Q19 */}
                    <div className="question-box">
                      <label className="question-title">
                        19 – A empresa prestadora de serviços já conta com Inventário de Dados (art. 37 LGPD) e RIPD (art. 38 LGPD)? <span className="required">*</span>
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
                      <FileUploader
                        id="q19-ripd-upload"
                        label="Encaminhe a evidência"
                        files={fileInventoryRipd}
                        onChange={setFileInventoryRipd}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q20 */}
                    <div className="question-box">
                      <label className="question-title">
                        20 – Existem controles internos que testem regularmente a efetividade das medidas de segurança (vulnerabilidades e pentest)? <span className="required">*</span>
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
                      <FileUploader
                        id="q20-pentest-upload"
                        label="Encaminhe a evidência do pentest / scan"
                        files={filePentestSec}
                        onChange={setFilePentestSec}
                        maxFiles={1}
                        maxSizeMB={10}
                        allowedExtensions={['pdf', 'docx', 'doc', 'jpg', 'png']}
                        variant="light"
                        compact
                      />
                    </div>

                    {/* Q21 */}
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

                    {/* Q22 & Q23 */}
                    <div className="grid-2">
                      <div className="question-box">
                        <label className="question-title">
                          22 – A prestação de serviço envolve aplicativos mobile? <span className="required">*</span>
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
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Como se dá o fluxo de dados na aplicação?"
                          value={formData.q22_fluxo_mobile}
                          onChange={(e) => setFormData({ ...formData, q22_fluxo_mobile: e.target.value })}
                          style={{ marginTop: '10px' }}
                        />
                      </div>

                      <div className="question-box">
                        <label className="question-title">
                          23 – A prestação de serviço é disponibilizada por meio de site web? <span className="required">*</span>
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
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Como se dá o fluxo de dados na aplicação web?"
                          value={formData.q23_fluxo_web}
                          onChange={(e) => setFormData({ ...formData, q23_fluxo_web: e.target.value })}
                          style={{ marginTop: '10px' }}
                        />
                      </div>
                    </div>

                    {/* Confirmação Final do Comunicado */}
                    <div className="question-box" style={{ background: '#fefce8', borderColor: '#fef08a' }}>
                      <label className="question-title" style={{ color: '#854d0e' }}>
                        Já baixou e enviou o Comunicado e Informações decorrentes da LGPD assinado? <span className="required">*</span>
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
                    </div>

                    <SecurityShield security={security} onChange={setSecurity} variant="light" />

                    <div style={{ marginTop: '24px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Validando e enviando questionário...' : (
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
                      {currentStep} / {SECTIONS.length}
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
