import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  X,
  CheckCircle2,
  ClipboardCheck,
  Printer,
  Paperclip,
} from 'lucide-react';
import {
  ATTACHMENT_FIELD_LABELS,
  QuizSubmissionRecord,
  exportToCsv,
  formatDateBR,
  formatDateTimeBR,
} from '../types';

interface QuizzesTabProps {
  submissions: QuizSubmissionRecord[];
}

export const QuizzesTab: React.FC<QuizzesTabProps> = ({ submissions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSubmissionRecord | null>(null);

  useEffect(() => {
    if (!selectedQuiz) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedQuiz(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedQuiz]);

  const filteredSubmissions = submissions.filter((q) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      (q.protocol || '').toLowerCase().includes(query) ||
      q.company_name.toLowerCase().includes(query) ||
      q.cnpj.toLowerCase().includes(query) ||
      q.contact_name.toLowerCase().includes(query) ||
      q.contact_email.toLowerCase().includes(query);

    const score = q.final_score !== null ? Number(q.final_score) : -1;
    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && score >= 80) ||
      (scoreFilter === 'medium' && score >= 50 && score < 80) ||
      (scoreFilter === 'low' && score >= 0 && score < 50);

    return matchesSearch && matchesScore;
  });

  const handleExport = () => {
    exportToCsv(
      `conformidade-fornecedores-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Protocolo', 'Empresa', 'CNPJ', 'Responsável', 'E-mail', 'Telefone', 'Cidade/UF', 'Índice LGPD (%)', 'Qtd Anexos', 'Data'],
      filteredSubmissions.map((q) => [
        q.protocol || '-',
        q.company_name,
        q.cnpj,
        q.contact_name,
        q.contact_email,
        q.address_json?.telefone || '-',
        [q.address_json?.cidade, q.address_json?.estado].filter(Boolean).join('/') || '-',
        q.final_score !== null ? q.final_score : '-',
        Array.isArray(q.attachments_json) ? q.attachments_json.length : 0,
        formatDateTimeBR(q.created_at),
      ])
    );
  };

  const getScoreTone = (score: number | null) => {
    if (score === null) return 'neutral';
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'Sem nota';
    if (score >= 80) return 'Adequado';
    if (score >= 50) return 'Em Adequação';
    return 'Crítico';
  };

  return (
    <div>
      <div className="toolbar-bar">
        <div className="toolbar-filters">
          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por empresa, CNPJ, protocolo ou DPO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value as any)}
            aria-label="Filtrar por nível de conformidade"
          >
            <option value="all">Todos os Índices ({submissions.length})</option>
            <option value="high">Adequado (≥ 80%)</option>
            <option value="medium">Em Adequação (50% - 79%)</option>
            <option value="low">Crítico (&lt; 50%)</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-outline-admin" onClick={handleExport}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {filteredSubmissions.length === 0 ? (
          <div className="table-empty-cell">
            Nenhum questionário de conformidade encontrado para os filtros aplicados.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Empresa / CNPJ</th>
                <th>Responsável / E-mail</th>
                <th>Índice LGPD</th>
                <th>Evidências / Documentos</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((q) => {
                const scoreVal = q.final_score !== null ? Number(q.final_score) : null;
                const attList = Array.isArray(q.attachments_json) ? q.attachments_json : [];

                return (
                  <tr key={q.id}>
                    <td>
                      <code className="slug-code">{q.protocol || '-'}</code>
                    </td>
                    <td>
                      <strong>{q.company_name}</strong>
                      <div className="table-subtext">{q.cnpj}</div>
                    </td>
                    <td>
                      <div>{q.contact_name}</div>
                      <div className="table-subtext">{q.contact_email}</div>
                    </td>
                    <td>
                      <span className={`badge-tone ${getScoreTone(scoreVal)} tabular-nums`}>
                        {scoreVal !== null ? `${scoreVal}%` : '-'} · {getScoreLabel(scoreVal)}
                      </span>
                    </td>
                    <td>
                      {attList.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#059669' }}>
                            <Paperclip size={11} style={{ verticalAlign: 'middle' }} /> {attList.length} arquivo(s)
                          </span>
                          {attList.slice(0, 2).map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="attachment-inline-link"
                              title={att.name}
                            >
                              {ATTACHMENT_FIELD_LABELS[att.fieldKey || ''] || 'Anexo'}: {att.name}
                            </a>
                          ))}
                          {attList.length > 2 && (
                            <span className="table-subtext">+{attList.length - 2} mais nos detalhes</span>
                          )}
                        </div>
                      ) : (
                        <span className="table-subtext">Nenhum anexo</span>
                      )}
                    </td>
                    <td className="tabular-nums">{formatDateBR(q.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-table-primary"
                        onClick={() => setSelectedQuiz(q)}
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: DETALHES DO QUESTIONÁRIO */}
      {selectedQuiz && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedQuiz(null)}
        >
          <div className="admin-modal-card admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="modal-protocol-badge">
                  <ClipboardCheck size={13} /> Protocolo {selectedQuiz.protocol || 'CONF'}
                </span>
                <h3>{selectedQuiz.company_name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn no-print"
                onClick={() => setSelectedQuiz(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="detail-info-grid">
                <div>
                  <small>CNPJ</small>
                  <strong>{selectedQuiz.cnpj || '-'}</strong>
                </div>
                <div>
                  <small>Responsável / DPO</small>
                  <strong>{selectedQuiz.contact_name || '-'}</strong>
                </div>
                <div>
                  <small>E-mail de Contato</small>
                  <strong>{selectedQuiz.contact_email || '-'}</strong>
                </div>
                <div>
                  <small>Índice de Conformidade LGPD</small>
                  <strong
                    style={{
                      fontSize: '1.25rem',
                      color:
                        (selectedQuiz.final_score ?? 0) >= 80
                          ? '#15803d'
                          : (selectedQuiz.final_score ?? 0) >= 50
                          ? '#b45309'
                          : '#b91c1c',
                    }}
                  >
                    {selectedQuiz.final_score !== null ? `${selectedQuiz.final_score}%` : '-'}
                  </strong>
                </div>
                {selectedQuiz.address_json?.telefone && (
                  <div>
                    <small>Telefone</small>
                    <strong>{selectedQuiz.address_json.telefone}</strong>
                  </div>
                )}
                <div>
                  <small>Data da Submissão</small>
                  <strong>{formatDateTimeBR(selectedQuiz.created_at)}</strong>
                </div>
                {selectedQuiz.address_json && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <small>Endereço Completo</small>
                    <span>
                      {[
                        selectedQuiz.address_json.rua,
                        selectedQuiz.address_json.bairro,
                        selectedQuiz.address_json.cidade,
                        selectedQuiz.address_json.estado,
                        selectedQuiz.address_json.cep,
                      ]
                        .filter(Boolean)
                        .join(' - ') || 'Não informado'}
                    </span>
                  </div>
                )}
              </div>

              {/* Evidências Anexadas */}
              <div className="detail-attachments-box success">
                <h4>
                  <CheckCircle2 size={16} /> Arquivos e Evidências Anexadas ({selectedQuiz.attachments_json?.length || 0})
                </h4>
                {selectedQuiz.attachments_json && selectedQuiz.attachments_json.length > 0 ? (
                  <div className="quiz-attachments-grid">
                    {selectedQuiz.attachments_json.map((att, idx) => (
                      <div key={idx} className="quiz-attachment-card">
                        <div style={{ minWidth: 0 }}>
                          <span className="quiz-att-field">
                            {ATTACHMENT_FIELD_LABELS[att.fieldKey || ''] || 'Evidência'}
                          </span>
                          <span className="quiz-att-name" title={att.name}>
                            {att.name}
                          </span>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline-admin"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          Baixar / Ver
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#065f46' }}>
                    Nenhum documento anexado pelo fornecedor.
                  </p>
                )}
              </div>

              {/* Respostas Detalhadas */}
              {selectedQuiz.answers_json && (
                <div>
                  <h4 style={{ margin: '0 0 12px', color: 'var(--color-primary)' }}>
                    Respostas Detalhadas ({Object.keys(selectedQuiz.answers_json).filter((k) => k.startsWith('q') && !k.includes('evidence')).length} itens)
                  </h4>
                  <div className="quiz-answers-list">
                    {Object.entries(selectedQuiz.answers_json)
                      .filter(([key]) => key.startsWith('q') && !key.includes('evidence'))
                      .map(([key, val]) => (
                        <div key={key} className="quiz-answer-item">
                          <span className="quiz-answer-key">{key.replace(/_/g, ' ')}</span>
                          <div className="quiz-answer-val">
                            {typeof val === 'string' ? val || '-' : JSON.stringify(val)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="admin-modal-actions no-print" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn-outline-admin"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Imprimir / Salvar PDF
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setSelectedQuiz(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
