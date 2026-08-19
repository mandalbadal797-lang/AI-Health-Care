const RECENT_SEARCHES_KEY = 'mindcampus_recent_searches_v1';
const MAX_RECENT_SEARCHES = 10;

export const searchStorage = {
  getRecentSearches(): string[] {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addRecentSearch(term: string): void {
    const cleaned = term.trim();
    if (!cleaned) return;

    let searches = this.getRecentSearches();
    searches = searches.filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
    searches.unshift(cleaned);

    if (searches.length > MAX_RECENT_SEARCHES) {
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
    }

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  },

  clearRecentSearches(): void {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  },
};
