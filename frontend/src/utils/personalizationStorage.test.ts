import { describe, it, expect, beforeEach } from 'vitest';
import { personalizationStorage } from './personalizationStorage';

describe('personalizationStorage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default data structure', () => {
    const data = personalizationStorage.getData();
    expect(data.version).toBe('1.0');
    expect(data.bookmarks).toEqual([]);
    expect(data.selectedInterests.length).toBeGreaterThan(0);
  });

  it('adds and removes bookmarks correctly', () => {
    const item = {
      id: 'test-art-1',
      contentType: 'article' as const,
      title: 'Test Article Title',
      slug: 'test-article-title',
      excerpt: 'Test Excerpt',
      category: 'Exam Stress',
      url: '/blog/test-article-title',
    };

    expect(personalizationStorage.isBookmarked('article', 'test-art-1')).toBe(false);

    const saved = personalizationStorage.toggleBookmark(item);
    expect(saved).toBe(true);
    expect(personalizationStorage.isBookmarked('article', 'test-art-1')).toBe(true);
    expect(personalizationStorage.getBookmarks().length).toBe(1);

    const unsaved = personalizationStorage.toggleBookmark(item);
    expect(unsaved).toBe(false);
    expect(personalizationStorage.isBookmarked('article', 'test-art-1')).toBe(false);
    expect(personalizationStorage.getBookmarks().length).toBe(0);
  });

  it('tracks recently viewed items with max 20 capacity', () => {
    for (let i = 1; i <= 25; i++) {
      personalizationStorage.addRecentlyViewed({
        id: `id-${i}`,
        contentType: 'article',
        title: `Title ${i}`,
        slug: `slug-${i}`,
        excerpt: 'Excerpt',
        category: 'Test',
        url: `/blog/slug-${i}`,
      });
    }

    const recent = personalizationStorage.getRecentlyViewed();
    expect(recent.length).toBe(20);
    expect(recent[0].id).toBe('id-25');
  });

  it('handles clearing all data', () => {
    personalizationStorage.setSelectedInterests(['test-interest']);
    personalizationStorage.clearAllData();
    expect(localStorage.getItem('mindcampus_personalization_v1')).toBeNull();
  });
});
