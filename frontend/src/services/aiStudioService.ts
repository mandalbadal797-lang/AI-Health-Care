import { apiClient } from './apiClient';

export interface AIGenerationItem {
  id: string;
  operation_type: string;
  content_type: string;
  topic?: string;
  output: any;
  status: 'generated' | 'under_review' | 'approved' | 'rejected';
  safety_status: 'pass' | 'needs_human_review';
  created_at: string;
}

export interface ContentIdeaItem {
  id: string;
  title: string;
  content_type: 'article' | 'podcast' | 'story';
  target_audience: string;
  problem_need: string;
  suggested_angle: string;
  reason_analytics?: string;
}

export interface AnalysisResult {
  word_count: number;
  estimated_reading_time_minutes: number;
  sentence_count: number;
  avg_sentence_length: number;
  readability_label: string;
  safety_status: string;
  safety_flags: string[];
}

export const aiStudioService = {
  async generateContentDraft(params: {
    content_type: string;
    topic: string;
    audience?: string;
    purpose?: string;
    tone?: string;
    length?: string;
    category_id?: number;
    keywords?: string[];
  }): Promise<AIGenerationItem> {
    return await apiClient.post<AIGenerationItem>('/admin/ai/content/generate', params);
  },

  async improveContent(params: {
    text: string;
    operation?: string;
    content_type?: string;
    source_content_id?: string;
  }): Promise<{ generation_id: string; output: any; status: string; created_at: string }> {
    return await apiClient.post('/admin/ai/content/improve', params);
  },

  async analyzeContent(params: { text: string; content_type?: string }): Promise<AnalysisResult> {
    return await apiClient.post<AnalysisResult>('/admin/ai/content/analyze', params);
  },

  async generateContentIdeas(params?: {
    category_id?: number;
    content_type?: string;
    include_analytics?: boolean;
  }): Promise<ContentIdeaItem[]> {
    const res = await apiClient.post<{ ideas: ContentIdeaItem[] }>('/admin/ai/content/ideas', params || {});
    return res.ideas || [];
  },

  async getGenerationHistory(): Promise<AIGenerationItem[]> {
    const res = await apiClient.get<{ items: AIGenerationItem[] }>('/admin/ai/history');
    return res.items || [];
  },

  async sendDraftToCMS(generationId: string): Promise<{ message: string; cms_id: string; content_type: string; publication_status: string }> {
    return await apiClient.post(`/admin/ai/history/${generationId}/send-to-cms`, {});
  },
};
