import React from 'react';
import { Clock, Bookmark, Sparkles } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../badges/Badge';
import { IconButton } from '../buttons/IconButton';

export interface ArticleCardPreviewProps {
  title: string;
  excerpt: string;
  category: string;
  readingTimeMinutes: number;
  authorName: string;
  coverImage?: string;
  isAiGenerated?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
}

export const ArticleCardPreview: React.FC<ArticleCardPreviewProps> = ({
  title,
  excerpt,
  category,
  readingTimeMinutes,
  authorName,
  coverImage,
  isAiGenerated = false,
  isBookmarked = false,
  onBookmarkToggle,
}) => {
  return (
    <Card hoverable className="flex flex-col gap-md" style={{ overflow: 'hidden', padding: 0 }}>
      {/* Cover Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'var(--color-primary-light)' }}>
        {coverImage ? (
          <img src={coverImage} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--color-primary)' }}>
            <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{category}</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <Badge variant="info">{category}</Badge>
          {isAiGenerated && (
            <Badge variant="warning">
              <Sparkles size={12} /> AI Assisted
            </Badge>
          )}
        </div>
        {onBookmarkToggle && (
          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
            <IconButton
              icon={<Bookmark size={18} fill={isBookmarked ? 'var(--color-primary)' : 'none'} />}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              variant="secondary"
              size="sm"
              onClick={onBookmarkToggle}
            />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-lg flex flex-col gap-sm" style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.15rem', lineHeight: '1.3' }}>{title}</h3>
        <p className="text-muted text-small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 text-small text-muted" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span>By {authorName}</span>
          <span className="flex items-center gap-xs">
            <Clock size={14} /> {readingTimeMinutes} min read
          </span>
        </div>
      </div>
    </Card>
  );
};
