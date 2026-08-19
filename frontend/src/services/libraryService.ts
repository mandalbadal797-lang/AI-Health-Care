import { apiClient } from './apiClient';
import { personalizationStorage } from '../utils/personalizationStorage';

export interface LibraryItem {
  id: string;
  type: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  url: string;
  reading_time_minutes?: number;
  duration_seconds?: number;
  author_name?: string;
  saved_id?: string;
  saved_at?: string;
  progress_percent?: number;
  position_seconds?: number;
  is_completed?: boolean;
  last_accessed_at?: string;
  viewed_at?: string;
}

export const libraryService = {
  async getLibrary(params?: {
    type?: string;
    category_id?: number;
    sort?: string;
    q?: string;
  }): Promise<LibraryItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.type) query.append('type', params.type);
      if (params?.category_id) query.append('category_id', params.category_id.toString());
      if (params?.sort) query.append('sort', params.sort);
      if (params?.q) query.append('q', params.q);

      const res = await apiClient.get<{ items: LibraryItem[] }>(`/library?${query.toString()}`);
      return res.items || [];
    } catch {
      // Local fallback for guest / offline users
      const bookmarks = personalizationStorage.getBookmarks();
      return bookmarks.map((b) => ({
        id: b.id,
        type: b.contentType as 'article' | 'podcast' | 'story',
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        category_id: 1,
        category_name: b.category,
        url: b.url,
        saved_at: b.savedAt,
      }));
    }
  },

  async saveContent(contentId: string, contentType: string): Promise<boolean> {
    try {
      await apiClient.post('/library', {
        content_id: contentId,
        content_type: contentType,
      });
      return true;
    } catch {
      return false;
    }
  },

  async removeSavedContent(contentId: string, contentType: string): Promise<boolean> {
    try {
      await apiClient.delete(`/library/${contentId}?type=${contentType}`);
      return true;
    } catch {
      return false;
    }
  },

  async getProgressList(mode: 'all' | 'in_progress' | 'completed' = 'all'): Promise<LibraryItem[]> {
    try {
      const res = await apiClient.get<{ items: LibraryItem[] }>(`/library/progress?mode=${mode}`);
      return res.items || [];
    } catch {
      return [];
    }
  },

  async updateProgress(
    contentId: string,
    contentType: string,
    progressPercent: number,
    positionSeconds: number = 0.0,
    durationSeconds: number = 0.0
  ): Promise<boolean> {
    try {
      await apiClient.put(`/library/progress/${contentId}`, {
        content_type: contentType,
        progress_percent: progressPercent,
        position_seconds: positionSeconds,
        duration_seconds: durationSeconds,
      });
      return true;
    } catch {
      // Fallback local storage progress update
      personalizationStorage.saveProgress(
        contentType as 'article' | 'podcast' | 'story',
        contentId,
        progressPercent
      );
      return false;
    }
  },

  async getRecentlyViewed(): Promise<LibraryItem[]> {
    try {
      const res = await apiClient.get<{ items: LibraryItem[] }>('/library/recently-viewed');
      return res.items || [];
    } catch {
      return [];
    }
  },

  async trackRecentlyViewed(contentId: string, contentType: string): Promise<boolean> {
    try {
      await apiClient.post('/library/recently-viewed', {
        content_id: contentId,
        content_type: contentType,
      });
      return true;
    } catch {
      return false;
    }
  },
};
