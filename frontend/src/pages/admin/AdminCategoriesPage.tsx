import React, { useState, useEffect } from 'react';
import { FolderTree } from 'lucide-react';
import { Card } from '../../components/cards/Card';
import { Badge } from '../../components/badges/Badge';
import { adminService } from '../../services/adminService';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);

  const loadCategories = () => {
    adminService
      .getCategories()
      .then((res) => setCategories(res.items))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="flex flex-col gap-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2>Category Taxonomy Management</h2>
          <p className="caption text-muted">Manage platform categories across Blogs, Podcasts, and Stories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-lg flex flex-col justify-between gap-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="info">{cat.slug}</Badge>
                <FolderTree size={20} className="text-primary" />
              </div>
              <h4 style={{ fontSize: '1.15rem' }}>{cat.name}</h4>
              <p className="caption text-muted mt-1">{cat.description || 'Core platform content category.'}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
