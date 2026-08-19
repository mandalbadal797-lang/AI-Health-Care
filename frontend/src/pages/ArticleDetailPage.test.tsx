import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ArticleDetailPage } from './ArticleDetailPage';
import { describe, it, expect } from 'vitest';

describe('ArticleDetailPage Component', () => {
  it('renders loading or error state gracefully when article is requested', () => {
    render(
      <MemoryRouter initialEntries={['/blog/how-to-stay-calm-during-exam-week']}>
        <Routes>
          <Route path="/blog/:slug" element={<ArticleDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Initial render displays skeleton loading state or content wrapper
    expect(document.querySelector('.container') || document.querySelector('.skeleton')).toBeTruthy();
  });
});
