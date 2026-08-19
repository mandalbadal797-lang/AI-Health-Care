import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminAnalyticsPage } from './AdminAnalyticsPage';
import { describe, it, expect } from 'vitest';

describe('AdminAnalyticsPage Component', () => {
  it('renders content analytics title and KPI cards without crashing', () => {
    render(
      <BrowserRouter>
        <AdminAnalyticsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Content Analytics & Intelligent Insights/i)).toBeTruthy();
    expect(screen.getByText(/Total Content Views/i)).toBeTruthy();
    expect(screen.getByText(/Total Library Saves/i)).toBeTruthy();
  });
});
