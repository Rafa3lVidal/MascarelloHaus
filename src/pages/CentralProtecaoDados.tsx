import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import {
  Shield,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Download,
  Clock,
  UserCheck,
  Lock,
  Cookie,
  Sliders,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Scale,
  Building,
  HelpCircle,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CentralProtecaoDados: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'aviso' | 'termos' | 'cookies' | 'requisicao'>('info');

  // Form states
  const [formData, setFormData] = useState({
    nomeSolicitante: '',
    canalRetorno: 'E-mail',
    nomeTitular: '',
    dadoContato: '',
    descricao: '',
    contatoPrevio: '',
    tipoRequisicao: 'Confirmacao da existencia de tratamento e acesso aos dados (Art. 18, I e II)'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocolGenerated, setProtocolGenerated] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestTypes = [
    'Confirmacao da existencia de tratamento e acesso aos dados (Art. 18, I e II)',
    'Correcao de dados incompletos, inexatos ou desatualizados (Art. 18, III)',
    'Anonimizacao, bloqueio ou eliminacao de dados desnecessarios (Art. 18, IV)',
    'Portabilidade dos dados a outro fornecedor de servico (Art. 18, V)',
    'Eliminacao dos dados pessoais tratados com consentimento (Art. 18, VI)',
    'Informacao sobre compartilhamento com entidades publicas e privadas (Art. 18, VII)',
    'Revogacao do consentimento (Art. 18, IX)',
    'Outra solicitacao'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.nomeSolicitante || !formData.dadoContato || !formData.descricao) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios indicados com *.');
      return;
    }

    setIsSubmitting(true);

    try {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const protocol = `MH-LGPD-${datePart}-${randomPart}`;

      const { error } = await supabase.from('data_subject_requests').insert({
        protocol,
        requester_name: formData.nomeSolicitante,
        contact_channel: formData.canalRetorno,
        contact_info: formData.dadoContato,
        is_third_party: !!formData.nomeTitular,
        data_subject_name: formData.nomeTitular || formData.nomeSolicitante,
        request_type: formData.tipoRequisicao,
        description: formData.descricao,
        has_prior_contact: !!formData.contatoPrevio,
        prior_contact_details: formData.contatoPrevio,
        status: 'recebido'
      });

      if (error) throw error;

      setProtocolGenerated(protocol);
    } catch {
      setErrorMessage('Erro ao registrar a requisição. Por favor, tente novamente ou entre em contato pelo e-mail privacidade@mascarellohaus.adv.br.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cookiesList = [
    {
      name: 'lgpd_cookie_preferences',
      provider: 'Mascârello Haus (Próprio)',
      category: 'Necessário',
      purpose: 'Armazena a escolha de consentimento e as preferências granulares de cookies do titular.',
      retention: '12 meses'
    },
    {
      name: 'lgpd_cookie_consent',
      provider: 'Mascârello Haus (Próprio)',
      category: 'Necessário',
      purpose: 'Registro simplificado do estado de consentimento do usuário para renderização do banner.',
      retention: '12 meses'
    },
    {
      name: 'sb-auth-token / Supabase',
      provider: 'Supabase Inc.',
      category: 'Necessário',
      purpose: 'Autenticação e manutenção de sessão criptografada para acesso administrativo seguro.',
      retention: 'Persistente / Sessão'
    },
    {
      name: '_vercel_jwt / Vercel Edge',
      provider: 'Vercel Inc.',
      category: 'Necessário',
      purpose: 'Roteamento seguro na borda, mitigação de DDoS e balanceamento de tráfego global.',
      retention: 'Sessão'
    },
    {
      name: '_ga / _ga_*',
      provider: 'Google Analytics (com IP anonimizado)',
      category: 'Analítico (Opt-in)',
      purpose: 'Mensuração agregada e anônima de acessos para aprimoramento da navegação e conteúdos.',
      retention: '2 anos'
    },
    {
      name: 'mh_form_state',
      provider: 'Mascârello Haus (Próprio)',
      category: 'Funcional (Opt-in)',
      purpose: 'Preserva rascunhos de preenchimento em questionários caso o navegador seja atualizado.',
      retention: 'Sessão'
    }
  ];

  return (
    <div className="lgpd-central-page">
      <SEO
        title="Central de Proteção de Dados e Privacidade | Mascârello Haus Advocacia"
        description="Página oficial de governança, conformidade LGPD, Aviso de Privacidade, Termos de Uso e canal de atendimento aos direitos dos titulares de dados."
        canonical="https://mascarellohaus.adv.br/central-de-protecao-de-dados/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Central de Proteção de Dados</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '820px' }}>
            Transparência, governança corporativa e estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '1020px' }}>
          {/* Navegação por Abas (Tabs) */}
          <div className="tabs-nav-bar" role="tablist">
            <button
              className={`tab-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
              role="tab"
              aria-selected={activeTab === 'info'}
            >
              <Shield size={16} /> Informações & DPO
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'aviso' ? 'active' : ''}`}
              onClick={() => setActiveTab('aviso')}
              role="tab"
              aria-selected={activeTab === 'aviso'}
            >
              <FileText size={16} /> Aviso de Privacidade
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'termos' ? 'active' : ''}`}
              onClick={() => setActiveTab('termos')}
              role="tab"
              aria-selected={activeTab === 'termos'}
            >
              <Scale size={16} /> Termos de Uso
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'cookies' ? 'active' : ''}`}
              onClick={() => setActiveTab('cookies')}
              role="tab"
              aria-selected={activeTab === 'cookies'}
            >
              <Cookie size={16} /> Gestão de Cookies
            </button>
            <button
              className={`tab-nav-btn ${activeTab === 'requisicao' ? 'active' : ''}`}
              onClick={() => setActiveTab('requisicao')}
              role="tab"
              aria-selected={activeTab === 'requisicao'}
            >
              <Send size={16} /> Requisição do Titular
            </button>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className="tab-content-container">
            {/* ABA 1: INFORMAÇÕES & DPO */}
            {activeTab === 'info' && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h3 className="tab-pane-title">Governança e Direitos do Titular (LGPD)</h3>
                  <span className="badge-compliance">Lei nº 13.709/2018</span>
                </div>

                <p style={{ marginBottom: '20px', lineHeight: '1.7', color: '#4a5568' }}>
                  A <strong>Mascârello Haus Advocacia e Consultoria Jurídica</strong> adota as melhores práticas de governança em privacidade e segurança da informação. Asseguramos a todos os titulares de dados pessoais o livre exercício de seus direitos previstos no <strong>Artigo 18 da LGPD</strong>:
                </p>

                <div className="lgpd-rights-grid">
                  <div className="right-card">
                    <span className="right-num">01</span>
                    <div>
                      <strong>Confirmação e Acesso</strong>
                      <p>Saber se realizamos o tratamento de seus dados e obter cópia clara dos dados tratados.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">02</span>
                    <div>
                      <strong>Correção</strong>
                      <p>Solicitar a correção imediata de dados incompletos, inexatos ou desatualizados.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">03</span>
                    <div>
                      <strong>Anonimização ou Bloqueio</strong>
                      <p>Pedir a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">04</span>
                    <div>
                      <strong>Portabilidade</strong>
                      <p>Transferência de seus dados pessoais a outro fornecedor mediante requisição expressa.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">05</span>
                    <div>
                      <strong>Eliminação de Dados</strong>
                      <p>Exclusão dos dados tratados com base no seu consentimento, ressalvadas as hipóteses legais.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">06</span>
                    <div>
                      <strong>Informação sobre Compartilhamento</strong>
                      <p>Esclarecimentos detalhados sobre com quais entidades públicas ou privadas compartilhamos dados.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">07</span>
                    <div>
                      <strong>Informação sobre o Não Consentimento</strong>
                      <p>Conhecer as consequências caso opte por não fornecer consentimento para determinada finalidade.</p>
                    </div>
                  </div>
                  <div className="right-card">
                    <span className="right-num">08</span>
                    <div>
                      <strong>Revogação do Consentimento</strong>
                      <p>Revogar seu consentimento prévio a qualquer tempo mediante manifestação expressa e facilitada.</p>
                    </div>
                  </div>
                </div>

                {/* Card do DPO */}
                <div className="dpo-contact-card">
                  <div className="dpo-avatar-wrap">
                    <UserCheck size={36} className="dpo-icon" />
                  </div>
                  <div className="dpo-info-wrap">
                    <h4>Encarregada pelo Tratamento de Dados Pessoais (DPO)</h4>
                    <p className="dpo-role">Responsável pela comunicação entre o escritório, os titulares de dados e a ANPD</p>
                    <div className="dpo-details-list">
                      <p><strong>Encarregada Oficial:</strong> Dra. Mirâtaira Mascârello Haus (OAB/SC)</p>
                      <p><strong>Canal Exclusivo de Privacidade:</strong> <a href="mailto:privacidade@mascarellohaus.adv.br">privacidade@mascarellohaus.adv.br</a></p>
                      <p><strong>Prazo Legal de Resposta:</strong> Em até 15 (quinze) dias úteis nos termos do Art. 19 da LGPD.</p>
                      <p><strong>Suporte & Desenvolvimento Tecnológico:</strong> <a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer">ApexCode</a> (contato@apexcode.dev.br | +55 49 99928-1878)</p>
                    </div>
                  </div>
                </div>

                <div className="cta-requisicao-box">
                  <p>Deseja formalizar uma solicitação agora mesmo?</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab('requisicao')}>
                    <Send size={15} /> Abrir Formulário de Requisição de Titular
                  </button>
                </div>
              </div>
            )}

            {/* ABA 2: AVISO DE PRIVACIDADE COMPLETO */}
            {activeTab === 'aviso' && (
              <div className="tab-pane legal-doc-pane">
                <div className="tab-pane-header">
                  <div>
                    <h3 className="tab-pane-title">Aviso de Privacidade</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '0.85rem' }}>
                      Versão 2.1 — Atualizado em conformidade com a Lei nº 13.709/2018 (LGPD) e diretrizes da ANPD.
                    </p>
                  </div>
                  <span className="badge-compliance">Documento Oficial</span>
                </div>

                <div className="legal-article">
                  <h4>1. Apresentação e Identificação do Controlador</h4>
                  <p>
                    O presente Aviso de Privacidade aplica-se à <strong>Mascârello Haus Advocacia e Consultoria Jurídica</strong>, sociedade individual de advocacia devidamente inscrita na Ordem dos Advogados do Brasil, Seção de Santa Catarina (OAB/SC), com atuação nas comarcas de Videira, Caçador e região, doravante denominada simplesmente <strong>"Mascârello Haus"</strong> ou <strong>"Controlador"</strong>.
                  </p>
                  <p>
                    Este documento estabelece as regras e salvaguardas adotadas para a coleta, tratamento, armazenamento, compartilhamento e eliminação de dados pessoais de clientes, usuários do website institucional, parceiros e terceiros, demonstrando nosso compromisso inegociável com a integridade, transparência e sigilo profissional da advocacia.
                  </p>

                  <h4>2. Princípios Norteadores do Tratamento</h4>
                  <p>
                    Em todas as operações de tratamento de dados pessoais, o escritório observa estritamente os princípios elencados no Artigo 6º da LGPD: <em>Finalidade, Adequação, Necessidade (minimização), Livre Acesso, Qualidade dos Dados, Transparência, Segurança, Prevenção, Não Discriminação</em> e <em>Responsabilização e Prestação de Contas (Accountability)</em>.
                  </p>

                  <h4>3. Dados Pessoais Coletados e Formas de Coleta</h4>
                  <p>Coletamos dados estritamente necessários para o desenvolvimento de nossas atividades legítimas:</p>
                  <ul>
                    <li>
                      <strong>Dados fornecidos diretamente pelo titular:</strong> Nome completo, endereço de e-mail, telefone de contato/WhatsApp, empresa e conteúdo de mensagens ou dúvidas enviados voluntariamente através do formulário de contato, questionário de conformidade jurídica ou canal de denúncias.
                    </li>
                    <li>
                      <strong>Dados de navegação e conexão:</strong> Endereço IP, data e hora de acesso, características do dispositivo, navegador e sistema operacional, coletados em estrito cumprimento à obrigação legal imposta pelo <strong>Artigo 15 da Lei nº 12.965/2014 (Marco Civil da Internet)</strong>.
                    </li>
                    <li>
                      <strong>Cookies de navegação:</strong> Identificadores de sessão para garantir o funcionamento seguro e, mediante consentimento, cookies analíticos para mensuração de tráfego (consulte a aba <em>Gestão de Cookies</em>).
                    </li>
                  </ul>

                  <h4>4. Finalidades e Hipóteses Legais de Tratamento</h4>
                  <p>O tratamento de dados pessoais pela Mascârello Haus fundamenta-se nas seguintes bases legais do Artigo 7º da LGPD:</p>
                  <ul>
                    <li><strong>Execução de procedimentos preliminares a contrato (Art. 7º, V):</strong> Para atendimento a solicitações de contato, propostas de honorários e início de relacionamento profissional.</li>
                    <li><strong>Cumprimento de obrigação legal ou regulatória (Art. 7º, II):</strong> Para guarda de registros de conexão conforme o Marco Civil da Internet, cumprimento de exigências fiscais e normativas do Conselho Federal da OAB.</li>
                    <li><strong>Exercício regular de direitos em processo judicial, administrativo ou arbitral (Art. 7º, VI):</strong> Na representação processual e consultiva de clientes.</li>
                    <li><strong>Consentimento do titular (Art. 7º, I):</strong> Para envio de comunicações informativas, materiais educativos (cartilhas e e-books) e cookies não essenciais.</li>
                    <li><strong>Legítimo interesse do controlador (Art. 7º, IX):</strong> Para aprimoramento da segurança cibernética e mitigação de vulnerabilidades tecnológicas.</li>
                  </ul>

                  <h4>5. Compartilhamento de Dados com Operadores</h4>
                  <p>
                    A Mascârello Haus <strong>não comercializa dados pessoais sob nenhuma hipótese</strong>. O compartilhamento ocorre exclusivamente com operadores de tecnologia contratados para a sustentação da infraestrutura do site:
                  </p>
                  <ul>
                    <li><strong>Provedor de Hospedagem e Borda (Vercel Inc.):</strong> Entrega rápida, segura e proteção contra ataques DDoS com servidores em ambiente certificado.</li>
                    <li><strong>Banco de Dados Seguro (Supabase Inc. / AWS):</strong> Armazenamento criptografado de mensagens de contato, requisições de titulares e trilhas de auditoria imutáveis.</li>
                    <li><strong>Desenvolvimento e Manutenção Tecnológica:</strong> ApexCode (Rafael Vidal, CNPJ / Videira-SC), sob acordos contratuais de estrita confidencialidade e salvaguardas LGPD.</li>
                    <li><strong>Autoridades Públicas e Judiciais:</strong> Mediante ordem judicial fundamentada ou exigência legal expressa.</li>
                  </ul>

                  <h4>6. Segurança da Informação e Criptografia</h4>
                  <p>
                    Adotamos rígidas medidas técnicas e organizacionais para proteger os dados pessoais contra acessos não autorizados, incidentes de segurança, destruição acidental ou ilícita:
                  </p>
                  <ul>
                    <li>Comunicação 100% criptografada via protocolo <strong>HTTPS / TLS 1.3</strong>;</li>
                    <li>Cabeçalhos de segurança avançados (HSTS, Content Security Policy, X-Content-Type-Options, X-Frame-Options);</li>
                    <li>Criptografia de ponta a ponta e controle de acesso baseado em funções (RBAC) com o princípio do menor privilégio;</li>
                    <li>Trilhas de auditoria imutáveis para operações administrativas;</li>
                    <li>Anonimização de IPs em ferramentas estatísticas.</li>
                  </ul>

                  <h4>7. Tempo de Retenção e Descarte</h4>
                  <p>
                    Os dados pessoais serão retidos pelo período estritamente necessário para o cumprimento das finalidades para as quais foram coletados, observando os prazos legais de prescrição:
                  </p>
                  <ul>
                    <li><strong>Logs de conexão do site:</strong> Mantidos por 6 (seis) meses em cumprimento ao Art. 15 do Marco Civil da Internet.</li>
                    <li><strong>Mensagens de contato preliminar:</strong> Mantidas por até 2 (dois) anos para histórico de atendimento ou até solicitação de eliminação pelo titular.</li>
                    <li><strong>Documentos de relacionamento profissional:</strong> Mantidos por 5 (cinco) anos após o encerramento do mandato, nos termos do Código de Ética da OAB e Código Civil.</li>
                  </ul>

                  <h4>8. Canais de Atendimento e Encarregada (DPO)</h4>
                  <p>
                    Para exercer quaisquer dos seus direitos ou sanar dúvidas sobre este documento, o titular poderá acionar a Encarregada de Dados pelo e-mail <strong>privacidade@mascarellohaus.adv.br</strong> ou registrar solicitação diretamente na aba <em>Requisição do Titular</em> desta Central.
                  </p>
                </div>
              </div>
            )}

            {/* ABA 3: TERMOS DE USO COMPLETOS */}
            {activeTab === 'termos' && (
              <div className="tab-pane legal-doc-pane">
                <div className="tab-pane-header">
                  <div>
                    <h3 className="tab-pane-title">Termos de Uso do Website Institucional</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '0.85rem' }}>
                      Versão 2.0 — Regras, direitos e responsabilidades para navegação em mascarellohaus.adv.br
                    </p>
                  </div>
                  <span className="badge-compliance">Condições Gerais</span>
                </div>

                <div className="legal-article">
                  <h4>1. Objeto e Âmbito de Aplicação</h4>
                  <p>
                    Estes Termos de Uso regulam o acesso e a utilização dos serviços e conteúdos disponibilizados no endereço eletrônico <strong>https://mascarellohaus.adv.br/</strong>, mantido pela <strong>Mascârello Haus Advocacia e Consultoria Jurídica</strong>.
                  </p>
                  <p>
                    Ao acessar, navegar ou submeter informações por meio de qualquer funcionalidade deste site, o usuário declara ter lido, compreendido e aceito integralmente as presentes condições.
                  </p>

                  <h4>2. Caráter Exclusivamente Informativo dos Conteúdos</h4>
                  <p>
                    Em estrita consonância com o <strong>Código de Ética e Disciplina da OAB</strong> e o <strong>Provimento CFOAB nº 205/2021</strong>, que regulamenta a publicidade na advocacia:
                  </p>
                  <ul>
                    <li>Os artigos, cartilhas educativas, e-books, notícias e publicações veiculados neste portal possuem finalidade <strong>meramente pedagógica, informativa e institucional</strong>.</li>
                    <li>Nenhum texto, material baixável ou conteúdo publicado no website constitui parecer formal, consultoria técnica individualizada ou aconselhamento jurídico imediato.</li>
                    <li>A leitura dos materiais ou o envio de mensagens de contato <strong>não estabelece, por si só, a relação cliente-advogado</strong>, a qual somente se concretiza mediante celebração formal de instrumento de mandato e contrato de prestação de serviços advocatícios.</li>
                  </ul>

                  <h4>3. Propriedade Intelectual e Direitos Autorais</h4>
                  <p>
                    Todo o conteúdo deste website — incluindo textos autorais, cartilhas em PDF, e-books, logotipos, elementos gráficos, ícones, layout, códigos-fonte e identidade visual — é de propriedade exclusiva da Mascârello Haus ou de seus parceiros tecnológicos (ApexCode), encontrando-se protegido pela <strong>Lei nº 9.610/1998 (Lei de Direitos Autorais)</strong> e <strong>Lei nº 9.279/1996 (Propriedade Industrial)</strong>.
                  </p>
                  <p>
                    É expressamente vedada a reprodução total ou parcial, modificação, distribuição comercial, engenharia reversa ou veiculação pública dos conteúdos sem a prévia e expressa autorização por escrito dos titulares de direitos, autorizando-se unicamente o download pessoal e citação com atribuição clara da fonte e autoria.
                  </p>

                  <h4>4. Condições de Uso dos Formulários e Canal de Denúncias</h4>
                  <p>O usuário se compromete a:</p>
                  <ul>
                    <li>Fornecer dados verídicos, exatos e atualizados ao utilizar os canais de contato, questionários e requisições;</li>
                    <li>Não utilizar os formulários para disseminar conteúdo ilícito, difamatório, malicioso, vírus ou tentativas de intrusão cibernética;</li>
                    <li>Utilizar o <strong>Canal de Denúncias</strong> com estrita boa-fé para comunicação de suspeitas de irregularidades, fraudes ou desvios de conduta, ciente de que comunicações caluniosas intencionais sujeitam o emitente às sanções civis e criminais cabíveis.</li>
                  </ul>

                  <h4>5. Limitação de Responsabilidade</h4>
                  <p>A Mascârello Haus emprega os mais elevados padrões de segurança e disponibilidade da plataforma. Contudo, não se responsabiliza por:</p>
                  <ul>
                    <li>Interrupções temporárias de conectividade causadas por indisponibilidade dos provedores de internet do usuário;</li>
                    <li>Danos decorrentes de ataques de terceiros ou falhas em equipamentos do próprio usuário decorrentes de malwares alheios ao website;</li>
                    <li>Conteúdos veiculados em websites externos cujos links constem em nossa seção de <em>Links Úteis</em> (TJSC, STJ, STF, ANPD, etc.).</li>
                  </ul>

                  <h4>6. Legislação Aplicável e Foro</h4>
                  <p>
                    Os presentes Termos de Uso são regidos pelas leis da República Federativa do Brasil, em especial o Marco Civil da Internet e a LGPD. Para dirimir quaisquer litígios decorrentes deste instrumento, elege-se o <strong>Foro da Comarca de Caçador ou Videira, Estado de Santa Catarina</strong>, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
                  </p>
                </div>
              </div>
            )}

            {/* ABA 4: GESTÃO DE COOKIES & TABELA TRANSPARENTE */}
            {activeTab === 'cookies' && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h3 className="tab-pane-title">Política e Tabela de Cookies</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '0.85rem' }}>
                      Transparência ativa sobre os rastreadores utilizados de acordo com o Guia da ANPD.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-open-cookie-modal"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-preferences'))}
                  >
                    <Sliders size={16} /> Abrir Centro de Preferências
                  </button>
                </div>

                <div className="cookie-policy-text">
                  <p>
                    Cookies são pequenos arquivos de texto armazenados no dispositivo do usuário quando este visita um website. A <strong>Mascârello Haus Advocacia</strong> classifica os cookies utilizados em conformidade com as orientações técnicas da Autoridade Nacional de Proteção de Dados (ANPD):
                  </p>

                  <div className="cookie-types-grid">
                    <div className="cookie-type-card">
                      <div className="cookie-type-top">
                        <Lock size={18} color="var(--color-primary)" />
                        <strong>Estritamente Necessários</strong>
                      </div>
                      <p>
                        Indispensáveis para a segurança do tráfego, prevenção contra ataques automatizados, balanceamento na borda e gravação segura do consentimento LGPD. Não coletam dados para fins publicitários.
                      </p>
                    </div>

                    <div className="cookie-type-card">
                      <div className="cookie-type-top">
                        <Sliders size={18} color="var(--color-accent)" />
                        <strong>Analíticos e Estatísticos (Opt-in)</strong>
                      </div>
                      <p>
                        Utilizados de forma estritamente agregada e com mascaramento de IP para compreender o volume de acessos aos nossos artigos e guias. Requerem o consentimento expresso do titular.
                      </p>
                    </div>

                    <div className="cookie-type-card">
                      <div className="cookie-type-top">
                        <CheckCircle2 size={18} color="#2b6cb0" />
                        <strong>Funcionais (Opt-in)</strong>
                      </div>
                      <p>
                        Permitem lembrar preferências como preenchimentos temporários em questionários de conformidade. Não são essenciais para a navegação básica.
                      </p>
                    </div>
                  </div>

                  <h4 style={{ marginTop: '35px', marginBottom: '14px', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
                    Inventário Detalhado dos Cookies Utilizados no Website
                  </h4>

                  <div className="cookie-table-container">
                    <table className="cookie-inventory-table">
                      <thead>
                        <tr>
                          <th>Nome do Identificador</th>
                          <th>Categoria</th>
                          <th>Provedor / Origem</th>
                          <th>Finalidade Técnica</th>
                          <th>Prazo de Retenção</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cookiesList.map((c, i) => (
                          <tr key={i}>
                            <td><code>{c.name}</code></td>
                            <td>
                              <span className={`pill-badge ${c.category.includes('Necessário') ? 'req' : 'opt'}`}>
                                {c.category}
                              </span>
                            </td>
                            <td>{c.provider}</td>
                            <td>{c.purpose}</td>
                            <td><strong>{c.retention}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="cookie-revoke-info-box">
                    <Info size={22} className="info-box-icon" />
                    <div>
                      <strong>Como revogar ou alterar seu consentimento a qualquer momento:</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#4a5568' }}>
                        Nos termos do Artigo 8º, § 5º da LGPD, você pode revogar suas autorizações de cookies clicando no botão flutuante <strong>"Cookies"</strong> (canto inferior esquerdo de qualquer página) ou no link <strong>"Preferências de Cookies"</strong> presente no rodapé do portal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 5: REQUISIÇÃO DO TITULAR DE DADOS */}
            {activeTab === 'requisicao' && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h3 className="tab-pane-title">Canal de Exercício de Direitos do Titular (Art. 18 LGPD)</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '0.85rem' }}>
                      Preencha o formulário seguro para protocolar sua solicitação formal perante a nossa Encarregada de Dados.
                    </p>
                  </div>
                  <span className="badge-compliance">Protocolo Seguro</span>
                </div>

                {protocolGenerated ? (
                  <div className="protocol-success-box">
                    <CheckCircle2 size={48} style={{ color: '#276749', marginBottom: '14px' }} />
                    <h4>Requisição Protocolada com Sucesso!</h4>
                    <p style={{ color: '#4a5568', maxWidth: '600px', margin: '0 auto' }}>
                      Sua solicitação foi registrada em nosso sistema seguro de governança. Guarde o seu número de protocolo para acompanhamento:
                    </p>
                    <div className="protocol-badge">{protocolGenerated}</div>
                    <p style={{ fontSize: '0.88rem', color: '#718096', marginTop: '16px' }}>
                      Nossa Encarregada de Dados (DPO) responderá conclusivamente pelo canal de retorno indicado dentro do prazo de até 15 dias (Art. 19 da LGPD).
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setProtocolGenerated(null)}
                      style={{ marginTop: '20px' }}
                    >
                      Registrar Outra Requisição
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="lgpd-request-form">
                    {errorMessage && (
                      <div className="form-error-banner">
                        <AlertCircle size={18} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Tipo de Requisição do Titular *</label>
                      <select
                        className="form-control"
                        value={formData.tipoRequisicao}
                        onChange={(e) => setFormData({ ...formData, tipoRequisicao: e.target.value })}
                      >
                        {requestTypes.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-6">
                        <label className="form-label">Nome Completo do Solicitante *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={formData.nomeSolicitante}
                          onChange={(e) => setFormData({ ...formData, nomeSolicitante: e.target.value })}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="form-group col-6">
                        <label className="form-label">Nome do Titular dos Dados (se agir em representação)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nomeTitular}
                          onChange={(e) => setFormData({ ...formData, nomeTitular: e.target.value })}
                          placeholder="Preencha apenas se for procurador ou representante legal"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-6">
                        <label className="form-label">Canal Preferencial para Retorno *</label>
                        <div className="radio-group-wrap">
                          {['E-mail', 'Telefone / WhatsApp', 'Presencialmente'].map((opt) => (
                            <label key={opt} className="form-radio-label">
                              <input
                                type="radio"
                                name="canalRetorno"
                                checked={formData.canalRetorno === opt}
                                onChange={() => setFormData({ ...formData, canalRetorno: opt })}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="form-group col-6">
                        <label className="form-label">Dado para Contato de Retorno (E-mail ou Telefone) *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={formData.dadoContato}
                          onChange={(e) => setFormData({ ...formData, dadoContato: e.target.value })}
                          placeholder="exemplo@email.com ou (49) 99999-9999"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Descrição Pormenorizada da Solicitação *</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        required
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Descreva detalhadamente a sua solicitação ou os dados pessoais aos quais deseja ter acesso, retificar ou eliminar..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Houve contato prévio com o escritório sobre este assunto?</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.contatoPrevio}
                        onChange={(e) => setFormData({ ...formData, contatoPrevio: e.target.value })}
                        placeholder="Informe se já possui número de processo, atendimento anterior ou contato prévio (opcional)"
                      />
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="btn btn-primary btn-submit-request" disabled={isSubmitting}>
                        <Send size={16} /> {isSubmitting ? 'Registrando Protocolo...' : 'Protocolar Requisição de Titular'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Estilos CSS da Central de Proteção de Dados */}
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

        /* Abas de Navegação */
        .tabs-nav-bar {
          display: flex;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          padding: 8px;
          gap: 6px;
          margin-bottom: 30px;
          overflow-x: auto;
          border: 1px solid #edf2f7;
        }
        .tab-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .tab-nav-btn:hover {
          color: var(--color-primary);
          background: #f1f5f9;
        }
        .tab-nav-btn.active {
          background: var(--color-primary);
          color: #ffffff;
          font-weight: 600;
        }

        /* Container do Conteúdo */
        .tab-content-container {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
          padding: 40px 45px;
          border: 1px solid #edf2f7;
        }
        .tab-pane-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 18px;
          border-bottom: 1px solid #edf2f7;
        }
        .tab-pane-title {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: var(--color-primary);
          margin: 0;
        }
        .badge-compliance {
          background: #def7ec;
          color: #03543f;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Grid dos Direitos LGPD */
        .lgpd-rights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 25px 0 35px 0;
        }
        .right-card {
          display: flex;
          gap: 14px;
          background: #fafbfc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 18px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .right-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
          border-color: #cbd5e1;
        }
        .right-num {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-accent);
          flex-shrink: 0;
        }
        .right-card strong {
          display: block;
          font-size: 0.95rem;
          color: var(--color-primary);
          margin-bottom: 4px;
        }
        .right-card p {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
        }

        /* Card DPO */
        .dpo-contact-card {
          display: flex;
          gap: 22px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 5px solid var(--color-accent);
          border-radius: 10px;
          padding: 28px;
          margin-bottom: 30px;
        }
        .dpo-avatar-wrap {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(197, 168, 128, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dpo-icon {
          color: var(--color-accent);
        }
        .dpo-info-wrap h4 {
          margin: 0 0 4px 0;
          font-size: 1.15rem;
          color: var(--color-primary);
        }
        .dpo-role {
          margin: 0 0 14px 0;
          font-size: 0.85rem;
          color: #718096;
        }
        .dpo-details-list p {
          margin: 0 0 6px 0;
          font-size: 0.88rem;
          color: #334155;
        }
        .dpo-details-list a {
          color: var(--color-accent);
          font-weight: 600;
          text-decoration: underline;
        }

        .cta-requisicao-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafbfc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 20px 24px;
        }
        .cta-requisicao-box p {
          margin: 0;
          font-weight: 500;
          color: var(--color-primary);
        }

        /* Documentos Jurídicos (Aviso & Termos) */
        .legal-article {
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.8;
          text-align: justify;
        }
        .legal-article h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--color-primary);
          margin: 32px 0 12px 0;
          padding-bottom: 6px;
          border-bottom: 1px solid #edf2f7;
        }
        .legal-article p {
          margin-bottom: 16px;
        }
        .legal-article ul {
          margin: 10px 0 20px 20px;
          padding: 0;
        }
        .legal-article li {
          margin-bottom: 8px;
        }

        /* Gestão de Cookies Tab */
        .btn-open-cookie-modal {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          background: #edf2f7;
          border: 1px solid var(--color-accent);
          color: var(--color-primary);
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.84rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-open-cookie-modal:hover {
          background: var(--color-accent);
          color: #ffffff;
        }
        .cookie-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 24px 0 30px 0;
        }
        .cookie-type-card {
          background: #fafbfc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 18px;
        }
        .cookie-type-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .cookie-type-top strong {
          font-size: 0.92rem;
          color: var(--color-primary);
        }
        .cookie-type-card p {
          margin: 0;
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.5;
        }
        .cookie-table-container {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        .cookie-inventory-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.84rem;
          text-align: left;
        }
        .cookie-inventory-table th {
          background: #f8fafc;
          padding: 12px 16px;
          color: var(--color-primary);
          border-bottom: 1px solid #e2e8f0;
          font-weight: 600;
        }
        .cookie-inventory-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #edf2f7;
          color: #334155;
          vertical-align: middle;
        }
        .pill-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .pill-badge.req {
          background: #e2e8f0;
          color: #1e293b;
        }
        .pill-badge.opt {
          background: #e0f2fe;
          color: #0369a1;
        }
        .cookie-revoke-info-box {
          display: flex;
          gap: 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 18px 20px;
          align-items: flex-start;
        }
        .info-box-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        /* Formulário de Requisição */
        .lgpd-request-form {
          margin-top: 15px;
        }
        .form-row {
          display: flex;
          gap: 18px;
        }
        .col-6 {
          flex: 1;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
        }
        .form-control {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #1e293b;
          background: #ffffff;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.2);
        }
        .radio-group-wrap {
          display: flex;
          gap: 18px;
          padding-top: 8px;
        }
        .form-radio-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          color: #475569;
          cursor: pointer;
        }
        .form-submit-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .btn-submit-request {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          font-size: 0.95rem;
          font-weight: 600;
        }
        .protocol-success-box {
          background: #fafbfc;
          border: 2px dashed #bbf7d0;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
        }
        .protocol-badge {
          display: inline-block;
          background: #182c44;
          color: #c5a880;
          font-family: monospace;
          font-size: 1.35rem;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 8px;
          margin: 15px 0;
          letter-spacing: 1px;
        }
        .form-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          padding: 12px 18px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 0.88rem;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .tab-content-container {
            padding: 25px 20px;
          }
          .lgpd-rights-grid, .cookie-types-grid, .form-row {
            grid-template-columns: 1fr;
            flex-direction: column;
            gap: 12px;
          }
          .dpo-contact-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .cta-requisicao-box {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          .radio-group-wrap {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};
