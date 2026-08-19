import { render, screen } from '@testing-library/react';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { describe, it, expect } from 'vitest';

describe('MindCampus Application Shell', () => {
  it('renders application homepage title without throwing exceptions', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    );

    const titleElement = screen.getByText(/Navigate College Life with Confidence/i);
    expect(titleElement).toBeTruthy();
  });
});
