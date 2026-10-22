import React from 'react';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/5549999281878?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20atendimento%20jur%C3%ADdico."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Atendimento via WhatsApp"
    >
      <i className="fa-brands fa-whatsapp"></i>
      <span className="whatsapp-tooltip">Atendimento WhatsApp</span>

      <style>{`
        .whatsapp-float-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 58px;
          height: 58px;
          background-color: #25d366;
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
          z-index: 999;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .whatsapp-float-btn:hover {
          transform: scale(1.08);
          background-color: #20ba5a;
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
          color: #ffffff;
        }
        .whatsapp-tooltip {
          position: absolute;
          right: 68px;
          background: #333333;
          color: #ffffff;
          font-size: 13px;
          font-family: var(--font-sans);
          padding: 6px 12px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .whatsapp-float-btn:hover .whatsapp-tooltip {
          opacity: 1;
        }
        @media (max-width: 600px) {
          .whatsapp-float-btn {
            bottom: 20px;
            right: 20px;
            width: 52px;
            height: 52px;
            font-size: 26px;
          }
          .whatsapp-tooltip {
            display: none;
          }
        }
      `}</style>
    </a>
  );
};
