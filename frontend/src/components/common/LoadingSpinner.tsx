import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-between gap-3 p-6" style={{ minHeight: '120px' }}>
      <Loader2 className="animate-spin text-primary" size={32} />
      <span className="text-muted text-small">{message}</span>
    </div>
  );
};
