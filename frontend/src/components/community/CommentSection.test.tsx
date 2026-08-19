import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CommentSection } from './CommentSection';
import { describe, it, expect } from 'vitest';

describe('CommentSection Component', () => {
  it('renders community discussion header and guidelines banner without crashing', () => {
    render(
      <BrowserRouter>
        <CommentSection contentId="test-art-id-1234" contentType="article" />
      </BrowserRouter>
    );

    expect(screen.getByText(/Community Discussion/i)).toBeTruthy();
    expect(screen.getByText(/Community Guidelines:/i)).toBeTruthy();
  });
});
