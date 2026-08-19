import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BlogPage } from './BlogPage';
import { describe, it, expect } from 'vitest';

describe('BlogPage Component', () => {
  it('renders blog page hero and filter section without crashing', () => {
    render(
      <BrowserRouter>
        <BlogPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Explore Student Wellness & Growth/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Search articles by title/i)).toBeTruthy();
  });
});
