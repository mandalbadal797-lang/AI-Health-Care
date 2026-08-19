import { apiClient } from './apiClient';
import { PodcastDetail, PaginatedPodcastResponse } from '../types/domain';

export interface GetPodcastsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const podcastService = {
  /**
   * Fetch published podcast episodes from API with pagination, category filter, and search.
   */
  async getPodcasts(params: GetPodcastsParams = {}): Promise<PaginatedPodcastResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.category) queryParams.category = params.category;
    if (params.search) queryParams.search = params.search;

    return await apiClient.get<PaginatedPodcastResponse>('/podcasts', queryParams);
  },

  /**
   * Fetch single podcast episode detail by unique slug along with transcript and related episodes.
   */
  async getPodcastBySlug(slug: string): Promise<PodcastDetail> {
    return await apiClient.get<PodcastDetail>(`/podcasts/${slug}`);
  },
};
