import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, Clock, CheckCircle, Search, Play } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { LibraryContentCard } from '../components/cards/LibraryContentCard';
import { FilterBar } from '../components/navigation/FilterBar';
import { Button } from '../components/buttons/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { libraryService, LibraryItem } from '../services/libraryService';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/domain';

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'saved' | 'continue' | 'recently_viewed' | 'completed'>('saved');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [sortOption, setSortOption] = useState<string>('recently_saved');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadData = () => {
    setIsLoading(true);
    if (activeTab === 'saved') {
      libraryService
        .getLibrary({
          type: typeFilter,
          category_id: categoryFilter,
          sort: sortOption,
          q: searchQuery,
        })
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'continue') {
      libraryService
        .getProgressList('in_progress')
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'recently_viewed') {
      libraryService
        .getRecentlyViewed()
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'completed') {
      libraryService
        .getProgressList('completed')
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, typeFilter, categoryFilter, sortOption, searchQuery]);

  const handleRemove = async (id: string, type: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await libraryService.removeSavedContent(id, type);
  };

  const navTabs = [
    { id: 'saved', label: 'Saved Resources', icon: <Bookmark size={16} /> },
    { id: 'continue', label: 'Continue Learning', icon: <Play size={16} /> },
    { id: 'recently_viewed', label: 'Recently Viewed', icon: <Clock size={16} /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle size={16} /> },
  ];

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
        eyebrow="Student Content Library"
        title="My Learning Library"
        subtitle="Access your saved articles, podcasts, and digital stories. Continue reading and track your wellness learning progress."
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-xs overflow-x-auto pb-2 mb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`btn btn-sm flex items-center gap-xs transition-colors ${
              activeTab === tab.id ? 'btn-primary' : 'btn-ghost text-muted hover:text-main'
            }`}
            style={{ borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar for Saved Tab */}
      {activeTab === 'saved' && (
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <FilterBar
            items={typeFilterItems}
            selectedId={typeFilter}
            onSelect={(id) => setTypeFilter(id as string)}
          />

          <div className="flex items-center gap-sm flex-wrap w-full md:w-auto">
            {/* Search within library */}
            <div className="relative flex-1 md:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                className="form-input text-small pl-8"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.35rem 0.75rem 0.35rem 2rem' }}
              />
            </div>

            {/* Category Filter */}
            <select
              className="form-input text-small"
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              className="form-input text-small"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
            >
              <option value="recently_saved">Recently Saved</option>
              <option value="recently_accessed">Recently Accessed</option>
              <option value="alphabetical">Title A-Z</option>
              <option value="oldest_saved">Oldest Saved</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Grid / Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {items.map((item) => (
            <LibraryContentCard key={`${item.type}-${item.id}`} item={item} onRemove={activeTab === 'saved' ? handleRemove : undefined} />
          ))}
        </div>
      ) : (
        /* Empty State Handling */
        <div className="my-8">
          {activeTab === 'saved' ? (
            <EmptyState
              title="Your Library is Empty"
              description="Save articles, podcasts, and digital stories to access them here anytime."
            >
              <div className="mt-4 flex justify-center">
                <NavLink to="/search" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Explore Student Content</Button>
                </NavLink>
              </div>
            </EmptyState>
          ) : activeTab === 'continue' ? (
            <EmptyState
              title="Nothing in Progress"
              description="When you start reading an article or listening to a podcast, your progress will be tracked here."
            >
              <div className="flex items-center gap-xs flex-wrap justify-center mt-4">
                <NavLink to="/blog" style={{ textDecoration: 'none' }}><Button variant="outline" size="sm">Explore Blogs</Button></NavLink>
                <NavLink to="/podcasts" style={{ textDecoration: 'none' }}><Button variant="outline" size="sm">Explore Podcasts</Button></NavLink>
                <NavLink to="/stories" style={{ textDecoration: 'none' }}><Button variant="outline" size="sm">Explore Stories</Button></NavLink>
              </div>
            </EmptyState>
          ) : activeTab === 'recently_viewed' ? (
            <EmptyState
              title="No Recently Viewed Items"
              description="Content you open on MindCampus will appear here for easy reference."
            >
              <div className="mt-4 flex justify-center">
                <NavLink to="/blog" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Discover Articles</Button>
                </NavLink>
              </div>
            </EmptyState>
          ) : (
            <EmptyState
              title="You Haven't Completed Any Content Yet"
              description="Finish reading an article or listening to a podcast episode to mark it as completed."
            >
              <div className="mt-4 flex justify-center">
                <NavLink to="/blog" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Browse Content</Button>
                </NavLink>
              </div>
            </EmptyState>
          )}
        </div>
      )}
    </div>
  );
};
