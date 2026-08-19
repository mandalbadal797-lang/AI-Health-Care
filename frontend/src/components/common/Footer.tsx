import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container flex flex-col items-center gap-4">
        {/* Mandatory Non-Clinical Safety Notice */}
        <div
          className="card flex items-center gap-3 p-4"
          style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', maxWidth: '800px' }}
        >
          <ShieldAlert size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <p className="text-small" style={{ color: 'var(--text-main)', textAlign: 'left' }}>
            <strong>MindCampus Safety Notice:</strong> This platform provides educational, motivational, and self-care content for students. It does <strong>not</strong> provide medical diagnoses, psychiatric therapy, or emergency crisis care.
          </p>
        </div>

        <div className="flex gap-6 mt-4">
          <NavLink to="/about" className="nav-link">About Project</NavLink>
          <NavLink to="/safety" className="nav-link">Safety & Helplines</NavLink>
          <NavLink to="/login" className="nav-link">Student Login</NavLink>
          <NavLink to="/admin" className="nav-link">Admin Portal</NavLink>
        </div>

        <p className="text-muted text-small mt-2">
          © {new Date().getFullYear()} MindCampus Platform — Phase 2 Foundation | B.Tech Academic Project
        </p>
      </div>
    </footer>
  );
};
