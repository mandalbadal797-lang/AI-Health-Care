import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Headphones, HeartHandshake, Play, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from './Card';
import { Badge } from '../badges/Badge';
import { Button } from '../buttons/Button';
import { LibraryItem } from '../../services/libraryService';

export interface LibraryContentCardProps {
  item: LibraryItem;
  onRemove?: (id: string, type: string) => void;
}

export const LibraryContentCard: React.FC<LibraryContentCardProps> = ({ item, onRemove }) => {
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

  const progress = Math.round(item.progress_percent || 0);
  const isCompleted = item.is_completed || progress >= 90;

  const getActionButtonLabel = () => {
    if (isCompleted) return 'Revisit Resource';
    if (item.type === 'podcast') return progress > 0 ? 'Resume Listening' : 'Listen Episode';
    return progress > 0 ? 'Continue Reading' : 'Read Resource';
  };

  return (
    <Card hoverable className="p-lg flex flex-col justify-between gap-md">
      <div className="flex flex-col gap-sm">
        <div className="flex items-center justify-between">
          <Badge variant={getBadgeVariant(item.type)} className="flex items-center gap-xs">
            {getItemIcon(item.type)} {item.type.toUpperCase()}
          </Badge>

          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(item.id, item.type);
              }}
              className="btn btn-ghost text-muted hover:text-danger p-xs"
              aria-label={`Remove ${item.title} from library`}
              title="Remove from library"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <h3 style={{ fontSize: '1.2rem', lineHeight: 1.4 }}>{item.title}</h3>
        <span className="caption text-muted font-semibold">{item.category_name}</span>
        <p className="body-regular text-muted line-clamp-2" style={{ fontSize: '0.9rem' }}>
          {item.excerpt}
        </p>

        {/* Progress Bar Component */}
        <div className="mt-2 flex flex-col gap-xs">
          <div className="flex items-center justify-between text-small font-semibold">
            <span className="caption text-muted flex items-center gap-xs">
              {isCompleted ? <CheckCircle size={14} className="text-success" /> : null}
              {isCompleted ? 'Completed' : progress > 0 ? `${progress}% Progress` : 'Not Started'}
            </span>
            <span className="caption text-muted">{progress}%</span>
          </div>

          <div
            className="w-full bg-secondary rounded-full overflow-hidden"
            style={{ height: '6px' }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${item.title} reading progress`}
          >
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
        <span className="caption text-muted">
          {item.reading_time_minutes
            ? `${item.reading_time_minutes} min read`
            : item.duration_seconds
            ? `${Math.round(item.duration_seconds / 60)} min audio`
            : 'Resource'}
        </span>

        <NavLink to={item.url} style={{ textDecoration: 'none' }}>
          <Button
            variant={isCompleted ? 'outline' : 'primary'}
            size="sm"
            rightIcon={item.type === 'podcast' ? <Play size={14} /> : <ArrowRight size={14} />}
          >
            {getActionButtonLabel()}
          </Button>
        </NavLink>
      </div>
    </Card>
  );
};
