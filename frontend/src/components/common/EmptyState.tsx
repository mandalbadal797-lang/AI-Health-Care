import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Content Found',
  description = 'There is currently no item to display here.',
  icon,
  children,
}) => {
  return (
    <div className="card p-6 flex flex-col items-center gap-3 text-center" style={{ maxWidth: '450px', margin: '2rem auto' }}>
      <div className="text-muted" style={{ fontSize: '2rem' }}>
        {icon || <Inbox size={40} />}
      </div>
      <h3>{title}</h3>
      <p className="text-muted text-small">{description}</p>
      {children}
    </div>
  );
};
