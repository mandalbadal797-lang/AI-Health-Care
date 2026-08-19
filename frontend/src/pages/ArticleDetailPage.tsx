import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Sparkles, AlertCircle } from 'lucide-react';
import { ReadingContainer } from '../components/content/ReadingContainer';
import { QuoteBlock } from '../components/content/QuoteBlock';
import { SafetyNotice } from '../components/content/SafetyNotice';
import { RelatedContentSection } from '../components/content/RelatedContentSection';
import { ContentFeedback } from '../components/feedback/ContentFeedback';
import { CommentSection } from '../components/community/CommentSection';
import { ArticleCardPreview } from '../components/cards/ArticleCardPreview';
import { Badge } from '../components/badges/Badge';
import { Button } from '../components/buttons/Button';
import { BookmarkButton } from '../components/buttons/BookmarkButton';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { articleService } from '../services/articleService';
import { ArticleDetail } from '../types/domain';
import { personalizationStorage } from '../utils/personalizationStorage';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    articleService
      .getArticleBySlug(slug)
      .then((data) => {
        setArticle(data);
        document.title = `${data.title} — MindCampus Wellness`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.excerpt);

        // Record recently viewed and initial reading progress
        personalizationStorage.addRecentlyViewed({
          id: data.id,
          contentType: 'article',
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          category: data.category.name,
          url: `/blog/${data.slug}`,
          progressPercent: 25,
        });
        personalizationStorage.saveProgress('article', data.id, 25);
      })
      .catch((err: any) => {
        setError(err?.message || 'Article could not be loaded.');
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

  if (error || !article) {
    return (
      <div className="container py-8">
        <div className="card p-xl text-center flex flex-col items-center gap-md" style={{ borderColor: 'var(--color-danger)' }}>
          <AlertCircle size={40} className="text-danger" />
          <h2>Article Not Found</h2>
          <p className="text-muted">{error || 'The requested article could not be found.'}</p>
          <NavLink to="/blog">
            <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
              Back to Blog Library
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  // Parse structured sections from content text
  const renderStructuredContent = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (key: string) => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={key} className="my-4 body-lg">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        flushParagraph(`p-${idx}`);
        elements.push(
          <h2 key={`h2-${idx}`} className="mt-8 mb-4">
            {trimmed.substring(3)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushParagraph(`p-${idx}`);
        elements.push(
          <h3 key={`h3-${idx}`} className="mt-6 mb-3">
            {trimmed.substring(4)}
          </h3>
        );
      } else if (trimmed.startsWith('> ')) {
        flushParagraph(`p-${idx}`);
        elements.push(
          <QuoteBlock key={`quote-${idx}`} quote={trimmed.substring(2).replace(/"/g, '')} />
        );
      } else if (trimmed.startsWith('- ')) {
        flushParagraph(`p-${idx}`);
        elements.push(
          <li key={`li-${idx}`} className="ml-6 my-1 text-secondary">
            {trimmed.substring(2)}
          </li>
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
        {/* Back Navigation Button */}
        <div className="flex items-center justify-between mb-6">
          <NavLink to="/blog" style={{ textDecoration: 'none' }} className="inline-flex items-center gap-xs text-primary font-semibold">
            <ArrowLeft size={18} /> Back to Blog Library
          </NavLink>
          <BookmarkButton
            item={{
              id: article.id,
              contentType: 'article',
              title: article.title,
              slug: article.slug,
              excerpt: article.excerpt,
              category: article.category.name,
              url: `/blog/${article.slug}`,
            }}
          />
        </div>

        {/* Header Metadata */}
        <div className="flex flex-col gap-sm mb-6">
          <div className="flex items-center gap-sm flex-wrap">
            <Badge variant="info">{article.category.name}</Badge>
            {article.is_ai_generated && (
              <Badge variant="warning" className="flex items-center gap-xs">
                <Sparkles size={12} /> AI Assisted Draft
              </Badge>
            )}
          </div>

          <h1 className="display-heading">{article.title}</h1>

          <p className="body-lg text-muted font-medium">{article.excerpt}</p>

          <div className="flex items-center gap-md text-small text-muted pt-4 flex-wrap" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="flex items-center gap-xs"><User size={16} /> By {article.author_name}</span>
            <span className="flex items-center gap-xs"><Clock size={16} /> {article.reading_time_minutes} min read</span>
            <span className="flex items-center gap-xs"><Calendar size={16} /> {new Date(article.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="article-body my-6" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
          {renderStructuredContent(article.content)}
        </div>

        {/* Student Content Feedback */}
        <ContentFeedback
          contentId={article.id}
          contentType="article"
          title={article.title}
        />

        {/* Student Community Discussion & Comments */}
        <CommentSection
          contentId={article.id}
          contentType="article"
        />

        {/* Related Content Discovery */}
        <RelatedContentSection
          contentType="article"
          currentId={article.id}
          categoryId={article.category.id}
        />

        {/* Mandatory Non-Clinical Safety Disclaimer */}
        <SafetyNotice />

        {/* Related Articles */}
        {article.related_articles && article.related_articles.length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h3 className="mb-4">Related Student Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {article.related_articles.map((rel) => (
                <NavLink key={rel.id} to={`/blog/${rel.slug}`} style={{ textDecoration: 'none' }}>
                  <ArticleCardPreview
                    title={rel.title}
                    excerpt={rel.excerpt}
                    category={rel.category_name}
                    readingTimeMinutes={rel.reading_time_minutes}
                    authorName={rel.author_name}
                    isAiGenerated={rel.is_ai_generated}
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
