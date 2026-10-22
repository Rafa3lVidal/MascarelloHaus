import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import {
  ShieldCheck,
  Scale,
  Lock,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileText,
  HeartHandshake,
  ExternalLink
} from 'lucide-react';

export const CodigoConduta: React.FC = () => {
  return (
    <div className="code-of-conduct-page">
      <SEO
        title="Código de Conduta e Ética | Mascârello Haus Advocacia"
        description="Conheça as diretrizes éticas, princípios de integridade, sigilo profissional e compliance que regem a atuação da Mascârello Haus Advocacia."
        canonical="https://mascarellohaus.adv.br/codigo-de-conduta/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Código de Conduta e Ética</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '820px' }}>
            Diretrizes de integridade, sigilo profissional e boas práticas que orientam todas as nossas decisões, relações institucionais e serviços jurídicos.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '980px' }}>
          {/* Apresentação Institucional */}
          <div className="conduct-intro-card">
            <div className="conduct-intro-text">
              <span className="badge-ethics">Programa de Integridade & Compliance</span>
              <h2>Compromisso Inegociável com a Ética e a Legalidade</h2>
              <p>
                O <strong>Código de Conduta da Mascârello Haus Advocacia e Consultoria Jurídica</strong> é o documento orientador que estabelece os direitos, deveres e princípios fundamentais que devem ser observados por todos os nossos sócios, advogados associados, colaboradores, prestadores de serviços e parceiros estratégicos.
              </p>
              <p>
                Juntamente com o exemplo e a liderança da alta administração, este Código consolida nossa postura corporativa preventiva e transparente, disseminando uma sólida cultura de conformidade legal, respeito mútuo e excelência técnica rumo ao crescimento sustentável.
              </p>
            </div>
          </div>

          {/* Os 4 Pilares da Conduta Ética */}
          <div className="conduct-pillars-section">
            <h3 className="section-subtitle-center">Pilares Fundamentais de Nossa Atuação</h3>
            <p className="section-subtext-center">
              Construídos sobre os valores da transparência, responsabilidade sociojurídica e justiça.
            </p>

            <div className="pillars-grid">
              {/* Pilar 1 */}
              <div className="pillar-card">
                <div className="pillar-icon-box">
                  <Lock size={26} />
                </div>
                <h4>1. Sigilo Profissional e Confidencialidade</h4>
                <p>
                  O segredo profissional é dogma sagrado e dever indeclinável da advocacia (Art. 35 do Código de Ética e Disciplina da OAB). Salvaguardamos com absoluta discrição todas as informações, segredos comerciais e dados pessoais a que temos acesso em razão do exercício profissional.
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="pillar-card">
                <div className="pillar-icon-box">
                  <Scale size={26} />
                </div>
                <h4>2. Anticorrupção e Prevenção de Conflitos</h4>
                <p>
                  Adotamos tolerância zero com qualquer ato de corrupção, suborno ou obtenção de vantagens indevidas, em estrita observância à <strong>Lei Anticorrupção (Lei nº 12.846/2013)</strong>. Zelamos pela identificação e mitigação prévia de qualquer potencial conflito de interesses.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="pillar-card">
                <div className="pillar-icon-box">
                  <HeartHandshake size={26} />
                </div>
                <h4>3. Dignidade, Diversidade e Respeito Mútuo</h4>
                <p>
                  Promovemos um ambiente de trabalho inclusivo, cooperativo e humanizado. Não toleramos qualquer forma de discriminação — seja por gênero, raça, credo, orientação sexual ou origem —, tampouco atos de assédio moral ou sexual, combatidos com rigor institucional.
                </p>
              </div>

              {/* Pilar 4 */}
              <div className="pillar-card">
                <div className="pillar-icon-box">
                  <ShieldCheck size={26} />
                </div>
                <h4>4. Governança em Dados e Segurança</h4>
                <p>
                  Garantimos que todas as ferramentas tecnológicas e rotinas do escritório estejam em conformidade com as melhores práticas de cibersegurança e com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)</strong>, protegendo a privacidade de todos os titulares.
                </p>
              </div>
            </div>
          </div>

          {/* Diretriz de Não Retaliação a Denunciantes */}
          <div className="conduct-protection-card">
            <div className="protection-icon-col">
              <AlertTriangle size={36} color="var(--color-accent)" />
            </div>
            <div className="protection-text-col">
              <h4>Garantia Absoluta de Não Retaliação ao Denunciante de Boa-Fé</h4>
              <p>
                Como superar o medo e o estigma da denúncia? Proporcionando um canal facilitado, sigiloso e com opção expressa de anonimato. A Mascârello Haus proíbe categoricamente qualquer forma de represália, penalidade ou discriminação contra denunciantes que relatem suspeitas de boa-fé ou colaborem com apurações internas.
              </p>
              <p>
                As informações enviadas são tratadas com sigilo absoluto, e as averiguações seguem procedimentos imparciais, garantindo o contraditório e a ampla defesa aos envolvidos.
              </p>
            </div>
          </div>

          {/* Destaque para o Canal de Denúncias */}
          <div className="conduct-cta-box">
            <div className="conduct-cta-content">
              <ShieldCheck size={42} className="conduct-cta-shield" />
              <div>
                <h3>Presenciou ou suspeita de alguma conduta contrária aos nossos valores?</h3>
                <p>
                  Colaboradores, clientes, parceiros comerciais e qualquer cidadão contam com um canal seguro, confidencial e independente para relatar suspeitas de fraudes, assédio, descumprimento legal ou desvios ao nosso Código de Conduta.
                </p>
              </div>
            </div>

            <div className="conduct-cta-actions">
              <Link to="/canal-de-denuncias/" className="btn-go-whistleblower">
                Acessar o Canal de Denúncias <ArrowRight size={16} />
              </Link>
              <Link to="/central-de-protecao-de-dados/" className="btn-go-privacy">
                Ver Central de Privacidade & LGPD
              </Link>
            </div>
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

        .conduct-intro-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 40px 45px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.04);
          border: 1px solid #edf2f7;
          margin-bottom: 45px;
        }
        .badge-ethics {
          display: inline-block;
          background: rgba(197, 168, 128, 0.15);
          color: var(--color-primary);
          border: 1px solid var(--color-accent);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 15px;
        }
        .conduct-intro-text h2 {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          color: var(--color-primary);
          margin: 0 0 16px 0;
          line-height: 1.3;
        }
        .conduct-intro-text p {
          font-size: 1rem;
          line-height: 1.8;
          color: #4a5568;
          margin-bottom: 14px;
          text-align: justify;
        }

        .conduct-pillars-section {
          margin-bottom: 45px;
        }
        .section-subtitle-center {
          text-align: center;
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: var(--color-primary);
          margin: 0 0 8px 0;
        }
        .section-subtext-center {
          text-align: center;
          font-size: 0.95rem;
          color: #718096;
          margin: 0 0 35px 0;
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }
        .pillar-card {
          background: #ffffff;
          border: 1px solid #edf2f7;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pillar-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1;
        }
        .pillar-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          background: #182c44;
          color: #c5a880;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .pillar-card h4 {
          font-family: var(--font-serif);
          font-size: 1.18rem;
          color: var(--color-primary);
          margin: 0 0 12px 0;
        }
        .pillar-card p {
          font-size: 0.9rem;
          line-height: 1.65;
          color: #4a5568;
          margin: 0;
          text-align: justify;
        }

        .conduct-protection-card {
          display: flex;
          gap: 24px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 5px solid var(--color-accent);
          border-radius: 10px;
          padding: 32px;
          margin-bottom: 45px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .protection-icon-col {
          flex-shrink: 0;
          padding-top: 4px;
        }
        .protection-text-col h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: var(--color-primary);
          margin: 0 0 10px 0;
        }
        .protection-text-col p {
          font-size: 0.92rem;
          line-height: 1.7;
          color: #4a5568;
          margin: 0 0 10px 0;
          text-align: justify;
        }

        .conduct-cta-box {
          background: linear-gradient(135deg, #182c44 0%, #0d1e30 100%);
          border-radius: 12px;
          padding: 40px 45px;
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(24, 44, 68, 0.2);
        }
        .conduct-cta-content {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 25px;
        }
        .conduct-cta-shield {
          color: var(--color-accent);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .conduct-cta-content h3 {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: #ffffff;
          margin: 0 0 10px 0;
          line-height: 1.35;
        }
        .conduct-cta-content p {
          font-size: 0.95rem;
          color: #e2e8f0;
          line-height: 1.6;
          margin: 0;
        }
        .conduct-cta-actions {
          display: flex;
          gap: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          padding-top: 25px;
        }
        .btn-go-whistleblower {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-accent);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.92rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-go-whistleblower:hover {
          background: #b5956a;
        }
        .btn-go-privacy {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-go-privacy:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-color: #ffffff;
        }

        @media (max-width: 768px) {
          .conduct-intro-card {
            padding: 25px 20px;
          }
          .pillars-grid {
            grid-template-columns: 1fr;
          }
          .conduct-protection-card {
            flex-direction: column;
            padding: 24px 20px;
          }
          .conduct-cta-box {
            padding: 30px 20px;
          }
          .conduct-cta-content {
            flex-direction: column;
            gap: 15px;
          }
          .conduct-cta-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
