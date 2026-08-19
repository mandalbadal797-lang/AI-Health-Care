import React, { useState, useEffect } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { libraryService } from '../../services/libraryService';
import { personalizationStorage } from '../../utils/personalizationStorage';

export interface SaveButtonProps {
  item: {
    id: string;
    contentType: 'article' | 'podcast' | 'story';
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    url: string;
  };
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  item,
  variant = 'button',
  size = 'md',
  className = '',
}) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedInLocal = personalizationStorage.isBookmarked(item.contentType, item.id);
    setIsSaved(savedInLocal);
  }, [item.contentType, item.id]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

    const previousState = isSaved;
    setIsSaved(!previousState); // Optimistic UI update
    setIsLoading(true);

    try {
      if (!previousState) {
        // Save action
        personalizationStorage.toggleBookmark({
          id: item.id,
          contentType: item.contentType,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          category: item.category,
          url: item.url,
        });
        await libraryService.saveContent(item.id, item.contentType);
      } else {
        // Remove action
        personalizationStorage.removeBookmark(item.contentType, item.id);
        await libraryService.removeSavedContent(item.id, item.contentType);
      }
    } catch {
      // Rollback on failure
      setIsSaved(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleSave}
        disabled={isLoading}
        className={`btn btn-ghost p-xs text-muted hover:text-primary transition-colors ${className}`}
        aria-label={isSaved ? 'Remove from saved library' : 'Save to library'}
        title={isSaved ? 'Remove from library' : 'Save to library'}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin text-primary" />
        ) : isSaved ? (
          <Check size={18} className="text-success font-bold" />
        ) : (
          <Bookmark size={18} />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={isSaved ? 'secondary' : 'primary'}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      leftIcon={
        isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isSaved ? (
          <Check size={16} className="text-success" />
        ) : (
          <Bookmark size={16} />
        )
      }
      className={className}
    >
      {isLoading ? 'Saving...' : isSaved ? 'Saved to Library' : 'Save to Library'}
    </Button>
  );
};
