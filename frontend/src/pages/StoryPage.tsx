import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Sparkles, HeartHandshake, AlertCircle, RefreshCw } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { StoryCardPreview } from '../components/cards/StoryCardPreview';
import { SearchInput } from '../components/forms/SearchInput';
import { FilterBar } from '../components/navigation/FilterBar';
import { Pagination } from '../components/navigation/Pagination';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/buttons/Button';
import { storyService } from '../services/storyService';
import { categoryService } from '../services/categoryService';
import { StorySummary, Category } from '../types/domain';

export const StoryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [stories, setStories] = useState<StorySummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Categories
  useEffect(() => {
    categoryService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch Digital Stories
  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await storyService.getStories({
        page: currentPage,
        limit: 9,
        category: currentCategory === 'all' ? undefined : currentCategory,
        search: currentSearch || undefined,
      });
      setStories(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to digital stories API.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentCategory, currentSearch]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const updateParam = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  const filterItems = [
    { id: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ id: c.slug, label: c.name })),
  ];

  const featuredStory = currentPage === 1 && !currentSearch && stories.length > 0 ? stories[0] : null;
  const gridStories = featuredStory ? stories.slice(1) : stories;

  return (
    <div className="container py-6">
      {/* Story Hero Banner */}
      <Hero
        eyebrow="Student Narrative Experiences"
        title="Stories From the Student Journey"
        subtitle="Real-world student narratives covering academic setbacks, personal growth, overcoming imposter syndrome, and learning to start again."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <HeartHandshake size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>{totalCount} Student Stories</h4>
            <span className="caption text-muted">Demonstration Narratives</span>
          </div>
        }
      />

      {/* Demonstration Banner Notice */}
      <div className="card glass p-sm mb-6 flex items-center gap-sm" style={{ borderLeft: '4px solid var(--color-info)' }}>
        <Sparkles size={18} className="text-info flex-shrink-0" />
        <span className="caption text-muted">
          Note: Stories presented on MindCampus are structured student demonstration narratives designed for peer learning, resilience, and personal reflection.
        </span>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="mb-6 flex flex-col gap-md">
        <div className="max-w-md">
          <SearchInput
            value={currentSearch}
            onChange={(e) => updateParam('search', e.target.value)}
            onClear={() => updateParam('search', '')}
            placeholder="Search stories by narrative topic, keyword, or setback..."
          />
        </div>

        <FilterBar
          items={filterItems}
          selectedId={currentCategory}
          onSelect={(id) => updateParam('category', id as string)}
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="card p-xl text-center flex flex-col items-center gap-md my-6" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle size={36} className="text-danger" />
          <h3>Unable to Load Digital Stories</h3>
          <p className="text-muted">{error}</p>
          <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={fetchStories}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && stories.length === 0 && (
        <div className="my-8">
          <EmptyState
            title="No Digital Stories Found"
            description="No student stories matched your search query or category filter."
          />
        </div>
      )}

      {/* Story Grid Display */}
      {!isLoading && !error && stories.length > 0 && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Featured Story Hero Card */}
          {featuredStory && (
            <div className="card glass p-lg" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex items-center gap-sm mb-2">
                <span className="badge badge-info">Featured Narrative</span>
                <span className="caption text-muted">{featuredStory.category_name}</span>
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem' }}>{featuredStory.title}</h2>
              <p className="body-lg text-muted mb-4">{featuredStory.subtitle}</p>
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="caption text-muted">{featuredStory.author_name} • {featuredStory.reading_time_minutes} min read</span>
                <NavLink to={`/stories/${featuredStory.slug}`}>
                  <Button variant="primary" size="sm">Read Full Story</Button>
                </NavLink>
              </div>
            </div>
          )}

          {/* Story Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gridStories.map((story) => (
              <NavLink key={story.id} to={`/stories/${story.slug}`} style={{ textDecoration: 'none' }}>
                <StoryCardPreview
                  title={story.title}
                  description={story.subtitle}
                  category={story.category_name}
                  quoteSnippet="An academic setback is diagnostic feedback."
                  sectionCount={4}
                />
              </NavLink>
            ))}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateParam('page', page)}
            />
          )}
        </div>
      )}
    </div>
  );
};
