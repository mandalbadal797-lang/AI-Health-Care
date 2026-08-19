import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { IconButton } from '../buttons/IconButton';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
}) => {
  const icon =
    type === 'success' ? (
      <CheckCircle size={20} className="text-success" />
    ) : type === 'error' ? (
      <AlertCircle size={20} className="text-danger" />
    ) : type === 'warning' ? (
      <AlertTriangle size={20} className="text-warning" />
    ) : (
      <Info size={20} className="text-primary" />
    );

  return (
    <div className="toast" role="alert" aria-live="polite">
      {icon}
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.9375rem' }}>{title}</h4>
        {message && <p className="text-small text-muted">{message}</p>}
      </div>
      {onClose && <IconButton icon={<X size={16} />} aria-label="Dismiss notification" onClick={onClose} size="sm" />}
    </div>
  );
};
