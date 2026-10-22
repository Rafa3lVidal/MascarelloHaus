import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowRight, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react';

export const QuemSomos: React.FC = () => {
  return (
    <div className="quem-somos-page">
      <SEO
        title="Quem Somos | Mascârello Haus Advocacia"
        description="A Mascârello Haus Advocacia e Consultoria Jurídica, desde 2016, presta serviços consultivos e de assessoramento estratégico em Direito Civil, Empresarial, LGPD, Compliance e Previdenciário."
        canonical="https://mascarellohaus.adv.br/quem-somos/"
      />

      {/* 1. TOPO / BANNER DA PÁGINA */}
      <section className="qs-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="qs-page-title">O escritório Mascârello Haus</h1>
        </div>
      </section>

      {/* 2. QUEM SOMOS COM FOTO OFICIAL */}
      <section className="qs-section-intro">
        <div className="container">
          <div className="qs-intro-grid">
            <div className="qs-intro-text">
              <div className="gold-divider"></div>
              <h2 className="qs-section-title">Quem somos</h2>
              <div className="qs-paragraphs">
                <p>
                  A Mascârello Haus Advocacia e Consultoria Jurídica, desde 2016, presta serviços consultivos e de assessoramento nas áreas do Direito Civil, Empresarial, do Trabalho e Previdenciário.
                </p>
                <p>
                  Atualmente, é um escritório dedicado a entender às necessidades e riscos, em fomento da conformidade e boas práticas relacionadas a regulação do mercado, direcionado ao Compliance nas mais diversas áreas, em especial à Proteção de Dados. Por meio de equipe multidisciplinar, orienta e desenvolve estratégias que atendam aspectos regulamentares, de governança corporativa e de segurança da informação, em respeito à metodologia aplicável a cada segmento.
                </p>
                <p>
                  De maneira proativa também atua nas organizações da sociedade civil em projetos sociais e Advocacia Pro Bono.
                </p>
                <p>
                  O foco da Mascârello Haus está na expectativa de resultado do cliente. E, na busca contínua pela excelência na prestação dos serviços, promovendo a facilitação dos processos de adequação às normas vigentes em prol da integridade e proteção, pois são fatores que contribuem na melhoria e crescimento dos negócios.
                </p>
              </div>
            </div>

            <div className="qs-intro-photo">
              <div className="photo-shadow-box">
                <img
                  src="/assets/0765_0289-1-scaled.jpg"
                  alt="Mascârello Haus Advocacia"
                  className="qs-photo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPÓSITO, VISÃO DE FUTURO, VALORES */}
      <section className="qs-section-triad">
        <div className="container">
          <div className="triad-cards-row">
            {/* Propósito */}
            <div className="triad-card">
              <div className="triad-icon-wrap">
                <img src="/assets/goal-svgrepo-com.png" alt="Propósito" className="triad-icon-img" />
              </div>
              <h3 className="triad-card-title">Propósito</h3>
              <p className="triad-card-desc">
                Apoiar pessoas nas decisões conscientes e entregar soluções que transformam negócios.
              </p>
            </div>

            {/* Visão de Futuro */}
            <div className="triad-card">
              <div className="triad-icon-wrap">
                <img src="/assets/vision-svgrepo-com.png" alt="Visão de Futuro" className="triad-icon-img" />
              </div>
              <h3 className="triad-card-title">Visão de Futuro</h3>
              <p className="triad-card-desc">
                Estar entre os principais escritórios e ser referência na prestação de serviços jurídicos e de conformidade no Brasil.
              </p>
            </div>

            {/* Valores */}
            <div className="triad-card">
              <div className="triad-icon-wrap">
                <img src="/assets/hands-holding-heart-svgrepo-com.png" alt="Valores" className="triad-icon-img" />
              </div>
              <h3 className="triad-card-title">Valores</h3>
              <p className="triad-card-desc">
                Ética, responsabilidade, integridade, transparência e respeito nas relações humanas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NOSSO DIFERENCIAL COM INFOGRÁFICO 3BOLAS.PNG */}
      <section className="qs-section-diferencial">
        <div className="container">
          <div className="diferencial-grid">
            <div className="diferencial-text">
              <div className="gold-divider"></div>
              <h2 className="qs-section-title">Nosso Diferencial</h2>
              <div className="qs-paragraphs">
                <p>
                  É o nosso método de trabalho que compõe o atendimento personalizado, integração das partes interessadas e apresentação dos resultados em atenção às tendências do mercado e de novos modelos de negócios.
                </p>
                <p>
                  Acompanhamos as evoluções no mundo do direito, da tecnologia e os projetos criativos de nossos clientes. Desenvolvemos o olhar estratégico tanto para dentro quanto para fora, com o objetivo de criar e implementar soluções integradas que impactam toda a cadeia de valor e auxiliam na tomada de decisões com segurança.
                </p>
              </div>
            </div>

            <div className="diferencial-img-col">
              <img
                src="/assets/3bolas.png"
                alt="Nosso Diferencial"
                className="diferencial-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CÓDIGO DE CONDUTA COM IMAGEM ORIGINAL */}
      <section className="qs-section-conduta">
        <div className="container">
          <div className="conduta-grid">
            <div className="conduta-img-col">
              <img
                src="/assets/codigo-conduta-1.png"
                alt="Código de Conduta"
                className="conduta-img"
              />
            </div>

            <div className="conduta-text-col">
              <span className="conduta-badge">Conheça o nosso</span>
              <h2 className="qs-section-title">Código de Conduta</h2>
              <div className="conduta-pillars">
                <div className="conduta-pillar-box">
                  <h4>O QUE É?</h4>
                  <p>
                    O Código de Conduta é o documento que dispõe sobre os direitos e deveres de todos os membros do Mascârello Haus Advocacia e Consultoria Jurídica.
                  </p>
                </div>
                <div className="conduta-pillar-box">
                  <h4>O QUE REGE?</h4>
                  <p>
                    Serve como guia que, juntamente aos exemplos da alta administração, norteia as práticas éticas e legais nas relações cotidianas da nossa equipe e parceiros.
                  </p>
                </div>
                <div className="conduta-pillar-box highlight">
                  <h4>CANAL DE DENÚNCIAS</h4>
                  <p>
                    Disponibilizamos um canal independente e sigiloso para relato de quaisquer desvios, com garantia de integridade e não retaliação.
                  </p>
                </div>
              </div>
              <div className="conduta-actions">
                <Link to="/codigo-de-conduta/" className="btn-gold-solid">
                  Ver Código Completo
                </Link>
                <Link to="/canal-de-denuncias/" className="btn-outline-dark">
                  Canal de Denúncias <ArrowRight size={16} />
                </Link>
              </div>
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
        .qs-page-title {
          font-family: var(--font-serif);
          font-size: 2.8rem;
          color: var(--color-primary);
          text-align: center;
          margin-bottom: 0;
        }
        .qs-header-banner {
          background-color: var(--color-bg-light);
          padding: 60px 0 50px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .qs-section-intro {
          padding: 80px 0;
          background-color: #ffffff;
        }
        .qs-intro-grid {
          display: grid;
          grid-template-columns: 55% 45%;
          gap: 50px;
          align-items: center;
        }
        .qs-section-title {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--color-primary);
          margin-bottom: 20px;
        }
        .qs-paragraphs {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-text-main);
          line-height: 1.75;
          text-align: justify;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .photo-shadow-box {
          display: flex;
          justify-content: center;
        }
        .qs-photo {
          width: 100%;
          max-width: 440px;
          height: auto;
          border-radius: 6px;
          box-shadow: 25px 25px 0px 0px var(--color-primary);
        }
        .qs-section-triad {
          background-color: var(--color-primary);
          padding: 85px 0;
        }
        .triad-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }
        .triad-card {
          background-color: var(--color-bg-light);
          padding: 30px 22px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        .triad-icon-wrap {
          width: 55px;
          height: 55px;
          margin: 0 auto 18px auto;
        }
        .triad-icon-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .triad-card-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--color-primary);
          margin-bottom: 12px;
        }
        .triad-card-desc {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: var(--color-text-main);
          line-height: 1.6;
        }
        .qs-section-diferencial {
          background-color: var(--color-bg-light);
          padding: 85px 0;
        }
        .diferencial-grid {
          display: grid;
          grid-template-columns: 50% 50%;
          gap: 40px;
          align-items: center;
        }
        .diferencial-img-col {
          text-align: center;
        }
        .diferencial-img {
          width: 85%;
          max-width: 440px;
          height: auto;
        }
        .qs-section-conduta {
          background-color: #ffffff;
          padding: 85px 0;
        }
        .conduta-grid {
          display: grid;
          grid-template-columns: 42% 58%;
          gap: 50px;
          align-items: center;
        }
        .conduta-img-col {
          text-align: center;
        }
        .conduta-img {
          width: 85%;
          max-width: 400px;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(13, 55, 50, 0.1);
        }
        .conduta-badge {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent);
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
        }
        .conduta-pillars {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 25px 0 30px 0;
        }
        .conduta-pillar-box {
          background-color: var(--color-bg-light);
          padding: 16px 20px;
          border-radius: 6px;
          border-left: 4px solid var(--color-primary);
        }
        .conduta-pillar-box.highlight {
          border-left-color: var(--color-accent);
        }
        .conduta-pillar-box h4 {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          color: var(--color-primary);
          margin-bottom: 5px;
        }
        .conduta-pillar-box p {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          color: var(--color-text-main);
          line-height: 1.5;
          margin-bottom: 0;
        }
        .conduta-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .btn-gold-solid {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-accent);
          color: #ffffff;
          padding: 12px 30px;
          border-radius: 50px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: all 0.3s ease;
        }
        .btn-gold-solid:hover {
          background-color: var(--color-primary);
          color: #ffffff;
        }
        .btn-outline-dark {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 2px solid var(--color-primary);
          background-color: transparent;
          color: var(--color-primary);
          padding: 12px 30px;
          border-radius: 50px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: all 0.3s ease;
        }
        .btn-outline-dark:hover {
          background-color: var(--color-primary);
          color: #ffffff;
        }

        @media (max-width: 992px) {
          .qs-intro-grid, .diferencial-grid, .conduta-grid {
            grid-template-columns: 1fr;
          }
          .triad-cards-row {
            grid-template-columns: 1fr;
          }
          .qs-photo {
            box-shadow: 15px 15px 0px 0px var(--color-primary);
          }
        }
      `}</style>
    </div>
  );
};
