import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CategoriesPage } from './CategoriesPage';
import { describe, it, expect } from 'vitest';

describe('CategoriesPage Component', () => {
  it('renders categories page hero title without throwing', () => {
    render(
      <BrowserRouter>
        <CategoriesPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Explore Topics & Categories/i)).toBeTruthy();
  });
});
