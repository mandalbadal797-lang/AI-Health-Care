import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StoryPage } from './StoryPage';
import { describe, it, expect } from 'vitest';

describe('StoryPage Component', () => {
  it('renders story page hero and search input without crashing', () => {
    render(
      <BrowserRouter>
        <StoryPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Stories From the Student Journey/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Search stories by narrative topic/i)).toBeTruthy();
  });
});
