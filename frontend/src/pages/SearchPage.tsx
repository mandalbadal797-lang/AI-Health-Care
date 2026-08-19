import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { Search, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { GlobalSearchBar } from '../components/navigation/GlobalSearchBar';
import { SearchResultCard } from '../components/cards/SearchResultCard';
import { FilterBar } from '../components/navigation/FilterBar';
import { Card } from '../components/cards/Card';
import { Button } from '../components/buttons/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { searchService, SearchResponse } from '../services/searchService';
import { searchStorage } from '../utils/searchStorage';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/domain';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';
  const categoryFilter = searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined;
  const sortOption = searchParams.get('sort') || 'relevance';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [aiNaturalPrompt, setAiNaturalPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = () => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  };

  const loadRecentSearches = () => {
    setRecentSearches(searchStorage.getRecentSearches());
  };

  useEffect(() => {
    loadCategories();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    searchService
      .search({
        q: query,
        type: typeFilter,
        category_id: categoryFilter,
        sort: sortOption,
        page: page,
        limit: 9,
      })
      .then((res) => setSearchData(res))
      .catch((err) => setError(err?.message || 'Search request failed.'))
      .finally(() => setIsLoading(false));
  }, [query, typeFilter, categoryFilter, sortOption, page]);

  const updateParam = (key: string, value: string | number | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== '' && value !== null) {
      next.set(key, String(value));
    } else {
      next.delete(key);
    }
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    setSearchParams(next);
  };

  const handleClearHistory = () => {
    searchStorage.clearRecentSearches();
    loadRecentSearches();
  };

  const handleAiTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiNaturalPrompt.trim()) return;
    try {
      const res = await searchService.aiTranslate(aiNaturalPrompt);
      if (res.translated_query) {
        updateParam('q', res.translated_query);
      }
    } catch {
      updateParam('q', aiNaturalPrompt);
    }
  };

  const typeFilterItems = [
    { id: 'all', label: 'All Content' },
    { id: 'article', label: 'Blogs' },
    { id: 'podcast', label: 'Podcasts' },
    { id: 'story', label: 'Digital Stories' },
  ];

  return (
    <div className="container py-6 animate-fade-in">
      {/* Header Hero */}
      <Hero
        eyebrow="Content Discovery"
        title="Search & Explore MindCampus"
        subtitle="Discover articles, podcasts, and digital stories designed for college student wellness and motivation."
        visualElement={
          <div className="w-full max-w-md">
            <GlobalSearchBar placeholder="Search articles, podcasts, and stories..." />
          </div>
        }
      />

      {/* AI Natural Language Search Helper Bar */}
      <Card glass className="p-md mb-8" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <form onSubmit={handleAiTranslateSubmit} className="flex flex-col sm:flex-row items-center gap-sm">
          <div className="flex items-center gap-xs text-primary font-semibold flex-shrink-0">
            <Sparkles size={18} /> Natural Language Search:
          </div>
          <input
            type="text"
            className="form-input text-small flex-1"
            placeholder="e.g. 'I want something to help me stay calm during exam week...'"
            value={aiNaturalPrompt}
            onChange={(e) => setAiNaturalPrompt(e.target.value)}
          />
          <Button variant="primary" size="sm" type="submit">
            Find Resources
          </Button>
        </form>
      </Card>

      {/* Main Search Controls */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
        <FilterBar
          items={typeFilterItems}
          selectedId={typeFilter}
          onSelect={(id) => updateParam('type', id as string)}
        />

        <div className="flex items-center gap-sm flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-xs">
            <label className="caption text-muted font-semibold">Category:</label>
            <select
              className="form-input text-small"
              value={categoryFilter || ''}
              onChange={(e) => updateParam('category_id', e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-xs">
            <label className="caption text-muted font-semibold">Sort:</label>
            <select
              className="form-input text-small"
              value={sortOption}
              onChange={(e) => updateParam('sort', e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>

          {(typeFilter !== 'all' || categoryFilter || sortOption !== 'relevance') && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Result Count Summary */}
      {searchData && query && (
        <div className="mb-6 flex items-center justify-between">
          <p className="body-regular text-muted font-medium">
            Found <strong>{searchData.total}</strong> results for "<strong>{query}</strong>"
          </p>
        </div>
      )}

      {/* Results Grid / Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <div className="card p-lg text-center text-danger" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <p>{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Retry Search
          </Button>
        </div>
      ) : searchData && searchData.items.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            {searchData.items.map((item) => (
              <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {searchData.total_pages > 1 && (
            <div className="flex items-center justify-center gap-sm mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParam('page', page - 1)}
              >
                Previous Page
              </Button>
              <span className="caption font-semibold text-muted">
                Page {page} of {searchData.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= searchData.total_pages}
                onClick={() => updateParam('page', page + 1)}
              >
                Next Page
              </Button>
            </div>
          )}
        </div>
      ) : query ? (
        /* No Results State */
        <div className="my-8">
          <EmptyState
            title={`No results found for "${query}"`}
            description="Try checking spelling, using fewer keywords, or clearing selected category filters."
          />
        </div>
      ) : (
        /* Empty Search State: Featured Category Discovery */
        <div className="my-8 flex flex-col gap-lg">
          <div>
            <h3 className="mb-4">Explore Content Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <NavLink key={cat.id} to={`/category/${cat.slug}`} style={{ textDecoration: 'none' }}>
                  <Card hoverable className="p-md flex items-center justify-between gap-xs">
                    <span className="font-semibold text-main">{cat.name}</span>
                    <ArrowRight size={16} className="text-primary" />
                  </Card>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <Card glass className="p-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="caption font-semibold text-muted flex items-center gap-xs">
                  <Search size={14} /> Recent Searches
                </span>
                <Button variant="ghost" size="sm" leftIcon={<Trash2 size={12} />} onClick={handleClearHistory}>
                  Clear History
                </Button>
              </div>
              <div className="flex items-center gap-xs flex-wrap">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => updateParam('q', term)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-pill)', fontSize: '0.85rem' }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
