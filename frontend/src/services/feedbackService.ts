import { apiClient } from './apiClient';

export interface FeedbackSummary {
  total_responses: number;
  helpful_count: number;
  not_helpful_count: number;
  helpful_rate: number;
  average_rating: number;
  rating_count: number;
  rating_distribution: Record<number, number>;
}

export interface StudentFeedbackRecord {
  id: string;
  content_id: string;
  content_type: 'article' | 'podcast' | 'story';
  is_helpful: boolean;
  rating?: number;
  category_tags?: string[];
  comment?: string;
  updated_at: string;
}

export interface AdminFeedbackItem {
  id: string;
  content_id: string;
  content_type: 'article' | 'podcast' | 'story';
  content_title: string;
  content_url: string;
  is_helpful: boolean;
  rating?: number;
  category_tags?: string[];
  comment?: string;
  ai_category: string;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
}

export interface AdminFeedbackDashboardResponse {
  summary: {
    total_responses: number;
    pending_moderation_count: number;
    overall_helpful_rate: number;
    overall_average_rating: number;
  };
  page: number;
  limit: number;
  total: number;
  items: AdminFeedbackItem[];
}

export const feedbackService = {
  async submitFeedback(
    contentId: string,
    payload: {
      content_type: 'article' | 'podcast' | 'story';
      is_helpful: boolean;
      rating?: number;
      category_tags?: string[];
      comment?: string;
    }
  ): Promise<boolean> {
    try {
      await apiClient.post(`/content/${contentId}/feedback`, payload);
      return true;
    } catch {
      return false;
    }
  },

  async getMyFeedback(contentId: string, type: 'article' | 'podcast' | 'story'): Promise<StudentFeedbackRecord | null> {
    try {
      const res = await apiClient.get<{ feedback: StudentFeedbackRecord | null }>(
        `/content/${contentId}/feedback/me?type=${type}`
      );
      return res.feedback;
    } catch {
      return null;
    }
  },

  async deleteMyFeedback(contentId: string, type: 'article' | 'podcast' | 'story'): Promise<boolean> {
    try {
      await apiClient.delete(`/content/${contentId}/feedback/me?type=${type}`);
      return true;
    } catch {
      return false;
    }
  },

  async getFeedbackSummary(contentId: string, type: 'article' | 'podcast' | 'story'): Promise<FeedbackSummary> {
    try {
      return await apiClient.get<FeedbackSummary>(`/content/${contentId}/feedback/summary?type=${type}`);
    } catch {
      return {
        total_responses: 0,
        helpful_count: 0,
        not_helpful_count: 0,
        helpful_rate: 0.0,
        average_rating: 0.0,
        rating_count: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  },

  async getAdminFeedbackDashboard(params?: {
    type?: string;
    moderation_status?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminFeedbackDashboardResponse> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.moderation_status) query.append('moderation_status', params.moderation_status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return await apiClient.get<AdminFeedbackDashboardResponse>(`/admin/feedback?${query.toString()}`);
  },

  async moderateFeedback(feedbackId: string, status: 'approved' | 'rejected' | 'flagged', reason?: string): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/feedback/${feedbackId}/moderate`, { status, reason });
      return true;
    } catch {
      return false;
    }
  },
};
