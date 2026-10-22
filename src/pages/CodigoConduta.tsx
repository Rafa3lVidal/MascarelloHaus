import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ShieldCheck, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export const CodigoConduta: React.FC = () => {
  return (
    <div className="code-of-conduct-page">
      <SEO
        title="Código de Conduta | Mascârello Haus Advocacia"
        description="Direitos, deveres e princípios éticos que norteiam a conduta dos profissionais e parceiros do Mascârello Haus Advocacia."
        canonical="https://mascarellohaus.adv.br/codigo-de-conduta/"
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Integridade & Compliance</span>
          <h1 className="banner-title">Código de Conduta Ética</h1>
          <p className="banner-desc">Princípios, posturas e diretrizes legais que regem nossas atividades e relações.</p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="entry-content">
            <h2>O que é o Código de Conduta?</h2>
            <p>
              O <strong>Código de Conduta</strong> é o documento que dispõe sobre os direitos e deveres de todos os membros do <strong>Mascârello Haus Advocacia e Consultoria Jurídica</strong>, colaboradores, parceiros e clientes. Bem como, qual é a postura empresarial em relação aos temas que compõem o desenvolvimento de nossas atividades, servindo como guia que, juntamente aos exemplos da alta administração, norteará as práticas éticas e legais rumo ao desenvolvimento sustentável.
            </p>
            <p>
              Nesse sentido, o código de conduta demonstrará a existência de regras claras e o compromisso solene da empresa com a efetividade das orientações, facilitando a divulgação da cultura de <strong>Compliance</strong> e seu alcance real nas atividades diárias realizadas.
            </p>

            <h3>O que rege o nosso Código?</h3>
            <p>
              O código de conduta rege, em especial, questões de ordem moral, ou seja, que dizem respeito aos costumes, ao respeito interpessoal e à cultura da organização. Estabelece critérios objetivos sobre:
            </p>
            <ul>
              <li>Prevenção a conflitos de interesses e práticas anticompetitivas;</li>
              <li>Compromisso irrestrito com a confidencialidade e proteção de dados de clientes;</li>
              <li>Combate a qualquer forma de assédio, violência, preconceito ou discriminação;</li>
              <li>Relações transparentes e probas com o Poder Judiciário e a Administração Pública.</li>
            </ul>

            <div className="compliance-highlight-box">
              <ShieldCheck size={32} style={{ color: 'var(--color-accent)', marginBottom: '12px' }} />
              <h3>Presenciou alguma irregularidade?</h3>
              <p>
                O escritório disponibiliza um canal de denúncias seguro, sigiloso e independente para reporte de quaisquer condutas em desacordo com as diretrizes deste Código.
              </p>
              <div style={{ marginTop: '20px' }}>
                <Link to="/canal-de-denuncias/" className="btn btn-primary">
                  Acessar Canal de Denúncias <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .compliance-highlight-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-accent);
          padding: 35px;
          border-radius: 6px;
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
};
