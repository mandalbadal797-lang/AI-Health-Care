import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FolderTree, ArrowRight, BookOpen } from 'lucide-react';
import { Hero } from '../components/typography/Hero';
import { Card } from '../components/cards/Card';
import { Badge } from '../components/badges/Badge';
import { CardSkeleton } from '../components/feedback/Skeleton';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/domain';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    categoryService
      .getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="container py-6 animate-fade-in">
      <Hero
        eyebrow="Taxonomy Directory"
        title="Explore Topics & Categories"
        subtitle="Browse MindCampus student motivation and mental wellness resources organized by core topics."
        visualElement={
          <div className="card p-lg flex flex-col items-center text-center gap-xs">
            <FolderTree size={40} className="text-primary" />
            <h4 style={{ fontSize: '1.1rem' }}>{categories.length} Categories</h4>
            <span className="caption text-muted">Topic Directory</span>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-8">
          {categories.map((cat) => (
            <Card key={cat.id} hoverable className="p-lg flex flex-col justify-between gap-md">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="info" className="flex items-center gap-xs">
                    <BookOpen size={12} /> {cat.slug}
                  </Badge>
                  <FolderTree size={20} className="text-primary" />
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>{cat.name}</h3>
                <p className="body-regular text-muted mt-2" style={{ fontSize: '0.95rem' }}>
                  {cat.description || 'Core MindCampus student wellness content category.'}
                </p>
              </div>

              <NavLink to={`/category/${cat.slug}`} style={{ textDecoration: 'none', borderTop: '1px solid var(--border-color)' }} className="pt-4">
                <div className="flex items-center justify-between text-primary font-semibold text-small">
                  <span>Browse Category</span>
                  <ArrowRight size={16} />
                </div>
              </NavLink>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
