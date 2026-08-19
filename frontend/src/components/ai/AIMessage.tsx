import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '../cards/Card';

export interface AIMessageProps {
  message: string;
  disclaimer?: string;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message, disclaimer }) => {
  return (
    <Card
      glass
      className="p-md flex items-start gap-md my-3"
      style={{
        backgroundColor: 'var(--color-primary-light)',
        borderLeft: '4px solid var(--color-primary)',
      }}
    >
      <div
        className="p-xs flex items-center justify-center"
        style={{
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          flexShrink: 0,
        }}
      >
        <Sparkles size={18} />
      </div>

      <div className="flex flex-col gap-xs">
        <span className="caption font-semibold text-primary">MindCampus AI Mascot</span>
        <p className="text-small" style={{ color: 'var(--text-main)' }}>{message}</p>
        {disclaimer && (
          <span className="caption text-muted mt-1" style={{ fontStyle: 'italic' }}>
            ℹ️ {disclaimer}
          </span>
        )}
      </div>
    </Card>
  );
};
