import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboardPage } from './AdminDashboardPage';
import { describe, it, expect } from 'vitest';

describe('AdminDashboardPage Component', () => {
  it('renders admin dashboard title and quick management portals without throwing', () => {
    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Operational Platform Dashboard/i)).toBeTruthy();
    expect(screen.getByText(/Quick Management Portals/i)).toBeTruthy();
  });
});
