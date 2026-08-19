import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, HeartHandshake } from 'lucide-react';
import { Card } from '../cards/Card';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons/Button';
import { BookmarkButton } from '../buttons/BookmarkButton';
import { searchService, SearchResultItem } from '../../services/searchService';

export interface RelatedContentSectionProps {
  contentType: 'article' | 'podcast' | 'story';
  currentId: string;
  categoryId: number;
}

export const RelatedContentSection: React.FC<RelatedContentSectionProps> = ({
  contentType,
  currentId,
  categoryId,
}) => {
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentId || !categoryId) return;
    setIsLoading(true);
    searchService
      .getRelatedContent(contentType, currentId, categoryId, 3)
      .then((res) => setItems(res))
      .catch((err) => console.error('Failed to load related content', err))
      .finally(() => setIsLoading(false));
  }, [contentType, currentId, categoryId]);

  if (!isLoading && items.length === 0) return null;

  const getItemIcon = (type: string) => {
    if (type === 'podcast') return <Headphones size={14} />;
    if (type === 'story') return <HeartHandshake size={14} />;
    return <BookOpen size={14} />;
  };

  return (
    <section className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
      <h3 className="mb-4">Related Student Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} hoverable className="p-lg flex flex-col justify-between gap-sm">
            <div className="flex flex-col gap-xs mb-2">
              <div className="flex items-center justify-between">
                <Badge variant={item.type === 'podcast' ? 'info' : item.type === 'story' ? 'warning' : 'success'} className="flex items-center gap-xs">
                  {getItemIcon(item.type)} {item.type.toUpperCase()}
                </Badge>
                <BookmarkButton
                  item={{
                    id: item.id,
                    contentType: item.type,
                    title: item.title,
                    slug: item.slug,
                    excerpt: item.excerpt,
                    category: item.category_name,
                    url: item.url,
                  }}
                  variant="icon"
                  size="sm"
                />
              </div>
              <h4 style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>{item.title}</h4>
              <p className="caption text-muted">{item.excerpt}</p>
            </div>

            <NavLink to={item.url} style={{ textDecoration: 'none' }} className="pt-2">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />} className="w-full justify-between">
                Read Resource
              </Button>
            </NavLink>
          </Card>
        ))}
      </div>
    </section>
  );
};
