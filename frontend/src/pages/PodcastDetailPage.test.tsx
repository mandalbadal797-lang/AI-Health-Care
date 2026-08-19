import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PodcastDetailPage } from './PodcastDetailPage';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import { describe, it, expect } from 'vitest';

describe('PodcastDetailPage Component', () => {
  it('renders loading or error container when podcast episode is requested', () => {
    render(
      <AudioPlayerProvider>
        <MemoryRouter initialEntries={['/podcasts/navigating-midterm-anxiety-resetting-mindset']}>
          <Routes>
            <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AudioPlayerProvider>
    );

    expect(document.querySelector('.container') || document.querySelector('.skeleton')).toBeTruthy();
  });
});
