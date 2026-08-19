import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/buttons/Button';
import { adminService } from '../../services/adminService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('admin@mindcampus.edu');
  const [password, setPassword] = useState<string>('AdminPass123!');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await adminService.login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-md"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div
        className="card glass p-xl w-full max-w-md flex flex-col gap-md"
        style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="flex flex-col items-center text-center gap-xs">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>MindCampus Admin Access</h2>
          <p className="caption text-muted">Platform Content Management & Moderation Control Portal</p>
        </div>

        {error && (
          <div className="card glass p-sm flex items-center gap-xs text-danger" style={{ backgroundColor: 'var(--color-danger-light)' }}>
            <AlertCircle size={16} />
            <span className="caption font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label flex items-center gap-xs">
              <Mail size={14} /> Admin Email
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-xs">
              <Lock size={14} /> Admin Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" type="submit" isLoading={isLoading} className="w-full">
            Authenticate Administrator
          </Button>
        </form>

        <div className="text-center pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost text-muted caption"
            style={{ padding: '0.25rem' }}
          >
            <ArrowLeft size={14} /> Return to MindCampus Student Platform
          </button>
        </div>
      </div>
    </div>
  );
};
