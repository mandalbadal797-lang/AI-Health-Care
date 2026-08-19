import React from 'react';
import { NavLink } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="card p-6 text-center" style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <HelpCircle size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
      <h2>404 — Page Not Found</h2>
      <p className="text-muted mt-2 mb-4">The requested page path does not exist in the route catalog.</p>
      <NavLink to="/" className="btn btn-primary inline-flex items-center gap-2">
        <Home size={16} /> Return Home
      </NavLink>
    </div>
  );
};
