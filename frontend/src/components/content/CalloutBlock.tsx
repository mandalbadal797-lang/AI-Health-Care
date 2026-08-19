import React from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

export type CalloutType = 'info' | 'warning' | 'success';

export interface CalloutBlockProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  type = 'info',
  title,
  children,
}) => {
  const icon =
    type === 'warning' ? (
      <AlertTriangle size={20} className="text-warning" />
    ) : type === 'success' ? (
      <CheckCircle size={20} className="text-success" />
    ) : (
      <Info size={20} className="text-primary" />
    );

  const border =
    type === 'warning'
      ? 'var(--color-warning)'
      : type === 'success'
      ? 'var(--color-success)'
      : 'var(--color-primary)';

  return (
    <div
      className="card p-md my-4 flex items-start gap-md"
      style={{ borderLeft: `4px solid ${border}`, backgroundColor: 'var(--bg-app)' }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{icon}</div>
      <div>
        {title && <h4 className="mb-1" style={{ fontSize: '1rem' }}>{title}</h4>}
        <div className="text-small text-secondary">{children}</div>
      </div>
    </div>
  );
};
