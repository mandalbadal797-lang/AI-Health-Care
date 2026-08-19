import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminFeedbackPage } from './AdminFeedbackPage';
import { describe, it, expect } from 'vitest';

describe('AdminFeedbackPage Component', () => {
  it('renders admin feedback hero title and metric cards without crashing', () => {
    render(
      <BrowserRouter>
        <AdminFeedbackPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Content Feedback & Quality Dashboard/i)).toBeTruthy();
    expect(screen.getByText(/Total Feedback Responses/i)).toBeTruthy();
    expect(screen.getByText(/Overall Helpful Rate/i)).toBeTruthy();
  });
});
