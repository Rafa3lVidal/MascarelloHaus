import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ChevronRight, Heart, Users } from 'lucide-react';

export const AreasDeAtuacao: React.FC = () => {
  const practiceAreas = [
    {
      title: 'Compliance',
      slug: 'compliance',
      desc: 'Compliance significa estar em conformidade com as normas aplicáveis ao negócio. Mascârello Haus promove a avaliação e o diagnóstico do ambiente de negócios. Bem como, o sistema regulatório que envolve a atividade da empresa.'
    },
    {
      title: 'Direito Digital e tecnologia',
      slug: 'direito-digital-e-tecnologia',
      desc: 'Contempla tanto a atuação contenciosa quanto consultiva, desta área cada vez mais demandada na era da informação, por meio de conjunto de normas, aplicações, conhecimentos e regulação das relações jurídicas realizadas no meio digital.'
    },
    {
      title: 'Proteção de Dados (LGPD)',
      slug: 'protecao-de-dados-lgpd',
      desc: 'Nossa atuação se dá por meio dos modelos de mentoria, consultoria e assessoria, os quais facilitam a adequação personalizada, auxiliando empresas na proteção e conformidade com as normas legais relacionadas à proteção de dados e privacidade.'
    },
    {
      title: 'Direito do Trabalho',
      slug: 'direito-do-trabalho',
      desc: 'Atuação na gestão preventiva para gerenciamento de riscos e passivos trabalhistas, contratos trabalhistas, liquidações de sentença e cálculos de liquidação trabalhista. Também atua em questões que afetam o cotidiano das empresas, tanto no âmbito individual como coletivo.'
    },
    {
      title: 'Direito Previdenciário',
      slug: 'direito-previdenciario',
      desc: 'Contamos com equipe e parceiros especializados no Planejamento e Assessoria de aposentadoria e benefícios junto ao INSS, com foco em informações cruciais para os segurados do INSS que almejam o melhor desfecho para os seus benefícios.'
    },
    {
      title: 'Direito Civil e Empresarial',
      slug: 'direito-civil-e-empresarial',
      desc: 'Prestamos serviços na proteção e defesa dos interesses das pessoas e organizações, em caráter preventivo e contencioso, nos ramos do Direito Civil e Empresarial. Nosso foco é apoiar as empresas em todas as rotinas relacionadas ao direito empresarial.'
    }
  ];

  return (
    <div className="practice-areas-page">
      <SEO
        title="Nossas áreas de atuação | Mascârello Haus Advocacia"
        description="Todas as áreas envolvem serviços de Advocacia, consultoria e assessoria jurídica. Compliance, Direito Digital, LGPD, Direito Civil, Empresarial, Trabalho e Previdenciário."
        canonical="https://mascarellohaus.adv.br/areas-de-atuacao/"
      />

      {/* Header Banner */}
      <section className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Nossas áreas de atuação</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto' }}>
            Todas as áreas envolvem serviços de Advocacia, consultoria e assessoria jurídica.
          </p>
        </div>
      </section>

      {/* Seção das Soluções Personalizadas */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-intro-box">
            <h2 className="section-title text-center">Conheça as nossas soluções personalizadas</h2>
            <p className="intro-text text-center">
              A Mascârello Haus oferece recursos especializados, por meio do exercício da advocacia sistêmica de seus profissionais. De maneira preventiva, atua na solução de problemas nas esferas pessoal e corporativa, a fim de mitigar riscos e possibilitar a solução humanizada de conflitos judiciais e extrajudiciais.
            </p>
          </div>

          <div className="practice-cards-grid">
            {practiceAreas.map((area) => (
              <div key={area.slug} className="practice-area-card">
                <h3 className="area-title">{area.title}</h3>
                <p className="area-desc">{area.desc}</p>
                <Link to={`/${area.slug}/`} className="area-link">
                  Ver mais <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção: Nosso Ativismo */}
      <section className="section-padding ativismo-section">
        <div className="container">
          <div className="ativismo-header text-center">
            <div className="gold-divider center"></div>
            <h2 className="section-title">Nosso Ativismo</h2>
          </div>

          <div className="ativismo-grid">
            <div className="ativismo-card">
              <div className="ativismo-icon">
                <Heart size={36} />
              </div>
              <h3>Direito da Mulher</h3>
              <p>
                Acreditamos na capacidade feminina de conquistar e buscamos promover e ocupar, por nossos próprios méritos lugares de destaque na sociedade. Assim impulsionamos a conscientização de seus direitos e deveres, permitindo que as mulheres sejam protagonistas de suas próprias histórias.
              </p>
            </div>

            <div className="ativismo-card">
              <div className="ativismo-icon">
                <Users size={36} />
              </div>
              <h3>Direito das pessoas com deficiência</h3>
              <p>
                O preconceito, a discriminação e o desrespeito aos direitos das pessoas com deficiência ainda estão na sociedade e cabe a nós o enfrentamento a essa dura realidade.
              </p>
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
        .section-title {
          font-family: var(--font-serif);
          font-size: 2.3rem;
          color: var(--color-primary);
          margin-bottom: 20px;
        }
        .section-intro-box {
          max-width: 860px;
          margin: 0 auto 50px auto;
        }
        .intro-text {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          color: var(--color-text-main);
          line-height: 1.7;
        }
        .practice-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .practice-area-card {
          background-color: #ffffff;
          padding: 35px 28px;
          border-radius: 8px;
          border-left: 4px solid var(--color-accent);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .practice-area-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(13, 55, 50, 0.08);
        }
        .area-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: var(--color-primary);
          margin-bottom: 14px;
        }
        .area-desc {
          font-family: var(--font-sans);
          font-size: 0.92rem;
          color: var(--color-text-main);
          line-height: 1.65;
          text-align: justify;
          margin-bottom: 20px;
        }
        .area-link {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: auto;
          transition: color 0.2s ease;
        }
        .area-link:hover {
          color: var(--color-primary);
        }
        .ativismo-section {
          background-color: #ffffff;
        }
        .ativismo-header {
          margin-bottom: 45px;
        }
        .ativismo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .ativismo-card {
          background-color: var(--color-bg-light);
          padding: 40px 32px;
          border-radius: 12px;
          border-top: 4px solid var(--color-accent);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
        }
        .ativismo-icon {
          color: var(--color-accent);
          margin-bottom: 16px;
        }
        .ativismo-card h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: var(--color-primary);
          margin-bottom: 14px;
        }
        .ativismo-card p {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-text-main);
          line-height: 1.7;
          text-align: justify;
        }
        @media (max-width: 992px) {
          .practice-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ativismo-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 650px) {
          .practice-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
