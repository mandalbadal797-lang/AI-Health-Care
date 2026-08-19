import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../../../components/typography/SectionHeader';
import { StoryCardPreview } from '../../../components/cards/StoryCardPreview';
import { CardSkeleton } from '../../../components/feedback/Skeleton';
import { Button } from '../../../components/buttons/Button';
import { storyService } from '../../../services/storyService';
import { StorySummary } from '../../../types/domain';
import { DIGITAL_STORIES as FALLBACK_STORIES } from '../../../data/homeMockData';

export const StoryShowcaseSection: React.FC = () => {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    storyService
      .getStories({ page: 1, limit: 3 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setStories(res.items);
        } else {
          setStories(FALLBACK_STORIES as any);
        }
      })
      .catch(() => {
        setStories(FALLBACK_STORIES as any);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mb-8">
      <SectionHeader
        eyebrow="Student Narratives"
        title="Stories From the Student Journey"
        subtitle="Real-world student experiences of overcoming setbacks, adapting to campus life, and growing."
        action={
          <NavLink to="/stories">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
              View All Stories
            </Button>
          </NavLink>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <NavLink key={story.id} to={`/stories/${story.slug}`} style={{ textDecoration: 'none' }}>
              <StoryCardPreview
                title={story.title}
                description={story.subtitle || (story as any).description}
                category={story.category_name || (story as any).category}
                quoteSnippet={(story as any).quoteSnippet || 'An academic setback is diagnostic feedback.'}
                sectionCount={4}
              />
            </NavLink>
          ))}
        </div>
      )}
    </section>
  );
};
