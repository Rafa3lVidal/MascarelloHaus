import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { CheckCircle2, ArrowRight, Shield, Award, Users, AlertCircle, BookOpen } from 'lucide-react';

export const QuemSomos: React.FC = () => {
  return (
    <div className="about-page">
      <SEO
        title="Quem Somos | Mascârello Haus Advocacia"
        description="A Mascârello Haus Advocacia e Consultoria Jurídica, desde 2016, presta serviços consultivos e de assessoramento estratégico em Direito Civil, Empresarial, LGPD, Compliance e Previdenciário."
        canonical="https://mascarellohaus.adv.br/quem-somos/"
      />

      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Institucional</span>
          <h1 className="banner-title">O Escritório Mascârello Haus</h1>
          <p className="banner-desc">
            Apoiamos pessoas nas decisões conscientes e entregamos soluções jurídicas que transformam negócios.
          </p>
        </div>
      </div>

      {/* Seção Principal */}
      <section className="section-padding">
        <div className="container">
          <div className="about-main-grid">
            <div className="about-text-content">
              <span className="sub-heading">Trajetória e Propósito</span>
              <h2>Quem Somos</h2>
              <p>
                A <strong>Mascârello Haus Advocacia e Consultoria Jurídica</strong>, desde 2016, presta serviços consultivos e de assessoramento nas áreas do Direito Civil, Empresarial, do Trabalho e Previdenciário.
              </p>
              <p>
                Atualmente, somos um escritório dedicado a entender as necessidades e riscos de nossos clientes, em fomento da conformidade e boas práticas relacionadas à regulação do mercado, direcionado ao <strong>Compliance</strong> nas mais diversas áreas, em especial à <strong>Proteção de Dados</strong>.
              </p>
              <p>
                Por meio de equipe multidisciplinar, orienta e desenvolve estratégias que atendam aspectos regulamentares, de governança corporativa e de segurança da informação, em respeito à metodologia aplicável a cada segmento.
              </p>
              <p>
                De maneira proativa, também atua nas organizações da sociedade civil em projetos sociais e na <strong>Advocacia Pro Bono</strong>.
              </p>
              <p>
                O foco da Mascârello Haus está na expectativa de resultado do cliente e na busca contínua pela excelência na prestação dos serviços, promovendo a facilitação dos processos de adequação às normas vigentes em prol da integridade e proteção, pois são fatores determinantes no crescimento sustentável dos negócios.
              </p>
              <div style={{ marginTop: '25px' }}>
                <Link to="/contato/" className="btn btn-primary">
                  Entrar em Contato <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Caixa de Diferenciais */}
            <div className="differential-box">
              <span className="sub-heading">Por que nos escolher</span>
              <h3>Nosso Diferencial</h3>
              <p>
                É o nosso método de trabalho que compõe o atendimento personalizado, integração das partes interessadas e apresentação dos resultados em atenção às tendências do mercado e de novos modelos de negócios.
              </p>
              <p>
                Acompanhamos as evoluções no mundo do direito, da tecnologia e os projetos criativos de nossos clientes. Desenvolvemos o olhar estratégico tanto para dentro quanto para fora, com o objetivo de criar e implementar soluções integradas que impactam toda a cadeia de valor e auxiliam na tomada de decisões com segurança.
              </p>

              <div className="triad-list">
                <div className="triad-item">
                  <strong>Propósito:</strong> Desenvolver estratégias para a conformidade e proteção jurídica, auxiliando pessoas na tomada de decisões.
                </div>
                <div className="triad-item">
                  <strong>Visão de Futuro:</strong> Ser referência no segmento, reconhecidos pela confiança, inovação e eficiência.
                </div>
                <div className="triad-item">
                  <strong>Valores:</strong> Excelência, Transparência, Integridade e Compromisso inabalável com as partes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Código de Conduta e Canal de Denúncias */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="compliance-row">
            <div className="compliance-card">
              <div className="compliance-icon">
                <BookOpen size={30} />
              </div>
              <h3>Código de Conduta</h3>
              <p>
                O Código de Conduta é o documento que dispõe sobre os direitos e deveres de todos os membros do Mascârello Haus Advocacia e Consultoria Jurídica. Serve como guia que, juntamente aos exemplos da alta administração, norteia as práticas éticas e legais nas relações cotidianas.
              </p>
              <Link to="/codigo-de-conduta/" className="btn btn-primary" style={{ marginTop: '15px' }}>
                Ler Código de Conduta <ArrowRight size={16} />
              </Link>
            </div>

            <div className="compliance-card">
              <div className="compliance-icon">
                <AlertCircle size={30} />
              </div>
              <h3>Canal de Denúncias</h3>
              <p>
                Disponibilizamos às partes interessadas uma ferramenta segura e independente para reportar potenciais vulnerabilidades, infrações éticas, descumprimento de procedimentos ou condutas em desacordo com nossas políticas, com garantia total de anonimato.
              </p>
              <Link to="/canal-de-denuncias/" className="btn btn-primary" style={{ marginTop: '15px' }}>
                Acessar Canal de Denúncias <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-main-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 60px;
          align-items: flex-start;
        }
        .about-text-content p {
          color: var(--color-text-muted);
          font-size: 1.05rem;
          line-height: 1.7;
          margin-bottom: 18px;
        }
        .differential-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-accent);
          border-radius: 6px;
          padding: 35px 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .differential-box h3 {
          font-size: 1.6rem;
          margin-bottom: 15px;
        }
        .differential-box p {
          color: var(--color-text-muted);
          font-size: 0.98rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .triad-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          border-top: 1px solid #edf2f7;
          padding-top: 20px;
        }
        .triad-item {
          font-size: 0.92rem;
          color: var(--color-primary);
          line-height: 1.5;
        }
        .compliance-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .compliance-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 40px 35px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        .compliance-icon {
          color: var(--color-accent);
          margin-bottom: 18px;
        }
        .compliance-card h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
        }
        .compliance-card p {
          color: var(--color-text-muted);
          font-size: 0.98rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .about-main-grid, .compliance-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
