import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Headphones, HeartHandshake, ShieldAlert, Plus, RefreshCw } from 'lucide-react';
import { AdminStatCard } from '../../components/cards/AdminStatCard';
import { Card } from '../../components/cards/Card';
import { Button } from '../../components/buttons/Button';
import { Badge } from '../../components/badges/Badge';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import { adminService, AdminDashboardData } from '../../services/adminService';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = () => {
    setIsLoading(true);
    setError(null);
    adminService
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err?.message || 'Failed to load dashboard metrics.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
        <div>
          <h2>Operational Platform Dashboard</h2>
          <p className="caption text-muted">Manage blogs, podcasts, stories, moderation queue, and categories.</p>
        </div>
        <div className="flex items-center gap-sm">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />} onClick={loadStats}>
            Refresh
          </Button>
          <NavLink to="/admin/articles/new" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
              Create Blog
            </Button>
          </NavLink>
        </div>
      </div>

      {error && (
        <div className="card p-md text-danger" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          {error}
        </div>
      )}

      {/* Operational Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <AdminStatCard
              title="Blog Articles"
              total={stats.articles.total}
              published={stats.articles.published}
              draft={stats.articles.draft}
              icon={<FileText size={18} />}
              variant="primary"
            />
            <AdminStatCard
              title="Podcast Episodes"
              total={stats.podcasts.total}
              published={stats.podcasts.published}
              draft={stats.podcasts.draft}
              icon={<Headphones size={18} />}
              variant="info"
            />
            <AdminStatCard
              title="Digital Stories"
              total={stats.stories.total}
              published={stats.stories.published}
              draft={stats.stories.draft}
              icon={<HeartHandshake size={18} />}
              variant="warning"
            />
            <AdminStatCard
              title="Moderation Queue"
              total={stats.pending_moderation_count}
              published={0}
              draft={stats.pending_moderation_count}
              icon={<ShieldAlert size={18} />}
              variant="warning"
            />
          </div>
        )
      )}

      {/* Quick Action Navigation Grid */}
      <section>
        <h3 className="mb-4">Quick Management Portals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable className="p-lg flex flex-col justify-between gap-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="info">BLOGS</Badge>
                <FileText size={20} className="text-primary" />
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Articles & Editorial</h4>
              <p className="caption text-muted">Create, edit, publish, and manage student blog articles.</p>
            </div>
            <NavLink to="/admin/articles" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" className="w-full">
                Manage Blogs
              </Button>
            </NavLink>
          </Card>

          <Card hoverable className="p-lg flex flex-col justify-between gap-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="info">PODCASTS</Badge>
                <Headphones size={20} className="text-info" />
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Audio Podcast Episodes</h4>
              <p className="caption text-muted">Upload and manage audio episodes and transcripts.</p>
            </div>
            <NavLink to="/admin/podcasts" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" className="w-full">
                Manage Podcasts
              </Button>
            </NavLink>
          </Card>

          <Card hoverable className="p-lg flex flex-col justify-between gap-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="warning">MODERATION</Badge>
                <ShieldAlert size={20} className="text-warning" />
              </div>
              <h4 style={{ fontSize: '1.1rem' }}>Content Safety Queue</h4>
              <p className="caption text-muted">Review student stories and AI generated content safety.</p>
            </div>
            <NavLink to="/admin/moderation" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" className="w-full">
                Open Moderation Queue
              </Button>
            </NavLink>
          </Card>
        </div>
      </section>
    </div>
  );
};
