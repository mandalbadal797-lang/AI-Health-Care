import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Database, CheckCircle, Server, Code, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useHealth } from '../hooks/useHealth';

export const Phase2VerificationPage: React.FC = () => {
  const { data, isLoading, isConnected, error, refetch } = useHealth();

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Hero Header */}
      <div className="card card-glass p-6 text-center mb-6">
        <span className="badge badge-info mb-2">Phase 2 Verification</span>
        <h1>MindCampus Application Foundation</h1>
        <p className="text-muted mt-2" style={{ maxWidth: '700px', margin: '0.5rem auto' }}>
          Phase 2 technical foundation, application skeleton, route hierarchy, and frontend ↔ backend communication infrastructure are fully established.
        </p>
      </div>

      {/* Live System Health Verification Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Backend API Connection Status */}
        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-small text-muted flex items-center gap-2">
              <Server size={18} /> Backend API Status
            </span>
            <button onClick={() => refetch()} className="btn btn-secondary btn-sm" title="Re-check Backend Connection">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Activity size={28} className={isConnected ? 'text-success' : 'text-danger'} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {isLoading ? 'Checking...' : isConnected ? 'Connected' : 'Unavailable'}
              </div>
              <p className="text-small text-muted">
                {isConnected ? `Endpoint: /api/v1/health` : error || 'Backend server offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Database Connection Status */}
        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-small text-muted flex items-center gap-2">
              <Database size={18} /> Database Engine
            </span>
            <span className={`badge ${data?.database_connected ? 'badge-success' : 'badge-danger'}`}>
              {data?.database_connected ? 'Active' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <CheckCircle size={28} className={data?.database_connected ? 'text-success' : 'text-danger'} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {data?.database_connected ? 'SQLite Dev DB' : 'Disconnected'}
              </div>
              <p className="text-small text-muted">Async SQLAlchemy Engine initialized</p>
            </div>
          </div>
        </div>

        {/* System Environment */}
        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-small text-muted flex items-center gap-2">
              <Code size={18} /> Environment
            </span>
            <span className="badge badge-info">{data?.environment || 'development'}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <ShieldCheck size={28} className="text-primary" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {data?.app_name || 'MindCampus API'}
              </div>
              <p className="text-small text-muted">Version: {data?.version || '1.0.0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configured Route Navigator */}
      <div className="card p-6 mb-6">
        <h2 className="mb-4">Configured Application Route Navigator</h2>
        <p className="text-muted text-small mb-4">
          All application routes specified in Phase 1 have been declared in the client-side router with clean structural layout placeholders:
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* Public Routes */}
          <div className="card p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
            <h3 className="mb-3 text-primary">Public Routes</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><NavLink to="/blog" className="nav-link flex items-center justify-between">Blog Library <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/blog/example-post" className="nav-link flex items-center justify-between">Article Detail <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/podcasts" className="nav-link flex items-center justify-between">Podcast Library <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/stories" className="nav-link flex items-center justify-between">Digital Stories <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/search" className="nav-link flex items-center justify-between">Search Page <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/about" className="nav-link flex items-center justify-between">About Project <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/safety" className="nav-link flex items-center justify-between">Safety Notice <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/login" className="nav-link flex items-center justify-between">Student Login <ArrowRight size={14} /></NavLink></li>
            </ul>
          </div>

          {/* Student Routes */}
          <div className="card p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
            <h3 className="mb-3 text-accent-teal">Student Portal Routes</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><NavLink to="/profile" className="nav-link flex items-center justify-between">Student Profile <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/bookmarks" className="nav-link flex items-center justify-between">Bookmarks <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/recommendations" className="nav-link flex items-center justify-between">Recommendations <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/ai-assistant" className="nav-link flex items-center justify-between">AI Mascot Assistant <ArrowRight size={14} /></NavLink></li>
            </ul>
          </div>

          {/* Admin Routes */}
          <div className="card p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
            <h3 className="mb-3 text-accent-amber">Admin Portal Routes</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><NavLink to="/admin" className="nav-link flex items-center justify-between">Admin Dashboard <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/admin/articles" className="nav-link flex items-center justify-between">Manage Articles <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/admin/categories" className="nav-link flex items-center justify-between">Manage Categories <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/admin/podcasts" className="nav-link flex items-center justify-between">Manage Podcasts <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/admin/stories" className="nav-link flex items-center justify-between">Manage Stories <ArrowRight size={14} /></NavLink></li>
              <li><NavLink to="/admin/ai-assistant" className="nav-link flex items-center justify-between">AI Draft Assistant <ArrowRight size={14} /></NavLink></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
