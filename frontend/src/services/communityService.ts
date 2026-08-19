import { apiClient } from './apiClient';

export interface CommentReply {
  id: string;
  author_name: string;
  user_id: string;
  body: string;
  status: string;
  helpful_count: number;
  is_helpful: boolean;
  is_edited: boolean;
  created_at: string;
}

export interface CommentItem {
  id: string;
  author_name: string;
  user_id: string;
  body: string;
  status: string;
  helpful_count: number;
  is_helpful: boolean;
  is_edited: boolean;
  created_at: string;
  replies: CommentReply[];
}

export interface CommentsResponse {
  items: CommentItem[];
  total: number;
}

export const communityService = {
  async getContentComments(contentId: string, type: 'article' | 'podcast' | 'story'): Promise<CommentsResponse> {
    return apiClient.get<CommentsResponse>(`/community/content/${contentId}/comments?type=${type}`);
  },

  async createComment(
    contentId: string,
    type: 'article' | 'podcast' | 'story',
    body: string,
    parentCommentId?: string
  ): Promise<any> {
    return apiClient.post(`/community/content/${contentId}/comments`, {
      content_type: type,
      body,
      parent_comment_id: parentCommentId,
    });
  },

  async editComment(commentId: string, body: string): Promise<any> {
    return apiClient.patch(`/community/comments/${commentId}`, { body });
  },

  async deleteComment(commentId: string): Promise<any> {
    return apiClient.delete(`/community/comments/${commentId}`);
  },

  async toggleHelpful(commentId: string): Promise<{ comment_id: string; is_helpful: boolean; helpful_count: number }> {
    return apiClient.post<{ comment_id: string; is_helpful: boolean; helpful_count: number }>(
      `/community/comments/${commentId}/helpful`
    );
  },

  async submitReport(
    targetType: 'comment' | 'content',
    targetId: string,
    reason: string,
    description?: string,
    contentType?: string
  ): Promise<any> {
    return apiClient.post('/community/reports', {
      target_type: targetType,
      target_id: targetId,
      content_type: contentType,
      reason,
      description,
    });
  },
};
