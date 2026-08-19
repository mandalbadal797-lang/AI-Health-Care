import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SavedLibraryPage } from './SavedLibraryPage';
import { describe, it, expect } from 'vitest';

describe('SavedLibraryPage Component', () => {
  it('renders Saved Library header and empty state without throwing', () => {
    render(
      <BrowserRouter>
        <SavedLibraryPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Personal Resource Library/i)).toBeTruthy();
    expect(screen.getByText(/You haven't saved any resources yet/i)).toBeTruthy();
  });
});
