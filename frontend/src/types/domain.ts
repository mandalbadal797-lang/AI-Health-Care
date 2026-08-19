export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  article_count?: number;
  created_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export type PublicationStatus = 'draft' | 'pending_review' | 'published' | 'archived';

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  reading_time_minutes: number;
  author_name: string;
  publication_status: PublicationStatus;
  is_ai_generated: boolean;
  created_at: string;
}

export interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: Category;
  reading_time_minutes: number;
  author_name: string;
  publication_status: PublicationStatus;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  related_articles: ArticleSummary[];
}

export interface PaginatedArticleResponse {
  items: ArticleSummary[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PodcastSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  duration_formatted: string;
  episode_number: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  publication_status: PublicationStatus;
  created_at: string;
}

export interface PodcastDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  duration_formatted: string;
  episode_number: number;
  category: Category;
  transcript?: string;
  publication_status: PublicationStatus;
  created_at: string;
  related_podcasts: PodcastSummary[];
}

export interface PaginatedPodcastResponse {
  items: PodcastSummary[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface StorySummary {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  cover_image?: string;
  author_name: string;
  reading_time_minutes: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  publication_status: PublicationStatus;
  created_at: string;
}

export interface StoryDetail {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  content: string;
  cover_image?: string;
  author_name: string;
  reading_time_minutes: number;
  category: Category;
  reflection_question?: string;
  key_takeaway?: string;
  publication_status: PublicationStatus;
  created_at: string;
  related_stories: StorySummary[];
}

export interface PaginatedStoryResponse {
  items: StorySummary[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string;
  audio_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  episode_number: number;
  category_id: number;
  transcript?: string;
  publication_status: PublicationStatus;
  created_at: string;
}

export interface StorySection {
  id: string;
  story_id: string;
  section_order: number;
  title?: string;
  content: string;
  image_url?: string;
  quote?: string;
  audio_url?: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image?: string;
  category_id: number;
  reflection_question?: string;
  key_takeaway?: string;
  publication_status: PublicationStatus;
  sections?: StorySection[];
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  content_type: 'article' | 'podcast' | 'story';
  content_id: string;
  created_at: string;
}
