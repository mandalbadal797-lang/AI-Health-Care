import React from 'react';
import { NavLink } from 'react-router-dom';
import { Play, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Card } from '../cards/Card';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons/Button';

export interface ContentProgressProps {
  id: string;
  contentType: 'article' | 'podcast' | 'story';
  title: string;
  slug: string;
  category: string;
  url: string;
  progressPercent: number;
}

export const ContentProgress: React.FC<ContentProgressProps> = ({
  contentType,
  title,
  category,
  url,
  progressPercent,
}) => {
  const isCompleted = progressPercent >= 90;

  return (
    <Card hoverable className="p-md flex flex-col justify-between gap-sm">
      <div className="flex items-center justify-between">
        <Badge variant={contentType === 'podcast' ? 'info' : contentType === 'story' ? 'warning' : 'success'}>
          {contentType.toUpperCase()}
        </Badge>
        <span className="caption font-semibold" style={{ color: isCompleted ? 'var(--color-success)' : 'var(--color-primary)' }}>
          {isCompleted ? 'Completed' : `${Math.round(progressPercent)}% Read`}
        </span>
      </div>

      <h4 style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>{title}</h4>
      <span className="caption text-muted">{category}</span>

      {/* Progress Bar Container */}
      <div className="w-full my-1" style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="caption text-muted flex items-center gap-xs">
          {isCompleted ? <CheckCircle size={14} className="text-success" /> : contentType === 'podcast' ? <Play size={14} /> : <BookOpen size={14} />}
          {isCompleted ? 'Finished' : 'In Progress'}
        </span>
        <NavLink to={url} style={{ textDecoration: 'none' }}>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            {isCompleted ? 'Revisit' : 'Continue'}
          </Button>
        </NavLink>
      </div>
    </Card>
  );
};
