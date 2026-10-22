import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Shield, BookOpen, Scale, ArrowRight, Award, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      badge: 'Direito & Inovação',
      title: 'Para um novo mundo, novas estratégias.',
      subtitle: 'Para uma nova realidade, novas soluções jurídicas.',
      text: 'Apoiamos pessoas nas decisões conscientes e entregamos soluções que transformam negócios.',
      ctaText: 'Conheça o Escritório',
      ctaLink: '/quem-somos/',
      ctaSecondaryText: 'Áreas de Atuação',
      ctaSecondaryLink: '/areas-de-atuacao/'
    },
    {
      badge: 'Conformidade & Governança',
      title: 'Privacidade, Proteção de Dados e Compliance.',
      subtitle: 'Segurança jurídica para a transformação digital.',
      text: 'Conheça nossos artigos, cartilhas e publicações gratuitas para fortalecer a sua empresa.',
      ctaText: 'Ver Cartilhas e E-books',
      ctaLink: '/artigos-e-publicacoes/',
      ctaSecondaryText: 'Central LGPD',
      ctaSecondaryLink: '/central-de-protecao-de-dados/'
    }
  ];

  const practiceAreas = [
    {
      title: 'Compliance',
      slug: 'compliance',
      icon: 'fa-solid fa-clipboard-check',
      desc: 'Implementação de programas de integridade, gestão de riscos, códigos de conduta e canal de denúncias independente.'
    },
    {
      title: 'Direito Digital e Tecnologia',
      slug: 'direito-digital-e-tecnologia',
      icon: 'fa-solid fa-microchip',
      desc: 'Assessoria em contratos de software, propriedade intelectual, startups, inteligência artificial e comércio eletrônico.'
    },
    {
      title: 'Proteção de Dados (LGPD)',
      slug: 'protecao-de-dados-lgpd',
      icon: 'fa-solid fa-shield-halved',
      desc: 'Adequação completa à Lei Geral de Proteção de Dados (Lei 13.709/2018), mapeamento de dados (ROPA) e atuação como DPO as a Service.'
    },
    {
      title: 'Direito Civil e Empresarial',
      slug: 'direito-civil-e-empresarial',
      icon: 'fa-solid fa-briefcase',
      desc: 'Planejamento societário, contratos mercantis estratégicos, estruturação patrimonial e resolução de litígios.'
    },
    {
      title: 'Direito do Trabalho',
      slug: 'direito-do-trabalho',
      icon: 'fa-solid fa-users',
      desc: 'Consultoria preventiva trabalhista, acordos coletivos, compliance de RH e mitigação de passivos trabalhistas corporativos.'
    },
    {
      title: 'Direito Previdenciário',
      slug: 'direito-previdenciario',
      icon: 'fa-solid fa-landmark',
      desc: 'Planejamento previdenciário individual e corporativo, concessão e revisão de benefícios do RGPS e RPPS.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="home-page">
      <SEO
        title="Mascârello Haus Advocacia | Para um novo mundo, novas estratégias"
        description="Sociedade de advogados inovadora. Soluções jurídicas estratégicas em Direito Civil, Empresarial, LGPD, Compliance, Direito Digital e Previdenciário."
      />

      {/* Hero Slider */}
      <section className="hero-slider-section">
        <div className="container">
          <div className="hero-slide">
            <span className="hero-slide-badge">{heroSlides[currentSlide].badge}</span>
            <h1 className="hero-slide-title">{heroSlides[currentSlide].title}</h1>
            <p className="hero-slide-text">{heroSlides[currentSlide].text}</p>
            <div className="hero-slide-ctas">
              <Link to={heroSlides[currentSlide].ctaLink} className="btn btn-primary">
                {heroSlides[currentSlide].ctaText} <ArrowRight size={16} />
              </Link>
              <Link to={heroSlides[currentSlide].ctaSecondaryLink} className="btn btn-outline">
                {heroSlides[currentSlide].ctaSecondaryText}
              </Link>
            </div>
          </div>
        </div>

        {/* Controles do Slider */}
        <button
          className="slider-control prev"
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
          aria-label="Slide anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="slider-control next"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          aria-label="Próximo slide"
        >
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Seção Sobre o Escritório */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="about-grid">
            <div className="about-text-col">
              <span className="sub-heading">Sobre o Escritório</span>
              <h2>Inovação jurídica aliada à segurança e tradição</h2>
              <p>
                A <strong>Mascârello Haus Advocacia</strong> atua de maneira proativa e estratégica, integrando o Direito clássico às novas demandas da tecnologia, da governança corporativa e da privacidade de dados.
              </p>
              <p>
                Nosso propósito é desmistificar a burocracia e entregar soluções ágeis, personalizadas e de alto impacto para proteger patrimônios, viabilizar modelos de negócios e resguardar relações jurídicas.
              </p>
              <div className="about-highlights">
                <div className="highlight-item">
                  <CheckCircle2 className="hl-icon" size={20} />
                  <span>Advocacia preventiva e foco em resultados mensuráveis</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle2 className="hl-icon" size={20} />
                  <span>Especialistas certificados em LGPD e Governança</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle2 className="hl-icon" size={20} />
                  <span>Atendimento consultivo e contencioso estratégico</span>
                </div>
              </div>
              <Link to="/quem-somos/" className="btn btn-primary" style={{ marginTop: '25px' }}>
                Conheça Nossa História <ArrowRight size={16} />
              </Link>
            </div>
            <div className="about-founder-col">
              <div className="founder-card">
                <div className="founder-badge">Liderança Técnica</div>
                <h3>Mirâtaira Haus</h3>
                <p className="founder-subtitle">Advogada, Professora, Consultora e Palestrante</p>
                <p className="founder-bio">
                  Especialista em Direito Digital, Proteção de Dados (LGPD) e Compliance. Com ampla experiência acadêmica e executiva, lidera projetos de estruturação societária e conformidade em empresas de diversos segmentos.
                </p>
                <div className="founder-footer">
                  <Link to="/contato/" className="founder-cta">
                    Agende uma Consulta <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Atuação */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-center">
            <span className="sub-heading">Especialidades</span>
            <h2>Áreas de Atuação</h2>
            <p className="section-subtext">
              Soluções jurídicas estruturadas para atender às necessidades individuais e empresariais com rigor técnico.
            </p>
          </div>

          <div className="practice-grid">
            {practiceAreas.map((area) => (
              <div key={area.slug} className="practice-card">
                <div>
                  <div className="practice-card-icon">
                    <i className={area.icon}></i>
                  </div>
                  <h3 className="practice-card-title">{area.title}</h3>
                  <p className="practice-card-desc">{area.desc}</p>
                </div>
                <Link to={`/${area.slug}/`} className="practice-card-link">
                  Saiba Mais <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tríade: Propósito, Visão e Valores */}
      <section className="section-padding bg-light">
        <div className="container">
          <div className="section-title-center">
            <span className="sub-heading">Nossos Pilares</span>
            <h2>Identidade Institucional</h2>
          </div>

          <div className="triad-grid">
            <div className="triad-box">
              <h3>Propósito</h3>
              <p>
                Apoiar pessoas nas decisões conscientes e entregar soluções jurídicas ágeis e inovadoras que transformem negócios e tragam segurança sustentável.
              </p>
            </div>
            <div className="triad-box">
              <h3>Visão de Futuro</h3>
              <p>
                Ser referência em advocacia estratégica e direito digital, reconhecido pela capacidade de antecipar tendências e gerar valor concreto para nossos clientes.
              </p>
            </div>
            <div className="triad-box">
              <h3>Valores</h3>
              <p>
                Ética intransigente, transparência total, busca incessante pelo aprimoramento técnico, humanização no atendimento e compromisso com o resultado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA de Assessoria Empresarial & Quiz */}
      <section className="assessoria-cta-section">
        <div className="container assessoria-box">
          <div className="assessoria-content">
            <h2>Sua empresa está em conformidade com a LGPD?</h2>
            <p>
              Realize nosso questionário online e receba uma avaliação preliminar das principais práticas de governança e proteção de dados da sua organização.
            </p>
            <div className="assessoria-buttons">
              <Link to="/questionario-de-conformidade/" className="btn btn-primary">
                Fazer Questionário Gratuito <ArrowRight size={16} />
              </Link>
              <Link to="/contato/" className="btn btn-outline">
                Falar com um Especialista
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .bg-light {
          background-color: var(--color-bg-light);
        }
        .sub-heading {
          display: inline-block;
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .section-title-center {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 50px auto;
        }
        .section-subtext {
          color: var(--color-text-muted);
          font-size: 1.05rem;
        }
        .slider-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s ease;
          z-index: 10;
        }
        .slider-control:hover {
          background: var(--color-accent);
        }
        .slider-control.prev { left: 20px; }
        .slider-control.next { right: 20px; }
        
        .about-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 50px;
          align-items: center;
        }
        .about-highlights {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }
        .highlight-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--color-primary);
          font-weight: 500;
        }
        .hl-icon {
          color: var(--color-accent);
          flex-shrink: 0;
        }
        .founder-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-top: 4px solid var(--color-accent);
          border-radius: 8px;
          padding: 40px 30px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        .founder-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent);
          margin-bottom: 12px;
        }
        .founder-subtitle {
          color: var(--color-accent);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .founder-bio {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 22px;
        }
        .founder-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--color-primary);
        }
        .founder-cta:hover {
          color: var(--color-accent);
        }
        .assessoria-cta-section {
          background-color: var(--color-primary-dark);
          padding: 80px 0;
          color: #ffffff;
        }
        .assessoria-box {
          text-align: center;
          max-width: 800px;
        }
        .assessoria-content h2 {
          color: #ffffff;
          font-size: 2.3rem;
          margin-bottom: 18px;
        }
        .assessoria-content p {
          color: #d1d5db;
          font-size: 1.15rem;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .assessoria-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
