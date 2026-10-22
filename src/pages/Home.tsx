import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ChevronRight, ChevronLeft, ArrowRight, Quote } from 'lucide-react';

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      bgImage: '/assets/fundos-slides-1.png',
      title: 'Para um novo mundo, novas estratégias.',
      subtitle: 'Apoiamos pessoas nas decisões conscientes e entregamos soluções que transformam negócios.',
      btnText: 'CONHEÇA O ESCRITÓRIO',
      btnLink: '#sobre',
      isAnchor: true
    },
    {
      id: 2,
      bgImage: '/assets/fundos-slides-3.png',
      title: 'Para uma nova realidade, novas soluções jurídicas.',
      subtitle: 'Apoiamos pessoas nas decisões conscientes e entregamos soluções que transformam negócios.',
      btnText: 'CONHEÇA O ESCRITÓRIO',
      btnLink: '#sobre',
      isAnchor: true
    },
    {
      id: 3,
      bgImage: '/assets/banner-ebooks-3.png',
      title: 'Conheça os nossos artigos, cartilhas e publicações.',
      subtitle: '',
      btnText: 'ACESSAR',
      btnLink: '/artigos-e-publicacoes/',
      isAnchor: false
    }
  ];

  const practiceCards = [
    {
      title: 'Compliance',
      slug: 'compliance',
      desc: 'Compliance significa estar em conformidade com as normas aplicáveis ao negócio. Mascârello Haus promove a avaliação e o diagnóstico do ambiente de negócios.'
    },
    {
      title: 'Direito Digital e Tecnologia',
      slug: 'direito-digital-e-tecnologia',
      desc: 'Mascârello Haus contempla tanto a atuação contenciosa quanto consultiva, por meio de conjunto de normas, aplicações, conhecimentos e regulação das relações jurídicas realizadas no meio digital.'
    },
    {
      title: 'Direito Previdenciário',
      slug: 'direito-previdenciario',
      desc: 'Contamos com equipe e parceiros especializados no Planejamento e Assessoria de aposentadoria e benefícios junto ao INSS, com foco em informações cruciais para os segurados do INSS que almejam o melhor desfecho para os seus benefícios.'
    },
    {
      title: 'Proteção de Dados (LGPD)',
      slug: 'protecao-de-dados-lgpd',
      desc: 'Nossa atuação se dá por meio dos modelos de mentoria, consultoria e assessoria na área de interesse do cliente, os quais facilitam a adequação personalizada, auxiliando empresas na proteção e conformidade com as normas legais relacionadas à proteção de dados e privacidade.'
    },
    {
      title: 'Direito do Trabalho',
      slug: 'direito-do-trabalho',
      desc: 'Atua na gestão preventiva para gerenciamento de riscos e passivos trabalhistas, pois possui expertise em contratos trabalhistas e liquidações de sentença e cálculos de liquidação trabalhista.'
    },
    {
      title: 'Direito Civil e Empresarial',
      slug: 'direito-civil-e-empresarial',
      desc: 'Prestamos serviços na proteção e defesa dos interesses das pessoas e organizações, em caráter preventivo e contencioso, nos ramos do Direito Civil e Empresarial.'
    }
  ];

  const testimonials = [
    {
      name: 'Flávia',
      text: 'É admirável a maneira como o escritório de advocacia se destaca por sua ética profissional e competência, oferecendo orientações legais precisas e estratégias inovadoras.'
    },
    {
      name: 'Maria Helena',
      text: 'É notável o compromisso do escritório de advocacia em defender os interesses de seus clientes com paixão e integridade.'
    },
    {
      name: 'Marcelo',
      text: 'Sua equipe de advogados altamente qualificados demonstra uma profunda expertise e dedicação aos clientes, garantindo soluções jurídicas eficientes e personalizadas.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="home-page-wrapper">
      <SEO
        title="Mascârello Haus Advocacia | Para um novo mundo, novas estratégias."
        description="Sociedade de Advogados focada em Direito Digital, LGPD, Compliance, Direito Empresarial, Civil, Trabalhista e Previdenciário."
      />

      {/* SEÇÃO 1 & 2: HERO SLIDER COM EXATOS FUNDOS E TIPOGRAFIA */}
      <section
        className="elementor-hero-slider"
        style={{
          backgroundImage: `url(${heroSlides[currentSlide].bgImage})`,
          backgroundColor: '#0d3732'
        }}
      >
        <div className="hero-slide-overlay"></div>
        <div className="container hero-container">
          <div className="hero-slide-content">
            <h1 className="hero-main-title">{heroSlides[currentSlide].title}</h1>
            {heroSlides[currentSlide].subtitle && (
              <p className="hero-main-subtitle">{heroSlides[currentSlide].subtitle}</p>
            )}
            <div className="hero-btn-wrap">
              {heroSlides[currentSlide].isAnchor ? (
                <a href={heroSlides[currentSlide].btnLink} className="hero-gold-btn">
                  {heroSlides[currentSlide].btnText}
                </a>
              ) : (
                <Link to={heroSlides[currentSlide].btnLink} className="hero-gold-btn">
                  {heroSlides[currentSlide].btnText}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Controles de Navegação do Slider */}
        <button
          className="slider-nav-btn prev"
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
          aria-label="Slide anterior"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          className="slider-nav-btn next"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          aria-label="Próximo slide"
        >
          <ChevronRight size={28} />
        </button>

        {/* Indicadores do Slider */}
        <div className="slider-dots">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: SOBRE O ESCRITÓRIO (#sobre) */}
      <section id="sobre" className="section-sobre">
        <div className="container">
          <div className="sobre-grid">
            <div className="sobre-text-column">
              <div className="gold-divider"></div>
              <h2 className="section-title">Sobre o escritório</h2>
              <div className="sobre-paragraphs">
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
              <div className="sobre-btn-wrap">
                <Link to="/quem-somos/" className="btn-gold-solid">
                  Saiba mais
                </Link>
              </div>
            </div>

            <div className="sobre-image-column">
              <div className="porta-img-wrapper">
                <img
                  src="/assets/porta.png"
                  alt="Porta Mascârello Haus Advocacia"
                  className="porta-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: QUEM SOMOS (DRA. MIRÂTAIRA HAUS) - FUNDO VERDE ESCURO #0d3732 */}
      <section className="section-quem-somos-dark">
        <div className="container">
          <div className="quem-somos-intro">
            <div className="gold-divider"></div>
            <h2 className="section-title-white">Quem somos</h2>
            <p className="intro-lead-text">
              Desenvolvemos estratégias para a conformidade e proteção jurídica com foco no resultado esperado pelo cliente.
            </p>
          </div>

          <div className="mira-profile-grid">
            <div className="mira-photo-col">
              <div className="mira-photo-frame">
                <img
                  src="/assets/0765_0260-scaled.jpg"
                  alt="Dra. Mirâtaira Haus"
                  className="mira-photo-img"
                />
              </div>
            </div>

            <div className="mira-bio-col">
              <h3 className="mira-name">Mirâtaira Haus</h3>
              <p className="mira-roles">Advogada, Professora, Consultora e Palestrante.</p>
              <div className="mira-bio-text">
                <p>
                  Desde o início de sua vida acadêmica atuou profissionalmente junto a Procuradoria Jurídica do Município onde reside, também no Tribunal de Justiça e Ministério Público de Santa Catarina nas áreas afetas ao Direito Tributário, Civil e Empresarial.
                </p>
                <p>
                  Especialista em liquidação de sentença trabalhista realizou por alguns anos cálculos para diversas empresas, dentre elas transnacionais.
                </p>
                <p>
                  Inclinada a solucionar os desafios corporativos, fundou o escritório Mascârello Haus Advocacia e Consultoria Jurídica, especializado em Direito Digital, Compliance e Trabalhista, que atende empresas de todos os portes que buscam proteção e a excelência na prestação dos serviços.
                </p>
                <p>
                  Paralelamente, assessorou a Procuradoria Geral do Estado de Santa Catarina, na regional de Caçador/SC.
                </p>
              </div>
              <div className="mira-cta-wrap">
                <Link to="/contato/" className="btn-gold-solid">
                  Fale com a Dra. Mirâtaira
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: ÁREAS DE ATUAÇÃO COM IMAGEM ORIGINAL E 6 CARDS */}
      <section className="section-areas">
        <div className="container">
          <div className="areas-grid">
            <div className="areas-left-col">
              <div className="gold-divider"></div>
              <h2 className="section-title">Áreas de Atuação</h2>
              <div className="areas-banner-img">
                <img
                  src="/assets/areas-de-atuacao-1.png"
                  alt="Áreas de Atuação Mascârello Haus"
                  className="areas-main-img"
                />
              </div>
            </div>

            <div className="areas-right-col">
              <div className="areas-cards-grid">
                {practiceCards.map((area) => (
                  <div key={area.slug} className="area-item-card">
                    <h3 className="area-item-title">{area.title}</h3>
                    <p className="area-item-desc">{area.desc}</p>
                    <Link to={`/${area.slug}/`} className="area-item-link">
                      Saiba mais <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: PROPÓSITO, VISÃO DE FUTURO, VALORES COM POST-5.PNG */}
      <section className="section-triad-parallax">
        <div className="triad-bg-overlay"></div>
        <div className="container triad-container">
          <div className="triad-cards-row">
            {/* Card 1: Propósito */}
            <div className="triad-card">
              <div className="triad-icon-wrap">
                <img src="/assets/goal-svgrepo-com.png" alt="Propósito" className="triad-icon-img" />
              </div>
              <h3 className="triad-card-title">Propósito</h3>
              <p className="triad-card-desc">
                Apoiar pessoas nas decisões conscientes e entregar soluções que transformam negócios.
              </p>
            </div>

            {/* Card 2: Visão de Futuro */}
            <div className="triad-card">
              <div className="triad-icon-wrap">
                <img src="/assets/vision-svgrepo-com.png" alt="Visão de Futuro" className="triad-icon-img" />
              </div>
              <h3 className="triad-card-title">Visão de Futuro</h3>
              <p className="triad-card-desc">
                Estar entre os principais escritórios e ser referência na prestação de serviços jurídicos e de conformidade no Brasil.
              </p>
            </div>

            {/* Card 3: Valores */}
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

      {/* SEÇÃO 7: COMO FUNCIONA A ASSESSORIA EMPRESARIAL? (FLUXO-1.PNG) */}
      <section className="section-assessoria">
        <div className="container">
          <div className="assessoria-grid">
            <div className="assessoria-text-col">
              <div className="gold-divider"></div>
              <h2 className="section-title">
                Como funciona a <br />assessoria empresarial?
              </h2>
              <p className="assessoria-description">
                Nosso foco é apoiar as empresas em todas as rotinas relacionadas ao direito empresarial, e ao longo de todo o seu ciclo de vida, para reduzir sua exposição a riscos, garantir sua conformidade e impulsionar negócios.
              </p>
              <div className="assessoria-btn-wrap">
                <Link to="/contato/" className="btn-gold-solid">
                  Fale com um Especialista <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="assessoria-flow-col">
              <div className="flow-img-wrapper">
                <img
                  src="/assets/fluxo-1.png"
                  alt="Fluxo da Assessoria Empresarial"
                  className="flow-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 8: O QUE FALAM SOBRE NÓS (DEPOIMENTOS) */}
      <section className="section-testimonials">
        <div className="container">
          <div className="testimonials-header">
            <div className="gold-divider center"></div>
            <h2 className="section-title text-center">O que falam sobre nós</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item, idx) => (
              <div key={idx} className="testimonial-card">
                <div className="quote-icon">
                  <Quote size={32} />
                </div>
                <blockquote className="testimonial-text">
                  "{item.text}"
                </blockquote>
                <div className="testimonial-author">
                  <h4>{item.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CSS ESPECÍFICO DA HOME PAGE */}
      <style>{`
        /* Utilitários e Divisores */
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
        .section-title {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          color: var(--color-primary);
          line-height: 1.25;
          margin-bottom: 24px;
        }
        .section-title-white {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          color: #ffffff;
          line-height: 1.25;
          margin-bottom: 15px;
        }
        .btn-gold-solid {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-accent);
          color: #ffffff;
          padding: 12px 32px;
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
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(13, 55, 50, 0.2);
        }

        /* 1 & 2: HERO SLIDER */
        .elementor-hero-slider {
          position: relative;
          min-height: 580px;
          background-size: cover;
          background-position: bottom center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          color: #ffffff;
          transition: background-image 0.5s ease-in-out;
          padding: 80px 0;
        }
        .hero-slide-overlay {
          position: absolute;
          inset: 0;
          background: rgba(13, 55, 50, 0.65);
          z-index: 1;
        }
        .hero-container {
          position: relative;
          z-index: 2;
        }
        .hero-slide-content {
          max-width: 800px;
          text-align: left;
        }
        .hero-main-title {
          font-family: var(--font-serif);
          font-size: 3.2rem;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .hero-main-subtitle {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 35px;
          max-width: 650px;
        }
        .hero-gold-btn {
          display: inline-block;
          border: 2px solid var(--color-accent);
          color: #ffffff;
          background-color: transparent;
          border-radius: 50px;
          padding: 13px 38px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }
        .hero-gold-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-primary);
        }
        .slider-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .slider-nav-btn:hover {
          background-color: var(--color-accent);
          color: var(--color-primary);
        }
        .slider-nav-btn.prev { left: 25px; }
        .slider-nav-btn.next { right: 25px; }
        .slider-dots {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          display: flex;
          gap: 10px;
        }
        .slider-dots .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .slider-dots .dot.active {
          background: var(--color-accent);
          transform: scale(1.25);
        }

        /* 3: SOBRE O ESCRITÓRIO */
        .section-sobre {
          background-color: var(--color-bg-light);
          padding: 90px 0;
        }
        .sobre-grid {
          display: grid;
          grid-template-columns: 55% 45%;
          gap: 50px;
          align-items: center;
        }
        .sobre-paragraphs {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-text-main);
          line-height: 1.75;
          text-align: justify;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sobre-btn-wrap {
          margin-top: 30px;
        }
        .porta-img-wrapper {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        .porta-image {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          box-shadow: 30px 30px 0px 0px var(--color-primary);
          transition: transform 0.3s ease;
        }
        .porta-image:hover {
          transform: translateY(-4px);
        }

        /* 4: QUEM SOMOS (DRA. MIRÂTAIRA) */
        .section-quem-somos-dark {
          background-color: var(--color-primary);
          color: #ffffff;
          padding: 90px 0;
        }
        .quem-somos-intro {
          margin-bottom: 50px;
        }
        .intro-lead-text {
          font-family: var(--font-sans);
          font-size: 1.15rem;
          color: #e7decf;
          max-width: 750px;
          line-height: 1.6;
        }
        .mira-profile-grid {
          display: grid;
          grid-template-columns: 45% 55%;
          gap: 60px;
          align-items: center;
        }
        .mira-photo-col {
          display: flex;
          justify-content: center;
        }
        .mira-photo-frame {
          max-width: 380px;
          width: 100%;
        }
        .mira-photo-img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          box-shadow: -30px 30px 0px 0px var(--color-accent);
          object-fit: cover;
        }
        .mira-name {
          font-family: var(--font-serif);
          font-size: 2.3rem;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .mira-roles {
          font-family: var(--font-sans);
          color: var(--color-accent);
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .mira-bio-text {
          font-family: var(--font-sans);
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          line-height: 1.75;
          text-align: justify;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .mira-cta-wrap {
          margin-top: 30px;
        }

        /* 5: ÁREAS DE ATUAÇÃO */
        .section-areas {
          background-color: var(--color-bg-light);
          padding: 90px 0;
        }
        .areas-grid {
          display: grid;
          grid-template-columns: 38% 62%;
          gap: 40px;
          align-items: start;
        }
        .areas-main-img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          margin-top: 10px;
        }
        .areas-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        .area-item-card {
          background-color: #ffffff;
          padding: 24px 20px;
          border-radius: 8px;
          border-left: 4px solid var(--color-accent);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .area-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(13, 55, 50, 0.08);
        }
        .area-item-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--color-primary);
          margin-bottom: 10px;
          font-weight: 600;
        }
        .area-item-desc {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          color: var(--color-text-main);
          line-height: 1.6;
          text-align: justify;
          margin-bottom: 15px;
        }
        .area-item-link {
          font-family: var(--font-sans);
          font-size: 0.84rem;
          color: var(--color-accent);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: auto;
        }
        .area-item-link:hover {
          color: var(--color-primary);
        }

        /* 6: TRÍADE (PROPÓSITO, VISÃO, VALORES) */
        .section-triad-parallax {
          position: relative;
          background-image: url('/assets/post-5.png');
          background-size: cover;
          background-position: center;
          background-attachment: scroll;
          padding: 100px 0;
        }
        .triad-bg-overlay {
          position: absolute;
          inset: 0;
          background-color: var(--color-primary);
          opacity: 0.96;
          z-index: 1;
        }
        .triad-container {
          position: relative;
          z-index: 2;
          max-width: 1060px;
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
          transition: transform 0.3s ease;
        }
        .triad-card:hover {
          transform: translateY(-6px);
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
          margin-bottom: 14px;
          font-weight: 600;
        }
        .triad-card-desc {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: var(--color-text-main);
          line-height: 1.6;
        }

        /* 7: ASSESSORIA EMPRESARIAL */
        .section-assessoria {
          background-color: #ffffff;
          padding: 90px 0;
        }
        .assessoria-grid {
          display: grid;
          grid-template-columns: 45% 55%;
          gap: 50px;
          align-items: center;
        }
        .assessoria-description {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          color: var(--color-text-main);
          line-height: 1.7;
          text-align: justify;
          margin-bottom: 30px;
        }
        .assessoria-btn-wrap {
          margin-top: 25px;
        }
        .flow-img-wrapper {
          text-align: center;
        }
        .flow-img {
          width: 85%;
          max-width: 500px;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
        }

        /* 8: O QUE FALAM SOBRE NÓS */
        .section-testimonials {
          background-color: var(--color-bg-light);
          padding: 90px 0;
        }
        .testimonials-header {
          text-align: center;
          margin-bottom: 50px;
        }
        .text-center {
          text-align: center;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .testimonial-card {
          background-color: #ffffff;
          padding: 35px 28px;
          border-radius: 12px;
          box-shadow: 0px 20px 30px -10px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .quote-icon {
          color: var(--color-accent);
          opacity: 0.7;
          margin-bottom: 15px;
        }
        .testimonial-text {
          font-family: var(--font-sans);
          font-size: 0.92rem;
          line-height: 1.7;
          color: var(--color-text-main);
          text-align: justify;
          margin-bottom: 22px;
          font-style: italic;
        }
        .testimonial-author h4 {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--color-primary);
          font-weight: 600;
          margin-bottom: 0;
        }

        /* RESPONSIVIDADE */
        @media (max-width: 992px) {
          .hero-main-title { font-size: 2.3rem; }
          .sobre-grid { grid-template-columns: 1fr; }
          .mira-profile-grid { grid-template-columns: 1fr; }
          .mira-photo-frame { margin: 0 auto; }
          .areas-grid { grid-template-columns: 1fr; }
          .triad-cards-row { grid-template-columns: 1fr; }
          .assessoria-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .porta-image { box-shadow: 15px 15px 0px 0px var(--color-primary); }
          .mira-photo-img { box-shadow: -15px 15px 0px 0px var(--color-accent); }
        }

        @media (max-width: 600px) {
          .hero-main-title { font-size: 1.8rem; }
          .areas-cards-grid { grid-template-columns: 1fr; }
          .slider-nav-btn { display: none; }
          .elementor-hero-slider { min-height: 480px; }
        }
      `}</style>
    </div>
  );
};
