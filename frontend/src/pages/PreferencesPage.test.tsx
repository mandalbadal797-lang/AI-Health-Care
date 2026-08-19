import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PreferencesPage } from './PreferencesPage';
import { describe, it, expect } from 'vitest';

describe('PreferencesPage Component', () => {
  it('renders Preferences page title, privacy explanation, and topic buttons', () => {
    render(
      <BrowserRouter>
        <PreferencesPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Personalization & Resource Preferences/i)).toBeTruthy();
    expect(screen.getByText(/Personalization Privacy Guarantee/i)).toBeTruthy();
    expect(screen.getByText(/Academic Stress/i)).toBeTruthy();
  });
});
