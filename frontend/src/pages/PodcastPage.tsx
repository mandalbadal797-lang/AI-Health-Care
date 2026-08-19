import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Headphones, Play, Pause, AlertCircle, RefreshCw } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { PodcastCardPreview } from '../components/cards/PodcastCardPreview';
import { SearchInput } from '../components/forms/SearchInput';
import { FilterBar } from '../components/navigation/FilterBar';
import { Pagination } from '../components/navigation/Pagination';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/buttons/Button';
import { podcastService } from '../services/podcastService';
import { categoryService } from '../services/categoryService';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { PodcastSummary, Category } from '../types/domain';

export const PodcastPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [podcasts, setPodcasts] = useState<PodcastSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { currentEpisode, isPlaying, playEpisode } = useAudioPlayer();

  // Fetch Categories once
  useEffect(() => {
    categoryService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch Podcast episodes
  const fetchPodcasts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await podcastService.getPodcasts({
        page: currentPage,
        limit: 8,
        category: currentCategory === 'all' ? undefined : currentCategory,
        search: currentSearch || undefined,
      });
      setPodcasts(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to podcast API.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentCategory, currentSearch]);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

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

  const featuredEpisode = currentPage === 1 && !currentSearch && podcasts.length > 0 ? podcasts[0] : null;
  const listEpisodes = featuredEpisode ? podcasts.slice(1) : podcasts;

  return (
    <div className="container py-6">
      {/* Podcast Hero Banner */}
      <Hero
        eyebrow="Student Audio & Motivation"
        title="Listen, Reflect & Keep Moving"
        subtitle="Listen to student interviews, campus counselor advice, and focus sessions on the go. Designed to build resilience and academic confidence."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <Headphones size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>{totalCount} Audio Episodes</h4>
            <span className="caption text-muted">Stream on demand anywhere</span>
          </div>
        }
      />

      {/* Search & Category Navigation */}
      <div className="mb-6 flex flex-col gap-md">
        <div className="max-w-md">
          <SearchInput
            value={currentSearch}
            onChange={(e) => updateParam('search', e.target.value)}
            onClear={() => updateParam('search', '')}
            placeholder="Search podcasts by episode title or topic..."
          />
        </div>

        <FilterBar
          items={filterItems}
          selectedId={currentCategory}
          onSelect={(id) => updateParam('category', id as string)}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-4 my-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="card p-xl text-center flex flex-col items-center gap-md my-6" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle size={36} className="text-danger" />
          <h3>Unable to Load Podcast Episodes</h3>
          <p className="text-muted">{error}</p>
          <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={fetchPodcasts}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && podcasts.length === 0 && (
        <div className="my-8">
          <EmptyState
            title="No Podcast Episodes Found"
            description="No podcast episodes matched your search query or category filter."
          />
        </div>
      )}

      {/* Content Display */}
      {!isLoading && !error && podcasts.length > 0 && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Featured Episode Hero */}
          {featuredEpisode && (
            <div className="card glass p-lg" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex items-center gap-sm mb-2">
                <span className="badge badge-info">Featured Episode</span>
                <span className="badge badge-success">Ep {featuredEpisode.episode_number}</span>
                <span className="caption text-muted">{featuredEpisode.category_name}</span>
              </div>
              <h2 className="mb-2" style={{ fontSize: '1.75rem' }}>{featuredEpisode.title}</h2>
              <p className="body-lg text-muted mb-4">{featuredEpisode.description}</p>
              <div className="flex items-center justify-between pt-4 flex-wrap gap-md" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="caption text-muted">Duration: {featuredEpisode.duration_formatted}</span>
                <div className="flex items-center gap-md">
                  <NavLink to={`/podcasts/${featuredEpisode.slug}`}>
                    <Button variant="outline" size="sm">View Transcript & Details</Button>
                  </NavLink>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={currentEpisode?.id === featuredEpisode.id && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                    onClick={() => playEpisode(featuredEpisode)}
                  >
                    {currentEpisode?.id === featuredEpisode.id && isPlaying ? 'Pause Episode' : 'Play Episode'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Episode List */}
          <div className="flex flex-col gap-4">
            {listEpisodes.map((episode) => (
              <div key={episode.id} className="flex flex-col">
                <PodcastCardPreview
                  episodeNumber={episode.episode_number}
                  title={episode.title}
                  description={episode.description}
                  durationFormatted={episode.duration_formatted}
                  category={episode.category_name}
                  onPlayClick={() => playEpisode(episode)}
                />
                <div className="flex justify-end pr-4 -mt-3">
                  <NavLink to={`/podcasts/${episode.slug}`} style={{ textDecoration: 'none', fontSize: '0.8125rem' }} className="text-primary font-semibold">
                    View Episode Details & Transcript →
                  </NavLink>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
