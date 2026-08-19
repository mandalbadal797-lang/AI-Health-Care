import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className="card p-xs text-small"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-6px)',
            backgroundColor: 'var(--text-main)',
            color: 'var(--bg-surface)',
            whiteSpace: 'nowrap',
            zIndex: 1200,
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
