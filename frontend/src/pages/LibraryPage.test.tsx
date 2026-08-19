import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LibraryPage } from './LibraryPage';
import { describe, it, expect } from 'vitest';

describe('LibraryPage Component', () => {
  it('renders student library hero title and navigation tabs without crashing', () => {
    render(
      <BrowserRouter>
        <LibraryPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/My Learning Library/i)).toBeTruthy();
    expect(screen.getByText(/Saved Resources/i)).toBeTruthy();
    expect(screen.getByText(/Continue Learning/i)).toBeTruthy();
  });
});
