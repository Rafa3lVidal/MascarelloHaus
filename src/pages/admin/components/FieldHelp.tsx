import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface FieldHelpProps {
  text: string;
  example?: string;
}

/**
 * Ícone explicativo "(i)" ao lado dos rótulos de formulário do painel administrativo,
 * exibindo orientação simples e prática para o DPO ou estagiário sobre o que preencher.
 */
export const FieldHelp: React.FC<FieldHelpProps> = ({ text, example }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="field-help-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`field-help-btn ${open ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={`Ajuda sobre este campo: ${text}`}
        aria-expanded={open}
      >
        <Info size={13} />
      </button>

      {open && (
        <span className="field-help-tooltip" role="tooltip">
          <span className="field-help-text">{text}</span>
          {example && (
            <span className="field-help-example">
              <strong>Exemplo:</strong> {example}
            </span>
          )}
        </span>
      )}
    </span>
  );
};
