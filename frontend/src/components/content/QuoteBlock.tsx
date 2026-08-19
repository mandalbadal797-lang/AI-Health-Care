import React from 'react';
import { Quote } from 'lucide-react';

export interface QuoteBlockProps {
  quote: string;
  author?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ quote, author }) => {
  return (
    <blockquote
      className="p-lg my-6 flex flex-col gap-sm"
      style={{
        backgroundColor: 'var(--color-primary-light)',
        borderLeft: '4px solid var(--color-primary)',
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      }}
    >
      <Quote size={24} className="text-primary" />
      <p style={{ fontSize: '1.15rem', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-main)' }}>
        "{quote}"
      </p>
      {author && <cite className="text-small text-muted font-semibold">— {author}</cite>}
    </blockquote>
  );
};
