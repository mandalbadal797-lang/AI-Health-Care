import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AIAssistantPage } from './AIAssistantPage';
import { describe, it, expect } from 'vitest';

describe('AIAssistantPage Component', () => {
  it('renders AI assistant page hero title, starter prompts, and chat input', () => {
    render(
      <BrowserRouter>
        <AIAssistantPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Student Wellness & Motivation Guide/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Ask for motivation, study tips, or content recommendations/i)).toBeTruthy();
    expect(screen.getByText(/I feel unmotivated to study today. What can I do\?/i)).toBeTruthy();
  });
});
