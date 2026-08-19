import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search articles, podcasts, stories...',
  ...props
}) => {
  return (
    <Input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      leftIcon={<Search size={18} />}
      rightIcon={
        value ? (
          <button
            type="button"
            onClick={onClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}
            aria-label="Clear search query"
          >
            <X size={16} />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
