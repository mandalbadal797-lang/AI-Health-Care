import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Headphones, HeartHandshake, ArrowRight, Clock } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons/Button';
import { BookmarkButton } from '../buttons/BookmarkButton';
import { SearchResultItem } from '../../services/searchService';

export interface SearchResultCardProps {
  item: SearchResultItem;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ item }) => {
  const getItemIcon = (type: string) => {
    if (type === 'podcast') return <Headphones size={14} />;
    if (type === 'story') return <HeartHandshake size={14} />;
    return <BookOpen size={14} />;
  };

  const getBadgeVariant = (type: string) => {
    if (type === 'podcast') return 'info';
    if (type === 'story') return 'warning';
    return 'success';
  };

  return (
    <Card hoverable className="p-lg flex flex-col justify-between gap-md">
      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between">
          <Badge variant={getBadgeVariant(item.type)} className="flex items-center gap-xs">
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

        <h3 style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>{item.title}</h3>
        <span className="caption text-muted font-semibold">{item.category_name}</span>

        <p className="body-regular text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
          {item.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <span className="caption text-muted flex items-center gap-xs">
          <Clock size={14} />
          {item.reading_time_minutes
            ? `${item.reading_time_minutes} min read`
            : item.duration_seconds
            ? `${Math.round(item.duration_seconds / 60)} min audio`
            : 'Student Resource'}
        </span>
        <NavLink to={item.url} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
            Open Resource
          </Button>
        </NavLink>
      </div>
    </Card>
  );
};
