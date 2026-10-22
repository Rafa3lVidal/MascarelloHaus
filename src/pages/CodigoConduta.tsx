import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const CodigoConduta: React.FC = () => {
  return (
    <div className="code-of-conduct-page">
      <SEO
        title="Código de Conduta | Mascârello Haus Advocacia"
        description="O Código de Conduta é o documento que dispõe sobre os direitos e deveres de todos os membros do Mascarello Haus Advocacia e Consultoria Jurídica, colaboradores, parceiros e clientes."
        canonical="https://mascarellohaus.adv.br/codigo-de-conduta/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Código de Conduta</h1>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="entry-content">
            <p>
              O Código de Conduta é o documento que dispõe sobre os direitos e deveres de todos os membros do Mascarello Haus Advocacia e Consultoria Jurídica, colaboradores, parceiros e clientes. Bem como, qual é a postura empresarial em relação aos temas que compõem o desenvolvimento de nossas atividades, servindo como guia, que juntamente aos exemplos da alta administração norteará as práticas éticas e legais rumo ao desenvolvimento .
            </p>
            <p>
              Nesse sentido, o código de conduta demonstrará a existência de regras e o compromisso da empresa com a efetividade das orientações, facilitando a divulgação da cultura de Compliance e seu alcance nas atividades realizadas. Ao implementar um canal de denúncia o escritório disponibiliza às partes interessadas uma maneira de chamar atenção para potenciais vulnerabilidades do negócio, infrações ao Código de Conduta e políticas, bem como acerca de comportamentos inapropriados daqueles que agem em nome do escritório Mascarello Haus.
            </p>
            <p>
              Mas, como excluir o medo e o estigma do denunciante? Primeiramente, proporcionando contato facilitado, confidencial e anônimo. A título de exemplo podemos citar a caixa de denúncia, em local seguro. Também, é preciso destacar que administradores não podem retaliar denunciantes de boa-fé ou aqueles que promovam as apurações. No que tange ao estigma, em alguns casos, é possível até mesmo recompensá-los financeiramente, em fomento às boas práticas e cultura de integridade.
            </p>

            <div className="compliance-highlight-box">
              <ShieldCheck size={32} style={{ color: 'var(--color-accent)', marginBottom: '12px' }} />
              <h3>Denúncias</h3>
              <p>
                Ocasionalmente nos deparamos com situações de desvio de conduta, mas nos sentimos impotentes ou intimidados e acabamos por não fazer nada. Por isso o escritório Mascarello Haus conta com uma ferramenta para colaboradores, clientes e parceiros de negócios relatarem suspeitas de fraudes, desvios, má conduta ou qualquer fato que seja contrário ao nosso código de conduta.
              </p>
              <p style={{ marginTop: '14px', fontWeight: 500 }}>
                Para esses casos, acesse aqui nosso{' '}
                <Link to="/canal-de-denuncias/" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
                  Canal de Denúncias
                </Link>.
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
        .entry-content {
          background: #ffffff;
          padding: 45px 40px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          font-family: var(--font-sans);
          font-size: 1rem;
          line-height: 1.8;
          color: var(--color-text-main);
          text-align: justify;
        }
        .entry-content p {
          margin-bottom: 20px;
        }
        .compliance-highlight-box {
          background: var(--color-bg-light);
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-accent);
          padding: 30px;
          border-radius: 6px;
          margin-top: 30px;
        }
        .compliance-highlight-box h3 {
          font-family: var(--font-serif);
          font-size: 1.4rem;
          color: var(--color-primary);
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};
