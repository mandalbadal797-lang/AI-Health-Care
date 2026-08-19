import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Star, AlertTriangle, Check, X, Flag, Filter, ExternalLink, RefreshCw } from 'lucide-react';
import { Hero } from '../../components/typography/Hero';
import { Badge, BadgeVariant } from '../../components/badges/Badge';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import { feedbackService, AdminFeedbackDashboardResponse, AdminFeedbackItem } from '../../services/feedbackService';

export const AdminFeedbackPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminFeedbackDashboardResponse | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedbackId, setActionFeedbackId] = useState<string | null>(null);

  const loadData = () => {
    setIsLoading(true);
    feedbackService
      .getAdminFeedbackDashboard({
        type: typeFilter,
        moderation_status: statusFilter || undefined,
        page: 1,
        limit: 50,
      })
      .then(setDashboard)
      .catch(() => setDashboard(null))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, statusFilter]);

  const handleModerate = async (id: string, status: 'approved' | 'rejected' | 'flagged') => {
    setActionFeedbackId(id);
    const success = await feedbackService.moderateFeedback(id, status);
    setActionFeedbackId(null);
    if (success) {
      loadData();
    }
  };

  const summary = dashboard?.summary;

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'flagged') return 'warning';
    return 'info';
  };

  return (
    <div className="container py-6 animate-fade-in">
      <Hero
        eyebrow="Admin Content Management"
        title="Content Feedback & Quality Dashboard"
        subtitle="Monitor student helpfulness rates, star ratings, and review student feedback comments for content quality improvement."
      />

      {/* Aggregate Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <span className="text-small text-muted flex items-center gap-xs font-medium">
            <MessageSquare size={16} className="text-primary" /> Total Feedback Responses
          </span>
          <span className="display-heading text-primary mt-2">
            {summary ? summary.total_responses : '...'}
          </span>
        </div>

        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <span className="text-small text-muted flex items-center gap-xs font-medium">
            <ThumbsUp size={16} className="text-success" /> Overall Helpful Rate
          </span>
          <span className="display-heading text-success mt-2">
            {summary ? `${summary.overall_helpful_rate}%` : '...'}
          </span>
        </div>

        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <span className="text-small text-muted flex items-center gap-xs font-medium">
            <Star size={16} className="text-warning fill-warning" /> Overall Average Rating
          </span>
          <span className="display-heading text-warning mt-2">
            {summary ? `${summary.overall_average_rating.toFixed(1)} / 5` : '...'}
          </span>
        </div>

        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <span className="text-small text-muted flex items-center gap-xs font-medium">
            <AlertTriangle size={16} className="text-danger" /> Pending Moderation
          </span>
          <span className="display-heading text-danger mt-2">
            {summary ? summary.pending_moderation_count : '...'}
          </span>
        </div>
      </div>

      {/* Filter and Refresh Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
        <div className="flex items-center gap-sm flex-wrap w-full md:w-auto">
          <div className="flex items-center gap-xs text-muted text-small font-semibold">
            <Filter size={16} /> Filters:
          </div>

          <select
            className="form-input text-small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="all">All Content Formats</option>
            <option value="article">Blogs</option>
            <option value="podcast">Podcasts</option>
            <option value="story">Digital Stories</option>
          </select>

          <select
            className="form-input text-small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="">All Moderation States</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw size={14} />}>
          Refresh Queue
        </Button>
      </div>

      {/* Main Feedback Items List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : dashboard && dashboard.items.length > 0 ? (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
            <thead>
              <tr className="bg-subtle border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="p-3 text-small font-semibold">Content Resource</th>
                <th className="p-3 text-small font-semibold">Format</th>
                <th className="p-3 text-small font-semibold">Helpful</th>
                <th className="p-3 text-small font-semibold">Rating</th>
                <th className="p-3 text-small font-semibold">Written Comment & Category</th>
                <th className="p-3 text-small font-semibold">Status</th>
                <th className="p-3 text-small font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.items.map((item: AdminFeedbackItem) => (
                <tr key={item.id} className="border-b hover:bg-subtle transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="p-3">
                    <a
                      href={item.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary inline-flex items-center gap-xs text-small"
                    >
                      {item.content_title} <ExternalLink size={12} />
                    </a>
                  </td>

                  <td className="p-3">
                    <Badge variant={item.content_type === 'article' ? 'info' : item.content_type === 'podcast' ? 'success' : 'warning'}>
                      {item.content_type}
                    </Badge>
                  </td>

                  <td className="p-3">
                    {item.is_helpful ? (
                      <span className="text-success font-semibold text-small">👍 Yes</span>
                    ) : (
                      <span className="text-danger font-semibold text-small">👎 No</span>
                    )}
                  </td>

                  <td className="p-3">
                    {item.rating ? (
                      <span className="flex items-center gap-xs text-small font-semibold text-warning">
                        <Star size={14} className="fill-warning" /> {item.rating} / 5
                      </span>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </td>

                  <td className="p-3" style={{ maxWidth: '350px' }}>
                    <div className="flex items-center gap-xs mb-1">
                      <Badge variant="info" className="text-xs">
                        AI: {item.ai_category}
                      </Badge>
                      {item.category_tags?.map((t) => (
                        <span key={t} className="caption text-muted bg-subtle px-1 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-small text-secondary italic">
                      {item.comment ? `"${item.comment}"` : <span className="text-muted font-normal">(No written comment)</span>}
                    </p>
                  </td>

                  <td className="p-3">
                    <Badge variant={getStatusBadgeVariant(item.moderation_status)}>
                      {item.moderation_status}
                    </Badge>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-xs">
                      {item.moderation_status !== 'approved' && (
                        <button
                          onClick={() => handleModerate(item.id, 'approved')}
                          disabled={actionFeedbackId === item.id}
                          className="btn btn-xs btn-success p-1"
                          title="Approve feedback"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {item.moderation_status !== 'rejected' && (
                        <button
                          onClick={() => handleModerate(item.id, 'rejected')}
                          disabled={actionFeedbackId === item.id}
                          className="btn btn-xs btn-ghost text-danger p-1"
                          title="Reject feedback"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {item.moderation_status !== 'flagged' && (
                        <button
                          onClick={() => handleModerate(item.id, 'flagged')}
                          disabled={actionFeedbackId === item.id}
                          className="btn btn-xs btn-ghost text-warning p-1"
                          title="Flag feedback"
                        >
                          <Flag size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Feedback Records Found"
          description="No student feedback matches your selected filters."
        />
      )}
    </div>
  );
};
