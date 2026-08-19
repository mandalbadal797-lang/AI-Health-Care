import React from 'react';
import { Button } from '../buttons/Button';

export interface FilterItem {
  id: string | number;
  label: string;
}

export interface FilterBarProps {
  items: FilterItem[];
  selectedId: string | number;
  onSelect: (id: string | number) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  items,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex items-center gap-sm flex-wrap mb-6" role="tablist" aria-label="Content Filters">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <Button
            key={item.id}
            variant={isSelected ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSelect(item.id)}
            role="tab"
            aria-selected={isSelected}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
};
