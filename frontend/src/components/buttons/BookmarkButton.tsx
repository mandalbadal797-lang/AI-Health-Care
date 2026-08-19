import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon, Check } from 'lucide-react';
import { personalizationStorage, SavedItem } from '../../utils/personalizationStorage';

export interface BookmarkButtonProps {
  item: Omit<SavedItem, 'savedAt'>;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md';
  onToggle?: (isSaved: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  item,
  variant = 'button',
  size = 'md',
  onToggle,
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setIsSaved(personalizationStorage.isBookmarked(item.contentType, item.id));
  }, [item.contentType, item.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSavedState = personalizationStorage.toggleBookmark(item);
    setIsSaved(newSavedState);
    if (onToggle) onToggle(newSavedState);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isSaved ? `Remove ${item.title} from saved library` : `Save ${item.title} to library`}
        aria-pressed={isSaved}
        className="btn btn-ghost"
        style={{
          padding: size === 'sm' ? '0.25rem' : '0.5rem',
          borderRadius: '50%',
          color: isSaved ? 'var(--color-primary)' : 'var(--color-text-muted)',
        }}
      >
        {isSaved ? <Check size={size === 'sm' ? 16 : 20} /> : <BookmarkIcon size={size === 'sm' ? 16 : 20} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSaved ? `Saved resource: ${item.title}` : `Save resource: ${item.title}`}
      aria-pressed={isSaved}
      className={`btn ${isSaved ? 'btn-ghost' : 'btn-outline'} ${size === 'sm' ? 'btn-sm' : ''}`}
      style={{
        borderColor: isSaved ? 'var(--color-primary)' : undefined,
        color: isSaved ? 'var(--color-primary)' : undefined,
        backgroundColor: isSaved ? 'var(--color-primary-light)' : undefined,
      }}
    >
      {isSaved ? (
        <>
          <Check size={16} className="mr-1 inline" /> Saved
        </>
      ) : (
        <>
          <BookmarkIcon size={16} className="mr-1 inline" /> Save Resource
        </>
      )}
    </button>
  );
};
