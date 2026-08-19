import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from './Badge';

export interface AIBadgeProps {
  label?: string;
}

export const AIBadge: React.FC<AIBadgeProps> = ({ label = 'AI Generated' }) => {
  return (
    <Badge variant="warning" className="flex items-center gap-xs">
      <Sparkles size={12} /> {label}
    </Badge>
  );
};
