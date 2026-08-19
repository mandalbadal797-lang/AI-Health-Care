export interface SavedItem {
  id: string;
  contentType: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  url: string;
  savedAt: string;
}

export interface RecentItem {
  id: string;
  contentType: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  url: string;
  viewedAt: string;
  progressPercent?: number;
}

export interface ContentProgress {
  contentId: string;
  contentType: 'article' | 'podcast' | 'story';
  progressPercent: number;
  completed: boolean;
  updatedAt: string;
}

export interface PersonalizationData {
  version: string;
  bookmarks: SavedItem[];
  recentlyViewed: RecentItem[];
  progress: Record<string, ContentProgress>;
  selectedInterests: string[];
}

const STORAGE_KEY = 'mindcampus_personalization_v1';

const INITIAL_DATA: PersonalizationData = {
  version: '1.0',
  bookmarks: [],
  recentlyViewed: [],
  progress: {},
  selectedInterests: ['failure-resilience', 'study-habits', 'academic-stress'],
};

export const personalizationStorage = {
  /**
   * Safely read personalization data from localStorage with JSON error recovery.
   */
  getData(): PersonalizationData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...INITIAL_DATA };
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.version === '1.0') {
        return {
          version: '1.0',
          bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
          recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
          progress: typeof parsed.progress === 'object' ? parsed.progress : {},
          selectedInterests: Array.isArray(parsed.selectedInterests) ? parsed.selectedInterests : INITIAL_DATA.selectedInterests,
        };
      }
    } catch (e) {
      console.warn('Personalization storage corrupted, resetting to initial defaults.', e);
    }
    return { ...INITIAL_DATA };
  },

  /**
   * Save personalization data to localStorage.
   */
  saveData(data: PersonalizationData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  },

  // --- BOOKMARKS ---
  getBookmarks(): SavedItem[] {
    return this.getData().bookmarks;
  },

  isBookmarked(contentType: string, id: string): boolean {
    const data = this.getData();
    return data.bookmarks.some((b) => b.contentType === contentType && b.id === id);
  },

  toggleBookmark(item: Omit<SavedItem, 'savedAt'>): boolean {
    const data = this.getData();
    const existingIndex = data.bookmarks.findIndex(
      (b) => b.contentType === item.contentType && b.id === item.id
    );

    let isSaved = false;
    if (existingIndex >= 0) {
      data.bookmarks.splice(existingIndex, 1);
    } else {
      data.bookmarks.unshift({
        ...item,
        savedAt: new Date().toISOString(),
      });
      isSaved = true;
    }
    this.saveData(data);
    return isSaved;
  },

  removeBookmark(contentType: string, id: string): void {
    const data = this.getData();
    data.bookmarks = data.bookmarks.filter((b) => !(b.contentType === contentType && b.id === id));
    this.saveData(data);
  },

  clearBookmarks(): void {
    const data = this.getData();
    data.bookmarks = [];
    this.saveData(data);
  },

  // --- RECENTLY VIEWED ---
  getRecentlyViewed(): RecentItem[] {
    return this.getData().recentlyViewed;
  },

  addRecentlyViewed(item: Omit<RecentItem, 'viewedAt'>): void {
    const data = this.getData();
    const filtered = data.recentlyViewed.filter(
      (r) => !(r.contentType === item.contentType && r.id === item.id)
    );
    filtered.unshift({
      ...item,
      viewedAt: new Date().toISOString(),
    });
    data.recentlyViewed = filtered.slice(0, 20); // Cap at 20 recent items
    this.saveData(data);
  },

  clearRecentlyViewed(): void {
    const data = this.getData();
    data.recentlyViewed = [];
    this.saveData(data);
  },

  // --- READING & LISTENING PROGRESS ---
  saveProgress(contentType: 'article' | 'podcast' | 'story', contentId: string, progressPercent: number): void {
    const data = this.getData();
    const key = `${contentType}:${contentId}`;
    data.progress[key] = {
      contentId,
      contentType,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      completed: progressPercent >= 90,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(data);
  },

  getProgress(contentType: string, contentId: string): ContentProgress | null {
    const data = this.getData();
    return data.progress[`${contentType}:${contentId}`] || null;
  },

  clearProgress(): void {
    const data = this.getData();
    data.progress = {};
    this.saveData(data);
  },

  // --- INTEREST PREFERENCES ---
  getSelectedInterests(): string[] {
    return this.getData().selectedInterests;
  },

  setSelectedInterests(interests: string[]): void {
    const data = this.getData();
    data.selectedInterests = interests;
    this.saveData(data);
  },

  resetInterests(): void {
    const data = this.getData();
    data.selectedInterests = [...INITIAL_DATA.selectedInterests];
    this.saveData(data);
  },

  // --- CLEAR ALL DATA ---
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
