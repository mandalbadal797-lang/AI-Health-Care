import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, HeartHandshake, Sparkles, AlertCircle } from 'lucide-react';
import { ReadingContainer } from '../components/content/ReadingContainer';
import { QuoteBlock } from '../components/content/QuoteBlock';
import { KeyTakeawayBlock } from '../components/content/KeyTakeawayBlock';
import { SafetyNotice } from '../components/content/SafetyNotice';
import { RelatedContentSection } from '../components/content/RelatedContentSection';
import { ContentFeedback } from '../components/feedback/ContentFeedback';
import { StoryCardPreview } from '../components/cards/StoryCardPreview';
import { Badge } from '../components/badges/Badge';
import { Button } from '../components/buttons/Button';
import { BookmarkButton } from '../components/buttons/BookmarkButton';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { storyService } from '../services/storyService';
import { StoryDetail, StorySummary } from '../types/domain';
import { personalizationStorage } from '../utils/personalizationStorage';

export const StoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    storyService
      .getStoryBySlug(slug)
      .then((data) => {
        setStory(data);
        document.title = `${data.title} — Student Story | MindCampus`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.subtitle);

        personalizationStorage.addRecentlyViewed({
          id: data.id,
          contentType: 'story',
          title: data.title,
          slug: data.slug,
          excerpt: data.subtitle,
          category: data.category.name,
          url: `/stories/${data.slug}`,
          progressPercent: 40,
        });
        personalizationStorage.saveProgress('story', data.id, 40);
      })
      .catch((err: any) => {
        setError(err?.message || 'Digital story could not be loaded.');
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
          <div className="mt-4"><CardSkeleton /></div>
        </ReadingContainer>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container py-8">
        <div className="card p-xl text-center flex flex-col items-center gap-md" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle size={40} className="text-danger" />
          <h2>Digital Story Not Found</h2>
          <p className="text-muted">{error || 'The requested digital story could not be found.'}</p>
          <NavLink to="/stories">
            <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
              Back to Stories Gallery
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  // Parse structured section headings and paragraphs
  const renderStorySections = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (key: string) => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={key} className="my-4 body-lg" style={{ lineHeight: 1.8 }}>
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.match(/^[0-9]{2}\s*—/)) {
        flushParagraph(`p-${idx}`);
        elements.push(
          <div key={`section-${idx}`} className="mt-8 mb-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h3 className="text-primary" style={{ fontSize: '1.25rem', letterSpacing: '0.02em' }}>
              {trimmed}
            </h3>
          </div>
        );
      } else if (trimmed.startsWith('> ')) {
        flushParagraph(`p-${idx}`);
        elements.push(
          <QuoteBlock key={`quote-${idx}`} quote={trimmed.substring(2).replace(/"/g, '')} />
        );
      } else if (trimmed === '') {
        flushParagraph(`p-${idx}`);
      } else {
        currentParagraph.push(trimmed);
      }
    });

    flushParagraph('p-final');
    return elements;
  };

  return (
    <div className="py-6 animate-fade-in">
      <ReadingContainer>
        {/* Back Link */}
        <div className="flex items-center justify-between mb-6">
          <NavLink to="/stories" style={{ textDecoration: 'none' }} className="inline-flex items-center gap-xs text-primary font-semibold">
            <ArrowLeft size={18} /> Back to Digital Stories
          </NavLink>
          <BookmarkButton
            item={{
              id: story.id,
              contentType: 'story',
              title: story.title,
              slug: story.slug,
              excerpt: story.subtitle,
              category: story.category.name,
              url: `/stories/${story.slug}`,
            }}
          />
        </div>

        {/* Story Header */}
        <div className="flex flex-col gap-sm mb-6">
          <div className="flex items-center gap-sm flex-wrap">
            <Badge variant="info">{story.category.name}</Badge>
            <Badge variant="success">Student Experience</Badge>
          </div>

          <h1 className="display-heading">{story.title}</h1>

          <p className="body-lg text-muted font-medium" style={{ fontSize: '1.2rem', lineHeight: 1.5 }}>
            {story.subtitle}
          </p>

          <div className="flex items-center gap-md text-small text-muted pt-4 flex-wrap" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="flex items-center gap-xs"><HeartHandshake size={16} /> {story.author_name}</span>
            <span className="flex items-center gap-xs"><Clock size={16} /> {story.reading_time_minutes} min read</span>
            <span className="flex items-center gap-xs"><Calendar size={16} /> {new Date(story.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Story Narrative Content */}
        <div className="story-body my-6">
          {renderStorySections(story.content)}
        </div>

        {/* Reflection Question Box */}
        {story.reflection_question && (
          <div className="card glass p-lg my-6" style={{ borderLeft: '4px solid var(--color-warning)', backgroundColor: 'var(--color-primary-light)' }}>
            <div className="flex items-center gap-xs mb-2 text-warning font-semibold">
              <Sparkles size={18} /> Reflection Question
            </div>
            <p className="body-lg font-medium" style={{ color: 'var(--color-text-main)' }}>
              "{story.reflection_question}"
            </p>
          </div>
        )}

        {/* Key Takeaway Box */}
        {story.key_takeaway && (
          <div className="my-6">
            <KeyTakeawayBlock takeaways={[story.key_takeaway]} />
          </div>
        )}

        {/* Student Content Feedback */}
        <ContentFeedback
          contentId={story.id}
          contentType="story"
          title={story.title}
        />

        {/* Related Content Discovery */}
        <RelatedContentSection
          contentType="story"
          currentId={story.id}
          categoryId={story.category.id}
        />

        {/* Non-Clinical Safety Notice */}
        <SafetyNotice />

        {/* Related Stories */}
        {story.related_stories && story.related_stories.length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h3 className="mb-4">Related Student Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {story.related_stories.map((rel: StorySummary) => (
                <NavLink key={rel.id} to={`/stories/${rel.slug}`} style={{ textDecoration: 'none' }}>
                  <StoryCardPreview
                    title={rel.title}
                    description={rel.subtitle}
                    category={rel.category_name}
                    quoteSnippet="An academic setback is diagnostic feedback."
                    sectionCount={4}
                  />
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </ReadingContainer>
    </div>
  );
};
