import { apiClient } from './apiClient';
import { ArticleDetail, PaginatedArticleResponse } from '../types/domain';

export interface GetArticlesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const articleService = {
  /**
   * Fetch published articles from API with pagination, category filter, and keyword search.
   */
  async getArticles(params: GetArticlesParams = {}): Promise<PaginatedArticleResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.category) queryParams.category = params.category;
    if (params.search) queryParams.search = params.search;

    return await apiClient.get<PaginatedArticleResponse>('/articles', queryParams);
  },

  /**
   * Fetch single article detail by unique slug along with related articles.
   */
  async getArticleBySlug(slug: string): Promise<ArticleDetail> {
    return await apiClient.get<ArticleDetail>(`/articles/${slug}`);
  },
};
