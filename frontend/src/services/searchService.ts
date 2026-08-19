import { apiClient } from './apiClient';

export interface SearchResultItem {
  id: string;
  type: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  reading_time_minutes?: number;
  duration_seconds?: number;
  episode_number?: number;
  author_name?: string;
  url: string;
  published_at: string;
  relevance_score?: number;
}

export interface SearchResponse {
  query: string;
  content_type: string;
  sort: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  items: SearchResultItem[];
}

export interface SearchSuggestion {
  title: string;
  type: 'article' | 'podcast' | 'story';
  slug: string;
  url: string;
}

export const searchService = {
  async search(params: {
    q?: string;
    type?: string;
    category_id?: number;
    category_slug?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.type) query.append('type', params.type);
    if (params.category_id) query.append('category_id', params.category_id.toString());
    if (params.category_slug) query.append('category_slug', params.category_slug);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    return apiClient.get<SearchResponse>(`/search?${query.toString()}`);
  },

  async getSuggestions(q: string): Promise<SearchSuggestion[]> {
    if (!q || !q.trim()) return [];
    const res = await apiClient.get<{ suggestions: SearchSuggestion[] }>(
      `/search/suggestions?q=${encodeURIComponent(q.trim())}`
    );
    return res.suggestions || [];
  },

  async getRelatedContent(type: string, id: string, categoryId: number, limit: number = 3): Promise<SearchResultItem[]> {
    const res = await apiClient.get<{ items: SearchResultItem[] }>(
      `/search/related?type=${type}&id=${id}&category_id=${categoryId}&limit=${limit}`
    );
    return res.items || [];
  },

  async aiTranslate(naturalQuery: string): Promise<{ translated_query: string; recommendation_prompt?: string }> {
    return apiClient.post<{ translated_query: string; recommendation_prompt?: string }>('/search/ai-translate', {
      natural_query: naturalQuery,
    });
  },
};
