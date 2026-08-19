import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../../../components/typography/SectionHeader';
import { StoryCardPreview } from '../../../components/cards/StoryCardPreview';
import { Button } from '../../../components/buttons/Button';
import { DIGITAL_STORIES } from '../../../data/homeMockData';

export const StoryPreviewSection: React.FC = () => {
  return (
    <section className="mb-8">
      <SectionHeader
        eyebrow="Digital Storytelling"
        title="Real Student Experiences & Journeys"
        subtitle="Multi-part visual stories exploring real obstacles, reflections, and key takeaways."
        action={
          <NavLink to="/stories">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
              Read All Stories
            </Button>
          </NavLink>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DIGITAL_STORIES.map((story) => (
          <NavLink key={story.id} to={`/stories/${story.slug}`} style={{ textDecoration: 'none' }}>
            <StoryCardPreview
              title={story.title}
              description={story.description}
              category={story.category}
              quoteSnippet={story.quoteSnippet}
              sectionCount={story.sectionCount}
            />
          </NavLink>
        ))}
      </div>
    </section>
  );
};
