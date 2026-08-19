import { apiClient } from './apiClient';
import { StoryDetail, PaginatedStoryResponse } from '../types/domain';

export interface GetStoriesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const storyService = {
  /**
   * Fetch published digital stories from API with pagination, category filter, and keyword search.
   */
  async getStories(params: GetStoriesParams = {}): Promise<PaginatedStoryResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.category) queryParams.category = params.category;
    if (params.search) queryParams.search = params.search;

    return await apiClient.get<PaginatedStoryResponse>('/stories', queryParams);
  },

  /**
   * Fetch single digital story detail by unique slug along with reflection question, takeaways, and related stories.
   */
  async getStoryBySlug(slug: string): Promise<StoryDetail> {
    return await apiClient.get<StoryDetail>(`/stories/${slug}`);
  },
};
