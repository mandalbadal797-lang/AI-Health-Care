import { render, screen } from '@testing-library/react';
import { ContentFeedback } from './ContentFeedback';
import { describe, it, expect } from 'vitest';

describe('ContentFeedback Component', () => {
  it('renders primary helpful question and Yes/No buttons without crashing', () => {
    render(<ContentFeedback contentId="test-content-1" contentType="article" title="Test Article" />);

    expect(screen.getByText(/Was this content helpful\?/i)).toBeTruthy();
    expect(screen.getByText(/Yes, Helpful/i)).toBeTruthy();
    expect(screen.getByText(/No, Needs Improvement/i)).toBeTruthy();
  });
});
