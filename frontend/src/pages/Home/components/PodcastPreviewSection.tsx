import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../../../components/typography/SectionHeader';
import { PodcastCardPreview } from '../../../components/cards/PodcastCardPreview';
import { CardSkeleton } from '../../../components/feedback/Skeleton';
import { Button } from '../../../components/buttons/Button';
import { podcastService } from '../../../services/podcastService';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { PodcastSummary } from '../../../types/domain';
import { PODCAST_EPISODES as FALLBACK_EPISODES } from '../../../data/homeMockData';

export const PodcastPreviewSection: React.FC = () => {
  const [episodes, setEpisodes] = useState<PodcastSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { playEpisode } = useAudioPlayer();

  useEffect(() => {
    podcastService
      .getPodcasts({ page: 1, limit: 3 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setEpisodes(res.items);
        } else {
          setEpisodes(FALLBACK_EPISODES as any);
        }
      })
      .catch(() => {
        setEpisodes(FALLBACK_EPISODES as any);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mb-8">
      <SectionHeader
        eyebrow="Audio Content"
        title="Listen & Reflect: Campus Audio Podcasts"
        subtitle="Listen to student interviews, counselor advice, and focus sessions on the go."
        action={
          <NavLink to="/podcasts">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
              Explore All Podcasts
            </Button>
          </NavLink>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {episodes.map((ep) => (
            <PodcastCardPreview
              key={ep.id}
              episodeNumber={ep.episode_number}
              title={ep.title}
              description={ep.description}
              durationFormatted={ep.duration_formatted || (ep as any).durationFormatted}
              category={ep.category_name || (ep as any).category}
              onPlayClick={() => playEpisode(ep)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
