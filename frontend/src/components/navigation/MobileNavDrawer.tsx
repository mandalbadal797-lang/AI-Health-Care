import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { IconButton } from '../buttons/IconButton';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ justifyContent: 'flex-start', padding: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div
        className="card flex flex-col p-lg"
        style={{
          width: '280px',
          height: '100%',
          borderRadius: 0,
          backgroundColor: 'var(--bg-surface)',
          animation: 'slideRight 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 font-bold text-primary">
            <Sparkles size={20} /> MindCampus
          </div>
          <IconButton icon={<X size={20} />} aria-label="Close menu" onClick={onClose} />
        </div>

        <nav className="flex flex-col gap-md">
          <NavLink to="/" onClick={onClose} className="nav-link p-xs">Home</NavLink>
          <NavLink to="/blog" onClick={onClose} className="nav-link p-xs">Blog Articles</NavLink>
          <NavLink to="/podcasts" onClick={onClose} className="nav-link p-xs">Podcasts</NavLink>
          <NavLink to="/stories" onClick={onClose} className="nav-link p-xs">Digital Stories</NavLink>
          <NavLink to="/search" onClick={onClose} className="nav-link p-xs">Search</NavLink>
          <NavLink to="/ai-assistant" onClick={onClose} className="nav-link p-xs">AI Mascot</NavLink>
          <NavLink to="/about" onClick={onClose} className="nav-link p-xs">About</NavLink>
          <NavLink to="/admin" onClick={onClose} className="nav-link p-xs">Admin Portal</NavLink>
        </nav>
      </div>
    </div>
  );
};
