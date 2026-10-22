import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const AreasDeAtuacao: React.FC = () => {
  const practiceAreas = [
    {
      title: 'Compliance Corporativo',
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

  return (
    <div className="practice-areas-page">
      <SEO
        title="Áreas de Atuação | Mascârello Haus Advocacia"
        description="Conheça as áreas de atuação jurídica da Mascârello Haus Advocacia: Compliance, Direito Digital, LGPD, Direito Civil, Empresarial, Trabalho e Previdenciário."
        canonical="https://mascarellohaus.adv.br/areas-de-atuacao/"
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Especialidades</span>
          <h1 className="banner-title">Áreas de Atuação</h1>
          <p className="banner-desc">
            Atuação jurídica consultiva e contenciosa estratégica, com foco na geração de valor e segurança jurídica.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
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
    </div>
  );
};
