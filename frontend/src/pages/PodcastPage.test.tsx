import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PodcastPage } from './PodcastPage';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import { describe, it, expect } from 'vitest';

describe('PodcastPage Component', () => {
  it('renders podcast page hero banner and search input without crashing', () => {
    render(
      <AudioPlayerProvider>
        <BrowserRouter>
          <PodcastPage />
        </BrowserRouter>
      </AudioPlayerProvider>
    );

    expect(screen.getByText(/Listen, Reflect & Keep Moving/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Search podcasts by episode title/i)).toBeTruthy();
  });
});
