import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../typography/SectionHeader';
import { ContentProgress } from '../content/ContentProgress';
import { personalizationStorage, RecentItem } from '../../utils/personalizationStorage';

export const ContinueSection: React.FC = () => {
  const [continueItems, setContinueItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    const recent = personalizationStorage.getRecentlyViewed();
    const active = recent.filter((r) => r.progressPercent && r.progressPercent > 0 && r.progressPercent < 90);
    setContinueItems(active.slice(0, 3));
  }, []);

  if (continueItems.length === 0) return null;

  return (
    <section className="mb-8 animate-fade-in">
      <SectionHeader
        eyebrow="Resume Activity"
        title="Continue Where You Left Off"
        subtitle="Quickly return to your recent articles, podcasts, and student stories."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {continueItems.map((item) => (
          <ContentProgress
            key={`${item.contentType}-${item.id}`}
            id={item.id}
            contentType={item.contentType}
            title={item.title}
            slug={item.slug}
            category={item.category}
            url={item.url}
            progressPercent={item.progressPercent || 10}
          />
        ))}
      </div>
    </section>
  );
};
