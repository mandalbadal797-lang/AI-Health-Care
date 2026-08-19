import React from 'react';
import { Play, Clock, Headphones } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons/Button';

export interface PodcastCardPreviewProps {
  episodeNumber: number;
  title: string;
  description: string;
  durationFormatted: string;
  category: string;
  thumbnailUrl?: string;
  onPlayClick?: () => void;
}

export const PodcastCardPreview: React.FC<PodcastCardPreviewProps> = ({
  episodeNumber,
  title,
  description,
  durationFormatted,
  category,
  thumbnailUrl,
  onPlayClick,
}) => {
  return (
    <Card hoverable className="flex items-center gap-lg p-md">
      {/* Thumbnail artwork */}
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Headphones size={36} className="text-primary" />
        )}
      </div>

      {/* Episode Details */}
      <div className="flex flex-col gap-xs" style={{ flex: 1 }}>
        <div className="flex items-center gap-sm">
          <Badge variant="info">Ep {episodeNumber}</Badge>
          <span className="caption">{category}</span>
        </div>
        <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
        <p className="text-muted text-small" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>
        <div className="flex items-center gap-md mt-1 text-small text-muted">
          <span className="flex items-center gap-xs"><Clock size={14} /> {durationFormatted}</span>
        </div>
      </div>

      {/* Play Action Button */}
      <Button
        variant="primary"
        size="sm"
        leftIcon={<Play size={16} fill="white" />}
        onClick={onPlayClick}
        aria-label={`Play episode ${episodeNumber}: ${title}`}
      >
        Play
      </Button>
    </Card>
  );
};
