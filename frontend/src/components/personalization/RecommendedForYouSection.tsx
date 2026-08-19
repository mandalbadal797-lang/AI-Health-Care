import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Headphones, HeartHandshake } from 'lucide-react';
import { SectionHeader } from '../typography/SectionHeader';
import { Card } from '../cards/Card';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons/Button';
import { BookmarkButton } from '../buttons/BookmarkButton';
import { personalizationStorage } from '../../utils/personalizationStorage';
import { recommendationEngine, ContentCardItem } from '../../utils/recommendationEngine';
import { articleService } from '../../services/articleService';
import { podcastService } from '../../services/podcastService';
import { storyService } from '../../services/storyService';

export const RecommendedForYouSection: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ContentCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPersonalizedContent() {
      setIsLoading(true);
      try {
        const [arts, pods, sts] = await Promise.all([
          articleService.getArticles({ page: 1, limit: 3 }).catch(() => ({ items: [] })),
          podcastService.getPodcasts({ page: 1, limit: 3 }).catch(() => ({ items: [] })),
          storyService.getStories({ page: 1, limit: 3 }).catch(() => ({ items: [] })),
        ]);

        const candidates: ContentCardItem[] = [];

        arts.items.forEach((art) => {
          candidates.push({
            id: art.id,
            contentType: 'article',
            title: art.title,
            slug: art.slug,
            excerpt: art.excerpt,
            category: art.category_name,
            categorySlug: art.category_slug,
            url: `/blog/${art.slug}`,
          });
        });

        pods.items.forEach((pod) => {
          candidates.push({
            id: pod.id,
            contentType: 'podcast',
            title: pod.title,
            slug: pod.slug,
            excerpt: pod.description,
            category: pod.category_name,
            categorySlug: pod.category_slug,
            url: `/podcasts/${pod.slug}`,
          });
        });

        sts.items.forEach((st) => {
          candidates.push({
            id: st.id,
            contentType: 'story',
            title: st.title,
            slug: st.slug,
            excerpt: st.subtitle,
            category: st.category_name,
            categorySlug: st.category_slug,
            url: `/stories/${st.slug}`,
          });
        });

        const interests = personalizationStorage.getSelectedInterests();
        const bookmarks = personalizationStorage.getBookmarks();
        const recent = personalizationStorage.getRecentlyViewed();

        const ranked = recommendationEngine.scoreAndRankContent(candidates, interests, bookmarks, recent);
        setRecommendations(ranked.slice(0, 3));
      } catch (e) {
        console.error('Failed to load personalized content', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadPersonalizedContent();
  }, []);

  const getItemIcon = (type: string) => {
    if (type === 'podcast') return <Headphones size={14} />;
    if (type === 'story') return <HeartHandshake size={14} />;
    return <BookOpen size={14} />;
  };

  if (!isLoading && recommendations.length === 0) return null;

  return (
    <section className="mb-8 animate-fade-in">
      <SectionHeader
        eyebrow="Personalized Discovery"
        title="Recommended For You"
        subtitle="Selected based on your topic preferences and saved resources."
        action={
          <NavLink to="/preferences">
            <Button variant="outline" size="sm" rightIcon={<Sparkles size={14} />}>
              Manage Topics
            </Button>
          </NavLink>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <Card key={`${item.contentType}-${item.id}`} hoverable className="flex flex-col justify-between p-lg">
            <div className="flex flex-col gap-sm mb-4">
              <div className="flex items-center justify-between">
                <Badge variant={item.contentType === 'podcast' ? 'info' : item.contentType === 'story' ? 'warning' : 'success'} className="flex items-center gap-xs">
                  {getItemIcon(item.contentType)} {item.contentType.toUpperCase()}
                </Badge>
                <BookmarkButton item={item} variant="icon" size="sm" />
              </div>

              <h3 style={{ fontSize: '1.2rem', lineHeight: 1.4 }}>{item.title}</h3>

              <div className="flex items-center gap-xs text-xs font-semibold text-primary">
                <Sparkles size={12} /> {item.reason}
              </div>

              <p className="body-regular text-muted" style={{ fontSize: '0.9rem' }}>
                {item.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span className="caption text-muted">{item.category}</span>
              <NavLink to={item.url} style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  Explore
                </Button>
              </NavLink>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
