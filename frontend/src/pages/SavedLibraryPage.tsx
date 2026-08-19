import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight, BookOpen, Headphones, HeartHandshake } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { FilterBar } from '../components/navigation/FilterBar';
import { Button } from '../components/buttons/Button';
import { Badge } from '../components/badges/Badge';
import { Card } from '../components/cards/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/modals/Modal';
import { personalizationStorage, SavedItem } from '../utils/personalizationStorage';

export const SavedLibraryPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'alphabetical'>('recent');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const loadSavedItems = () => {
    setSavedItems(personalizationStorage.getBookmarks());
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  const handleRemove = (contentType: string, id: string) => {
    personalizationStorage.removeBookmark(contentType, id);
    loadSavedItems();
  };

  const handleClearAll = () => {
    personalizationStorage.clearBookmarks();
    loadSavedItems();
    setIsConfirmOpen(false);
  };

  const filterItems = [
    { id: 'all', label: 'All Saved' },
    { id: 'article', label: 'Blogs' },
    { id: 'podcast', label: 'Podcasts' },
    { id: 'story', label: 'Digital Stories' },
  ];

  const filteredItems = savedItems.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.contentType === activeFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
  });

  const getItemIcon = (type: string) => {
    if (type === 'podcast') return <Headphones size={14} />;
    if (type === 'story') return <HeartHandshake size={14} />;
    return <BookOpen size={14} />;
  };

  return (
    <div className="container py-6 animate-fade-in">
      {/* Header Hero */}
      <Hero
        eyebrow="Personal Collection"
        title="Your Personal Resource Library"
        subtitle="Access all your saved articles, podcast episodes, and student stories in one central location."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <Bookmark size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>{savedItems.length} Saved Items</h4>
            <span className="caption text-muted">Personal Resources</span>
          </div>
        }
      />

      {/* Filter and Sort Controls */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
        <FilterBar
          items={filterItems}
          selectedId={activeFilter}
          onSelect={(id) => setActiveFilter(id as string)}
        />

        <div className="flex items-center gap-sm">
          <label className="caption text-muted font-semibold">Sort By:</label>
          <select
            className="form-input text-small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="recent">Recently Saved</option>
            <option value="oldest">Oldest Saved</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          {savedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={14} className="text-danger" />}
              onClick={() => setIsConfirmOpen(true)}
            >
              Clear Library
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="my-8">
          <EmptyState
            title="No Saved Resources Found"
            description={
              activeFilter === 'all'
                ? "You haven't saved any resources yet. Click 'Save Resource' on articles, podcasts, or stories to build your collection."
                : `No saved resources match the selected filter '${activeFilter}'.`
            }
          />
        </div>
      )}

      {/* Saved Resource Grid */}
      {sortedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {sortedItems.map((item) => (
            <Card key={`${item.contentType}-${item.id}`} hoverable className="flex flex-col justify-between p-lg">
              <div className="flex flex-col gap-sm mb-4">
                <div className="flex items-center justify-between">
                  <Badge variant={item.contentType === 'podcast' ? 'info' : item.contentType === 'story' ? 'warning' : 'success'} className="flex items-center gap-xs">
                    {getItemIcon(item.contentType)} {item.contentType.toUpperCase()}
                  </Badge>
                  <button
                    onClick={() => handleRemove(item.contentType, item.id)}
                    className="btn btn-ghost"
                    style={{ padding: '0.25rem', color: 'var(--color-text-muted)' }}
                    aria-label={`Remove ${item.title} from saved library`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.2rem', lineHeight: 1.4 }}>{item.title}</h3>
                <p className="caption text-muted">{item.category}</p>
                <p className="body-regular text-muted" style={{ fontSize: '0.9rem' }}>
                  {item.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="caption text-muted">Saved {new Date(item.savedAt).toLocaleDateString()}</span>
                <NavLink to={item.url} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                    Open Resource
                  </Button>
                </NavLink>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Clear Saved Library?">
        <p className="body-regular text-muted mb-4">
          Are you sure you want to remove all saved articles, podcast episodes, and digital stories from your personal library?
        </p>
        <div className="flex justify-end gap-sm">
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleClearAll}>
            Clear All Saved Items
          </Button>
        </div>
      </Modal>
    </div>
  );
};
