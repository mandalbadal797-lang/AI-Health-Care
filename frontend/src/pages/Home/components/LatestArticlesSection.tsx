import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../../../components/typography/SectionHeader';
import { ArticleCardPreview } from '../../../components/cards/ArticleCardPreview';
import { CardSkeleton } from '../../../components/feedback/Skeleton';
import { Button } from '../../../components/buttons/Button';
import { articleService } from '../../../services/articleService';
import { ArticleSummary } from '../../../types/domain';
import { LATEST_ARTICLES as FALLBACK_ARTICLES } from '../../../data/homeMockData';

export const LatestArticlesSection: React.FC = () => {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    articleService
      .getArticles({ page: 1, limit: 3 })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setArticles(res.items);
        } else {
          setArticles(FALLBACK_ARTICLES as any);
        }
      })
      .catch(() => {
        setArticles(FALLBACK_ARTICLES as any);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="mb-8">
      <SectionHeader
        eyebrow="Recent Blog Posts"
        title="Latest Articles & Insights"
        subtitle="Practical student advice, study habits, and personal growth articles."
        action={
          <NavLink to="/blog">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight size={16} />}>
              View All Articles
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
          {articles.map((article) => (
            <NavLink key={article.id} to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
              <ArticleCardPreview
                title={article.title}
                excerpt={article.excerpt}
                category={article.category_name || (article as any).category}
                readingTimeMinutes={article.reading_time_minutes}
                authorName={article.author_name || (article as any).authorName}
                isAiGenerated={article.is_ai_generated}
              />
            </NavLink>
          ))}
        </div>
      )}
    </section>
  );
};
