import { apiClient } from './apiClient';

export interface ModerationQueueItem {
  id: string;
  content_id: string;
  content_type: 'article' | 'podcast' | 'story';
  title: string;
  version: number;
  status: 'submitted_for_review' | 'automated_review' | 'under_review' | 'approved' | 'changes_requested' | 'rejected' | 'escalated' | 'published';
  priority: 'low' | 'normal' | 'high' | 'critical';
  is_ai_generated: boolean;
  safety_status: 'pass' | 'warning' | 'fail';
  created_at: string;
}

export interface ModerationQueueResponse {
  total: number;
  page: number;
  limit: number;
  items: ModerationQueueItem[];
}

export interface ModerationKPIs {
  pending_reviews: number;
  high_priority_reviews: number;
  changes_requested: number;
  approved: number;
  rejected: number;
  published: number;
}

export interface SafetyCheckItem {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export interface ReviewCommentItem {
  id: string;
  comment_type: 'general' | 'safety' | 'fact_check' | 'editorial';
  content: string;
  is_resolved: boolean;
  created_at: string;
}

export interface ReviewDetailResponse {
  id: string;
  content_id: string;
  content_type: 'article' | 'podcast' | 'story';
  version: number;
  status: string;
  priority: string;
  is_ai_generated: boolean;
  safety_status: string;
  reviewer_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  safety_checks: SafetyCheckItem[];
  comments: ReviewCommentItem[];
}

export const moderationService = {
  async getQueue(params: {
    status?: string;
    priority?: string;
    type?: string;
    is_ai_generated?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ModerationQueueResponse> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.type) query.append('type', params.type);
    if (params.is_ai_generated !== undefined) query.append('is_ai_generated', String(params.is_ai_generated));
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const path = `/admin/moderation${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ModerationQueueResponse>(path);
  },

  async getKPIs(): Promise<ModerationKPIs> {
    return apiClient.get<ModerationKPIs>('/admin/moderation/kpis');
  },

  async getReviewDetail(reviewId: string): Promise<ReviewDetailResponse> {
    return apiClient.get<ReviewDetailResponse>(`/admin/moderation/${reviewId}`);
  },

  async submitForReview(contentId: string, contentType: string): Promise<any> {
    return apiClient.post('/admin/moderation/submit', { content_id: contentId, content_type: contentType });
  },

  async executeReviewAction(
    reviewId: string,
    action: 'approve' | 'request_changes' | 'reject' | 'escalate',
    reviewerNotes?: string,
    rejectionReason?: string
  ): Promise<any> {
    return apiClient.post(`/admin/moderation/${reviewId}/action`, {
      action,
      reviewer_notes: reviewerNotes,
      rejection_reason: rejectionReason,
    });
  },

  async publishApprovedContent(contentId: string, contentType: string): Promise<any> {
    return apiClient.post(`/admin/moderation/${contentId}/publish`, { content_type: contentType });
  },
};
