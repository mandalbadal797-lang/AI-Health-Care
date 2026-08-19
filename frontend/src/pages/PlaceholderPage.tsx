import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  targetPhase: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  targetPhase,
  description = 'This route structural skeleton is configured. Full UI components and features will be implemented in the designated roadmap phase.',
}) => {
  const location = useLocation();

  return (
    <div className="card p-6 text-center" style={{ maxWidth: '650px', margin: '2rem auto' }}>
      <div className="flex justify-between items-center mb-4">
        <span className="badge badge-info">{targetPhase}</span>
        <span className="text-small text-muted text-mono">{location.pathname}</span>
      </div>

      <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', margin: '1rem auto' }}>
        <Layers size={36} className="text-primary" />
      </div>

      <h2>{title} Skeleton</h2>
      <p className="text-muted mt-2 mb-4">{description}</p>

      <div className="card p-4 text-left text-small mb-4" style={{ backgroundColor: 'var(--bg-app)' }}>
        <p><strong>Route Status:</strong> Skeleton Configured</p>
        <p><strong>Planned Phase:</strong> {targetPhase}</p>
        <p><strong>Layout Container:</strong> Loaded Active Shell</p>
      </div>

      <NavLink to="/" className="btn btn-secondary btn-sm inline-flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Phase 2 Verification Dashboard
      </NavLink>
    </div>
  );
};
