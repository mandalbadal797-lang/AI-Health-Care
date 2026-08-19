import React from 'react';
import { User } from 'lucide-react';
import { Card } from '../cards/Card';

export interface UserMessageProps {
  message: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <Card
      className="p-md flex items-start gap-md my-3"
      style={{
        backgroundColor: 'var(--color-secondary)',
        borderLeft: '4px solid var(--text-muted)',
      }}
    >
      <div
        className="p-xs flex items-center justify-center"
        style={{
          borderRadius: '50%',
          backgroundColor: 'var(--text-muted)',
          color: '#ffffff',
          flexShrink: 0,
        }}
      >
        <User size={18} />
      </div>

      <div className="flex flex-col gap-xs">
        <span className="caption font-semibold text-muted">You (Student)</span>
        <p className="text-small">{message}</p>
      </div>
    </Card>
  );
};
