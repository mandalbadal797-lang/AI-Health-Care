import React from 'react';
import { Card } from './Card';

export interface AdminStatCardProps {
  title: string;
  total: number;
  published: number;
  draft: number;
  icon: React.ReactNode;
  variant?: 'primary' | 'info' | 'warning' | 'success';
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  total,
  published,
  draft,
  icon,
  variant = 'info',
}) => {
  return (
    <Card hoverable className="p-lg flex flex-col justify-between gap-md" style={{ borderLeft: `4px solid var(--color-${variant})` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs font-semibold text-small" style={{ color: `var(--color-${variant})` }}>
          {icon}
          <span>{title}</span>
        </div>
        <span className="display-heading" style={{ fontSize: '1.75rem', margin: 0 }}>
          {total}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 text-small text-muted" style={{ borderTop: '1px solid var(--border-color)' }}>
        <span className="flex items-center gap-xs text-success font-medium">
          ● {published} Published
        </span>
        <span className="flex items-center gap-xs text-warning font-medium">
          ○ {draft} Drafts
        </span>
      </div>
    </Card>
  );
};
