import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../buttons/IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h3 id="modal-title">{title}</h3>
          <IconButton icon={<X size={18} />} aria-label="Close dialog" onClick={onClose} />
        </div>

        <div className="mb-4">{children}</div>

        {footer && (
          <div className="flex justify-start gap-md pt-4 mt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
