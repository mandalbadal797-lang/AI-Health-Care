import { render, screen } from '@testing-library/react';
import { SaveButton } from './SaveButton';
import { describe, it, expect } from 'vitest';

describe('SaveButton Component', () => {
  const mockItem = {
    id: 'test-item-1',
    contentType: 'article' as const,
    title: 'Test Article Title',
    slug: 'test-article-title',
    excerpt: 'Test Excerpt',
    category: 'Mental Health',
    url: '/blog/test-article-title',
  };

  it('renders Save to Library button without crashing', () => {
    render(<SaveButton item={mockItem} />);
    expect(screen.getByText(/Save to Library/i)).toBeTruthy();
  });
});
