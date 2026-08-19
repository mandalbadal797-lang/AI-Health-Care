import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Headphones, Sparkles, HeartHandshake } from 'lucide-react';
import { Hero } from '../../../components/typography/Hero';
import { Button } from '../../../components/buttons/Button';

export const HeroSection: React.FC = () => {
  return (
    <Hero
      eyebrow="Student Wellness • Motivation • Digital Storytelling"
      title="Navigate College Life with Confidence & Resilience"
      subtitle="Discover educational blog posts, supportive podcasts, and inspiring student stories designed to help you overcome exam pressure, manage stress, and thrive."
      primaryCta={
        <NavLink to="/blog">
          <Button variant="primary" size="lg" leftIcon={<BookOpen size={20} />}>
            Explore Articles
          </Button>
        </NavLink>
      }
      secondaryCta={
        <NavLink to="/podcasts">
          <Button variant="outline" size="lg" leftIcon={<Headphones size={20} />}>
            Listen to Podcasts
          </Button>
        </NavLink>
      }
      visualElement={
        <div className="card card-glass p-lg flex flex-col items-center gap-md text-center" style={{ maxWidth: '380px', margin: '0 auto' }}>
          <div
            className="p-md flex items-center justify-center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
            }}
          >
            <HeartHandshake size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Supportive & Non-Clinical</h3>
            <p className="text-small text-muted mt-1">
              General educational tools, study habits, and wellness resources created by and for college students.
            </p>
          </div>
          <div className="flex items-center gap-xs text-small text-primary font-semibold mt-1">
            <Sparkles size={16} /> AI-Assisted Discovery Ready
          </div>
        </div>
      }
    />
  );
};
