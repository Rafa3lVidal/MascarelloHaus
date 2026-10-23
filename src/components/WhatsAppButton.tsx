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
      <span className="wa-pulse-wave"></span>
      <i className="fa-brands fa-whatsapp wa-icon"></i>
      <span className="whatsapp-tooltip">Atendimento WhatsApp</span>

      <style>{`
        .whatsapp-float-btn {
          position: fixed;
          bottom: 26px;
          right: 26px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #2fe675 0%, #20ba5a 100%);
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
          z-index: 999;
          transition: transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1),
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.28s ease;
          text-decoration: none;
        }

        .wa-pulse-wave {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(37, 211, 102, 0.6);
          animation: waPulseRing 3.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
          pointer-events: none;
          z-index: -1;
        }

        .wa-icon {
          font-size: 32px;
          transition: transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
        }

        .whatsapp-float-btn:hover {
          transform: translateY(-3px) scale(1.08);
          box-shadow: 0 10px 28px rgba(37, 211, 102, 0.6);
          color: #ffffff;
        }

        .whatsapp-float-btn:hover .wa-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        .whatsapp-float-btn:active {
          transform: translateY(0) scale(0.94);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);
        }

        .whatsapp-tooltip {
          position: absolute;
          right: 72px;
          background: rgba(13, 55, 50, 0.95);
          backdrop-filter: blur(8px);
          color: #ffffff;
          font-size: 13px;
          font-family: var(--font-sans);
          font-weight: 500;
          padding: 7px 14px;
          border-radius: 6px;
          border: 1px solid rgba(203, 171, 122, 0.3);
          white-space: nowrap;
          opacity: 0;
          transform: translateX(8px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .whatsapp-float-btn:hover .whatsapp-tooltip {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        @keyframes waPulseRing {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.35);
            opacity: 0;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }

        @media (max-width: 600px) {
          .whatsapp-float-btn {
            bottom: 20px;
            right: 20px;
            width: 54px;
            height: 54px;
          }
          .wa-icon {
            font-size: 28px;
          }
          .whatsapp-tooltip {
            display: none;
          }
        }
      `}</style>
    </a>
  );
};
