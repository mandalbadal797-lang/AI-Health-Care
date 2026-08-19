import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  action,
  align = 'left',
}) => {
  return (
    <div
      className={`flex ${align === 'center' ? 'flex-col items-center text-center' : 'items-end justify-between'} mb-6`}
    >
      <div>
        {eyebrow && (
          <span className="badge badge-info mb-2">{eyebrow}</span>
        )}
        <h2>{title}</h2>
        {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
