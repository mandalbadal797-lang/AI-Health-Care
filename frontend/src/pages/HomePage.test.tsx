import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { AudioPlayerProvider } from '../context/AudioPlayerContext';
import { describe, it, expect } from 'vitest';

describe('HomePage Component', () => {
  it('renders all main homepage sections without crashing', () => {
    render(
      <AudioPlayerProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </AudioPlayerProvider>
    );

    // Verify main hero title heading renders
    expect(screen.getByText(/Navigate College Life with Confidence & Resilience/i)).toBeTruthy();
  });
});
