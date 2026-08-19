import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Headphones, HeartHandshake, Loader2 } from 'lucide-react';
import { searchService, SearchSuggestion } from '../../services/searchService';
import { searchStorage } from '../../utils/searchStorage';

export interface GlobalSearchBarProps {
  placeholder?: string;
  onSearchSubmit?: () => void;
  className?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  placeholder = 'Search articles, podcasts, and stories...',
  onSearchSubmit,
  className = '',
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced suggestion fetcher
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      searchService
        .getSuggestions(query)
        .then((items) => {
          setSuggestions(items);
          setIsOpen(items.length > 0);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    searchStorage.addRecentSearch(query);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    searchStorage.addRecentSearch(item.title);
    setIsOpen(false);
    navigate(item.url);
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    }
  };

  const getItemIcon = (type: string) => {
    if (type === 'podcast') return <Headphones size={14} className="text-info" />;
    if (type === 'story') return <HeartHandshake size={14} className="text-warning" />;
    return <BookOpen size={14} className="text-primary" />;
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <Search
          size={18}
          className="absolute left-3 text-muted pointer-events-none"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          className="form-input w-full pl-9 pr-8"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Global search input"
          aria-expanded={isOpen}
          style={{
            fontSize: '0.9rem',
            paddingTop: '0.45rem',
            paddingBottom: '0.45rem',
            borderRadius: 'var(--radius-pill)',
          }}
        />
        {isLoading ? (
          <Loader2 size={16} className="absolute right-3 text-muted animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 btn btn-ghost text-muted hover:text-main"
            style={{ padding: '0.15rem' }}
            aria-label="Clear search query"
          >
            <X size={16} />
          </button>
        ) : null}
      </form>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 card glass p-xs"
          style={{
            zIndex: 1000,
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
          role="listbox"
        >
          {suggestions.map((item, idx) => (
            <div
              key={`${item.type}-${item.slug}`}
              onClick={() => handleSelectSuggestion(item)}
              className={`p-sm flex items-center justify-between gap-sm cursor-pointer rounded-md transition-colors ${
                selectedIndex === idx ? 'bg-primary-light text-primary' : 'hover:bg-primary-light'
              }`}
              role="option"
              aria-selected={selectedIndex === idx}
            >
              <div className="flex items-center gap-xs overflow-hidden">
                {getItemIcon(item.type)}
                <span className="text-small font-medium text-main truncate">{item.title}</span>
              </div>
              <span className="caption text-muted flex-shrink-0">{item.type.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
