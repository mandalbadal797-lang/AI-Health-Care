import { apiClient } from './apiClient';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  recommendations?: ContentRecommendation[];
  safetyLevel?: string;
}

export interface ContentRecommendation {
  id: string;
  type: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  url: string;
}

export interface AIChatResponse {
  message: string;
  recommendations: ContentRecommendation[];
  safety_level: string;
  provider: string;
}

export interface AIRecommendResponse {
  query: string;
  recommendations: ContentRecommendation[];
}

export const aiService = {
  /**
   * Send student prompt message to AI Chat endpoint.
   */
  async sendMessage(message: string, history: { role: string; content: string }[] = []): Promise<AIChatResponse> {
    return await apiClient.post<AIChatResponse>('/ai/chat', { message, history });
  },

  /**
   * Get grounded content recommendations across blogs, podcasts, and stories for a specific search query.
   */
  async getRecommendations(query: string): Promise<AIRecommendResponse> {
    return await apiClient.post<AIRecommendResponse>('/ai/recommend', { query });
  },
};
