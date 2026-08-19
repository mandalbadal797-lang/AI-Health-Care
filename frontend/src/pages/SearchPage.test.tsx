import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchPage } from './SearchPage';
import { describe, it, expect } from 'vitest';

describe('SearchPage Component', () => {
  it('renders search page hero title and natural language search helper without throwing', () => {
    render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Search & Explore MindCampus/i)).toBeTruthy();
    expect(screen.getByText(/Natural Language Search:/i)).toBeTruthy();
  });
});
