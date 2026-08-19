import { apiClient } from './apiClient';

const TOKEN_KEY = 'mindcampus_admin_token';
const ADMIN_USER_KEY = 'mindcampus_admin_user';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AdminDashboardData {
  articles: { total: number; published: number; draft: number };
  podcasts: { total: number; published: number; draft: number };
  stories: { total: number; published: number; draft: number };
  pending_moderation_count: number;
}

export interface AdminArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  reading_time_minutes: number;
  publication_status: string;
  is_ai_generated: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface AdminPodcastItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  episode_number: number;
  category_id: number;
  category_name: string;
  duration_seconds: number;
  publication_status: string;
  created_at: string;
}

export interface AdminStoryItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category_id: number;
  category_name: string;
  author_name: string;
  reading_time_minutes: number;
  publication_status: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  content_type: string;
  content_id: string;
  details: string;
  created_at: string;
}

export const adminService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAuth(token: string, user: AdminUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },

  getCurrentAdminUser(): AdminUser | null {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async login(email: string, password: string): Promise<AdminUser> {
    const res = await apiClient.post<any>('/auth/login', { email, password });
    if (res.user.role !== 'admin') {
      throw new Error('Access forbidden. Administrator credentials required.');
    }
    this.setAuth(res.access_token, res.user);
    return res.user;
  },

  async getDashboardStats(): Promise<AdminDashboardData> {
    return apiClient.get<AdminDashboardData>('/admin/dashboard');
  },

  // --- ARTICLES CRUD ---
  async getArticles(params: { page?: number; limit?: number; search?: string; status_filter?: string; category_id?: number } = {}): Promise<{ items: AdminArticleItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    if (params.category_id) query.append('category_id', params.category_id.toString());

    return apiClient.get<{ items: AdminArticleItem[]; total: number }>(`/admin/articles?${query.toString()}`);
  },

  async createArticle(data: any): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>('/admin/articles', data);
  },

  async getArticleById(id: string): Promise<any> {
    return apiClient.get<any>(`/admin/articles/${id}`);
  },

  async updateArticle(id: string, data: any): Promise<void> {
    return apiClient.put<void>(`/admin/articles/${id}`, data);
  },

  async publishArticle(id: string): Promise<void> {
    return apiClient.patch<void>(`/admin/articles/${id}/publish`);
  },

  async unpublishArticle(id: string): Promise<void> {
    return apiClient.patch<void>(`/admin/articles/${id}/unpublish`);
  },

  async deleteArticle(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/articles/${id}`);
  },

  // --- PODCASTS CRUD ---
  async getPodcasts(params: { page?: number; limit?: number; search?: string; status_filter?: string } = {}): Promise<{ items: AdminPodcastItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status_filter) query.append('status_filter', params.status_filter);

    return apiClient.get<{ items: AdminPodcastItem[]; total: number }>(`/admin/podcasts?${query.toString()}`);
  },

  async createPodcast(data: any): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>('/admin/podcasts', data);
  },

  async publishPodcast(id: string): Promise<void> {
    return apiClient.patch<void>(`/admin/podcasts/${id}/publish`);
  },

  async unpublishPodcast(id: string): Promise<void> {
    return apiClient.patch<void>(`/admin/podcasts/${id}/unpublish`);
  },

  async deletePodcast(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/podcasts/${id}`);
  },

  // --- STORIES CRUD & MODERATION ---
  async getStories(params: { page?: number; limit?: number; search?: string; status_filter?: string } = {}): Promise<{ items: AdminStoryItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status_filter) query.append('status_filter', params.status_filter);

    return apiClient.get<{ items: AdminStoryItem[]; total: number }>(`/admin/stories?${query.toString()}`);
  },

  async createStory(data: any): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>('/admin/stories', data);
  },

  async publishStory(id: string): Promise<void> {
    return apiClient.patch<void>(`/admin/stories/${id}/publish`);
  },

  async unpublishStory(id: string): Promise<void> {
    return apiClient.patch<void>(`/admin/stories/${id}/unpublish`);
  },

  async deleteStory(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/stories/${id}`);
  },

  async getModerationQueue(): Promise<{ items: any[]; total: number }> {
    return apiClient.get<{ items: any[]; total: number }>('/admin/moderation');
  },

  // --- CATEGORIES & AUDIT LOGS ---
  async getCategories(): Promise<{ items: any[] }> {
    return apiClient.get<{ items: any[] }>('/admin/categories');
  },

  async getAuditLogs(params: { page?: number; limit?: number; action_filter?: string } = {}): Promise<{ items: AuditLogItem[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.action_filter) query.append('action_filter', params.action_filter);

    return apiClient.get<{ items: AuditLogItem[]; total: number }>(`/admin/audit-logs?${query.toString()}`);
  },
};
