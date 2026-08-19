import React, { useEffect } from 'react';
import { HeroSection } from './Home/components/HeroSection';
import { StudentNeedSection } from './Home/components/StudentNeedSection';
import { ContinueSection } from '../components/personalization/ContinueSection';
import { RecommendedForYouSection } from '../components/personalization/RecommendedForYouSection';
import { FeaturedContentSection } from './Home/components/FeaturedContentSection';
import { CategorySection } from './Home/components/CategorySection';
import { MotivationSection } from './Home/components/MotivationSection';
import { LatestArticlesSection } from './Home/components/LatestArticlesSection';
import { PodcastPreviewSection } from './Home/components/PodcastPreviewSection';
import { StoryPreviewSection } from './Home/components/StoryPreviewSection';
import { AIDiscoverySection } from './Home/components/AIDiscoverySection';
import { SupportSection } from './Home/components/SupportSection';
import { SafetySection } from './Home/components/SafetySection';

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'MindCampus — Student Wellness, Motivation & Digital Storytelling';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'MindCampus provides college students with educational articles, audio podcasts, and visual digital stories for managing exam stress and academic motivation.'
      );
    }
  }, []);

  return (
    <div className="container py-6">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Resume Activity (Displayed only if active progress exists) */}
      <ContinueSection />

      {/* 3. Interactive Student Need / Mood Selector */}
      <StudentNeedSection />

      {/* 4. Personalized Discovery */}
      <RecommendedForYouSection />

      {/* 5. Featured Content */}
      <FeaturedContentSection />

      {/* 6. Category Exploration */}
      <CategorySection />

      {/* 7. Motivation Section */}
      <MotivationSection />

      {/* 8. Latest Articles */}
      <LatestArticlesSection />

      {/* 9. Podcast Preview */}
      <PodcastPreviewSection />

      {/* 10. Digital Stories Preview */}
      <StoryPreviewSection />

      {/* 11. AI Discovery Preview */}
      <AIDiscoverySection />

      {/* 12. Student Support Message */}
      <SupportSection />

      {/* 13. Safety Disclaimer */}
      <SafetySection />
    </div>
  );
};
