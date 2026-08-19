import React from 'react';
import { BookOpen, Quote, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../badges/Badge';

export interface StoryCardPreviewProps {
  title: string;
  description: string;
  category: string;
  quoteSnippet: string;
  sectionCount: number;
}

export const StoryCardPreview: React.FC<StoryCardPreviewProps> = ({
  title,
  description,
  category,
  quoteSnippet,
  sectionCount,
}) => {
  return (
    <Card hoverable className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <Badge variant="info">{category}</Badge>
        <span className="caption flex items-center gap-xs text-muted">
          <BookOpen size={14} /> {sectionCount} Sections
        </span>
      </div>

      <h3>{title}</h3>
      <p className="text-muted text-small">{description}</p>

      {/* Embedded Quote Highlight Box */}
      <div
        className="p-sm flex items-start gap-sm mt-1"
        style={{
          backgroundColor: 'var(--color-primary-light)',
          borderLeft: '4px solid var(--color-primary)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Quote size={18} className="text-primary" style={{ flexShrink: 0 }} />
        <p className="text-small" style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>
          "{quoteSnippet}"
        </p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 text-small font-semibold text-primary">
        <span>Read Student Story</span>
        <ArrowRight size={16} />
      </div>
    </Card>
  );
};
