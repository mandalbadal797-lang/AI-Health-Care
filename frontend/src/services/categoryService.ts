import { apiClient } from './apiClient';
import { Category } from '../types/domain';

export interface CategoryListResponse {
  items: Category[];
  total: number;
}

export const categoryService = {
  /**
   * Fetch all categories from backend API.
   */
  async getCategories(): Promise<Category[]> {
    const data = await apiClient.get<CategoryListResponse>('/categories');
    return data.items;
  },

  /**
   * Fetch single category detail by slug.
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    return await apiClient.get<Category>(`/categories/${slug}`);
  },
};
