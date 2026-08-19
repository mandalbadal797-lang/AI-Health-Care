import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, FolderTree, AlertCircle } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { SearchResultCard } from '../components/cards/SearchResultCard';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { Button } from '../components/buttons/Button';
import { searchService, SearchResultItem } from '../services/searchService';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/domain';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    Promise.all([
      categoryService.getCategoryBySlug(slug).catch(() => null),
      searchService.search({ category_slug: slug, limit: 20 }),
    ])
      .then(([catData, searchRes]) => {
        if (catData) setCategory(catData);
        setItems(searchRes.items);
      })
      .catch((err) => console.error('Failed to load category content.', err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="container py-6 animate-fade-in">
      <NavLink to="/categories" style={{ textDecoration: 'none' }} className="inline-flex items-center gap-xs text-primary font-semibold mb-6">
        <ArrowLeft size={18} /> Back to Categories Directory
      </NavLink>

      <Hero
        eyebrow="Category View"
        title={category?.name || (slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Category')}
        subtitle={category?.description || `Explore student resources in the ${slug} topic category.`}
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <FolderTree size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>{items.length} Published Resources</h4>
            <span className="caption text-muted">Category Items</span>
          </div>
        }
      />

      {items.length === 0 ? (
        <div className="card p-xl text-center flex flex-col items-center gap-sm my-8">
          <AlertCircle size={40} className="text-warning" />
          <h3>No Published Resources In This Category</h3>
          <p className="caption text-muted">Check back soon as new student articles, podcasts, and stories are published.</p>
          <NavLink to="/search" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Global Content Search</Button>
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {items.map((item) => (
            <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
