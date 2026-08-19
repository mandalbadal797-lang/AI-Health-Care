import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Headphones, Clock, Calendar, FileText, AlertCircle } from 'lucide-react';
import { ReadingContainer } from '../components/content/ReadingContainer';
import { SafetyNotice } from '../components/content/SafetyNotice';
import { RelatedContentSection } from '../components/content/RelatedContentSection';
import { ContentFeedback } from '../components/feedback/ContentFeedback';
import { PodcastCardPreview } from '../components/cards/PodcastCardPreview';
import { Badge } from '../components/badges/Badge';
import { Button } from '../components/buttons/Button';
import { BookmarkButton } from '../components/buttons/BookmarkButton';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { podcastService } from '../services/podcastService';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { PodcastDetail, PodcastSummary } from '../types/domain';
import { personalizationStorage } from '../utils/personalizationStorage';

export const PodcastDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [podcast, setPodcast] = useState<PodcastDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(true);

  const { currentEpisode, isPlaying, playEpisode } = useAudioPlayer();

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    podcastService
      .getPodcastBySlug(slug)
      .then((data) => {
        setPodcast(data);
        document.title = `Ep ${data.episode_number}: ${data.title} — MindCampus Podcast`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.description);

        personalizationStorage.addRecentlyViewed({
          id: data.id,
          contentType: 'podcast',
          title: data.title,
          slug: data.slug,
          excerpt: data.description,
          category: data.category.name,
          url: `/podcasts/${data.slug}`,
          progressPercent: 30,
        });
        personalizationStorage.saveProgress('podcast', data.id, 30);
      })
      .catch((err: any) => {
        setError(err?.message || 'Podcast episode could not be loaded.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <ReadingContainer>
          <CardSkeleton />
        </ReadingContainer>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="container py-8">
        <div className="card p-xl text-center flex flex-col items-center gap-md" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle size={40} className="text-danger" />
          <h2>Podcast Episode Not Found</h2>
          <p className="text-muted">{error || 'The requested podcast episode could not be found.'}</p>
          <NavLink to="/podcasts">
            <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
              Back to Podcasts Library
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  const isCurrentPlaying = currentEpisode?.id === podcast.id && isPlaying;

  return (
    <div className="py-6 animate-fade-in">
      <ReadingContainer>
        {/* Back Link */}
        <div className="flex items-center justify-between mb-6">
          <NavLink to="/podcasts" style={{ textDecoration: 'none' }} className="inline-flex items-center gap-xs text-primary font-semibold">
            <ArrowLeft size={18} /> Back to Podcasts Library
          </NavLink>
          <BookmarkButton
            item={{
              id: podcast.id,
              contentType: 'podcast',
              title: podcast.title,
              slug: podcast.slug,
              excerpt: podcast.description,
              category: podcast.category.name,
              url: `/podcasts/${podcast.slug}`,
            }}
          />
        </div>

        {/* Episode Header & Metadata */}
        <div className="flex flex-col gap-sm mb-6">
          <div className="flex items-center gap-sm flex-wrap">
            <Badge variant="info">Episode {podcast.episode_number}</Badge>
            <Badge variant="success">{podcast.category.name}</Badge>
          </div>

          <h1 className="display-heading">{podcast.title}</h1>

          <p className="body-lg text-muted font-medium">{podcast.description}</p>

          <div className="flex items-center gap-md text-small text-muted pt-4 flex-wrap" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="flex items-center gap-xs"><Clock size={16} /> {podcast.duration_formatted}</span>
            <span className="flex items-center gap-xs"><Calendar size={16} /> {new Date(podcast.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Play Action Card */}
        <div className="card glass p-lg my-6 flex items-center justify-between gap-md" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="flex items-center gap-md">
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Headphones size={28} className="text-primary" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem' }}>Listen to Episode</h4>
              <span className="caption text-muted">Stream directly or use bottom player controls</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            leftIcon={isCurrentPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
            onClick={() => playEpisode(podcast)}
          >
            {isCurrentPlaying ? 'Pause' : 'Play Episode'}
          </Button>
        </div>

        {/* Transcript Section */}
        {podcast.transcript && (
          <div className="my-6">
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="flex items-center gap-xs">
                <FileText size={20} className="text-primary" /> Audio Transcript
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowTranscript(!showTranscript)}>
                {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
              </Button>
            </div>

            {showTranscript && (
              <div
                className="card p-lg text-secondary body-regular"
                style={{ backgroundColor: 'var(--bg-app)', whiteSpace: 'pre-line', lineHeight: 1.7 }}
              >
                {podcast.transcript}
              </div>
            )}
          </div>
        )}

        {/* Student Content Feedback */}
        <ContentFeedback
          contentId={podcast.id}
          contentType="podcast"
          title={podcast.title}
        />

        {/* Related Content Discovery */}
        <RelatedContentSection
          contentType="podcast"
          currentId={podcast.id}
          categoryId={podcast.category.id}
        />

        {/* Safety Disclaimer */}
        <SafetyNotice />

        {/* Related Episodes */}
        {podcast.related_podcasts && podcast.related_podcasts.length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h3 className="mb-4">Related Podcast Episodes</h3>
            <div className="flex flex-col gap-4">
              {podcast.related_podcasts.map((rel: PodcastSummary) => (
                <PodcastCardPreview
                  key={rel.id}
                  episodeNumber={rel.episode_number}
                  title={rel.title}
                  description={rel.description}
                  durationFormatted={rel.duration_formatted}
                  category={rel.category_name}
                  onPlayClick={() => playEpisode(rel)}
                />
              ))}
            </div>
          </div>
        )}
      </ReadingContainer>
    </div>
  );
};
