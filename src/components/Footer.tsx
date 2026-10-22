import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Coluna 1: Sobre e Logo */}
        <div className="footer-col brand-col">
          <img src="/assets/logo2025branca.png" alt="Mascârello Haus" className="footer-logo" />
          <p className="footer-desc">
            Sociedade de Advogados comprometida com a excelência técnica, ética inegociável e soluções jurídicas estratégicas para empresas e pessoas.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/mascarellohaus.adv/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/company/mascarello-haus-advocacia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="https://wa.me/5549999281878" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* Coluna 2: Áreas de Atuação */}
        <div className="footer-col">
          <h4 className="footer-heading">Áreas de Atuação</h4>
          <ul className="footer-links">
            <li><Link to="/direito-civil-e-empresarial/">Direito Civil e Empresarial</Link></li>
            <li><Link to="/protecao-de-dados-lgpd/">Proteção de Dados (LGPD)</Link></li>
            <li><Link to="/direito-digital-e-tecnologia/">Direito Digital e Tecnologia</Link></li>
            <li><Link to="/compliance/">Compliance Corporativo</Link></li>
            <li><Link to="/direito-do-trabalho/">Direito do Trabalho</Link></li>
            <li><Link to="/direito-previdenciario/">Direito Previdenciário</Link></li>
          </ul>
        </div>

        {/* Coluna 3: Links Úteis & Compliance */}
        <div className="footer-col">
          <h4 className="footer-heading">Conformidade & LGPD</h4>
          <ul className="footer-links">
            <li><Link to="/central-de-protecao-de-dados/">Central de Proteção de Dados</Link></li>
            <li><Link to="/questionario-de-conformidade/">Questionário de Conformidade</Link></li>
            <li><Link to="/codigo-de-conduta/">Código de Conduta Ética</Link></li>
            <li><Link to="/canal-de-denuncias/">Canal de Denúncias</Link></li>
            <li><Link to="/artigos-e-publicacoes/">Cartilhas e Publicações</Link></li>
          </ul>
        </div>

        {/* Coluna 4: Contato */}
        <div className="footer-col">
          <h4 className="footer-heading">Atendimento</h4>
          <ul className="footer-contact-list">
            <li>
              <Phone size={16} className="footer-icon" />
              <span>+55 (49) 99928-1878</span>
            </li>
            <li>
              <Mail size={16} className="footer-icon" />
              <span>contato@mascarellohaus.adv.br</span>
            </li>
            <li>
              <ShieldCheck size={16} className="footer-icon" />
              <span>privacidade@mascarellohaus.adv.br</span>
            </li>
            <li>
              <MapPin size={16} className="footer-icon" />
              <span>Videira / Caçador — Santa Catarina</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Faixa inferior de direitos e créditos */}
      <div className="footer-bottom">
        <div className="container bottom-content">
          <p className="copyright">
            © {new Date().getFullYear()} Mascârello Haus Advocacia. Todos os direitos reservados.
          </p>
          <div className="credits">
            <span>Desenvolvido e distribuído por </span>
            <a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer" className="apex-link">
              ApexCode <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          background-color: var(--color-primary-dark);
          color: #a0aec0;
          font-size: 0.92rem;
          padding-top: 65px;
          border-top: 3px solid var(--color-accent);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1.5fr 1.8fr;
          gap: 40px;
          padding-bottom: 50px;
        }
        .footer-logo {
          height: 52px;
          width: auto;
          margin-bottom: 20px;
        }
        .footer-desc {
          line-height: 1.6;
          margin-bottom: 20px;
          color: #cbd5e0;
        }
        .footer-social {
          display: flex;
          gap: 15px;
        }
        .footer-social a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        .footer-social a:hover {
          background: var(--color-accent);
          color: #ffffff;
          transform: translateY(-2px);
        }
        .footer-heading {
          color: #ffffff;
          font-size: 1.15rem;
          margin-bottom: 20px;
          position: relative;
          padding-bottom: 10px;
        }
        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 32px;
          height: 2px;
          background: var(--color-accent);
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links a:hover {
          color: var(--color-accent);
          padding-left: 4px;
        }
        .footer-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #cbd5e0;
        }
        .footer-icon {
          color: var(--color-accent);
          margin-top: 3px;
          flex-shrink: 0;
        }
        .footer-bottom {
          background: #060e17;
          padding: 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.82rem;
          color: #718096;
        }
        .bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .apex-link {
          color: var(--color-accent);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .apex-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .bottom-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};
