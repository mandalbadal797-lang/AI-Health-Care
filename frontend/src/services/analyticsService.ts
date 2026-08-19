import { apiClient } from './apiClient';

export interface OverviewKPIs {
  period: string;
  total_views: number;
  views_change_pct?: number | null;
  unique_viewers: number;
  total_saves: number;
  saves_change_pct?: number | null;
  total_completions: number;
  completion_rate: number;
  avg_progress_percent: number;
  total_feedback: number;
  helpful_rate: number;
  average_rating: number;
}

export interface ContentPerformanceItem {
  id: string;
  title: string;
  type: 'article' | 'podcast' | 'story';
  url: string;
  views: number;
  saves: number;
  completions: number;
  completion_rate: number;
  rating: number;
  helpful_rate: number;
  feedback_count: number;
}

export interface CategoryAnalyticsItem {
  id: number;
  name: string;
  slug: string;
  content_count: number;
  views: number;
  saves: number;
  completion_rate: number;
  average_rating: number;
}

export interface AnalyticsTrends {
  dates: string[];
  views: number[];
  saves: number[];
  completions: number[];
  feedback: number[];
}

export interface OperationalInsight {
  id: string;
  type: 'opportunity' | 'success' | 'info';
  title: string;
  content_title: string;
  content_type: string;
  url: string;
  observation: string;
  recommendation: string;
  sample_size: string;
}

export const analyticsService = {
  async getOverviewKPIs(params?: { period?: string; type?: string; category_id?: number }): Promise<OverviewKPIs> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.type) query.append('type', params.type);
    if (params?.category_id) query.append('category_id', params.category_id.toString());

    return await apiClient.get<OverviewKPIs>(`/admin/analytics/overview?${query.toString()}`);
  },

  async getContentPerformance(params?: {
    type?: string;
    category_id?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; page: number; limit: number; items: ContentPerformanceItem[] }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return await apiClient.get<{ total: number; page: number; limit: number; items: ContentPerformanceItem[] }>(
      `/admin/analytics/content?${query.toString()}`
    );
  },

  async getCategoryAnalytics(): Promise<CategoryAnalyticsItem[]> {
    const res = await apiClient.get<{ categories: CategoryAnalyticsItem[] }>('/admin/analytics/categories');
    return res.categories || [];
  },

  async getTrends(period: string = '30d'): Promise<AnalyticsTrends> {
    return await apiClient.get<AnalyticsTrends>(`/admin/analytics/trends?period=${period}`);
  },

  async getInsights(): Promise<OperationalInsight[]> {
    const res = await apiClient.get<{ insights: OperationalInsight[] }>('/admin/analytics/insights');
    return res.insights || [];
  },
};
