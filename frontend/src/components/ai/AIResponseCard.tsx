import React from 'react';
import { Card } from '../cards/Card';
import { AIBadge } from '../badges/AIBadge';

export interface AIResponseCardProps {
  title: string;
  children: React.ReactNode;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ title, children }) => {
  return (
    <Card glass className="p-lg my-4 flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <h4 style={{ fontSize: '1.05rem' }}>{title}</h4>
        <AIBadge label="AI Assisted Draft" />
      </div>
      <div>{children}</div>
    </Card>
  );
};
