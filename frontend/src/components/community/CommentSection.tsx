import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  CornerDownRight,
  Flag,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../buttons/Button';
import { Badge } from '../badges/Badge';
import { EmptyState } from '../common/EmptyState';
import { CardSkeleton } from '../feedback/Skeleton';
import { communityService, CommentItem } from '../../services/communityService';
import { adminService } from '../../services/adminService';

interface CommentSectionProps {
  contentId: string;
  contentType: 'article' | 'podcast' | 'story';
}

export const CommentSection: React.FC<CommentSectionProps> = ({ contentId, contentType }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [commentBody, setCommentBody] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Active Reply Target
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState<string>('');

  // Active Edit Target
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState<string>('');

  // Report Modal State
  const [reportingTarget, setReportingTarget] = useState<{ id: string; type: 'comment' | 'content' } | null>(null);
  const [reportReason, setReportReason] = useState<string>('inappropriate');
  const [reportDesc, setReportDesc] = useState<string>('');
  const [isReporting, setIsReporting] = useState<boolean>(false);

  const currentUser = adminService.getCurrentAdminUser();

  useEffect(() => {
    loadComments();
  }, [contentId, contentType]);

  const loadComments = () => {
    setIsLoading(true);
    communityService
      .getContentComments(contentId, contentType)
      .then((res) => {
        setComments(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    communityService
      .createComment(contentId, contentType, commentBody)
      .then(() => {
        setCommentBody('');
        setFeedbackMsg('Your comment has been posted successfully.');
        loadComments();
      })
      .catch((err) => setFeedbackMsg(err.message || 'Failed to post comment.'))
      .finally(() => setIsSubmitting(false));
  };

  const handlePostReply = (parentId: string) => {
    if (!replyBody.trim()) return;

    setIsSubmitting(true);
    setFeedbackMsg(null);

    communityService
      .createComment(contentId, contentType, replyBody, parentId)
      .then(() => {
        setReplyParentId(null);
        setReplyBody('');
        setFeedbackMsg('Your reply has been posted.');
        loadComments();
      })
      .catch((err) => setFeedbackMsg(err.message || 'Failed to post reply.'))
      .finally(() => setIsSubmitting(false));
  };

  const handleToggleHelpful = (commentId: string) => {
    communityService
      .toggleHelpful(commentId)
      .then(() => loadComments())
      .catch(() => {});
  };

  const handleEditSubmit = (commentId: string) => {
    if (!editBody.trim()) return;

    setIsSubmitting(true);
    communityService
      .editComment(commentId, editBody)
      .then(() => {
        setEditingCommentId(null);
        setEditBody('');
        setFeedbackMsg('Comment updated.');
        loadComments();
      })
      .catch((err) => setFeedbackMsg(err.message || 'Failed to update comment.'))
      .finally(() => setIsSubmitting(false));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Are you sure you want to delete your comment?')) return;

    communityService
      .deleteComment(commentId)
      .then(() => {
        setFeedbackMsg('Comment deleted.');
        loadComments();
      })
      .catch((err) => setFeedbackMsg(err.message || 'Failed to delete comment.'));
  };

  const handleReportSubmit = () => {
    if (!reportingTarget) return;

    setIsReporting(true);
    communityService
      .submitReport(reportingTarget.type, reportingTarget.id, reportReason, reportDesc, contentType)
      .then(() => {
        setReportingTarget(null);
        setReportDesc('');
        setFeedbackMsg('Thank you. Your report has been submitted for administrative review.');
      })
      .catch((err) => setFeedbackMsg(err.message || 'Failed to submit report.'))
      .finally(() => setIsReporting(false));
  };

  return (
    <div className="card p-6 mt-8 space-y-6">
      {/* Header & Guidelines */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-h4 font-bold flex items-center gap-xs">
          <MessageSquare className="text-primary" size={20} /> Community Discussion ({total})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReportingTarget({ id: contentId, type: 'content' })}
          leftIcon={<Flag size={14} />}
        >
          Report Content
        </Button>
      </div>

      {/* Community Guidelines Banner */}
      <div className="bg-subtle p-3 rounded-md border text-small flex items-start gap-xs" style={{ borderColor: 'var(--border-color)' }}>
        <ShieldCheck className="text-success flex-shrink-0 mt-0.5" size={16} />
        <p className="caption text-secondary">
          <strong>Community Guidelines:</strong> Be respectful, supportive, and constructive. Do not share private credentials, offer medical advice, or harass others.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-subtle text-primary font-medium text-small rounded flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button className="btn btn-xs btn-ghost" onClick={() => setFeedbackMsg(null)}>Dismiss</button>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handlePostComment} className="space-y-3">
        <textarea
          className="form-input"
          rows={3}
          placeholder="Share your thoughts constructively..."
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          maxLength={1000}
          required
        />
        <div className="flex items-center justify-between">
          <span className="caption text-muted">{commentBody.length}/1000 characters</span>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Send size={14} />}>
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 pt-2">
          {comments.map((item) => (
            <div key={item.id} className="p-4 rounded-md bg-subtle border space-y-3" style={{ borderColor: 'var(--border-color)' }}>
              {/* Comment Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-xs">
                  <span className="font-bold text-small text-main">{item.author_name}</span>
                  {item.is_edited && <span className="caption text-muted italic">(edited)</span>}
                  <span className="caption text-muted">• {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant={item.status === 'approved' ? 'success' : 'warning'}>
                  {item.status.toUpperCase()}
                </Badge>
              </div>

              {/* Body or Edit Form */}
              {editingCommentId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    className="form-input text-small"
                    rows={2}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={() => handleEditSubmit(item.id)}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <p className="text-small text-main whitespace-pre-line">{item.body}</p>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-1 text-xs border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-md">
                  <button
                    className={`flex items-center gap-xs font-semibold hover:text-primary ${item.is_helpful ? 'text-primary' : 'text-muted'}`}
                    onClick={() => handleToggleHelpful(item.id)}
                  >
                    <ThumbsUp size={14} /> {item.helpful_count} Helpful
                  </button>

                  <button
                    className="flex items-center gap-xs font-semibold text-muted hover:text-main"
                    onClick={() => {
                      setReplyParentId(replyParentId === item.id ? null : item.id);
                      setReplyBody('');
                    }}
                  >
                    <CornerDownRight size={14} /> Reply ({item.replies.length})
                  </button>

                  <button
                    className="flex items-center gap-xs font-semibold text-muted hover:text-danger"
                    onClick={() => setReportingTarget({ id: item.id, type: 'comment' })}
                  >
                    <Flag size={14} /> Report
                  </button>
                </div>

                {currentUser && currentUser.id === item.user_id && (
                  <div className="flex items-center gap-2">
                    <button
                      className="text-muted hover:text-main"
                      onClick={() => {
                        setEditingCommentId(item.id);
                        setEditBody(item.body);
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button className="text-muted hover:text-danger" onClick={() => handleDeleteComment(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Reply Form */}
              {replyParentId === item.id && (
                <div className="pl-4 pt-2 border-l-2 space-y-2" style={{ borderColor: 'var(--color-primary)' }}>
                  <textarea
                    className="form-input text-small"
                    rows={2}
                    placeholder="Write a constructive reply..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setReplyParentId(null)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={() => handlePostReply(item.id)}>Post Reply</Button>
                  </div>
                </div>
              )}

              {/* Nested Level 1 Replies */}
              {item.replies.length > 0 && (
                <div className="pl-6 space-y-3 pt-2 border-l-2" style={{ borderColor: 'var(--border-color)' }}>
                  {item.replies.map((reply) => (
                    <div key={reply.id} className="p-3 rounded bg-canvas border text-small space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-main">{reply.author_name}</span>
                        <span className="caption text-muted">{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-secondary whitespace-pre-line">{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Comments Yet" description="Start a constructive, supportive discussion on this published resource." />
      )}

      {/* Community Report Modal */}
      {reportingTarget && (
        <div className="fixed inset-0 glass flex items-center justify-center p-4" style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="card p-6 w-full max-w-md space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
              <h4 className="font-bold text-lg flex items-center gap-xs">
                <AlertCircle className="text-warning" size={18} /> Report {reportingTarget.type.toUpperCase()}
              </h4>
              <button className="btn btn-sm btn-ghost" onClick={() => setReportingTarget(null)}>Cancel</button>
            </div>

            <div>
              <label className="form-label" htmlFor="reportReason">Report Category</label>
              <select id="reportReason" className="form-input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="inappropriate">Inappropriate Language</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="hate">Hate Speech</option>
                <option value="spam">Spam or Promotion</option>
                <option value="dangerous_advice">Dangerous / Unverified Advice</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="reportDesc">Additional Details (Optional)</label>
              <textarea
                id="reportDesc"
                className="form-input text-small"
                rows={3}
                placeholder="Explain why this content violates community guidelines..."
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReportingTarget(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleReportSubmit} isLoading={isReporting} leftIcon={<CheckCircle size={14} />}>
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
