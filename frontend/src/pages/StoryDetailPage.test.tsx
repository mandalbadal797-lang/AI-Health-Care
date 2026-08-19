import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StoryDetailPage } from './StoryDetailPage';
import { describe, it, expect } from 'vitest';

describe('StoryDetailPage Component', () => {
  it('renders loading or error container when digital story is requested', () => {
    render(
      <MemoryRouter initialEntries={['/stories/failed-first-midterm-found-my-voice']}>
        <Routes>
          <Route path="/stories/:slug" element={<StoryDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(document.querySelector('.container') || document.querySelector('.skeleton')).toBeTruthy();
  });
});
