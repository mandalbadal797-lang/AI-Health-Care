import { SavedItem, RecentItem } from './personalizationStorage';

export interface ContentCardItem {
  id: string;
  contentType: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  url: string;
  score?: number;
  reason?: string;
}

export const recommendationEngine = {
  /**
   * Calculate deterministic recommendation scores for candidate content items based on student interest preferences.
   */
  scoreAndRankContent(
    candidates: ContentCardItem[],
    selectedInterests: string[],
    bookmarks: SavedItem[],
    recentlyViewed: RecentItem[]
  ): ContentCardItem[] {
    const bookmarkedKeys = new Set(bookmarks.map((b) => `${b.contentType}:${b.id}`));
    const recentlyViewedKeys = new Set(recentlyViewed.map((r) => `${r.contentType}:${r.id}`));
    const savedCategories = new Set(bookmarks.map((b) => b.category.toLowerCase()));

    const scored = candidates.map((item) => {
      let score = 0;
      let reason = 'Recommended based on overall student popularity';

      const catLower = (item.categorySlug || item.category || '').toLowerCase();

      // Interest Match: +5
      if (selectedInterests.some((i) => i.toLowerCase() === catLower || item.category.toLowerCase().includes(i.toLowerCase()))) {
        score += 5;
        reason = `Because you selected ${item.category}`;
      }

      // Saved Category Match: +3
      if (savedCategories.has(item.category.toLowerCase())) {
        score += 3;
        if (reason.startsWith('Recommended')) {
          reason = `Based on your saved resources in ${item.category}`;
        }
      }

      // Freshness: +1
      score += 1;

      // Penalize already saved items so fresh content appears first: -5
      if (bookmarkedKeys.has(`${item.contentType}:${item.id}`)) {
        score -= 5;
      }

      // Penalize recently viewed items: -2
      if (recentlyViewedKeys.has(`${item.contentType}:${item.id}`)) {
        score -= 2;
      }

      return { ...item, score, reason };
    });

    // Sort descending by score
    return scored.sort((a, b) => (b.score || 0) - (a.score || 0));
  },
};
