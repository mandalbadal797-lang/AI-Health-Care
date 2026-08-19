import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminModerationPage } from './AdminModerationPage';
import { describe, it, expect } from 'vitest';

describe('AdminModerationPage Component', () => {
  it('renders moderation title and KPI cards without crashing', () => {
    render(
      <BrowserRouter>
        <AdminModerationPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Content Moderation/i)).toBeTruthy();
    expect(screen.getByText(/Pending Reviews/i)).toBeTruthy();
    expect(screen.getByText(/High Priority/i)).toBeTruthy();
  });
});
