import React from 'react';
import { Card } from './Card';

export interface CategoryCardProps {
  name: string;
  itemCount: number;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  itemCount,
  icon,
  isActive = false,
  onClick,
}) => {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={`flex items-center gap-md p-md cursor-pointer ${isActive ? 'card-glass' : ''}`}
      style={{
        borderColor: isActive ? 'var(--color-primary)' : 'var(--border-color)',
        backgroundColor: isActive ? 'var(--color-primary-light)' : 'var(--bg-surface)',
      }}
    >
      <div
        className="p-sm flex items-center justify-center"
        style={{
          borderRadius: 'var(--radius-md)',
          backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-secondary)',
          color: isActive ? '#ffffff' : 'var(--color-primary)',
        }}
      >
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: '1rem' }}>{name}</h4>
        <span className="caption text-muted">{itemCount} items</span>
      </div>
    </Card>
  );
};
