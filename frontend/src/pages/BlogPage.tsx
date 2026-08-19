import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { BookOpen, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { ArticleCardPreview } from '../components/cards/ArticleCardPreview';
import { SearchInput } from '../components/forms/SearchInput';
import { FilterBar } from '../components/navigation/FilterBar';
import { Pagination } from '../components/navigation/Pagination';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/buttons/Button';
import { articleService } from '../services/articleService';
import { categoryService } from '../services/categoryService';
import { ArticleSummary, Category } from '../types/domain';

export const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Categories once
  useEffect(() => {
    categoryService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch Articles based on current query params
  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleService.getArticles({
        page: currentPage,
        limit: 9,
        category: currentCategory === 'all' ? undefined : currentCategory,
        search: currentSearch || undefined,
      });
      setArticles(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to blog API.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentCategory, currentSearch]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const updateParam = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    if (key !== 'page') params.delete('page'); // Reset to page 1 on filter change
    setSearchParams(params);
  };

  // Construct FilterBar items
  const filterItems = [
    { id: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ id: c.slug, label: `${c.name} (${c.article_count || 0})` })),
  ];

  // Featured article is the first article on page 1 when no search query
  const featuredArticle = currentPage === 1 && !currentSearch && articles.length > 0 ? articles[0] : null;
  const gridArticles = featuredArticle ? articles.slice(1) : articles;

  return (
    <div className="container py-6">
      {/* Blog Hero Banner */}
      <Hero
        eyebrow="Student Wellness & Motivation Blog"
        title="Explore Student Wellness & Growth"
        subtitle="Practical guides, cognitive study tools, resilience narratives, and wellness strategies created specifically for college students."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <BookOpen size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>{totalCount} Published Articles</h4>
            <span className="caption text-muted">Updated weekly by campus editors</span>
          </div>
        }
      />

      {/* Search & Category Filter Navigation */}
      <div className="mb-6 flex flex-col gap-md">
        <div className="max-w-md">
          <SearchInput
            value={currentSearch}
            onChange={(e) => updateParam('search', e.target.value)}
            onClear={() => updateParam('search', '')}
            placeholder="Search articles by title, keyword, or stress factor..."
          />
        </div>

        {/* Dynamic Category Chips */}
        <FilterBar
          items={filterItems}
          selectedId={currentCategory}
          onSelect={(id) => updateParam('category', id as string)}
        />
      </div>

      {/* Loading Skeleton State */}
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
          <h3>Unable to Load Blog Articles</h3>
          <p className="text-muted">{error}</p>
          <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={fetchArticles}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && articles.length === 0 && (
        <div className="my-8">
          <EmptyState
            title="No Articles Found"
            description="No published articles matched your search query or selected category."
          />
        </div>
      )}

      {/* Main Content View */}
      {!isLoading && !error && articles.length > 0 && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Prominent Featured Article Presentation */}
          {featuredArticle && (
            <div className="card glass p-lg" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex items-center gap-sm mb-2">
                <span className="badge badge-info">Featured Reading</span>
                <span className="caption text-muted">{featuredArticle.category_name}</span>
                {featuredArticle.is_ai_generated && (
                  <span className="badge badge-warning flex items-center gap-xs">
                    <Sparkles size={12} /> AI Assisted
                  </span>
                )}
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem' }}>{featuredArticle.title}</h2>
              <p className="body-lg text-muted mb-4">{featuredArticle.excerpt}</p>
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="caption text-muted">By {featuredArticle.author_name} • {featuredArticle.reading_time_minutes} min read</span>
                <NavLink to={`/blog/${featuredArticle.slug}`}>
                  <Button variant="primary" size="sm">Read Featured Article</Button>
                </NavLink>
              </div>
            </div>
          )}

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gridArticles.map((article) => (
              <NavLink key={article.id} to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                <ArticleCardPreview
                  title={article.title}
                  excerpt={article.excerpt}
                  category={article.category_name}
                  readingTimeMinutes={article.reading_time_minutes}
                  authorName={article.author_name}
                  isAiGenerated={article.is_ai_generated}
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
