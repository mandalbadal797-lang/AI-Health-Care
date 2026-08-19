import React from 'react';
import { Card } from './Card';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <Card className="flex flex-col gap-sm p-lg">
      <div
        className="p-md flex items-center justify-center mb-2"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
        }}
      >
        {icon}
      </div>
      <h3>{title}</h3>
      <p className="text-muted text-small">{description}</p>
    </Card>
  );
};
