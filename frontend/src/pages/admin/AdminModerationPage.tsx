import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Sparkles,
  Send,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Hero } from '../../components/typography/Hero';
import { Badge } from '../../components/badges/Badge';
import { Button } from '../../components/buttons/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/feedback/Skeleton';
import {
  moderationService,
  ModerationQueueItem,
  ModerationKPIs,
  ReviewDetailResponse,
} from '../../services/moderationService';

export const AdminModerationPage: React.FC = () => {
  const [kpis, setKpis] = useState<ModerationKPIs | null>(null);
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [aiFilter, setAiFilter] = useState<string>('');

  // Selected Detail Modal State
  const [selectedReview, setSelectedReview] = useState<ReviewDetailResponse | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionReason, setActionReason] = useState<string>('');
  const [isActionSubmitting, setIsActionSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, typeFilter, aiFilter]);

  const loadData = () => {
    setIsLoading(true);
    moderationService.getKPIs().then(setKpis).catch(() => {});

    const isAiBool = aiFilter === 'true' ? true : aiFilter === 'false' ? false : undefined;
    moderationService
      .getQueue({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        type: typeFilter || undefined,
        is_ai_generated: isAiBool,
      })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleOpenDetail = (reviewId: string) => {
    setSelectedReview(null);
    setActionNotes('');
    setActionReason('');

    moderationService
      .getReviewDetail(reviewId)
      .then(setSelectedReview)
      .catch(() => setFeedbackMsg('Failed to load review detail.'));
  };

  const handleExecuteAction = (action: 'approve' | 'request_changes' | 'reject' | 'escalate') => {
    if (!selectedReview) return;
    setIsActionSubmitting(true);
    setFeedbackMsg(null);

    moderationService
      .executeReviewAction(selectedReview.id, action, actionNotes, actionReason)
      .then(() => {
        setFeedbackMsg(`Action '${action.toUpperCase()}' recorded successfully.`);
        setSelectedReview(null);
        loadData();
      })
      .catch((err) => setFeedbackMsg(err.message || 'Action failed.'))
      .finally(() => setIsActionSubmitting(false));
  };

  const handlePublish = (contentId: string, contentType: 'article' | 'podcast' | 'story') => {
    setIsActionSubmitting(true);
    setFeedbackMsg(null);

    moderationService
      .publishApprovedContent(contentId, contentType)
      .then(() => {
        setFeedbackMsg('Content published successfully to public platform.');
        setSelectedReview(null);
        loadData();
      })
      .catch((err) => setFeedbackMsg(err.message || 'Publishing denied.'))
      .finally(() => setIsActionSubmitting(false));
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Header */}
      <Hero
        eyebrow="Platform Moderation Portal"
        title="Content Moderation"
        subtitle="Review, validate, and approve student-focused content before publication."
      />

      {feedbackMsg && (
        <div className="card p-4 mb-6 bg-subtle text-primary font-medium text-small flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setFeedbackMsg(null)}>Dismiss</button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card p-4 flex flex-col justify-between">
          <span className="caption text-muted font-bold block">Pending Reviews</span>
          <span className="text-h3 font-bold text-warning">{kpis?.pending_reviews ?? 0}</span>
        </div>
        <div className="card p-4 flex flex-col justify-between" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <span className="caption text-muted font-bold block">High Priority</span>
          <span className="text-h3 font-bold text-danger">{kpis?.high_priority_reviews ?? 0}</span>
        </div>
        <div className="card p-4 flex flex-col justify-between">
          <span className="caption text-muted font-bold block">Changes Requested</span>
          <span className="text-h3 font-bold text-main">{kpis?.changes_requested ?? 0}</span>
        </div>
        <div className="card p-4 flex flex-col justify-between">
          <span className="caption text-muted font-bold block">Approved</span>
          <span className="text-h3 font-bold text-success">{kpis?.approved ?? 0}</span>
        </div>
        <div className="card p-4 flex flex-col justify-between">
          <span className="caption text-muted font-bold block">Rejected</span>
          <span className="text-h3 font-bold text-muted">{kpis?.rejected ?? 0}</span>
        </div>
        <div className="card p-4 flex flex-col justify-between">
          <span className="caption text-muted font-bold block">Published</span>
          <span className="text-h3 font-bold text-primary">{kpis?.published ?? 0}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="caption font-semibold text-muted block mb-1">Status</label>
          <select className="form-input text-small py-1" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="under_review">Under Review</option>
            <option value="submitted_for_review">Submitted</option>
            <option value="approved">Approved</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label className="caption font-semibold text-muted block mb-1">Priority</label>
          <select className="form-input text-small py-1" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="caption font-semibold text-muted block mb-1">Format</label>
          <select className="form-input text-small py-1" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Formats</option>
            <option value="article">Blog</option>
            <option value="podcast">Podcast</option>
            <option value="story">Digital Story</option>
          </select>
        </div>

        <div>
          <label className="caption font-semibold text-muted block mb-1">Source Origin</label>
          <select className="form-input text-small py-1" value={aiFilter} onChange={(e) => setAiFilter(e.target.value)}>
            <option value="">All Origins</option>
            <option value="true">AI Assisted</option>
            <option value="false">Human Authored</option>
          </select>
        </div>
      </div>

      {/* Moderation Review Queue Table */}
      <div className="card p-6">
        <h3 className="text-h4 font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
          Review Queue ({total})
        </h3>

        {isLoading ? (
          <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
              <thead>
                <tr className="bg-subtle border-b text-small font-semibold" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="p-3">Content Resource</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Origin</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Safety Scan</th>
                  <th className="p-3">Review Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-subtle transition-colors text-small" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="p-3 font-semibold text-main">{item.title}</td>
                    <td className="p-3">
                      <Badge variant="info">{item.content_type.toUpperCase()}</Badge>
                    </td>
                    <td className="p-3 text-muted">v{item.version}</td>
                    <td className="p-3">
                      {item.is_ai_generated ? (
                        <Badge variant="warning"><Sparkles size={10} /> AI Assisted</Badge>
                      ) : (
                        <span className="caption text-muted font-medium">Human</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant={item.priority === 'high' || item.priority === 'critical' ? 'danger' : 'info'}>
                        {item.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={item.safety_status === 'pass' ? 'success' : 'warning'}>
                        {item.safety_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={item.status === 'approved' || item.status === 'published' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>
                        {item.status.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="primary" size="sm" onClick={() => handleOpenDetail(item.id)}>
                        Inspect & Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Items in Moderation Queue" description="Content submitted for administrative approval will appear in this queue." />
        )}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 glass flex items-center justify-center p-4" style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="card p-6 w-full max-w-4xl max-h-screen overflow-y-auto space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-h3 font-bold">Review Resource ({selectedReview.content_type.toUpperCase()})</h3>
                <p className="caption text-muted">Review ID: {selectedReview.id} • Version {selectedReview.version}</p>
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedReview(null)}>Close</button>
            </div>

            {/* Automated Safety Check Results */}
            <div>
              <h4 className="font-bold text-small mb-3 flex items-center gap-xs">
                <ShieldAlert size={18} className="text-primary" /> Automated Safety Scan Findings
              </h4>
              <div className="space-y-2">
                {selectedReview.safety_checks.map((chk) => (
                  <div key={chk.id} className="p-3 rounded bg-subtle border text-small flex items-start justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <span className="font-bold text-main block">{chk.name}</span>
                      <p className="text-xs text-secondary mt-1">{chk.details}</p>
                    </div>
                    <Badge variant={chk.status === 'pass' ? 'success' : 'warning'}>{chk.status.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Decision Form */}
            <div className="p-4 border rounded bg-subtle space-y-4" style={{ borderColor: 'var(--border-color)' }}>
              <h4 className="font-bold text-small">Reviewer Action & Decision Notes</h4>

              <div>
                <label className="form-label" htmlFor="actionNotes">Reviewer Notes (Optional for approval, required for changes requested)</label>
                <textarea
                  id="actionNotes"
                  className="form-input"
                  rows={3}
                  placeholder="Provide feedback for content author..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleExecuteAction('approve')}
                    isLoading={isActionSubmitting}
                    leftIcon={<CheckCircle size={14} />}
                  >
                    Approve Content
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteAction('request_changes')}
                    isLoading={isActionSubmitting}
                    leftIcon={<RotateCcw size={14} />}
                  >
                    Request Changes
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (!actionReason) {
                        const r = prompt('Please enter rejection reason:');
                        if (r) setActionReason(r);
                      }
                      handleExecuteAction('reject');
                    }}
                    isLoading={isActionSubmitting}
                    leftIcon={<XCircle size={14} />}
                  >
                    Reject
                  </Button>
                </div>

                {selectedReview.status === 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePublish(selectedReview.content_id, selectedReview.content_type)}
                    isLoading={isActionSubmitting}
                    leftIcon={<Send size={14} />}
                  >
                    Publish to Platform
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
