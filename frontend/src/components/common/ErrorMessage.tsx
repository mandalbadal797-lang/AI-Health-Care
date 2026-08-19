import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="card p-6 flex flex-col items-center gap-3" style={{ borderColor: 'var(--color-danger)', maxWidth: '500px', margin: '1rem auto' }}>
      <AlertTriangle size={32} style={{ color: 'var(--color-danger)' }} />
      <h3 style={{ color: 'var(--color-danger)' }}>{title}</h3>
      <p className="text-muted text-small" style={{ textAlign: 'center' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm mt-2">
          Try Again
        </button>
      )}
    </div>
  );
};
