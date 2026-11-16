import React, { useState } from 'react';
import {
  Database,
  ShieldAlert,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  RefreshCw,
  FileText,
  Scale,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import {
  DEFAULT_LGPD_GOVERNANCE_CONFIG,
  DataProcessorItem,
  LgpdGovernanceConfig,
  LiaRecordItem,
  RipdRecordItem,
  RopaRecordItem,
  SecurityIncidentItem,
} from '../../../lib/lgpdConfig';
import {
  ConsentRecord,
  ContactMessageRecord,
  exportToCsv,
  formatDateBR,
  formatFriendlyError,
} from '../types';
import { FieldHelp } from './FieldHelp';

interface GovernanceAndRopaTabProps {
  config: LgpdGovernanceConfig;
  messages?: ContactMessageRecord[];
  consentRecords?: ConsentRecord[];
  currentUserId?: string;
  onChange: (next: LgpdGovernanceConfig) => void;
  onShowToast: (type: 'success' | 'error', message: string) => void;
  onRefresh?: () => Promise<void>;
  onAudit: (action: string, tableName: string, recordId: string, oldData?: any, newData?: any) => Promise<void>;
}

const SEVERITY_META: Record<SecurityIncidentItem['severity'], { label: string; tone: string }> = {
  baixa: { label: 'Baixa', tone: 'info' },
  media: { label: 'Média', tone: 'warning' },
  alta: { label: 'Alta', tone: 'danger' },
  critica: { label: 'Crítica', tone: 'danger' },
};

const INCIDENT_STATUS_META: Record<SecurityIncidentItem['status'], { label: string; tone: string }> = {
  investigando: { label: 'Em Investigação', tone: 'warning' },
  contido: { label: 'Contido', tone: 'info' },
  notificado_anpd: { label: 'ANPD Notificada', tone: 'purple' },
  encerrado: { label: 'Encerrado', tone: 'success' },
};

const TRANSFER_MECHANISM_LABELS: Record<DataProcessorItem['transferMechanism'], string> = {
  nacional: 'Tratamento Nacional (Brasil)',
  clausulas_padrao_anpd: 'Cláusulas-Padrão Contratuais (Res. ANPD nº 19/2024)',
  pais_adequado: 'País com Nível Adequado Reconhecido (Art. 33, I)',
  consentimento_especifico: 'Consentimento Específico e Destacado (Art. 33, VIII)',
  execucao_contrato: 'Necessário para Execução de Contrato (Art. 33, IX)',
};

export const GovernanceAndRopaTab: React.FC<GovernanceAndRopaTabProps> = ({
  config,
  messages = [],
  consentRecords = [],
  currentUserId,
  onChange,
  onShowToast,
  onRefresh,
  onAudit,
}) => {
  const [subTab, setSubTab] = useState<'ropa' | 'ripd_lia' | 'processors' | 'retention' | 'incidents' | 'dpo'>('ropa');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(false);

  const ripdList = config.ripdRecords || DEFAULT_LGPD_GOVERNANCE_CONFIG.ripdRecords;
  const liaList = config.liaRecords || DEFAULT_LGPD_GOVERNANCE_CONFIG.liaRecords;
  const processorsList = config.processors || DEFAULT_LGPD_GOVERNANCE_CONFIG.processors;

  // Modals state
  const [editingRopa, setEditingRopa] = useState<RopaRecordItem | null>(null);
  const [isNewRopa, setIsNewRopa] = useState(false);

  const [editingRipd, setEditingRipd] = useState<RipdRecordItem | null>(null);
  const [isNewRipd, setIsNewRipd] = useState(false);

  const [editingLia, setEditingLia] = useState<LiaRecordItem | null>(null);
  const [isNewLia, setIsNewLia] = useState(false);

  const [editingProcessor, setEditingProcessor] = useState<DataProcessorItem | null>(null);
  const [isNewProcessor, setIsNewProcessor] = useState(false);

  const [editingIncident, setEditingIncident] = useState<SecurityIncidentItem | null>(null);
  const [isNewIncident, setIsNewIncident] = useState(false);

  const persistGovernance = async (nextConfig: LgpdGovernanceConfig, successMessage: string) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'lgpd_governance',
        value_json: nextConfig,
        updated_by: currentUserId || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await onAudit('UPDATE', 'site_settings', 'lgpd_governance', null, {
        dpoEmail: nextConfig.dpoEmail,
        substituteDpoEmail: nextConfig.substituteDpoEmail,
        ropaCount: nextConfig.ropaRecords.length,
        ripdCount: (nextConfig.ripdRecords || []).length,
        processorsCount: (nextConfig.processors || []).length,
        incidentsCount: nextConfig.incidents.length,
      });
      onChange(nextConfig);
      onShowToast('success', successMessage);
    } catch (err) {
      onShowToast('error', formatFriendlyError(err, 'Não foi possível salvar os dados de governança LGPD.'));
    } finally {
      setSaving(false);
    }
  };

  // ROPA Handlers
  const handleSaveRopa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRopa) return;
    if (!editingRopa.processName.trim() || !editingRopa.purpose.trim()) {
      onShowToast('error', 'Informe o nome do processo e a finalidade.');
      return;
    }
    const nextRecords = isNewRopa
      ? [{ ...editingRopa, id: `ropa-${Date.now()}` }, ...config.ropaRecords]
      : config.ropaRecords.map((r) => (r.id === editingRopa.id ? editingRopa : r));

    setEditingRopa(null);
    setIsNewRopa(false);
    await persistGovernance({ ...config, ropaRecords: nextRecords }, 'Mapeamento ROPA atualizado com sucesso!');
  };

  const handleDeleteRopa = async (id: string) => {
    const nextRecords = config.ropaRecords.filter((r) => r.id !== id);
    await persistGovernance({ ...config, ropaRecords: nextRecords }, 'Atividade removida do mapeamento ROPA.');
  };

  // RIPD Handlers (Art. 38)
  const handleSaveRipd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRipd) return;
    if (!editingRipd.title.trim()) {
      onShowToast('error', 'Informe o título do Relatório de Impacto (RIPD).');
      return;
    }
    const updatedRipd = { ...editingRipd, updatedAt: new Date().toISOString().slice(0, 10) };
    const nextRipds = isNewRipd
      ? [{ ...updatedRipd, id: `ripd-${Date.now()}` }, ...ripdList]
      : ripdList.map((r) => (r.id === updatedRipd.id ? updatedRipd : r));

    setEditingRipd(null);
    setIsNewRipd(false);
    await persistGovernance({ ...config, ripdRecords: nextRipds }, 'Relatório de Impacto (RIPD — Art. 38) salvo com sucesso!');
  };

  const handleDeleteRipd = async (id: string) => {
    const nextRipds = ripdList.filter((r) => r.id !== id);
    await persistGovernance({ ...config, ripdRecords: nextRipds }, 'Relatório RIPD removido.');
  };

  // LIA Handlers (Art. 10, § 3º)
  const handleSaveLia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLia) return;
    if (!editingLia.processName.trim()) {
      onShowToast('error', 'Informe o processo avaliado no Teste de Legítimo Interesse (LIA).');
      return;
    }
    const nextLias = isNewLia
      ? [{ ...editingLia, id: `lia-${Date.now()}` }, ...liaList]
      : liaList.map((l) => (l.id === editingLia.id ? editingLia : l));

    setEditingLia(null);
    setIsNewLia(false);
    await persistGovernance({ ...config, liaRecords: nextLias }, 'Avaliação de Legítimo Interesse (LIA — Art. 10) salva!');
  };

  const handleDeleteLia = async (id: string) => {
    const nextLias = liaList.filter((l) => l.id !== id);
    await persistGovernance({ ...config, liaRecords: nextLias }, 'Registro LIA removido.');
  };

  // Processors & International Transfer Handlers (Arts. 33-36 & 39)
  const handleSaveProcessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProcessor) return;
    if (!editingProcessor.name.trim()) {
      onShowToast('error', 'Informe o nome do operador ou suboperador de dados.');
      return;
    }
    const nextProcs = isNewProcessor
      ? [{ ...editingProcessor, id: `proc-${Date.now()}` }, ...processorsList]
      : processorsList.map((p) => (p.id === editingProcessor.id ? editingProcessor : p));

    setEditingProcessor(null);
    setIsNewProcessor(false);
    await persistGovernance({ ...config, processors: nextProcs }, 'Cadastro de Operador / Transferência Internacional salvo!');
  };

  const handleDeleteProcessor = async (id: string) => {
    const nextProcs = processorsList.filter((p) => p.id !== id);
    await persistGovernance({ ...config, processors: nextProcs }, 'Operador removido.');
  };

  // Incidents Handlers (Art. 48 & Res. CD/ANPD nº 15/2024)
  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;
    if (!editingIncident.title.trim()) {
      onShowToast('error', 'Informe o título/descrição resumida do incidente.');
      return;
    }
    const nextIncidents = isNewIncident
      ? [{ ...editingIncident, id: `inc-${Date.now()}` }, ...config.incidents]
      : config.incidents.map((i) => (i.id === editingIncident.id ? editingIncident : i));

    setEditingIncident(null);
    setIsNewIncident(false);
    await persistGovernance({ ...config, incidents: nextIncidents }, 'Registro de incidente salvo com sucesso!');
  };

  const handleDeleteIncident = async (id: string) => {
    const nextIncidents = config.incidents.filter((i) => i.id !== id);
    await persistGovernance({ ...config, incidents: nextIncidents }, 'Registro de incidente removido.');
  };

  const handleGenerateAnpdIncidentDraft = (inc: SecurityIncidentItem) => {
    const draft = `COMUNICAÇÃO PRELIMINAR/COMPLETA DE INCIDENTE DE SEGURANÇA (Art. 48 da Lei nº 13.709/2018 e Resolução CD/ANPD nº 15/2024)
---------------------------------------------------------------------------------
1. Controlador: Mascârello Haus Advocacia e Consultoria
2. Encarregada pelo Tratamento de Dados (DPO): ${config.dpoName} (${config.dpoEmail} | ${config.dpoPhone})
3. Encarregado Substituto: ${config.substituteDpoName || '-'} (${config.substituteDpoEmail || '-'})
4. Identificação do Incidente: ${inc.title}
5. Data da Detecção: ${inc.detectedAt} | Data da Ciência: ${inc.knowledgeAt || inc.detectedAt}
6. Prazo Legal de Comunicação (Res. ANPD nº 15/2024): 3 (três) dias úteis
7. Dimensões Afetadas (CID): ${(inc.cidDimensions || ['Confidencialidade']).join(', ')}
8. Natureza e Categoria dos Dados Pessoais Afetados: ${inc.affectedData || 'Em apuração'}
9. Número Estimado de Titulares Afetados: ${inc.estimatedSubjects}
10. Medidas Técnicas e de Segurança Utilizadas (Art. 48, § 1º, III): Criptografia TLS 1.3 / AES-256, RLS, anonimização de IP por hash SHA-256 e controle de acesso MFA/2FA.
11. Medidas de Contenção e Mitigação Adotadas (Art. 48, § 1º, VI): ${inc.containmentActions || 'Isolamento imediato, rotação de credenciais e auditoria forense.'}
12. Justificativa de Prazo (se aplicável — Art. 48, § 1º, V): ${inc.delayJustification || 'Comunicação realizada tempestivamente dentro do prazo regulamentar de 3 dias úteis.'}
---------------------------------------------------------------------------------`;

    const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comunicado-anpd-art48-${inc.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('success', 'Minuta oficial de comunicação à ANPD e aos Titulares (Res. 15/2024) gerada!');
  };

  const handleSaveDpoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistGovernance(config, 'Configurações de Governança, DPO Titular e Substituto atualizadas!');
  };

  // Retention & Purge calculations (Arts. 15 e 16 da LGPD)
  const retentionMonthsContact = Math.max(1, Number(config.retentionContactMonths) || 24);
  const retentionMonthsLogs = Math.max(12, Number(config.retentionLogsMonths) || 60);

  const contactCutoffMs = Date.now() - retentionMonthsContact * 30 * 24 * 60 * 60 * 1000;
  const logsCutoffMs = Date.now() - retentionMonthsLogs * 30 * 24 * 60 * 60 * 1000;

  const expiredMessages = messages.filter(
    (m) =>
      new Date(m.created_at).getTime() < contactCutoffMs &&
      m.name !== '[ANONIMIZADO ART. 16 LGPD]' &&
      m.name !== '[ANONIMIZADO ART. 18 LGPD]'
  );

  const expiredConsents = consentRecords.filter(
    (c) => new Date(c.created_at).getTime() < logsCutoffMs
  );

  const handleExecuteRetentionPurge = async () => {
    if (expiredMessages.length === 0 && expiredConsents.length === 0) {
      onShowToast('success', 'Nenhum registro ultrapassou o prazo legal de retenção configurado.');
      return;
    }
    const ok = window.confirm(
      `Confirma a execução da Política de Término de Tratamento e Descarte Seguro (Arts. 15 e 16 da LGPD)?\n\n• Mensagens vencidas a anonimizar: ${expiredMessages.length}\n• Logs de consentimento vencidos a expurgar: ${expiredConsents.length}`
    );
    if (!ok) return;

    setPurging(true);
    try {
      for (const msg of expiredMessages) {
        await supabase
          .from('contact_messages')
          .update({
            name: '[ANONIMIZADO ART. 16 LGPD]',
            email: 'expurgado@lgpd.local',
            phone: '0000000000',
            message: '[Ciclo de retenção encerrado nos termos dos Arts. 15 e 16 da LGPD]',
            attachments_json: [],
          })
          .eq('id', msg.id);
      }

      for (const c of expiredConsents) {
        await supabase.from('consent_records').delete().eq('id', c.id);
      }

      await onAudit('RETENTION_PURGE', 'governance_lifecycle', 'arts_15_16', null, {
        expiredMessagesAnonymized: expiredMessages.length,
        expiredConsentsDeleted: expiredConsents.length,
      });

      onShowToast('success', 'Expurgo e anonimização de término de tratamento (Arts. 15 e 16) concluídos!');
      await onRefresh?.();
    } catch (err) {
      onShowToast('error', formatFriendlyError(err, 'Erro ao executar rotina de retenção/expurgo.'));
    } finally {
      setPurging(false);
    }
  };

  const filteredRopa = config.ropaRecords.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.processName.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.legalBasis.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q)
    );
  });

  const openIncidentsCount = config.incidents.filter((i) => i.status !== 'encerrado').length;

  return (
    <div className="tab-module-container">
      <div className="module-toolbar">
        <div className="subtab-pills" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'ropa' ? 'active' : ''}`}
            onClick={() => setSubTab('ropa')}
          >
            <Database size={14} /> ROPA Art. 37 ({config.ropaRecords.length})
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'ripd_lia' ? 'active' : ''}`}
            onClick={() => setSubTab('ripd_lia')}
          >
            <FileSpreadsheet size={14} /> RIPD Art. 38 & LIA Art. 10 ({ripdList.length + liaList.length})
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'processors' ? 'active' : ''}`}
            onClick={() => setSubTab('processors')}
          >
            <Globe size={14} /> Operadores & Transf. Internacional ({processorsList.length})
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'retention' ? 'active' : ''}`}
            onClick={() => setSubTab('retention')}
          >
            <RefreshCw size={14} /> Retenção & Descarte Arts. 15/16
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setSubTab('incidents')}
          >
            <ShieldAlert size={14} /> Incidentes Art. 48 ({openIncidentsCount} aberto(s))
          </button>
          <button
            type="button"
            className={`subtab-pill ${subTab === 'dpo' ? 'active' : ''}`}
            onClick={() => setSubTab('dpo')}
          >
            <UserCheck size={14} /> DPO Titular & Substituto (Art. 41)
          </button>
        </div>

        {subTab === 'ropa' && (
          <div className="toolbar-actions-group">
            <div className="search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar processo ou base legal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `ropa-mapeamento-lgpd-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    'Processo',
                    'Área',
                    'Finalidade',
                    'Base Legal',
                    'Categorias de Dados',
                    'Dados Sensíveis (Art. 11)',
                    'Titulares',
                    'Compartilhamento',
                    'Transferência Internacional',
                    'Retenção (Art. 15/16)',
                    'Medidas de Segurança (Art. 46)',
                    'Status',
                  ],
                  filteredRopa.map((r) => [
                    r.processName,
                    r.area,
                    r.purpose,
                    r.legalBasis,
                    r.dataCategories,
                    r.hasSensitiveData ? 'Sim' : 'Não',
                    r.dataSubjects,
                    r.thirdParties,
                    r.internationalTransfer || 'Não aplicável',
                    r.retentionPeriod,
                    r.securityMeasures,
                    r.status,
                  ])
                )
              }
            >
              <Download size={15} /> Exportar ROPA
            </button>
            <button
              type="button"
              className="btn-save-main"
              onClick={() => {
                setIsNewRopa(true);
                setEditingRopa({
                  id: '',
                  processName: '',
                  area: '',
                  purpose: '',
                  legalBasis: 'Cumprimento de obrigação legal (Art. 7º, II)',
                  dataCategories: '',
                  hasSensitiveData: false,
                  involvesMinors: false,
                  dataSubjects: '',
                  thirdParties: 'Sem compartilhamento externo',
                  internationalTransfer: 'Infraestrutura em nuvem com Cláusulas-Padrão ANPD',
                  retentionPeriod: '5 anos',
                  securityMeasures: 'Criptografia TLS 1.3 / AES-256 e controle de acesso restrito com 2FA',
                  status: 'ativo',
                });
              }}
            >
              <Plus size={15} /> Nova Atividade
            </button>
          </div>
        )}

        {subTab === 'ripd_lia' && (
          <div className="toolbar-actions-group">
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `ripd-relatorio-impacto-anpd-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Título RIPD', 'Processo Vinculado', 'Versão', 'Probabilidade', 'Impacto', 'Riscos Identificados', 'Medidas Mitigadoras', 'Parecer DPO', 'Status'],
                  ripdList.map((d) => [
                    d.title,
                    d.ropaProcessName,
                    d.version,
                    d.probability,
                    d.impact,
                    d.identifiedRisks,
                    d.mitigationMeasures,
                    d.dpoOpinion,
                    d.status,
                  ])
                )
              }
            >
              <Download size={15} /> Exportar RIPD (ANPD)
            </button>
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() => {
                setIsNewLia(true);
                setEditingLia({
                  id: '',
                  processName: '',
                  createdAt: new Date().toISOString().slice(0, 10),
                  legitimatePurpose: '',
                  necessityTest: '',
                  balancingTest: '',
                  safeguardsAndOptOut: '',
                  conclusion: 'aprovado',
                });
              }}
            >
              <Plus size={15} /> Novo Teste LIA (Art. 10)
            </button>
            <button
              type="button"
              className="btn-save-main"
              onClick={() => {
                setIsNewRipd(true);
                setEditingRipd({
                  id: '',
                  title: '',
                  ropaProcessName: config.ropaRecords[0]?.processName || '',
                  version: '1.0',
                  createdAt: new Date().toISOString().slice(0, 10),
                  updatedAt: new Date().toISOString().slice(0, 10),
                  processingDescription: '',
                  necessityAndProportionality: '',
                  identifiedRisks: '',
                  probability: 'baixa',
                  impact: 'medio',
                  mitigationMeasures: '',
                  dpoOpinion: '',
                  status: 'vigente',
                });
              }}
            >
              <Plus size={15} /> Novo RIPD (Art. 38)
            </button>
          </div>
        )}

        {subTab === 'processors' && (
          <div className="toolbar-actions-group">
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `operadores-transferencia-internacional-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Operador', 'Papel', 'Escopo', 'País', 'Transf. Internacional', 'Mecanismo (Art. 33)', 'Certificações', 'DPA Assinado'],
                  processorsList.map((p) => [
                    p.name,
                    p.role,
                    p.serviceProvided,
                    p.country,
                    p.isInternationalTransfer ? 'Sim' : 'Não',
                    TRANSFER_MECHANISM_LABELS[p.transferMechanism] || p.transferMechanism,
                    p.securityCertifications,
                    p.dpaSigned ? 'Sim' : 'Não',
                  ])
                )
              }
            >
              <Download size={15} /> Exportar Operadores
            </button>
            <button
              type="button"
              className="btn-save-main"
              onClick={() => {
                setIsNewProcessor(true);
                setEditingProcessor({
                  id: '',
                  name: '',
                  cnpjOrId: '',
                  role: 'operador',
                  serviceProvided: '',
                  dataCategoriesShared: '',
                  country: 'Brasil',
                  isInternationalTransfer: false,
                  transferMechanism: 'nacional',
                  securityCertifications: 'ISO/IEC 27001, TLS 1.3',
                  dpaSigned: true,
                  lastAuditDate: new Date().toISOString().slice(0, 10),
                  status: 'ativo',
                });
              }}
            >
              <Plus size={15} /> Adicionar Operador
            </button>
          </div>
        )}

        {subTab === 'incidents' && (
          <div className="toolbar-actions-group">
            <button
              type="button"
              className="btn-outline-admin"
              onClick={() =>
                exportToCsv(
                  `incidentes-lgpd-${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Título', 'Detecção', 'Ciência (Res. 15/2024)', 'Severidade', 'Status', 'Dados Afetados', 'ANPD Notificada', 'Titulares Notificados'],
                  config.incidents.map((i) => [
                    i.title,
                    formatDateBR(i.detectedAt),
                    formatDateBR(i.knowledgeAt || i.detectedAt),
                    i.severity,
                    i.status,
                    i.affectedData,
                    i.anpdNotified ? 'Sim' : 'Não',
                    i.subjectsNotified ? 'Sim' : 'Não',
                  ])
                )
              }
            >
              <Download size={15} /> Exportar CSV
            </button>
            <button
              type="button"
              className="btn-save-main"
              onClick={() => {
                setIsNewIncident(true);
                const today = new Date().toISOString().slice(0, 10);
                setEditingIncident({
                  id: '',
                  title: '',
                  detectedAt: today,
                  knowledgeAt: today,
                  severity: 'media',
                  status: 'investigando',
                  cidDimensions: ['Confidencialidade'],
                  affectedData: '',
                  estimatedSubjects: 0,
                  anpdNotified: false,
                  anpdProtocol: '',
                  subjectsNotified: false,
                  delayJustification: '',
                  containmentActions: '',
                  notes: '',
                });
              }}
            >
              <Plus size={15} /> Registrar Incidente (Res. 15/2024)
            </button>
          </div>
        )}
      </div>

      {/* SUBTAB 1: ROPA (Art. 37) */}
      {subTab === 'ropa' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Processo / Fluxo</th>
                <th>Área</th>
                <th>Base Legal (Arts. 7º e 11)</th>
                <th>Titulares & Dados</th>
                <th>Retenção (Art. 15/16)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRopa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty-cell">
                    Nenhuma operação de tratamento registrada no mapeamento ROPA.
                  </td>
                </tr>
              ) : (
                filteredRopa.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.processName}</strong>
                      <div className="table-subtext">{r.purpose}</div>
                      {r.hasSensitiveData && (
                        <span className="badge-tone warning" style={{ marginTop: '4px', fontSize: '0.7rem' }}>
                          Contém Dados Sensíveis (Art. 11)
                        </span>
                      )}
                    </td>
                    <td>{r.area}</td>
                    <td>{r.legalBasis}</td>
                    <td>
                      <div>{r.dataSubjects}</div>
                      <div className="table-subtext">{r.dataCategories}</div>
                    </td>
                    <td>{r.retentionPeriod}</td>
                    <td>
                      <span
                        className={`badge-tone ${
                          r.status === 'ativo' ? 'success' : r.status === 'em_revisao' ? 'warning' : 'neutral'
                        }`}
                      >
                        {r.status === 'ativo' ? 'Ativo' : r.status === 'em_revisao' ? 'Em Revisão' : 'Arquivado'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn edit"
                          title="Editar operação"
                          onClick={() => {
                            setIsNewRopa(false);
                            setEditingRopa({ ...r });
                          }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete"
                          title="Remover operação"
                          onClick={() => handleDeleteRopa(r.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: RIPD (Art. 38) & LIA (Art. 10, § 3º) */}
      {subTab === 'ripd_lia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
              <FileText size={17} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Relatórios de Impacto à Proteção de Dados Pessoais — RIPD (Art. 5º, XVII e Art. 38 da LGPD)
            </h3>
            <p className="table-subtext" style={{ marginBottom: '12px' }}>
              Documentação técnica das operações de tratamento que podem gerar riscos às liberdades civis e aos direitos fundamentais, contendo medidas, salvaguardas e mecanismos de mitigação de risco.
            </p>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título do RIPD / Processo</th>
                    <th>Matriz de Risco</th>
                    <th>Medidas de Mitigação & Salvaguardas</th>
                    <th>Parecer do DPO</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ripdList.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.title}</strong>
                        <div className="table-subtext">Processo: {d.ropaProcessName} · v{d.version}</div>
                      </td>
                      <td>
                        <div className="table-subtext">Probabilidade: <strong>{d.probability.toUpperCase()}</strong></div>
                        <div className="table-subtext">Impacto: <strong>{d.impact.toUpperCase()}</strong></div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div className="table-subtext">{d.mitigationMeasures}</div>
                      </td>
                      <td style={{ maxWidth: '260px' }}>
                        <div className="table-subtext">{d.dpoOpinion}</div>
                      </td>
                      <td>
                        <span className={`badge-tone ${d.status === 'vigente' ? 'success' : 'warning'}`}>
                          {d.status === 'vigente' ? 'Vigente' : 'Em Revisão'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            title="Editar RIPD"
                            onClick={() => {
                              setIsNewRipd(false);
                              setEditingRipd({ ...d });
                            }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            title="Excluir RIPD"
                            onClick={() => handleDeleteRipd(d.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
              <Scale size={17} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Avaliação de Legítimo Interesse — Teste de Proporcionalidade LIA (Art. 10, §§ 1º a 3º da LGPD)
            </h3>
            <p className="table-subtext" style={{ marginBottom: '12px' }}>
              Comprovação de finalidade legítima, necessidade (minimização), balanceamento com a legítima expectativa do titular e salvaguardas para tratamentos baseados no Art. 7º, IX.
            </p>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Operação Avaliada</th>
                    <th>1. Finalidade Legítima</th>
                    <th>2. Necessidade & 3. Balanceamento</th>
                    <th>4. Salvaguardas & Opt-Out</th>
                    <th>Conclusão</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {liaList.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.processName}</strong>
                        <div className="table-subtext">{formatDateBR(l.createdAt)}</div>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div className="table-subtext">{l.legitimatePurpose}</div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div className="table-subtext"><strong>Necessidade:</strong> {l.necessityTest}</div>
                        <div className="table-subtext"><strong>Balanceamento:</strong> {l.balancingTest}</div>
                      </td>
                      <td style={{ maxWidth: '220px' }}>
                        <div className="table-subtext">{l.safeguardsAndOptOut}</div>
                      </td>
                      <td>
                        <span className={`badge-tone ${l.conclusion === 'aprovado' ? 'success' : l.conclusion === 'aprovado_com_ressalvas' ? 'warning' : 'danger'}`}>
                          {l.conclusion === 'aprovado' ? 'Aprovado' : l.conclusion === 'aprovado_com_ressalvas' ? 'Com Ressalvas' : 'Reprovado'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            onClick={() => {
                              setIsNewLia(false);
                              setEditingLia({ ...l });
                            }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={() => handleDeleteLia(l.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: OPERADORES & TRANSFERÊNCIA INTERNACIONAL (Arts. 33 a 36 e Art. 39) */}
      {subTab === 'processors' && (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Operador / Suboperador</th>
                <th>Escopo do Serviço</th>
                <th>País / Jurisdição</th>
                <th>Mecanismo Legal (Art. 33 / Res. 19/2024)</th>
                <th>Certificações & DPA</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {processorsList.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="table-subtext">{p.cnpjOrId}</div>
                    <span className="badge-tone info" style={{ marginTop: '4px' }}>
                      {p.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div>{p.serviceProvided}</div>
                    <div className="table-subtext">Dados: {p.dataCategoriesShared}</div>
                  </td>
                  <td>
                    <strong>{p.country}</strong>
                    <div className="table-subtext">
                      {p.isInternationalTransfer ? '🌐 Transferência Internacional' : '🇧🇷 Processamento Nacional'}
                    </div>
                  </td>
                  <td>{TRANSFER_MECHANISM_LABELS[p.transferMechanism] || p.transferMechanism}</td>
                  <td>
                    <div>{p.securityCertifications}</div>
                    <span className={`badge-tone ${p.dpaSigned ? 'success' : 'warning'}`} style={{ marginTop: '4px' }}>
                      {p.dpaSigned ? 'DPA / Contrato Assinado' : 'DPA Pendente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        type="button"
                        className="table-action-btn edit"
                        onClick={() => {
                          setIsNewProcessor(false);
                          setEditingProcessor({ ...p });
                        }}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        className="table-action-btn delete"
                        onClick={() => handleDeleteProcessor(p.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 4: CICLO DE VIDA, RETENÇÃO E DESCARTE SEGURO (Arts. 15 e 16) */}
      {subTab === 'retention' && (
        <div className="settings-form-container">
          <div className="settings-section">
            <h3 className="settings-section-title">
              <RefreshCw size={18} /> Término do Tratamento, Retenção e Expurgo Seguro (Arts. 15 e 16 da LGPD)
            </h3>
            <p className="settings-section-desc">
              Configure os prazos de retenção automática e execute a rotina de anonimização ou eliminação de dados cujo ciclo de finalidade já se encerrou, preservando apenas os registros necessários para cumprimento de obrigação legal ou regulatória (Art. 16, I).
            </p>

            <div className="form-grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>
                  Prazo de Retenção — Mensagens de Contato (meses)
                  <FieldHelp
                    text="Quantos meses as mensagens enviadas pelo formulário 'Fale Conosco' ficam guardadas antes de serem anonimizadas."
                    example="24 (ou seja, 2 anos após o contato inicial)."
                  />
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  className="form-control"
                  value={config.retentionContactMonths || 24}
                  onChange={(e) =>
                    onChange({ ...config, retentionContactMonths: Math.max(1, Number(e.target.value) || 24) })
                  }
                />
                <small className="table-subtext">
                  Padrão recomendado: 24 meses após o contato inicial sem contratação.
                </small>
              </div>

              <div className="form-group">
                <label>
                  Prazo de Guarda Legal — Logs de Consentimento e Auditoria (meses)
                  <FieldHelp
                    text="Tempo em que o sistema guarda a prova de que o usuário aceitou os cookies ou formulários, para apresentar à ANPD em caso de fiscalização."
                    example="60 (equivalente a 5 anos)."
                  />
                </label>
                <input
                  type="number"
                  min={12}
                  max={120}
                  className="form-control"
                  value={config.retentionLogsMonths || 60}
                  onChange={(e) =>
                    onChange({ ...config, retentionLogsMonths: Math.max(12, Number(e.target.value) || 60) })
                  }
                />
                <small className="table-subtext">
                  Padrão recomendado: 60 meses (5 anos) para prova perante a ANPD (Art. 16, I).
                </small>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <strong style={{ color: '#0d3732', display: 'block', fontSize: '1rem', marginBottom: '4px' }}>
                  Diagnóstico de Ciclo de Vida Atual no Banco de Dados
                </strong>
                <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                  • Mensagens de contato vencidas (&gt; {retentionMonthsContact} meses):{' '}
                  <strong>{expiredMessages.length} registro(s)</strong>
                  <br />• Registros de consentimento vencidos (&gt; {retentionMonthsLogs} meses):{' '}
                  <strong>{expiredConsents.length} registro(s)</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-outline-admin"
                  disabled={saving}
                  onClick={() => persistGovernance(config, 'Prazos de retenção salvos com sucesso!')}
                >
                  <Save size={15} /> Salvar Prazos
                </button>
                <button
                  type="button"
                  className="btn-save-main"
                  disabled={purging}
                  onClick={handleExecuteRetentionPurge}
                >
                  <Trash2 size={15} />{' '}
                  {purging ? 'Executando Expurgo...' : 'Executar Anonimização / Expurgo (Art. 16)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: INCIDENTES (Art. 48 & Resolução CD/ANPD nº 15/2024) */}
      {subTab === 'incidents' && (
        <div className="table-responsive">
          {config.incidents.length === 0 ? (
            <div className="empty-state-panel">
              <CheckCircle2 size={36} color="#059669" />
              <h4>Nenhum incidente de segurança registrado</h4>
              <p>
                Caso ocorra qualquer evento que possa acarretar risco ou dano relevante aos titulares (Art. 48 LGPD / Resolução CD/ANPD nº 15/2024), registre aqui para controle do prazo regulamentar de <strong>3 dias úteis</strong> ({config.incidentNotificationHours}h) e geração automática da minuta oficial de comunicação à ANPD.
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Incidente & Dimensões CID</th>
                  <th>Detecção / Ciência</th>
                  <th>Severidade</th>
                  <th>Comunicações (Prazo 3d úteis)</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {config.incidents.map((inc) => {
                  const sev = SEVERITY_META[inc.severity];
                  const st = INCIDENT_STATUS_META[inc.status];
                  return (
                    <tr key={inc.id}>
                      <td>
                        <strong>{inc.title}</strong>
                        <div className="table-subtext">
                          {inc.affectedData || 'Dados em análise'} · ~{inc.estimatedSubjects} titular(es)
                        </div>
                        {Array.isArray(inc.cidDimensions) && inc.cidDimensions.length > 0 && (
                          <div className="table-subtext">CID: {inc.cidDimensions.join(', ')}</div>
                        )}
                      </td>
                      <td className="tabular-nums">
                        <div>Detecção: {formatDateBR(inc.detectedAt)}</div>
                        <div className="table-subtext">Ciência: {formatDateBR(inc.knowledgeAt || inc.detectedAt)}</div>
                      </td>
                      <td>
                        <span className={`badge-tone ${sev.tone}`}>{sev.label}</span>
                      </td>
                      <td>
                        <div className="table-subtext">
                          ANPD: <strong>{inc.anpdNotified ? `Sim (${inc.anpdProtocol || 'Protocolado'})` : 'Não'}</strong>
                          <br />
                          Titulares: <strong>{inc.subjectsNotified ? 'Sim' : 'Não'}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-tone ${st.tone}`}>{st.label}</span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="btn-outline-admin"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            title="Baixar minuta de comunicação à ANPD e Titulares (Art. 48, § 1º)"
                            onClick={() => handleGenerateAnpdIncidentDraft(inc)}
                          >
                            <Download size={13} /> Minuta ANPD
                          </button>
                          <button
                            type="button"
                            className="table-action-btn edit"
                            title="Gerenciar incidente"
                            onClick={() => {
                              setIsNewIncident(false);
                              setEditingIncident({ ...inc });
                            }}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            title="Excluir registro"
                            onClick={() => handleDeleteIncident(inc.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SUBTAB 6: GOVERNANÇA, DPO TITULAR & DPO SUBSTITUTO (Art. 41 & Res. ANPD 18/2024) */}
      {subTab === 'dpo' && (
        <div className="settings-form-container">
          <form onSubmit={handleSaveDpoForm}>
            <div className="settings-section">
              <h3 className="settings-section-title">
                <UserCheck size={18} /> Encarregado Titular e Substituto (Art. 41 da LGPD e Resolução CD/ANPD nº 18/2024)
              </h3>
              <p className="settings-section-desc">
                As informações abaixo são exibidas publicamente na Central de Proteção de Dados e cumprem integralmente a exigência de divulgação de Encarregado Titular e Substituto da Resolução CD/ANPD nº 18/2024.
              </p>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Nome do(a) Encarregado(a) Titular (DPO)
                    <FieldHelp
                      text="Pessoa principal responsável por cuidar da privacidade no escritório e atender os titulares e a ANPD (Art. 41 da LGPD)."
                      example="Mirataira Haus"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoName}
                    onChange={(e) => onChange({ ...config, dpoName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    E-mail Oficial do Canal DPO Titular
                    <FieldHelp
                      text="Endereço de e-mail divulgado no site para qualquer pessoa tirar dúvidas ou fazer pedidos sobre seus dados pessoais."
                      example="privacidade@mascarellohaus.adv.br"
                    />
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={config.dpoEmail}
                    onChange={(e) => onChange({ ...config, dpoEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Telefone / WhatsApp de Privacidade
                    <FieldHelp
                      text="Número de telefone ou WhatsApp onde o titular também pode contatar o DPO."
                      example="+55 (49) 98822-0982"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoPhone}
                    onChange={(e) => onChange({ ...config, dpoPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Registro / Cargo do Titular
                    <FieldHelp
                      text="Qualificação profissional ou número da OAB/cargo exibido no cartão do Encarregado na página pública."
                      example="OAB/SC — Encarregada Titular"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoOab}
                    onChange={(e) => onChange({ ...config, dpoOab: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Nome do Encarregado Substituto (Ausências/Vacâncias — Res. 18/2024)
                    <FieldHelp
                      text="A ANPD exige um substituto formal para responder pelos dados quando o DPO titular estiver de férias, ausente ou impedido."
                      example="Comitê de Privacidade Mascârello Haus"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.substituteDpoName || ''}
                    onChange={(e) => onChange({ ...config, substituteDpoName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    E-mail do Encarregado Substituto
                    <FieldHelp
                      text="E-mail alternativo para contato caso o DPO titular esteja ausente."
                      example="dpo@mascarellohaus.com.br"
                    />
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={config.substituteDpoEmail || ''}
                    onChange={(e) => onChange({ ...config, substituteDpoEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Telefone do Encarregado Substituto
                    <FieldHelp
                      text="Telefone de contato do substituto ou da recepção do escritório para assuntos de LGPD."
                      example="+55 (49) 3566-0066"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.substituteDpoPhone || ''}
                    onChange={(e) => onChange({ ...config, substituteDpoPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Cargo / Função do Substituto
                    <FieldHelp
                      text="Descrição da função do substituto que aparecerá no cartão público da Central de Proteção de Dados."
                      example="Encarregado Substituto (Res. CD/ANPD nº 18/2024)"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.substituteDpoOab || ''}
                    onChange={(e) => onChange({ ...config, substituteDpoOab: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Horário de Atendimento aos Titulares
                    <FieldHelp
                      text="Dias e horários em que a equipe do DPO atende dúvidas e ligações sobre privacidade."
                      example="Segunda a Sexta, 08h30 às 12h00 e 13h30 às 18h00"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.dpoServiceHours}
                    onChange={(e) => onChange({ ...config, dpoServiceHours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">
                <AlertTriangle size={18} /> Prazos Regulatórios, Menores (Art. 14) e Transferência Internacional (Art. 33)
              </h3>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Prazo de Resposta a Titulares — Declaração Completa (dias — Art. 19, II)
                    <FieldHelp
                      text="A lei dá até 15 dias corridos a partir do pedido para enviar a resposta completa ao titular dos dados."
                      example="15"
                    />
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className="form-control"
                    value={config.responseDeadlineDays}
                    onChange={(e) =>
                      onChange({ ...config, responseDeadlineDays: Math.max(1, Number(e.target.value) || 15) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Prazo de Comunicação de Incidentes à ANPD (dias úteis — Res. 15/2024)
                    <FieldHelp
                      text="Se houver vazamento ou incidente relevante, a Resolução nº 15/2024 da ANPD determina avisar em até 3 dias úteis."
                      example="3"
                    />
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="form-control"
                    value={config.incidentBusinessDaysAnpd || 3}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        incidentBusinessDaysAnpd: Math.max(1, Number(e.target.value) || 3),
                        incidentNotificationHours: Math.max(1, Number(e.target.value) || 3) * 24,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Ciclo de Revisão do ROPA / RIPD (dias)
                    <FieldHelp
                      text="De quantos em quantos dias o escritório revisa o inventário de dados para ver se mudou algum processo."
                      example="180 (a cada 6 meses)"
                    />
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={730}
                    className="form-control"
                    value={config.ropaReviewCycleDays}
                    onChange={(e) =>
                      onChange({ ...config, ropaReviewCycleDays: Math.max(30, Number(e.target.value) || 180) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Próxima Auditoria / Revisão Programada
                    <FieldHelp
                      text="Data agendada no calendário para a próxima revisão geral de conformidade LGPD."
                      example="2027-05-01"
                    />
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={config.nextReviewDate}
                    onChange={(e) => onChange({ ...config, nextReviewDate: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Diretriz Pública de Proteção de Crianças e Adolescentes (Art. 14 LGPD)
                    <FieldHelp
                      text="Texto exibido no site explicando que o portal é para maiores de 18 anos e como menores são protegidos quando há processo judicial."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={config.childrenDataPolicy || DEFAULT_LGPD_GOVERNANCE_CONFIG.childrenDataPolicy}
                    onChange={(e) => onChange({ ...config, childrenDataPolicy: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Diretriz Pública de Transferência Internacional de Dados (Arts. 33 a 36 e Res. 19/2024)
                    <FieldHelp
                      text="Explicação clara ao visitante de que servidores em nuvem (como Supabase/Vercel) podem processar dados no exterior com segurança."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={config.internationalTransferPolicy || DEFAULT_LGPD_GOVERNANCE_CONFIG.internationalTransferPolicy}
                    onChange={(e) => onChange({ ...config, internationalTransferPolicy: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Integrantes do Comitê de Privacidade e Governança
                    <FieldHelp
                      text="Lista das pessoas ou setores internos que participam das decisões de privacidade e segurança do escritório."
                      example="Mirataira Haus (DPO), Sócios Administradores e TI (ApexCode)"
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={config.committeeMembers}
                    onChange={(e) => onChange({ ...config, committeeMembers: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="settings-actions-footer">
              <button type="submit" className="btn-save-main" disabled={saving}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Governança LGPD'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ROPA */}
      {editingRopa && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingRopa(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewRopa ? 'Nova Operação de Tratamento (ROPA — Art. 37)' : 'Editar Operação (ROPA — Art. 37)'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingRopa(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveRopa} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Nome do Processo *
                    <FieldHelp
                      text="Nome curto da atividade ou rotina do escritório que usa dados pessoais."
                      example="Atendimento ao Cliente, Folha de Pagamento, Envio de Newsletters"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingRopa.processName}
                    onChange={(e) => setEditingRopa({ ...editingRopa, processName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Área / Departamento
                    <FieldHelp
                      text="Setor do escritório responsável por essa atividade."
                      example="Advocacia Trabalhista, RH, Financeiro, Marketing"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.area}
                    onChange={(e) => setEditingRopa({ ...editingRopa, area: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Finalidade do Tratamento *
                    <FieldHelp
                      text="Para que o escritório coleta e usa esses dados? Explique de forma direta o objetivo."
                      example="Elaborar contratos de honorários e petições judiciais."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    required
                    value={editingRopa.purpose}
                    onChange={(e) => setEditingRopa({ ...editingRopa, purpose: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Base Legal (Art. 7º / Art. 11 LGPD)
                    <FieldHelp
                      text="Motivo previsto na lei que autoriza o uso dos dados (ex.: contrato, obrigação legal, processo judicial, consentimento ou legítimo interesse)."
                      example="Execução de contrato (Art. 7º, V)"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.legalBasis}
                    onChange={(e) => setEditingRopa({ ...editingRopa, legalBasis: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Status
                    <FieldHelp
                      text="Indica se este processo está acontecendo hoje (Ativo), sendo revisado ou já encerrado (Arquivado)."
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingRopa.status}
                    onChange={(e) => setEditingRopa({ ...editingRopa, status: e.target.value as RopaRecordItem['status'] })}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="em_revisao">Em Revisão</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Categorias de Dados Pessoais
                    <FieldHelp
                      text="Quais informações da pessoa são coletadas nessa rotina?"
                      example="Nome completo, CPF, RG, endereço, e-mail, telefone"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.dataCategories}
                    onChange={(e) => setEditingRopa({ ...editingRopa, dataCategories: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Titulares Envolvidos
                    <FieldHelp
                      text="Quem são os donos desses dados?"
                      example="Clientes, colaboradores, candidatos a vaga, fornecedores"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.dataSubjects}
                    onChange={(e) => setEditingRopa({ ...editingRopa, dataSubjects: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Compartilhamento com Terceiros / Operadores
                    <FieldHelp
                      text="Com quem esses dados são divididos fora do escritório (órgãos públicos, contabilidade, sistemas em nuvem)?"
                      example="Poder Judiciário, Receita Federal, Supabase"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.thirdParties}
                    onChange={(e) => setEditingRopa({ ...editingRopa, thirdParties: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Prazo de Retenção / Descarte (Art. 15/16)
                    <FieldHelp
                      text="Por quanto tempo os dados ficam guardados antes de serem apagados ou anonimizados?"
                      example="5 anos após o encerramento do processo"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.retentionPeriod}
                    onChange={(e) => setEditingRopa({ ...editingRopa, retentionPeriod: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={Boolean(editingRopa.hasSensitiveData)}
                      onChange={(e) => setEditingRopa({ ...editingRopa, hasSensitiveData: e.target.checked })}
                    />
                    <span>Envolve Dados Pessoais Sensíveis (Art. 11 LGPD)</span>
                    <FieldHelp
                      text="Marque se houver dados de saúde/atestados, biometria, religião, filiação sindical ou origem racial."
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={Boolean(editingRopa.involvesMinors)}
                      onChange={(e) => setEditingRopa({ ...editingRopa, involvesMinors: e.target.checked })}
                    />
                    <span>Pode Envolver Dados de Menores (Art. 14 LGPD)</span>
                    <FieldHelp
                      text="Marque se o processo tratar dados de crianças ou adolescentes (ex.: pensão alimentícia, dependentes)."
                    />
                  </label>
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Medidas Técnicas e Administrativas de Segurança (Art. 46)
                    <FieldHelp
                      text="O que o escritório faz para proteger esses dados contra vazamento ou acesso indevido?"
                      example="Senhas fortes, 2FA, criptografia, acesso restrito à equipe"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRopa.securityMeasures}
                    onChange={(e) => setEditingRopa({ ...editingRopa, securityMeasures: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingRopa(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Operação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RIPD (Art. 38) */}
      {editingRipd && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingRipd(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewRipd ? 'Elaborar Relatório de Impacto (RIPD — Art. 38)' : 'Editar RIPD (Art. 38)'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingRipd(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveRipd} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Título do Relatório RIPD *
                    <FieldHelp
                      text="Nome de identificação deste Relatório de Impacto (usado quando um processo envolve risco maior ou dados sensíveis)."
                      example="RIPD 003/2026 — Prontuários Previdenciários"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingRipd.title}
                    onChange={(e) => setEditingRipd({ ...editingRipd, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Processo ROPA Vinculado
                    <FieldHelp
                      text="Qual atividade do mapeamento ROPA está sendo analisada neste relatório."
                      example="Atendimento Jurídico, Consultivo e Contencioso"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRipd.ropaProcessName}
                    onChange={(e) => setEditingRipd({ ...editingRipd, ropaProcessName: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    1. Descrição dos Processos de Tratamento que Podem Gerar Riscos (Art. 38, parágrafo único, I)
                    <FieldHelp
                      text="Explique em linguagem simples como os dados entram, onde ficam guardados e quem acessa."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingRipd.processingDescription}
                    onChange={(e) => setEditingRipd({ ...editingRipd, processingDescription: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    2. Análise de Necessidade e Proporcionalidade (Art. 6º, III)
                    <FieldHelp
                      text="Justifique por que esses dados são realmente necessários (não daria para fazer o trabalho sem eles?)."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingRipd.necessityAndProportionality}
                    onChange={(e) => setEditingRipd({ ...editingRipd, necessityAndProportionality: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    3. Identificação de Riscos às Liberdades Civis e Direitos Fundamentais
                    <FieldHelp
                      text="O que poderia dar errado caso ocorresse um vazamento ou erro? (ex.: exposição médica, fraude, constrangimento)."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingRipd.identifiedRisks}
                    onChange={(e) => setEditingRipd({ ...editingRipd, identifiedRisks: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Probabilidade do Risco
                    <FieldHelp
                      text="Qual a chance de esse problema acontecer hoje, considerando os controles atuais?"
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingRipd.probability}
                    onChange={(e) => setEditingRipd({ ...editingRipd, probability: e.target.value as any })}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Severidade / Impacto ao Titular
                    <FieldHelp
                      text="Se o problema acontecer, qual o tamanho do prejuízo para a pessoa dona dos dados?"
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingRipd.impact}
                    onChange={(e) => setEditingRipd({ ...editingRipd, impact: e.target.value as any })}
                  >
                    <option value="baixo">Baixo</option>
                    <option value="medio">Médio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label>
                    4. Medidas, Salvaguardas e Mecanismos de Mitigação de Risco (Art. 38, parágrafo único, IV)
                    <FieldHelp
                      text="Liste as proteções usadas para reduzir esse risco (criptografia, acesso restrito, 2FA, anonimização)."
                    />
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={editingRipd.mitigationMeasures}
                    onChange={(e) => setEditingRipd({ ...editingRipd, mitigationMeasures: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    5. Parecer Conclusivo da Encarregada de Dados (DPO)
                    <FieldHelp
                      text="Conclusão final do DPO dizendo se o processo é seguro para continuar funcionando (Parecer Favorável ou Com Ressalvas)."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingRipd.dpoOpinion}
                    onChange={(e) => setEditingRipd({ ...editingRipd, dpoOpinion: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingRipd(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar RIPD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIA (Art. 10, § 3º) */}
      {editingLia && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingLia(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewLia ? 'Novo Teste de Legítimo Interesse (LIA — Art. 10)' : 'Editar LIA (Art. 10)'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingLia(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveLia} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Processo / Tratamento Baseado em Legítimo Interesse *
                    <FieldHelp
                      text="Qual atividade do escritório usa o 'Legítimo Interesse' (Art. 7º, IX) como justificativa legal."
                      example="Prevenção contra fraudes e robôs nos formulários"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingLia.processName}
                    onChange={(e) => setEditingLia({ ...editingLia, processName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Conclusão do Teste
                    <FieldHelp
                      text="Resultado após analisar se o interesse do escritório é justo e não prejudica o titular."
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingLia.conclusion}
                    onChange={(e) => setEditingLia({ ...editingLia, conclusion: e.target.value as any })}
                  >
                    <option value="aprovado">Aprovado (Legítimo Interesse Válido)</option>
                    <option value="aprovado_com_ressalvas">Aprovado com Salvaguardas Adicionais</option>
                    <option value="reprovado">Reprovado (Exige Outra Base Legal)</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Etapa 1 — Teste da Finalidade Legítima e Situação Concreta (Art. 10, caput)
                    <FieldHelp
                      text="Qual é o benefício real e lícito esperado pelo escritório ou pelo cliente com essa atividade?"
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingLia.legitimatePurpose}
                    onChange={(e) => setEditingLia({ ...editingLia, legitimatePurpose: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Etapa 2 — Teste da Necessidade e Minimização (Art. 10, § 1º)
                    <FieldHelp
                      text="Explique se estamos usando apenas o mínimo de dados possíveis (e se não há outro jeito menos invasivo)."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingLia.necessityTest}
                    onChange={(e) => setEditingLia({ ...editingLia, necessityTest: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Etapa 3 — Teste de Balanceamento e Legítima Expectativa do Titular (Art. 10, II)
                    <FieldHelp
                      text="A pessoa esperaria razoavelmente que o escritório fizesse isso? Há algum risco aos direitos dela?"
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingLia.balancingTest}
                    onChange={(e) => setEditingLia({ ...editingLia, balancingTest: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Etapa 4 — Salvaguardas, Transparência e Direito de Oposição (Art. 10, § 2º e Art. 18, § 2º)
                    <FieldHelp
                      text="Como avisamos o titular sobre isso e como ele pode pedir para parar (Opt-out / Oposição)?"
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingLia.safeguardsAndOptOut}
                    onChange={(e) => setEditingLia({ ...editingLia, safeguardsAndOptOut: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingLia(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar LIA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OPERADOR / TRANSFERÊNCIA INTERNACIONAL */}
      {editingProcessor && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingProcessor(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{isNewProcessor ? 'Cadastrar Operador de Dados (Art. 39 / Art. 33)' : 'Editar Operador de Dados'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingProcessor(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProcessor} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>
                    Razão Social / Nome do Operador *
                    <FieldHelp
                      text="Empresa parceira, fornecedor ou sistema externo que processa dados em nome do escritório."
                      example="Supabase Inc., Contabilidade Silva Ltda., Google Workspace"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingProcessor.name}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    CNPJ / Identificador / Contato
                    <FieldHelp
                      text="CNPJ da empresa brasileira ou identificação/contato do fornecedor internacional."
                      example="00.000.000/0001-00 ou contato@fornecedor.com"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProcessor.cnpjOrId}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, cnpjOrId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Papel na LGPD (Art. 5º)
                    <FieldHelp
                      text="Operador trata dados seguindo ordens do escritório; Suboperador é contratado pelo operador; Controlador Conjunto decide junto."
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingProcessor.role}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, role: e.target.value as any })}
                  >
                    <option value="operador">Operador (Art. 5º, VII)</option>
                    <option value="suboperador">Suboperador</option>
                    <option value="controlador_conjunto">Controlador Conjunto</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    País de Localização dos Servidores
                    <FieldHelp
                      text="País onde os computadores/servidores desse fornecedor guardam os dados."
                      example="Brasil ou Estados Unidos (AWS us-east)"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProcessor.country}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, country: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Serviço Prestado / Escopo do Tratamento
                    <FieldHelp
                      text="Explique resumidamente o que esse fornecedor faz para o escritório."
                      example="Hospedagem do banco de dados criptografado e autenticação 2FA."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingProcessor.serviceProvided}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, serviceProvided: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Mecanismo de Transferência (Art. 33 / Res. ANPD 19/2024)
                    <FieldHelp
                      text="Se os dados saem do Brasil, escolha a base legal que autoriza o envio (ex.: Cláusulas-Padrão da ANPD)."
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingProcessor.transferMechanism}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, transferMechanism: e.target.value as any })}
                  >
                    <option value="nacional">Tratamento Nacional (Brasil)</option>
                    <option value="clausulas_padrao_anpd">Cláusulas-Padrão Contratuais (Res. ANPD 19/2024)</option>
                    <option value="pais_adequado">País com Nível Adequado (Art. 33, I)</option>
                    <option value="execucao_contrato">Execução de Contrato (Art. 33, IX)</option>
                    <option value="consentimento_especifico">Consentimento Específico (Art. 33, VIII)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Certificações de Segurança (Art. 46)
                    <FieldHelp
                      text="Selos de segurança que comprovam que o fornecedor protege os dados."
                      example="ISO/IEC 27001, SOC 2 Type II"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingProcessor.securityCertifications}
                    onChange={(e) => setEditingProcessor({ ...editingProcessor, securityCertifications: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={editingProcessor.isInternationalTransfer}
                      onChange={(e) => setEditingProcessor({ ...editingProcessor, isInternationalTransfer: e.target.checked })}
                    />
                    <span>Envolve Transferência Internacional de Dados (Art. 33)</span>
                    <FieldHelp
                      text="Marque se o servidor ou a empresa estiver fora do Brasil (ex.: EUA ou Europa)."
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={editingProcessor.dpaSigned}
                      onChange={(e) => setEditingProcessor({ ...editingProcessor, dpaSigned: e.target.checked })}
                    />
                    <span>Cláusula LGPD / DPA Assinado (Art. 39)</span>
                    <FieldHelp
                      text="Marque se o contrato com esse fornecedor já possui cláusula de proteção de dados (DPA) assinada."
                    />
                  </label>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingProcessor(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Operador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INCIDENTE (Art. 48 & Res. CD/ANPD nº 15/2024) */}
      {editingIncident && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setEditingIncident(null)}>
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                {isNewIncident
                  ? 'Registrar Incidente de Segurança (Art. 48 / Res. ANPD nº 15/2024)'
                  : 'Gerenciar Incidente de Segurança'}
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingIncident(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveIncident} className="admin-modal-form">
              <div className="form-grid-2">
                <div className="form-group form-group-full">
                  <label>
                    Título / Descrição Curta *
                    <FieldHelp
                      text="Resumo rápido do problema de segurança ocorrido (vazamento, envio para e-mail errado, invasão, perda de notebook)."
                      example="Envio acidental de anexo para destinatário incorreto"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editingIncident.title}
                    onChange={(e) => setEditingIncident({ ...editingIncident, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Data da Ocorrência / Detecção
                    <FieldHelp
                      text="Dia em que o incidente aconteceu ou foi percebido pela equipe."
                    />
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={editingIncident.detectedAt}
                    onChange={(e) => setEditingIncident({ ...editingIncident, detectedAt: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Data da Ciência (Início do prazo de 3 dias úteis — Res. 15/2024)
                    <FieldHelp
                      text="Data oficial em que o DPO/Diretoria tomou conhecimento do incidente. O prazo de 3 dias úteis para avisar a ANPD conta a partir daqui."
                    />
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={editingIncident.knowledgeAt || editingIncident.detectedAt}
                    onChange={(e) => setEditingIncident({ ...editingIncident, knowledgeAt: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Severidade
                    <FieldHelp
                      text="Gravidade do risco às pessoas afetadas: Baixa (sem impacto relevante), Média, Alta ou Crítica (dados sensíveis/financeiros expostos)."
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingIncident.severity}
                    onChange={(e) =>
                      setEditingIncident({ ...editingIncident, severity: e.target.value as SecurityIncidentItem['severity'] })
                    }
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Status do Tratamento
                    <FieldHelp
                      text="Em que fase o atendimento do incidente está agora."
                    />
                  </label>
                  <select
                    className="form-control"
                    value={editingIncident.status}
                    onChange={(e) =>
                      setEditingIncident({ ...editingIncident, status: e.target.value as SecurityIncidentItem['status'] })
                    }
                  >
                    <option value="investigando">Em Investigação</option>
                    <option value="contido">Contido</option>
                    <option value="notificado_anpd">ANPD Notificada</option>
                    <option value="encerrado">Encerrado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Qtd. Estimada de Titulares Afetados
                    <FieldHelp
                      text="Quantas pessoas tiveram seus dados envolvidos neste incidente (aproximadamente)."
                      example="1 (ou 25 se envolveu uma lista)"
                    />
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={editingIncident.estimatedSubjects}
                    onChange={(e) =>
                      setEditingIncident({ ...editingIncident, estimatedSubjects: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    Protocolo SEI / ANPD (se comunicado)
                    <FieldHelp
                      text="Se o incidente já foi comunicado à ANPD pelo sistema SEI, cole o número do protocolo aqui."
                      example="SEI 00261.000123/2026-45"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: SEI 00261.000..."
                    value={editingIncident.anpdProtocol || ''}
                    onChange={(e) => setEditingIncident({ ...editingIncident, anpdProtocol: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Dados Pessoais Afetados (Art. 48, § 1º, I e II)
                    <FieldHelp
                      text="Quais informações foram expostas, perdidas ou acessadas sem permissão."
                      example="Nome completo, CPF e e-mail"
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingIncident.affectedData}
                    onChange={(e) => setEditingIncident({ ...editingIncident, affectedData: e.target.value })}
                    placeholder="Ex: Nome, e-mail, documentos cadastrais..."
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={editingIncident.anpdNotified}
                      onChange={(e) => setEditingIncident({ ...editingIncident, anpdNotified: e.target.checked })}
                    />
                    <span>ANPD comunicada formalmente (em até 3 dias úteis)</span>
                    <FieldHelp
                      text="Marque quando a equipe já tiver enviado o comunicado oficial para a ANPD."
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-inline-label">
                    <input
                      type="checkbox"
                      checked={editingIncident.subjectsNotified}
                      onChange={(e) => setEditingIncident({ ...editingIncident, subjectsNotified: e.target.checked })}
                    />
                    <span>Titulares afetados notificados</span>
                    <FieldHelp
                      text="Marque quando os clientes/pessoas afetadas já tiverem sido avisadas do ocorrido."
                    />
                  </label>
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Medidas de Contenção e Mitigação Adotadas (Art. 48, § 1º, III e VI)
                    <FieldHelp
                      text="O que foi feito imediatamente para parar o problema e evitar que aconteça de novo?"
                      example="Troca de senhas, bloqueio de acesso e solicitação de exclusão do e-mail ao destinatário."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingIncident.containmentActions}
                    onChange={(e) => setEditingIncident({ ...editingIncident, containmentActions: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Justificativa de Prazo (Obrigatória se a comunicação ultrapassar 3 dias úteis — Art. 48, § 1º, V)
                    <FieldHelp
                      text="Só preencha se o aviso à ANPD demorou mais de 3 dias úteis, explicando o motivo técnico do atraso."
                    />
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingIncident.delayJustification || ''}
                    onChange={(e) => setEditingIncident({ ...editingIncident, delayJustification: e.target.value })}
                    placeholder="Deixe em branco caso comunicado tempestivamente em até 3 dias úteis"
                  />
                </div>
                <div className="form-group form-group-full">
                  <label>
                    Notas de Investigação e Parecer do DPO
                    <FieldHelp
                      text="Anotações internas sobre o que causou o incidente e a avaliação final da Encarregada."
                    />
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={editingIncident.notes}
                    onChange={(e) => setEditingIncident({ ...editingIncident, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingIncident(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-main" disabled={saving}>
                  <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Incidente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
