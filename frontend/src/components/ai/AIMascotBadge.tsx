import React from 'react';
import { Bot } from 'lucide-react';
import { Badge } from '../badges/Badge';

export const AIMascotBadge: React.FC = () => {
  return (
    <Badge variant="info" className="flex items-center gap-xs">
      <Bot size={14} /> AI Assistant Active
    </Badge>
  );
};
